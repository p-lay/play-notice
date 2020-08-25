import * as dayjs from 'dayjs'

export const longLength = 2000

export const columnOption = {
  json: {
    length: longLength,
    default: '',
  },
}
export const convertEntityDateToUnix = (date: Date) => {
  return dayjs(date.toString()).unix()
}

export const convertToEntityDate = (unix: number) => {
  if (unix) {
    return new Date(unix * 1000)
  } else {
    return undefined
  }
}

export const getGroupConcatValue = (queryResult: string): string[] => {
  const strValue = queryResult || ''
  if (strValue) {
    return strValue.split(',')
  } else {
    return []
  }
}
