var LMS = (function (LMS) {
  function Buffer(define) {
    var buffers = {};
  }
  function WienerFilter(define) {
    var inp = (define["inputs"] || {});
    var out = (define["outputs"] || {});
    var mus = (define["mu"] || {});
    var inputVars = [], nInVa = 0, outputVars = [], nOutVa = 0;
    var i, j, va, keys;
    var MAX_VAL = 99999;

    this.minTr = 0.001;
    this.buffers = {};
    this.filters = {};
    this.mu = {};
    this.output = 0;
    this.traces = {};
    this.errors = {};

    function pushInput(buffer, x) {
      // Load the buffers and compute the variables autocorrelation
      buffer.unshift(x);
      buffer.pop();
      return buffer;
    };
    function projectVar(h, x) {
      var o, y = 0;
      // Compute the filter output
      x.forEach(function (input, ind) {
        o = input * h[ind]; 
        y += o;
      });

      return y;
    }
    function applyForInputVars(out, closure) {
      var i, vaNom;

      // Inputs procesing
      for (i = 0; i < nInVa; i += 1) {
        vaNom = inputVars[i];

        out = closure(out, vaNom);
      }

      return out;

    }
    function applyForOutputVars(out, closure) {
      var o, vaNom;

      // Get the error
      for (o = 0; o < nOutVa; o += 1) {
        vaNom = outputVars[o];

        out = closure(out, vaNom);
      }

      return out;
    }
    function computeError(e, y, ref) {
      return applyForOutputVars(e, function (e, vaNom) {
        if (e[vaNom] === undefined) { e[vaNom] = 0; }
        e[vaNom] += ref[vaNom] - y;
        return e;
      });
    }
    function trainLms(h, mu, e, x) {
      return applyForInputVars(h, function (h, vaNom) {
        x[vaNom].forEach(function (input, ind) {
          return applyForOutputVars(h, function (h, o) {
            h[vaNom][ind] += (mu[vaNom]() * e[o] * input);
            return h;
          });
        });
        return h;
      });
    }
    function _pushInputs(buffers, x) {
      return applyForInputVars(buffers, function (b, vaNom) {
        b[vaNom] = pushInput(b[vaNom], x[vaNom]);
        return b;
      });
    }
    // Stupid because it exist a more optimal way to do so 
    function _computeTracesStupid(traces, buffers) {
      return applyForInputVars(traces, function (traces, vaNom) {
        traces[vaNom] = 0;
        buffers[vaNom].forEach(function (val) {
          traces[vaNom] += val * val;
        });
        if (
          traces[vaNom] < this.minTr &&
          traces[vaNom] > -this.minTr
        ) { traces[vaNom] = this.minTr; }
        return traces;
      });
    }
    function genericGet(vars, nom) {
      if (nom === undefined) {
        return vars;
      } else {
        return vars[nom];
      }
    }
 
    function __construct(parent) {
      keys = Object.keys(inp);
      for (i = 0; i < keys.length; i += 1) {
        for (j = 0; j < inp[keys[i]]; j += 1) {
          if (parent.buffers[keys[i]] === undefined) {
            parent.buffers[keys[i]] = [];
          }
          parent.buffers[keys[i]].push(0);

          if (parent.filters[keys[i]] === undefined) {
            parent.filters[keys[i]] = [];
          }
          parent.filters[keys[i]].push(0);
        }
        if (parent.traces[keys[i]] === undefined) {
          parent.traces[keys[i]] = [];
        }
        parent.traces[keys[i]] = 0;

        // Set the mu
        if (parent.mu[keys[i]] === undefined) { parent.mu[keys[i]] = 0; }
        if (
          mus === undefined || mus[keys[i]] === undefined 
          || mus[keys[i]]["type"] === "TR"
        ) {
          if (mus === undefined || mus[keys[i]] === undefined) {
            mus[keys[i]] = { "value": 0.5};
          }
          parent.mu[keys[i]] = (function (vaNom, muVal) {
            return function () { 
              return (parent.traces[vaNom] !== 0 ? muVal / parent.traces[vaNom] : MAX_VAL);
            }
          })(keys[i], mus[keys[i]]["value"]);
        } else {
          parent.mu[keys[i]] = (function (muVal) {
            return function () { return muVal; };
          })(mus[keys[i]]["value"]);
        }

        inputVars.push(keys[i]);
      }

      outputVars = out;

      nInVa = inputVars.length;   
      nOutVa = outputVars.length;
    }

    __construct(this);

    this.cycle = function (x, ref) {
      this.buffers = this.pushInputs(x);
      this.traces = this.computeTraces();
      this.output = this.project(this.buffers);
      return this.train(this.buffers, ref);
    };

    this.project = function (x) {
      var y = 0, h = this.filters;
      return applyForInputVars(y, function (y, vaNom) {
        return y + projectVar(h[vaNom], x[vaNom]);
      });
    };
    this.pushInputs = function (x) {
        return _pushInputs(this.buffers, x);
    }
    this.computeTraces = function () {
      return _computeTracesStupid(this.traces, this.buffers);
    }
    this.train = function (x, ref) {
      this.errors = computeError([], this.output, ref);
      this.filters = trainLms(this.filters, this.mu, this.errors, x);

      return this;
    };
    this.getMu = function (vaNom) { 
      var returnedMus = {}, i;
      for (i = 0; i < nInVa; i += 1) {
        returnedMus[inputVars[i]] = this.mu[inputVars[i]]();
      }
      return genericGet(returnedMus, vaNom);
    };
    this.getStat = function () {
      return {
        "buffers": this.buffers,
        "filters": this.filters,
        "mu": this.mu,
        "output": this.output,
        "traces": this.traces,
        "errors": this.errors
      };
    };
    this.setStat = function (stat) {
      this.buffers = stat.buffers;
      this.filters = stat.filters;
      this.mu = stat.mu;
      this.output = stat.output;
      this.traces = stat.traces;
      this.errors = stat.errors;

      return this;
    };
 
  }

  LMS.WienerFilterFactory = function (definition) {
    return new WienerFilter(definition);
  };

  LMS.PredictorFactory = function (definition) {
    return new Predictor(definition);
  };

  function Predictor(definition) {
    var predictors = [], i, vas = Object.keys(definition["inputs"]),
        nVas = vas.length, outInd, 
        predictions = {}, outMap = {}, trainingStats = {};
    
    for (i = 0; i < nVas; i += 1) {
      definition["outputs"] = [vas[i]];
      outMap[vas[i]] = i;
      predictors[vas[i]] = new WienerFilter(definition);
      trainingStats[vas[i]] = predictors[vas[i]].getStat();
    }

    /*this.kk = function (x, ref) {
        predictors[vas[i]].setStat(trainingStats[vas[i]]);
        trainingStats[vas[i]] = predictors[vas[i]].getStat();
    };*/
    this.train = function (x, ref) {
      for (i = 0; i < nVas; i += 1) {
        predictors[vas[i]].cycle(x, ref); 
        trainingStats[vas[i]] = predictors[vas[i]].getStat();
      }

      return this;
    };

    this.predict = function (steps) {
      var i, predictions = {}, initialStats;
      if (steps === undefined) { steps = 1; }
      for (i = 0; i < steps; i += 1) {
        predictions = predictCycle();
      }

      return predictions;
    }

    function predictCycle() {
      predictions = {};

      for (i = 0; i < nVas; i += 1) {
        predictions[vas[i]] = predictors[vas[i]].output;
      }
      for (i = 0; i < nVas; i += 1) {
        predictions[vas[i]] = predictors[vas[i]].pushInputs(predictions);
        predictors[vas[i]].output = predictors[vas[i]].project(
          predictions[vas[i]]
        );
      }

      for (i = 0; i < nVas; i += 1) {
        predictions[vas[i]] = predictors[vas[i]].output;
      }
      
      return predictions;
    };

    this.getPrediction = function () { return predictions; };
    this.getPredictors = function () { return predictors; };
    this.getPredictor = function (varNom) { return predictors[varNom]; };
  };


  return LMS;
})({});

// CommonJS suport
if (module !== undefined) {
  module.exports = exports = LMS;
}

