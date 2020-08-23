import axios from 'axios'

const request = axios.create({
  timeout: 10 * 1000,
})

request.interceptors.response.use((res) => {
  return res.data
})

export default request
