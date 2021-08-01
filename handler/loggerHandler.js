const log = require('simple-node-logger').createSimpleLogger({
  errorEventName:'error',
      logFilePath:'./log/bot.log',
      fileNamePattern:'serverlog-<DATE>.log',
      dateFormat:'YYYY.MM.DD'
});

module.exports = {
  log,
}