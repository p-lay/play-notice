import * as dayjs from 'dayjs'
import { Logger } from '@nestjs/common'

export const getDayjsTime = (
  logger: Logger,
  hourAndMinute: string,
  dayTimeStr?: string,
) => {
  const yearMonthDay = dayTimeStr ? dayTimeStr : 'YYYY-MM-DD'
  const timeStr = dayjs().format(`${yearMonthDay} ${hourAndMinute}:00`)
  logger.log(`getDayjsTime: ${timeStr}`)
  return dayjs(timeStr)
}
