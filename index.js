const fs = require('fs')
const path = require('path')

const ylog = require('ylog')
const {dist, ignore, uploader, prefix} = require('rc')('upload')

const qiniu = require('./bin/qiniu')
const ali = require('./bin/ali')

const {uploadFile, checkIfExist} = uploader.indexOf('qiniu') > -1 ? qiniu : ali

const rootDir = process.cwd()
const distDir = path.join(rootDir, eval(dist))

function fileRecursion(dir = distDir) {
    if (ignoreCheck(ignore, dir)) return ylog.info('忽略文件夹', dir)
    fs.readdir(dir, (err, files) => {
        if (err) ylog.error(err)
        else {
            files.forEach((filename) => {
                const file = path.join(dir, filename)
                fs.stat(file, (err, status) => {
                    if (err) ylog.error('获取文件status失败')

                    if (status.isDirectory()) {
                        fileRecursion(file)
                    } else if (status.isFile()) {
                        if (ignoreCheck(ignore, file)) {
                            ylog.info(`忽略文件  ${file}`)
                            return
                        }
                        checkIfExist(filename, prefix, uploadFile.bind(this, file, filename, prefix))
                    }
                })
            })
        }
    })
}

function ignoreCheck(checks, file) {
    return checks.some(c => {
        const path = rootDir + eval(dist) + c
        return file.indexOf(path) === 0
    })
}


exports.upload = fileRecursion
