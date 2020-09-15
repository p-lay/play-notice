import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ScheduleService } from '../service/schedule.service'
import * as dayjs from 'dayjs'
import { getDayjsTime } from '@/util/flight'
import { FlightNoticeService } from '@/service/flightNotice.service'

@Injectable()
export class NoticeSchedule {
  private readonly logger = new Logger(NoticeSchedule.name)
  constructor(
    private scheduleService: ScheduleService,
    private flightNoticeService: FlightNoticeService,
  ) {}

  @Cron('0 */20 * * * *', { name: 'noticeSchedule' })
  async runNoticeSchedule() {
    const currentTime = dayjs()
    this.logger.log(`start schedule at ${currentTime.format()}`)
    const res = await this.scheduleService.getSchedule(null)

    for (const schedule of res.schedules) {
      const scheduleAfterTime = getDayjsTime(schedule.scheduleAfterTime)
      const scheduleBeforeTime = getDayjsTime(schedule.scheduleBeforeTime)

      this.logger.log(`schedule name: ${schedule.name}`)
      if (currentTime.isBefore(scheduleAfterTime)) {
        this.logger.warn(
          `schedule skip by scheduleAfterTime: ${schedule.scheduleAfterTime}`,
        )
        continue
      } else if (currentTime.isAfter(scheduleBeforeTime)) {
        this.logger.warn(
          `schedule skip by scheduleBeforeTime: ${
            schedule.scheduleBeforeTime
          }, ${currentTime.format()}, ${scheduleBeforeTime.format()}`,
        )
        continue
      }

      if (
        schedule.scheduleDelayDayjsTime &&
        currentTime.isBefore(schedule.scheduleDelayDayjsTime)
      ) {
        this.logger.warn(
          `schedule skip by scheduleDelayTime: ${currentTime.format()}, ${schedule.scheduleDelayDayjsTime.format()}`,
        )
        continue
      }

      if (schedule.type === 'flight') {
        await this.flightNoticeService.handleSchedule(schedule)
      }
    }
  }
}
