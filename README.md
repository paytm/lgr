# lgr
Generic Logger

[![Build Status](https://travis-ci.org/paytm/lgr.svg?branch=master)](https://travis-ci.org/paytm/lgr)
[![Coverage Status](https://coveralls.io/repos/github/paytm/lgr/badge.svg?branch=master)](https://coveralls.io/github/paytm/lgr?branch=master)

Idea is to give best of Winston, Bunyan and [npmlog](https://github.com/npm/npmlog)

## Usage
Eactly like npmlog , but giving a snippet here
```
// Use 1 logger throughout application
var log = require('lgr');

// App invoked with -v ? set verbose level
log.setLevel('verbose');

log.info('gateway', 'Check', null);
```


### log levels
For each log level name and priority are mandatory arguments.
*Mandatory args*
 - name
 - priority

*Optional args*
 - Style ( default info style )
 - Stream ( default process.stdout)
 - LogFormat ( default )
 - tsFormat (default YYYY-MM-DD HH:mm:ss)
 - vars : Fixed variables

```
log.setLevel('verbose'); // set level 

log.getLevel();
// -> now returns 'verbose'

log.getLevels(); // You can query the levels you can `setLevel` to
/*
Returns:
{ silly: -Infinity,
  verbose: 1000,
  info: 2000,
  http: 3000,
  warn: 4000,
  error: 5000,
  silent: Infinity,
  critical: 6000 }
*/

log.addLevel('wall', 3500); // Add custom levels
log.addLevel('hell',                            // levelName         -> for convenience
            6000,                               // weight
            {  fg : 'red', 'bg' : 'yellow'  },  // style             -> for dev ansi
            'hell!',                            // dispPrefix        -> prefix
            '<%= prefix %> <%= ts %> <%= ram %> [<%= uptime %>] [<%= count %>] <%= __FILE__ %>:<%= __FUNC__ %>:<%= __LINE__ %>:<%= __COLM__ %> <%= msg %>', 
                                                // logFormat         -> lodash.template
            process.stderr,                     // stream            -> any WritableStream
            'X',                                // tsFormat          -> for MOMENT().format()
            {},                                 // vars              -> for special variables
            4096,                               // bufferSize        -> in bytes
            1000                                // flushTimeInterval -> in msec
);


// Edit level setting : done by same function call
// log.editLevel(levelName, property, value) , properties are ['weight', 'style', 'dispPrefix', 'logFormat', 'stream']

log.editLevel('info', 'stream', someStream)

```

### log Formats
Variables
 - prefix : info, error , etc. from log level
 - msg : The message that was passed to log


 - ram : will give memory usage from process.memoryusage
    Note : Removing ram from default format, since there is a pending issue in nodejs which makes process.memoryusage leave zombie FDs

 - ts : current timestamp
 - uptime : uptime of process
 - pid : process id
 - count : Log count , global for this process
 - hostname : system hostname
 - weight : Log level weight
 - __FUNC__ : will invoke stacktrace and last visited function of code
 - __FILE__ : will invoke stacktrace and last visited file at this log
 - __LINE__ : will invoke stacktrace and last visited line at this log
 - __COLM__ : will invoke stacktrace and show column number.

```
log.editLevel('info', 'logFormat', '<%= ts %> [<%= uptime %>] ')

```

## Variables
Variables can be used in log formats. Some variables are system variables while others are user defined.

There are 2 ways to write variables. 
1. Statically supply variables for a all or some log levels which will be in all logs.
2. Send variables as 1st argument of the log. The 1st argument should be object with a special key _ = true set. NOTE: The object wont be printed in log.
```
// will update static variables for all log levels
log.updateVars('vars' , { var1 : 'var1'})

// will update static variables for a single levels
log.editLevel('vars' , { var1 : 'var1'})

// send opts argument
log.info({ 'var1' : 'var1', _ : true}, 'Test log');
```

NOTE : Order of variables writing : 1. system variables , 2. Static variables, 3. Dynamic variables. Hence if 1 variable like pid is specific in all 3, dynamic variable will have highest precedence

## Colors
 - Only Prefix colors can be user controlled.
 - Different color for system generated information.
 - The user specified data is in white.

## timestamp format
To change timeformat for each level please change by `editLevel` 
To change timeformat for all levels throughout 
```
log.updateTsFormat('YYYY-MM-DD HH:MM:SS.sss');

// These formats are MOMENT JS supported. You can leave it '' to use ISO format.
```

NOTE : `updateTsFormat`  actually gets all levels and overwrite the timestamp for each level.

## child loggers
Currently child loggers are implemented as flat level hierarchy. Where for a specific config we maintain a different level altogether

## Theory , design decisions
- Decision to not incorporate file saving, logs in rabbitmq and to use streams instead comes from the learning of winston which incorporate transport system. this is designed to be leightweight and users must implement their own stream to make use of log outouts.
- Decision to keep things sync for obvious ease of usage

## ToDo and improvements : See Github Issues

## ChangeLog : See Tags

## Test
Just run 'npm test'
