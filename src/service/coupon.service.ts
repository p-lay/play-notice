import { Injectable, Inject } from '@nestjs/common'
import {
  EncryptCouponReq,
  EncryptCouponRes,
  DecryptCouponReq,
  DecryptCouponRes,
  UseCouponReq,
  UseCouponRes,
} from '../../contract/coupon'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CouponEntity } from '../entity/coupon.entity'
import * as NodeRSA from 'node-rsa'
import * as fs from 'fs'
import * as md5 from 'md5'
import { UserService } from './user.service'

@Injectable()
export class CouponService {
  private publicRsa = null
  private privateRsa = null
  constructor(
    @InjectRepository(CouponEntity)
    readonly repo: Repository<CouponEntity>,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {
    const publicKey = fs.readFileSync(`${__dirname}/../../rsa/id_rsa.pub`)
    const privateKey = fs.readFileSync(`${__dirname}/../../rsa/id_rsa`)
    this.publicRsa = new NodeRSA(publicKey)
    this.privateRsa = new NodeRSA(privateKey)
  }

  async encryptCoupon(param: EncryptCouponReq): Promise<EncryptCouponRes> {
    var encrypted = this.privateRsa.encryptPrivate(param.message, 'base64')
    const rasEncrypted = encrypted.toString()
    const md5Str = md5(encrypted.toString())

    const entity = new CouponEntity()
    entity.md5 = md5Str
    entity.rsa = rasEncrypted
    entity.creator = param.user_id
    await this.repo.save(entity)

    return {
      md5: md5Str,
    }
  }

  async decryptCoupon(param: DecryptCouponReq): Promise<DecryptCouponRes> {
    const coupon = await this.repo.findOne({
      md5: param.md5,
    })
    if (coupon && coupon.rsa) {
      const buffer = this.publicRsa.decryptPublic(coupon.rsa)
      const creator = await this.userService.getUserById(coupon.creator)
      const usedBy = await this.userService.getUserById(coupon.used_by)

      return {
        message: buffer.toString(),
        createdBy: creator
          ? {
              nickName: creator.nickName,
              avatarUrl: creator.avatarUrl,
            }
          : null,
        usedBy: usedBy
          ? {
              nickName: usedBy.nickName,
              avatarUrl: usedBy.avatarUrl,
            }
          : null,
      }
    } else {
      return {
        decryptFailed: true,
      }
    }
  }

  async useCoupon(param: UseCouponReq): Promise<UseCouponRes> {
    const coupon = await this.repo.findOne({
      md5: param.md5,
    })
    if (coupon && coupon.rsa && !coupon.used_by) {
      await this.repo.update(
        { md5: param.md5 },
        {
          used_by: param.user_id,
        },
      )
      return {
        useFailed: false,
      }
    } else {
      return {
        useFailed: true,
      }
    }
  }
}
