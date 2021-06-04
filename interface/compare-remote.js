/**
 * Created by Henry Huang on 2021/5/26.
 */
const path = require('path')
const GetInitialListBackend = require('../lib/getInitialListBackend')
const CompareLists = require('../lib/compareTwoLists')
const GenTwoList = require('../lib/GenTwoList')
const { getLatestData } = require('../lib/utils')

const args = process.argv.slice(2);
const oldFileName = args[0]

let file = oldFileName
if (!file) {
  file = getLatestData()
}
const oldFile = path.join(__dirname, '..', 'data', file)

new GetInitialListBackend({ saveToFile: false })
    .run()
    .then(({csvContent: newContent}) => {
      new GenTwoList({
        oldFile,
        newContent
      }).run().then(([oldItems, newItems]) => {
        new CompareLists({ newItems, oldItems }).run()
      })
    })
