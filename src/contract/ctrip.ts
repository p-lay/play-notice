export interface FlightAirportInfo {
  airportName: string
  flightTime: string
}

export interface FlightInfo {
  id: string
  price: number
  tax: number
  airlineName: string
  airlineDescription: string
  departureInfo: FlightAirportInfo
  arrivalInfo: FlightAirportInfo
  transferFlight?: boolean
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
