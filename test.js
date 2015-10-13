/*jshint multistr: true ,node: true*/
"use strict";


var
    PATH    = require('path'),
    LOG     = require('./index.js');


LOG.level = 'verbose';

LOG.setOut();
LOG.info('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

LOG.setLogFormat('<%= ts %> [<%= uptime %>] ');

LOG.setLevel('verbose');

LOG.setErr();
LOG.error('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});


LOG.setOut(PATH.join(__dirname, 'testout.log'));
LOG.info('TEST in file', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

LOG.setErr(PATH.join(__dirname, 'testerror.log'));
LOG.error('TEST in file', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

