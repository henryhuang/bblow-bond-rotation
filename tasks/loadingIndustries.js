/**
 * Created by Henry Huang on 2021/8/26.
 */
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const IndustryFetcher = require('../lib/industryFetcher')

const date = new Date()
const url = `https://www.jisilu.cn/data/cbnew/cb_list/?___jsl=LST___t=${date.getTime()}`
console.log(`Loading data from ${url}`)

const cookie = fs.readFileSync(path.join(__dirname, '..', 'cookie')).toString().replace('\n', '')

const createFormData = () => {
  return 'fprice=&tprice=&curr_iss_amt=&volume=&svolume=&premium_rt=&ytm_rt=&rating_cd=&is_search=Y&market_cd%5B%5D=shmb&market_cd%5B%5D=shkc&market_cd%5B%5D=szmb&market_cd%5B%5D=szcy&btype=&listed=Y&qflag=N&sw_cd=&bond_ids=&rp=50'
}

const run = async () => {

  const response = await axios({
    method: 'post',
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookie
    },
    data: createFormData()
  })

  if (response.data.rows) {
    const ids = response.data.rows.map(r => r.cell.bond_id)
    console.log(`Totally found ${ids.length}`)
    let done = 0
    ids.forEach(id => {
      console.log(`Finding industry for id ${id}`)
      try {
        new IndustryFetcher().fetch(id)
        console.log(`Finish ${id}, total ${ids.length}, done ${++done}`)
      } catch (e) {
        console.log(`Error for ${id}, total ${ids.length}, done ${done}`)
      }
    })
  }

}

run().then()
