/**
 * Created by Henry Huang on 2021/5/31.
 */
const path = require('path')
const CompareLists = require('../lib/compareTwoLists')
const GenRotationPlan = require('../lib/genRotationPlan')
const GenTwoList = require('../lib/genTwoList')
const GetInitialListBackend = require('../lib/getInitialListBackend')
const { getLatestData } = require('../lib/utils')

const args = process.argv.slice(2);
const oldFileName = args[0]

let file = oldFileName
if (!file) {
  file = getLatestData()
}
const oldFile = path.join(__dirname, '..', 'data', file)

new GetInitialListBackend({ saveToFile: true })
    .run()
    .then((newContent) => {
      new GenTwoList({ newContent, oldFile })
          .run().then(([oldItems, newItems]) => {
        new CompareLists({ oldItems, newItems, printList: false })
            .run()
            .then(({ newAdded, oldRemoved }) => {
              new GenRotationPlan({
                oldList: oldItems,
                newList: newItems,
                addList: newAdded
              }).run()
            })
      })
    })


