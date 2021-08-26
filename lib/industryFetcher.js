/**
 * Created by Henry Huang on 2021/8/26.
 */
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const cache = require('../data/industry.json')

class IndustryFetcher {

  async fetch(id) {
    const cacheData = cache[`${id}`]
    if (cacheData) {
      return cacheData
    } else {
      const url = `https://www.jisilu.cn/data/convert_bond_detail/${id}`
      console.log(`Loading ${url}`)
      try {
        const response = await axios({
          method: 'get',
          timeout: 5000,
          url
        })
        const $ = cheerio.load(response.data)
        const data = $("#tc_data > div > div.info_data > table > tbody > tr:nth-child(1) > td > a:nth-child(2)").text().trim()
        if (data) {
          cache[`${id}`] = data
          fs.writeFileSync(path.join(__dirname, '../data/industry.json'), JSON.stringify(cache, null, 2))
          return data
        } else {
          return null
        }
      } catch (e) {
        throw e
      }
    }
  }

}

module.exports = IndustryFetcher
