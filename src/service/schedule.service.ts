import { Injectable, Inject } from '@nestjs/common'
import {
  AddScheduleReq,
  DeleteScheduleReq,
  GetScheduleRes,
  ScheduleType,
} from '../contract/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ScheduleEntity } from '@/entity/schedule.entity'
import * as dayjs from 'dayjs'

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
    entity.filter = param.filter || ''
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
        type: entity.type as ScheduleType,
        params: JSON.parse(entity.params),
        filter: entity.filter ? JSON.parse(entity.filter) : null,
        createdDate: entity.create_time.toString(),
        phoneNumbers: JSON.parse(entity.phoneNumberJson),
        scheduleAfterTime: entity.scheduleAfterTime,
        scheduleBeforeTime: entity.scheduleBeforeTime,
        scheduleDelayDayjsTime: entity.scheduleDelayTime
          ? dayjs(entity.scheduleDelayTime)
          : null,
      }
    })
    return {
      schedules,
    }
  }

  async updateDelayTime(scheduleId: string, delay: boolean) {
    const entity = await this.repo.findOne({
      id: scheduleId,
    })
    if (delay) {
      if (
        !entity.scheduleDelayTime ||
        dayjs(entity.scheduleDelayTime).isBefore(dayjs())
      ) {
        entity.scheduleDelayTime = dayjs().add(2, 'hour').format()
        await this.repo.save(entity)
      }
    } else {
      if (entity.scheduleDelayTime) {
        entity.scheduleDelayTime = ''
        await this.repo.save(entity)
      }
    }
  }
}
