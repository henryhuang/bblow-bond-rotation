const axios = require('axios')
const { fix2, buildPrettyCBIndexText } = require('../utils')

const URL = 'https://www.jisilu.cn/webapi/cb/index_quote/'
class CBIndex {

    async fetch(pretty = false) {
        const resp = await axios.get(URL)
        const data = resp.data.data
        data.avg_dblow = fix2(Number(data.avg_price) + Number(data.avg_premium_rt))
        if (pretty) {
            return buildPrettyCBIndexText(data)
        } else {
            return data
        }
    }

}

module.exports = CBIndex

new CBIndex().fetch(true).then(console.log)