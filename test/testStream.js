/* we collect all data here and when End is passed , we verify the complete output */

var Writable = require('stream').Writable;
var util = require('util');
util.inherits(logTest, Writable);

function logTest(opt) {
    Writable.call(this);
}

logTest.prototype._write = function(chunk, encoding, cb) {
  // console.log("Done processing", chunk.toString());
  cb();

    if(typeof this.testcb === 'function')
      this.testcb(chunk.toString());
};

module.exports = new logTest();