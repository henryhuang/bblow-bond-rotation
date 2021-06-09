/**
 * Created by Henry Huang on 2021/5/24.
 */
const axios = require('axios')
const chalk = require('chalk');
const moment = require('moment');
const fs = require('fs')
const path = require('path')
const { fix2 } = require('./utils')
const { signOutDblowHighestValue } = require('../config.json')

const pickRate = 0.1
const maxPremiumRt = 20
const maxPickCount = 20

const createSavedFileName = (date) => {
  let month = date.getMonth()
  if (month < 9) {
    month = `0${month + 1}`
  } else {
    month = month + 1
  }
  const savedFileName = `${date.getFullYear()}-${month}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`
  return savedFileName
}
const createFormData = () => {
  return 'fprice=&tprice=&curr_iss_amt=&volume=&svolume=&premium_rt=&ytm_rt=&rating_cd=&is_search=Y&market_cd%5B%5D=shmb&market_cd%5B%5D=shkc&market_cd%5B%5D=szmb&market_cd%5B%5D=szcy&btype=&listed=Y&qflag=N&sw_cd=&bond_ids=&rp=50'
}

const sortByPrice = (items) => {
  return items.sort((a, b) => {
    return a.price - b.price
  })
}

const sortByDBlow = (items) => {
  return items.sort((a, b) => {
    return a.dblow - b.dblow
  })
}

const sortByCurrIssAmt = (items) => {
  return items.sort((a, b) => {
    return a.curr_iss_amt - b.curr_iss_amt
  })
}

const findAllItemsData = (items) => {
  const midPrice = items[parseInt(items.length * 0.5)].price
  let totalDbBlow = 0
  let dblowValidSize = 0
  items.forEach(item => {
    totalDbBlow = totalDbBlow + item.dblow
    if (item.dblow < signOutDblowHighestValue) {
      dblowValidSize++
    }
  })
  return {
    midPrice,
    dblowAvg: fix2(totalDbBlow / items.length),
    dblowValidSize
  }
}

const buildCSVContent = (items) => {
  let csvContent = ""
  const titleRow = "代码, 转债名称, 现价, 溢价率, 剩余规模, 双低"
  csvContent = csvContent + titleRow + "\n"
  items.forEach(item => {
    const row = `${item.bond_id}, ${item.bond_nm}, ${item.price}, ${item.premium_rt}, ${item.curr_iss_amt}, ${item.dblow}`
    csvContent = csvContent + row + "\n"
  })
  return csvContent
}

const saveToFile = (fileName, content) => {
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'download', fileName), content)
}

class GetInitialListBackend {
  constructor({saveToFile}) {
    this.saveToFile = saveToFile
  }

  run () {
    return new Promise((resolve) => {
      const date = new Date()
      const url = `https://www.jisilu.cn/data/cbnew/cb_list/?___jsl=LST___t=${date.getTime()}`
      console.log(`Will collect data at ${chalk.green(moment(date).format('YYYY-MM-DD HH:mm:SS'))}`)
      console.log(`Loading data from ${url}`)

      axios({
        method: 'post',
        url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: createFormData()
      }).then((response) => {
        if (response.data.rows) {
          const items = response.data.rows.map(r => {
            return {
              bond_id: r.cell.bond_id,
              bond_nm: r.cell.bond_nm,
              price: Number(r.cell.price),
              premium_rt: parseFloat(r.cell.premium_rt),
              curr_iss_amt: Number(r.cell.curr_iss_amt),
              dblow: Number(r.cell.dblow),
            }
          })
          // 获取中间值
          const { midPrice, dblowAvg, dblowValidSize } = findAllItemsData(sortByPrice(items))
          console.log(`中间价是 ${chalk.green(midPrice)}`)

          // 根据双低排序整个列表
          const sortedByDBlow = sortByDBlow(items)
          const pickSize = sortedByDBlow.length * pickRate
          const subItems = sortedByDBlow.splice(0, pickSize)
          let itemsFiltered = []
          subItems.forEach((item) => {
            // 过滤筛选出 溢价率小于标准最大溢价率，并且现价小于中间价
            if (item.premium_rt <= maxPremiumRt && item.price < midPrice) {
              itemsFiltered.push(item)
            }
          })
          // 根据剩余规模排序
          itemsFiltered = sortByCurrIssAmt(itemsFiltered)
          // 获取最大数量
          itemsFiltered = itemsFiltered.splice(0, itemsFiltered.length > maxPickCount ? maxPickCount : itemsFiltered.length)
          // 根据双低再排序便于展示
          itemsFiltered = sortByDBlow(itemsFiltered)
          const content = buildCSVContent(itemsFiltered)
          if (this.saveToFile) {
            const savedFileName = createSavedFileName(date)
            saveToFile(savedFileName, buildCSVContent(itemsFiltered))
            console.log(`Saved to ${savedFileName}!`)
          }
          resolve({
            midPrice,
            dblowAvg,
            dblowValidSize,
            csvContent: content
          })
        }
      })
    })
  }
}

module.exports = GetInitialListBackend
