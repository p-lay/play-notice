import * as Core from '@alicloud/pop-core'
import * as secret from '@/config/secret.json'
import * as smsTemplate from '@/config/smsTemplate.json'
import { SendSmsReq, SendAliSmsResponse } from '@/contract/sms'
import { Logger } from '@nestjs/common'

var client = new Core({
  accessKeyId: secret.sms.accessKeyId,
  accessKeySecret: secret.sms.accessKeySecret,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
})

const apiConfig = {
  RegionId: 'cn-hangzhou',
  SignName: '屁蕾',
}

export const sendSms = (
  params: SendSmsReq,
  logger: Logger,
): Promise<SendAliSmsResponse> => {
  const apiParams = {
    ...apiConfig,
    TemplateCode: smsTemplate[params.type],
    TemplateParam: JSON.stringify(params.contentParam),
    PhoneNumbers: params.phoneNumbers.join(','),
  }
  try {
    return new Promise((resolve, reject) => {
      logger.log(`SendSms param: ${JSON.stringify(apiParams)}`)
      client
        .request('SendSms', apiParams, {
          method: 'POST',
        })
        .then(
          (result: any) => {
            logger.log(`SendSms result: ${JSON.stringify(result)}`)
            resolve(result)
          },
          (ex) => {
            logger.error(`SendSms error: ${ex}`)
            resolve({
              Message: 'catch ali sms error',
              Code: 'error',
            })
          },
        )
    })
  } catch (err) {
    logger.error(`SendSms catch: ${err}`)
    return Promise.resolve({
      Message: 'catch wrapper error',
      Code: 'error',
    })
  }
}
