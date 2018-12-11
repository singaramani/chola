var Upstox = require("upstox");
var schedule = require('node-schedule');
const fs = require('fs');

var appKey = process.env.APPKEY;
var appSecret = process.env.APPSECRET;
var baseURL = "http://tradez.eu-4.evennode.com";
var redirectURL = process.env.RDRURL;
var atCodeURL = process.env.ATCODEURL;

var upstox = new Upstox(appKey, appSecret);
upstox.setApiVersion(upstox.Constants.VERSIONS.Version_1_5_6);
var isTokenSet=false;
var n50 = [
	{ex: "nse_eq",sym: "ADANIPORTS"},
	{ex: "nse_eq",sym: "ASIANPAINT"},
	{ex: "nse_eq",sym: "AXISBANK"},
	//{ex:"nse_eq",sym:"BAJAJ-AUTO"},
	//{ex:"nse_eq",sym:"BAJFINANCE"},
	//{ex:"nse_eq",sym:"BAJAJFINSV"},
	{ex: "nse_eq",sym: "BPCL"},
	{ex: "nse_eq",sym: "BHARTIARTL"},
	{ex: "nse_eq",sym: "INFRATEL"},
	{ex: "nse_eq",sym: "CIPLA"},
	{ex: "nse_eq",sym: "COALINDIA"},
	{ex:"nse_eq",sym:"DRREDDY"},
	//{ex:"nse_eq",sym:"EICHERMOT"},
	{ex: "nse_eq",sym: "GAIL"},
	{ex: "nse_eq",sym: "GRASIM"},
	{ex: "nse_eq",sym: "HCLTECH"},
	//{ex:"nse_eq",sym:"HDFCBANK"},
	//{ex:"nse_eq",sym:"HEROMOTOCO"},
	{ex: "nse_eq",sym: "HINDALCO"},
	{ex: "nse_eq",sym: "HINDPETRO"},
	//{ex:"nse_eq",sym:"HINDUNILVR"},
	//{ex:"nse_eq",sym:"HDFC"},
	{ex: "nse_eq",sym: "ITC"},
	{ex: "nse_eq",sym: "ICICIBANK"},
	{ex: "nse_eq",sym: "IBULHSGFIN"},
	{ex: "nse_eq",sym: "IOC"},
	{ex: "nse_eq",sym: "INDUSINDBK"},
	{ex: "nse_eq",sym: "INFY"},
	{ex: "nse_eq",sym: "JSWSTEEL"},
	//{ex:"nse_eq",sym:"KOTAKBANK"},
	{ex:"nse_eq",sym:"LT"},
	{ex: "nse_eq",sym: "M&M"},
	//{ex:"nse_eq",sym:"MARUTI"},
	{ex: "nse_eq",sym: "NTPC"},
	{ex: "nse_eq",sym: "ONGC"},
	{ex: "nse_eq",sym: "POWERGRID"},
	{ex: "nse_eq",sym: "RELIANCE"},
	{ex: "nse_eq",sym: "SBIN"},
	{ex: "nse_eq",sym: "SUNPHARMA"},
	//{ex:"nse_eq",sym:"TCS"},
	{ex: "nse_eq",sym: "TATAMOTORS"},
	{ex: "nse_eq",sym: "TATASTEEL"},
	{ex: "nse_eq",sym: "TECHM"},
	{ex: "nse_eq",sym: "TITAN"},
	{ex: "nse_eq",sym: "UPL"},
	//{ex:"nse_eq",sym:"ULTRACEMCO"},
	{ex: "nse_eq",sym: "VEDL"},
	{ex: "nse_eq",sym: "WIPRO"},
	{ex: "nse_eq",sym: "YESBANK"},
	{ex: "nse_eq",sym: "ZEEL"}
];

