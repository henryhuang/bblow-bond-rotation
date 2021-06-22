/**
 * Created by Henry Huang on 2021/5/31.
 */
const path = require('path')
const CompareLists = require('../lib/compareTwoLists')
const GenRotationPlan = require('../lib/genRotationPlan')
const GenRotationPlanFile = require('../lib/genRotationPlanFile')
const GenTwoList = require('../lib/genTwoList')
const GetInitialListBackend = require('../lib/getInitialListBackend')
const { getLatestData, loadArgs, buildCell, getLogFileName } = require('../lib/utils')
const Logger = require('../lib/logger')

const args = loadArgs()

const oldFileName = args['o']
const genReportFile = args['g']
// debug is true, then show every step results
const debug = args['d']
let logFile = getLogFileName()
const logger = new Logger(logFile, Boolean(debug))

let file = oldFileName
if (!file) {
  file = getLatestData()
}
const oldFile = path.join(__dirname, '..', 'data', file)

const generate = async () => {
  const {midPrice, dblowAvg, dblowValidSize, csvContent: newContent} = await new GetInitialListBackend({
    saveToFile: true,
    logger
  }).run()
  const [oldItems, newItems] = await new GenTwoList({
    newContent,
    oldFile,
    logger
  }).run()
  const { newAdded } = await new CompareLists({
    oldItems,
    newItems,
    printList: false,
    logger
  }).run()
  const { sellItems, buyItems } = await new GenRotationPlan({
    oldList: oldItems,
    newList: newItems,
    addList: newAdded,
    logger
  }).run()
  if (genReportFile) {
    const sellItemSimples = sellItems.map(s => buildCell(s))
    const buyItemSimples = buyItems.map(s => buildCell(s))
    await new GenRotationPlanFile({
      midPrice,
      dblowAvg,
      dblowValidSize,
      sellItems: sellItemSimples,
      buyItems: buyItemSimples,
      oldDataCsvFile: oldFile,
      newDataCsvContent: newContent
    }).gen()
  }
  if (debug) {
    console.log(`Log saved in ${logFile}`)
  }
}

generate().then(r => (
    console.log('Please check.')
))
