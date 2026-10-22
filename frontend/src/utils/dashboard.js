export function calculateResumeCompletion(resume) {
  if (!resume) return 0
  const fields = [
    resume.name,
    resume.title,
    resume.education,
    resume.currentCity,
    resume.expectCity,
    resume.expectSalaryMin,
    resume.expectSalaryMax,
    resume.skillTags?.length,
    resume.summary,
    resume.attachmentObjectKey,
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

export function countActiveApplications(applications) {
  return applications.filter((item) => item.status !== 'REJECTED').length
}