var nfostocks=[
	{ex:"nse_eq",sym:"ACC"},
	{ex:"nse_eq",sym:"ADANIENT"},
	{ex:"nse_eq",sym:"ADANIPORTS"},
	{ex:"nse_eq",sym:"ADANIPOWER"},
	{ex:"nse_eq",sym:"AJANTPHARM"},
	{ex:"nse_eq",sym:"ALBK"},
	{ex:"nse_eq",sym:"AMARAJABAT"},
	{ex:"nse_eq",sym:"AMBUJACEM"},
	{ex:"nse_eq",sym:"APOLLOHOSP"},
	{ex:"nse_eq",sym:"APOLLOTYRE"},
	{ex:"nse_eq",sym:"ARVIND"},
	{ex:"nse_eq",sym:"ASHOKLEY"},
	{ex:"nse_eq",sym:"ASIANPAINT"},
	{ex:"nse_eq",sym:"AUROPHARMA"},
	{ex:"nse_eq",sym:"AXISBANK"},
	{ex:"nse_eq",sym:"BAJAJ-AUTO"},
	{ex:"nse_eq",sym:"BAJAJFINSV"},
	{ex:"nse_eq",sym:"BAJFINANCE"},
	{ex:"nse_eq",sym:"BALKRISIND"},
	{ex:"nse_eq",sym:"BANKBARODA"},
	{ex:"nse_eq",sym:"BANKINDIA"},
	{ex:"nse_eq",sym:"BATAINDIA"},
	{ex:"nse_eq",sym:"BEL"},
	{ex:"nse_eq",sym:"BEML"},
	{ex:"nse_eq",sym:"BERGEPAINT"},
	{ex:"nse_eq",sym:"BHARATFIN"},
	{ex:"nse_eq",sym:"BHARATFORG"},
	{ex:"nse_eq",sym:"BHARTIARTL"},
	{ex:"nse_eq",sym:"BHEL"},
	{ex:"nse_eq",sym:"BIOCON"},
	{ex:"nse_eq",sym:"BOSCHLTD"},
	{ex:"nse_eq",sym:"BPCL"},
	{ex:"nse_eq",sym:"BRITANNIA"},
	{ex:"nse_eq",sym:"CADILAHC"},
	{ex:"nse_eq",sym:"CANBK"},
	{ex:"nse_eq",sym:"CANFINHOME"},
	{ex:"nse_eq",sym:"CAPF"},
	{ex:"nse_eq",sym:"CASTROLIND"},
	{ex:"nse_eq",sym:"CEATLTD"},
	{ex:"nse_eq",sym:"CENTURYTEX"},
	{ex:"nse_eq",sym:"CESC"},
	{ex:"nse_eq",sym:"CGPOWER"},
	{ex:"nse_eq",sym:"CHENNPETRO"},
	{ex:"nse_eq",sym:"CHOLAFIN"},
	{ex:"nse_eq",sym:"CIPLA"},
	{ex:"nse_eq",sym:"COALINDIA"},
	{ex:"nse_eq",sym:"COLPAL"},
	{ex:"nse_eq",sym:"CONCOR"},
	{ex:"nse_eq",sym:"CUMMINSIND"},
	{ex:"nse_eq",sym:"DABUR"},
	{ex:"nse_eq",sym:"DCBBANK"},
	{ex:"nse_eq",sym:"DHFL"},
	{ex:"nse_eq",sym:"DISHTV"},
	{ex:"nse_eq",sym:"DIVISLAB"},
	{ex:"nse_eq",sym:"DLF"},
	{ex:"nse_eq",sym:"DRREDDY"},
	{ex:"nse_eq",sym:"EICHERMOT"},
	{ex:"nse_eq",sym:"ENGINERSIN"},
	{ex:"nse_eq",sym:"EQUITAS"},
	{ex:"nse_eq",sym:"ESCORTS"},
	{ex:"nse_eq",sym:"EXIDEIND"},
	{ex:"nse_eq",sym:"FEDERALBNK"},
	{ex:"nse_eq",sym:"GAIL"},
	{ex:"nse_eq",sym:"GLENMARK"},
	{ex:"nse_eq",sym:"GMRINFRA"},
	{ex:"nse_eq",sym:"GODFRYPHLP"},
	{ex:"nse_eq",sym:"GODREJCP"},
	{ex:"nse_eq",sym:"GODREJIND"},
	{ex:"nse_eq",sym:"GRASIM"},
	{ex:"nse_eq",sym:"GSFC"},
	{ex:"nse_eq",sym:"HAVELLS"},
	{ex:"nse_eq",sym:"HCLTECH"},
	{ex:"nse_eq",sym:"HDFC"},
	{ex:"nse_eq",sym:"HDFCBANK"},
	{ex:"nse_eq",sym:"HEROMOTOCO"},
	{ex:"nse_eq",sym:"HEXAWARE"},
	{ex:"nse_eq",sym:"HINDALCO"},
	{ex:"nse_eq",sym:"HINDPETRO"},
	{ex:"nse_eq",sym:"HINDUNILVR"},
	{ex:"nse_eq",sym:"HINDZINC"},
	{ex:"nse_eq",sym:"IBULHSGFIN"},
	{ex:"nse_eq",sym:"ICICIBANK"},
	{ex:"nse_eq",sym:"ICICIPRULI"},
	{ex:"nse_eq",sym:"IDBI"},
	{ex:"nse_eq",sym:"IDEA"},
	{ex:"nse_eq",sym:"IDFC"},
	{ex:"nse_eq",sym:"IDFCBANK"},
	{ex:"nse_eq",sym:"IFCI"},
	{ex:"nse_eq",sym:"IGL"},
	{ex:"nse_eq",sym:"INDIACEM"},
	{ex:"nse_eq",sym:"INDIANB"},
	{ex:"nse_eq",sym:"INDIGO"},
	{ex:"nse_eq",sym:"INDUSINDBK"},
	{ex:"nse_eq",sym:"INFIBEAM"},
	{ex:"nse_eq",sym:"INFRATEL"},
	{ex:"nse_eq",sym:"INFY"},
	{ex:"nse_eq",sym:"IOC"},
	{ex:"nse_eq",sym:"IRB"},
	{ex:"nse_eq",sym:"ITC"},
	{ex:"nse_eq",sym:"JETAIRWAYS"},
	{ex:"nse_eq",sym:"JINDALSTEL"},
	{ex:"nse_eq",sym:"JISLJALEQS"},
	{ex:"nse_eq",sym:"JPASSOCIAT"},
	{ex:"nse_eq",sym:"JSWSTEEL"},
	{ex:"nse_eq",sym:"JUBLFOOD"},
	{ex:"nse_eq",sym:"JUSTDIAL"},
	{ex:"nse_eq",sym:"KAJARIACER"},
	{ex:"nse_eq",sym:"KOTAKBANK"},
	{ex:"nse_eq",sym:"KPIT"},
	{ex:"nse_eq",sym:"KSCL"},
	{ex:"nse_eq",sym:"KTKBANK"},
	{ex:"nse_eq",sym:"L&TFH"},
	{ex:"nse_eq",sym:"LICHSGFIN"},
	{ex:"nse_eq",sym:"LT"},
	{ex:"nse_eq",sym:"LUPIN"},
	{ex:"nse_eq",sym:"M&M"},
	{ex:"nse_eq",sym:"M&MFIN"},
	{ex:"nse_eq",sym:"MANAPPURAM"},
	{ex:"nse_eq",sym:"MARICO"},
	{ex:"nse_eq",sym:"MARUTI"},
	{ex:"nse_eq",sym:"MCDOWELL-N"},
	{ex:"nse_eq",sym:"MCX"},
	{ex:"nse_eq",sym:"MFSL"},
	{ex:"nse_eq",sym:"MGL"},
	{ex:"nse_eq",sym:"MINDTREE"},
	{ex:"nse_eq",sym:"MOTHERSUMI"},
	{ex:"nse_eq",sym:"MRF"},
	{ex:"nse_eq",sym:"MRPL"},
	{ex:"nse_eq",sym:"MUTHOOTFIN"},
	{ex:"nse_eq",sym:"NATIONALUM"},
	{ex:"nse_eq",sym:"NBCC"},
	{ex:"nse_eq",sym:"NCC"},
	{ex:"nse_eq",sym:"NESTLEIND"},
	{ex:"nse_eq",sym:"NHPC"},
	{ex:"nse_eq",sym:"NIITTECH"},
	{ex:"nse_eq",sym:"NMDC"},
	{ex:"nse_eq",sym:"NTPC"},
	{ex:"nse_eq",sym:"OFSS"},
	{ex:"nse_eq",sym:"OIL"},
	{ex:"nse_eq",sym:"ONGC"},
	{ex:"nse_eq",sym:"ORIENTBANK"},
	{ex:"nse_eq",sym:"PAGEIND"},
	{ex:"nse_eq",sym:"PCJEWELLER"},
	{ex:"nse_eq",sym:"PEL"},
	{ex:"nse_eq",sym:"PETRONET"},
	{ex:"nse_eq",sym:"PFC"},
	{ex:"nse_eq",sym:"PIDILITIND"},
	{ex:"nse_eq",sym:"PNB"},
	{ex:"nse_eq",sym:"POWERGRID"},
	{ex:"nse_eq",sym:"PTC"},
	{ex:"nse_eq",sym:"PVR"},
	{ex:"nse_eq",sym:"RAMCOCEM"},
	{ex:"nse_eq",sym:"RAYMOND"},
	{ex:"nse_eq",sym:"RBLBANK"},
	{ex:"nse_eq",sym:"RCOM"},
	{ex:"nse_eq",sym:"RECLTD"},
	{ex:"nse_eq",sym:"RELCAPITAL"},
	{ex:"nse_eq",sym:"RELIANCE"},
	{ex:"nse_eq",sym:"RELINFRA"},
	{ex:"nse_eq",sym:"REPCOHOME"},
	{ex:"nse_eq",sym:"RPOWER"},
	{ex:"nse_eq",sym:"SAIL"},
	{ex:"nse_eq",sym:"SBIN"},
	{ex:"nse_eq",sym:"SHREECEM"},
	{ex:"nse_eq",sym:"SIEMENS"},
	{ex:"nse_eq",sym:"SOUTHBANK"},
	{ex:"nse_eq",sym:"SREINFRA"},
	{ex:"nse_eq",sym:"SRF"},
	{ex:"nse_eq",sym:"SRTRANSFIN"},
	{ex:"nse_eq",sym:"STAR"},
	{ex:"nse_eq",sym:"SUNPHARMA"},
	{ex:"nse_eq",sym:"SUNTV"},
	{ex:"nse_eq",sym:"SUZLON"},
	{ex:"nse_eq",sym:"SYNDIBANK"},
	{ex:"nse_eq",sym:"TATACHEM"},
	{ex:"nse_eq",sym:"TATACOMM"},
	{ex:"nse_eq",sym:"TATAELXSI"},
	{ex:"nse_eq",sym:"TATAGLOBAL"},
	{ex:"nse_eq",sym:"TATAMOTORS"},
	{ex:"nse_eq",sym:"TATAMTRDVR"},
	{ex:"nse_eq",sym:"TATAPOWER"},
	{ex:"nse_eq",sym:"TATASTEEL"},
	{ex:"nse_eq",sym:"TCS"},
	{ex:"nse_eq",sym:"TECHM"},
	{ex:"nse_eq",sym:"TITAN"},
	{ex:"nse_eq",sym:"TORNTPHARM"},
	{ex:"nse_eq",sym:"TORNTPOWER"},
	{ex:"nse_eq",sym:"TV18BRDCST"},
	{ex:"nse_eq",sym:"TVSMOTOR"},
	{ex:"nse_eq",sym:"UBL"},
	{ex:"nse_eq",sym:"UJJIVAN"},
	{ex:"nse_eq",sym:"ULTRACEMCO"},
	{ex:"nse_eq",sym:"UNIONBANK"},
	{ex:"nse_eq",sym:"UPL"},
	{ex:"nse_eq",sym:"VEDL"},
	{ex:"nse_eq",sym:"VGUARD"},
	{ex:"nse_eq",sym:"VOLTAS"},
	{ex:"nse_eq",sym:"WIPRO"},
	{ex:"nse_eq",sym:"WOCKPHARMA"},
	{ex:"nse_eq",sym:"YESBANK"},
	{ex:"nse_eq",sym:"ZEEL"}
];


