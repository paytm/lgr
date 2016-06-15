/*jshint multistr: true ,node: true*/
"use strict";

var

    OS                  = require('os'),
    UTIL                = require('util'),
    /* NPM Third Party */
    _                   = require('lodash'),
    V                   = require('validator'),

    // NPMLOG              = require('npmlog'),
    MOMENT              = require('moment'),
    // ANSI                = require('ansi'),

    /* NPM Paytm */

    /* Project Files */

    /* Global */
    ADDITIONAL_VARS = {
        'ram'       : {},
        'ts'        : {},
        'uptime'    : {},
        'pid'       : {},
        'count'     : {},
        '__FUNC__'  : {},
        '__FILE__'  : {},
        '__LINE__'  : {},
        '__COLM__'  : {},
    },

    DEFAULT_LOGFORMAT   = '<%= prefix %> <%= ts %> [<%= uptime %>] [<%= count %>] <%= msg %>',
    DEFAULT_STREAM      = process.stdout,
    DEFAULT_WEIGHT      = 1000,
    DEFAULT_PREFIX      = 'INFO',
    DEFAULT_STYLE       = {},
    DEFAULT_TS_FORMAT   = 'YYYY-MM-DD HH:mm:ss';

function LGR(opts) {
    var self = this;

    this.count = 0; // Global count , sort of Id for log

    // will be later to set to levels object
    this.levels = {};

    // currnetly set level
    this.currentLevel = null;

    this.basicSettings();
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
}

/* returns the object according to demanded data */
LGR.prototype._getInfoObj = function(level){
    var
        logFormatObject = {
            "ram"       : UTIL.format(process.memoryUsage()),
            "ts"        : MOMENT().format(level.tsFormat),
            "uptime"    : process.uptime(),
            "pid"       : process.pid,
            "count"     : this.count,
            "hostname"  : OS.hostname(),
        },
        callSiteObj;

    if(level.stackTrace) {
        callSiteObj = captureStack()[4];
        _.set(logFormatObject,"__FUNC__",callSiteObj.getFunctionName() || '(anon)');
        _.set(logFormatObject,"__FILE__",callSiteObj.getFileName());
        _.set(logFormatObject,"__LINE__",callSiteObj.getLineNumber());
        _.set(logFormatObject,"__COLM__",callSiteObj.getColumnNumber());
    }

    return logFormatObject;
};

LGR.prototype.setLevel = function(level) {
    if(this.levels[level] === undefined) throw new Error('unknown level ' + level);
    this.currentLevel = this.levels[level];
};

LGR.prototype.getLevel = function() { return this.currentLevel.name; };
LGR.prototype.getLevels = function() {
    var
        self    = this,
        retObj  = {};

    Object.keys(self.levels).forEach(function(key){
        var lvl = self.levels[key];
        retObj[lvl.name] = lvl.weight;
    });

    return retObj;
};


LGR.prototype._checkStackTraceReqd = function(logFormat){
    if(
        logFormat.indexOf('__FUNC__') > 0 ||
        logFormat.indexOf('__FILE__') > 0 ||
        logFormat.indexOf('__LINE__') > 0 ||
        logFormat.indexOf('__COLM__') >= 0
    ) return true;
    else return false;
};


/* Levels */
LGR.prototype.addLevel = function(levelName, weight, style, dispPrefix, logFormat, stream, tsFormat){
    /*
        1. Lets just register the level
        We cant create streams or ansi cursors here
    */

    var
        self        = this,
        stackTrace  = false;

    if (!levelName ) throw new Error('name missing');
    if (!weight ) throw new Error('weight missing');

    // Default fallback values
    style       = style || DEFAULT_STYLE;
    dispPrefix  = dispPrefix || DEFAULT_PREFIX;
    logFormat   = logFormat || DEFAULT_LOGFORMAT;
    stream      = stream || DEFAULT_STREAM; // If stream unspecified , then it is process.stdout
    tsFormat    = tsFormat || DEFAULT_TS_FORMAT;

    // Lets parse logformat and see if we need capture stack which is the heavy part
    stackTrace = self._checkStackTraceReqd(logFormat);

    self.levels[levelName] = {
        'name'          : levelName,
        'weight'        : weight,
        'style'         : style,
        'dispPrefix'    : dispPrefix,
        'stream'        : stream,
        'logFormat'     : logFormat,
        'logTemplate'   : _.template(logFormat),
        'stackTrace'    : stackTrace,
        'tsFormat'      : tsFormat,
    };

    // Bind the function
    self[levelName] = function () {
        // insert level as first argument
        var a = new Array(arguments.length + 1);
        a[0] = levelName;
        for (var i = 0; i < arguments.length; i ++) a[i + 1] = arguments[i];
        return this._writeLog.apply(this, arguments);
    }.bind(this, levelName);
};


