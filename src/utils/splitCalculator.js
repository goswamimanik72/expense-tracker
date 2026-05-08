/**
 * Calculate split shares between two users.
 *
 * @param {number} totalAmount
 * @param {'equal'|'custom'} splitType
 * @param {{ userA?: number, userB?: number }} customShares - required when splitType is 'custom'
 * @returns {{ userA: number, userB: number }}
 */
export function calculateSplit(totalAmount, splitType, customShares = {}) {
  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    throw new Error('totalAmount must be a positive number')
  }

  if (splitType === 'equal') {
    const half = Math.round((totalAmount / 2) * 100) / 100
    const other = Math.round((totalAmount - half) * 100) / 100
    return { userA: half, userB: other }
  }

  if (splitType === 'custom') {
    const { userA, userB } = customShares
    if (userA == null || userB == null) {
      throw new Error('Custom split requires both userA and userB shares')
    }
    const sum = Math.round((Number(userA) + Number(userB)) * 100) / 100
    if (Math.abs(sum - totalAmount) > 0.01) {
      throw new Error(`Custom shares (${sum}) must sum to total amount (${totalAmount})`)
    }
    return { userA: Number(userA), userB: Number(userB) }
  }

  throw new Error(`Unknown splitType: ${splitType}. Must be 'equal' or 'custom'`)
}

/**
 * Build a full Split record ready for DB storage.
 *
 * @param {string} expenseId
 * @param {string} userA
 * @param {string} userB
 * @param {number} totalAmount
 * @param {'equal'|'custom'} splitType
 * @param {{ userA?: number, userB?: number }} customShares
 * @returns {object}
 */
export function buildSplitRecord(expenseId, userA, userB, totalAmount, splitType, customShares = {}) {
  const shares = calculateSplit(totalAmount, splitType, customShares)
  return {
    expenseId,
    userA,
    userB,
    splitType,
    shares,
    syncStatus: 'local',
  }
}
