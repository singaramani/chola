(function() {
	module.exports.fetchWriteToken = function(url) {
		const httpc = require('http'), 
		httpsc     = require('https'),
		fs = require('fs');
		let client = httpc;
		if (url.toString().indexOf("https") === 0) {client = httpsc;}
		client.get(url, (resp) => {
			resp.on('data', (chunk) => { data += chunk; });
			resp.on('end', () => {
				fs.writeFile("/data/token.txt", data.trim(), function(err) {
					if(err) {return console.log("WriteFile Err::"+err);}
					logme("WriteFile Done:: "+new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})+" IST");
				});
			});
		}).on("error", (err) => {
			logme(err);
		});
    }
}());
