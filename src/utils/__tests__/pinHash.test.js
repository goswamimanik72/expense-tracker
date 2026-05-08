import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin } from '../../utils/pinHash'

describe('pinHash', () => {
  describe('hashPin', () => {
    it('returns a 64-char hex SHA-256 string', () => {
      const hash = hashPin('1234')
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]+$/)
    })

    it('produces consistent hashes for the same input', () => {
      expect(hashPin('1234')).toBe(hashPin('1234'))
    })

    it('produces different hashes for different inputs', () => {
      expect(hashPin('1234')).not.toBe(hashPin('5678'))
    })

    it('trims whitespace before hashing', () => {
      expect(hashPin('1234')).toBe(hashPin('  1234  '))
    })

    it('throws for empty string', () => {
      expect(() => hashPin('')).toThrow()
    })

    it('throws for null', () => {
      expect(() => hashPin(null)).toThrow()
    })
  })

  describe('verifyPin', () => {
    it('returns true for correct PIN', () => {
      const hash = hashPin('9876')
      expect(verifyPin('9876', hash)).toBe(true)
    })

    it('returns false for wrong PIN', () => {
      const hash = hashPin('9876')
      expect(verifyPin('0000', hash)).toBe(false)
    })

    it('returns false if hash is missing', () => {
      expect(verifyPin('1234', null)).toBe(false)
    })

    it('returns false if pin is empty', () => {
      const hash = hashPin('1234')
      expect(verifyPin('', hash)).toBe(false)
    })
  })
})
