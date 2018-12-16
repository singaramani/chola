(function () {
	const Upstox = require("upstox");
	const fs = require('fs');
	const Appconst = require("./appconstants");
	const Worker = require("./workers");

	var appconst = Appconst.getAppConstants();
	var upstox = new Upstox(appconst.appKey, appconst.appSecret);
	upstox.setApiVersion(upstox.Constants.VERSIONS.Version_1_5_6);

	var n50 = Appconst.getN50();
	var nfo = Appconst.getAllNFO();

	var qty = process.env.TQTY;
	var trigger_offset = 0.15;
	var price_offset = 0.10;

	function initSetToken() {
		fs.readFile("/data/token.txt", "utf8", function (err, data) {
			//fs.readFile("D:\\token.txt", "utf8", function(err, data){
			if (err) {
				return "file read error";
				logme("file read error in traders.js");
			}
			if (isJsonString(data)) {
				var codeData = JSON.parse(data);
				upstox.setToken(codeData.token);
				invokeSocket();
				Worker.logme("Token set.. --" + codeData.token);
				Worker.logme("Socket invoked..");
			} else {
				Worker.logme("token file parse error");
			}
		});

	}

	function selectScrips_HL(sList, n, sType) {
		Worker.logme("Getting " + sType + " scrips pclose & open");
		var _promiseArray = [];
		sList.forEach(function (scrip) {
			var _scripPromise = new Promise(function (resolve, reject) {
					upstox.getLiveFeed({
						"exchange": scrip.ex,
						"symbol": scrip.sym,
						"type": "full"
					})
					.then(function (response) {
						var pdiff = (((response.data.open - response.data.close) / response.data.close) * 100).toFixed(2);
						resolve({
							ex: scrip.ex,
							sym: scrip.sym,
							//pclose:response.data.close,
							//topen:response.data.ltp,
							diff: Number(pdiff)
						});
					})
					.catch(function (error) {
						Worker.logme("Err::" + scrip.sym + "::" + error.message);
						//reject(error);
					});
				});
			_promiseArray.push(_scripPromise);
		});

		Promise.all(_promiseArray).then(function (respArr) {
			Worker.logme("Sorting..");
			respArr = respArr.sortBy('diff');
			//Worker.logme("all:"+JSON.stringify(respArr));
			Worker.logme("Identifying top and bottom " + n + " scrips..");
			var selectedScrips = [];
			selectedScrips.push.apply(selectedScrips, respArr.slice(0, n));
			selectedScrips.push.apply(selectedScrips, respArr.slice(-n));
			//Worker.logme("all:"+JSON.stringify(selectedScrips));
			var sList = "";
			selectedScrips.forEach(function (scrip) {
				sList += scrip.sym + ","
			});
			Worker.logme("Selected scrips : [" + sList + "]");
			getHighLow(selectedScrips, 15);
		});
	}
	function getHighLow(sList, tf) {
		Worker.logme("Identifying first " + tf + "min HL");
		var _promiseArray = [];
		var ftf = (tf / 5) + 1;
		sList.forEach(function (scrip) {
			var _scripPromise = new Promise(function (resolve, reject) {
					upstox.getOHLC({
						"exchange": scrip.ex,
						"symbol": scrip.sym,
						"start_date": Worker.getTodayDate(),
						"end_date": Worker.getTodayDate(),
						"format": "json",
						"interval": "5MINUTE"
					})
					.then(function (response) {
						//Worker.logme(JSON.stringify(response));
						var ohlc5data = response.data;
						var all_max15 = [];
						var all_min15 = [];
						if (ohlc5data.length >= ftf) {
							for (i = 1; i < ftf; i++) {
								all_max15.push(ohlc5data[i].high);
								all_min15.push(ohlc5data[i].low);
							}
						}
						var max15 = Math.max.apply(null, all_max15);
						var min15 = Math.min.apply(null, all_min15);
						//Worker.logme("max:"+max15);
						//Worker.logme("min:"+min15);
						resolve({
							sym: scrip.sym,
							ex: scrip.ex,
							high: max15,
							low: min15
						});
					})
					.catch(function (error) {
						Worker.logme(JSON.stringify(error));
						reject(error);
					});
				});
			_promiseArray.push(_scripPromise);
		});

		Promise.all(_promiseArray).then(function (respArr) {
			//Worker.logme(JSON.stringify(respArr));
			placeOrderConditional(respArr);
		});
	}

	function placeOrderConditional(scripArr) {
		invokeSocket();
		//var qty = 0;
		Worker.logme(" ");
		Worker.logme("Order plan:");
		Worker.logme("--------------------------------------------------");
		var orderPrepArray = [];
		scripArr.forEach(function (scrip) {
			Worker.logme(scrip.sym + "|buy above " + scrip.high + "|sell below " + scrip.low + "|qty:" + qty);
			orderPrepArray.push({
				txnDesc: "Sell",
				txnType: "s",
				ex: scrip.ex,
				sym: scrip.sym,
				p: scrip.low - trigger_offset,
				tp: scrip.low - price_offset,
				q: qty
			});
			orderPrepArray.push({
				txnDesc: "Buy",
				txnType: "b",
				ex: scrip.ex,
				sym: scrip.sym,
				p: scrip.high + trigger_offset,
				tp: scrip.high + price_offset,
				q: qty
			});
		});
		Worker.logme("--------------------------------------------------");
		placeOrdr(orderPrepArray);
	}

	function placeOrdr(orderPrepArray) {
		Worker.logme(" ");
		Worker.logme("Placing orders..");
		orderPrepArray.forEach(function (ordr) {
			// Worker.logme(JSON.stringify({
			//   "transaction_type":ordr.txnType,
			//   "exchange":ordr.ex,
			//   "symbol": ordr.sym,
			//   "quantity": ordr.q,
			//   "order_type":"sl",
			//   "product": "I",
			//   "price":ordr.p.toFixed(2),
			//   "trigger_price":ordr.tp.toFixed(2)
			// }));
			upstox.placeOrder({
				"transaction_type": ordr.txnType,
				"exchange": ordr.ex,
				"symbol": ordr.sym,
				"quantity": ordr.q,
				"order_type": "sl",
				"product": "I",
				"price": ordr.p.toFixed(2),
				"trigger_price": ordr.tp.toFixed(2)
			})
			.then(function (response) {
				Worker.logme(response.data.order_id + "|" + sym + "|" + response.data.status);
			})
			.catch(function (error) {
				//done(error);
				//Worker.logme("PlaceOrder::"+JSON.stringify(error));
				try {Worker.logme(ordr.sym+"|"+error.message+"|"+error.error.reason)}catch(e){}
			});
		});
	}

	function invokeSocket() {
		upstox.connectSocket()
		.then(function () {
			Worker.logme("Socket connected.");
			upstox.on("orderUpdate", function (message) {
				if (message.status == "open") {
					Worker.logme(message.order_id + " - Open : " + message.symbol + " " + message.quantity + " @ " + message.trigger_price);
				}				
				if (message.status == "trigger pending") {
					Worker.logme(message.order_id + " - Trgr. pending : " + message.symbol + " " + message.quantity + " @ " + message.trigger_price);
				}
				if (message.status == "complete") {
					Worker.logme(message.order_id + " - Completed : " + message.symbol + " " + message.traded_quantity + " @ " + message.average_price);
					placeTargerOrder(message);
				}
				if (message.status == "cancelled") {
					Worker.logme(message.order_id + " - Cancelled : " + message.symbol + " " + message.traded_quantity + " @ " + message.average_price);
				}
				if (message.status == "rejected") {
					Worker.logme(message.order_id + " - Rejected : " + message.symbol + " " + message.traded_quantity + " @ " + message.average_price);
				}				
			});
			upstox.on("positionUpdate", function (message) {
				Worker.logme("Position Updated. " + JSON.stringify(message));
			});
			upstox.on("tradeUpdate", function (message) {
				//Worker.logme("Trade Updated. " + JSON.stringify(message));
			});
			upstox.on("liveFeed", function (message) {
				//Worker.logme("Live Feed. - " + JSON.stringify(message));
			});
			upstox.on("disconnected", function (message) {
				Worker.logme("Socket disconnected.");
			});
			upstox.on("error", function (error) {
				Worker.logme("Socket on_error:" + JSON.stringify(error));
			});
		}).catch(function (err) {
			//Worker.logme("Socket error:" + JSON.stringify(err));
		});
	}

	Array.prototype.sortBy = function (p) {
		return this.slice(0).sort(function (a, b) {
			return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
		});
	}
	function isJsonString(str) {
		try {
			var json = JSON.parse(str);
			return (typeof json === 'object');
		} catch (e) {
			return false;
		}
	}

	function placeTargerOrder(pos) {
		var txtTyp = (pos.transaction_type == "B" || pos.transaction_type == "b") ? "s" : "b";
		var calc_tp = (txtTyp == "b") ? 1-(appconst.targetpcent/100) : 1+(appconst.targetpcent/100);
		var tp = (Math.round((pos.average_price) * calc_tp * 20) / 20);
		Worker.logme("Placing target order for " + pos.symbol + " " + txtTyp + " " + pos.traded_quantity + " @ " + tp + " ["+appconst.targetpcent+"%]");
		upstox.placeOrder({
			"transaction_type": txtTyp,
			"exchange": pos.exchange,
			"symbol": pos.symbol,
			"quantity": pos.traded_quantity,
			"order_type": "l",
			"product": "I",
			"price": tp
		})
		.then(function (response) {
			Worker.logme("" + response.data.order_id + "|" + pos.symbol + "|" + response.data.status);
		})
		.catch(function (error) {
			//done(error);
			Worker.logme("Placing target order error. "+JSON.stringify(error));
		});
	}

	function cancellAllOrders() {
		upstox.cancelAllOrder({})
		.then(function (response) {
			Worker.logme(response.message);
			Worker.logme("Orders:" + response.data);
		}).catch(function (error) {
			//done(error);
			Worker.logme("Error cancelling all orders at once. "+JSON.stringify(error));
		});
	}

	function getCurrentPos() {
		upstox.getPositions()
		.then(function (response) {
			var tPos = response.data;
			var mtm = 0;
			Worker.logme("--------------------------------------------");
			tPos.forEach(function (pos) {
				var pnl = 0;
				if (pos.realized_profit && !isNaN(pos.realized_profit)) {
					pnl = pnl + Number(pos.realized_profit);
				}
				if (pos.unrealized_profit && !isNaN(pos.unrealized_profit)) {
					pnl = pnl + Number(pos.unrealized_profit);
				}
				Worker.logme(pos.symbol + " | " + pos.net_quantity + " | " + pnl);
				mtm = mtm + pnl;
			});
			Worker.logme("--------------------------------------------");
			Worker.logme("MTM: " + mtm);
			Worker.logme("--------------------------------------------");
		}).catch(function (error) {
			//done(error);
			Worker.logme("Error getting positions. "+JSON.stringify(error));
		});
	}

	function exitAllPos() {
		upstox.getPositions()
		.then(function (response) {
			var tPos = response.data;
			//Worker.logme("Exiting all open positions..");
			tPos.forEach(function (pos) {
				if (pos.net_quantity != 0) {
					Worker.logme(pos.symbol +" is open with " + pos.net_quantity +" qty. Exiting at market price.");
					upstox.placeOrder({
						"transaction_type": (pos.net_quantity > 0) ? "s" : "b",
						"exchange": pos.exchange,
						"symbol": pos.symbol,
						"quantity": Math.abs(pos.net_quantity),
						"order_type": "m",
						"product": "I"
					})
					.then(function (response) {
						Worker.logme(response.data.order_id + "|" + pos.symbol + "|" + response.data.status);
					})
					.catch(function (error) {
						//done(error);
						Worker.logme("Placing exit order error. "+JSON.stringify(error));
					});
				}
			});
		}).catch(function (error) {
			//done(error);
			Worker.logme("Error getting positions for exiting. "+JSON.stringify(error));
		});
	}

	function diconnectSock() {
		upstox.closeSocket();
		console.log("\n\nDone.\n\n---------------------------------------------------------------");
	}

	initSetToken();
	module.exports.initSetToken = initSetToken;
	module.exports.getCurrentPos = getCurrentPos;
	module.exports.cancellAllOrders = cancellAllOrders;
	module.exports.exitAllPos = exitAllPos;
	module.exports.diconnectSock = diconnectSock;
	module.exports.strategyORB = function () {
		if(appconst.stockpicks == "N50") selectScrips_HL(n50, appconst.nscrips, appconst.stockpicks);
		if(appconst.stockpicks == "NFO") selectScrips_HL(nfo, appconst.nscrips, appconst.stockpicks);
	}	
}());
