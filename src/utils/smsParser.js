/**
 * Parses a bank SMS message to extract expense data.
 * Handles UPI, ATM withdrawals, and debit card alerts.
 *
 * @param {string} message - Raw SMS text
 * @returns {{ amount: number|null, type: 'debit'|'credit'|null, date: string|null, raw: string }}
 */
export function parseSMS(message) {
  const result = {
    amount: null,
    type: null,
    date: null,
    raw: message,
  }

  if (!message || typeof message !== 'string') return result

  const text = message.trim()

  // --- Amount extraction ---
  // Matches: Rs. 5,000 / Rs 500 / INR 1000 / ₹2000 / Rs.1,234.56
  const amountPatterns = [
    /(?:Rs\.?\s*|INR\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)/i,
    /(?:debited|credited|withdrawn|spent)\s+(?:by|of|for)?\s*Rs\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /amount\s*(?:of)?\s*Rs\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]

  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      result.amount = parseFloat(match[1].replace(/,/g, ''))
      break
    }
  }

  // --- Transaction type extraction ---
  const debitKeywords = /\b(debited|debit|withdrawn|withdrawal|spent|paid|purchase)\b/i
  const creditKeywords = /\b(credited|credit|received|refund|cashback)\b/i

  if (debitKeywords.test(text)) {
    result.type = 'debit'
  } else if (creditKeywords.test(text)) {
    result.type = 'credit'
  }

  // --- Date extraction ---
  // Matches: 10-Apr-26 / 10/04/2026 / 10 Apr 2026
  const datePatterns = [
    /(\d{1,2}[-/]\w{3,9}[-/]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})/i,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const parsed = new Date(match[1])
      if (!isNaN(parsed.getTime())) {
        result.date = parsed.toISOString()
      }
      break
    }
  }

  // Default date to today if not found
  if (!result.date) {
    result.date = new Date().toISOString()
  }

  return result
}
