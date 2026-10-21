export const ROLE_LABELS = {
  SEEKER: '求职者',
  COMPANY: '企业 HR',
  ADMIN: '平台管理员',
}

export const ROLE_HOME = {
  SEEKER: '/seeker/home',
  COMPANY: '/company/home',
  ADMIN: '/admin/home',
}

export const APPLICATION_STATUS = {
  PENDING_VIEW: { label: '待查看', type: 'warning' },
  VIEWED: { label: '已查看', type: 'primary' },
  INTERVIEW: { label: '邀面试', type: 'success' },
  REJECTED: { label: '不合适', type: 'danger' },
}

export const JOB_STATUS = {
  DRAFT: { label: '草稿', type: 'info' },
  PUBLISHED: { label: '招聘中', type: 'success' },
  OFFLINE: { label: '已下线', type: 'info' },
}

export const AUDIT_STATUS = {
  PENDING: { label: '待审核', type: 'warning' },
  APPROVED: { label: '已通过', type: 'success' },
  REJECTED: { label: '已驳回', type: 'danger' },
}

export const USER_STATUS = {
  ACTIVE: { label: '正常', type: 'success' },
  DISABLED: { label: '已禁用', type: 'danger' },
}

export const EDUCATION_LABELS = {
  COLLEGE: '大专',
  BACHELOR: '本科',
  MASTER: '硕士',
  DOCTOR: '博士',
  UNLIMITED: '不限',
}

export const EXPERIENCE_LABELS = {
  FRESH: '应届',
  ONE_TO_THREE: '1-3年',
  THREE_TO_FIVE: '3-5年',
  FIVE_TO_TEN: '5-10年',
  TEN_PLUS: '10年以上',
  UNLIMITED: '不限',
}

export const MESSAGE_TYPES = {
  APPLICATION: { label: '投递反馈', type: 'primary' },
  ANNOUNCEMENT: { label: '公告', type: 'warning' },
  SYSTEM: { label: '系统', type: 'info' },
}
