/**
 * Validate that breakdown items sum to the parent expense amount.
 *
 * @param {number} parentAmount
 * @param {{ title: string, amount: number, category: string }[]} items
 * @returns {{ valid: boolean, diff: number, message: string }}
 */
export function validateBreakdown(parentAmount, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, diff: parentAmount, message: 'Breakdown must have at least one item' }
  }

  const sum = items.reduce((acc, item) => acc + Number(item.amount || 0), 0)
  const rounded = Math.round(sum * 100) / 100
  const diff = Math.round((parentAmount - rounded) * 100) / 100

  if (Math.abs(diff) > 0.01) {
    return {
      valid: false,
      diff,
      message: `Items total ₹${rounded} does not match parent amount ₹${parentAmount} (difference: ₹${diff})`,
    }
  }

  return { valid: true, diff: 0, message: 'Breakdown is valid' }
}

/**
 * Build a full Breakdown record ready for DB storage.
 *
 * @param {string} parentExpenseId
 * @param {{ title: string, amount: number, category: string }[]} items
 * @returns {object}
 */
export function buildBreakdownRecord(parentExpenseId, items) {
  return {
    parentExpenseId,
    items: items.map((item) => ({
      title: item.title || '',
      amount: Number(item.amount),
      category: item.category || 'Other',
    })),
  }
}
