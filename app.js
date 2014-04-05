var LMS = require("./modules/lms");
var fs = require("fs");
var quotes = JSON.parse(fs.readFileSync("quotes.json"));

var inputs = {}, i, j, sample = {}, ref, quoteStudy = "USD/EUR";

//for (i = 0; i < quotes[0].d.length; i += 1) {
for (i = 63; i < 64; i += 1) {
  inputs[quotes[0].d[i].name] = 3;
  sample[quotes[0].d[i].name] = 0;
  if (quotes[1].d[i].name == quoteStudy) { ref = quotes[1].d[i].price; }
}

var predictor = LMS.PredictorFactory({
  "mu": {"x": {"type": "TR", "value": 0.5}},
  "inputs": inputs,
  "outputs": [quoteStudy]
});

for (i = 0; i < quotes.length - 1; i += 1) {
  predictor.train(sample, {"USD/EUR": ref});
  console.log(predictor.getPredictors()[quoteStudy].getError());
  /*console.log(predictor.getPredictors()[quoteStudy].getOutput());
  console.log(predictor.getPredictors()[quoteStudy].getMu());
  console.log("-------------------------");*/
  sample = {};
  //for (j = 0; j < quotes[i].d.length; j += 1) {
  for (j = 63; j < 64; j += 1) {
    sample[quotes[i].d[j].name] = quotes[i].d[j].price;
    if (quotes[i + 1].d[j].name == quoteStudy) {
      ref = quotes[i + 1].d[j].price;
    }
  }
}

