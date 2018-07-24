const fs = require('fs')
const path = require('path')

const ylog = require('ylog')
const {dist, ignore, uploader} = require('rc')('upload')

const qiniu = require('./bin/qiniu')
const ali = require('./bin/ali')

const {uploadFile, checkIfExist} = uploader.indexOf('qiniu') > -1 ? qiniu : ali

const rootDir = process.cwd()
const distDir = path.join(rootDir, dist)

function fileRecursion(target) {
    fs.readdir(distDir, (err, files) => {
        if (err) ylog.error(err)
        else {
            files.forEach((filename) => {
                const file = path.join(distDir, filename)
                if (ignoreCheck(ignore, file)) {
                    ylog.info(`忽略文件  ${file}`)
                    return
                }
                fs.stat(file, (err, status) => {
                    if (err) ylog.error('获取文件status失败')

                    if (status.isDirectory()) {
                        fileRecursion(file)
                    } else if (status.isFile()) {
                        checkIfExist(filename, uploadFile.bind(this, file, filename, target))
                    }
                })
            })
        }
    })
}

function ignoreCheck(checks, file) {
    return checks.some(c => {
        const check = typeof c === 'string' ? eval(`/${c}/g`) : c
        try {
            return check.test(file)
        } catch (e) {
            ylog.error(e)
        }
    })
}


exports.upload = fileRecursion
