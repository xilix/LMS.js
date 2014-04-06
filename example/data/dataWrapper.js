var currencySymbol = "EUR=X";
var data = {};
data[currencySymbol] = [];

var YAHOO = {
  "Finance": {
    "CurrencyConverter": {
      "addConversionRates": function (d) {
        var res = d.list.resources, i, iMax = res.length;

        for (i = 0; i < iMax; i += 1) {
          if (res[i].symbol == currencySymbol) {
            data[currencySymbol][res[i].fields["date"]] = res[i].fields["price"];
          }
        }
      }
    }
  }
}

var index = ["BNO", "^EIXIC", "^ESTOXX50"];
var indexApp = ["BNO", "NASDAQ", "EUROSTX50"];
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
