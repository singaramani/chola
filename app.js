var Upstox = require("upstox");
var schedule = require('node-schedule');

var appKey = "eYeinZiUIA1KgHzv1Kp3r9ObrZOV9E0fPSY6AVti";
var appSecret = "ttni75yei6";
var baseURL = "http://tradez.eu-4.evennode.com";
var redirectURL = baseURL+"/h";


var upstox = new Upstox(appKey,appSecret);
upstox.setToken("fbeeff2c37371f81f2f09204f3fabecd4a9a7f11");
upstox.setApiVersion(upstox.Constants.VERSIONS.Version_1_5_6);

var n50 = [{ex:"nse_eq",sym:"ADANIPORTS"},
{ex:"nse_eq",sym:"ASIANPAINT"},
{ex:"nse_eq",sym:"AXISBANK"},
//{ex:"nse_eq",sym:"BAJAJ-AUTO"},
//{ex:"nse_eq",sym:"BAJFINANCE"},
//{ex:"nse_eq",sym:"BAJAJFINSV"},
{ex:"nse_eq",sym:"BPCL"},
{ex:"nse_eq",sym:"BHARTIARTL"},
{ex:"nse_eq",sym:"INFRATEL"},
{ex:"nse_eq",sym:"CIPLA"},
{ex:"nse_eq",sym:"COALINDIA"},
//{ex:"nse_eq",sym:"DRREDDY"},
//{ex:"nse_eq",sym:"EICHERMOT"},
{ex:"nse_eq",sym:"GAIL"},
{ex:"nse_eq",sym:"GRASIM"},
{ex:"nse_eq",sym:"HCLTECH"},
//{ex:"nse_eq",sym:"HDFCBANK"},
//{ex:"nse_eq",sym:"HEROMOTOCO"},
{ex:"nse_eq",sym:"HINDALCO"},
{ex:"nse_eq",sym:"HINDPETRO"},
//{ex:"nse_eq",sym:"HINDUNILVR"},
//{ex:"nse_eq",sym:"HDFC"},
{ex:"nse_eq",sym:"ITC"},
{ex:"nse_eq",sym:"ICICIBANK"},
{ex:"nse_eq",sym:"IBULHSGFIN"},
{ex:"nse_eq",sym:"IOC"},
{ex:"nse_eq",sym:"INDUSINDBK"},
{ex:"nse_eq",sym:"INFY"},
{ex:"nse_eq",sym:"JSWSTEEL"},
//{ex:"nse_eq",sym:"KOTAKBANK"},
//{ex:"nse_eq",sym:"LT"},
{ex:"nse_eq",sym:"M&M"},
//{ex:"nse_eq",sym:"MARUTI"},
{ex:"nse_eq",sym:"NTPC"},
{ex:"nse_eq",sym:"ONGC"},
{ex:"nse_eq",sym:"POWERGRID"},
{ex:"nse_eq",sym:"RELIANCE"},
{ex:"nse_eq",sym:"SBIN"},
{ex:"nse_eq",sym:"SUNPHARMA"},
//{ex:"nse_eq",sym:"TCS"},
{ex:"nse_eq",sym:"TATAMOTORS"},
{ex:"nse_eq",sym:"TATASTEEL"},
{ex:"nse_eq",sym:"TECHM"},
{ex:"nse_eq",sym:"TITAN"},
{ex:"nse_eq",sym:"UPL"},
//{ex:"nse_eq",sym:"ULTRACEMCO"},
{ex:"nse_eq",sym:"VEDL"},
{ex:"nse_eq",sym:"WIPRO"},
{ex:"nse_eq",sym:"YESBANK"},
{ex:"nse_eq",sym:"ZEEL"}];

function  selectScrips_HL(sList,n){
  console.log("Getting all scrips pclose & open");
  var _promiseArray = [];
  sList.forEach(function(scrip){
    var _scripPromise = new Promise(function(resolve,reject){
        upstox.getLiveFeed({"exchange": scrip.ex,"symbol": scrip.sym, "type":"full"})
        .then(function (response) { 
            var pdiff = (((response.data.open - response.data.close)/response.data.close)*100).toFixed(2);
            resolve({
              ex:scrip.ex,
              sym:scrip.sym,
              //pclose:response.data.close,
              //topen:response.data.ltp,
              diff:Number(pdiff)
              });
        })
        .catch(function(error){
			console.log("Err::"+scrip.sym+"::"+JSON.stringify(error));
            reject(error);
        });
    });
    _promiseArray.push(_scripPromise);
  });

  Promise.all(_promiseArray).then(function(respArr){
    console.log("Sorting..");
    respArr = respArr.sortBy('diff');
    //console.log("all:"+JSON.stringify(respArr));
    console.log("Identifying top and bottom "+n+" scrips..");
    var selectedScrips = [];
    selectedScrips.push.apply(selectedScrips,respArr.slice(0,n));
    selectedScrips.push.apply(selectedScrips,respArr.slice(-n));
    //console.log("all:"+JSON.stringify(selectedScrips));
    var sList = "";
    selectedScrips.forEach(function(scrip){sList+=scrip.sym+"," });
    console.log("Selected scrips : ["+sList+"]");
    getHighLow(selectedScrips,15);
  });
}

