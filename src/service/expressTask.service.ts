import { Injectable, Inject } from '@nestjs/common'
import {
  AddExpressTaskReq,
  RemoveExpressTaskReq,
  UpdateExpressTaskReq,
  GetExpressTaskRes,
} from '../../contract/expressTask'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { ExpressTaskEntity } from '../entity/expressTask.entity'
import { groupBy } from 'lodash'
import * as dayjs from 'dayjs'

@Injectable()
export class ExpressTaskService {
  constructor(
    @InjectRepository(ExpressTaskEntity)
    readonly repo: Repository<ExpressTaskEntity>,
  ) {}

  async addExpressTask(param: AddExpressTaskReq): Promise<any> {
    const task = new ExpressTaskEntity()
    task.category = param.category
    task.note = param.note
    task.serial_number = param.serialNumber
    task.status = 0
    await this.repo.save(task)
  }

  async removeExpressTask(param: RemoveExpressTaskReq): Promise<any> {
    const task = await this.repo.findOne({
      id: param.id,
    })
    await this.repo.remove(task)
  }

  async updateExpressTask(param: UpdateExpressTaskReq): Promise<any> {
    const task = await this.repo.findOne({
      id: param.id,
    })
    task.status = param.status
    await this.repo.update(
      {
        id: param.id,
      },
      task,
    )
  }

  async getExpressTask(param: any): Promise<GetExpressTaskRes> {
    const today = dayjs(dayjs().format('YYYY-MM-DD')).toDate()
    const taskEntities = await this.repo.find({
      update_time: MoreThan(today),
    })
    const tasks = taskEntities.map(entity => {
      return {
        id: entity.id,
        category: entity.category,
        serialNumber: entity.serial_number,
        status: entity.status,
        note: entity.note,
        updateTime: entity.update_time as any,
      }
    })
    return {
      taskByCategory: groupBy(tasks, 'category'),
      unpickCount: tasks.filter(x => x.status === 0).length,
    }
  }
}
