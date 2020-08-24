import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { CommonEntity } from './common.entity'

@Entity('flight')
export class FlightEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column({
    name: 'flight_id',
  })
  flightId: string

  @Column()
  price: number

  @Column()
  tax: number

  @Column({
    name: 'airline_name',
  })
  airlineName: string

  @Column({
    name: 'airline_description',
  })
  airlineDescription: string

  @Column({
    name: 'departure_airport_name',
  })
  departureAirportName: string

  @Column({
    name: 'departure_time',
  })
  departureTime: string

  @Column({
    name: 'arrival_airport_name',
  })
  arrivalAirportName: string

  @Column({
    name: 'arrival_time',
  })
  arrivalTime: string

  @Column({
    name: 'stop_times',
  })
  stopTimes: number
}
