import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ResourceEntity } from '../entity/resource.entity'
import {
  AddResourceReq,
  GetResourceReq,
  GetResourceRes,
  DeleteResourceReq,
  BaseResource,
} from '../../contract/resource'
import { In } from 'typeorm'
import { request } from '../util/request'

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly resourceRepo: Repository<ResourceEntity>,
  ) {}

  async addResource(param: AddResourceReq) {
    const result = param.resources.map(x => {
      const resource = new ResourceEntity()
      resource.url = x.url
      resource.description = x.description
      resource.type = x.type
      resource.thumb = x.thumb || ''
      return resource
    })
    const value = await this.resourceRepo.save(result)
    return value.map(x => x.id)
  }

  async updateDuration(resources: BaseResource[]) {
    const videos = resources.filter(x => x.type === 'video')
    const durationPromises = videos.map(async video => {
      const res = await request.get(video.url + '?avinfo')
      const second = res.data.format.duration
      return second.match(/\d+/)[0]
    })
    await Promise.all(durationPromises).then(durations => {
      durations.forEach((duration, index) => {
        videos[index].duration = duration
      })
    })
  }

  async getResource(param: GetResourceReq): Promise<GetResourceRes> {
    if (!param.resource_ids.length) {
      return {
        resources: [],
      }
    }

    const entities = await this.resourceRepo.find({
      id: In(param.resource_ids),
    })
    const resources = entities.map(x => ({
      id: x.id,
      url: x.url,
      type: x.type as any,
      description: x.description,
      thumb: x.type === 'video' ? x.url + '?vframe/jpg/offset/0' : x.url,
    }))

    await this.updateDuration(resources)

    return {
      resources,
    }
  }

  async deleteResource(param: DeleteResourceReq) {
    if (param.ids.length) {
      await this.resourceRepo.delete({
        id: In(param.ids),
      })
    }
  }
}
