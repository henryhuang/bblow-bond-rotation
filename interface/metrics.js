const GenMetrics = require('../lib/genMetrics')
const path = require('path')
const opn = require('better-opn')

new GenMetrics().run().then(() => {
    const homeHTML = path.join(__dirname, '..', 'data', 'metrics', 'index.html')
    console.log(homeHTML)
    opn(homeHTML)
})