/*jshint multistr: true ,node: true, mocha: true*/
"use strict";

var
    _                   = require("lodash"),
    should              = require("should"),
    PATH                = require('path'),
    LOG                 = require('./index.js');

before(function (done) {
});


// describe("State Change Test Suite", function () {
//     it ("Should give me a transition id ", function (done) {
//         stateLib.getTransition(function (error, transition_id) {

//             should.not.exist(error);
//             should(transition_id).be.exactly('12');
//             done();

//         }, "merchant", 100000, 8);
//     });

//     it ("Should not give me a transition id ", function (done) {
//         stateLib.getTransition(function (error, transition_id) {

//             should.not.exist(error);
//             should(transition_id).be.exactly(null);

//             done();
//         }, "merchant", 100000, 6000);
//     });

//     // Sushant : Add a test for invalid TRANSACTION ID
// });

LOG.level = 'verbose';                      // Not to be confused, doesn't set the level. See the silly logs below.
LOG.info('TEST', 'LEVEL', LOG.getLevel());

LOG.setOut();
LOG.info('TEST', 'Check', null, [], [ 1,2,'a',], {}, undefined, { 'a' : 1 , 'b' : 2}, function(){});

LOG.setLogFormat('<%= ts %> [<%= uptime %>] ');

LOG.setLevel('verbose');
LOG.info('TEST', 'LEVEL', LOG.getLevel());

LOG.setErr();
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

var a = null;
a.length;
