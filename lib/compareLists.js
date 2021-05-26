/**
 * Compare two list (store in csv)
 * Created by Henry Huang on 2021/5/24.
 */
const csv = require('csvtojson')
const { Table } = require("console-table-printer")

const contains = (array, object) => {
  let found = false;
  for (let i = 0; i < array.length; i++) {
    if (array[i]['代码'] === object['代码']) {
      found = true;
      break;
    }
  }
  return found
}

const printItems = (array) => {
  console.log('----------------------------------------')
  console.log('代码, 转债名称, 现价, 溢价率, 剩余规模, 双低')
  array.forEach(item => {
    console.log(
        `${item['代码']}, ${item['转债名称']}, ${item['现价']}, ${item['溢价率']}, ${item['剩余规模']}, ${item['双低']}`)
  })
  console.log('----------------------------------------')
}

const print = (left, right) => {
  let rowNum = left.length > right.length ? left.length : right.length
  const p = new Table({
    columns: [
      { name: '新增', alignment: 'right', color: 'green' },
      { name: '删除', alignment: 'left', color: 'red' }
    ],
  });
  let i = 0
  const buildCell = (data) => {
    return data ? `${data['转债名称']} ${data['代码']}` : ''
  }
  while (i < rowNum) {
    const leftData = left[i];
    const rightData = right[i];
    p.addRow({ '新增': buildCell(leftData), '删除': buildCell(rightData) });
    i++
  }
  p.printTable();
}

class CompareLists {
  constructor({
    oldFile,
    newFile,
    oldContent = null,
    newContent = null,
    printSize = false
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
    this.printSize = printSize
  }

  run() {
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
        if (this.printSize) {
          console.log(`old items size is ${oldItems.length}`)
          console.log(`new items size is ${newItems.length}`)
        }
        const oldRemoved = []
        const newAdded = []
        oldItems.forEach(oldItem => {
          if (!contains(newItems, oldItem)) {
            oldRemoved.push(oldItem)
          }
        })
        newItems.forEach(newItem => {
          if (!contains(oldItems, newItem)) {
            newAdded.push(newItem)
          }
        })
        print(newAdded, oldRemoved)
        resolve()
      })
    })
  }
}

module.exports = CompareLists
