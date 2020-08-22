import { resolve } from 'path'

export default {
  port: 3001,
  orm: {
    database: 'play_prod',
    entities: [resolve(`./**/*.entity.js`)],
  },
}
