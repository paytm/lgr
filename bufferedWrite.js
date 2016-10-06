var util = require('util');



function bufferedWrite(stream, bufferSize, flushTimeInterval) {

	var self = this;

	this.offset 		= 0;

	this.write_stream 	= stream;

	this.buffer 		= new Buffer(bufferSize);

	/*
		buffer is repeatedly flushed after a specified interval.
		On call to flushBuffer, contents of buffer are written to stream and offset is reset to 0.
	*/

	this.timer 			= setTimeout(function(){
		self.callFlushBuffer(stream);
	}, flushTimeInterval);

}


bufferedWrite.prototype.write = function(log) {
	/*
		There is no direct way in node to detect size of data filled in buffer.
		buffer.write(string, offset) returns number of bytes it writes to buffer, say x.
		Cumulative addition of x gives the number of bytes written to buffer so far, say y.
		When buffer is unable to accomodate any more logs(i.e. when (buffer.length - y) < sizeof incoming log),
		buffer is flushed and offset is reset to 0.
	*/

	var self = this;

	// calculate size of incoming log
	var logSize = Buffer.byteLength(log);

	// calculate empty space in buffer
	var emptySpace = this.buffer.length - this.offset;

	// check if there is enough empty space to buffer the log, else call flushBuffer()
	if(emptySpace <  logSize ){
		self.flushBuffer(log, this.write_stream);
	}
	else {
		var bytesWritten = this.buffer.write(log, this.offset);

		// this.offset gives the number of bytes written to buffer so far
		this.offset += bytesWritten;		
	}
}


bufferedWrite.prototype.callFlushBuffer = function(stream) {
	var self = this;
	self.flushBuffer(null, stream);
}


bufferedWrite.prototype.flushBuffer = function(log, stream) {

	var self 	= this;

	
	// check if buffer is empty, else write contents of buffer to output
	if(this.offset !== 0) {
		stream.write(this.buffer.toString(undefined, 0 , this.offset));
	}

	// if a log cannot be buffered, it is written to stream immediately after contents of buffer are written
	if(log) {
		stream.write(log);
	}

	// offset is reset to 0 to enable writing to buffer from beginning
	this.offset = 0;


	// reset time for flushing buffer again
	clearTimeout(this.timer);
	this.timer = setTimeout(function(){
		self.callFlushBuffer(null, stream);
	}, this.flushTimeInterval);
}

module.exports = bufferedWrite;