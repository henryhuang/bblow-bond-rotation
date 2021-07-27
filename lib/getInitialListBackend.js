/**
 * Created by Henry Huang on 2021/5/24.
 */
const axios = require('axios')
const chalk = require('chalk');
const moment = require('moment');
const fs = require('fs')
const path = require('path')
const { fix2, buildCSVContent } = require('./utils')
const { signOutDblowHighestValue } = require('../config.json')

const cookie = fs.readFileSync(path.join(__dirname, '..', 'cookie')).toString().replace('\n', '')

console.log(cookie)

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

const saveToFile = (fileName, content) => {
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'download', fileName), content)
}

class GetInitialListBackend {
  constructor({saveToFile, logger}) {
    this.saveToFile = saveToFile
    this.logger = logger
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookie
        },
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
          this.logger.log(`总共获取到${items.length}个基金`)
          if (items.length < 100) {
            throw new Error('需要更新cookie，先登陆然后通过devtool去查看请求的cookie')
          }
          // 获取中间值
          const { midPrice, dblowAvg, dblowValidSize } = findAllItemsData(sortByPrice(items))
          console.log(`中间价是 ${chalk.green(midPrice)}`)
          this.logger.log('获取中间值', midPrice)

          // 根据双低排序整个列表
          const sortedByDBlow = sortByDBlow(items)
          this.logger.log('根据双低排序整个列表')

          // 选双低值前x%的转债
          const pickSize = sortedByDBlow.length * pickRate
          const subItems = sortedByDBlow.splice(0, pickSize)
          this.logger.log(`选双低值前${pickRate * 100}%的转债，有${subItems.length}个`)

          // 过滤筛选出 溢价率小于标准最大溢价率，并且现价小于中间价
          let itemsFiltered = []
          subItems.forEach((item) => {
            if (item.premium_rt <= maxPremiumRt && item.price < midPrice) {
              itemsFiltered.push(item)
            }
          })
          this.logger.log(`过滤筛选出 溢价率小于标准最大溢价率${maxPremiumRt}，并且现价小于中间价${midPrice}, 有${itemsFiltered.length}`)

          // 根据剩余规模排序
          itemsFiltered = sortByCurrIssAmt(itemsFiltered)
          this.logger.log('根据剩余规模排序')

          // 获取最大数量
          itemsFiltered = itemsFiltered.splice(0, itemsFiltered.length > maxPickCount ? maxPickCount : itemsFiltered.length)
          this.logger.log(`获取最多${maxPickCount}个`)

          // 根据双低再排序便于展示
          itemsFiltered = sortByDBlow(itemsFiltered)

          const content = buildCSVContent(itemsFiltered)

          this.logger.log('根据双低再排序', content)

          if (this.saveToFile) {
            const savedFileName = createSavedFileName(date)
            saveToFile(savedFileName, content)
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
