var LMS = require("./lib/lms");
var fs = require("fs");
var quotes = JSON.parse(fs.readFileSync("./example/data/quotes.json"));
var dates = JSON.parse(fs.readFileSync("./example/data/dates.json"));
var i = 0, predictedRatio, currencySymbol = "EUR=X";

// Predictor definition
var definition = {
  "mu": {"EURUSD": {"type": "TR", "value": 0.25}},// Set up the mu coeficient for trining. A high value will give a fatser convergenve but more unstability. TR indicates that mu is been rebalancing with the trace of the memory samples
  "inputs": {"EURUSD": 10},// memory of 10 samples on variable EURUSD
};

// Getting predictor object from definition
var predictor = LMS.PredictorFactory(definition);

// Training predictor from data
// Tarining to use the past data to predict the today currency
// ratio
console.log("::: TRAINING PREDICTOR :::");
data = quotes[currencySymbol];
dates = dates[currencySymbol];
for (i = 1; i < dates.length - 95; i += 1) {
  predictor.train(
    // Past data
    {
      "EURUSD": data[dates[i - 1]],
    },
    // Today's ratio
    {"EURUSD": data[dates[i]]}
  );
  predictedRatio = predictor.getPredictor("EURUSD").output;


  logOutput({
    "date":       dates[i],
    "ratio":      data[dates[i]],
    "predicted":  predictor.getPredictor("EURUSD").output,
    "error":      predictor.getPredictor("EURUSD").errors["EURUSD"]
  });
}

console.log("");
console.log("");
console.log(
  "::: STOPING TRAINING AND PREDICT THE RATIO ONLY FROM TRAINED MODEL :::"
);
console.log("");
for (i = dates.length - 95; i < dates.length - 1; i += 1) {
  predictedRatio = predictor.predict();

  logOutput({
    "date":       dates[i],
    "ratio":      data[dates[i]],
    "predicted":  predictedRatio["EURUSD"],
    "error":      computeError(
                    parseFloat(data[dates[i]]), 
                    parseFloat(predictedRatio["EURUSD"])
                  )
  }); 
}


function logOutput(log) {
  console.log("--- " + log["date"] + " ---"); 
  console.log("Real ratio USD/EUR:                    " + log["ratio"]);
  console.log("Yestreday's predicted ratio for today: " + log["predicted"]);
  console.log("Predictor error:                       " + log["error"]);
}

function computeError(realRatio, predictedRatio) {
  return (2 * (realRatio - predictedRatio) / (realRatio + predictedRatio));
}
