[![Build Status](https://travis-ci.org/paytm/lgr.svg?branch=master)](https://travis-ci.org/paytm/lgr)

# lgr
Generic Logger

Idea is to give best of Winston, Bunyan and npmlog ( https://github.com/npm/npmlog )

## Usage
Eactly like npmlog , but giving a snippet here
```
 // Use 1 logger through application
 var log = require('lgr')

 // when in debug set Debug level 
 log.level = 'verbose'

log.info('gateway', 'Check', null)
```

You can set log format

```
// possible options are "ram" , "ts" "uptime" "pid", "count",
// and "__FUNC__", "__FILE__", "__LINE__", "__COLM__". C Forever. :D
log.setLogFormat('<%= ts %> [<%= uptime %>] ');
```

You can set Log level
```
log.setLevel('verbose');
```

You can get the current level
```
log.getLevel();
// -> now returns 'verbose'
```

You can query the levels you can `setLevel` to
```
log.getLevels();
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
```

You can Redirect outout / error to log files
```
log.setOut('/path/of/file/to/write/info/messages')

// to redirect back to console
log.setOut()

log.setErr('/path/of/file/to/write/Error/messages')

// to redirect back to STDERR
log.setErr()
```

## Features
- All of npmlog as of now
- A starting timestamp when logger was initiated. Gives 2 timestamps , one global and another the starting timestamp of the process.
- The Extra information in Logs is thrown out in Formatted Strings like Nginx Logs


## ToDo and improvements

- Should have support for identifying CALLing Function/ line number
- Should have support for Prefixing Filename/ function name, line number automatically
- Should be able to handle StackTrace gracefully and show properly.
- Should have Sync and Buffer Modes Also
- Should not raise a problem if objects passed to it are not available etc. 
- Should have Child Loggers like Bunyan where loggers get chained and scoped
- Should be able to handle "TypeError: Converting circular structure to JSON"
- Should be able to provide plugin support for SLACK, e-Mail . Same log should go to STDOUT/ERR + Plugin.
- Not Very important : Later on : Should be able to give Json type ingested Logs
- Not Very Important: Probably a http server interface to see logs in case of Debug like http://bluejamesbond.github.io/Scribe.js/

## ChangeLog
See Tags

## Test
Just run test.js

