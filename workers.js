(function() {
	fs = require('fs');
	module.exports.fetchWriteToken = function(url) {
		const httpc = require('http'), 
		httpsc     = require('https');
		let client = httpc;
		if (url.toString().indexOf("https") === 0) {client = httpsc;}
		var data="";
		logme("Connecting..");
		client.get(url, (resp) => {
			resp.on('data', (chunk) => { data += chunk; });
			resp.on('end', () => {
				fs.writeFile("/data/token.txt", data.trim(), function(err) {
				//fs.writeFile("D:\\token.txt", data.trim(), function(err) {
					if(err) {return console.log("Token->Store.. Err::"+err);}
					logme("Token->Store.. Done");
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
		console.log(url);
		client.get(url, (resp) => {
			resp.on('data', (chunk) => { data += chunk; });
			resp.on('end', () => {
				logme("Wakeup sent..");
			});
		}).on("error", (err) => {
			logme(err);
		});
    }
	function readToken() {
		fs.readFile("/data/token.txt", "utf8", function(err, data){
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
	
	module.exports.readToken = readToken;
	module.exports.logme = logme;
}());
