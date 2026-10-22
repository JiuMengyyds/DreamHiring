import { resumeApi } from '../api/index.js'

export async function getDefaultResumeId() {
  const resumes = await resumeApi.list()
  const defaultResume = resumes.find((item) => item.isDefault) || resumes[0]
  return defaultResume?.id ?? null
}
