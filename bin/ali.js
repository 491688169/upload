const co = require('co')
const OSS = require('ali-oss')
const ylog = require('ylog')

const rcUploadOptions = require('rc')('upload')
const {ak: accessKeyId, sk: accessKeySecret, ignore, region, bucket} = rcUploadOptions


const client = OSS({
    accessKeyId, accessKeySecret, region, bucket
})

function uploadFile(filePath, filename, prefix) {
    const key = eval(prefix) + filename

    co(function* () {
        const {res: {statusCode}, name} = yield client.put(key, filePath)

        if (statusCode === 200) {
            ylog.ok(`上传成功  ${name}`)
        } else {
            ylog.error(`上传异常  ${res}`)
        }
    }).catch(function (err) {
        ylog.error(err)
    })
}

function checkIfExist(filename, callback) {
    const key = eval(prefix) + filename

    co(function* () {
        const result = yield client.get(key)
        result && ylog.error(`上传失败  ${filename}  已存在`)
        return
    }).catch(function (err) {
        if (err.name === 'NoSuchKeyError') {
            callback && callback()
        }
    })

}

module.exports = {
    uploadFile,
    checkIfExist
}