import fs from 'fs'
import path from 'path'
import { IMAGE_LOAD_PATH, JSON_LOAD_PATH } from './config'

export const readJSONAsync = (filename) => new Promise((resolve, reject) => {
  fs.readFile(path.resolve(JSON_LOAD_PATH, filename), 'utf-8', function (err, data) {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
})

export const getRandomFilename = (mimetype) => {
  const all = 'qwertyuiopasdfghjklzxcvbnm_1234567890'
  let filename = ''
  let suffix = '.' + mimetype.split('/')[1]

  for(let i = 0;i < 36;i++) {
    filename += all[parseInt(Math.random() * (all.length - 1))]
  }

  return filename + suffix
}

export const getRandomFilenameWithSuffix = (suffix) => {
  const all = 'qwertyuiopasdfghjklzxcvbnm_1234567890'
  let filename = ''

  for(let i = 0;i < 36;i++) {
    filename += all[parseInt(Math.random() * (all.length - 1))]
  }

  return filename + suffix
}

export const writeWithStream = (stream, mimetype) => new Promise((resolve, reject) => {
  let filename = getRandomFilename(mimetype)
  let out = fs.createWriteStream(path.resolve(IMAGE_LOAD_PATH, filename))

  stream.on('data', data => out.write(data))
  stream.on('end', () => resolve('image/' + filename))
  stream.on('error', reject)
})

export const writeJSONSync = (buffer, fname) => new Promise((resolve, reject) => {
  let filename = fname || getRandomFilenameWithSuffix('.json')

  fs.writeFile(path.resolve(JSON_LOAD_PATH, filename), buffer, { flag: "a" }, function (err) {
    if(err){
        reject(err);
    }else {
        resolve(filename)
    }
  })
})

export const deleteJSON = (filename) => {
  fs.unlinkSync(path.resolve(JSON_LOAD_PATH, filename));
}