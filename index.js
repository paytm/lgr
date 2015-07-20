/*jshint multistr: true ,node: true*/
"use strict";

var

    /* NPM Third Party */
    _                   = require('lodash'),
    NPMLOG              = require('npmlog'),
    MOMENT              = require('moment');
    
    /* NPM Paytm */
    
    /* Project Files */

/*

    Change the Default stream to STDOUT instead of STDERR

    SA : I have no idea why this was STDOUT to begin with?
*/

function LGR() {
    this.NPMLOG = NPMLOG;

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
        arguments[0] = MOMENT().format("YYYY-MM-DD HH:MM:SS.sss") + ' ' + arguments[0];
        return this.NPMLOG[k].apply(this, arguments);
    };
});


module.exports = new LGR();
