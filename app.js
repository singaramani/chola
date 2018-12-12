/*Requires*/
//const Upstox = require("upstox");
const http = require("http");
//const scheduler = require('node-schedule');
const fs = require('fs');

/*Requires Local*/
const Appconst = require("./appconstants");
const Wokers = require("./workers");

/*Vars*/
const PORT = process.env.PORT || 8080;
var appconts = Appconst.getAppConstants();

/*Handling HTTP Req*/
try{
	http.createServer(function (request, response) {
		var urlpath = request.url.split("?").shift();
		if (urlpath == '/'+appconts.getCodeCommand) {
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		}else if (urlpath == '/'+appconts.getCodeWrite) {
			getLoginToken();
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "done"}));
		}else {
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "blank"}));
		}
	}).listen(PORT);
	console.log('Running:' + PORT);
}catch(e){
	console.log('httperr:' + e.message);
}

/*Upstox*/
//var upstox = new Upstox(appconts.appKey, appconts.appSecret);
//upstox.setApiVersion(upstox.Constants.VERSIONS.Version_1_5_6);

function getLoginToken(){
	Wokers.fetchWriteToken(appconts.atCodeURL);
}

function getISTTime(){
  var istTimeStr = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
  var tmStr = istTimeStr.split(", ")[1];
  return tmStr;
}
 function logme(msg){
  console.log(getISTTime()+"| "+msg);
}
