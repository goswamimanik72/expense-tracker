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

const mockExpenses = [
  {
    id: 'test-1',
    title: 'Lunch at Cafe',
    amount: 500,
    category: 'Food',
    description: 'Team lunch',
    date: new Date().toISOString(),
    source: 'manual',
    parentExpenseId: null,
    syncStatus: 'local',
    embedding: null,
  },
  {
    id: 'test-2',
    title: 'Uber Ride',
    amount: 250,
    category: 'Travel',
    description: '',
    date: new Date().toISOString(),
    source: 'manual',
    parentExpenseId: null,
    syncStatus: 'local',
    embedding: null,
  },
]

describe('Add Expense — Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    expenseDb.getAllExpenses.mockResolvedValue([])
    expenseDb.addExpense.mockImplementation(async (data) => ({
      id: 'new-1',
      ...data,
      syncStatus: 'local',
      embedding: null,
    }))
    expenseDb.aggregateByCategory.mockReturnValue({})
    expenseDb.aggregateByMonth.mockReturnValue([])
    // Suppress window.confirm
    window.confirm = vi.fn(() => true)
  })

  it('renders the app and shows dashboard by default', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('navigates to Expenses view', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Expenses'))
    expect(screen.getByText('No expenses yet. Tap + to add your first!')).toBeInTheDocument()
  })

  it('opens add expense modal via FAB and submits a new expense', async () => {
    // After adding, getAllExpenses returns the new expense
    expenseDb.getAllExpenses
      .mockResolvedValueOnce([]) // initial load
      .mockResolvedValueOnce([mockExpenses[0]]) // after add

    render(<App />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByLabelText('Add expense')).toBeInTheDocument()
    })

    // Click FAB
    await user.click(screen.getByLabelText('Add expense'))

    // Modal should open
    expect(screen.getByText('Add Expense')).toBeInTheDocument()

    // Fill the form
    await user.clear(screen.getByPlaceholderText('e.g. Lunch at cafe'))
    await user.type(screen.getByPlaceholderText('e.g. Lunch at cafe'), 'Lunch at Cafe')
    await user.clear(screen.getByPlaceholderText('0.00'))
    await user.type(screen.getByPlaceholderText('0.00'), '500')

    // Submit
    await user.click(screen.getByText('➕ Add Expense'))

    await waitFor(() => {
      expect(expenseDb.addExpense).toHaveBeenCalledTimes(1)
    })

    // Check the call payload
    const callArg = expenseDb.addExpense.mock.calls[0][0]
    expect(callArg.title).toBe('Lunch at Cafe')
    expect(callArg.amount).toBe(500)
    expect(callArg.category).toBe('Food')
  })

  it('shows validation errors when submitting empty form', async () => {
    render(<App />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByLabelText('Add expense')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('Add expense'))

    // Clear the default date and title (title is already empty)
    const amountInput = screen.getByPlaceholderText('0.00')
    await user.clear(amountInput)

    await user.click(screen.getByText('➕ Add Expense'))

    // Validation errors should appear
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Valid amount is required')).toBeInTheDocument()

    // DB should NOT be called
    expect(expenseDb.addExpense).not.toHaveBeenCalled()
  })
})

describe('Edit/Delete Expense — Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    expenseDb.getAllExpenses.mockResolvedValue(mockExpenses)
    expenseDb.updateExpense.mockResolvedValue({ ...mockExpenses[0], title: 'Updated' })
    expenseDb.deleteExpense.mockResolvedValue()
    expenseDb.aggregateByCategory.mockReturnValue({ Food: 500, Travel: 250 })
    expenseDb.aggregateByMonth.mockReturnValue([])
    window.confirm = vi.fn(() => true)
  })

  it('renders expense list with items', async () => {
    render(<App />)

    // Navigate to Expenses via nav
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Expenses'))

    await waitFor(() => {
      expect(screen.getByText('Lunch at Cafe')).toBeInTheDocument()
      expect(screen.getByText('Uber Ride')).toBeInTheDocument()
    })
  })

  it('opens edit modal when clicking an expense', async () => {
    render(<App />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Expenses'))

    await waitFor(() => {
      expect(screen.getByText('Lunch at Cafe')).toBeInTheDocument()
    })

    // Click on the expense item
    await user.click(screen.getByText('Lunch at Cafe'))

    // Modal should say "Edit Expense"
    expect(screen.getByText('Edit Expense')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Lunch at Cafe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('500')).toBeInTheDocument()
  })

  it('deletes an expense when delete button is clicked', async () => {
    expenseDb.getAllExpenses
      .mockResolvedValueOnce(mockExpenses) // initial
      .mockResolvedValueOnce([mockExpenses[1]]) // after delete

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Expenses'))

    await waitFor(() => {
      expect(screen.getByText('Lunch at Cafe')).toBeInTheDocument()
    })

    // Click delete button on first expense
    fireEvent.click(screen.getByLabelText('Delete Lunch at Cafe'))

    await waitFor(() => {
      expect(expenseDb.deleteExpense).toHaveBeenCalledWith('test-1')
    })
  })
})
