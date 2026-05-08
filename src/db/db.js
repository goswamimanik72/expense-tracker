import { openDB } from 'idb'

const DB_NAME = 'expense-tracker-db'
const DB_VERSION = 1

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' })
          expenseStore.createIndex('by-date', 'date')
          expenseStore.createIndex('by-category', 'category')
          expenseStore.createIndex('by-source', 'source')
        }

        // Splits store
        if (!db.objectStoreNames.contains('splits')) {
          const splitStore = db.createObjectStore('splits', { keyPath: 'id' })
          splitStore.createIndex('by-expenseId', 'expenseId')
        }

        // Breakdowns store
        if (!db.objectStoreNames.contains('breakdowns')) {
          const breakdownStore = db.createObjectStore('breakdowns', { keyPath: 'id' })
          breakdownStore.createIndex('by-parentExpenseId', 'parentExpenseId')
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' })
        }

        // Security store (PIN / password)
        if (!db.objectStoreNames.contains('security')) {
          db.createObjectStore('security', { keyPath: 'id' })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('by-type', 'type')
        }
      },
    })
  }
  return dbPromise
}

/** Reset db instance — used in tests */
export function resetDB() {
  dbPromise = null
}
