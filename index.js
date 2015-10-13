/*jshint multistr: true ,node: true*/
"use strict";

var

    FS                  = require('fs'),
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),
    NPMLOG              = require('npmlog'),
    MOMENT              = require('moment');
    
    /* NPM Paytm */
    
    /* Project Files */

function LGR(opts) {
    this.NPMLOG = NPMLOG;

    /*
        maintain internal count
    */
    this.count = 0;

    /*
        Log format
        "ram" , "ts" "uptime" "pid"

    */
    this.setLogFormat('<%= ts %> [<%= uptime %>] [<%= count %>] ');

    /*
        Default output stream ... default is process.stdout
        This is changed to file if output has to go to file
    */
    this.setOut();

    /*
        Default Error Stream ... default to process.stderr
    */
    this.setErr();

    /*
        npmlog emits log and log.<lvl> event after that
        Hence we put a hook in both the events and change the stream before the log is written
        Since events are sync, this sohuld not be a problem

    */
    NPMLOG.on('log', function(obj){
        this.count++;
        NPMLOG.stream = this.outputStream;
    }.bind(this));

    NPMLOG.on('log.error', function(obj){
        NPMLOG.stream = this.errorStream;
        /* STDOUT will not get a copy of this erro rmessage */
    }.bind(this));


}

// Override ALL LEVELS ... to have timestamp
Object.keys(NPMLOG.levels).forEach(function(k){
    LGR.prototype[k] = function(){
        arguments[0] = this._p() + arguments[0];
        return this.NPMLOG[k].apply(this, arguments);
    };
});

LGR.prototype.log = function(){
    arguments[0] = this._p() + arguments[0];
    return this.NPMLOG['info'].apply(this, arguments);
};

/* Sets log format for a user */
LGR.prototype.setLogFormat = function(val){
    this.logFormat =  _.template(val);
};

/* returns log prefix */
LGR.prototype._p = function(){
    return this.logFormat({
        "ram"       :  JSON.stringify(process.memoryUsage()),
        "ts"        :  MOMENT().format("YYYY-MM-DD HH:mm:ss"),
        "uptime"    : process.uptime(),
        "pid"       : process.pid,
        "count"     : this.count,
    });
};

LGR.prototype.setLevel = function(level){
    this.level = level;
    this.NPMLOG.level = level;
};

/* To set info to File/Stdout ... stdout by default */
LGR.prototype.setOut = function(fileName){
    if(fileName === undefined) this.outputStream = process.stdout;
    else  this.outputStream = FS.createWriteStream(fileName, { flags: 'a', encoding: null });
};

/* To set Error to File/stderr */
LGR.prototype.setErr = function(fileName){
    if(fileName === undefined) this.errorStream = process.stderr;
    else this.errorStream = FS.createWriteStream(fileName, { flags: 'a', encoding: null });
};

/* To Flush the buffered files and everything */
LGR.prototype.flush = function(){

    // Close the output stream if is not process.stdout
    if(_.get(this.outputStream,'_handle.fd', null) !== 1) this.outputStream.end();

    // Close the err stream if is not process.stdout
    if(_.get(this.errorStream,'_handle.fd', null) !== 2) this.errorStream.end();
};

module.exports = new LGR();