function selectScrips_HL(sList, n, sType) {
	logme("Getting "+sType+" scrips pclose & open");
	var _promiseArray = [];
	sList.forEach(function (scrip) {
		var _scripPromise = new Promise(function (resolve, reject) {
				upstox.getLiveFeed({
					"exchange": scrip.ex,
					"symbol": scrip.sym,
					"type": "full"
				})
				.then(function (response) {
					var pdiff = (((response.data.open - response.data.close) / response.data.close) * 100).toFixed(2);
					resolve({
						ex: scrip.ex,
						sym: scrip.sym,
						//pclose:response.data.close,
						//topen:response.data.ltp,
						diff: Number(pdiff)
					});
				})
				.catch(function (error) {
					logme("Err::" + scrip.sym + "::"+ error.message);
					//reject(error);
				});
			});
		_promiseArray.push(_scripPromise);
	});

	Promise.all(_promiseArray).then(function (respArr) {
		logme("Sorting..");
		respArr = respArr.sortBy('diff');
		//logme("all:"+JSON.stringify(respArr));
		logme("Identifying top and bottom " + n + " scrips..");
		var selectedScrips = [];
		selectedScrips.push.apply(selectedScrips, respArr.slice(0, n));
		selectedScrips.push.apply(selectedScrips, respArr.slice(-n));
		//logme("all:"+JSON.stringify(selectedScrips));
		var sList = "";
		selectedScrips.forEach(function (scrip) {
			sList += scrip.sym + ","
		});
		logme("Selected scrips : [" + sList + "]");
		getHighLow(selectedScrips, 15);
	});
}

