/**
 * Created by Henry Huang on 2022/2/18.
 */
const { loadArgs, getLogFileName } = require('../lib/utils')
const Logger = require('../lib/logger')
const GapsFinder = require('../lib/findGaps')

const args = loadArgs()
const debug = args['d']
let logFile = getLogFileName()
const logger = new Logger(logFile, Boolean(debug))

new GapsFinder({}).run();
