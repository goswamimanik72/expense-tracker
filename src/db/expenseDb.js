import { getDB } from './db'
import { v4 as uuidv4 } from '../utils/uuid'

/**
 * Add a new expense to the DB.
 * @param {Omit<Expense, 'id'>} expense
 * @returns {Promise<Expense>}
 */
export async function addExpense(expense) {
  const db = await getDB()
  const newExpense = {
    id: uuidv4(),
    syncStatus: 'local',
    embedding: null,
    ...expense,
    date: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
  }
  await db.put('expenses', newExpense)
  return newExpense
}

/**
 * Get all expenses sorted by date descending.
 * @returns {Promise<Expense[]>}
 */
export async function getAllExpenses() {
  const db = await getDB()
  const all = await db.getAll('expenses')
  return all.sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Get a single expense by ID.
 * @param {string} id
 * @returns {Promise<Expense|undefined>}
 */
export async function getExpenseById(id) {
  const db = await getDB()
  return db.get('expenses', id)
}

/**
 * Update an existing expense.
 * @param {Expense} expense
 * @returns {Promise<Expense>}
 */
export async function updateExpense(expense) {
  const db = await getDB()
  const existing = await db.get('expenses', expense.id)
  if (!existing) throw new Error(`Expense with id ${expense.id} not found`)
  const updated = {
    ...existing,
    ...expense,
    date: expense.date ? new Date(expense.date).toISOString() : existing.date,
    syncStatus: 'pending',
  }
  await db.put('expenses', updated)
  return updated
}

/**
 * Delete an expense by ID.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteExpense(id) {
  const db = await getDB()
  await db.delete('expenses', id)
}

/**
 * Get expenses filtered by month and year.
 * @param {number} year
 * @param {number} month - 1-indexed
 * @returns {Promise<Expense[]>}
 */
export async function getExpensesByMonth(year, month) {
  const all = await getAllExpenses()
  return all.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

/**
 * Get expenses grouped by category.
 * @param {Expense[]} expenses
 * @returns {Record<string, number>}
 */
export function aggregateByCategory(expenses) {
  return expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
}

/**
 * Get monthly totals for bar chart.
 * @param {Expense[]} expenses
 * @returns {{ month: string, total: number }[]}
 */
export function aggregateByMonth(expenses) {
  const map = {}
  expenses.forEach((e) => {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map[key] = (map[key] || 0) + Number(e.amount)
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}
