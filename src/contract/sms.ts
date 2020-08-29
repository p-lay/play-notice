type SendSmsType = 'flight'

export interface SmsFlightContent {
  flight: string
  time: string
  price: number
}

export interface SendAliSmsResponse {
  Message: string
  Code: 'OK' | 'isv.MOBILE_NUMBER_ILLEGAL'
  RequestId: string
}

export interface SendSmsReq {
  phoneNumbers: string[]
  type: SendSmsType
  contentParam: Object
}
