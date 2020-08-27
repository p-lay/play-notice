import axios from 'axios'

const request = axios.create({
  timeout: 10 * 1000,
})

request.interceptors.request.use((res) => {
  if (res.url.includes('flights.ctrip.com')) {
    console.log(`axios request: ${JSON.stringify(res.headers)}`)
    console.log(`axios data: ${JSON.stringify(res.data)}`)
  }
  return res
})

request.interceptors.response.use((res) => {
  if (res.config.url.includes('flights.ctrip.com')) {
    console.log(`axios response: ${JSON.stringify(res.headers)}`)
  }
  return res.data
})

export default request
