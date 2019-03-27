#!/usr/bin/env node
import https from 'https'
import util from 'util'
import fs from 'fs'
import path from 'path'
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

interface CacheData {
  content: string
  date: number
}

type Cache = CacheData | null

const cacheFile = path.join(__dirname, 'cache')

const writeCache = ({ content, date }: CacheData) =>
  util.promisify(fs.writeFile)(cacheFile, `${date} ${content}`, 'utf8')

const minToMillis = (min: number) => min * 60 * 1000

const validateCacheDate = ({ date }: CacheData): boolean =>
  Date.now() - date < minToMillis(5)

const checkCache = (): Promise<Cache> =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(cacheFile)) {
      resolve(null)
    }
    fs.readFile(cacheFile, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      }
      const matches = /^(\d+)\s(.*)$/.exec(data)
      if (matches) {
        const cache = {
          date: parseInt(matches[1], 10),
          content: matches[2],
        }
        if (validateCacheDate(cache)) {
          resolve(cache)
        } else {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })

const main = async () => {
  try {
    const cached = await checkCache()
    if (cached) {
      // Cache is available and hasn't expired
      process.stdout.write(`${cached.content}\n`)
    } else {
      const html = await getPage('https://info.ku.ac.th')
      const data = await parseHtml(html)
      writeCache({ date: Date.now(), content: data })
      process.stdout.write(`${data}\n`)
    }
  } catch (err) {
    console.error(err)
  }
}

main()
