import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { FlightService } from './flight.service'
import { ScheduleService } from './schedule.service'
import { SendSms } from '@/api/sms.api'
import { FlightEntity } from '@/entity/flight.entity'
import { FlightPriceChangeEntity } from '@/entity/flightPriceChange.entity'
import { SmsFlightContent, SendSmsParam } from '@/type/sms'
import * as dayjs from 'dayjs'
import {
  FlightScheduleFilter,
  FlightScheduleParam,
} from '@/type/flightSchedule'
import { Schedule } from '@/contract/schedule'
import { GetFlightsReq } from '@/contract/flight'

@Injectable()
export class FlightNoticeTask {
  constructor(
    private flightService: FlightService,
    private scheduleService: ScheduleService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'fiveMinuteSchedule' })
  async fiveMinuteSchedule() {
    const res = await this.scheduleService.getSchedule(null)

    for (const schedule of res.schedules) {
      if (schedule.type === 'flight') {
        await this.runFlightSchedule(schedule)
      }
    }
  }

  async runFlightSchedule(schedule: Schedule) {
    const flightParams: FlightScheduleParam = schedule.params
    const allHandlePromise = flightParams.dateList.map(async (date) => {
      const { dateList, ...params }: any = flightParams
      params.date = date
      try {
        await this.handleFlight(schedule, params)
      } catch (err) {
        console.error('handle flight error', err)
      }
    })

    await Promise.all(allHandlePromise)
  }

  async handleFlight(schedule: Schedule, requestParams: GetFlightsReq) {
    // get flight data
    const { flights } = await this.flightService.getFlights(requestParams)

    // prepare change data
    const {
      flightEntities,
      priceChangeEntities,
    } = await this.flightService.checkAndGetFlightInfo(flights)

    // send change notification sms
    const failedFlightIds = await this.generateAndSendSms({
      flightEntities,
      priceChangeEntities,
      schedule,
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

  isFlightInclude(
    filter: FlightScheduleFilter,
    priceChange: FlightPriceChangeEntity,
    flight: FlightEntity,
  ) {
    if (priceChange.priceChangeTo > priceChange.priceChangeFrom) {
      // 降价
      return false
    }
    if (!filter) {
      return true
    }

    if (
      filter.highestPrice &&
      priceChange.priceChangeTo > filter.highestPrice
    ) {
      // 最高价
      return false
    }
    const time = dayjs(flight.departureTime).format('HH:MM')
    if (filter.departureTimeBefore) {
      if (dayjs(time).isAfter(dayjs(filter.departureTimeBefore))) {
        // 出发时间早于条件
        return false
      }
    }
    if (filter.departureTimeAfter) {
      if (dayjs(time).isBefore(dayjs(filter.departureTimeAfter))) {
        // 出发时间晚于条件
        return false
      }
    }
    if (filter.departureTimeInterval?.length === 2) {
      // 出发时间区间条件
      if (dayjs(time).isBefore(dayjs(filter.departureTimeInterval[0]))) {
        return false
      }
      if (dayjs(time).isAfter(dayjs(filter.departureTimeInterval[1]))) {
        return false
      }
    }

    return true
  }

  async generateAndSendSms(param: {
    schedule: Schedule
    flightEntities: FlightEntity[]
    priceChangeEntities: FlightPriceChangeEntity[]
  }) {
    const failedFlightIds = []

    for (const priceChange of param.priceChangeEntities) {
      const flightEntity = param.flightEntities.find(
        (x) => x.flightId == priceChange.flightId,
      )
      if (
        this.isFlightInclude(
          param.schedule.filter as any,
          priceChange,
          flightEntity,
        )
      ) {
        const content = {
          flight: `${flightEntity.airlineName}(${flightEntity.departureAirportName})`,
          time: dayjs(flightEntity.departureTime).format('MM月DD日HH:mm'),
          price: priceChange.priceChangeTo + flightEntity.tax,
        }
        const isSuccess = await this.sendSms({
          phoneNumbers: param.schedule.phoneNumbers,
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
    const res = await SendSms(smsParam)
    if (res.Code === 'OK') {
      return true
    } else {
      return false
    }
  }
}
