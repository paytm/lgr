/*jshint multistr: true ,node: true*/
"use strict";

var

    FS                  = require('fs'),
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),
    NPMLOG              = require('npmlog'),
    MOMENT              = require('moment'),
    
    /* NPM Paytm */
    
    /* Project Files */

    /* Global */
    TEMPLATE_PRINTS     = [
                            '__FUNC__',
                            '__LINE__',
                            '__FILE__',
                            '__COLM__'
                        ];

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
      Add custom error level critical, which is used to log critical errors
   */
    NPMLOG.addLevel('critical', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'CRITICAL!' );

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

    NPMLOG.on('log.critical', function(obj){
        NPMLOG.stream = this.errorStream;
        /* STDOUT will not get a copy of this erro rmessage */
    }.bind(this));

    // Override ALL LEVELS ... to have timestamp
    Object.keys(NPMLOG.levels).forEach(function(k){
        // Name the anonymous function: Useful for capturing stack.
        LGR.prototype[k] = function customLGRLevel (){
            arguments[0] = this._p() + arguments[0];
            return this.NPMLOG[k].apply(this, arguments);
        };
    });

    LGR.prototype['log'] = LGR.prototype['info'];
    /*
        by default we do not need to do stack trace
    */
    this.STACK_TRACE = false;
}

/*
   Always nice to have __FUNC__, __FILE__, and __LINE__.
   Referred from http://stackoverflow.com/questions/11386492/accessing-line-number-in-v8-javascript-chrome-node-js
   Also read https://github.com/v8/v8/wiki/Stack-Trace-API
*/

function captureStack(){
    // Hijack the Error.prepareStackTrace() function, which can be used to format the captured structuredStack.
    var
        orig = Error.prepareStackTrace,
        err,
        stack;

    Error.prepareStackTrace = function(_, structuredStack){
        return structuredStack;
    };

    err = new Error();
    

    // Naming the anonymous function allows us to skip the top of the stack till customLGRLevel
    Error.captureStackTrace(err, LGR.customLGRLevel);
    stack = err.stack;

    // Don't forget to restore the hijacked function.
    Error.prepareStackTrace = orig;
    return stack;
};

/* Sets log format for a user */
LGR.prototype.setLogFormat = function(val){
    this.logFormat  =  _.template(val);

    /*
        Now, no need to get stack trace every time ... use in template only if it is given
    */
    this.STACK_TRACE = TEMPLATE_PRINTS.some(function(templatePrint){
        return (val.indexOf(templatePrint) > -1);
    });
    
};

/* returns log prefix */
LGR.prototype._p = function(){
    var 
        logFormatObject = {
            "ram"       :  JSON.stringify(process.memoryUsage()),
            "ts"        :  MOMENT().format("YYYY-MM-DD HH:mm:ss"),
            "uptime"    : process.uptime(),
            "pid"       : process.pid,
            "count"     : this.count
        },
        callSiteObj;

    if(this.STACK_TRACE){
        callSiteObj = captureStack()[2];
        _.set(logFormatObject,"__FUNC__",callSiteObj.getFunctionName() || '(anon)');
        _.set(logFormatObject,"__FILE__",callSiteObj.getFileName());
        _.set(logFormatObject,"__LINE__",callSiteObj.getLineNumber());
        _.set(logFormatObject,"__COLM__",callSiteObj.getColumnNumber());
    }
    return this.logFormat(logFormatObject);
};

LGR.prototype.setLevel = function(level){
    this.level = level;
    this.NPMLOG.level = level;
};

LGR.prototype.getLevel = function() {
    return this.NPMLOG.level;
};

LGR.prototype.getLevels = function() {
    return this.NPMLOG.levels;
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
