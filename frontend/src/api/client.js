import axios from 'axios'
import { mockAdapter } from './mock/adapter.js'
import { AUTH_EXPIRED_EVENT, TOKEN_KEY, clearStoredSession, isMockMode } from '../utils/runtime.js'

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

if (isMockMode) {
  client.defaults.adapter = mockAdapter
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
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
  (error) => {
    const status = error.response?.status
    const body = error.response?.data
    const requestUrl = error.config?.url || ''
    const isPublicAuthRequest = /^\/auth\/(captcha|login|register)$/.test(requestUrl)

    if (status === 401 && !isPublicAuthRequest) {
      clearStoredSession()
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
    }

    return Promise.reject(new ApiError(
      body?.code ?? status ?? 0,
      body?.msg || error.message || '请求失败',
    ))
  },
)

export default client
