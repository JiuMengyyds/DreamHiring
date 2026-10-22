import { ROLE_HOME } from './constants.js'

export function resolveLoginDestination(redirect, role) {
  const roleHome = ROLE_HOME[role] || '/login'
  if (typeof redirect !== 'string') return roleHome

  const target = redirect.trim()
  if (!target || target === '/' || target === '/login' || target.startsWith('/login?')) {
    return roleHome
  }
  if (!target.startsWith('/') || target.startsWith('//')) {
    return roleHome
  }
  return target
}
