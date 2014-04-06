var dates = [];
var currencySymbol = "EUR=X";
var data = {};
data[currencySymbol] = [];

var YAHOO = {
  "Finance": {
    "CurrencyConverter": {
      "addConversionRates": function (d) {
        var res = d.list.resources, i, iMax = res.length, re;

        for (i = 0; i < iMax; i += 1) {
          re = res[i].resource.fields;
          if (re["symbol"] == currencySymbol) {
            dates.push(re["date"]);
            data[currencySymbol][re["date"]] = re["price"];
          }
        }
      }
    }
  }
}

var index = ["BNO", "^EIXIC", "^ESTOXX50"];
var indexApp = ["BNO", "NASDAQ", "EUROSTOX"];
var Quotes = {}, j = 0, jMax = index.length;

for (j = 0; j < jMax; j += 1) {
  Quotes[indexApp[j]] = function (d) {
    var res = d.query.results.quote, i, iMax = res.length; 

    for (i = 0; i < iMax; i += 1) {
      if (data[res[i]["Symbol"]] === undefined) {
        data[res[i]["Symbol"]] = [];
        data[res[i]["Symbol"] + "-Vol"] = [];
      }
      if (res[i]["Date"] !== undefined) {
        data[res[i]["Symbol"]][res[i]["Date"]] = res[i]["Close"];
        data[res[i]["Symbol"]+"-Vol"][res[i]["Date"]] = res[i]["Volume"];
      }
    }
  };
}
