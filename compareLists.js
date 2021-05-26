/**
 * Compare two list (store in csv)
 * Created by Henry Huang on 2021/5/24.
 */
const path = require('path')
const csv = require('csvtojson')
const { Table } = require("console-table-printer")

const oldFile = path.join(__dirname, 'data', '2021-05-24.csv')
const newFile = path.join(__dirname, 'data', 'download', '2021-05-26-20-47-1.csv')

const p1 = csv().fromFile(oldFile)
const p2 = csv().fromFile(newFile)

const contains = (array, object) => {
  let found = false;
  for(let i = 0; i < array.length; i++) {
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
    console.log(`${item['代码']}, ${item['转债名称']}, ${item['现价']}, ${item['溢价率']}, ${item['剩余规模']}, ${item['双低']}`)
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
  while (i < rowNum) {
    const leftData = left[i];
    const rightData = right[i];
    p.addRow({ '新增': `${leftData['转债名称']} ${leftData['代码']}`, '删除': `${rightData['转债名称']} ${rightData['代码']}`});
    i ++
  }
  p.printTable();
}

Promise.all([p1, p2]).then(([oldItems, newItems]) => {
  console.log(`old items size is ${oldItems.length}`)
  console.log(`new items size is ${newItems.length}`)
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
  // console.log(`old items removed size is ${oldRemoved.length}`)
  // printItems(oldRemoved)
  // console.log(`new items added size is ${newAdded.length}`)
  // printItems(newAdded)
  print(newAdded, oldRemoved)
})
