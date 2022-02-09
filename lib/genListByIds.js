const GetFullFunds = require("./getFullFunds");
const {buildCSVContent} = require("./utils");

class GetItemsByIds {

    constructor({saveToFile, logger, ids}) {
        this.saveToFile = saveToFile
        this.logger = logger
        this.ids = ids
    }

    run () {
        return new Promise((resolve) => {
            new GetFullFunds({saveToFile: this.saveToFile, logger: this.logger})
                .run()
                .then((items) => {
                    const content = buildCSVContent(items)
                    resolve({
                        csvContent: content
                    })
                })
        })
    }
}

module.exports = GetItemsByIds
