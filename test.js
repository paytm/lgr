/*jshint multistr: true ,node: true, mocha: true*/
"use strict";

var
    _                   = require("lodash"),
    PATH                = require('path'),
    LOG                 = require('./index.js');


/*

    Currently there are no mocha type Test cases since most of these tests should work if are not crashing
    And since Travis and manually running these cases can detect crash , do this works.

*/

LOG.level = 'verbose';                      // Not to be confused, doesn't set the level. See the silly logs below.
LOG.info('TEST', 'LEVEL', LOG.getLevel());

LOG.setOut();
LOG.info('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

LOG.setLogFormat('<%= ts %> [<%= uptime %>] ');

LOG.setLevel('verbose');
LOG.info('TEST', 'LEVEL', LOG.getLevel());

LOG.setErr();
LOG.error('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

LOG.setLogFormat('In: <%= __FUNC__ %>() At: <%= __FILE__ %>:<%= __LINE__ %>: ');
function testFunction () {
    LOG.info('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});
    LOG.error('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});
}

testFunction();

LOG.info('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});
LOG.error('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

LOG.level = 'silly';
LOG.silly('SILL', "Yaara silly silly");
LOG.info('SILL', 'LEVEL', LOG.getLevel());
LOG.setLevel('silly');
LOG.silly('SILL', "O Yaara silly silly");
LOG.info('SILL', 'LEVEL', LOG.getLevel());

LOG.silly('TEST', "Levels:", LOG.getLevels());

LOG.setOut(PATH.join(__dirname, 'testout.log'));
LOG.info('TEST in file', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

LOG.setErr(PATH.join(__dirname, 'testerror.log'));
LOG.error('TEST in file', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});
