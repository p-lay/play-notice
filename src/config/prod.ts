import { resolve } from 'path'

export default {
  orm: {
    host: '172.17.0.1',
    database: 'notice_prod',
    entities: [resolve(`./**/*.entity.js`)],
  },
}