// Change a property of level
LGR.prototype.editLevel = function(levelName, prop, newVal) {
    /* weight, style, dispPrefix, logFormat, stream */
    var
        self = this,
        opts = ['weight', 'style', 'dispPrefix', 'logFormat', 'stream', 'tsFormat'];

    if(self.levels[levelName] === undefined) throw new Error('wrong level, see getlevels');
    if(opts.indexOf(prop) <=-1) throw new Error('wrong property');

    //set property
    self.levels[levelName][prop] = newVal;

    // Lets parse logformat and see if we need capture stack which is the heavy part
    if(prop === 'logFormat') {
        self.levels[levelName].stackTrace = self._checkStackTraceReqd(newVal);
        self.levels[levelName].logTemplate = _.template(newVal);
    }
};

/*

    - If error object is there we take argument.stack

    - JSON.stringify doesnt handle Special things like NaN, circular dependencies very well
    - JSON.stringify puts "" around each string
    - util.ispect gives multiline output for objects whose print length > 60 chars

    - We take this for granted then that huge objects take time to print and are problematic on production
    - For multiline objects with \n , we again replace \n with empty string

    - for various outputs we use Validator.toString() but utl.format is anyway better than that

    - using infinite levels, depth and arraylength
    Reference : http://stackoverflow.com/questions/10729276/how-can-i-get-the-full-object-in-node-js-console-log-rather-than-object
*/
LGR.prototype._getlinearMsg = function(arg) {
    var
        t   = typeof arg,
        res =   '';

    if(
        t === 'string' ||
        t === 'function' ||
        t === 'number' ||
        t === 'undefined' ||
        t === 'boolean'
    )
        res = UTIL.format(arg);

    else if (t === 'object' && (arg instanceof Error) && arg.stack) {
        res = UTIL.inspect(arg.stack, {showHidden: false, depth: null, maxArrayLength: null});
        // return UTIL.format(arg.stack);
    }
    else if (t === 'object') {
        res = UTIL.inspect(arg, {showHidden: false, depth: null, maxArrayLength: null});
    }

    // no idea what is here
    else {
        try {
            res = UTIL.inspect(arg, {showHidden: false, depth: null, maxArrayLength: null});
        } catch(ex) { res = 'cannot parse '; }
    }

    // remove newlines and other wierd chars
    res = res.replace(/(\n|\t|\r)/gi,'');
    return res;
};

// main log writing code
LGR.prototype._writeLog = function (lvl) {
    var
        self        = this,
        logline     = '',
        formatObj   = null,
        finalLog    = null,
        level       = self.levels[lvl];

    // increment count
    self.count++;

    // Don't do anything unless the log is less than the general log setting .
    if (level.weight < self.currentLevel.weight) return;

    // first lets concat all user sent args in a single line
    for (var i = 1; i < arguments.length; i ++)
        logline = logline + self._getlinearMsg(arguments[i]) + ' ';

    // remove last Space if any
    logline = logline.slice(0, -1);

    // format the log according to the format
    formatObj = self._getInfoObj(level);
    formatObj.msg = logline;
    formatObj.prefix = level.dispPrefix;

    // final line that goes to the stream
    finalLog = level.logTemplate(formatObj);

    // Add \n in the end after the formatting
    finalLog += '\n';

    level.stream.write(finalLog);
};

// update timestamp for all levels
LGR.prototype.updateTsFormat = function(tsFormat) {
    this._updatePropertyAllLevels('tsFormat', tsFormat);
};

LGR.prototype._updatePropertyAllLevels = function(prop, newVal) {
    var
        self = this;

    Object.keys(self.getLevels()).forEach(function(k){
        self.editLevel(k, prop, newVal);
    });
};



// initiate basic levels
LGR.prototype.basicSettings = function() {
    var self = this;

    /* Add log levels */
    // log.prefixStyle = { fg: 'magenta' }
    // log.headingStyle = { fg: 'white', bg: 'black' }

    self.addLevel('silly', -Infinity, { inverse: true }, 'SILL');
    self.addLevel('verbose', 1000, { fg: 'blue', bg: 'black' }, 'VERB');
    self.addLevel('info', 2000, { fg: 'green' }, 'INFO');
    self.addLevel('log', 2000, { fg: 'green' }, 'INFO');
    self.addLevel('http', 3000, { fg: 'green', bg: 'black' });
    self.addLevel('warn', 4000, { fg: 'black', bg: 'yellow' }, 'WARN');

    self.addLevel('error', 5000, { fg: 'red', bg: 'black' }, 'ERR!', '<%= prefix %> <%=hostname%> <%= ts %> [<%= uptime %>] [<%= count %>] <%= __FILE__ %>:<%= __FUNC__ %>:<%= __LINE__ %>:<%= __COLM__ %> <%= msg %>', process.stderr);
    self.addLevel('critical', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'CRIT!', '<%= prefix %> <%= ts %> <%= ram %> [<%= uptime %>] [<%= count %>] <%= __FILE__ %>:<%= __FUNC__ %>:<%= __LINE__ %>:<%= __COLM__ %> <%= msg %>', process.stderr);

    self.addLevel('silent', Infinity);

    // Set default level info
    self.setLevel('info');
};

module.exports = new LGR();
