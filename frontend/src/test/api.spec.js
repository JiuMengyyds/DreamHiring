import { describe, expect, it } from 'vitest'
import { adminApi, authApi, jobApi } from '../api/index.js'

describe('mock API contract', () => {
  it('logs in with demo credentials and fails with the agreed status codes', async () => {
    const data = await authApi.login({
      username: 'linzhixia',
      password: 'dreamhiring',
      captchaId: 'mock-captcha',
      captchaCode: '',
    })
    expect(data.user.role).toBe('SEEKER')
    expect(data.accessToken).toContain('mock-token-')

    await expect(
      authApi.login({ username: 'linzhixia', password: 'wrong', captchaId: 'mock', captchaCode: '' }),
    ).rejects.toMatchObject({ code: 401 })

    await expect(
      authApi.login({ username: 'linzhixia', password: 'dreamhiring', captchaId: 'mock', captchaCode: 'bad' }),
    ).rejects.toMatchObject({ code: 400 })
  })

  it('filters jobs and returns pagination metadata', async () => {
    const data = await jobApi.search({ city: '杭州', page: 1, size: 10 })
    expect(data.records.every((job) => job.city === '杭州')).toBe(true)
    expect(data.total).toBeGreaterThanOrEqual(2)
  })

  it('rejects deleting a user with business data and a referenced category', async () => {
    localStorage.setItem('dreamhiring_token', 'mock-token-admin_zhou')
    await expect(adminApi.deleteUser(10001)).rejects.toMatchObject({ code: 409 })
    await expect(adminApi.deleteCategory(1)).rejects.toMatchObject({ code: 409 })
  })
})
