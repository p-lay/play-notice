type SendSmsType = 'flight'

export interface SmsFlightContent {
  flight: string
  airport: string
  time: string
  price: number
  tax: number
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
