/**
 * Created by Henry Huang on 2021/5/26.
 */
const fs = require('fs')
const path = require('path')
const moment = require('moment')

const getLatestData = () => {
  let lastDataName = null;
  let lastFile = null;
  fs.readdirSync(path.join('data'))
      .filter((file) => !fs.lstatSync(path.join('data', file)).isDirectory())
      .forEach(file => {
        const name = file.split(path.extname(file))[0];
        if (lastDataName) {
          if (moment(name, 'YYYY-MM-DD').diff(moment(lastDataName, 'YYYY-MM-DD')) > 0) {
            lastDataName = name
            lastFile = file
          }
        } else {
          lastDataName = name
          lastFile = file
        }
  });
  return lastFile;
}

module.exports = {
  getLatestData
}
