/**
 * Compare two list (store in csv)
 * Created by Henry Huang on 2021/5/24.
 */
const { printTwoList, contains } = require('./utils')

class CompareTwoLists {
  constructor({
    oldItems,
    newItems,
    printSize = false,
    printList = true,
    logger
  }) {
    this.oldItems = oldItems
    this.newItems = newItems
    this.printSize = printSize
    this.printList = printList
    this.logger = logger
  }

  run() {
    return new Promise((resolve) => {
      if (this.printSize) {
        console.log(`old items size is ${this.oldItems.length}`)
        console.log(`new items size is ${this.newItems.length}`)
      }
      const oldRemoved = []
      const newAdded = []
      this.oldItems.forEach(oldItem => {
        if (!contains(this.newItems, oldItem)) {
          oldRemoved.push(oldItem)
        }
      })
      this.newItems.forEach(newItem => {
        if (!contains(this.oldItems, newItem)) {
          newAdded.push(newItem)
        }
      })
      if (this.printList) {
        this.logger.log('新增加', newAdded)
        this.logger.log('旧删除', oldRemoved)
        printTwoList(newAdded, oldRemoved, {})
      }
      resolve({
        newAdded, oldRemoved
      })
    })
  }
}

module.exports = CompareTwoLists
