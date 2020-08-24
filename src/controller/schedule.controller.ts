import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common'
import { ScheduleService } from '../service/schedule.service'
import { CommonRes } from '../contract/global'
import {
  AddScheduleReq,
  DeleteScheduleReq,
  GetScheduleRes,
} from '../contract/schedule'

@Controller()
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post('addSchedule')
  async addSchedule(@Body() param: AddScheduleReq): CommonRes {
    const data = await this.service.addSchedule(param)
    return {
      data,
    }
  }

  @Post('deleteSchedule')
  async deleteSchedule(@Body() param: DeleteScheduleReq): CommonRes {
    const data = await this.service.deleteSchedule(param)
    return {
      data,
    }
  }

  @Post('getSchedule')
  async getSchedule(@Body() param: any): CommonRes<GetScheduleRes> {
    const data = await this.service.getSchedule(param)
    return {
      data,
    }
  }
}
