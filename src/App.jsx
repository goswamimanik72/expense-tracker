import { useState, useEffect, useCallback } from 'react'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'
import SplitForm from './components/SplitForm'
import BreakdownForm from './components/BreakdownForm'
import Modal from './components/Modal'
import LockScreen from './components/LockScreen'
import { getAllExpenses, addExpense, updateExpense, deleteExpense } from './db/expenseDb'
import { addSplit, getSplitByExpenseId, addBreakdown, getBreakdownByExpenseId } from './db/splitBreakdownDb'
import { parseSMS } from './utils/smsParser'
import { processSyncQueue } from './utils/syncManager'

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [pendingSmsExpense, setPendingSmsExpense] = useState(null)
  const [splittingExpense, setSplittingExpense] = useState(null)
  const [activeSplitData, setActiveSplitData] = useState(null)
  const [breakingDownExpense, setBreakingDownExpense] = useState(null)
  const [activeBreakdownData, setActiveBreakdownData] = useState(null)
  const [toast, setToast] = useState(null)

  // Load expenses from IndexedDB
  const loadExpenses = useCallback(async () => {
    try {
      const data = await getAllExpenses()
      setExpenses(data)
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  // Show toast notification
  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  // Add expense
  async function handleAddExpense(data) {
    try {
      await addExpense(data)
      await loadExpenses()
      setModalOpen(false)
      setPendingSmsExpense(null)
      showToast('Expense added successfully! ✅')
    } catch (err) {
      console.error('Failed to add expense:', err)
      showToast('Failed to add expense ❌', 'error')
    }
  }

  // Update expense
  async function handleUpdateExpense(data) {
    try {
      await updateExpense(data)
      await loadExpenses()
      setModalOpen(false)
      setEditingExpense(null)
      showToast('Expense updated! ✏️')
    } catch (err) {
      console.error('Failed to update expense:', err)
      showToast('Failed to update expense ❌', 'error')
    }
  }

  // Delete expense
  async function handleDeleteExpense(id) {
    if (!window.confirm('Delete this expense?')) return
    try {
      await deleteExpense(id)
      await loadExpenses()
      showToast('Expense deleted 🗑️')
    } catch (err) {
      console.error('Failed to delete expense:', err)
      showToast('Failed to delete ❌', 'error')
    }
  }

  // Edit expense
  function handleEdit(expense) {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  // Open add modal
  function handleOpenAdd() {
    setEditingExpense(null)
    setModalOpen(true)
  }

  // Close modal
  function handleCloseModal() {
    setModalOpen(false)
    setEditingExpense(null)
    setPendingSmsExpense(null)
    setSplittingExpense(null)
    setBreakingDownExpense(null)
  }

  // Open split modal
  async function handleSplit(expense) {
    const existing = await getSplitByExpenseId(expense.id)
    setActiveSplitData(existing)
    setSplittingExpense(expense)
  }

  // Save split
  async function handleSaveSplit(record) {
    try {
      await addSplit(record)
      handleCloseModal()
      showToast('Split saved! 🤝')
    } catch (err) {
      console.error(err)
      showToast('Failed to save split ❌', 'error')
    }
  }

  // Open breakdown modal
  async function handleBreakdown(expense) {
    const existing = await getBreakdownByExpenseId(expense.id)
    setActiveBreakdownData(existing)
    setBreakingDownExpense(expense)
  }

  // Save breakdown
  async function handleSaveBreakdown(record) {
    try {
      await addBreakdown(record)
      handleCloseModal()
      showToast('Breakdown saved! 🗂️')
    } catch (err) {
      console.error(err)
      showToast('Failed to save breakdown ❌', 'error')
    }
  }

  // Simulate incoming SMS
  function handleSimulateSms() {
    const mockSms = `Rs. ${Math.floor(Math.random() * 2000) + 100} debited via UPI on ${new Date().toISOString()}`
    const parsed = parseSMS(mockSms)
    
    // Only proceed if it's a debit and has amount
    if (parsed.amount) {
      setPendingSmsExpense({
        title: '',
        amount: parsed.amount,
        category: 'Other',
        date: parsed.date,
        description: parsed.raw,
        source: 'sms',
      })
      showToast('SMS Detected 📩')
    }
  }

  // Simulate Running Sync
  async function handleRunSync() {
    showToast('Syncing...')
    try {
      const result = await processSyncQueue(true)
      if (result.success) {
        showToast(`Sync complete! ✅ Processed: ${result.processed}`)
      } else {
        showToast(`Sync finished with errors ⚠️ Pending: ${result.pending}`)
      }
    } catch (err) {
      showToast('Sync failed completely ❌', 'error')
    }
  }

  if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />
  }

  return (
    <div id="app-root">
      <main className="container page-content">
        {loading ? (
          <div className="empty-state" style={{ paddingTop: '40vh' }}>
            <div className="empty-state-icon" style={{ animation: 'pulse 1.5s infinite' }}>💰</div>
            <div className="empty-state-text">Loading...</div>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <Dashboard expenses={expenses} />
            )}

            {currentView === 'expenses' && (
              <div className="animate-fade-in" id="expenses-view">
                <div className="page-header">
                  <h1 className="page-title">Expenses</h1>
                  <p className="page-subtitle">
                    {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <ExpenseList
                  expenses={expenses}
                  onEdit={handleEdit}
                  onDelete={handleDeleteExpense}
                  onSplit={handleSplit}
                  onBreakdown={handleBreakdown}
                />
              </div>
            )}

            {currentView === 'settings' && (
              <div className="animate-fade-in" id="settings-view">
                <div className="page-header">
                  <h1 className="page-title">Settings</h1>
                  <p className="page-subtitle">App configuration</p>
                </div>
                <div className="card" style={{ marginTop: 'var(--space-md)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>🔐 Password Protection</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    App is secured with a PIN lock.
                  </p>
                </div>
                <div className="card" style={{ marginTop: 'var(--space-md)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>📩 SMS Detection</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)' }}>
                    Auto-detect expenses from bank SMS (requires Capacitor wrapper)
                  </p>
                  <button className="btn btn-ghost btn-sm" onClick={handleSimulateSms} id="simulate-sms-btn">
                    🧪 Simulate Incoming SMS
                  </button>
                </div>
                <div className="card" style={{ marginTop: 'var(--space-md)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>🔄 Sync Queue Manager</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)' }}>
                    Pushes offline changes to the backend when online.
                  </p>
                  <button className="btn btn-ghost btn-sm" onClick={handleRunSync}>
                    🔄 Run Background Sync
                  </button>
                </div>
                <div className="card" style={{ marginTop: 'var(--space-md)' }}>
                  <h3 style={{ marginBottom: 'var(--space-md)' }}>ℹ️ About</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Expense Tracker v1.0 • Offline-first PWA
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                    Data stored locally in IndexedDB
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB — Add Expense */}
      {!loading && (
        <button className="fab" onClick={handleOpenAdd} id="fab-add-expense" aria-label="Add expense">
          +
        </button>
      )}

      {/* Bottom Nav */}
      <NavBar currentView={currentView} onNavigate={setCurrentView} />

      {/* Modal — Add / Edit Expense */}
      <Modal
        isOpen={modalOpen && !pendingSmsExpense && !splittingExpense && !breakingDownExpense}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        onClose={handleCloseModal}
      >
        <ExpenseForm
          key={editingExpense?.id || 'new'}
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          initialData={editingExpense}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal — SMS Confirmation */}
      <Modal
        isOpen={!!pendingSmsExpense}
        title="📩 Confirm SMS Expense"
        onClose={handleCloseModal}
      >
        <ExpenseForm
          key={pendingSmsExpense?.description || 'sms'}
          onSubmit={handleAddExpense}
          initialData={pendingSmsExpense}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Modal — Split Expense */}
      <Modal
        isOpen={!!splittingExpense}
        title="🤝 Split Expense"
        onClose={handleCloseModal}
      >
        {splittingExpense && (
          <SplitForm
            expense={splittingExpense}
            existingSplit={activeSplitData}
            onSave={handleSaveSplit}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>

      {/* Modal — Breakdown Expense */}
      <Modal
        isOpen={!!breakingDownExpense}
        title="🗂️ Expense Breakdown"
        onClose={handleCloseModal}
      >
        {breakingDownExpense && (
          <BreakdownForm
            expense={breakingDownExpense}
            existingBreakdown={activeBreakdownData}
            onSave={handleSaveBreakdown}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div
          className="toast"
          id="toast-notification"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-secondary)',
            color: toast.type === 'error' ? 'white' : 'var(--text-inverse)',
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            zIndex: 999,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 200ms ease',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
