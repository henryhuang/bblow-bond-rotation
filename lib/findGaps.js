/**
 * Created by Henry Huang on 2022/2/18.
 */
const { bondStockGap } = require('../config.json')
const GetFullFunds = require('./getFullFunds')
const { isDailyLimited } = require('./utils')

class GapsFinder {

  constructor({ logger, reverse }) {
    this.reverse = reverse
  }

  async run() {
    const items = await new GetFullFunds({logger: this.logger}).run()
    console.log(`找到差距${bondStockGap}个点的转债：`)
    const stockDailyLimited = []
    items.forEach(({bond_id, bond_nm, price_raw, increase_rt, stock_nm, stock_id, stock_price, stock_increase_rt}) => {
      const gap = stock_increase_rt - increase_rt
      if (gap >= bondStockGap) {
        const line = `${bond_nm}（${bond_id}）, 转债价格 ${price_raw}（${increase_rt}%）| ${stock_nm}（${stock_id}），正股价格 ${stock_price}（${stock_increase_rt}%）`
        console.log(line)
        if (isDailyLimited(stock_id, stock_increase_rt)) {
          stockDailyLimited.push(line)
        }
      }
    })
    console.log("==========")
    console.log("正股疑似涨停的：")
    console.log(stockDailyLimited.join("\n"))
  }
}

module.exports = GapsFinder
