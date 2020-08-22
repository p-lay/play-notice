import { Injectable } from '@nestjs/common'
const qiniu = require('qiniu')
import { config } from '../config'

@Injectable()
export class QiniuService {
  async getQiniuToken(param: any) {
    const expiresSecond = 1800 // 60s * 30
    const mac = new qiniu.auth.digest.Mac(config.qiniu.ak, config.qiniu.sk)
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: config.qiniu.bucket,
      expires: expiresSecond,
    })
    const uploadToken = await putPolicy.uploadToken(mac)

    return {
      token: uploadToken,
      expires_second: expiresSecond,
    }
  }
}
