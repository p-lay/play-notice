export default {
  _config: {
    promiseGenericRes: 'CommonRes'
  },
  user: {
    getUserInfo: {
      req: 'GetUserInfoReq',
      res: 'GetUserInfoRes'
    },
    updateUserInfo: {
      req: 'UpdateUserInfoReq'
    }
  },
  resource: {
    _config: {
      disableController: true,
      disableEntity: true
    },
    addResource: {
      req: 'AddResourceReq'
    },
    getResource: {
      req: 'GetResourceReq',
      res: 'GetResourceRes'
    },
    deleteResource: {
      req: 'DeleteResourceReq'
    }
  }
}
