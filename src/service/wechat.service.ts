import { Injectable } from '@nestjs/common'
import { request } from '../util/request'
import { config } from '../config'

type WechatSession = {
  openid: string
  session_key: string
}

@Injectable()
export class WechatService {
  constructor() {}

  async getWechatSession(code: string): Promise<WechatSession> {
    const res = await request.get(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        params: {
          appid: config.AppID,
          grant_type: 'authorization_code',
          js_code: code,
          secret: config.AppSecret,
        },
      },
    )

    return res.data
  }
}
