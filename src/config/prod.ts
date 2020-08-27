import { resolve } from 'path'

export default {
  orm: {
    database: 'notice_prod',
    entities: [resolve(`./**/*.entity.js`)],
  },
}
