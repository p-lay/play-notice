import * as Core from '@alicloud/pop-core'
import * as secret from '@/config/secret.json'
import * as smsTemplate from '@/config/smsTemplate.json'
import { SendSmsParam, SendSmsResponse } from '@/type/sms'

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

export const SendSms = (params: SendSmsParam): Promise<SendSmsResponse> => {
  const apiParams = {
    ...apiConfig,
    TemplateCode: smsTemplate[params.type],
    TemplateParam: JSON.stringify(params.contentParam),
    PhoneNumbers: params.phoneNumbers.join(','),
  }
  try {
    return new Promise((resolve, reject) => {
      console.log('SendSms param', apiParams)
      client
        .request('SendSms', apiParams, {
          method: 'POST',
        })
        .then(
          (result: any) => {
            console.log('SendSms result', JSON.stringify(result))
            resolve(result)
          },
          (ex) => {
            console.log('SendSms error', ex)
            reject()
          },
        )
    })
  } catch (err) {
    console.log('SendSms catch', err)
    return Promise.resolve({
      Code: 'error',
    }) as any
  }
}
