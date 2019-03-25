#!/usr/bin/env node
import https from 'https'
import cheerio from 'cheerio'

const getPage = (pageUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    https
      .get(pageUrl, res => {
        let data = ''
        res.on('data', d => (data += d))
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })

const parseHtml = (html: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const $ = cheerio.load(html)
    const result = $(
      '.col-xs-6 > .table.table-condensed.small div[style="text-align: left; margin-left: 5px;"] span[style="font-size: 18px"]'
    )
      .first()
      .text()
    resolve(result)
  })

const main = async () => {
  try {
    const html = await getPage('https://info.ku.ac.th')
    const data = await parseHtml(html)
    process.stdout.write(`${data}\n`)
  } catch (err) {
    console.error(err)
  }
}

main()
