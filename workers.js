(function() {
	module.exports.fetchWriteToken = function(url) {
		const httpc = require('http'), 
		httpsc     = require('https'),
		fs = require('fs');
		let client = httpc;
		if (url.toString().indexOf("https") === 0) {client = httpsc;}
		var data="";
		console.log(url);
		client.get(url, (resp) => {
			resp.on('data', (chunk) => { data += chunk; });
			resp.on('end', () => {
				fs.writeFile("/data/token.txt", data.trim(), function(err) {
				//fs.writeFile("D:\\token.txt", data.trim(), function(err) {
					if(err) {return console.log("WriteFile Err::"+err);}
					logme("WriteFile Done:: "+new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})+" IST");
				});
			});
		}).on("error", (err) => {
			logme(err);
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
}());
