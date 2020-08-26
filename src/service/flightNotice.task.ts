import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { FlightService } from './flight.service'
import { ScheduleService } from './schedule.service'
import { sendBatchSms } from 'src/api/sms.api'
import { FlightEntity } from 'src/entity/flight.entity'
import { FlightPriceChangeEntity } from 'src/entity/flightPriceChange.entity'
import { SmsFlightContent, SendSmsParam } from 'src/type/sms'
import * as dayjs from 'dayjs'

@Injectable()
export class FlightNoticeTask {
  constructor(
    private flightService: FlightService,
    private scheduleService: ScheduleService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'oneMinuteSchedule' })
  async oneMinuteSchedule() {
    const res = await this.scheduleService.getSchedule(null)

    for (const schedule of res.schedules) {
      // get flight data
      const { flights } = await this.flightService.getFlights(schedule.params)

      // prepare change data
      const {
        flightEntities,
        priceChangeEntities,
      } = await this.flightService.checkAndGetFlightInfo(flights)

      // send change notification sms
      const failedFlightIds = await this.generateAndSendSms({
        flightEntities,
        priceChangeEntities,
        phoneNumbers: schedule.phoneNumbers,
      })

      // save change
      const flightInfo = {
        flightEntities: flightEntities.filter(
          (x) => !failedFlightIds.includes(x.flightId),
        ),
        priceChangeEntities: priceChangeEntities.filter(
          (x) => !failedFlightIds.includes(x.flightId),
        ),
      }
      await this.flightService.saveFlightInfo(flightInfo)
    }
  }

  async generateAndSendSms(param: {
    phoneNumbers: string[]
    flightEntities: FlightEntity[]
    priceChangeEntities: FlightPriceChangeEntity[]
  }) {
    const failedFlightIds = []

    for (const priceChange of param.priceChangeEntities) {
      // TODO: 是否监听涨价
      if (priceChange.priceChangeTo < priceChange.priceChangeFrom) {
        const flightEntity = param.flightEntities.find(
          (x) => x.flightId == priceChange.flightId,
        )
        const content = {
          flight: `${flightEntity.airlineName}(${flightEntity.departureAirportName})`,
          time: dayjs(flightEntity.departureTime).format('MM月DD日HH:mm'),
          price: `${priceChange.priceChangeTo + flightEntity.tax}(+${
            flightEntity.tax
          })`,
        }
        const isSuccess = await this.sendSms({
          phoneNumbers: param.phoneNumbers,
          content,
        })
        if (!isSuccess) {
          failedFlightIds.push(flightEntity.flightId)
        }
      }
    }

    return failedFlightIds
  }

  async sendSms(param: { phoneNumbers: string[]; content: SmsFlightContent }) {
    const smsParam: SendSmsParam = {
      phoneNumbers: param.phoneNumbers,
      type: 'flight',
      contentParam: param.content,
    }
    console.log('sendSms params ======>', JSON.stringify(smsParam))
    const res = await sendBatchSms(smsParam)
    if (res.Code === 'OK') {
      return true
    } else {
      return false
    }
  }
}
