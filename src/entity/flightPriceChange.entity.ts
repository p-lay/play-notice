import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { CommonEntity } from './common.entity'

@Entity('flight_price_change')
export class FlightPriceChangeEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column({
    name: 'flight_id',
  })
  flightId: string

  @Column({
    name: 'price_change_from',
  })
  priceChangeFrom: number

  @Column({
    name: 'price_change_to',
  })
  priceChangeTo: number

  @Column()
  tax: number
}
