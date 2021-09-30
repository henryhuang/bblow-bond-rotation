/**
 * Created by Henry Huang on 2021/5/26.
 */
const args = process.argv.slice(2);
const saveToFile = args[0] || false
const GetInitialListBackend = require('../lib/getInitialListBackend')
const Logger = require("../lib/logger");
const {getLogFileName, callListMetaData} = require("../lib/utils");

const debug = args['d']
let logFile = getLogFileName()
const logger = new Logger(logFile, Boolean(debug))
new GetInitialListBackend({saveToFile, logger}).run().then(({ itemList, csvContent }) => {
    console.log(csvContent)
    const metaData = callListMetaData(itemList)
    console.log(`平均价格：${metaData.avgPrice}`)
    console.log(`平均双低：${metaData.avgDBlow}`)
    console.log(`平均溢价：${metaData.avgPremiumRt}%`)
})
