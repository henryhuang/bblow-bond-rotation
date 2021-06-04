/**
 * Created by Henry Huang on 2021/5/31.
 */
const path = require('path')
const GenRotationPlanFile = require('./genRotationPlanFile')

const oldDataCsvFile = path.join(__dirname, '..', 'data', '2021-05-21.csv')
const newDataCsvFile = path.join(__dirname, '..', 'data', '2021-05-24.csv')
new GenRotationPlanFile({
  midPrice: 100,
  dblowAvg: 110.11,
  dblowValidSize: 130,
  oldDataCsvFile,
  newDataCsvFile,
  sellItems: [
    '江银转债 128034 118.10',
    '海兰转债 123086 118.18',
    '润建转债 128140 119.66'
  ],
  buyItems: [
    '英特转债 127028 113.79',
    '绿茵转债 127034 115.5',
    '正川转债 113624 118.39'
  ],
}).gen()
