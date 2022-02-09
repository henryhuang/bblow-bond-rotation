/**
 * Created by Henry Huang on 2021/5/26.
 */
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Table } = require("console-table-printer")
const chalk = require('chalk');
const csv = require('csvtojson')

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
  return data ? `${data['转债名称']}(${data['代码']} ${data['行业'] || ''} ${data['评级'] || ''}))` : ''
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

const printSellBuyToOneList = (sellItems, buyItems, {
  sellName = '卖出',
  buyName = '买入'
}) => {
  console.log(chalk.red(sellName));
  console.log(chalk.red('----------'));
  sellItems.forEach(sellItem => {
    console.log(chalk.red(buildCell(sellItem)));
  })
  console.log(chalk.green(buyName));
  console.log(chalk.green('----------'));
  buyItems.forEach(buyItem => {
    console.log(chalk.green(buildCell(buyItem)));
  })
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
  const titleRow = "代码, 转债名称, 行业, 评级, 现价, 溢价率, 剩余规模, 双低"
  csvContent = csvContent + titleRow + "\n"
  items.forEach(item => {
    const row = `${item.bond_id}, ${item.bond_nm}, ${item.industry || '未知'}, ${item.ratingCode || '未知'}, ${item.price}, ${item.premium_rt}, ${item.curr_iss_amt}, ${item.dblow}`
    csvContent = csvContent + row + "\n"
  })
  return csvContent
}

const buildCSVContentWithChinese = (items) => {
  let csvContent = ""
  const titleRow = "代码, 转债名称, 行业, 评级, 现价, 溢价率, 剩余规模, 双低"
  csvContent = csvContent + titleRow + "\n"
  items.forEach(item => {
    const row = `${item['代码']}, ${item['转债名称']}, ${item['行业'] || '未知'}, ${item['评级'] || '未知'}, ${item['现价']}, ${item['溢价率']}, ${item['剩余规模']}, ${item['双低']}`
    csvContent = csvContent + row + "\n"
  })
  return csvContent
}

const buildPrettyCBIndexText = (d) => {
  // console.log(d)
  const texts = []
  texts.push(`当前指数：${d.cur_index}${arrow(d.cur_increase_val)} ${d.cur_increase_val} ${d.cur_increase_rt}%`)
  texts.push(`中位数价格：${d.mid_price}`)
  texts.push(`平均价格：${d.avg_price}`)
  texts.push(`平均双低：${d.avg_dblow}`)
  texts.push(`成交额 ${d.volume}亿元 换手率 ${d.turnover_rt}%`)
  texts.push(`转股溢价率 ${d.avg_premium_rt}% 到期收益率 ${d.avg_ytm_rt}%`)

  const priceSpans = []
  priceSpans.push(`<90 ${d.price_90}个 ${arrow(d.increase_rt_90, `${d.increase_rt_90}%`)}`)
  priceSpans.push(`90~100 ${d.price_90_100}个 ${arrow(d.increase_rt_90_100, `${d.increase_rt_90_100}%`)}`)
  priceSpans.push(`100~110 ${d.price_100_110}个 ${arrow(d.increase_rt_100_110, `${d.increase_rt_100_110}%`)}`)
  priceSpans.push(`110~120 ${d.price_110_120}个 ${arrow(d.increase_rt_110_120, `${d.increase_rt_110_120}%`)}`)
  priceSpans.push(`120~130 ${d.price_120_130}个 ${arrow(d.increase_rt_120_130, `${d.increase_rt_120_130}%`)}`)
  priceSpans.push(`≥130 ${d.price_130}个 ${arrow(d.increase_rt_130, `${d.increase_rt_130}%`)}`)

  texts.push(priceSpans.join(' | '))
  return texts.join('\n')
}

const callListMetaData = (list) => {
  let avgPrice = 0
  let avgDBlow = 0
  let avgPremiumRt = 0
  list.forEach(item => {
    avgPrice = avgPrice + item.price
    avgDBlow = avgDBlow + item.dblow
    avgPremiumRt = avgPremiumRt + item.premium_rt
  })
  return {
    avgPremiumRt: fix2(avgPremiumRt / 20),
    avgPrice: fix2(avgPrice / 20),
    avgDBlow: fix2(avgDBlow / 20)
  }
}

const parsePlanFileToJson = async (planFile, dateString) => {
  const json = await csv().fromFile(planFile)
  return json.map(j => {
    return {
      date: dateString,
      bond_id: j['代码'],
      bond_nm: j['转债名称'],
      industry: j['行业'] || '未知',
      ratingCode: j['评级'] || '未知',
      price: Number(j['现价'] || 0),
      premium_rt: Number(j['溢价率'] || 0),
      curr_iss_amt: Number(j['剩余规模'] || 0),
      dblow: Number(j['双低'] || 0)
    }
  })
}

const parsePlanCSVContentToJson = async (csvContent, dateString) => {
  const json = await csv().fromString(csvContent)
  return json.map(j => {
    return {
      date: dateString,
      bond_id: j['代码'],
      bond_nm: j['转债名称'],
      industry: j['行业'] || '未知',
      ratingCode: j['评级'] || '未知',
      price: Number(j['现价'] || 0),
      premium_rt: Number(j['溢价率'] || 0),
      curr_iss_amt: Number(j['剩余规模'] || 0),
      dblow: Number(j['双低'] || 0)
    }
  })
}

const arrow = (text, textOfValue) => {
  const color = Number(text) > 0 ? chalk.red : Number(text) < 0 ? chalk.green : chalk.white
  return color((Number(text) > 0 ? '↑' : Number(text) < 0 ? '↓' : '-') + (textOfValue ? textOfValue : ''))
}

const showWithColor = (text, isRed) => {

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
  buildCSVContentWithChinese,
  buildPrettyCBIndexText,
  callListMetaData: callListMetaData,
  parsePlanFileToJson,
  parsePlanCSVContentToJson,
  printSellBuyToOneList
}
