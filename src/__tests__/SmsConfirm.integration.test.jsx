import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as expenseDb from '../db/expenseDb'

// Mock the DB module
vi.mock('../db/expenseDb', () => ({
  getAllExpenses: vi.fn(),
  addExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  getExpenseById: vi.fn(),
  getExpensesByMonth: vi.fn(),
  aggregateByCategory: vi.fn(),
  aggregateByMonth: vi.fn(),
}))

vi.mock('../components/LockScreen', () => {
  const React = require('react')
  return {
    default: ({ onUnlock }) => {
      React.useEffect(() => { onUnlock() }, [onUnlock])
      return <div data-testid="mock-lock">Unlocking...</div>
    }
  }
})

describe('SMS Confirmation Flow — Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    expenseDb.getAllExpenses.mockResolvedValue([])
    expenseDb.addExpense.mockImplementation(async (data) => ({
      id: 'new-sms-1',
      ...data,
      syncStatus: 'local',
      embedding: null,
    }))
    expenseDb.aggregateByCategory.mockReturnValue({})
    expenseDb.aggregateByMonth.mockReturnValue([])
  })

  it('detects simulated SMS, shows confirmation modal, and saves expense', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Navigate to Settings
    fireEvent.click(screen.getByText('Settings'))

    await waitFor(() => {
      expect(screen.getByText('App configuration')).toBeInTheDocument()
    })

    // Click Simulate Incoming SMS
    const simulateBtn = screen.getByRole('button', { name: /Simulate Incoming SMS/i })
    await user.click(simulateBtn)

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText('📩 Confirm SMS Expense')).toBeInTheDocument()
    })

    // Form should have Amount prefilled (just check if amount input has value)
    const amountInput = screen.getByLabelText(/Amount/i)
    expect(amountInput).toHaveValue()
    expect(Number(amountInput.value)).toBeGreaterThan(0)
    
    // Category should be Other by default
    const categorySelect = screen.getByLabelText(/Category/i)
    expect(categorySelect).toHaveValue('Other')

    // Fill missing title
    const titleInput = screen.getByLabelText(/Title/i)
    await user.type(titleInput, 'Groceries from SMS')

    // Submit
    await user.click(screen.getByText('➕ Add Expense'))

    await waitFor(() => {
      expect(expenseDb.addExpense).toHaveBeenCalledTimes(1)
    })

    const payload = expenseDb.addExpense.mock.calls[0][0]
    expect(payload.title).toBe('Groceries from SMS')
    expect(payload.category).toBe('Other')
    expect(payload.source).toBe('sms')
    expect(payload.amount).toBeGreaterThan(0)
  })
})
