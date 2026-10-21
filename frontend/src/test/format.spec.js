import { describe, expect, it } from 'vitest'
import { clampScore, formatDate, formatSalary } from '../utils/format.js'

describe('format utilities', () => {
  it('formats salary ranges', () => {
    expect(formatSalary(25, 38)).toBe('25-38K')
    expect(formatSalary(null, null)).toBe('面议')
  })

  it('formats dates without timezone conversion', () => {
    expect(formatDate('2026-10-20 08:00:00')).toBe('2026-10-20')
  })

  it('clamps match scores into the contract range', () => {
    expect(clampScore(-5)).toBe(0)
    expect(clampScore(150)).toBe(100)
    expect(clampScore(88)).toBe(88)
  })
})
