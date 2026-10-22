export const TOKEN_KEY = 'dreamhiring_token'
export const USER_KEY = 'dreamhiring_user'
export const AUTH_EXPIRED_EVENT = 'dreamhiring:auth-expired'

export const isMockMode = import.meta.env.VITE_USE_MOCK !== 'false'

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
