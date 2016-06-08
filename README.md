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
log.addLevel('hell', 6666, {fg: 'black', bg: 'red'}, 'HELL!', process.stderr); 
```

### log Formats
Variables
 - prefix : info, error , etc. from log level
 - msg : The message that was passed to log
 - ram : will give memory usage from process.memoryusage
 - ts : current timestamp
 - uptime : uptime of process
 - pid : process id
 - count : Log count , global for this process
 - hostname : system hostname
 - __FUNC__ : will invoke stacktrace and last visited function of code
 - __FILE__ : will invoke stacktrace and last visited file at this log
 - __LINE__ : will invoke stacktrace and last visited line at this log
 - __COLM__ : will invoke stacktrace and show column number.

```
// and "__FUNC__", "__FILE__", "__LINE__", "__COLM__". C Forever. :D
log.setLogFormat('<%= ts %> [<%= uptime %>] ');

//you can also set log formats for specific log levels
log.setLogFormat('info','<%= ts %>');
```

## Colors
 - Only Prefix colors can be user controlled.
 - Different color for system generated information.
 - The user specified data is in white.

## Features
- Priority based log levels.
- Streams can be tied to each level making it easier to redirect log anywhere.
- User defined formatted logs with os specific and stack information.

## Theory , design decisions
- Decision to not incorporate file saving, logs in rabbitmq and to use streams instead comes from the learning of winston which incorporate transport system. this is designed to be leightweight and users must implement their own stream to make use of log outouts.

## ToDo and improvements : See Github Issues

## ChangeLog : See Tags

## Test
Just run 'npm test'
