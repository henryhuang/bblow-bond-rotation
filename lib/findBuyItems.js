/**
 * 如果主动卖出，使用轮询报告获取的列表可能买入卖出都是空
 * 所以提供这个方法来获取买入列表
 *
 * Created by Henry Huang on 2021/6/22.
 */
const path = require('path')
const CompareLists = require('../lib/compareTwoLists')
const GenTwoList = require('../lib/genTwoList')
const GetInitialListBackend = require('../lib/getInitialListBackend')
const { getLatestData, buildCSVContentWithChinese } = require('../lib/utils')

const file = getLatestData()
const oldFile = path.join(__dirname, '..', 'data', file)

class FindBuyItems {
  constructor({ logger }) {
    this.logger = logger
  }

  async run() {

    const {csvContent: newContent} = await new GetInitialListBackend({
      saveToFile: true,
      logger: this.logger
    }).run()
    const [oldItems, newItems] = await new GenTwoList({
      newContent,
      oldFile,
      logger: this.logger
    }).run()
    const { newAdded } = await new CompareLists({
      oldItems,
      newItems,
      printList: false,
      logger: this.logger
    }).run()
    const addedContent = buildCSVContentWithChinese(newAdded)
    this.logger.log('新增加的转债', addedContent)
    return addedContent
  }
}

module.exports = FindBuyItems
