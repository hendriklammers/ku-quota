#!/usr/bin/env node
import https from 'https'
import cheerio from 'cheerio'
import dotenv from 'dotenv'

dotenv.config()

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

const getUrl = (): Promise<string> =>
  new Promise((resolve, reject) => {
    if (process.env.URL) {
      resolve(process.env.URL)
    } else {
      reject(new Error('No URL set in variables'))
    }
  })

const main = async () => {
  try {
    const url = await getUrl()
    const html = await getPage(url)
    const data = await parseHtml(html)
    process.stdout.write(`${data}\n`)
  } catch (err) {
    console.error(err)
  }
}

main()
