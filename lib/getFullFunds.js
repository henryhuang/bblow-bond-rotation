const chalk = require("chalk");
const moment = require("moment");
const axios = require("axios");
const industries = require("../data/industry.json");
const { endPoint } = require("../config.json");
// const fs = require("fs");
// const path = require("path");
const SessionLoader = require("../web");

// const cookie = fs.readFileSync(path.join(__dirname, '..', 'cookie')).toString().replace('\n', '')

class GetFullFunds {

    constructor({saveToFile, logger}) {
        this.saveToFile = saveToFile
        this.logger = logger
    }

    run() {

        const date = new Date()
        // const url = `https://www.jisilu.cn/data/cbnew/cb_list/?___jsl=LST___t=${date.getTime()}`
        const url = endPoint
        console.log(`Will collect data at ${chalk.green(moment(date).format('YYYY-MM-DD HH:mm:SS'))}`)
        console.log(`Loading data from ${url}`)

        return new Promise((resolve, reject) => {

            new SessionLoader().run().then(session => {
                const cookie = session
                axios({
                    method: 'post',
                    url,
                    headers: {
                        'content-Type': 'application/x-www-form-urlencoded',
                        'cookie': cookie,
                        'Init': 1
                    },
                    data: createFormData()
                }).then((response) => {
                    if (response.data.data) {
                        let items = response.data.data.map(r => {
                            return {
                                bond_id: r.bond_id,
                                bond_nm: r.bond_nm,
                                listDate: r.list_dt,
                                price: r.price,
                                premium_rt: r.premium_rt,
                                curr_iss_amt: r.curr_iss_amt,
                                dblow: r.dblow,
                                industry: industries[`${r.bond_id}`],
                                ratingCode: r.rating_cd,
                                maturityDate: r.short_maturity_dt,
                                redeemDate: r.redeem_dt,
                                price_raw: r.price,
                                increase_rt: r.increase_rt,
                                stock_nm: r.stock_nm,
                                stock_id: r.stock_id,
                                stock_price: r.sprice,
                                stock_increase_rt: r.sincrease_rt
                            }
                        })
                        if (this.logger) {
                            this.logger.log(`总共获取到${items.length}个基金`)
                        }
                        if (items.length < 100) {
                            reject(new Error('需要更新cookie，先登陆https://www.jisilu.cn/data/cbnew/cb_list/?___jsl=LST___t然后通过devtool去查看请求的cookie'))
                        }
                        resolve(items)
                    }
                })
            })
        })
    }
}

const createFormData = () => {
    return 'fprice=&tprice=&curr_iss_amt=&volume=&svolume=&premium_rt=&ytm_rt=&rating_cd=&is_search=Y&market_cd%5B%5D=shmb&market_cd%5B%5D=shkc&market_cd%5B%5D=szmb&market_cd%5B%5D=szcy&btype=&listed=Y&qflag=N&sw_cd=&bond_ids=&rp=50'
}

module.exports = GetFullFunds
