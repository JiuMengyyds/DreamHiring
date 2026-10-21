import client from './client.js'

export const authApi = {
  captcha: () => client.post('/auth/captcha'),
  register: (payload) => client.post('/auth/register', payload),
  login: (payload) => client.post('/auth/login', payload),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
}

export const userApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (payload) => client.put('/users/me', payload),
  changePassword: (payload) => client.put('/users/me/password', payload),
}

export const fileApi = {
  upload: (formData) => client.post('/files', formData),
}

export const jobApi = {
  search: (params) => client.get('/jobs', { params }),
  hot: (limit = 4) => client.get('/jobs/hot', { params: { limit } }),
  detail: (jobId) => client.get(`/jobs/${jobId}`),
  categories: () => client.get('/job-categories/tree'),
  announcements: (params) => client.get('/announcements', { params }),
  announcement: (id) => client.get(`/announcements/${id}`),
}

export const resumeApi = {
  list: (params) => client.get('/resumes', { params }),
  create: (payload) => client.post('/resumes', payload),
  detail: (id) => client.get(`/resumes/${id}`),
  update: (id, payload) => client.put(`/resumes/${id}`, payload),
  remove: (id) => client.delete(`/resumes/${id}`),
  setDefault: (id) => client.put(`/resumes/${id}/default`),
  uploadAttachment: (id, formData) => client.post(`/resumes/${id}/attachment`, formData),
}

export const applicationApi = {
  create: (payload) => client.post('/applications', payload),
  mine: (params) => client.get('/applications/my', { params }),
  detail: (id) => client.get(`/applications/${id}`),
}

export const companyApi = {
  profile: () => client.get('/company/profile'),
  updateProfile: (payload) => client.put('/company/profile', payload),
  applications: (params) => client.get('/company/applications', { params }),
  applicationDetail: (id) => client.get(`/company/applications/${id}`),
  updateApplicationStatus: (id, payload) => client.put(`/company/applications/${id}/status`, payload),
  updateApplicationRemark: (id, payload) => client.put(`/company/applications/${id}/remark`, payload),
  jobs: (params) => client.get('/company/jobs', { params }),
  createJob: (payload) => client.post('/company/jobs', payload),
  jobDetail: (id) => client.get(`/company/jobs/${id}`),
  updateJob: (id, payload) => client.put(`/company/jobs/${id}`, payload),
  deleteJob: (id) => client.delete(`/company/jobs/${id}`),
  updateJobStatus: (id, payload) => client.put(`/company/jobs/${id}/status`, payload),
  dashboard: () => client.get('/company/dashboard'),
}

export const messageApi = {
  list: (params) => client.get('/messages', { params }),
  unreadCount: () => client.get('/messages/unread-count'),
  detail: (id) => client.get(`/messages/${id}`),
  markRead: (id) => client.put(`/messages/${id}/read`),
  markAllRead: () => client.put('/messages/read-all'),
  remove: (id) => client.delete(`/messages/${id}`),
}

export const adminApi = {
  users: (params) => client.get('/admin/users', { params }),
  userDetail: (id) => client.get(`/admin/users/${id}`),
  updateUserStatus: (id, payload) => client.put(`/admin/users/${id}/status`, payload),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),
  companies: (params) => client.get('/admin/companies', { params }),
  jobs: (params) => client.get('/admin/jobs', { params }),
  auditJob: (id, payload) => client.put(`/admin/jobs/${id}/audit`, payload),
  createCategory: (payload) => client.post('/admin/job-categories', payload),
  updateCategory: (id, payload) => client.put(`/admin/job-categories/${id}`, payload),
  deleteCategory: (id) => client.delete(`/admin/job-categories/${id}`),
  announcements: (params) => client.get('/admin/announcements', { params }),
  createAnnouncement: (payload) => client.post('/admin/announcements', payload),
  updateAnnouncement: (id, payload) => client.put(`/admin/announcements/${id}`, payload),
  deleteAnnouncement: (id) => client.delete(`/admin/announcements/${id}`),
}

export const statsApi = {
  dashboard: () => client.get('/stats/dashboard'),
  trend: (months = 12) => client.get('/stats/trend', { params: { months } }),
  hotSkills: (limit = 20) => client.get('/stats/hot-skills', { params: { limit } }),
}
