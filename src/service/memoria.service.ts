import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, In } from 'typeorm'
import { MemoriaEntity } from '../entity/memoria.entity'
import { MemoriaTagEntity } from '../entity/memoriaTag.entity'
import { ResourceService } from './resource.service'
import {
  AddMemoriaReq,
  GetMemoriaReq,
  GetMemoriaRes,
  UpdateMemoriaReq,
  SearchMemoriaReq,
  SearchMemoriaRes,
  DeleteMemoriaReq,
} from '../../contract/memoria'
import { Tag } from '../../contract/tag'
import { Exception } from '../util/exception'
import {
  convertEntityDateToUnix,
  convertToEntityDate,
  getGroupConcatValue,
} from '../util/entity'

@Injectable()
export class MemoriaService {
  constructor(
    @InjectRepository(MemoriaEntity)
    private readonly repo: Repository<MemoriaEntity>,
    @InjectRepository(MemoriaTagEntity)
    private readonly memoriaTagRepo: Repository<MemoriaTagEntity>,
    @Inject(ResourceService)
    private readonly resourceService: ResourceService,
  ) {}

  async getMemoriaTags(memoriaId: number): Promise<Tag[]> {
    this.repo.find()
    const selection = ['tag.id as id', 'tag.name as name']
    const res = await this.repo.query(
      `select ${selection.join(
        ', ',
      )} from memoria_tag_relation relation join tag on tag.id = relation.tag_id 
      where relation.memoria_id = ?`,
      [memoriaId.toString()],
    )
    return res.map(x => ({ id: x.id, name: x.name }))
  }

  async updateMemoriaTags(
    memoriaId: number,
    tags: Tag[],
    disableDelete?: boolean,
  ) {
    if (!disableDelete) {
      await this.memoriaTagRepo.delete({
        memoria_id: memoriaId,
      })
    }
    const entities = tags.map(x => {
      const entity = new MemoriaTagEntity()
      entity.memoria_id = memoriaId
      entity.tag_id = x.id
      return entity
    })
    await this.memoriaTagRepo.save(entities)
  }

  async addMemoria(param: AddMemoriaReq) {
    const memoria = new MemoriaEntity()
    memoria.feeling = param.feeling
    memoria.music = param.music

    const resources = param.resources
    const resource_ids = await this.resourceService.addResource({ resources })
    memoria.resource_ids = JSON.stringify(resource_ids)
    memoria.thumb = param.thumb

    memoria.title = param.title
    memoria.create_by = param.user_id
    memoria.create_time = convertToEntityDate(param.create_time)
    memoria.is_large_data = param.isLargeData

    const value = await this.repo.save(memoria)

    await this.updateMemoriaTags(value.id, param.tags, true)

    return value
  }

  async getMemoria(param: GetMemoriaReq): Promise<GetMemoriaRes> {
    const entity = await this.repo.findOne({
      id: param.id,
    })
    if (entity) {
      const resource_ids = JSON.parse(entity.resource_ids)
      const resourceRes = await this.resourceService.getResource({
        resource_ids,
      })
      const tags = await this.getMemoriaTags(param.id)
      return {
        id: entity.id,
        comments: JSON.parse(entity.comments),
        // TODO: get user info, not id
        create_by: entity.create_by,
        create_time: convertEntityDateToUnix(entity.create_time),
        update_time: convertEntityDateToUnix(entity.update_time),
        title: entity.title,
        feeling: entity.feeling,
        music: entity.music,
        resources: resourceRes.resources,
        tags,
        isLargeData: entity.is_large_data,
        thumb: entity.thumb,
      }
    } else {
      throw new Exception(2000)
    }
  }

