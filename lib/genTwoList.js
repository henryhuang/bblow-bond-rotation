/**
 * Created by Henry Huang on 2021/5/31.
 */
const csv = require('csvtojson')
const { buildCSVContentWithChinese } = require('./utils')

class GenTwoList {
  constructor({
    oldFile,
    newFile,
    logger,
    oldContent = null,
    newContent = null
  }) {
    if (!oldFile && !oldContent) {
      throw Error("Please provide oldFile or oldContent!")
    }
    if (!newFile && !newContent) {
      throw Error("Please provide newFile or newContent!")
    }
    this.oldFile = oldFile
    this.newFile = newFile
    this.oldContent = oldContent
    this.newContent = newContent
    this.logger = logger
  }
  run () {
    return new Promise((resolve) => {
      let p1
      if (this.oldFile) {
        p1 = csv().fromFile(this.oldFile)
      } else {
        p1 = csv().fromString(this.oldContent)
      }
      let p2
      if (this.newFile) {
        p2 = csv().fromFile(this.newFile)
      } else {
        p2 = csv().fromString(this.newContent)
      }
      Promise.all([p1, p2]).then(([oldItems, newItems]) => {
        this.logger.log('产生新旧数据')
        this.logger.log('旧数据', buildCSVContentWithChinese(oldItems))
        this.logger.log('新数据', buildCSVContentWithChinese(newItems))
        resolve([oldItems, newItems])
      })
    })
  }
}

module.exports = GenTwoList
