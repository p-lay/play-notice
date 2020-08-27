import axios from 'axios'

const request = axios.create({
  timeout: 10 * 1000,
})

request.interceptors.request.use((res) => {
  if (res.url.includes('flights.ctrip.com')) {
    console.log(`request header: ${JSON.stringify(res.headers)}`)
  }
  return res
})

request.interceptors.response.use((res) => {
  if (res.config.url.includes('flights.ctrip.com')) {
    console.log(`response header: ${JSON.stringify(res.headers)}`)
  }
  return res.data
})

export default request
