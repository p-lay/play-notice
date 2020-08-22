import axios from 'axios'

export const request = axios.create({
  timeout: 10 * 1000,
})
