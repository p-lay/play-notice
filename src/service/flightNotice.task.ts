import { Injectable, Logger } from '@nestjs/common'
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
import { getDayjsTime } from '@/util/flight'

@Injectable()
export class FlightNoticeTask {
  private readonly logger = new Logger(FlightNoticeTask.name)
  constructor(
    private flightService: FlightService,
    private scheduleService: ScheduleService,
  ) {}

  @Cron('0 */20 * * * *', { name: 'noticeSchedule' })
  async runSchedule() {
    const currentTime = dayjs()
    this.logger.log(`start schedule at ${currentTime.format()}`)
    const res = await this.scheduleService.getSchedule(null)

    for (const schedule of res.schedules) {
      const scheduleAfterTime = getDayjsTime(
        this.logger,
        schedule.scheduleAfterTime,
      )
      const scheduleBeforeTime = getDayjsTime(
        this.logger,
        schedule.scheduleBeforeTime,
      )

      if (currentTime.isBefore(scheduleAfterTime)) {
        this.logger.warn(
          `schedule skip by scheduleAfterTime: ${schedule.scheduleAfterTime}`,
        )
        continue
      } else if (currentTime.isAfter(scheduleBeforeTime)) {
        this.logger.warn(
          `schedule skip by scheduleBeforeTime: ${schedule.scheduleBeforeTime}`,
        )
        continue
      }

      if (schedule.type === 'flight') {
        await this.runFlightSchedule(schedule)
      }
    }
  }

  async runFlightSchedule(schedule: Schedule) {
    this.logger.log(`run flight schedule`)
    const flightParams: FlightScheduleParam = schedule.params
    const allHandlePromise = flightParams.dateList.map(async (date) => {
      const { dateList, ...params }: any = flightParams
      params.date = date
      try {
        await this.handleFlight(schedule, params)
      } catch (err) {
        this.logger.error(`'handle flight error: ${err.message}`)
      }
    })

    await Promise.all(allHandlePromise)
  }

  async handleFlight(schedule: Schedule, requestParams: GetFlightsReq) {
    // get flight data
    const { flights } = await this.flightService.getFlights(requestParams)
    this.logger.log(
      `getFlights: ${flights.length}, params: ${JSON.stringify(requestParams)}`,
    )

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
    this.logger.log(
      `[PriceChange] flight price change info: ${JSON.stringify(
        priceChange,
      )}, filter: ${JSON.stringify(filter)}`,
    )

    if (priceChange.priceChangeTo > priceChange.priceChangeFrom) {
      // 降价
      this.logger.warn(`flight exclude by price increase`)
      return false
    }
    if (!filter) {
      this.logger.log(`flight include by no filter`)
      return true
    }

    if (
      filter.highestPrice &&
      priceChange.priceChangeTo + flight.tax > filter.highestPrice
    ) {
      // 最高价
      this.logger.warn(`flight exclude by highestPrice`)
      return false
    }
    const currentTime = dayjs(flight.departureTime)
    const dayTimeStr = currentTime.format('YYYY-MM-DD')
    this.logger.log(`flight departureTime: ${currentTime.format()}`)
    if (filter.departureTimeBefore) {
      const departureTimeBefore = getDayjsTime(
        this.logger,
        filter.departureTimeBefore,
        dayTimeStr,
      )
      this.logger.log(`departureTimeBefore: ${departureTimeBefore.format()}`)
      if (currentTime.isAfter(departureTimeBefore)) {
        // 出发时间早于条件
        this.logger.warn(`flight exclude by departure time after select`)
        return false
      }
    }
    if (filter.departureTimeAfter) {
      const departureTimeAfter = getDayjsTime(
        this.logger,
        filter.departureTimeAfter,
        dayTimeStr,
      )
      this.logger.log(`departureTimeAfter: ${departureTimeAfter.format()}`)
      if (currentTime.isBefore(departureTimeAfter)) {
        // 出发时间晚于条件
        this.logger.warn(`flight exclude by departure time before select`)
        return false
      }
    }
    if (filter.departureTimeInterval?.length === 2) {
      // 出发时间区间条件
      const startTime = getDayjsTime(
        this.logger,
        filter.departureTimeInterval[0],
        dayTimeStr,
      )
      const endTime = getDayjsTime(
        this.logger,
        filter.departureTimeInterval[1],
        dayTimeStr,
      )
      this.logger.log(`departureTimeInterval[0]: ${startTime.format()}`)
      this.logger.log(`departureTimeInterval[1]: ${endTime.format()}`)
      if (currentTime.isBefore(startTime)) {
        this.logger.warn(`flight exclude by departure time not in interval`)
        return false
      }
      if (currentTime.isAfter(endTime)) {
        this.logger.warn(`flight exclude by departure time not in interval`)
        return false
      }
    }

    this.logger.log(`flight include after all`)
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
    const res = await SendSms(smsParam, this.logger)
    if (res.Code === 'OK') {
      return true
    } else {
      return false
    }
  }
}
