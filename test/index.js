/*jshint multistr: true ,node: true, mocha: true*/
"use strict";


var
    should              = require('should'),
    assert              = require('assert'),
    _                   = require("lodash"),
    OS                  = require("os"),
    M                   = require('moment'),
    PATH                = require('path'),
    LOG                 = require('../index.js');


describe('All params except Message', function() {

    var testStream = null;
    before(function(done) {
        testStream = require('./testStream.js');
        done();
    });

    it("Add level", function(done) {
        LOG.addLevel('test', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '{  "prefix" : "<%= prefix %>" ,"hostname" : "<%= hostname %>" ,"ts" : "<%= ts %>" ,"uptime" : <%= uptime %> ,"count" : <%= count %> ,"__FILE__" : "<%= __FILE__ %>" ,"__FUNC__" : "<%= __FUNC__ %>" ,"__LINE__" : <%= __LINE__ %> ,"__COLM__" : <%= __COLM__ %> }', testStream);

        done();
    });

    it("Checking all params", function(done) {

        // output test
        testStream.testcb = function(data){

            // console.log(data);

            var j = JSON.parse(data);

            j.prefix.should.equal('TEST!');
            j.hostname.should.equal(OS.hostname());

            var parsedDt = M(j.ts, "YYYY-MM-DD HH:mm:ss", true);
            parsedDt.isValid().should.equal(true);
            assert((new M() - parsedDt) >= 0);

            j.should.have.property('uptime').which.is.a.Number();
            // assert(j.uptime >= 0);

            j.count.should.equal(1);
            j.__FILE__.should.equal(PATH.join(__dirname, '../index.js'));
            j.__FUNC__.should.equal('(anon)');
            j.should.have.property('__LINE__').which.is.a.Number();
            j.should.have.property('__COLM__').which.is.a.Number();

            done();
        };

        LOG.test('dont matter what goes here');

    });

});


describe('Testing all types of messages', function() {

    var testStream = null;
    before(function(done) {
        testStream = require('./testStream.js');
        done();
    });

    it("Edit level", function(done) {
        LOG.editLevel('test', 'logFormat', '<%= msg %>');
        LOG.editLevel('test', 'stream', testStream);
        done();
    });



    var sets = [


        // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
        // numbers
        [ 37 , "37"],
        [ 3.14 , "3.14"],
        [ Math.LN2 , "0.6931471805599453"],
        [Infinity, 'Infinity'],
        [-Infinity, '-Infinity'],
        [NaN, 'NaN'],
        [Number(1), '1'],

        //string
        ["", ""],
        ["1234567890", "1234567890"],
        ["qwertyuiopasdfghjklzxcvbnm", "qwertyuiopasdfghjklzxcvbnm"],
        ["QWERTYUIOPASDFGHJKLZXCVBNM", "QWERTYUIOPASDFGHJKLZXCVBNM"],
        [" ", " "],
        ["`~!@#$%^&*()-=_+[]\\{}|;':\",./<>?", "`~!@#$%^&*()-=_+[]\\{}|;':\",./<>?"],
        [typeof 1, "number"],
        [typeof "abc", "string"],
        [String("abc"), "abc"],

        // boolean checks
        [true, "true"],
        [false,"false"],
        [Boolean(true), "true"],

        // undefined
        [undefined, "undefined"],
        [null, "null"],
        // objects
        [{}, '{}'],
        [[], '[]'],
        [{a:1}, '{ a: 1 }'],
        [{a:{ b: { c: { d : { e : {f : {g : { h : 1}}}}}}}}, '{ a: { b: { c: { d: { e: { f: { g: { h: 1 } } } } } } } }'],
        [[1, 2, 4], '[ 1, 2, 4 ]'],

        // functions
        [function a(){}, '[Function: a]'],
        [Math.sin , '[Function: sin]'],
        [function b(){ var i=0; i++; } , '[Function: b]'],

        //regex
        [/s/, '/s/'],

    ];

    var output = [];

    it("Checking for static sets ", function(done) {
        testStream.testcb = function(data){
            output.push(data);
        };

        // firing logs
        for(var iset = 0; iset < sets.length; iset ++) {
            LOG.test(sets[iset][0]);
        }

        // assert output 1 by 1
        for(var icheck = 0; icheck < sets.length; icheck ++) {
            LOG.test(sets[icheck][0]);

            var result = _.isEqual(sets[icheck][1] + '\n', output[icheck]);
            if(result === false) console.log("This is failing", icheck, sets[icheck][1], output[icheck]);
            assert(result === true);
        }
        done();
    });

    it("Checking for Error type", function(done) {
        testStream.testcb = function(data){
            should.exist(data);

            // should not be
            data.should.not.equal('[Error: Hi]');

            done();
        };

        LOG.test(new Error("Hi"));
    });

});


describe('Misc', function() {

    var testStream = null;
    before(function(done) {
        testStream = require('./testStream.js');
        done();
    });

    it("undefined set level", function(done) {
        try {
            LOG.setLevel('wrong');
        }
        catch(ex) {
            ex.message.should.equal("unknown level wrong");
            done();
        }
    });

    it("undefined add level", function(done) {
        try {
            LOG.addLevel();
        }
        catch(ex) {
            ex.message.should.equal("name missing");
            done();
        }
    });

    it("undefined add level weight", function(done) {
        try {
            LOG.addLevel('new');
        }
        catch(ex) {
            ex.message.should.equal("weight missing");
            done();
        }
    });

    it("undefined set level name", function(done) {
        try {
            LOG.editLevel('wrongkey');
        }
        catch(ex) {
            ex.message.should.equal("wrong level, see getlevels");
            done();
        }
    });

    it("undefined set level property", function(done) {
        try {
            LOG.editLevel('info', 'wrong prop', null);
        }
        catch(ex) {
            ex.message.should.equal("wrong property");
            done();
        }
    });


    it("print low level log", function(done) {
        LOG.setLevel('info');
        LOG.verbose('verbose, should not print!!!');

        done();
    });


    it("get levels", function(done) {

        assert(LOG.getLevel() === 'info');
        JSON.stringify(LOG.getLevels()).should.equal('{"silly":null,"verbose":1000,"info":2000,"log":2000,"http":3000,"warn":4000,"error":5000,"critical":6000,"silent":null,"test":6000}');

        done();
    });


});


