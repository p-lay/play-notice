import { merge } from 'lodash'
import { resolve } from 'path'
import prodConfig from './prod'

const isSit = process.env.NODE_ENV === 'SIT'
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
    database: 'notification',
    entities: [resolve(`./**/*.entity${isSit ? '.js' : '.ts'}`)],
    timezone: 'UTC',
    charset: 'utf8mb4',
    multipleStatements: true,
    dropSchema: false,
    synchronize: true,
    logging: true,
  },
}

if (isProd) {
  config = merge(config, prodConfig)
}

export { config }
