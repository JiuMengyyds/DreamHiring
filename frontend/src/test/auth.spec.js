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
    expect(auth.identityChecked).toBe(true)
    expect(auth.role).toBe('COMPANY')
    expect(localStorage.getItem('dreamhiring_token')).toContain('mock-token-')

    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.identityChecked).toBe(false)
    expect(localStorage.getItem('dreamhiring_token')).toBeNull()
  })

  it('restores identity once and resets an invalid session', async () => {
    const auth = useAuthStore()
    await auth.login({ username: 'linzhixia', password: 'dreamhiring', captchaId: 'mock', captchaCode: '' })
    auth.identityChecked = false

    expect(await auth.ensureIdentity()).toBe(true)
    expect(auth.user.username).toBe('linzhixia')

    auth.token = 'invalid-token'
    localStorage.setItem('dreamhiring_token', auth.token)
    auth.identityChecked = false
    expect(await auth.ensureIdentity()).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
  })
})
