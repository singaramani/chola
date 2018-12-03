
const puppeteer = require("puppeteer");
(async function main(){
  try{
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.goto("https://staging-api.upstox.com/index/dialog/authorize?apiKey=eYeinZiUIA1KgHzv1Kp3r9ObrZOV9E0fPSY6AVti&redirect_uri=http://tradez.eu-4.evennode.com/h&response_type=code");
    await page.waitForSelector(".bottom-box");
    console.log("its showing")
  }catch(e){
    console.log("puppeteer error:"+e);
  }
})();
