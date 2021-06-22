/**
 * Created by Henry Huang on 2021/6/22.
 */
const fs = require('fs')
const moment = require('moment')

class Logger {

  constructor(logFile, enabled) {
    this.logFile = logFile
    this.enabled = enabled
  }

  log(name, logData) {
    if (this.enabled) {
      let log = `[${moment().format('YYYY-MM-DD HH:mm:ss:SSS')}] ${name} \n`
      if (logData) {
        if (typeof logData === 'object' || typeof logData === 'array') {
          log = log + JSON.stringify(logData, null, 2)
        } else {
          log = log + logData
        }
        log = log + '\n'
      }
      fs.appendFileSync(this.logFile, log);
    }
  }
}

module.exports = Logger
