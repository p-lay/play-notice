import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common'
import { CtripService } from '../service/ctrip.service'
import { CommonRes } from '../contract/global'
import { GetFlightsReq, GetFlightsRes } from '../contract/ctrip'

@Controller()
export class CtripController {
  constructor(private readonly service: CtripService) {}

  @Post('getFlights')
  async getFlights(@Body() param: GetFlightsReq): CommonRes<GetFlightsRes> {
    const data = await this.service.getFlights(param)
    return {
      data,
    }
  }
}
