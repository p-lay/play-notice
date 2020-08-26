import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { CommonEntity } from './common.entity'
import { columnOption } from 'src/util/entity'

@Entity('schedule')
export class ScheduleEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  name: string

  @Column()
  type: string

  @Column(columnOption.json)
  params: string

  @Column(columnOption.json)
  phoneNumberJson: string
}
