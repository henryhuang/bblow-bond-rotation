/**
 * Created by Henry Huang on 2021/6/1.
 */
const { Csv2md }  = require('csv2md')
const fs  = require('fs')

let csvString = fs.readFileSync(__dirname + '/../data/2021-05-24.csv').toString()

let csv2md = new Csv2md({
  pretty: true
})

csv2md.convert(csvString).then(console.log)
