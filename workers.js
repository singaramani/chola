(function() {
	const fs = require('fs');
	const Appconst = require("./appconstants");
	var appconst = Appconst.getAppConstants();
	module.exports.fetchWriteToken = function(url) {
		const httpc = require('http'), 
		httpsc     = require('https');
		let client = httpc;
		if (url.toString().indexOf("https") === 0) {client = httpsc;}
		var data="";
		logme("Connecting to token server..");
		client.get(url, (resp) => {
			resp.on('data', (chunk) => { data += chunk; });
			resp.on('end', () => {
				fs.writeFile(appconst.tokenfile, data.trim(), function(err) {
				//fs.writeFile("D:\\token.txt", data.trim(), function(err) {
					if(err) {return console.log("Token->Store.. Err::"+err);}
					logme("Token->Store.. Done");
					var Trdr = require("./traders").initSetToken();
				});
			});
		}).on("error", (err) => {
			logme(err);
		});
    }
	module.exports.wakeupServer = function(url) {
		const httpc = require('http'), 
		httpsc     = require('https');
		let client = httpc;
		if (url.toString().indexOf("https") === 0) {client = httpsc;}
		var data="";
		//console.log(url);
		client.get(url, (resp) => {
			resp.on('data', (chunk) => { data += chunk; });
			resp.on('end', () => {
				logme("Wakeup sent to token server [chera]..");
			});
		}).on("error", (err) => {
			logme(err);
		});
    }
	function readToken() {
		fs.readFile(appconst.tokenfile, "utf8", function(err, data){
		//fs.readFile("D:\\token.txt", "utf8", function(err, data){
			if(err) { return "file read error"; logme("file read error"); }
			return data;
		});
    }
	
	function getISTTime(){
	  var istTimeStr = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
	  var tmStr = istTimeStr.split(", ")[1];
	  return tmStr;
	}
	 function logme(msg){
	  console.log(getISTTime()+"| "+msg);
	}
	
	function getTodayDate() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1;
		var yyyy = today.getFullYear();
		if (dd < 10) {
			dd = '0' + dd;
		}
		if (mm < 10) {
			mm = '0' + mm;
		}
		return (dd + '-' + mm + '-' + yyyy);
	}
	
	module.exports.getTodayDate = getTodayDate;
	module.exports.readToken = readToken;
	module.exports.logme = logme;
}());
