/**
 * Created by Henry Huang on 2021/5/26.
 */
const {getLogFileName, callListMetaData, loadArgs} = require("../lib/utils");
const GetInitialListBackend = require('../lib/getInitialListBackend')

const args = loadArgs()
const Logger = require("../lib/logger");

const debug = args['d']
const saveToFile = args['s']
console.log(debug)
let logFile = getLogFileName()
const logger = new Logger(logFile, Boolean(debug))
new GetInitialListBackend({saveToFile, logger}).run().then(({ itemList, csvContent }) => {
    console.log(csvContent)
    const metaData = callListMetaData(itemList)
    console.log(`平均价格：${metaData.avgPrice}`)
    console.log(`平均双低：${metaData.avgDBlow}`)
    console.log(`平均溢价：${metaData.avgPremiumRt}%`)
    let price = 0
    itemList.forEach(item => {
        price = price + item.price
    })
    console.log(`一份价格：${price * 10}`)
})
