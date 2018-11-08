import '@babel/polyfill'
import 'isomorphic-fetch'

import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import logger from 'morgan'
import _ from 'lodash'
import shajs from 'sha.js'
import { micInstance, micInputStream } from './stream'
import { Writable } from 'stream'
import Promise from 'bluebird'
import bip39 from 'bip39'

let collection = []
let running = false

micInstance.start()

const isDev = process.env.NODE_ENV === 'development'

const app = express()
const port = process.env.PORT || 4000

app.use(logger('dev'))
app.use(cors())
app.use(json())

setInterval(() => {
  if (running)
    return

  const slice = _.remove(collection, () => true)

  if (slice.length === 0)
    return

  running = true

  Promise.map(slice, async (res) => {
    const sha = await new Promise((resolve, reject) => {
      const writeableStream = new Writable({
        write(chunk, encoding, callback) {
          const sha = shajs('sha256').update(chunk).digest('hex')
          const mnemonic = bip39.entropyToMnemonic(sha)

          micInputStream.unpipe(writeableStream)
          writeableStream.end()

          console.log(sha)
          resolve(mnemonic)
          callback()
        }
      })

      micInputStream.pipe(writeableStream)
    })

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': sha.length
    })
    res.end(sha)

    return sha
  }, {concurrency: 1})
  .then((res_arr) => running = false)
}, 100)

app.get('/', (req, res, next) => {
  collection.push(res)
})

app.use((req, res) => res.sendStatus(404))

app.use((err, req, res, next) => {
  console.error(err)

  res.status(_.get(err, 'response.status', 500))
  res.json(_.get(err, 'response.data', err))
})

const server = app.listen(port, () => {
  console.log('Express server is listening on port', port)
})

process.on('uncaughtException', (err) => {
  console.error(err)
  micInstance.stop()
})

process.on('SIGTERM', () => {
  server.close(() => micInstance.stop())

  setTimeout(() => {
    micInstance.stop()
    process.exit(1)
  }, 30 * 1000)
})

export default app
