import { describe, expect, it } from 'vitest'
import { adminApi, authApi, companyApi, fileApi, jobApi, messageApi, resumeApi, userApi } from '../api/index.js'
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

    const industryData = await jobApi.search({
      industry: '企业服务',
      keyword: '星云',
      page: 0,
      size: 500,
    })
    expect(industryData.records.every((job) => job.industry === '企业服务')).toBe(true)
    expect(industryData.page).toBe(1)
    expect(industryData.size).toBe(100)
  })

  it('rejects deleting a user with business data and a referenced category', async () => {
    localStorage.setItem('dreamhiring_token', 'mock-token-admin_zhou')
    await expect(adminApi.deleteUser(10001)).rejects.toMatchObject({ code: 409 })
    await expect(adminApi.deleteCategory(1)).rejects.toMatchObject({ code: 409 })
  })

  it('lists and replays a pending dead letter', async () => {
    localStorage.setItem('dreamhiring_token', 'mock-token-admin_zhou')
    const page = await adminApi.deadLetters({ status: 'PENDING', page: 1, size: 10 })
    expect(page.records[0]).toMatchObject({
      queueName: 'dreamhiring.notification.queue',
      status: 'PENDING',
    })

    const replayed = await adminApi.replayDeadLetter(page.records[0].id)
    expect(replayed).toMatchObject({ status: 'REPLAYED', replayCount: 1 })
    await expect(adminApi.replayDeadLetter(replayed.id)).rejects.toMatchObject({ code: 409 })
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

  it('creates announcement messages for the selected channel', async () => {
    localStorage.setItem('dreamhiring_token', 'mock-token-admin_zhou')
    const announcement = await adminApi.createAnnouncement({
      title: '渠道公告',
      summary: '仅求职者可见',
      content: '公告正文',
      channel: 'SEEKER',
      status: 'PUBLISHED',
    })

    localStorage.setItem('dreamhiring_token', 'mock-token-linzhixia')
    const messages = await messageApi.list({ type: 'ANNOUNCEMENT', page: 1, size: 100 })
    expect(messages.records.some((item) => item.relatedId === announcement.id)).toBe(true)
  })

  it('persists avatar and company logo object keys while returning public URLs', async () => {
    localStorage.setItem('dreamhiring_token', 'mock-token-linzhixia')
    const avatarForm = new FormData()
    avatarForm.append('scope', 'AVATAR')
    const avatar = await fileApi.upload(avatarForm)
    const user = await userApi.updateMe({ avatarObjectKey: avatar.objectKey })
    expect(user.avatarObjectKey).toBe(avatar.objectKey)
    expect(user.avatarUrl).toContain('/stub-files/')

    localStorage.setItem('dreamhiring_token', 'mock-token-chenyu_hr')
    const logoForm = new FormData()
    logoForm.append('scope', 'COMPANY_LOGO')
    const logo = await fileApi.upload(logoForm)
    const company = await companyApi.updateProfile({
      ...(await companyApi.profile()),
      logoObjectKey: logo.objectKey,
    })
    expect(company.logoObjectKey).toBe(logo.objectKey)
    expect(company.logoUrl).toContain('/stub-files/')
  })

  it('updates jobs and categories through the management APIs', async () => {
    localStorage.setItem('dreamhiring_token', 'mock-token-chenyu_hr')
    const jobPage = await companyApi.jobs({ page: 1, size: 1 })
    const job = jobPage.records[0]
    const updatedJob = await companyApi.updateJob(job.id, {
      ...job,
      title: `${job.title}（更新）`,
    })
    expect(updatedJob.title).toContain('（更新）')
    expect(updatedJob.auditStatus).toBe('PENDING')

    localStorage.setItem('dreamhiring_token', 'mock-token-admin_zhou')
    const category = await adminApi.createCategory({ name: '测试分类', parentId: null, sort: 99 })
    const updatedCategory = await adminApi.updateCategory(category.id, {
      name: '测试分类更新',
      parentId: null,
      sort: 100,
    })
    expect(updatedCategory.name).toBe('测试分类更新')
  })
})
