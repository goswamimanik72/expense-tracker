import { useState, useEffect } from 'react'
import { calculateSplit, buildSplitRecord } from '../utils/splitCalculator'

export default function SplitForm({ expense, existingSplit, onSave, onCancel }) {
  const [splitType, setSplitType] = useState(existingSplit ? existingSplit.splitType : 'equal')
  const [userAEmail, setUserAEmail] = useState(existingSplit ? existingSplit.userA : 'me@email.com')
  const [userBEmail, setUserBEmail] = useState(existingSplit ? existingSplit.userB : '')
  const [customUserA, setCustomUserA] = useState(existingSplit?.shares?.userA || '')
  const [customUserB, setCustomUserB] = useState(existingSplit?.shares?.userB || '')
  const [error, setError] = useState('')
  const [calculatedShares, setCalculatedShares] = useState(null)

  useEffect(() => {
    try {
      if (splitType === 'equal') {
        setCalculatedShares(calculateSplit(expense.amount, 'equal'))
        setError('')
      } else {
        if (customUserA !== '' && customUserB !== '') {
          setCalculatedShares(calculateSplit(expense.amount, 'custom', { userA: Number(customUserA), userB: Number(customUserB) }))
          setError('')
        } else {
          setCalculatedShares(null)
          setError('Please enter both custom amounts.')
        }
      }
    } catch (err) {
      setCalculatedShares(null)
      setError(err.message)
    }
  }, [splitType, customUserA, customUserB, expense.amount])

  function handleSubmit() {
    if (!userAEmail || !userBEmail) {
      setError('Please provide emails for both users.')
      return
    }
    if (error || !calculatedShares) return
    
    const record = buildSplitRecord(
      expense.id,
      userAEmail,
      userBEmail,
      expense.amount,
      splitType,
      { userA: customUserA, userB: customUserB }
    )
    onSave(record)
  }

  return (
    <div className="split-form">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <strong>Expense Title:</strong> {expense.title} <br/>
        <strong>Total Amount:</strong> ₹{expense.amount.toLocaleString('en-IN')}
      </div>

      <div className="form-group">
        <label className="form-label">User A (You)</label>
        <input className="form-input" type="email" value={userAEmail} onChange={e => setUserAEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">User B (Friend)</label>
        <input className="form-input" type="email" placeholder="friend@email.com" value={userBEmail} onChange={e => setUserBEmail(e.target.value)} />
      </div>

      <div className="form-group" style={{ flexDirection: 'row', gap: 'var(--space-md)' }}>
        <label>
          <input type="radio" value="equal" checked={splitType === 'equal'} onChange={() => setSplitType('equal')} /> Equal
        </label>
        <label>
          <input type="radio" value="custom" checked={splitType === 'custom'} onChange={() => setSplitType('custom')} /> Custom
        </label>
      </div>

      {splitType === 'custom' && (
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <input type="number" className="form-input" placeholder="User A ₹" value={customUserA} onChange={e => setCustomUserA(e.target.value)} />
          <input type="number" className="form-input" placeholder="User B ₹" value={customUserB} onChange={e => setCustomUserB(e.target.value)} />
        </div>
      )}

      {calculatedShares && !error && (
        <div style={{ padding: 'var(--space-sm)', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
          <p><strong>{userAEmail || 'User A'} pays:</strong> ₹{calculatedShares.userA}</p>
          <p><strong>{userBEmail || 'User B'} pays:</strong> ₹{calculatedShares.userB}</p>
        </div>
      )}

      {error && <p className="form-error" style={{ color: 'var(--accent-danger)' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!!error}>
          💾 Save Split
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
