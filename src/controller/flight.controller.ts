import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common'
import { FlightService } from '../service/flight.service'
import { CommonRes } from '../contract/global'
import { GetFlightsReq, GetFlightsRes } from '../contract/flight'

@Controller()
export class FlightController {
  constructor(private readonly service: FlightService) {}

  @Post('getFlights')
  async getFlights(@Body() param: GetFlightsReq): CommonRes<GetFlightsRes> {
    const data = await this.service.getFlights(param)
    return {
      data,
    }
  }
}
