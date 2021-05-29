/**
 * Created by Henry Huang on 2021/5/26.
 */
const args = process.argv.slice(2);
const saveToFile = args[0] || false

const GetInitialListBackend = require('../lib/getInitialListBackend')
new GetInitialListBackend({saveToFile}).run().then(console.log)
