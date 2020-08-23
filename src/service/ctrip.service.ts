import { Injectable, Inject } from '@nestjs/common'
import {
  GetFlightsReq,
  GetFlightsRes,
  FlightAirportInfo,
} from '../contract/ctrip'
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
          flight: leg.flight,
          characteristic: leg.characteristic,
        }
      })
      return rawFlights.filter((raw) => {
        const isSameFromPort =
          param.fromPort ==
          raw.flight.departureAirportInfo.airportTlc.toLowerCase()
        return !param.fromPort || isSameFromPort
      })
    } else {
      return []
    }
  }

  async getFlights(param: GetFlightsReq): Promise<GetFlightsRes> {
    const result = await getFlights(param)
    const rawFlights = this.shakeFlightResult(result, param)
    const flights = rawFlights.map((raw) => {
      return {
        id: raw.flight.id,
        price: raw.characteristic.lowestPrice,
        tax: raw.flight.tax,
        airlineName: raw.flight.airlineName + raw.flight.flightNumber,
        airlineDescription: `${raw.flight.craftTypeName}(${raw.flight.craftTypeKindDisplayName})`,
        departureInfo: {
          airportName:
            raw.flight.departureAirportInfo.airportName +
            raw.flight.departureAirportInfo.terminal.shortName,
          flightTime: raw.flight.departureDate,
        },
        arrivalInfo: {
          airportName:
            raw.flight.arrivalAirportInfo.airportName +
            raw.flight.arrivalAirportInfo.terminal.shortName,
          flightTime: raw.flight.arrivalDate,
        },
        transferFlight: raw.flight.stopTimes != 0,
      }
    })
    return {
      flights,
    }
  }
}
