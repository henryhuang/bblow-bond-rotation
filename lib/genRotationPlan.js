/**
 * Created by Henry Huang on 2021/5/31.
 */
const { printTwoList, contains } = require('./utils')

const removeCheckPercentage = 0.2
const addCheckPercentage = 0.1

class GenRotationPlan {
  constructor({ oldList, newList, addList}) {
    this.oldList = oldList
    this.newList = newList
    this.addList = addList
  }
  run () {
    const oldLength = this.oldList.length
    const removeCheckList = this.oldList.splice(oldLength * (1 - removeCheckPercentage), oldLength)
    const shouldSell = []
    removeCheckList.forEach(i => {
      if (!contains(this.newList, i)) {
        shouldSell.push(i)
      }
    })
    const shouldSellSize = shouldSell.length
    const shouldBuy = []
    if (shouldSellSize > 0) {
      let checkedSize = 0
      this.newList.forEach(i => {
        if (checkedSize < shouldSellSize && contains(this.addList, i)) {
          shouldBuy.push(i)
          checkedSize++
        }
      })
    }
    printTwoList(shouldBuy, shouldSell, {
      leftName: '买入',
      rightName: '卖出'
    })
  }
}

module.exports = GenRotationPlan
