import { describe, it, expect } from 'vitest'
import { parseSMS } from '../../utils/smsParser'

describe('smsParser', () => {
  describe('amount extraction', () => {
    it('parses Rs. prefix with comma-separated amount', () => {
      const result = parseSMS('Rs. 5,000 debited via UPI on 10-Apr-26')
      expect(result.amount).toBe(5000)
    })

    it('parses INR prefix', () => {
      const result = parseSMS('INR 1500 debited from your account')
      expect(result.amount).toBe(1500)
    })

    it('parses ₹ symbol', () => {
      const result = parseSMS('₹2000 spent at Amazon')
      expect(result.amount).toBe(2000)
    })

    it('parses decimal amounts', () => {
      const result = parseSMS('Rs. 1,234.50 debited from HDFC Bank')
      expect(result.amount).toBe(1234.5)
    })

    it('returns null for no amount', () => {
      const result = parseSMS('Your OTP is 123456. Do not share.')
      expect(result.amount).toBeNull()
    })
  })

  describe('transaction type extraction', () => {
    it('detects debit from "debited"', () => {
      const result = parseSMS('Rs. 500 debited from your account')
      expect(result.type).toBe('debit')
    })

    it('detects debit from "withdrawn"', () => {
      const result = parseSMS('Rs. 10000 withdrawn from ATM')
      expect(result.type).toBe('debit')
    })

    it('detects credit', () => {
      const result = parseSMS('Rs. 2000 credited to your account')
      expect(result.type).toBe('credit')
    })

    it('detects debit from "spent"', () => {
      const result = parseSMS('₹500 spent at Zomato')
      expect(result.type).toBe('debit')
    })

    it('returns null type for unknown pattern', () => {
      const result = parseSMS('Your account has been updated.')
      expect(result.type).toBeNull()
    })
  })

  describe('raw field', () => {
    it('preserves the original message in raw', () => {
      const msg = 'Rs. 5000 debited via UPI'
      const result = parseSMS(msg)
      expect(result.raw).toBe(msg)
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = parseSMS('')
      expect(result.amount).toBeNull()
      expect(result.type).toBeNull()
    })

    it('handles null input', () => {
      const result = parseSMS(null)
      expect(result.amount).toBeNull()
    })

    it('handles a full UPI debit SMS', () => {
      const result = parseSMS(
        'Dear Customer, Rs.5,000.00 debited from A/c XXXX1234 via UPI on 10-Apr-26. Ref No: 123456789'
      )
      expect(result.amount).toBe(5000)
      expect(result.type).toBe('debit')
    })
  })
})
