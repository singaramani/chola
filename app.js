/*Requires*/
const http = require("http");
const scheduler = require('node-schedule');
const fs = require('fs');

/*Requires Local*/
const Appconst = require("./appconstants");
const Worker = require("./workers");
const Trader = require("./traders");

/*Vars*/
const PORT = process.env.PORT || 8080;
var appconts = Appconst.getAppConstants();

/*Handling HTTP Req*/
try {
	http.createServer(function (request, response) {
		var urlpath = request.url.split("?").shift();
		if (urlpath == '/' + appconts.getCodeCommand) {
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/' + appconts.getCodeWrite) {
			getLoginToken();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/' + appconts.readRawCode) {
			fs.readFile("/data/token.txt", "utf8", function (err, data) {
				//fs.readFile("D:\\token.txt", "utf8", function(err, data){
				if (err) {
					return "file read error";
					logme("file read error");
				}
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.end(data);
				Worker.logme("Web read code invoked.")
			});
		} else if (urlpath == '/wakejob') {
			wakeupJOB();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/tokenjob') {
			tokenJOB();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/tradejob') {
			tradeJOB();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/rsall') {
			rescheduleAllJobs();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/posjob') {
			positionJOB();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/canalljob') {
			cancelAllOrdersJOB();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/exitposjob') {
			exitPosJOB();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else if (urlpath == '/disconsockjob') {
			disconSockJOB();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		} else {
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "blank"}));
		}
	}).listen(PORT);
	console.log('Running:' + PORT);
} catch (e) {
	console.log('httperr:' + e.message);
}

function getLoginToken() {
	Worker.fetchWriteToken(appconts.atCodeURL);
}

console.log("------------------------------------------------------------------------");

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

console.log("Today " + new Date().toLocaleString("en-US", {
		timeZone: "Asia/Kolkata"
	}) + " IST");

function wakeupJOB() {
	console.log("\n\n---------------------------------------------------------------");
	Worker.logme("Today " + new Date().toLocaleString("en-US", {
			timeZone: "Asia/Kolkata"
		}) + " IST");
	Worker.logme("wakeupJOB Started");
	Worker.wakeupServer(appconts.wakeupURL);
}

function tokenJOB() {
	console.log("\n\n---------------------------------------------------------------");
	Worker.logme("Today " + new Date().toLocaleString("en-US", {
			timeZone: "Asia/Kolkata"
		}) + " IST");
	Worker.logme("tokenJOB Started");
	getLoginToken();
}

function tradeJOB() {
	console.log("\n\n---------------------------------------------------------------");
	Worker.logme("Today " + new Date().toLocaleString("en-US", {
			timeZone: "Asia/Kolkata"
		}) + " IST");
	Worker.logme("tradeJOB Started");
	Trader.initSetToken();
	Trader.strategyORB();
}

function positionJOB() {
	Worker.logme(" ");
	Worker.logme("Getting positions..");
	Trader.getCurrentPos();
}

function cancelAllOrdersJOB() {
	Worker.logme(" ");
	Worker.logme("Cancelling all open orders..");
	Trader.cancellAllOrders();
}

function exitPosJOB() {
	Worker.logme(" ");
	Worker.logme("Exiting all open positions..");
	Trader.exitAllPos();
}

function disconSockJOB() {
	Worker.logme(" ");
	Worker.logme("Disconnecting socket..");
	Trader.diconnectSock();
}

function scheduleTokenServerWakeup() {
	console.log("Scheduling wakeupJOB..");
	scheduler.scheduleJob(appconts.wakeup_schedule, function (fireDate) {
		wakeupJOB();
	});
}

function scheduleTokenJOB() {
	console.log("Scheduling tokenJOB.. ");
	scheduler.scheduleJob(appconts.token_schedule, function (fireDate) {
		tokenJOB();
	});
}

function scheduleTradeJOB() {
	console.log("Scheduling tradeJOB.. ");
	scheduler.scheduleJob(appconts.trade_schedule, function (fireDate) {
		tradeJOB();
	});
}

function schedulePositionJOB() {
	console.log("Scheduling positionJOB.. ");
	scheduler.scheduleJob(appconts.getpos_schedule, function (fireDate) {
		positionJOB();
	});
}

function scheduleCancelAppOpenJOB() {
	console.log("Scheduling cancelAllOpenJOB.. ");
	scheduler.scheduleJob(appconts.cancelall_schedule, function (fireDate) {
		cancelAllOrdersJOB();
	});
}

function scheduleExitPosJOB() {
	console.log("Scheduling exitPosJOB.. ");
	scheduler.scheduleJob(appconts.exitpos_schedule, function (fireDate) {
		exitPosJOB();
	});
}

function scheduleDisconnectSockJOB() {
	console.log("Scheduling disconSockJOB.. ");
	scheduler.scheduleJob(appconts.socket_schedule, function (fireDate) {
		disconSockJOB();
	});
}

function rescheduleAllJobs() {
	scheduleTokenServerWakeup();
	scheduleTokenJOB();
	scheduleTradeJOB();
	schedulePositionJOB();
	scheduleCancelAppOpenJOB();
	scheduleExitPosJOB();
	scheduleDisconnectSockJOB();
}rescheduleAllJobs();
