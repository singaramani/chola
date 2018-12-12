/*Requires*/
const Upstox = require("upstox");
const http = require("http");
const scheduler = require('node-schedule');
const fs = require('fs');

/*Requires Local*/
const Appconst = require("./appconstants");
const Wokers = require("./workers");

/*Vars*/
const PORT = process.env.PORT || 5000;
var appconts = Appconst.getAppConstants();

/*Handling HTTP Req*/
try{
	http.createServer(function (request, response) {
		var urlpath = request.url.split("?").shift();
		if (urlpath == '/'+appconts.getCodeCommand) {
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({"command": "thanks"}));
		}else if (urlpath == '/'+appconts.getCodeWrite) {
			
		}
	}).listen(PORT);
	console.log('Running:' + PORT);
}catch(e){
	console.log('httperr:' + e.message);
}

/*Upstox*/
var upstox = new Upstox(appconts.appKey, appconts.appSecret);
upstox.setApiVersion(upstox.Constants.VERSIONS.Version_1_5_6);

function getLoginToken(){
	Wokers.fetchWriteToken();
}
