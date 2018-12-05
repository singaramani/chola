const puppeteer = require("puppeteer");
(async function main(){
  try{
	const browser=await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://staging-api.upstox.com/index/dialog/authorize?apiKey=eYeinZiUIA1KgHzv1Kp3r9ObrZOV9E0fPSY6AVti&redirect_uri=http://tradez.eu-4.evennode.com/h&response_type=code");
	await page.waitForSelector(".bottom-box");
	await page.type('#name', '******');
	await page.type('#password', '******');
	await page.type('#password2fa',"****");
	//await page.screenshot({path: 'login.png'});
	await page.click("body > form > fieldset > div.bottom-box > div > button");
	await page.waitForSelector('#allow');
	//await page.screenshot({path: '2fa.png'});
	await page.click('#allow');
	await page.waitForNavigation();
	const rdrurl = await page.url();
	//var q = url.parse(rdrurl, true);
	//var qdata = q.query;
	//console.log(qdata.at);
	console.log(rdrurl.split("=")[1]);
	await browser.close();
  }catch(e){
    console.log("puppeteer error:"+e);
  }
})();
