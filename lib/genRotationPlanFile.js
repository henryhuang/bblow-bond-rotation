/**
 * Created by Henry Huang on 2021/6/3.
 */
const moment = require('moment')
const fs = require('fs')
const path = require('path')
const Handlebars = require("handlebars");
const { csv2md } = require('csv2md')

const templateFile = path.join(__dirname, '..', 'data', 'plan', 'template.handlebars')

const genPlanFileName = (newDataDate, oldDataDate) => {
  return path.join(__dirname, '..', 'data', 'plan', `${oldDataDate}_${newDataDate}.md`)
}

class GenRotationPlanFile {

  constructor(options = {
    midPrice : 0,
    dblowAvg : 0,
    dblowValidSize : 0,
    sellItems: [],
    buyItems: [],
    oldDataCsvFile: null,
    oldDataCsvContent: null,
    newDataCsvFile: null,
    newDataCsvContent: null,
    destFile: null
  }) {
    this.options = options
  }

  gen () {
    if (!this.options.oldDataCsvFile && !this.options.oldDataCsvContent) {
      throw new Error("Please provide oldDataCsvFile or oldDataCsvContent")
    }
    if (!this.options.newDataCsvFile && !this.options.newDataCsvContent) {
      throw new Error("Please provide newDataCsvFile or newDataCsvContent")
    }
    let oldDataDate
    if (this.options.oldDataCsvFile) {
      oldDataDate = path.basename(this.options.oldDataCsvFile).split('.')[0]
    } else {
      oldDataDate = moment().add(-1, 'days').format('YYYY-MM-DD')
    }
    let newDataDate
    if (this.options.newDataCsvFile) {
      newDataDate = path.basename(this.options.newDataCsvFile).split('.')[0]
    } else {
      newDataDate = moment().format('YYYY-MM-DD')
    }
    const oldDataContent = csv2md(this.options.oldDataCsvContent ? this.options.oldDataCsvContent : fs.readFileSync(this.options.oldDataCsvFile).toString(), { pretty: true })
    const newDataContent = csv2md(this.options.newDataCsvContent ? this.options.newDataCsvContent : fs.readFileSync(this.options.newDataCsvFile).toString(), { pretty: true })
    const template = Handlebars.compile(fs.readFileSync(templateFile).toString());
    const destFile = genPlanFileName(newDataDate, oldDataDate)

    const targetContent = template({
      midPrice: this.options.midPrice,
      dblowAvg: this.options.dblowAvg,
      dblowValidSize: this.options.dblowValidSize,
      sellItems: this.options.sellItems,
      buyItems: this.options.buyItems,
      newDataDate,
      oldDataDate,
      newDataContent,
      oldDataContent
    })
    fs.writeFileSync(destFile, targetContent)
    console.log(`Plan saved to ${destFile}`)
  }

}

module.exports = GenRotationPlanFile
