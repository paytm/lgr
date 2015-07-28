/*jshint multistr: true ,node: true*/
"use strict";

var

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
        Log format
        "ram" , "ts" "uptime" "pid"

    */
    this.setLogFormat('<%= ts %> [<%= uptime %>] ');

    /*
        npmlog emits log and log.<lvl> event after that
        Hence we put a hook in both the events and change the stream before the log is written
        Since events are sync, this sohuld not be a problem

    */
    NPMLOG.on('log', function(obj){
        NPMLOG.stream = process.stdout;
    }.bind(this));

    NPMLOG.on('log.error', function(obj){
        NPMLOG.stream = process.stderr;
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
        "ts"        :  MOMENT().format("YYYY-MM-DD HH:MM:SS.sss"),
        "uptime"    : process.uptime(),
        "pid"       : process.pid,
    });
};

module.exports = new LGR();
