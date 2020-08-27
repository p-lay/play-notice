import * as dayjs from 'dayjs'

export const getDayjsTime = (hourAndMinute: string, dayTimeStr?: string) => {
  const dayTime = dayTimeStr ? dayTimeStr : 'YYYY-MM-DD '
  return dayjs(dayjs().format(`${dayTime} ${hourAndMinute}:ss`))
}
