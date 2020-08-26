import { Injectable, Inject } from '@nestjs/common'
import {
  AddScheduleReq,
  DeleteScheduleReq,
  GetScheduleRes,
} from '../contract/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ScheduleEntity } from '../entity/schedule.entity'

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    readonly repo: Repository<ScheduleEntity>,
  ) {}

  async addSchedule(param: AddScheduleReq): Promise<any> {
    const entity = new ScheduleEntity()
    entity.type = param.type
    entity.name = param.name
    entity.params = param.params
    entity.phoneNumberJson = param.phoneNumberJson
    const res = await this.repo.save(entity)
    return !!res
  }

  async deleteSchedule(param: DeleteScheduleReq): Promise<any> {
    const res = await this.repo.delete({
      id: param.scheduleId,
    })
    return res
  }

  async getSchedule(param: any): Promise<GetScheduleRes> {
    const entities = await this.repo.find()
    const schedules = entities.map((entity) => {
      return {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        params: JSON.parse(entity.params),
        createdDate: entity.create_time.toString(),
        phoneNumbers: JSON.parse(entity.phoneNumberJson),
      }
    })
    return {
      schedules,
    }
  }
}
