export interface FlightInfo {
  flightId: string
  price: number
  tax: number
  airlineName: string
  airlineDescription: string
  departureAirportName: string
  departureTime: string
  arrivalAirportName: string
  arrivalTime: string
  stopTimes: number
}

export interface GetFlightsReq {
  from: string
  to: string
  date: string
  fromPort?: string
}

export interface GetFlightsRes {
  flights: FlightInfo[]
}
