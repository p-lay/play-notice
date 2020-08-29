import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { CommonEntity } from './common.entity'
import { columnOption } from '@/util/entity'

@Entity('sms')
export class SmsEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column({
    name: 'template_code',
  })
  templateCode: string

  @Column({ ...columnOption.json, name: 'template_param' })
  templateParam: string

  @Column({
    name: 'phone_numbers',
  })
  phoneNumbers: string

  @Column({
    name: 'send_success',
  })
  sendSuccess: boolean

  @Column({
    name: 'send_response_msg',
  })
  sendResponseMsg: string
}
