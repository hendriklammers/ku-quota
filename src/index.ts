#!/usr/bin/env node
import https from 'https'

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

const main = async () => {
  try {
    // const page = await getPage(url)
    // console.log(page)
  } catch (err) {
    console.error(err)
  }
}

main()
