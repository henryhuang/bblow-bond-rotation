/**
 * Created by Henry Huang on 2021/5/31.
 */
const path = require('path')
const CompareLists = require('../lib/compareTwoLists')
const GenRotationPlan = require('../lib/genRotationPlan')
const GenRotationPlanFile = require('../lib/genRotationPlanFile')
const GenTwoList = require('../lib/genTwoList')
const GetInitialListBackend = require('../lib/getInitialListBackend')
const { getLatestData, loadArgs, buildCell } = require('../lib/utils')

const args = loadArgs()

const oldFileName = args['o']
const genReportFile = args['g']

let file = oldFileName
if (!file) {
  file = getLatestData()
}
const oldFile = path.join(__dirname, '..', 'data', file)

const generate = async () => {
  const {midPrice, dblowAvg, dblowValidSize, csvContent: newContent} = await new GetInitialListBackend({
    saveToFile: true
  }).run()
  const [oldItems, newItems] = await new GenTwoList({
    newContent, oldFile
  }).run()
  const { newAdded, oldRemoved } = await new CompareLists({
    oldItems, newItems, printList: false
  }).run()
  const { sellItems, buyItems } = await new GenRotationPlan({
    oldList: oldItems,
    newList: newItems,
    addList: newAdded
  }).run()
  if (genReportFile) {
    const sellItemSimples = sellItems.map(s => buildCell(s))
    const buyItemSimples = buyItems.map(s => buildCell(s))
    new GenRotationPlanFile({
      midPrice,
      dblowAvg,
      dblowValidSize,
      sellItems: sellItemSimples,
      buyItems: buyItemSimples,
      oldDataCsvFile: oldFile,
      newDataCsvContent: newContent
    }).gen()
  }
}

generate().then(r => (
    console.log('Please check.')
))
