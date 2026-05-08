import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as expenseDb from '../db/expenseDb'
import * as splitBreakdownDb from '../db/splitBreakdownDb'

// Mock the DB modules
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

vi.mock('../db/splitBreakdownDb', () => ({
  addSplit: vi.fn(),
  getSplitByExpenseId: vi.fn(),
  addBreakdown: vi.fn(),
  getBreakdownByExpenseId: vi.fn(),
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

const mockExpense = {
  id: 'exp-1',
  title: 'Group Dinner',
  amount: 2000,
  category: 'Food',
  date: new Date().toISOString(),
}

describe('Split and Breakdown Flows — Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    expenseDb.getAllExpenses.mockResolvedValue([mockExpense])
    expenseDb.aggregateByCategory.mockReturnValue({})
    expenseDb.aggregateByMonth.mockReturnValue([])
    
    splitBreakdownDb.getSplitByExpenseId.mockResolvedValue(null)
    splitBreakdownDb.getBreakdownByExpenseId.mockResolvedValue(null)
  })

  it('opens split modal, calculates shares, and saves split', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for Dashboard, go to Expenses
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Expenses'))

    await waitFor(() => {
      expect(screen.getByText('Group Dinner')).toBeInTheDocument()
    })

    // Click on the split button
    const splitBtn = screen.getByTitle('Split expense')
    await user.click(splitBtn)

    // Split Modal opens
    await waitFor(() => {
      expect(screen.getByText('🤝 Split Expense')).toBeInTheDocument()
    })

    // Fill user emails
    const friendInput = screen.getByPlaceholderText('friend@email.com')
    await user.type(friendInput, 'bob@email.com')

    // Equal split should show 1000 each
    const amounts = screen.getAllByText(/1000/)
    expect(amounts.length).toBeGreaterThan(0)

    // Save
    await user.click(screen.getByText('💾 Save Split'))

    await waitFor(() => {
      expect(splitBreakdownDb.addSplit).toHaveBeenCalledTimes(1)
    })

    const payload = splitBreakdownDb.addSplit.mock.calls[0][0]
    expect(payload.splitType).toBe('equal')
    expect(payload.userB).toBe('bob@email.com')
  })

  it('opens breakdown modal, adds items, validates and saves', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Go to Expenses
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Expenses'))
    await waitFor(() => {
      expect(screen.getByText('Group Dinner')).toBeInTheDocument()
    })

    // Click on breakdown button
    const breakdownBtn = screen.getByTitle('Breakdown expense')
    await user.click(breakdownBtn)

    // Breakdown Modal opens
    await waitFor(() => {
      expect(screen.getByText('🗂️ Expense Breakdown')).toBeInTheDocument()
    })

    // Click Add Sub-item
    await user.click(screen.getByText('+ Add Sub-item'))

    // Now we have 2 items. Fill them out to sum to 2000.
    const titleInputs = screen.getAllByPlaceholderText('Item Title')
    const amountInputs = screen.getAllByPlaceholderText('₹ Amount')

    await user.type(titleInputs[0], 'Drinks')
    await user.type(amountInputs[0], '500')

    await user.type(titleInputs[1], 'Food')
    await user.type(amountInputs[1], '1500')

    // Save
    await user.click(screen.getByText('💾 Save Breakdown'))

    await waitFor(() => {
      expect(splitBreakdownDb.addBreakdown).toHaveBeenCalledTimes(1)
    })

    const payload = splitBreakdownDb.addBreakdown.mock.calls[0][0]
    expect(payload.items).toHaveLength(2)
    expect(payload.items[0].amount).toBe(500)
    expect(payload.items[1].amount).toBe(1500)
  })
})
