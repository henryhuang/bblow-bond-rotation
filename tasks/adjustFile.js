/**
 * Created by Henry Huang on 2021/8/31.
 */
const csvtojson = require('csvtojson')
const industries = require('../data/industry.json')
const fs = require('fs')

const file = '/Users/henry/dev/workspace/github/convertible-bond/data/2021-08-31.csv'
csvtojson()
    .fromFile(file)
    .then((jsonObj)=>{
      let str = '代码, 转债名称, 行业, 现价, 溢价率, 剩余规模, 双低'
      jsonObj.forEach(j => {
        str = str + '\n' + `${j['代码']}, ${j['转债名称']}, ${industries[j['代码']]}, ${j['现价']}, ${j['溢价率']}, ${j['剩余规模']}, ${j['双低']}`
      })
      console.log(str)
      fs.writeFileSync(file, str)
    })
