import { Injectable, Inject } from '@nestjs/common'
import { GetFlightsReq, GetFlightsRes, FlightInfo } from '../contract/ctrip'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CtripEntity } from '../entity/ctrip.entity'
import { getFlights } from 'src/api/ctrip.api'

@Injectable()
export class CtripService {
  constructor(
    @InjectRepository(CtripEntity)
    readonly repo: Repository<CtripEntity>,
  ) {}

  shakeFlightResult(result: any, param: GetFlightsReq) {
    if (result.data?.routeList) {
      const rawFlights = result.data.routeList.map((item) => {
        const leg = item.legs[0]
        return {
          type: item.routeType,
          flight: leg.flight,
          characteristic: leg.characteristic,
        }
      })
      return rawFlights.filter((raw) => {
        const isSameFromPort =
          param.fromPort ==
          raw.flight.departureAirportInfo.airportTlc.toLowerCase()
        const isDirectFlight = raw.type === 'Flight'
        return isDirectFlight && (!param.fromPort || isSameFromPort)
      })
    } else {
      return []
    }
  }

  async getFlights(param: GetFlightsReq): Promise<GetFlightsRes> {
    const result = await getFlights(param)
    const rawFlights = this.shakeFlightResult(result, param)
    const flights = rawFlights.map((raw) => {
      const flight: FlightInfo = {
        flightId: raw.flight.id,
        // TODO: lowestPrice null, transitPrice, characteristic.standardPrices
        price: raw.characteristic.lowestPrice || 0,
        tax: raw.flight.tax,
        airlineName: raw.flight.airlineName + raw.flight.flightNumber,
        airlineDescription: `${raw.flight.craftTypeName}(${raw.flight.craftTypeKindDisplayName})`,
        departureAirportName:
          raw.flight.departureAirportInfo.airportName +
          raw.flight.departureAirportInfo.terminal.shortName,
        departureTime: raw.flight.departureDate,
        arrivalAirportName:
          raw.flight.arrivalAirportInfo.airportName +
          raw.flight.arrivalAirportInfo.terminal.shortName,
        arrivalTime: raw.flight.arrivalDate,
        stopTimes: raw.flight.stopTimes,
      }
      return flight
    })

    await this.saveFlight(flights)

    return {
      flights,
    }
  }

  async saveFlight(flights: FlightInfo[]) {
    const entities = flights.map((flight) => {
      const entity = new CtripEntity()
      Object.assign(entity, flight)
      return entity
    })
    await this.repo.save(entities)
  }
}
