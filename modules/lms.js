var LMS = (function (LMS) {
  function WienerFilter(define) {
    var inp = define["inputs"];
    var out = define["outputs"];
    var mus = define["mu"];
    var buffers = {}, filters = {}, mu = {}, y = 0, outputs = {};
    var inputVars = [], nInVa = 0, outputVars = [], nOutVa = 0, inputsTr = {};
    var i, j, va, keys, e = {};
    var MAX_VAL = 99999;

    this.length = 0;
    this.minTr = 0.001;

    function __construct() {
      keys = Object.keys(inp);
      for (i = 0; i < keys.length; i += 1) {
        for (j = 0; j < inp[keys[i]]; j += 1) {
          if (buffers[keys[i]] === undefined) { buffers[keys[i]] = []; }
          buffers[keys[i]].push(0);

          if (filters[keys[i]] === undefined) { filters[keys[i]] = []; }
          filters[keys[i]].push(0);
        }
        if (inputsTr[keys[i]] === undefined) { inputsTr[keys[i]] = []; }
        inputsTr[keys[i]] = 0;

        // Set de mu
        if (mu[keys[i]] === undefined) { mu[keys[i]] = 0; }
        if (mus === undefined || mus[keys[i]] === undefined) {
          mu[keys[i]] = (function (vaNom) {
            return function () { 
              return (inputsTr[vaNom] !== 0 ? 0.5 / inputsTr[vaNom] : MAX_VAL);
            }
          })(keys[i]);
        } else if (mus[keys[i]]["type"] === "TR") {
          mu[keys[i]] = (function (vaNom, muVal) {
            return function (debug) { 
              return (
                inputsTr[vaNom] !== 0 ? muVal / inputsTr[vaNom] : MAX_VAL
              );
            }
          })(keys[i], mus[keys[i]]["value"]);
        } else {
          mu[keys[i]] = (function (muVal) {
            return function () { return muVal; };
          })(mus[keys[i]]["value"]);
        }

        inputVars.push(keys[i]);
      }

      for (i = 0; i < out.length; i += 1) {
        if (y[out[i]] === undefined) { y[out[i]] = []; }
        y[out[i]] = 0;
      }
      outputVars = out;

      nInVa = inputVars.length;   
      nOutVa = outputVars.length;
    }

    __construct();

    this.cycle = function (x, ref) {
      this.clean();
      this.project(x);
      this.train(ref);

      return this;
    };

    this.clean = function () {
      var i;
      // Output clean (in case of diferent outputs)
      for (i = 0; i < nInVa; i += 1) {
        outputs[inputVars[i]] = 0;
      }
      y = 0;
      e = {};

      return this;
    };

    this.project = function (x) {
      var i, vaNom;

      // Inputs procesing
      for (i = 0; i < nInVa; i += 1) {
        vaNom = inputVars[i];
        computeTrace(vaNom, x[vaNom], pushInput(vaNom, x[vaNom]));
        projectVar(vaNom, x[vaNom]);
      }

      return y;
    };
    
    this.pushInputs = function (x) {
      var i, vaNom;

      // Inputs procesing
      for (i = 0; i < nInVa; i += 1) {
        vaNom = inputVars[i];
        pushInput(vaNom, x[vaNom]);
      }

      return this;
    }

    function pushInput(vaNom, x) {
      // Load the buffers and compute the variables autocorrelation
      buffers[vaNom].unshift(x);
      return buffers[vaNom].pop();
    };

    function computeTrace(vaNom, x, outValue) {
      // Computes the new input Trace for dinamic mu
      inputsTr[vaNom] += x * x;
      inputsTr[vaNom] -= outValue * outValue;

      if (
        inputsTr[vaNom] < this.minTr &&
        inputsTr[vaNom] > -this.minTr
      ) { inputsTr[vaNom] = this.minTr; }

      return inputsTr[vaNom];
    }

    function projectVar(vaNom, x) {
      var o;
      // Compute the filter output
      buffers[vaNom].forEach(function (input, ind) {
        o = input * filters[vaNom][ind]; 
        outputs[vaNom] += o;
        y += o;
      });

      return y;
    }

    this.train = function (ref) {
      var i, vaNom, o;

      // Get the error
      for (o = 0; o < nOutVa; o += 1) {
        vaNom = outputVars[o];
        if (e[vaNom] === undefined) { e[vaNom] = 0; }
        e[vaNom] += ref[vaNom] - y;
      }
      // Train the filter with the feedback of the error
      for (i = 0; i < nInVa; i += 1) {
        vaNom = inputVars[i];
        buffers[vaNom].forEach(function (input, ind) {
          for (o = 0; o < nOutVa; o += 1) {
            filters[vaNom][ind] += (mu[vaNom]() * e[outputVars[o]] * input);
          }
        });
      }

      return this;
    };

    this.getBuffer  = function () { return buffers; };
    this.getFilter  = function () { return filters; };
    this.getOutput  = function (vaNom) {
      if (vaNom === undefined) {
        return y;
      } else {
        return outputs[vaNom]; 
      }
    };
    this.getError   = function () { return e; };
    this.getMu      = function () { 
      var returnedMus = {}, i;
      for (i = 0; i < nInVa; i += 1) {
        returnedMus[inputVars[i]] = mu[inputVars[i]]();
      }
      return returnedMus;
    };
    this.getTrace   = function () { return inputsTr; };
  }

  LMS.WienerFilterFactory = function (definition) {
    return new WienerFilter(definition);
  };

  LMS.PredictorFactory = function (definition) {
    return new Predictor(definition);
  };

  function Predictor(definition) {
    var predictors = [], i, vas = Object.keys(definition["inputs"]),
        nVas = vas.length, out = definition["output"], outInd,
        predictions = {};
    
    for (i = 0; i < nVas; i += 1) {
      definition["output"] = [vas[i]];
      if (out === definition["output"]) {
        outInd = i;
      }
      predictors[vas[i]] = new WienerFilter(definition);
    }

    this.train = function (x, ref) {
     for (i = 0; i < nVas; i += 1) {
        predictors[vas[i]].cycle(x, ref); 
      }

      return this;
    };

    this.predict = function (steps) {
      var i, predictions = {};
      if (steps === undefined) { steps = 1; }
      for (i = 0; i < steps; i += 1) {
        predictions = predictCycle();
      }

      return predictions;
    }

    function predictCycle() {
      predictions = {};

      for (i = 0; i < nVas; i += 1) {
        predictions[vas[i]] = predictors[vas[i]].getOutput();
      }
      for (i = 0; i < nVas; i += 1) {
        predictors[vas[i]].clean();
        //predictors[vas[i]].pushInputs(predictions);
        predictors[vas[i]].project(predictions);
      }

      for (i = 0; i < nVas; i += 1) {
        predictions[vas[i]] = predictors[vas[i]].getOutput();
      }
      
      return predictions;
    };

    this.getPrediction = function () { return predictions; };
    this.getPredictors = function () { return predictors; };
  };


  return LMS;
})({});

// CommonJS suport
if (module !== undefined) {
  module.exports = exports = LMS;
}

