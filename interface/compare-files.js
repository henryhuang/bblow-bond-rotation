/**
 * Created by Henry Huang on 2021/5/26.
 */
const path = require('path')
const CompareLists = require('../lib/compareTwoLists')
const GenTwoList = require('../lib/genTwoList')

const oldFile = path.join(__dirname, '..', 'data', '2021-06-16.csv')
const newFile = path.join(__dirname, '..', 'data', '2021-06-22.csv')

new GenTwoList({newFile, oldFile})
    .run().then(([oldItems, newItems]) => {
        new CompareLists({oldItems, newItems}).run()
})
