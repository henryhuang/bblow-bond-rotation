/**
 * Created by Henry Huang on 2021/8/5.
 */
const { Octokit } = require('@octokit/rest');
const { token } = require('../env.json')
const { getLatestNameAndContent } = require('./utils')

class LatestPusher {
  constructor() {
  }

  async run() {
    const octokit = new Octokit({
      auth: token,
    });
    // const gistId = "df815bf1b0390b27052857b2b8debb20";
    //
    // const gist = await octokit.rest.gists.get({
    //   gist_id: gistId,
    // });
    // console.log(gist)
    // const files = gist.data.files
    // console.log(Object.values(files)[0])
    const {fileName, content} = getLatestNameAndContent();
    console.log(content)
    console.log(fileName)
    const date = fileName.split('.')[0]
    const files = {
      [fileName]: content
    };
    await octokit.rest.gists.create({
      files,
    })
  }
}

new LatestPusher().run()
