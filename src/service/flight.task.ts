import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { FlightService } from './flight.service'
import { ScheduleService } from './schedule.service'

@Injectable()
export class FlightTask {
  constructor(
    private flightService: FlightService,
    private scheduleService: ScheduleService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'oneMinuteSchedule' })
  async oneMinuteSchedule() {
    console.log('start schedule')
    const res = await this.scheduleService.getSchedule(null)

    res.schedules.forEach(async (schedule) => {
      const { flights } = await this.flightService.getFlights(schedule.params)
      const {
        flightEntities,
        priceChangeEntities,
      } = await this.flightService.checkAndGetFlightInfo(flights)
      // TODO: generate message and send
      await this.flightService.saveFlightInfo({
        flightEntities,
        priceChangeEntities,
      })
    })
  }
}
