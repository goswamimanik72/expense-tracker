import { describe, it, expect, beforeEach, vi } from 'vitest'
import { processSyncQueue } from '../syncManager'
import * as syncDb from '../../db/syncDb'

vi.mock('../../db/syncDb', () => ({
  getSyncQueue: vi.fn(),
  removeFromSyncQueue: vi.fn(),
  incrementFailedAttempt: vi.fn(),
  updateEntitySyncStatus: vi.fn()
}))

describe('Sync Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing if the queue is empty', async () => {
    syncDb.getSyncQueue.mockResolvedValue([])
    
    const result = await processSyncQueue(true)
    
    expect(result.processed).toBe(0)
    expect(result.success).toBe(true)
    expect(syncDb.removeFromSyncQueue).not.toHaveBeenCalled()
  })

  it('processes all items successfully and removes them from queue', async () => {
    const mockQueue = [
      { id: 'job1', action: 'CREATE', entityId: 'exp1', collection: 'expenses' },
      { id: 'job2', action: 'UPDATE', entityId: 'exp2', collection: 'expenses' }
    ]
    syncDb.getSyncQueue.mockResolvedValue(mockQueue)
    
    const result = await processSyncQueue(true)
    
    expect(result.processed).toBe(2)
    expect(result.pending).toBe(0)
    expect(result.success).toBe(true)
    
    expect(syncDb.removeFromSyncQueue).toHaveBeenCalledTimes(2)
    expect(syncDb.removeFromSyncQueue).toHaveBeenCalledWith('job1')
    expect(syncDb.removeFromSyncQueue).toHaveBeenCalledWith('job2')
    
    expect(syncDb.updateEntitySyncStatus).toHaveBeenCalledTimes(2)
    expect(syncDb.updateEntitySyncStatus).toHaveBeenCalledWith('expenses', 'exp1', 'synced')
  })

  it('handles backend failures by incrementing attempts without deleting', async () => {
    const mockQueue = [
      { id: 'job1', action: 'CREATE', entityId: 'exp1', collection: 'expenses' }
    ]
    syncDb.getSyncQueue.mockResolvedValue(mockQueue)
    
    // Process with mockSuccess = false
    const result = await processSyncQueue(false)
    
    expect(result.processed).toBe(0)
    expect(result.pending).toBe(1)
    expect(result.success).toBe(false)
    
    expect(syncDb.removeFromSyncQueue).not.toHaveBeenCalled()
    expect(syncDb.updateEntitySyncStatus).not.toHaveBeenCalled()
    expect(syncDb.incrementFailedAttempt).toHaveBeenCalledWith('job1')
  })
})
