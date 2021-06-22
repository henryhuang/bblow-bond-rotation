/**
 * Created by Henry Huang on 2021/6/22.
 */
const FindBuyItems = require('../lib/findBuyItems')
const { loadArgs, getLogFileName } = require('../lib/utils')
const Logger = require('../lib/logger')

const args = loadArgs()
const debug = args['d']
let logFile = getLogFileName()
const logger = new Logger(logFile, Boolean(debug))

const gen = async () => {
  return await new FindBuyItems({logger}).run()
}

gen().then((content) => {
  console.log(content)
  if (debug) {
    console.log(`Log saved in ${logFile}`)
  }
})
