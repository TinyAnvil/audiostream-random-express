import mic from 'mic'
import { Writable } from 'stream'

let i = 0

export const micInstance = mic()
export const micInputStream = micInstance.getAudioStream()

const writeableStream = new Writable({
  write(chunk, encoding, callback) {
    micInputStream.unpipe(writeableStream)
    writeableStream.end()
    callback()
  }
})

micInputStream.pipe(writeableStream)

micInputStream.on('data', (data) => {
  console.log(i, 'Recieved Input Stream: ' + data.length)
  i++
})

micInputStream.on('error', (err) => {
  cosole.log('Error in Input Stream: ' + err)
})

micInputStream.on('startComplete', () => {
  console.log('Got SIGNAL startComplete')
})

micInputStream.on('stopComplete', () => {
  console.log('Got SIGNAL stopComplete')
})

micInputStream.on('pauseComplete', () => {
  console.log('Got SIGNAL pauseComplete')
})

micInputStream.on('resumeComplete', () => {
  console.log('Got SIGNAL resumeComplete')
})

micInputStream.on('silence', () => {
  console.log('Got SIGNAL silence')
})

micInputStream.on('processExitComplete', () => {
  console.log('Got SIGNAL processExitComplete')
})
