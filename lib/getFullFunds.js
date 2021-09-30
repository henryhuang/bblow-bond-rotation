const chalk = require("chalk");
const moment = require("moment");
const axios = require("axios");
const industries = require("../data/industry.json");
const fs = require("fs");
const path = require("path");

const cookie = fs.readFileSync(path.join(__dirname, '..', 'cookie')).toString().replace('\n', '')

class GetFullFunds {

    constructor({saveToFile, logger}) {
        this.saveToFile = saveToFile
        this.logger = logger
    }

    run() {

        const date = new Date()
        const url = `https://www.jisilu.cn/data/cbnew/cb_list/?___jsl=LST___t=${date.getTime()}`
        console.log(`Will collect data at ${chalk.green(moment(date).format('YYYY-MM-DD HH:mm:SS'))}`)
        console.log(`Loading data from ${url}`)

        return new Promise((resolve, reject) => {
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
                    let items = response.data.rows.map(r => {
                        return {
                            bond_id: r.cell.bond_id,
                            bond_nm: r.cell.bond_nm,
                            price: Number(r.cell.price),
                            premium_rt: parseFloat(r.cell.premium_rt),
                            curr_iss_amt: Number(r.cell.curr_iss_amt),
                            dblow: Number(r.cell.dblow),
                            industry: industries[`${r.cell.bond_id}`],
                            ratingCode: r.cell.rating_cd,
                            redeemDate: r.cell.redeem_dt
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
    }
}

const createFormData = () => {
    return 'fprice=&tprice=&curr_iss_amt=&volume=&svolume=&premium_rt=&ytm_rt=&rating_cd=&is_search=Y&market_cd%5B%5D=shmb&market_cd%5B%5D=shkc&market_cd%5B%5D=szmb&market_cd%5B%5D=szcy&btype=&listed=Y&qflag=N&sw_cd=&bond_ids=&rp=50'
}

module.exports = GetFullFunds