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
            data[currencySymbol][] = {
              "date": res[i].fields["date"],
              "data": res[i].fields["price"]
            };
          }
        }
      }
    }
  }
}