function getHighLow(sList,tf){
  console.log("Identifying first "+tf+"min HL");
  var _promiseArray = [];
  var ftf=tf/5;
  sList.forEach(function(scrip){
    var _scripPromise = new Promise(function(resolve,reject){
      upstox.getOHLC({
        "exchange": scrip.ex,
        "symbol": scrip.sym,
        "start_date": getTodayDate(),
        "end_date": getTodayDate(),
        "format" : "json",
        "interval" : "5MINUTE"
      })
      .then(function (response) {
        //console.log(JSON.stringify(response));
        var ohlc5data = response.data;
        var all_max15 = [];
        var all_min15 = [];
        if(ohlc5data.length>=ftf){
          for(i=0;i<ftf;i++){
            all_max15.push(ohlc5data[i].high); 
            all_min15.push(ohlc5data[i].low);
          }
        }
        var max15 = Math.max.apply(null, all_max15);
        var min15 = Math.min.apply(null, all_min15);
        //console.log("max:"+max15);
        //console.log("min:"+min15);
        resolve({sym:scrip.sym,ex:scrip.ex,high:max15,low:min15});
      })
      .catch(function(error){
          console.log(JSON.stringify(error));
          reject(error);
      });
    });
    _promiseArray.push(_scripPromise);
  });

  Promise.all(_promiseArray).then(function(respArr){
    //console.log(JSON.stringify(respArr));
    placeOrderConditional(respArr);
  });
}

function getTodayDate(){
  var today = new Date();
  var dd = today.getDate(); var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  } 
  if (mm < 10) {
    mm = '0' + mm;
  } 
  return (dd + '-' + mm + '-' + yyyy);
}

Array.prototype.sortBy = function(p) {
  return this.slice(0).sort(function(a,b) {
    return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
  });
}

function placeOrderConditional(scripArr){
  //var qty = 0;
  console.log("Placing order..");
  scripArr.forEach(function(scrip){
    console.log(scrip.sym+"|buy above "+scrip.high+"|sell below "+scrip.low+"|qty:"+qty);
  });  
  scripArr.forEach(function(scrip){
    placeOrdr("Sell","s",scrip.ex,scrip.sym,2,scrip.low-0.15,scrip.low-0.10,qty);
    placeOrdr("Buy ","b",scrip.ex,scrip.sym,2,scrip.high+0.15,scrip.high+0.10,qty);
  });
}

function placeOrdr(txnDesc,txnType,ex,sym,qty,p,tp,qty){
    // console.log({
    //   "transaction_type":txnType,
    //   "exchange":ex,
    //   "symbol": sym,
    //   "quantity": qty,
    //   "order_type":"sl",
    //   "product": "I",
    //   "price":p.toFixed(2),
    //   "trigger_price":tp.toFixed(2)
    // });
      upstox.placeOrder({
      "transaction_type":txnType,
      "exchange":ex,
      "symbol": sym,
      "quantity": qty,
      "order_type":"sl",
      "product": "I",
      "price":p.toFixed(2),
      "trigger_price":tp.toFixed(2)
    })
    .then(function (response) {
      //console.log("all:"+JSON.stringify(response));
      console.log(response.data.order_id+"|"+sym+"|"+response.data.status);
    })
    .catch(function(error){
      done(error);
    });
}

var qty = 1;

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)


console.log("Today:"+new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
var tSchedule = schedule.scheduleJob('46 3 * * 1-5', function(fireDate){
  //console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  console.log("Executing scheduled job :: JOB1 at "+fireDate);
  //console.log("JOB1 started at "+fireDate);
  selectScrips_HL(n50,3);
});

//console.log("Today:"+new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

//selectScrips_HL(n50,3);
