import { getDB } from './db'
import { v4 as uuidv4 } from '../utils/uuid'

// --- SPLITS ---

export async function addSplit(splitData) {
  const db = await getDB()
  const newSplit = {
    id: uuidv4(),
    ...splitData,
  }
  await db.put('splits', newSplit)
  return newSplit
}

export async function getSplitByExpenseId(expenseId) {
  const db = await getDB()
  const splits = await db.getAllFromIndex('splits', 'by-expenseId', expenseId)
  return splits.length > 0 ? splits[0] : null
}

export async function deleteSplit(id) {
  const db = await getDB()
  await db.delete('splits', id)
}

// --- BREAKDOWNS ---

export async function addBreakdown(breakdownData) {
  const db = await getDB()
  const newBreakdown = {
    id: uuidv4(),
    ...breakdownData,
  }
  await db.put('breakdowns', newBreakdown)
  return newBreakdown
}

export async function getBreakdownByExpenseId(parentExpenseId) {
  const db = await getDB()
  const breakdowns = await db.getAllFromIndex('breakdowns', 'by-parentExpenseId', parentExpenseId)
  return breakdowns.length > 0 ? breakdowns[0] : null
}

export async function deleteBreakdown(id) {
  const db = await getDB()
  await db.delete('breakdowns', id)
}
