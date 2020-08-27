import request from './request'
import { GetFlightsReq } from '@/contract/flight'
import * as ctripConfig from '@/config/ctrip.json'

const cityMap = ctripConfig.cityMap
const airportMap = ctripConfig.airportMap

const convertToCtripParams = (params: GetFlightsReq) => {
  return {
    flightWay: 'Oneway',
    classType: 'ALL',
    hasChild: false,
    hasBaby: false,
    searchIndex: 1,
    airportParams: [
      {
        dcity: params.from,
        acity: params.to,
        dcityname: cityMap[params.from],
        acityname: cityMap[params.to],
        date: params.date,
        aport: params.fromPort,
        aportname: airportMap[params.fromPort],
      },
    ],
    selectedInfos: null,
    army: false,
  }
}

export const getFlights = (params: GetFlightsReq) => {
  const flightParams = convertToCtripParams(params)
  return request.post(
    'https://flights.ctrip.com/itinerary/api/12808/products',
    flightParams,
  )
}
