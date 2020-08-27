import { merge } from 'lodash'
import { resolve } from 'path'
import prodConfig from './prod'

const isSourceCode = __dirname.includes('src/config')
const isProd = process.env.NODE_ENV === 'PROD'

let config = {
  port: 3000,
  hostName: '0.0.0.0',

  orm: {
    type: 'mysql',
    host: 'localhost',
    port: 3310,
    username: 'root',
    password: '123456',
    database: 'notice',
    entities: [resolve(`./**/*.entity${!isSourceCode ? '.js' : '.ts'}`)],
    timezone: 'UTC',
    multipleStatements: true,
    dropSchema: false,
    synchronize: true,
    logging: false,
  },
}

if (isProd) {
  config = merge(config, prodConfig)
}

export { config }
