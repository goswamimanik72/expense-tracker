import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as securityDb from '../db/securityDb'
import { hashPin } from '../utils/pinHash'

// Mock dependencies
vi.mock('../db/expenseDb', () => ({
  getAllExpenses: vi.fn().mockResolvedValue([]),
  aggregateByCategory: vi.fn().mockReturnValue({}),
  aggregateByMonth: vi.fn().mockReturnValue([]),
}))

vi.mock('../db/securityDb', () => ({
  hasPin: vi.fn(),
  getPinHash: vi.fn(),
  savePinHash: vi.fn(),
}))

describe('Lock / Unlock Flow — Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows setup screen if no PIN exists, allows setup, then unlocks', async () => {
    // When LockScreen mounts it calls hasPin
    securityDb.hasPin.mockResolvedValueOnce(false)
    securityDb.savePinHash.mockResolvedValueOnce()

    const user = userEvent.setup()
    render(<App />)

    // Wait for setup screen
    await waitFor(() => {
      expect(screen.getByText('Setup Security PIN')).toBeInTheDocument()
    })

    // Enter 1234
    await user.click(screen.getByText('1'))
    await user.click(screen.getByText('2'))
    await user.click(screen.getByText('3'))
    await user.click(screen.getByText('4'))

    // Should transition to confirm
    await waitFor(() => {
      expect(screen.getByText('Confirm your PIN')).toBeInTheDocument()
    })

    // Enter 1234 again
    await user.click(screen.getByText('1'))
    await user.click(screen.getByText('2'))
    await user.click(screen.getByText('3'))
    await user.click(screen.getByText('4'))

    // Should eventually unlock and show Dashboard
    await waitFor(() => {
      expect(securityDb.savePinHash).toHaveBeenCalledTimes(1)
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    })
  })

  it('shows lock screen if PIN exists, and unlocks with correct PIN', async () => {
    securityDb.hasPin.mockResolvedValueOnce(true)
    // Dynamic correct hash for '9876'
    securityDb.getPinHash.mockResolvedValueOnce(hashPin('9876'))

    const user = userEvent.setup()
    render(<App />)

    // Wait for unlock screen
    await waitFor(() => {
      expect(screen.getByText('Enter PIN to Unlock')).toBeInTheDocument()
    })

    // Enter 9876
    await user.click(screen.getByText('9'))
    await user.click(screen.getByText('8'))
    await user.click(screen.getByText('7'))
    await user.click(screen.getByText('6'))

    // Should eventually unlock and show Dashboard
    await waitFor(() => {
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    })
  })
})
