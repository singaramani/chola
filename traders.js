(function() {
	const Upstox = require("upstox");
	
	const Appconst = require("./appconstants");
	const Wokers = require("./workers");
	
	var appconts = Appconst.getAppConstants();
	var upstox = new Upstox(appconts.appKey, appconts.appSecret);
	upstox.setApiVersion(upstox.Constants.VERSIONS.Version_1_5_6);
	
	var n50 = Appconst.getN50();
	var nfo = Appconst.getAllNFO();
	
	var qty = process.env.TQTY;
	var trigger_offset = 0.15;
	var price_offset = 0.10;
	
	function initSetToken(){
		fs.readFile("/data/token.txt", "utf8", function(err, data){
		//fs.readFile("D:\\token.txt", "utf8", function(err, data){
			if(err) { return "file read error"; logme("file read error in traders.js"); }
			var codeData = JSON.parse(data);
			upstox.setToken(codeData.token);
			invokeSocket();
			Wokers.logme("Token set..");
			Wokers.logme("Socket invoked..");
		});

	}
	
	function selectScrips_HL(sList, n, sType) {
		Wokers.Wokers.Wokers.logme("Getting "+sType+" scrips pclose & open");
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
						Wokers.Wokers.Wokers.logme("Err::" + scrip.sym + "::"+ error.message);
						//reject(error);
					});
				});
			_promiseArray.push(_scripPromise);
		});

		Promise.all(_promiseArray).then(function (respArr) {
			Wokers.Wokers.Wokers.logme("Sorting..");
			respArr = respArr.sortBy('diff');
			//Wokers.Wokers.Wokers.logme("all:"+JSON.stringify(respArr));
			Wokers.Wokers.Wokers.logme("Identifying top and bottom " + n + " scrips..");
			var selectedScrips = [];
			selectedScrips.push.apply(selectedScrips, respArr.slice(0, n));
			selectedScrips.push.apply(selectedScrips, respArr.slice(-n));
			//Wokers.Wokers.Wokers.logme("all:"+JSON.stringify(selectedScrips));
			var sList = "";
			selectedScrips.forEach(function (scrip) {
				sList += scrip.sym + ","
			});
			Wokers.Wokers.Wokers.logme("Selected scrips : [" + sList + "]");
			getHighLow(selectedScrips, 15);
		});
	}
	function getHighLow(sList, tf) {
		Wokers.Wokers.logme("Identifying first " + tf + "min HL");
		var _promiseArray = [];
		var ftf = tf / 5;
		sList.forEach(function (scrip) {
			var _scripPromise = new Promise(function (resolve, reject) {
					upstox.getOHLC({
						"exchange": scrip.ex,
						"symbol": scrip.sym,
						"start_date": Wokers.getTodayDate(),
						"end_date": Wokers.getTodayDate(),
						"format": "json",
						"interval": "5MINUTE"
					})
					.then(function (response) {
						//Wokers.Wokers.logme(JSON.stringify(response));
						var ohlc5data = response.data;
						var all_max15 = [];
						var all_min15 = [];
						if (ohlc5data.length >= ftf) {
							for (i = 0; i < ftf; i++) {
								all_max15.push(ohlc5data[i].high);
								all_min15.push(ohlc5data[i].low);
							}
						}
						var max15 = Math.max.apply(null, all_max15);
						var min15 = Math.min.apply(null, all_min15);
						//Wokers.Wokers.logme("max:"+max15);
						//Wokers.Wokers.logme("min:"+min15);
						resolve({
							sym: scrip.sym,
							ex: scrip.ex,
							high: max15,
							low: min15
						});
					})
					.catch(function (error) {
						Wokers.Wokers.logme(JSON.stringify(error));
						reject(error);
					});
				});
			_promiseArray.push(_scripPromise);
		});

		Promise.all(_promiseArray).then(function (respArr) {
			//Wokers.Wokers.logme(JSON.stringify(respArr));
			placeOrderConditional(respArr);
		});
	}
	
	function placeOrderConditional(scripArr) {
	  invokeSocket();
		//var qty = 0;
	  Wokers.logme(" ");
		Wokers.logme("Order plan:");
	  Wokers.logme("--------------------------------------------------");
	  var orderPrepArray = [];
		scripArr.forEach(function (scrip) {
		Wokers.logme(scrip.sym + "|buy above " + scrip.high + "|sell below " + scrip.low + "|qty:" + qty);
		orderPrepArray.push({
		  txnDesc:"Sell", 
		  txnType:"s", 
		  ex:scrip.ex, 
		  sym:scrip.sym,
		  p:scrip.low - trigger_offset,
		  tp:scrip.low - price_offset,
		  q:qty
		});
		orderPrepArray.push({
		  txnDesc:"Buy", 
		  txnType:"b", 
		  ex:scrip.ex, 
		  sym:scrip.sym,
		  p:scrip.high + trigger_offset,
		  tp:scrip.high + price_offset,
		  q:qty
		});
		});
	  Wokers.logme("--------------------------------------------------");
	  placeOrdr(orderPrepArray);
	}

	function placeOrdr(orderPrepArray) {
	  Wokers.logme(" ");
	  Wokers.logme("Placing orders..");
	  orderPrepArray.forEach(function (ordr) {
		// Wokers.logme(JSON.stringify({
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
			Wokers.logme(response.data.order_id + "|" + sym + "|" + response.data.status);
		})
		.catch(function (error) {
			//done(error);
			Wokers.logme(JSON.stringify(error));
		  //Wokers.logme(ordr.sym+"|"+error.message+"|"+error.error.reason)
		});
	  });
	}

	function invokeSocket(){
	  upstox.connectSocket()
	  .then(function() {
		Wokers.logme("Socket connected.");
		upstox.on("orderUpdate", function(message) {
		  if(message.status=="trigger pending"){
			Wokers.logme(message.order_id+" - Trgr. pending : "+message.symbol+" "+message.quantity+"@"+message.trigger_price);
		  }
		  if(message.status=="complete"){
			Wokers.logme(message.order_id+" - Completed : "+message.symbol+" "+message.traded_quantity+"@"+message.average_price);
		  }		
		  if(message.status=="cancelled"){
			Wokers.logme(message.order_id+" - Cancelled : "+message.symbol+" "+message.traded_quantity+"@"+message.average_price);
		  }	    
		});
		upstox.on("positionUpdate", function(message) {
		  Wokers.logme("Position Updated. "+JSON.stringify(message));
		});
		upstox.on("tradeUpdate", function(message) {
		  Wokers.logme("Trade Updated. " + JSON.stringify(message));
		});
		upstox.on("liveFeed", function(message) {
		  //Wokers.logme("Live Feed. - " + JSON.stringify(message));
		});
		upstox.on("disconnected", function(message) {
		  Wokers.logme("Socket disconnected.");
		});
		upstox.on("error", function(error) {
		  Wokers.logme("Socket on_error:" + JSON.stringify(error));
		});
	  }).catch(function(err) {
		Wokers.logme("Socket error:" + JSON.stringify(err));
	  });
	}
	
	Array.prototype.sortBy = function (p) {
		return this.slice(0).sort(function (a, b) {
			return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
		});
	}
	
	initSetToken();
	module.exports.initSetToken = initSetToken;
	module.exports.strategyORB = function(){
		selectScrips_HL(n50,3,"N50");
		//selectScrips_HL(nfo,3, "ALL_FNO");
	}
}());
