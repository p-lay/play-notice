import { Injectable, Inject } from '@nestjs/common'
import {
  GetUserInfoReq,
  GetUserInfoRes,
  UpdateUserInfoReq,
} from '../../contract/user'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../entity/user.entity'
import { WechatService } from './wechat.service'
import { Exception } from '../util/exception'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @Inject(WechatService)
    private readonly wechatService: WechatService,
  ) {}

  async getUserInfo(param: GetUserInfoReq): Promise<GetUserInfoRes> {
    const session = await this.wechatService.getWechatSession(param.code)
    const userInfo = await this.repo.findOne({
      openid: session.openid,
    })
    if (userInfo) {
      return {
        userId: userInfo.id,
        roleId: userInfo.role_id,
        nickName: userInfo.name,
        avatarUrl: userInfo.avatar,
        gender: userInfo.gender,
        province: userInfo.province,
        city: userInfo.city,
        country: userInfo.country,
        language: userInfo.language,
        isNew: !userInfo.name || !userInfo.avatar,
      }
    } else {
      const userEntity = await this.repo.save({
        openid: session.openid,
      })
      return {
        isNew: true,
        userId: userEntity.id,
      } as any
    }
  }

  async updateUserInfo(param: UpdateUserInfoReq) {
    const entity = new UserEntity()
    entity.name = param.nickName
    entity.avatar = param.avatarUrl
    entity.gender = param.gender
    entity.province = param.province
    entity.city = param.city
    entity.country = param.country
    entity.language = param.language

    if (param.userId) {
      await this.repo.update(
        {
          id: param.userId,
        },
        entity,
      )
    } else {
      await this.repo.save(entity)
    }
  }

  async getUserById(userId: number) {
    const entity = await this.repo.findOne({
      id: userId,
    })
    if (entity) {
      return {
        userId: entity.id,
        roleId: entity.role_id,
        nickName: entity.name,
        avatarUrl: entity.avatar,
        gender: entity.gender,
        province: entity.province,
        city: entity.city,
        country: entity.country,
        language: entity.language,
        isNew: !entity.name || !entity.avatar,
      }
    } else {
      return null
    }
  }
}
