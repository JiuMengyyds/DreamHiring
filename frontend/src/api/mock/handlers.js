import { db, credentialUsers } from './db.js'

const now = '2026-10-21 10:00:00'

function ok(data = null) {
  return { code: 200, msg: 'success', data }
}

function fail(code, msg) {
  return { code, msg, data: null }
}

function parseBody(config) {
  if (!config.data) return {}
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data)
    } catch {
      return {}
    }
  }
  return config.data
}

function paginate(list, page = 1, size = 10) {
  const currentPage = Math.max(1, Number(page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(size) || 10))
  const start = (currentPage - 1) * pageSize
  return {
    records: list.slice(start, start + pageSize),
    total: list.length,
    page: currentPage,
    size: pageSize,
  }
}

function currentUser(config) {
  const authorization = config.headers?.Authorization || config.headers?.authorization || ''
  const token = authorization.replace(/^Bearer\s+/i, '')
  const username = token.replace(/^mock-token-/, '')
  return credentialUsers[username] || null
}

function requireRole(config, roles) {
  const user = currentUser(config)
  if (!user) return { error: fail(401, '请先登录或重新登录') }
  if (!roles.includes(user.role)) return { error: fail(403, '无权执行该操作') }
  return { user }
}

function filterJobs(query) {
  const keyword = String(query.keyword || '').trim().toLowerCase()
  const minSalary = Number(query.salaryMin) || 0
  const maxSalary = Number(query.salaryMax) || 0

  return db.jobs.filter((job) => {
    if (keyword) {
      const haystack = `${job.title} ${job.companyName} ${job.industry} ${job.skillTags.join(' ')}`.toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    if (query.city && query.city !== '不限' && job.city !== query.city) return false
    if (minSalary && job.salaryMax < minSalary) return false
    if (maxSalary && job.salaryMin > maxSalary) return false
    if (query.education && query.education !== 'UNLIMITED' && job.education !== query.education) return false
    if (query.experience && query.experience !== 'UNLIMITED' && job.experience !== query.experience) return false
    return true
  })
}

function jobWithMatch(job, resume) {
  const matchedSkills = resume?.skillTags?.filter((skill) => job.skillTags.includes(skill)) || []
  return {
    ...job,
    matchScore: resume ? Math.round((matchedSkills.length / Math.max(job.skillTags.length, 1)) * 100) : null,
    matchExplanation: resume
      ? {
          score: job.matchScore ?? Math.round((matchedSkills.length / Math.max(job.skillTags.length, 1)) * 100),
          matchedSkills,
          missingSkills: job.skillTags.filter((skill) => !matchedSkills.includes(skill)),
          matchedCount: matchedSkills.length,
          totalCount: job.skillTags.length,
        }
      : null,
  }
}

export function handleMockRequest(config) {
  const url = new URL(config.url || '', 'http://mock.local')
  const path = url.pathname.replace(/\/+$/, '')
  const method = (config.method || 'get').toLowerCase()
  const query = Object.fromEntries(url.searchParams.entries())
  const body = parseBody(config)
  const segment = (index) => path.split('/').filter(Boolean)[index]

  if (path === '/api/auth/captcha' && method === 'post') {
    return ok({ captchaId: 'mock-captcha', imageBase64: '', expiresIn: 120 })
  }

  if (path === '/api/auth/register' && method === 'post') {
    return ok({ accessToken: `mock-token-${body.username}`, tokenType: 'Bearer', expiresIn: 7200, user: { ...credentialUsers[body.username], role: body.role } })
  }

  if (path === '/api/auth/login' && method === 'post') {
    const user = credentialUsers[body.username]
    if (!user || body.password !== 'dreamhiring') return fail(401, '账号或密码错误')
    if (body.captchaCode === 'bad') return fail(400, '验证码无效或已过期')
    return ok({ accessToken: `mock-token-${user.username}`, tokenType: 'Bearer', expiresIn: 7200, user })
  }

  if (path === '/api/auth/logout' && method === 'post') return ok()
  if (path === '/api/auth/me' && method === 'get') {
    const check = requireRole(config, ['SEEKER', 'COMPANY', 'ADMIN'])
    return check.error || ok(check.user)
  }

  if (path === '/api/users/me') {
    const check = requireRole(config, ['SEEKER', 'COMPANY', 'ADMIN'])
    if (check.error) return check.error
    if (method === 'get') return ok(check.user)
    if (method === 'put') {
      Object.assign(check.user, body)
      return ok(check.user)
    }
  }

  if (path === '/api/users/me/password' && method === 'put') return ok()

  if (path === '/api/files' && method === 'post') {
    return ok({
      objectKey: `resume/10001/2026/10/${Date.now()}.pdf`,
      url: '/files/demo-resume.pdf',
      visibility: body.scope === 'RESUME_ATTACHMENT' ? 'PRIVATE' : 'PUBLIC',
      urlExpiresAt: body.scope === 'RESUME_ATTACHMENT' ? '2026-10-21 10:15:00' : null,
      originalName: 'resume.pdf',
      contentType: 'application/pdf',
      size: 1887436,
    })
  }

  if (path === '/api/jobs' && method === 'get') {
    const resume = currentUser(config) ? db.resumes.find((item) => item.isDefault) : null
    const filtered = filterJobs(query)
    const pageData = paginate(filtered, query.page, query.size)
    return ok({ ...pageData, records: pageData.records.map((job) => jobWithMatch(job, resume)) })
  }

  if (path === '/api/jobs/hot' && method === 'get') {
    const hot = [...db.jobs].sort((a, b) => b.viewCount - a.viewCount).slice(0, Number(query.limit) || 4)
    return ok(hot)
  }

  if (path === '/api/job-categories/tree' && method === 'get') return ok(db.categories)

  if (path.startsWith('/api/jobs/') && method === 'get') {
    const job = db.jobs.find((item) => item.id === Number(segment(2)))
    if (!job) return fail(404, '职位不存在或已删除')
    const resume = db.resumes.find((item) => item.isDefault)
    return ok(jobWithMatch(job, resume))
  }

  if (path === '/api/announcements' && method === 'get') {
    const list = db.announcements.filter((item) => item.status === 'PUBLISHED')
    return ok(paginate(list, query.page, query.size))
  }

  if (path.startsWith('/api/announcements/') && method === 'get') {
    const announcement = db.announcements.find((item) => item.id === Number(segment(2)))
    return announcement ? ok(announcement) : fail(404, '公告不存在或已删除')
  }

  if (path === '/api/resumes') {
    const check = requireRole(config, ['SEEKER'])
    if (check.error) return check.error
    if (method === 'get') return ok(db.resumes.filter((item) => item.userId === check.user.id))
    if (method === 'post') {
      const resume = { ...body, id: Date.now(), userId: check.user.id, isDefault: db.resumes.length === 0, createdAt: now, updatedAt: now }
      db.resumes.push(resume)
      if (resume.isDefault) db.resumes.forEach((item) => { item.isDefault = item.id === resume.id })
      return ok(resume)
    }
  }

  if (path.startsWith('/api/resumes/')) {
    const check = requireRole(config, ['SEEKER'])
    if (check.error) return check.error
    const id = Number(segment(2))
    const resume = db.resumes.find((item) => item.id === id && item.userId === check.user.id)
    if (!resume) return fail(404, '简历不存在或已删除')

    if (path.endsWith('/default') && method === 'put') {
      db.resumes.forEach((item) => { item.isDefault = item.id === resume.id })
      return ok(resume)
    }

    if (path.endsWith('/attachment') && method === 'post') {
      resume.attachmentObjectKey = `resume/${check.user.id}/2026/10/attachment.pdf`
      resume.attachmentUrl = '/files/demo-resume.pdf'
      resume.updatedAt = now
      return ok(resume)
    }

    if (method === 'get') return ok(resume)
    if (method === 'put') {
      Object.assign(resume, body, { updatedAt: now })
      return ok(resume)
    }
    if (method === 'delete') {
      const index = db.resumes.indexOf(resume)
      db.resumes.splice(index, 1)
      return ok()
    }
  }

  if (path === '/api/applications' && method === 'post') {
    const check = requireRole(config, ['SEEKER'])
    if (check.error) return check.error
    const job = db.jobs.find((item) => item.id === Number(body.jobId))
    if (!job) return fail(404, '职位不存在或已删除')
    if (db.applications.some((item) => item.resumeId === Number(body.resumeId) && item.jobId === job.id)) {
      return fail(409, '你已经投递过该职位')
    }
    const application = {
      id: Date.now(),
      resumeId: Number(body.resumeId),
      jobId: job.id,
      userId: check.user.id,
      status: 'PENDING_VIEW',
      matchScore: job.matchScore ?? 0,
      companyRemark: '',
      deliveryTime: now,
      handleTime: null,
    }
    db.applications.unshift(application)
    return ok({ ...application, job })
  }

  if (path === '/api/applications/my' && method === 'get') {
    const check = requireRole(config, ['SEEKER'])
    if (check.error) return check.error
    const list = db.applications
      .filter((item) => item.userId === check.user.id)
      .map((item) => ({ ...item, job: db.jobs.find((job) => job.id === item.jobId) }))
    const filtered = query.status ? list.filter((item) => item.status === query.status) : list
    return ok(paginate(filtered, query.page, query.size))
  }

  if (path.startsWith('/api/applications/') && path !== '/api/applications/my' && method === 'get') {
    const check = requireRole(config, ['SEEKER'])
    if (check.error) return check.error
    const application = db.applications.find((item) => item.id === Number(segment(2)))
    return application ? ok({ ...application, job: db.jobs.find((job) => job.id === application.jobId) }) : fail(404, '投递记录不存在')
  }

  if (path === '/api/company/applications' && method === 'get') {
    const check = requireRole(config, ['COMPANY'])
    if (check.error) return check.error
    const list = db.applications
      .map((item) => ({ ...item, job: db.jobs.find((job) => job.id === item.jobId), resume: db.resumes.find((resume) => resume.id === item.resumeId) }))
      .filter((item) => item.job?.companyId === 1)
    return ok(paginate(list, query.page, query.size))
  }

  if (path.startsWith('/api/company/applications/')) {
    const check = requireRole(config, ['COMPANY'])
    if (check.error) return check.error
    const id = Number(segment(3))
    const application = db.applications.find((item) => item.id === id)
    if (!application) return fail(404, '投递记录不存在')
    if (path.endsWith('/status') && method === 'put') {
      application.status = body.status
      application.companyRemark = body.remark || application.companyRemark
      application.handleTime = now
      return ok(application)
    }
    if (path.endsWith('/remark') && method === 'put') {
      application.companyRemark = body.remark || ''
      return ok(application)
    }
    return ok({ ...application, job: db.jobs.find((job) => job.id === application.jobId), resume: db.resumes.find((resume) => resume.id === application.resumeId) })
  }

  if (path === '/api/company/profile') {
    const check = requireRole(config, ['COMPANY'])
    if (check.error) return check.error
    const company = db.companies.find((item) => item.userId === check.user.id)
    if (method === 'get') return ok(company)
    if (method === 'put') {
      Object.assign(company, body)
      return ok(company)
    }
  }

  if (path === '/api/company/jobs') {
    const check = requireRole(config, ['COMPANY'])
    if (check.error) return check.error
    if (method === 'get') return ok(paginate(db.companyJobs, query.page, query.size))
    if (method === 'post') {
      const job = { ...body, id: Date.now(), companyId: 1, status: 'DRAFT', auditStatus: 'PENDING', applicantCount: 0, pendingApplicantCount: 0, updatedAt: now }
      db.companyJobs.unshift(job)
      return ok(job)
    }
  }

  if (path.startsWith('/api/company/jobs/')) {
    const check = requireRole(config, ['COMPANY'])
    if (check.error) return check.error
    const id = Number(segment(3))
    const job = db.companyJobs.find((item) => item.id === id)
    if (!job) return fail(404, '职位不存在或已删除')
    if (path.endsWith('/status') && method === 'put') {
      job.status = body.status
      job.updatedAt = now
      return ok(job)
    }
    if (method === 'get') return ok(job)
    if (method === 'put') {
      Object.assign(job, body, { auditStatus: 'PENDING', updatedAt: now })
      return ok(job)
    }
    if (method === 'delete') {
      db.companyJobs.splice(db.companyJobs.indexOf(job), 1)
      return ok()
    }
  }

  if (path === '/api/company/dashboard' && method === 'get') {
    const check = requireRole(config, ['COMPANY'])
    if (check.error) return check.error
    return ok({
      activeJobCount: db.companyJobs.filter((item) => item.status === 'PUBLISHED').length,
      pendingCandidateCount: db.applications.filter((item) => item.status === 'PENDING_VIEW').length,
      interviewCount: db.applications.filter((item) => item.status === 'INTERVIEW').length,
      averageMatchScore: 82.4,
      funnel: { views: 8400, applications: 126, interviews: 18, hires: 6 },
    })
  }

  if (path === '/api/messages') {
    const check = requireRole(config, ['SEEKER', 'COMPANY', 'ADMIN'])
    if (check.error) return check.error
    const list = db.messages.filter((item) => item.receiverId === check.user.id)
    return ok(paginate(list, query.page, query.size))
  }

  if (path === '/api/messages/unread-count' && method === 'get') {
    const check = requireRole(config, ['SEEKER', 'COMPANY', 'ADMIN'])
    if (check.error) return check.error
    return ok({ count: db.messages.filter((item) => item.receiverId === check.user.id && !item.isRead).length })
  }

  if (path === '/api/messages/read-all' && method === 'put') {
    const check = requireRole(config, ['SEEKER', 'COMPANY', 'ADMIN'])
    if (check.error) return check.error
    db.messages.forEach((item) => { if (item.receiverId === check.user.id) item.isRead = true })
    return ok({ count: 0 })
  }

  if (path.startsWith('/api/messages/')) {
    const check = requireRole(config, ['SEEKER', 'COMPANY', 'ADMIN'])
    if (check.error) return check.error
    const id = Number(segment(2))
    const message = db.messages.find((item) => item.id === id && item.receiverId === check.user.id)
    if (!message) return fail(404, '消息不存在或已删除')
    if (path.endsWith('/read') && method === 'put') {
      message.isRead = true
      return ok(message)
    }
    if (method === 'get') return ok(message)
    if (method === 'delete') {
      db.messages.splice(db.messages.indexOf(message), 1)
      return ok()
    }
  }

  if (path === '/api/admin/users' && method === 'get') {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    return ok(paginate(db.users, query.page, query.size))
  }

  if (path.startsWith('/api/admin/users/')) {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    const id = Number(segment(3))
    const user = db.users.find((item) => item.id === id)
    if (!user) return fail(404, '用户不存在或已删除')
    if (path.endsWith('/status') && method === 'put') {
      user.status = body.status
      return ok(user)
    }
    if (method === 'get') return ok(user)
    if (method === 'delete') {
      const hasRelations = db.resumes.some((item) => item.userId === user.id) ||
        db.applications.some((item) => item.userId === user.id) ||
        db.companies.some((item) => item.userId === user.id)
      if (hasRelations) return fail(409, '该账号存在业务数据，请先禁用账号')
      db.users.splice(db.users.indexOf(user), 1)
      return ok()
    }
  }

  if (path === '/api/admin/companies' && method === 'get') {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    return ok(paginate(db.companies, query.page, query.size))
  }

  if (path.startsWith('/api/admin/companies/')) {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    const company = db.companies.find((item) => item.id === Number(segment(3)))
    if (!company) return fail(404, '企业不存在或已删除')
    if (path.endsWith('/audit') && method === 'put') {
      if (!['APPROVED', 'REJECTED'].includes(body.auditStatus)) return fail(422, '企业审核仅支持通过或驳回')
      if (body.auditStatus === 'REJECTED' && !String(body.reason || '').trim()) return fail(422, '驳回时必须填写原因')
      company.auditStatus = body.auditStatus
      company.auditReason = body.reason || ''
      return ok(company)
    }
    if (method === 'get') return ok(company)
  }

  if (path === '/api/admin/jobs' && method === 'get') {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    return ok(paginate(db.companyJobs, query.page, query.size))
  }

  if (path.startsWith('/api/admin/jobs/') && method === 'get') {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    const job = db.companyJobs.find((item) => item.id === Number(segment(3)))
    return job ? ok(job) : fail(404, '职位不存在或已删除')
  }

  if (path.startsWith('/api/admin/jobs/') && path.endsWith('/audit') && method === 'put') {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    const job = db.companyJobs.find((item) => item.id === Number(segment(3)))
    if (!job) return fail(404, '职位不存在或已删除')
    job.auditStatus = body.auditStatus
    if (body.auditStatus === 'APPROVED') job.status = 'PUBLISHED'
    return ok(job)
  }

  if (path === '/api/admin/job-categories' && method === 'post') {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    const category = { ...body, id: Date.now(), jobCount: 0, children: [] }
    db.categories.push(category)
    return ok(category)
  }

  if (path.startsWith('/api/admin/job-categories/')) {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    const id = Number(segment(3))
    const category = db.categories.find((item) => item.id === id)
    if (!category) return fail(404, '分类不存在或已删除')
    if (method === 'put') {
      Object.assign(category, body)
      return ok(category)
    }
    if (method === 'delete') {
      if (category.children?.length) return fail(409, '存在子分类，不能删除')
      if (category.jobCount > 0) return fail(409, '该分类已被职位引用，不能删除')
      db.categories.splice(db.categories.indexOf(category), 1)
      return ok()
    }
  }

  if (path === '/api/admin/announcements') {
    const check = requireRole(config, ['ADMIN'])
    if (check.error) return check.error
    if (method === 'get') return ok(paginate(db.announcements, query.page, query.size))
    if (method === 'post') {
      const announcement = { ...body, id: Date.now(), publisherId: check.user.id, createdAt: now, publishedAt: body.status === 'PUBLISHED' ? now : null }
      db.announcements.unshift(announcement)
      return ok(announcement)
    }
  }

  if (path === '/api/stats/dashboard' && method === 'get') return ok(db.dashboardStats)
  if (path === '/api/stats/trend' && method === 'get') return ok(db.dashboardStats.trend)
  if (path === '/api/stats/hot-skills' && method === 'get') return ok(db.dashboardStats.hotSkills)

  return fail(404, '接口未定义')
}
