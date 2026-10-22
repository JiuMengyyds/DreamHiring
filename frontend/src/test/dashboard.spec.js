import { describe, expect, it } from 'vitest'
import { calculateResumeCompletion, countActiveApplications } from '../utils/dashboard.js'

describe('dashboard metrics', () => {
  it('calculates resume completion from persisted profile fields', () => {
    expect(calculateResumeCompletion(null)).toBe(0)
    expect(calculateResumeCompletion({
      name: '林知夏',
      title: '产品设计师',
      education: 'BACHELOR',
      currentCity: '杭州',
      expectCity: '杭州',
      expectSalaryMin: 20,
      expectSalaryMax: 30,
      skillTags: ['Figma'],
      summary: '产品设计经验',
      attachmentObjectKey: 'resume/1/demo.pdf',
    })).toBe(100)
  })

  it('counts non-rejected applications as active', () => {
    expect(countActiveApplications([
      { status: 'PENDING_VIEW' },
      { status: 'INTERVIEW' },
      { status: 'REJECTED' },
    ])).toBe(2)
  })
})