  async updateMemoria(param: UpdateMemoriaReq) {
    const value = await this.repo.findOne({
      id: param.id,
    })
    if (value) {
      const entity: Partial<MemoriaEntity> = {
        title: param.title,
        feeling: param.feeling || '',
        music: param.music || '',
        resource_ids: '',
        thumb: param.thumb,
        create_time: convertToEntityDate(param.create_time),
        is_large_data: param.isLargeData,
      }
      const resourceIds: number[] = JSON.parse(value.resource_ids)
      const paramExistResourceIds = param.existResourceIds || []
      const existResourceIds = resourceIds.filter(x =>
        paramExistResourceIds.includes(x),
      )
      const toRemoveResourceIds = resourceIds.filter(
        x => !paramExistResourceIds.includes(x),
      )
      await this.resourceService.deleteResource({
        ids: toRemoveResourceIds,
      })
      const resource_ids = await this.resourceService.addResource({
        resources: param.resources,
      })
      entity.resource_ids = JSON.stringify(
        existResourceIds.concat(resource_ids),
      )
      await this.updateMemoriaTags(param.id, param.tags)

      this.repo.update(
        {
          id: param.id,
        },
        entity,
      )
    } else {
      throw new Exception(2000)
    }
  }

  async searchMemoria(param: SearchMemoriaReq): Promise<SearchMemoriaRes> {
    const selection = [
      'memoria.id',
      'memoria.title',
      'memoria.thumb',
      'memoria.feeling',
      'memoria.create_by',
      'user.name as nick_name',
      'memoria.create_time',
      'memoria.is_large_data',
      'memoria.resource_ids',
      'GROUP_CONCAT(tag.name) as tag_names',
    ]
    const groupBy = [
      'memoria.id',
      'memoria.title',
      'memoria.thumb',
      'memoria.feeling',
      'memoria.create_by',
      'user.name',
      'memoria.create_time',
      'memoria.is_large_data',
      'memoria.resource_ids',
    ]
    const tagIds = param.tag_ids || []
    let memoriaResult: MemoriaEntity[] = []
    if (tagIds.length) {
      const andWhere = param.create_by ? `and memoria.create_by = ?` : ''

      // first left join memoria to relation, maybe it can query less data?
      memoriaResult = await this.repo.query(
        `select ${selection.join(', ')} from memoria_tag_relation relation 
        left join memoria on relation.memoria_id = memoria.id
        left join user on user.id = memoria.create_by 
        left join tag on tag.id = relation.tag_id
        where relation.tag_id in (${tagIds.join(',')}) ${andWhere}
        group by ${groupBy.join(', ')} 
        order by memoria.create_time desc`,
        [param.create_by],
      )
    } else {
      const where = param.create_by
        ? `where memoria.create_by = ?`
        : `where 1 = 1`
      memoriaResult = await this.repo.query(
        `select ${selection.join(
          ', ',
        )} from memoria left join user on user.id = memoria.create_by 
        left join memoria_tag_relation relation on relation.memoria_id = memoria.id
        left join tag on tag.id = relation.tag_id
      ${where}
      group by ${groupBy.join(', ')} 
      order by memoria.create_time desc`,
        [param.create_by],
      )
    }

    const memorias = memoriaResult.map(memoria => {
      const result = {
        id: memoria.id,
        title: memoria.title,
        thumb: memoria.thumb,
        feeling: memoria.feeling,
        creator: {
          id: memoria.create_by,
          name: memoria['nick_name'],
        },
        createTime: convertEntityDateToUnix(memoria.create_time),
        isLargeData: memoria.is_large_data,
        resourceCount: (JSON.parse(memoria['resource_ids']) || []).length,
        tagNames: getGroupConcatValue(memoria['tag_names']),
      }
      return result
    })

    return {
      memorias,
    }
  }

  async deleteMemoria(param: DeleteMemoriaReq) {
    const memoria = await this.repo.findOne({
      id: param.id,
    })
    const resource_ids = JSON.parse(memoria.resource_ids)
    await this.resourceService.deleteResource({ ids: resource_ids })
    await this.repo.remove(memoria)
  }
}
