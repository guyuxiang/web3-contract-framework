const p = require('path')
const fs = require('fs')
const dbPath = p.join(__dirname, '../../deployments', 'address.json') // 合约地址
const configPath = p.join(__dirname, '../', 'config.json') // 参数配置
const contractTemplate = p.join(__dirname, '../deploys', 'deployTemplate.json') // 合约模板

const db  = {
  readAddress(path = dbPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
        if (err) return reject(err)
        resolve(JSON.parse(data.toString()))
      })
    })
  },
  write(data, path = dbPath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON
        .stringify(data, '', '\t'), (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  },
  readconfig(path = configPath) {
    return new Promise((resolve, reject) => {
      fs.readFile( path, {
        encoding: 'utf8'
      }, (err, data) => {
        if (err) return reject(err)
        let config = JSON.parse(data.toString())
        resolve(config[hre.network.name])
      })
    })
  },
  readContractTemplate(path = contractTemplate) {
    return new Promise((resolve, reject) => {
      fs.readFile( path, {
        encoding: 'utf8'
      }, (err, data) => {
        if (err) return reject(err)
        resolve(JSON.parse(data.toString()))
      })
    })
  }
}

module.exports = db
