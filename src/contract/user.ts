export interface UserInfo {
  nickName: string
  avatarUrl: string
  gender: number
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
