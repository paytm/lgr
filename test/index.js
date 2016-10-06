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
        // allocating buffer of random size between 0(inclusive) to 10(inclusive) bytes
        // setting flush time interval of 100 ms
        LOG.addLevel('test', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '{  "prefix" : "<%= prefix %>" ,"hostname" : "<%= hostname %>" ,"ts" : "<%= ts %>","weight" : <%= weight %>, "pid" : <%= pid %> ,"uptime" : <%= uptime %> ,"count" : <%= count %> ,"__FILE__" : "<%= __FILE__ %>" ,"__FUNC__" : "<%= __FUNC__ %>" ,"__LINE__" : <%= __LINE__ %> ,"__COLM__" : <%= __COLM__ %> }', testStream, null, null, Math.floor(Math.random()*10), 100);

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
            assert(parsedDt.isValid() === true, 'ts not valid date');
            assert((new M() - parsedDt) >= 0, 'Date looks negative');

            j.should.have.property('uptime').which.is.a.Number();
            assert(j.uptime >= 0);

            j.should.have.property('pid').which.is.a.Number();
            assert(j.pid >= 0);

            // weight
            j.weight.should.equal(6000);

            j.count.should.equal(1);
            j.__FILE__.should.equal(__filename);
            j.__FUNC__.should.equal('(anon)');
            j.should.have.property('__LINE__').which.is.a.Number();
            j.should.have.property('__COLM__').which.is.a.Number();

            done();
        };

        LOG.test('dont matter what goes here');

    });


    it("change tsformat", function(done) {

        // output test
        testStream.testcb = function(data){

            // console.log(data);

            var j = JSON.parse(data);

            var parsedDt = M(j.ts, "x", true);
            assert(parsedDt.isValid() === true, 'ts not valid date');
            assert((new M() - parsedDt) >= 0, 'Date looks negative');

            done();
        };

        LOG.updateTsFormat('x');
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

        // Very Big Object
        [[ { message_id: '248171',
            timestamp: 1464078932241,
            product_info:
             { id: 423452354,
               weight: 250,
               volume: {},
               ff_mode: 1,
               ff_service_id: 0,
               price: 292,
               seed_ids: '',
               rpc_ids: '',
               categories: '2345, 2345, 234,5 2,34 5,2345,23,45 ,23 45,2 3452345234,5 2,3 45,2345',
               vertical_id: 19 },
            packet_info:
             { id: 248171,
               weight: 250,
               volume: {},
               ff_mode: 1,
               ff_service_id: 0,
               price: 292,
               seed_ids: '',
               rpc_ids: '',
               categories: '2345, 2345, 234,5 2,34 5,2345,23,45 ,23 45,2 3452345234,5 2,3 45,2345',
               vertical_id: 19 },
            merchant_info: { id: 123, pincode: '12312354', non_lmd: 34 },
            customer_info: { pincode: '12341235' },
            threshold_info:
             { shipper_threshold: 25000,
               shipper_order_count: 0,
               min_prepaid_invoice_limit: 0,
               min_cod_invoice_limit: 0,
               max_prepaid_invoice_limit: 50000,
               max_cod_invoice_limit: 10000,
               total_order_count: 0 },
            shipper_info:
             { id: '1',
               type: '1234',
               name: '234r34fgwrebvwregvwrg',
               shipper_mode: 0,
               priority: 100,
               business_priority: 8,
               is_prepaid: 1,
               is_cod: 0,
               is_reverse: 0,
               is_dg: 0,
               is_air: 1,
               is_surface: 0 },
            source_info:
             { pincode: 34254425,
               city: 'sdfsdfg',
               state: 'sefgbwetr',
               region: 'waertg',
               zone: 'gwrtbwr',
               state_capital: 1,
               latitude: 24.5245345345,
               longitude: 3.555,
               id: 'sdfv' },
            destination_info:
             { pincode: 1321342,
               city: 'vsdfvsdfv',
               state: 'adfvadfv',
               region: 'aefv',
               zone: 'asdf',
               state_capital: 1,
               latitude: 2.444,
               longitude: 22.444 },
            route_info: { destination_route: 5, route_score: 0, distance_in_metres: -1 },
            order_info: { is_cod: 0, is_prepaid: 1 },
            warehouse_info: {},
            is_cod_applicable: 0,
            cache_hit: 0,
            action_info:
             { hyperlocal_score: '0',
               result_invoice_value_pincode: '1',
               result_invoice_value_state: '1',
               result_invoice_value_state_courier: '1',
               is_negative_courier_destination: '0',
               result_negative_pincode_courier_source: '1',
               result_negative_merchant: '1',
               result_negative_merchant_courier: '1',
               result_negative_merchant_seed: '1',
               result_negative_pincode_destination: '1',
               result_negative_pincode_source: '1',
               result_negative_product_id: '1',
               performance_score: '0',
               result_final_elimination_assessment: '1',
               result_final_relevance_assessment: 912782.5523190564,
               result_invoice_value_courier: '1',
               result_negative_courier_destination: '0',
               result_negative_merchant_ff_service: '1',
               result_shipment_mode_dangerous_good: '1',
               result_shipment_mode_high_weight: '1',
               result_shipment_mode_surface_category: '1',
               shipper_capacity: '0',
               result_negative_pincode_courier_destination: '1',
               result_negative_seed: '1',
               final_score: 912782.5523190564,
               is_shipment_mode_dangerous_good: '0',
               is_shipment_mode_high_weight: '0',
               is_shipment_mode_surface_category: '0',
               result_seed_invoice_value_limit: '1',
               result_courier_category: '1',
               result_negative_courier_seed: '1',
               is_prepaid_invoice_limit: '0',
               is_cod_invoice_limit: '0',
               is_positive_facility: '1',
               result_final_relevance_assessment_equation: '1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf ',
               final_score_equation: '(qwefqrgvq' } }],


                "[ { message_id: '248171',    timestamp: 1464078932241,    product_info:      { id: 423452354,       weight: 250,       volume: {},       ff_mode: 1,       ff_service_id: 0,       price: 292,       seed_ids: '',       rpc_ids: '',       categories: '2345, 2345, 234,5 2,34 5,2345,23,45 ,23 45,2 3452345234,5 2,3 45,2345',       vertical_id: 19 },    packet_info:      { id: 248171,       weight: 250,       volume: {},       ff_mode: 1,       ff_service_id: 0,       price: 292,       seed_ids: '',       rpc_ids: '',       categories: '2345, 2345, 234,5 2,34 5,2345,23,45 ,23 45,2 3452345234,5 2,3 45,2345',       vertical_id: 19 },    merchant_info: { id: 123, pincode: '12312354', non_lmd: 34 },    customer_info: { pincode: '12341235' },    threshold_info:      { shipper_threshold: 25000,       shipper_order_count: 0,       min_prepaid_invoice_limit: 0,       min_cod_invoice_limit: 0,       max_prepaid_invoice_limit: 50000,       max_cod_invoice_limit: 10000,       total_order_count: 0 },    shipper_info:      { id: '1',       type: '1234',       name: '234r34fgwrebvwregvwrg',       shipper_mode: 0,       priority: 100,       business_priority: 8,       is_prepaid: 1,       is_cod: 0,       is_reverse: 0,       is_dg: 0,       is_air: 1,       is_surface: 0 },    source_info:      { pincode: 34254425,       city: 'sdfsdfg',       state: 'sefgbwetr',       region: 'waertg',       zone: 'gwrtbwr',       state_capital: 1,       latitude: 24.5245345345,       longitude: 3.555,       id: 'sdfv' },    destination_info:      { pincode: 1321342,       city: 'vsdfvsdfv',       state: 'adfvadfv',       region: 'aefv',       zone: 'asdf',       state_capital: 1,       latitude: 2.444,       longitude: 22.444 },    route_info: { destination_route: 5, route_score: 0, distance_in_metres: -1 },    order_info: { is_cod: 0, is_prepaid: 1 },    warehouse_info: {},    is_cod_applicable: 0,    cache_hit: 0,    action_info:      { hyperlocal_score: '0',       result_invoice_value_pincode: '1',       result_invoice_value_state: '1',       result_invoice_value_state_courier: '1',       is_negative_courier_destination: '0',       result_negative_pincode_courier_source: '1',       result_negative_merchant: '1',       result_negative_merchant_courier: '1',       result_negative_merchant_seed: '1',       result_negative_pincode_destination: '1',       result_negative_pincode_source: '1',       result_negative_product_id: '1',       performance_score: '0',       result_final_elimination_assessment: '1',       result_final_relevance_assessment: 912782.5523190564,       result_invoice_value_courier: '1',       result_negative_courier_destination: '0',       result_negative_merchant_ff_service: '1',       result_shipment_mode_dangerous_good: '1',       result_shipment_mode_high_weight: '1',       result_shipment_mode_surface_category: '1',       shipper_capacity: '0',       result_negative_pincode_courier_destination: '1',       result_negative_seed: '1',       final_score: 912782.5523190564,       is_shipment_mode_dangerous_good: '0',       is_shipment_mode_high_weight: '0',       is_shipment_mode_surface_category: '0',       result_seed_invoice_value_limit: '1',       result_courier_category: '1',       result_negative_courier_seed: '1',       is_prepaid_invoice_limit: '0',       is_cod_invoice_limit: '0',       is_positive_facility: '1',       result_final_relevance_assessment_equation: '1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf 1234e123r q3efqnerifnqjerfiq3hfq3h84f9uhqb3ibeuf9uq2hef9uqf ',       final_score_equation: '(qwefqrgvq' } } ]"],

    ];

    var logOutput = '';

    it("Checking for static sets ", function(done) {
        testStream.testcb = function(data){
            logOutput += data;
        };

        var expectedOutput = '';

        for(var iset = 0; iset < sets.length; iset ++) {
    
            expectedOutput += sets[iset][1] + '\n';
    
            // firing logs
            LOG.test(sets[iset][0]);
        }

        /*
            setTimeout used in order to wait for buffer to 
            flush automatically after certain interval.
            This is necessary to detect logs which were fired last 
            and would still be in buffer.

            Note: Time interval here should be >= Time interval set for flushing buffer.
        */
        setTimeout(function(){
             assert.equal(logOutput, expectedOutput);
             done();
        },100);

    });


    it("Checking time based flushing of buffer ", function(done) {
        // setting buffer size = 3 bytes
        LOG.addLevel('testBuffer', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '<%= msg%>', testStream, null, null, 3, 500);

        var 
            smallOutput = '',
            testString  = 's';

        testStream.testcb = function(data){
            smallOutput += data;
        };

        // firing log
        LOG.testBuffer(testString);


        // since size of buffer is 3 bytes and test string is 1 byte, output should not be written immediately
        assert.equal(smallOutput, '');

        /*
            setTimeout used in order to wait for buffer to 
            flush automatically after certain interval.
            Note: Time interval here should be >= Time interval set for flushing buffer.
        */
        setTimeout(function(){
             assert.equal(smallOutput, testString + '\n');
             done();
        },500);

    });


    it("Checking for Error type", function(done) {
        testStream.testcb = function(data){
            should.exist(data);

            // should not be
            data.should.not.equal('[Error: Hi]\n');

            done();
        };

        LOG.test(new Error("Hi"));
    });

    it("Circular Json test case", function(done) {
        testStream.testcb = function(data){
            data.should.equal('{ b: [Circular] }\n');
            done();
        };

        var a = {};
        a.b = a;
        LOG.test(a);
    });
});

