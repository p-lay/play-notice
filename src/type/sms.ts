type SendSmsType = 'flight'

export interface SmsFlightContent {
  flight: string
  time: string
  price: number
}

export interface SendSmsParam {
  phoneNumbers: string[]
  type: SendSmsType
  contentParam: Object
}

export interface SendSmsResponse {
  Message: string
  Code: 'OK' | 'isv.MOBILE_NUMBER_ILLEGAL'
  RequestId: string
}
