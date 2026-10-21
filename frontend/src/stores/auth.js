import { defineStore } from 'pinia'
import { authApi, userApi } from '../api/index.js'

const TOKEN_KEY = 'dreamhiring_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: JSON.parse(localStorage.getItem('dreamhiring_user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    role: (state) => state.user?.role || '',
  },
  actions: {
    async login(payload) {
      const data = await authApi.login(payload)
      this.token = data.accessToken
      this.user = data.user
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      localStorage.setItem('dreamhiring_user', JSON.stringify(data.user))
      return data.user
    },
    async fetchMe() {
      this.user = await userApi.getMe()
      localStorage.setItem('dreamhiring_user', JSON.stringify(this.user))
      return this.user
    },
    async logout() {
      try {
        await authApi.logout()
      } finally {
        this.token = ''
        this.user = null
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('dreamhiring_user')
      }
    },
  },
})
