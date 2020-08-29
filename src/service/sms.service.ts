import { Injectable, Logger } from '@nestjs/common'
import { SendSmsReq } from '../contract/sms'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SmsEntity } from '../entity/sms.entity'
import { sendSms } from '@/api/sms.api'
import * as smsTemplate from '@/config/smsTemplate.json'

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)
  constructor(
    @InjectRepository(SmsEntity)
    readonly repo: Repository<SmsEntity>,
  ) {}

  async sendSms(param: SendSmsReq): Promise<any> {
    const res = await sendSms(param, this.logger)
    const sendSuccess = res.Code === 'OK'

    const entity = new SmsEntity()
    entity.templateCode = smsTemplate[param.type]
    entity.templateParam = JSON.stringify(param.contentParam)
    entity.sendResponseMsg = res.Message
    entity.sendSuccess = sendSuccess
    entity.phoneNumbers = param.phoneNumbers.join(',')
    this.repo.save(entity)

    return sendSuccess
  }
}
