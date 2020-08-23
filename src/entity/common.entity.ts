import { PrimaryGeneratedColumn, Column } from 'typeorm'

export class CommonEntity {
  @Column('datetime', { precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  create_time: Date

  @Column('datetime', {
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  update_time: Date
}
