import { describe, expect, it } from 'vitest'
import { adminApi, authApi, companyApi, jobApi, resumeApi } from '../api/index.js'
import { getDefaultResumeId } from '../utils/resume.js'

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

  it('supports company auditing and resolves the default resume dynamically', async () => {
    localStorage.setItem('dreamhiring_token', 'mock-token-admin_zhou')
    const company = await adminApi.auditCompany(3, { auditStatus: 'APPROVED', reason: '' })
    expect(company.auditStatus).toBe('APPROVED')

    localStorage.setItem('dreamhiring_token', 'mock-token-linzhixia')
    const resumes = await resumeApi.list()
    expect(await getDefaultResumeId()).toBe(resumes.find((item) => item.isDefault).id)
  })

  it('registers a company and creates a resume through the API contracts', async () => {
    const company = await authApi.register({
      username: 'new_company_hr',
      password: 'dreamhiring',
      nickname: '新企业',
      role: 'COMPANY',
      captchaId: 'mock',
      captchaCode: '',
    })
    localStorage.setItem('dreamhiring_token', company.accessToken)
    expect((await companyApi.profile()).auditStatus).toBe('PENDING')

    const seeker = await authApi.register({
      username: 'new_seeker',
      password: 'dreamhiring',
      nickname: '新求职者',
      role: 'SEEKER',
      captchaId: 'mock',
      captchaCode: '',
    })
    localStorage.setItem('dreamhiring_token', seeker.accessToken)
    const resume = await resumeApi.create({
      name: '新求职者',
      title: '产品设计师',
      education: 'BACHELOR',
      experienceYears: 2,
      currentCity: '杭州',
      expectCity: '杭州',
      expectSalaryMin: 10,
      expectSalaryMax: 18,
      skillTags: ['Figma'],
      summary: '两年产品设计经验。',
    })
    expect(resume.userId).toBe(seeker.user.id)
  })
})
