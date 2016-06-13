/* we collect all data here and when End is passed , we verify the complete output */

var Writable = require('stream').Writable;
var util = require('util');
util.inherits(logTest, Writable);

function logTest(opt) {
  Writable.call(this, opt);
}

logTest.prototype._write = function(chunk, encoding, cb) {
  console.log("DOne processing", chunk.toString());
  return cb();
};

module.exports = new logTest();