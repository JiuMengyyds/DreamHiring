import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../stores/auth.js'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('persists login state and clears it on logout', async () => {
    const auth = useAuthStore()
    await auth.login({ username: 'chenyu_hr', password: 'dreamhiring', captchaId: 'mock', captchaCode: '' })

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('COMPANY')
    expect(localStorage.getItem('dreamhiring_token')).toContain('mock-token-')

    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('dreamhiring_token')).toBeNull()
  })
})
