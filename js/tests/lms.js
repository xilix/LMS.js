var assert = require("assert");
var LMS = require("../modules/lms.js");

describe("LMS", function () {
  console.log("Implementation of an adaptative filter");
  console.log("using the LMS algorithm");

  describe("#__construct(Object definition)", function () {
    var definition = {
      "inputs"  : {"x":3},
      "outputs" : ["x"]
    };

    var lms = LMS.Factory(definition);
    it("set the size of the filter", function () {
      assert.deepEqual(lms.getBuffer().x.length, 3);
    });
    it("initalize the buffer to a 0 array", function () {
      assert.deepEqual(lms.getBuffer(), {"x": [0, 0, 0]});
    });
    it("initalize the filter to a 0 array", function () {
      assert.deepEqual(lms.getFilter(), {"x": [0, 0, 0]});
    });

    var definition2 = {
      "inputs"  : {"x": 3, "y": 2},
      "outputs" : ["x"]
    };

    var lms2 = LMS.Factory(definition2);
    it("set the size of the filter", function () {
      var buffers = lms2.getBuffer();
      assert.equal(buffers.x.length, 3);
      assert.equal(buffers.y.length, 2);
    });
    it("initalize the buffer to a 0 array", function () {
      assert.deepEqual(lms2.getBuffer(), {"x": [0, 0, 0], "y": [0, 0]});
    });
    it("initalize the filter to a 0 array", function () {
      assert.deepEqual(lms2.getFilter(), {"x": [0, 0, 0], "y": [0, 0]});
    });
  });

  describe("#cycle(Object input, Object reference)", function () {
    var definition = {
      "mu": {"x": {"type": "constant", "value": 0.5}},
      "inputs"  : {"x":2},
      "outputs" : ["x"]
    };

    var lms = LMS.Factory(definition);
    //Senyal real:
    //h=[1, -1];
    //1 => 1*1 - 1*0 = 1
    //2 => 1*2 - 1*1 = 1
    //0 => 1*0 - 1*2 = -1
    lms.cycle({"x": 1}, {"x": 1});//h=[0,0],    x=[1,0], y=0, e=1, mu=0.5
    lms.cycle({"x": 2}, {"x": 1});//h=[0.5,0],  x=[2,1], y=1, e=0, mu=0.5
    lms.cycle({"x": 0}, {"x":-1});//h=[0.5,0],  x=[0,2], y=0, e=-1,mu=0.5
                                  //h=[0.5,-1]
    it("push data to the buffer", function () {
      assert.deepEqual(lms.getBuffer(), {"x":[0, 2]});
    });
    it("computes the filter at every cycle", function () {
      assert.deepEqual(lms.getFilter(), {"x": [0.5,-1]});
    });
    it("computes the outpus of the filter", function () {
      assert.deepEqual(lms.getOutput(), {"x": 0});
    });
    it("computes the filter error", function () {
      assert.deepEqual(lms.getError(), -1);
    });
    it.skip(
      "allows a static mu that it will be multiplied for the number of filter coeficients", function () {
      assert.equal(lms.getMu(), {"x": 0.5});
    });

    it("allows a dynamic mu that is the trace of the input signal autocorrelation matrix", function () {
      var definition2 = {
        "mu": {"x": {"type": "TR", "value": 0.5}},
        "inputs"  : {"x":2},
        "outputs" : ["x"]
      };

      var lms2 = LMS.Factory(definition2);
      //Senyal real:
      //h=[1, -1];
      //1 => 1*1 - 1*0 = 1
      //2 => 1*2 - 1*1 = 1
      //0 => 1*0 - 1*2 = -1
      //h=[0,0],    x=[1,0], y=0,  e=1,   Tr=1, mu=0.5
      lms2.cycle({"x": 1}, {"x": 1});
      //h=[0.5,0],  x=[2,1], y=1,  e=0,   Tr=5, mu=0.1
      lms2.cycle({"x": 2}, {"x": 1});
      //h=[0.5,0],x=[0,2], y=0, e=-1,Tr=4, mu=0.125
      lms2.cycle({"x": 0}, {"x":-1});
      //h=[0.5,-0.25]

      assert.deepEqual(lms2.getMu(), {"x":0.125});
      assert.deepEqual(lms2.getFilter(), {"x":[0.5,-0.25]});
    });


    it("allows cycle in multipe inputs at the same time", function () {
      var definition3 = {
        "mu": {
          "x": {"type": "TR", "value": 0.5},
          "y":{"type": "constant", "value": 1}
        },
        "inputs"  : {"x":1,"y":2},
        "outputs" : ["x"]
      };

      var lms3 = LMS.Factory(definition3);
      //hx=[0],hy=[0,0],x=[1],y=[2,0],y=0,e=1,mux=1,muy=1
      lms3.cycle({"x":1,"y":2},{"x":1});
      //hx=[0.5],hy=[2,0],x=[2],y=[0,2],y=0.5,e=0.5,mux=0.125,muy=1
      lms3.cycle({"x":2,"y":0},{"x":1.5});
      //hx=[0.625],hy=[2,1]

      assert.deepEqual(lms3.getMu(), {"x":0.125, "y": 1});
      assert.deepEqual(lms3.getFilter(), {"x":[0.625], "y":[2,1]});
    });

  });
  describe.skip("#project()", function () {
    it.skip("projects de prediction of the output for the next cycles to come", function () {
    });
  });
});
