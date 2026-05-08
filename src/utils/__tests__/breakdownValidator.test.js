import { describe, it, expect } from 'vitest'
import { validateBreakdown, buildBreakdownRecord } from '../../utils/breakdownValidator'

describe('breakdownValidator', () => {
  describe('validateBreakdown', () => {
    it('passes when items sum to parent amount', () => {
      const items = [
        { title: 'Food', amount: 1000, category: 'Food' },
        { title: 'Shopping', amount: 2000, category: 'Shopping' },
        { title: 'Rent', amount: 7000, category: 'Rent' },
      ]
      const result = validateBreakdown(10000, items)
      expect(result.valid).toBe(true)
    })

    it('fails when items do not sum to parent amount', () => {
      const items = [
        { title: 'Food', amount: 1000, category: 'Food' },
        { title: 'Rent', amount: 5000, category: 'Rent' },
      ]
      const result = validateBreakdown(10000, items)
      expect(result.valid).toBe(false)
      expect(result.diff).toBe(4000)
    })

    it('fails for empty items array', () => {
      const result = validateBreakdown(10000, [])
      expect(result.valid).toBe(false)
      expect(result.message).toMatch(/at least one item/i)
    })

    it('handles decimal amounts correctly', () => {
      const items = [
        { title: 'A', amount: 33.33, category: 'Food' },
        { title: 'B', amount: 33.33, category: 'Food' },
        { title: 'C', amount: 33.34, category: 'Food' },
      ]
      const result = validateBreakdown(100, items)
      expect(result.valid).toBe(true)
    })
  })

  describe('buildBreakdownRecord', () => {
    it('builds a proper breakdown record', () => {
      const items = [{ title: 'Food', amount: '500', category: 'Food' }]
      const record = buildBreakdownRecord('exp-1', items)
      expect(record.parentExpenseId).toBe('exp-1')
      expect(record.items[0].amount).toBe(500)
    })

    it('defaults category to Other if missing', () => {
      const items = [{ title: 'Misc', amount: 100 }]
      const record = buildBreakdownRecord('exp-1', items)
      expect(record.items[0].category).toBe('Other')
    })
  })
})
