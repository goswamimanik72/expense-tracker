import { describe, it, expect } from 'vitest'
import { calculateSplit, buildSplitRecord } from '../../utils/splitCalculator'

describe('splitCalculator', () => {
  describe('calculateSplit — equal', () => {
    it('splits 1000 equally', () => {
      const result = calculateSplit(1000, 'equal')
      expect(result.userA).toBe(500)
      expect(result.userB).toBe(500)
    })

    it('splits odd amount — userA + userB = total', () => {
      const result = calculateSplit(999, 'equal')
      expect(result.userA + result.userB).toBe(999)
    })

    it('splits decimal amount', () => {
      const result = calculateSplit(100.5, 'equal')
      expect(result.userA + result.userB).toBeCloseTo(100.5, 1)
    })
  })

  describe('calculateSplit — custom', () => {
    it('accepts valid custom shares', () => {
      const result = calculateSplit(1000, 'custom', { userA: 600, userB: 400 })
      expect(result.userA).toBe(600)
      expect(result.userB).toBe(400)
    })

    it('throws if custom shares do not sum to total', () => {
      expect(() => calculateSplit(1000, 'custom', { userA: 600, userB: 300 })).toThrow()
    })

    it('throws if custom shares are missing', () => {
      expect(() => calculateSplit(1000, 'custom', {})).toThrow()
    })
  })

  describe('calculateSplit — errors', () => {
    it('throws for non-positive amount', () => {
      expect(() => calculateSplit(0, 'equal')).toThrow()
    })

    it('throws for negative amount', () => {
      expect(() => calculateSplit(-500, 'equal')).toThrow()
    })

    it('throws for unknown splitType', () => {
      expect(() => calculateSplit(1000, 'thirds')).toThrow()
    })
  })

  describe('buildSplitRecord', () => {
    it('builds a valid split record', () => {
      const record = buildSplitRecord('exp-1', 'alice@email.com', 'bob@email.com', 1000, 'equal')
      expect(record.expenseId).toBe('exp-1')
      expect(record.shares.userA).toBe(500)
      expect(record.shares.userB).toBe(500)
      expect(record.syncStatus).toBe('local')
    })
  })
})
