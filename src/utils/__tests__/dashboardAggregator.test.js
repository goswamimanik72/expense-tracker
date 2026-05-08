import { describe, it, expect } from 'vitest'
import { aggregateByCategory, aggregateByMonth } from '../../db/expenseDb'

const sampleExpenses = [
  { id: '1', amount: 5000, category: 'Food', date: '2026-01-15T10:00:00.000Z' },
  { id: '2', amount: 2000, category: 'Travel', date: '2026-01-20T10:00:00.000Z' },
  { id: '3', amount: 3000, category: 'Food', date: '2026-02-05T10:00:00.000Z' },
  { id: '4', amount: 8000, category: 'Rent', date: '2026-02-01T10:00:00.000Z' },
  { id: '5', amount: 1500, category: 'Travel', date: '2026-02-18T10:00:00.000Z' },
]

describe('dashboardAggregator', () => {
  describe('aggregateByCategory', () => {
    it('sums amounts per category', () => {
      const result = aggregateByCategory(sampleExpenses)
      expect(result.Food).toBe(8000)
      expect(result.Travel).toBe(3500)
      expect(result.Rent).toBe(8000)
    })

    it('returns empty object for no expenses', () => {
      expect(aggregateByCategory([])).toEqual({})
    })

    it('handles single expense', () => {
      const result = aggregateByCategory([sampleExpenses[0]])
      expect(result.Food).toBe(5000)
    })
  })

  describe('aggregateByMonth', () => {
    it('groups by YYYY-MM and sums totals', () => {
      const result = aggregateByMonth(sampleExpenses)
      const jan = result.find((r) => r.month === '2026-01')
      const feb = result.find((r) => r.month === '2026-02')
      expect(jan.total).toBe(7000)
      expect(feb.total).toBe(12500)
    })

    it('sorts months chronologically', () => {
      const result = aggregateByMonth(sampleExpenses)
      expect(result[0].month).toBe('2026-01')
      expect(result[1].month).toBe('2026-02')
    })

    it('returns empty array for no expenses', () => {
      expect(aggregateByMonth([])).toEqual([])
    })
  })
})
