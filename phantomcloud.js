var pjsc = require("phantomjscloud");
var browser = new pjsc.BrowserApi("ak-atvmv-bdnn9-d4ykp-yy42p-c6mp0");
(async function main(){
  try{
    browser.requestSingle(
      { 
        url: "https://staging-api.upstox.com/index/dialog/authorize?apiKey=eYeinZiUIA1KgHzv1Kp3r9ObrZOV9E0fPSY6AVti&redirect_uri=http://tradez.eu-4.evennode.com/h&response_type=code", renderType: "jpeg",
        "scripts": {
                "domReady": [],
                "loadFinished": [
                    "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js",                     
                    "_pjscMeta.manualWait=true;$('#name').val('000000');$('#password').val('DDDDD');$('#password2fa').val('0000');$('body > form > fieldset > div.bottom-box > div > button').click();",
                    "_pjscMeta.manualWait=true;",
                    "setInterval(function(){ if($('#allow').text()!=null){_pjscMeta.manualWait=false;} },200)",
                    ]
        }
      }, (err, userResponse) => {
        if (err != null) {
            throw err;
        }
        console.log(JSON.stringify(userResponse.content));
    });
  }catch(e){
    console.log("puppeteer error:"+e);
  }
})();
