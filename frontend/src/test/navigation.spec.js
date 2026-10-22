import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import { createAppRouter } from '../router/index.js'
import { useAuthStore } from '../stores/auth.js'
import { resolveLoginDestination } from '../utils/navigation.js'

describe('role navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('does not send root or login redirects back to a blank layout', () => {
    expect(resolveLoginDestination('/', 'SEEKER')).toBe('/seeker/home')
    expect(resolveLoginDestination('/login', 'SEEKER')).toBe('/seeker/home')
    expect(resolveLoginDestination('/login?redirect=/', 'SEEKER')).toBe('/seeker/home')
    expect(resolveLoginDestination('https://example.com', 'SEEKER')).toBe('/seeker/home')
    expect(resolveLoginDestination('/seeker/jobs', 'SEEKER')).toBe('/seeker/jobs')
  })

  it('redirects an authenticated root visit to the role home', async () => {
    const auth = useAuthStore()
    auth.token = 'router-test-token'
    auth.user = { id: 1, nickname: '林知夏', role: 'SEEKER' }
    auth.identityChecked = true
    const router = createAppRouter(createMemoryHistory())

    await router.push('/')

    expect(router.currentRoute.value.path).toBe('/seeker/home')
    expect(router.currentRoute.value.meta.title).toBe('求职者首页')
  })
})
