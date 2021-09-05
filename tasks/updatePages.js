/**
 * Created by Henry Huang on 2021/9/5.
 */
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const Handlebars = require("handlebars")
const { csv2md } = require('csv2md')

const srcFolder = path.join(__dirname, '..', 'data')
const destFolder = path.join(__dirname, '..', 'docs')

const templateFile = path.join(__dirname, 'page-template.handlebars')
const template = Handlebars.compile(fs.readFileSync(templateFile).toString());

fs.readdirSync(srcFolder)
    .filter(
        f => fs.statSync(path.join(srcFolder, f)).isFile()
            && path.extname(f) === '.csv')
    .sort()
    .forEach(f => {
      const csvContent = fs.readFileSync(path.join(srcFolder, f)).toString()
      const fileName = f.split('.')[0]
      const destContent = template({
        table: csv2md(csvContent, {}),
        title: moment(fileName, 'YYYY-MM-DD').format('YYYY年M月D日')
      })
      fs.writeFileSync(path.join(destFolder, `${fileName}.md`), destContent)
      console.log(`Copied: ${f}`)
    })
