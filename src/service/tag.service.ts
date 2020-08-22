import { Injectable, Inject } from '@nestjs/common'
import {
  AddTagReq,
  DeleteTagReq,
  SearchTagReq,
  SearchTagRes,
} from '../../contract/tag'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, In } from 'typeorm'
import { TagEntity } from '../entity/tag.entity'
import { MemoriaTagEntity } from '../entity/memoriaTag.entity'
import { Exception } from '../util/exception'
import { getGroupConcatValue } from '../util/entity'

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    readonly repo: Repository<TagEntity>,
    @InjectRepository(MemoriaTagEntity)
    readonly memoriaTagRepo: Repository<MemoriaTagEntity>,
  ) {}

  async addTag(param: AddTagReq): Promise<any> {
    const result = await this.repo.findOne({
      name: In(param.names),
    })
    if (!!result) throw new Exception(3100)

    const entities = param.names.map(tagName => {
      const entity = new TagEntity()
      entity.name = tagName
      return entity
    })

    await this.repo.save(entities)
  }

  async deleteTag(param: DeleteTagReq): Promise<any> {
    if (await this.isTagRelatedWithMemoria(param.id)) {
      throw new Exception(3000)
    } else {
      this.repo.delete({
        id: param.id,
      })
    }
  }

  async searchTag(param: SearchTagReq): Promise<SearchTagRes> {
    const tagRes: SearchTagRes = {
      tags: [],
    }
    if (param.withMemoria) {
      const selection = [
        'tag.id as id',
        'tag.name as name',
        'GROUP_CONCAT(relation.memoria_id order by relation.memoria_id desc) as memoria_ids',
      ]
      const groupBy = ['tag.id', 'tag.name']
      const where = param.keyword ? `where tag.name like ?` : ''
      const queryStr = `select ${selection.join(
        ', ',
      )} from tag left join memoria_tag_relation relation on tag.id = relation.tag_id 
      ${where}
      group by ${groupBy.join(', ')}`

      const res = await this.repo.query(queryStr, [`%${param.keyword}%`])
      tagRes.tags = res.map(x => ({
        id: x.id,
        name: x.name,
        memoriaIds: getGroupConcatValue(x['memoria_ids']),
      }))
    } else {
      const condition = param.keyword
        ? {
            name: Like(`%${param.keyword}%`),
          }
        : null

      const res = await this.repo.find(condition)
      tagRes.tags = res.map(x => ({ id: x.id, name: x.name }))
    }
    return tagRes
  }

  async isTagRelatedWithMemoria(tagId: number) {
    const entity = await this.memoriaTagRepo.findOne({
      tag_id: tagId,
    })
    return !!entity
  }
}
