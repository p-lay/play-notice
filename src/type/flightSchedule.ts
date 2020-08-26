export interface FlightScheduleParam {
  from: string
  to: string
  dateList: string[]
  fromPort: string
}

export interface FlightScheduleFilter {
  highestPrice?: number
  departureTimeBefore?: string
  departureTimeInterval?: string[]
  departureTimeAfter?: string
}
