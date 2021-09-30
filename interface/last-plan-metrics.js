const { getLatestNameAndContent, parsePlanCSVContentToJson, callListMetaData } = require('../lib/utils')
const GetFullFunds = require('../lib/getFullFunds')

const { content: latestContent } = getLatestNameAndContent()
parsePlanCSVContentToJson(latestContent).then(results => {
    const ids = results.map(r => r.bond_id)
    console.log(ids)
    new GetFullFunds({})
        .run()
        .then(items => {
            const itemsFilter = items.filter(item => ids.indexOf(item.bond_id) > -1)
            console.log(itemsFilter)
            console.log(itemsFilter.length)
            console.log(callListMetaData(itemsFilter))
        })
})