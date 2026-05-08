import { getSyncQueue, removeFromSyncQueue, incrementFailedAttempt, updateEntitySyncStatus } from '../db/syncDb'

// This is a stub for the future backend API call
// In a real app, this would use fetch() to push to Node/Express
// For now, it will just mock a success if mockSuccess is true
async function pushToBackend(item, mockSuccess = true) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockSuccess) resolve({ ok: true })
      else reject(new Error('Network error'))
    }, 100)
  })
}

export async function processSyncQueue(mockSuccess = true) {
  const queue = await getSyncQueue()
  
  if (queue.length === 0) {
    return { success: true, processed: 0, pending: 0 }
  }

  let processedCount = 0
  let failedCount = 0

  for (const item of queue) {
    try {
      // Stub API call
      await pushToBackend(item, mockSuccess)
      
      // If successful:
      // 1. Remove from sync queue
      await removeFromSyncQueue(item.id)
      
      // 2. Mark the actual entity as 'synced' (unless it was a DELETE action, then it's already gone)
      if (item.action !== 'DELETE') {
        await updateEntitySyncStatus(item.collection, item.entityId, 'synced')
      }
      
      processedCount++
    } catch (err) {
      console.error(`Failed to sync item ${item.id}:`, err)
      failedCount++
      // Increment failure count
      await incrementFailedAttempt(item.id)
    }
  }

  return {
    success: failedCount === 0,
    processed: processedCount,
    pending: failedCount
  }
}
