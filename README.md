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

## Features
- All of npmlog as of now


## ToDo and improvements

- Add a starting timestamp when logger was initiated. Gives 2 timestamps , one global and another the starting timestamp of the process.
- Somehow accept log as type of log level . Currently throws error. should gracefully go to info
- Should be able to add timestamp in a generic manner , currently adding in info , verbose and error . Should have an option for that
- Should have support for identifying CALLing Function/ line number
- Should have support for Prefixing Filename/ function name, line number automatically
- Should have support for Profiling information also like PID, Process Memory.
- The Extra information in Logs should be thrown out in Formatted Strings like Nginx Logs
- Should be able to handle StackTrace gracefully and show properly.
- Should be able to handle Multiple objects just like in console
- Should have Sync and Buffer Modes Also
- Should not raise a problem if objects passed to it are not available etc. 
- Should have Child Loggers like Bunyan where loggers get chained and scoped
- Should be able to handle "TypeError: Converting circular structure to JSON"
- Should be able to provide plugin support for SLACK, e-Mail . Same log should go to STDOUT/ERR + Plugin.
- Should be able to have give colorful logs in Debug
- Should be able to turn on Verbosity/Debug very easily by single command
- Not Very important : Later on : Should be able to give Json type ingested Logs
- Not Very Important: Probably a http server interface to see logs in case of Debug like http://bluejamesbond.github.io/Scribe.js/

## ChangeLog
0.0.1 
``` Init ```

