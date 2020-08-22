export interface UserInfo {
  nickName: string
  avatarUrl: string
  gender: number
  province: string
  city: string
  country: string
  language: string
}

export interface GetUserInfoReq {
  code: string
}

export interface GetUserInfoRes extends UserInfo {
  userId: number
  roleId: number
  isNew?: boolean
}

export interface UpdateUserInfoReq extends UserInfo {
  userId?: number
}
