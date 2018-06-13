const mime = require('mime')

const qiniu = require('qiniu')
const ylog = require('ylog')
const rcUploadOptions = require('rc')('upload')

const {ak: accessKey, sk: secretKey, bucket, ignore, region} = rcUploadOptions

const config = new qiniu.conf.Config()
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

config.zone = qiniu.zone[region]

const formUploader = new qiniu.form_up.FormUploader(config)

const options = {
    scope: bucket
}

const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)

function uploadFile(filePath, filename) {
    const mimeType = mime.getType(filePath)
    const putExtra = new qiniu.form_up.PutExtra({}, mimeType)
    const key = filename.indexOf('dll.vendor') > -1 ? `staSrc4/${filename}` : `staSrc4/${process.env.PRODUCT}/${filename}`
    formUploader.putFile(uploadToken, key, filePath, putExtra, (resErr, resBody, resInfo) => {
        if (resErr) throw resErr

        if (resInfo.statusCode === 200) ylog.ok(`上传成功  ${resBody.key}`)
        else if (resInfo.statusCode === 614) ylog.error(`上传失败  ${key}  已存在`)
        else ylog.warn(`上传异常  ${key}  resBody`)
    })
}

// 七牛的文件存在检验在上传的response里可以知道，之前就不用检验了
function checkIfExist(callback) {
    callback && callback()
}

module.exports = {
    uploadFile,
    checkIfExist
}