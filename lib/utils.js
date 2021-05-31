/**
 * Created by Henry Huang on 2021/5/26.
 */
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { Table } = require("console-table-printer")

const getLatestData = () => {
  let lastDataName = null;
  let lastFile = null;
  fs.readdirSync(path.join('data'))
      .filter((file) => !fs.lstatSync(path.join('data', file)).isDirectory())
      .forEach(file => {
        const name = file.split(path.extname(file))[0];
        if (lastDataName) {
          if (moment(name, 'YYYY-MM-DD').diff(moment(lastDataName, 'YYYY-MM-DD')) > 0) {
            lastDataName = name
            lastFile = file
          }
        } else {
          lastDataName = name
          lastFile = file
        }
  });
  return lastFile;
}

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

const printTwoList = (left, right, {
  leftName = '新增',
  rightName = '删除'
}) => {
  let rowNum = left.length > right.length ? left.length : right.length
  const p = new Table({
    columns: [
      { name: leftName, alignment: 'right', color: 'green' },
      { name: rightName, alignment: 'left', color: 'red' }
    ],
  });
  let i = 0
  const buildCell = (data) => {
    return data ? `${data['转债名称']} ${data['代码']} ${data['双低']}` : ''
  }
  while (i < rowNum) {
    const leftData = left[i];
    const rightData = right[i];
    p.addRow({ [leftName]: buildCell(leftData), [rightName]: buildCell(rightData) });
    i++
  }
  p.printTable();
}

module.exports = {
  getLatestData,
  contains,
  printTwoList
}
