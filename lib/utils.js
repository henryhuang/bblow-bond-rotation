/**
 * Created by Henry Huang on 2021/5/26.
 */
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Table } = require("console-table-printer")

const getLatestData = () => {
  let lastDataName = null;
  let lastFile = null;
  fs.readdirSync(path.join(__dirname, '..', 'data'))
      .filter((file) => !fs.lstatSync(path.join(__dirname, '..', 'data', file)).isDirectory())
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

const getLatestNameAndContent = () => {
  const fileName = getLatestData();
  const content = fs.readFileSync(path.join(__dirname, '..', 'data', fileName)).toString();
  return {
    fileName,
    content
  }
}

const getLogFileName = () => {
  return path.join(__dirname, '..', 'data', 'debug', moment().format('YYYY-MM-DD_HHmmss') + '.log')
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

const buildCell = (data) => {
  return data ? `${data['转债名称']}(${data['代码']} ${data['行业'] || ''})` : ''
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
  while (i < rowNum) {
    const leftData = left[i];
    const rightData = right[i];
    p.addRow({ [leftName]: buildCell(leftData), [rightName]: buildCell(rightData) });
    i++
  }
  p.printTable();
}

const printAllItemInfo = ({midPrice, dblowAvg, dblowValidSize}) => {
  const p = new Table({
    columns: [
      { name: '中间价', alignment: 'middle', color: 'green'},
      { name: '双低均值', alignment: 'middle', color: 'green'},
      { name: '双低合格数', alignment: 'middle', color: 'green'},
    ],
  });
  p.addRow({
    '中间价': midPrice,
    '双低均值': dblowAvg,
    '双低合格数': dblowValidSize
  });
  p.printTable();
}

const loadArgs = () => {
  const argv = yargs(hideBin(process.argv)).argv
  return argv
}

const fix2 = raw => {
  return Number(parseFloat(raw).toFixed(2))
}

const buildCSVContent = (items) => {
  let csvContent = ""
  const titleRow = "代码, 转债名称, 行业, 现价, 溢价率, 剩余规模, 双低"
  csvContent = csvContent + titleRow + "\n"
  items.forEach(item => {
    const row = `${item.bond_id}, ${item.bond_nm}, ${item.industry || '未知'}, ${item.price}, ${item.premium_rt}, ${item.curr_iss_amt}, ${item.dblow}`
    csvContent = csvContent + row + "\n"
  })
  return csvContent
}

const buildCSVContentWithChinese = (items) => {
  let csvContent = ""
  const titleRow = "代码, 转债名称, 行业, 现价, 溢价率, 剩余规模, 双低"
  csvContent = csvContent + titleRow + "\n"
  items.forEach(item => {
    const row = `${item['代码']}, ${item['转债名称']}, ${item['行业'] || '未知'}, ${item['现价']}, ${item['溢价率']}, ${item['剩余规模']}, ${item['双低']}`
    csvContent = csvContent + row + "\n"
  })
  return csvContent
}

module.exports = {
  getLatestData,
  getLatestNameAndContent,
  contains,
  printTwoList,
  printAllItemInfo,
  loadArgs,
  buildCell,
  fix2,
  getLogFileName,
  buildCSVContent,
  buildCSVContentWithChinese
}
