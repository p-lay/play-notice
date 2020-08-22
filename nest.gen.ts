import mapping from './src/contract/_mapping'
import { generateNest, generateFront } from 'nest-ts-code-gen'
import { join } from 'path'

generateNest({
  mapping,
  // the relative contract folder path in template import expression => import { CommonRes } from '../../../contract/global'
  sourceContractFolderRelativePath: '../contract',
  // the relative entity path in template import expression => import { UserEntity } from '../entity/user.entity'
  sourceEntityFolderRelativePath: '../entity',
  // out folder must in the same level
  outFolderInfo: {
    rootPath: join(__dirname, 'src'),
    controllerFolder: 'controller',
    serviceFolder: 'service',
    moduleFolder: 'module',
  },
})
