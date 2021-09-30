const path = require('path')
const fs = require('fs')
const { parsePlanFileToJson, callListMetaData, fix2} = require('./utils')
const GetInitialListBackend = require("../lib/getInitialListBackend");
const moment = require("moment");

const planBaseFolder = path.join(__dirname, '..', 'data')
const storedJsonFile = path.join(__dirname, '..', 'data', 'metrics', 'data.js')

class GenMetrics {
    run() {
        const pss = []
        fs.readdirSync(planBaseFolder)
            .filter((file) => !fs.lstatSync(path.join(planBaseFolder, file)).isDirectory() && file.endsWith('.csv'))
            .forEach(file => {
                const dateFileName = file.split('.')[0]
                pss.push(parsePlanFileToJson(path.join(planBaseFolder, file), dateFileName).then((json => Object.assign(callListMetaData(json), {date: dateFileName}))))
            })

        pss.push(new GetInitialListBackend({}).run().then(({ itemList, csvContent }) => {
            console.log(csvContent)
            const metaData = callListMetaData(itemList)
            Object.assign(metaData, {
                date: moment().format('YYYY-MM-DD')
            })
            return metaData
        }))
        return Promise.all(pss).then(results => {
            const dates = []
            const avgPremiumRts = []
            const avgPrices = []
            const avgDBlows = []
            results.forEach(r => {
                dates.push(r.date);
                avgPremiumRts.push(r.avgPremiumRt);
                avgPrices.push(fix2(r.avgPrice - 100));
                avgDBlows.push(fix2(r.avgDBlow - 100));
            })
            const json = JSON.stringify({
                dates,
                avgPrices,
                avgDBlows,
                avgPremiumRts
            })
            fs.writeFileSync(storedJsonFile, `var metricsData = ${json}`, null, 2)
        })
    }
}

module.exports = GenMetrics