describe('Call Stack', function () {

    var testStream = null;
    before(function(done) {
        testStream = require('./testStream.js');
        done();
    });

    it('Has correct __FILE__ and __FUNC__', function (done) {
        LOG.editLevel('critical', 'logFormat', '{"__FUNC__" : "<%= __FUNC__ %>", "__FILE__" : "<%= __FILE__ %>" }');
        LOG.editLevel('critical', 'stream', testStream);

        testStream.testcb = function (data) {
            var j = JSON.parse(data);
            j.__FUNC__.should.be.equal('existential');
            j.__FILE__.should.be.equal(__filename);
            done();
        };

        function existential() {
            LOG.critical('Main aisa kyun hun?');
        }

        existential();
    });
});

describe('test chainables', function () {

    var testStream = null;
    before(function(done) {
        testStream = require('./testStream.js');
        done();
    });

    it('test chainable', function (done) {
         var i = 3;
         var totaldata = '';
        testStream.testcb = function (data) {
            totaldata+=data;

            if(--i === 0) {
              totaldata.should.be.equal('part 1 chain\npart 2 chain\npart 3 chain\n');
              done();
            }
        };

        LOG.test('part 1 chain').test('part 2 chain').test('part 3 chain');
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
        JSON.stringify(LOG.getLevels()).should.equal('{"silly":null,"verbose":1000,"info":2000,"log":2000,"http":3000,"warn":4000,"error":5000,"critical":6000,"silent":null,"test":6000,"testBuffer":6000}');

        done();
    });

     it("level name wrong", function(done) {
        try {
          LOG.addLevel('info', 2000);
        } catch (ex) {
          assert(ex.message, "name unacceptable. Either already there or is reserved name");
          done();
        }

    });

});




