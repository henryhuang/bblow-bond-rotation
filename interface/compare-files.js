/**
 * Created by Henry Huang on 2021/5/26.
 */
const path = require('path')
const CompareLists = require('../lib/compareLists')

const oldFile = path.join(__dirname, 'data', '2021-05-24.csv')
const newFile = path.join(__dirname, 'data', 'download', '2021-05-26-20-47-1.csv')

new CompareLists({newFile, oldFile}).run()
