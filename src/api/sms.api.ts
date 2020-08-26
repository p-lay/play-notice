import * as Core from '@alicloud/pop-core'
import * as secret from 'src/config/secret.json'
import * as smsTemplate from 'src/config/smsTemplate.json'
import { SendSmsParam, SendSmsResponse } from 'src/type/sms'

var client = new Core({
  accessKeyId: secret.sms.accessKeyId,
  accessKeySecret: secret.sms.accessKeySecret,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
})

const apiConfig = {
  RegionId: 'cn-hangzhou',
  SignNameJson: '屁蕾',
}

export const sendBatchSms = (
  params: SendSmsParam,
): Promise<SendSmsResponse> => {
  const apiParams = {
    ...apiConfig,
    TemplateCode: smsTemplate[params.type],
    TemplateParamJson: JSON.stringify(params.contentParam),
    PhoneNumberJson: JSON.stringify(params.phoneNumbers),
  }
  return new Promise((resolve, reject) => {
    client
      .request('SendBatchSms', apiParams, {
        method: 'POST',
      })
      .then(
        (result: any) => {
          resolve(result)
        },
        (ex) => {
          reject()
        },
      )
  })
}
