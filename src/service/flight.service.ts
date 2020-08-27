import { Injectable, Inject } from '@nestjs/common'
import { GetFlightsReq, GetFlightsRes, FlightInfo } from '../contract/flight'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FlightEntity } from '../entity/flight.entity'
import { FlightPriceChangeEntity } from '../entity/flightPriceChange.entity'
import { getFlights } from '@/api/ctrip.api'
import * as dayjs from 'dayjs'

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(FlightEntity)
    readonly repo: Repository<FlightEntity>,
    @InjectRepository(FlightPriceChangeEntity)
    readonly priceChangeRepo: Repository<FlightPriceChangeEntity>,
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
      const flightNumber = raw.flight.flightNumber
      const timestamp = dayjs(raw.flight.departureDate).format('YYYY-MM-DD')
      const flight: FlightInfo = {
        flightId: `${flightNumber}_${timestamp}`,
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

    return {
      flights,
    }
  }

  async checkAndGetFlightInfo(flights: FlightInfo[]) {
    const flightEntities = []
    const priceChangeEntities = []
    for (const flight of flights) {
      let entity = await this.repo.findOne({
        flightId: flight.flightId,
      })
      if (!entity) {
        entity = new FlightEntity()
        Object.assign(entity, flight)
        flightEntities.push(entity)
      } else if (entity.price != flight.price) {
        const priceChangeEntity = new FlightPriceChangeEntity()
        priceChangeEntity.flightId = entity.flightId
        priceChangeEntity.priceChangeFrom = entity.price
        priceChangeEntity.priceChangeTo = flight.price
        priceChangeEntities.push(priceChangeEntity)
        entity.price = flight.price
        flightEntities.push(entity)
      }
    }
    return {
      flightEntities,
      priceChangeEntities,
    }
  }

  async saveFlightInfo({ flightEntities, priceChangeEntities }) {
    if (flightEntities.length) {
      await this.repo.save(flightEntities)
    }
    if (priceChangeEntities.length) {
      await this.priceChangeRepo.save(priceChangeEntities)
    }
  }
}
