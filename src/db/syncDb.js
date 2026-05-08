import { getDB } from './db'
import { v4 as uuidv4 } from '../utils/uuid'

export async function addToSyncQueue(action, entityId, collection, payload) {
  const db = await getDB()
  const syncItem = {
    id: uuidv4(),
    action, // 'CREATE', 'UPDATE', 'DELETE'
    entityId,
    collection, // 'expenses', 'splits', 'breakdowns'
    payload,
    timestamp: new Date().toISOString(),
    failedAttempts: 0
  }
  await db.put('syncQueue', syncItem)
  return syncItem
}

export async function getSyncQueue() {
  const db = await getDB()
  const queue = await db.getAll('syncQueue')
  // Return sorted by timestamp exactly
  return queue.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

export async function removeFromSyncQueue(id) {
  const db = await getDB()
  await db.delete('syncQueue', id)
}

export async function incrementFailedAttempt(id) {
  const db = await getDB()
  const item = await db.get('syncQueue', id)
  if (item) {
    item.failedAttempts = (item.failedAttempts || 0) + 1
    await db.put('syncQueue', item)
  }
}

export async function updateEntitySyncStatus(collection, id, status) {
  const db = await getDB()
  const item = await db.get(collection, id)
  if (item) {
    item.syncStatus = status
    await db.put(collection, item)
  }
}
