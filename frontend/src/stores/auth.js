import { defineStore } from 'pinia'
import { authApi } from '../api/index.js'
import { TOKEN_KEY, USER_KEY, clearStoredSession, isMockMode } from '../utils/runtime.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    identityChecked: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    role: (state) => state.user?.role || '',
  },
  actions: {
    persistAuth(data) {
      this.token = data.accessToken
      this.user = data.user
      this.identityChecked = true
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return data.user
    },
    updateUser(user) {
      this.user = user
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      return user
    },
    async login(payload) {
      const data = await authApi.login(payload)
      return this.persistAuth(data)
    },
    async register(payload) {
      const data = await authApi.register(payload)
      return this.persistAuth(data)
    },
    async fetchMe() {
      this.user = await authApi.me()
      this.identityChecked = true
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      return this.user
    },
    async ensureIdentity() {
      if (!this.token) {
        this.resetSession()
        return false
      }
      if (this.identityChecked && this.user) return true
      try {
        await this.fetchMe()
        return true
      } catch {
        this.resetSession()
        return false
      }
    },
    resetSession() {
      this.token = ''
      this.user = null
      this.identityChecked = false
      clearStoredSession()
    },
    async logout() {
      try {
        if (!isMockMode) await authApi.logout()
      } finally {
        this.resetSession()
      }
    },
  },
})