function getHighLow(sList, tf) {
	logme("Identifying first " + tf + "min HL");
	var _promiseArray = [];
	var ftf = tf / 5;
	sList.forEach(function (scrip) {
		var _scripPromise = new Promise(function (resolve, reject) {
				upstox.getOHLC({
					"exchange": scrip.ex,
					"symbol": scrip.sym,
					"start_date": getTodayDate(),
					"end_date": getTodayDate(),
					"format": "json",
					"interval": "5MINUTE"
				})
				.then(function (response) {
					//logme(JSON.stringify(response));
					var ohlc5data = response.data;
					var all_max15 = [];
					var all_min15 = [];
					if (ohlc5data.length >= ftf) {
						for (i = 0; i < ftf; i++) {
							all_max15.push(ohlc5data[i].high);
							all_min15.push(ohlc5data[i].low);
						}
					}
					var max15 = Math.max.apply(null, all_max15);
					var min15 = Math.min.apply(null, all_min15);
					//logme("max:"+max15);
					//logme("min:"+min15);
					resolve({
						sym: scrip.sym,
						ex: scrip.ex,
						high: max15,
						low: min15
					});
				})
				.catch(function (error) {
					logme(JSON.stringify(error));
					reject(error);
				});
			});
		_promiseArray.push(_scripPromise);
	});

	Promise.all(_promiseArray).then(function (respArr) {
		//logme(JSON.stringify(respArr));
		placeOrderConditional(respArr);
	});
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

Array.prototype.sortBy = function (p) {
	return this.slice(0).sort(function (a, b) {
		return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
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

const getURLData = (url) => {
    return new Promise((resolve, reject) => {
        const http      = require('http'),
              https     = require('https');
        let client = http;
        if (url.toString().indexOf("https") === 0) {
            client = https;
        }
        client.get(url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => { data += chunk; });
            resp.on('end', () => {resolve(data);});
        }).on("error", (err) => {
            //reject(err);
            logme(err);
        });
    });
};

function placeOrderConditional(scripArr) {
  invokeSocket();
	//var qty = 0;
  logme(" ");
	logme("Order plan:");
  logme("--------------------------------------------------");
  var orderPrepArray = [];
	scripArr.forEach(function (scrip) {
    logme(scrip.sym + "|buy above " + scrip.high + "|sell below " + scrip.low + "|qty:" + qty);
    orderPrepArray.push({
      txnDesc:"Sell", 
      txnType:"s", 
      ex:scrip.ex, 
      sym:scrip.sym,
      p:scrip.low - trigger_offset,
      tp:scrip.low - price_offset,
      q:qty
    });
    orderPrepArray.push({
      txnDesc:"Buy", 
      txnType:"b", 
      ex:scrip.ex, 
      sym:scrip.sym,
      p:scrip.high + trigger_offset,
      tp:scrip.high + price_offset,
      q:qty
    });
	});
  logme("--------------------------------------------------");
  placeOrdr(orderPrepArray);
}

function placeOrdr(orderPrepArray) {
  logme(" ");
  logme("Placing orders..");
  orderPrepArray.forEach(function (ordr) {
    // logme(JSON.stringify({
    //   "transaction_type":ordr.txnType,
    //   "exchange":ordr.ex,
    //   "symbol": ordr.sym,
    //   "quantity": ordr.q,
    //   "order_type":"sl",
    //   "product": "I",
    //   "price":ordr.p.toFixed(2),
    //   "trigger_price":ordr.tp.toFixed(2)
    // }));
    upstox.placeOrder({
    	"transaction_type": ordr.txnType,
    	"exchange": ordr.ex,
    	"symbol": ordr.sym,
    	"quantity": ordr.q,
    	"order_type": "sl",
    	"product": "I",
    	"price": ordr.p.toFixed(2),
    	"trigger_price": ordr.tp.toFixed(2)
    })
    .then(function (response) {
    	logme(response.data.order_id + "|" + sym + "|" + response.data.status);
    })
    .catch(function (error) {
    	//done(error);
    	logme(JSON.stringify(error));
      //logme(ordr.sym+"|"+error.message+"|"+error.error.reason)
    });
  });
}

var qty = process.env.TQTY;
var trigger_offset = 0.15;
var price_offset = 0.10;

function invokeSocket(){
  upstox.connectSocket()
  .then(function() {
    logme("Socket connected.");
    upstox.on("orderUpdate", function(message) {
      if(message.status=="trigger pending"){
        logme(message.order_id+" - Trgr. pending : "+message.symbol+" "+message.quantity+"@"+message.trigger_price);
      }
      if(message.status=="complete"){
        logme(message.order_id+" - Completed : "+message.symbol+" "+message.traded_quantity+"@"+message.average_price);
      }		
      if(message.status=="cancelled"){
        logme(message.order_id+" - Cancelled : "+message.symbol+" "+message.traded_quantity+"@"+message.average_price);
      }	    
    });
    upstox.on("positionUpdate", function(message) {
      logme("Position Updated. "+JSON.stringify(message));
    });
    upstox.on("tradeUpdate", function(message) {
      logme("Trade Updated. " + JSON.stringify(message));
    });
    upstox.on("liveFeed", function(message) {
      //logme("Live Feed. - " + JSON.stringify(message));
    });
    upstox.on("disconnected", function(message) {
      logme("Socket disconnected.");
    });
    upstox.on("error", function(error) {
      logme("Socket on_error:" + JSON.stringify(error));
    });
  }).catch(function(err) {
    logme("Socket error:" + JSON.stringify(err));
  });
}

function scheduleJobs(myjobs){
  console.log("Today " + new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})+" IST");
  logme("Scheduling jobs..");
  myjobs.forEach(function(job){
    if(job.enabled)configureJob(job);
  });
  logme("done.");
}

