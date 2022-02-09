const { loadArgs, getLogFileName} = require('../lib/utils')
const Logger = require("../lib/logger");

const args = loadArgs()
const debug = args['d']
const ids = args['ids']
let logFile = getLogFileName()
const logger = new Logger(logFile, Boolean(debug))

console.log(ids)
