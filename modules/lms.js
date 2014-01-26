var LMS = (function (LMS) {
  function WienerFilter(define) {
    var inp = define["inputs"];
    var out = define["outputs"];
    var mus = define["mu"];
    var buffers = {}, filters = {}, mu = {}, y = {};
    var inputVars = [], nInVa = 0, outputVars = [], nOutVa = 0, inputsTr = {};
    var i, j, va, keys, e;

    this.length = 0;
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
          return function () { return 0.5 / inputsTr[vaNom]; }
        })(keys[i]);
      } else if (mus[keys[i]]["type"] === "TR") {
        mu[keys[i]] = (function (vaNom, muVal) {
          return function (debug) { 
            return muVal / inputsTr[vaNom]; 
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
    this.cycle = function (x, ref) {
      var va, i, vaNom, outValue;

      // Output clean (in case of diferent outputs)
      for (va = 0; va < nOutVa; va += 1) {
        y[outputVars[va]] = 0;
      }

      // Inputs procesing
      for (i = 0; i < nInVa; i += 1) {
        vaNom = inputVars[i];

        // Load the buffers and compute the variables autocorrelation
        buffers[vaNom].unshift(x[vaNom]);
        outValue = buffers[vaNom].pop();

        // Computes the new input Trace for dinamic mu
        inputsTr[vaNom] += x[vaNom] * x[vaNom];
        inputsTr[vaNom] -= outValue * outValue;

        // Compute the filter output
        buffers[vaNom].forEach(function (input, ind) {
          for (o = 0; o < nOutVa; o += 1) {
            y[outputVars[o]] += input * filters[vaNom][ind];
          }
        });
      }

      // Get the error
      e = 0;
      for (o = 0; o < nOutVa; o += 1) {
        vaNom = outputVars[o];
        e += ref[vaNom] - y[outputVars[o]];
      }
      // Train the filter with the feedback of the error
      for (i = 0; i < nInVa; i += 1) {
        vaNom = inputVars[i];
        buffers[vaNom].forEach(function (input, ind) {
          filters[vaNom][ind] += (mu[vaNom]() * e * input);
        });
      }

      return this;
    };

    this.getBuffer  = function () { return buffers; };
    this.getFilter  = function () { return filters; };
    this.getOutput  = function () { return y; };
    this.getError   = function () { return e; };
    this.getMu      = function () { 
      var returnedMus = {}, i;
      for (i = 0; i < nInVa; i += 1) {
        returnedMus[inputVars[i]] = mu[inputVars[i]]();
      }
      return returnedMus;
    };
  }

  LMS.Factory = function (definition) {
    return new WienerFilter(definition);
  };

  return LMS;
})({});

// CommonJS suport
if (module !== undefined) {
  module.exports = exports = LMS;
}