function configureJob(job){
  switch(job.name){
    case "tokenJOB": 
          schedule.scheduleJob(job.schedule, function (fireDate) {
            (async (url) => {
              var atCode = await getURLData(url); atCode=JSON.parse(atCode);
              upstox.setToken(atCode.token); 
              logme("Received token. -- "+atCode.code);
            })(atCodeURL);
            console.log("\n\n---------------------------------------------------------------"); 
            console.log("Today " + new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})+" IST");
            logme(job.name+" started");
          });
          break;
    case "tradeJOB": 
          schedule.scheduleJob(job.schedule, function (fireDate) {
            console.log("\n\n---------------------------------------------------------------");  
            console.log("Today " + new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})+" IST");
            logme(job.name+" started");
            selectScrips_HL(n50,3,"N50");
            //selectScrips_HL(nfostocks,3, "ALL_FNO");  
          });       
          break;
    default: break;
  }
}

function runImmediate(isTokenReq){
  console.log("Running Immediate..");
  if(isTokenReq || !isTokenSet){
    (async (url) => {
      var atCode = await getURLData(url); atCode=JSON.parse(atCode);
      upstox.setToken(atCode.token); 
      logme("Received token. -- "+atCode.code);
      selectScrips_HL(n50,3,"N50");
    })(atCodeURL);
    console.log("Today " + new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})+" IST");
    logme("tokenJOB started");
  }else{
  	selectScrips_HL(n50,3,"N50");
    //selectScrips_HL(nfostocks,3, "ALL_FNO");
  }
}

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)


//var defSchedule=" * * 1-5"; //Date Month DaysOfWeek
var myJobs=[
  {
    name:"tokenJOB",
    enabled:true,
    //schedule:"35 3"+defSchedule, //Daily 9:05 AM = UTC 3 35
    schedule: process.env.TOKENJOB //Daily 9:05 AM = UTC 3 35
  },
  {
    name:"tradeJOB",
    enabled:true,
    //schedule:"1 4"+defSchedule, //Daily 9:31 AM = UTC 4 1
    schedule: process.env.TRADEJOB //Daily 9:05 AM = UTC 3 35
  }
];

scheduleJobs(myJobs);
//runImmediate(false);

fs.writeFile("/data/token.txt", "Hey there!", function(err) {
    if(err) {return console.log(err);}
    console.log("The file was saved!");
});

fs.writeFile("/data/token.txt", "Hey there!", function(err) {
    if(err) {return console.log(err);}
    console.log("The file was saved!");
	fs.readFile('/data/token.txt', 'utf8', function (err,data) {
    		if (err) {return console.log(err);}
    		console.log("file read:: "+data);
	});
});
