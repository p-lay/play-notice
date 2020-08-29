import * as dayjs from 'dayjs'

export const getDayjsTime = (hourAndMinute: string, dayTimeStr?: string) => {
  const yearMonthDay = dayTimeStr ? dayTimeStr : 'YYYY-MM-DD'
  const timeStr = dayjs().format(`${yearMonthDay} ${hourAndMinute}:00`)
  return dayjs(timeStr)
}
