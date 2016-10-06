/*jshint multistr: true ,node: true*/
"use strict";

var

    OS                  = require('os'),
    UTIL                = require('util'),
    /* NPM Third Party */
    _                   = require('lodash'),

    // NPMLOG              = require('npmlog'),
    MOMENT              = require('moment'),
    // ANSI                = require('ansi'),
    GLTV                = require('get-lodash-template-vars'),

    /* NPM Paytm */

    /* Project Files */

    bufferedWrite       = require('./bufferedWrite'),


    DEFAULT_LOGFORMAT   = '<%= prefix %> <%= ts %> <%= pid %> [<%= uptime %>] [<%= count %>] <%= msg %>',
    DEFAULT_STREAM      = process.stdout,
    DEFAULT_WEIGHT      = 1000,
    DEFAULT_PREFIX      = 'INFO',
    DEFAULT_STYLE       = {},
    DEFAULT_VARS        = {},
    DEFAULT_TS_FORMAT   = 'YYYY-MM-DD HH:mm:ss',
    DEFAULT_BUFFER_SIZE         = 0,
    DEFAULT_FLUSH_TIME_INTERVAL = 10;


function LGR(opts) {
    var self = this;

    this.count = 0; // Global count , sort of Id for log

    // will be later to set to levels object
    this.levels = {};

    // currnetly set level
    this.currentLevel = null;


    this.basicSettings();

    // set PID and other params
    self.pid        = process.pid;
    self.hostname   = OS.hostname();

    this.__getformatobj = {
        ram : function() {
            /* removing for now from standard format since there is a pending issue which
            says process.memoryusage has problems */
            try { return UTIL.format(process.memoryUsage()); }
            catch(ex) { return '-'; }
        },

        ts  : function(level) {
            return MOMENT().format(level.tsFormat);
        },

        uptime : function() {
            try { return Math.round(process.uptime()); } catch(ex) { return '-'; }
        },

        pid : function() {
            return self.pid;
        },

        count : function() {
            return this.count;
        },

        hostname : function() {
            return self.hostname;
        },

        weight  : function(level) {
            return level.weight;
        }
    };
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
LGR.prototype._getInfoObj = function(level, logFormatObject){
    var
        self            = this,
        callSiteObj     = null;

    // see what is required by the template and fill that only
    for(var i=0; i<level.formatSplits.length; i++) {
        var
            f = level.formatSplits,
            funcName = f[i];

        if(self.__getformatobj.hasOwnProperty(funcName)) {
            logFormatObject[f[i]] = self.__getformatobj[funcName].call(this, level);
        } else { // So that template does not have an entry for which we do not hava a function
            logFormatObject[f[i]] = '-';
        }
    }

    // overwrite stuff filled for stacktrace
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
    return this; // makes it chainable
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
LGR.prototype.addLevel =
    function(levelName, weight, style, dispPrefix, logFormat, stream, tsFormat, vars, bufferSize, flushTimeInterval){
    /*
        1. Lets just register the level
        We cant create streams or ansi cursors here
    */

    var
        self        = this,
        stackTrace  = false;

    if (!levelName ) throw new Error('name missing');
    if (!weight ) throw new Error('weight missing');

    // check if level name can be kept

    if(Object.keys(self).indexOf(levelName) > -1)
        throw new Error('name unacceptable. Either already there or is reserved name');

    // Default fallback values
    style               = style || DEFAULT_STYLE;
    dispPrefix          = dispPrefix || DEFAULT_PREFIX;
    logFormat           = logFormat || DEFAULT_LOGFORMAT;
    stream              = stream || DEFAULT_STREAM; // If stream unspecified , then it is process.stdout
    tsFormat            = tsFormat || DEFAULT_TS_FORMAT;
    vars                = vars || DEFAULT_VARS;
    bufferSize          = bufferSize || DEFAULT_BUFFER_SIZE;
    flushTimeInterval   = flushTimeInterval || DEFAULT_FLUSH_TIME_INTERVAL;


    // Lets parse logformat and see if we need capture stack which is the heavy part
    stackTrace          = self._checkStackTraceReqd(logFormat);

    // trace what is required in log template and we will use those params always
    var logFormatSplits = GLTV(logFormat);

    self.levels[levelName] = {
        'name'              : levelName,
        'weight'            : weight,
        'style'             : style,
        'dispPrefix'        : dispPrefix,
        'stream'            : stream,
        'bufferSize'        : bufferSize,
        'flushTimeInterval' : flushTimeInterval,
        'logFormat'         : logFormat,
        'logTemplate'       : _.template(logFormat),
        'formatSplits'      : logFormatSplits,
        'stackTrace'        : stackTrace,
        'tsFormat'          : tsFormat,
        'vars'              : vars,
    };

    // initialize buffer with stream, buffer size and flush interval
    self.levels[levelName].bufferedWrite = new bufferedWrite(stream, bufferSize, flushTimeInterval);

    // Bind the function
    self[levelName] = function () {
        // insert level as first argument
        var a = new Array(arguments.length + 1);
        a[0] = levelName;
        for (var i = 0; i < arguments.length; i ++) a[i + 1] = arguments[i];
        self._writeLog.apply(self, arguments);
        return self;
    }.bind(self, levelName);

    return self; // makes it chainable
};


// Change a property of level
LGR.prototype.editLevel = function(levelName, prop, newVal) {
    /* weight, style, dispPrefix, logFormat, stream */
    var
        self        =   this,
        level       =   self.levels[levelName],
        opts        =   ['weight', 'style', 'dispPrefix', 'logFormat', 'stream', 'tsFormat', 'vars', 'bufferSize', 'flushTimeInterval'];

    if(level === undefined) throw new Error('wrong level, see getlevels');
    if(opts.indexOf(prop) <=-1) throw new Error('wrong property');

    //set property
    level[prop] = newVal;

    // reset bufferedWrite in case any buffer parameters are changed
    if(['stream', 'bufferSize', 'flushTimeInterval'].indexOf(prop) >= 0) {
        level.bufferedWrite = new bufferedWrite(level.stream, level.bufferSize, level.flushTimeInterval);
    }

    // Lets parse logformat and see if we need capture stack which is the heavy part
    if(prop === 'logFormat') {
        level.stackTrace = self._checkStackTraceReqd(newVal);
        level.logTemplate = _.template(newVal);
        level.formatSplits = GLTV(newVal);
    }
    return this; // makes it chainable
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
        formatObj   = {},
        finalLog    = null,
        argStart    = 1,
        level       = self.levels[lvl];

    // increment count
    self.count++;

    // Don't do anything unless the log is less than the general log setting .
    if (level.weight < self.currentLevel.weight) return;

    // Check if 1st argument is a special opts type arg or not
    if(arguments.length >=1 &&
        arguments[1] &&
        typeof arguments[1] === "object" &&
        arguments[1]._ === true
    ) {
        argStart = 2;
    }

    // first lets concat all user sent args in a single line
    for (var i = argStart; i < arguments.length; i ++)
        logline = logline + self._getlinearMsg(arguments[i]) + ' ';

    // remove last Space if any
    logline = logline.slice(0, -1);


    // Variable filling 1. System
    self._getInfoObj(level, formatObj);
    formatObj.msg = logline;
    formatObj.prefix = level.dispPrefix;

    // Variable fillign 2: Fill the format object with Static variables
    var varKeys = Object.keys(level.vars);
    for(var iv =0; iv < varKeys.length; iv++) {
        formatObj[varKeys[iv]] = level.vars[varKeys[iv]];
    }

    // Variable filling 3 : Dynamic variables
    if(argStart === 2) {
        // delete _ key
        var dynamicVars = arguments[1];
        delete dynamicVars._;

        // Fill the object with Dynamic variables
        var dynKeys = Object.keys(dynamicVars);
        for(var id =0; id < dynKeys.length; id++) {
            formatObj[dynKeys[id]] = dynamicVars[dynKeys[id]];
        }
    }

    // final line that goes to the stream
    finalLog = level.logTemplate(formatObj);

    // Add \n in the end after the formatting
    finalLog += '\n';

    self.levels[lvl].bufferedWrite.write(finalLog);
};

// update timestamp for all levels
LGR.prototype.updateTsFormat = function(tsFormat) {
    this._updatePropertyAllLevels('tsFormat', tsFormat);
    return this; // makes it chainable
};

// update vars for all levels
LGR.prototype.updateVars = function(vars) {
    this._updatePropertyAllLevels('vars', vars);
    return this; // makes it chainable
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
    self.addLevel('critical', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'CRIT!', '<%= prefix %> <%= ts %> [<%= uptime %>] [<%= count %>] <%= __FILE__ %>:<%= __FUNC__ %>:<%= __LINE__ %>:<%= __COLM__ %> <%= msg %>', process.stderr);

    self.addLevel('silent', Infinity);

    // Set default level info
    self.setLevel('info');
};

module.exports = new LGR();