describe('Test variables which are not in format', function() {

    var testStream = null;
    before(function(done) {
        testStream = require('./testStream.js');
        done();
    });

    it("wrong variable", function(done) {
        LOG.addLevel('test_wrong', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '<%= wrong_var %>', testStream);

        testStream.testcb = function(data){

            // console.log("data#",data,"#");

            data.should.equal('-\n');

            done();
        };

        LOG.test_wrong('dont matter what goes here');
    });


});



describe('Static and dynamic variables', function() {

    var testStream = null;
    before(function(done) {
        testStream = require('./testStream.js');
        done();
    });

    it("static variables", function(done) {
        LOG.addLevel('test_static', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '<%= var1 %>', testStream);
        LOG.updateVars({ var1 : 'var1_val'});

        testStream.testcb = function(data){

            // console.log("data#",data,"#");

            data.should.equal('var1_val\n');

            done();
        };

        LOG.test_static('dont matter what goes here');
    });

    it("dynamic variables using", function(done) {
        LOG.addLevel('test_dynamic', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '<%= var1 %> <%= msg %>', testStream);

        testStream.testcb = function(data){

            // console.log("data#",data,"#");

            data.should.equal('var1_val testing\n');
            done();
        };

        LOG.test_dynamic({_: true, 'var1': 'var1_val'},'testing');
    });

    it("Same variable everywhere, check precedence part 1", function(done) {
        LOG.addLevel('test_mix', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '<%= pid %> <%= msg %>', testStream);
        LOG.updateVars({ pid : '12345'});

        testStream.testcb = function(data){

            // console.log("data#",data,"#");

            data.should.equal('12345 testing\n');
            done();
        };

        LOG.test_mix('testing');
    });

    it("Same variable everywhere, check precedence part 2", function(done) {
        LOG.addLevel('test_mix2', 6000, {  fg : 'red', 'bg' : 'yellow'  }, 'TEST!', '<%= pid %> <%= msg %>', testStream);
        LOG.updateVars({ pid : '12345'});

        testStream.testcb = function(data){

            // console.log("data#",data,"#");

            data.should.equal('override testing\n');
            done();
        };

        LOG.test_mix2({_: true, 'pid': 'override'},'testing');
    });


});
