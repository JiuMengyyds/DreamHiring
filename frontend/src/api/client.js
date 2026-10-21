import axios from 'axios'
import { mockAdapter } from './mock/adapter.js'

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

if (import.meta.env.VITE_USE_MOCK !== 'false') {
  client.defaults.adapter = mockAdapter
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('dreamhiring_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body.code === 'number' && body.code !== 200) {
      return Promise.reject(new ApiError(body.code, body.msg || '请求失败'))
    }
    return body?.data
  },
  (error) => Promise.reject(error),
)

export default client
