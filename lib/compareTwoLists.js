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
    printList = true
  }) {
    this.oldItems = oldItems
    this.newItems = newItems
    this.printSize = printSize
    this.printList = printList
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
        printTwoList(newAdded, oldRemoved, {})
      }
      resolve({
        newAdded, oldRemoved
      })
    })
  }
}

module.exports = CompareTwoLists
