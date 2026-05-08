import { useState } from 'react'
import { CATEGORIES } from '../constants/categories'

const initialFormState = {
  title: '',
  amount: '',
  category: 'Food',
  description: '',
  date: new Date().toISOString().split('T')[0],
}

export default function ExpenseForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState(initialData ? {
    title: initialData.title || '',
    amount: String(initialData.amount || ''),
    category: initialData.category || 'Food',
    description: initialData.description || '',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  } : { ...initialFormState })

  const [errors, setErrors] = useState({})

  function validate() {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Valid amount is required'
    if (!form.category) newErrors.category = 'Category is required'
    if (!form.date) newErrors.date = 'Date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...form,
      amount: Number(form.amount),
      source: initialData?.source || 'manual',
      parentExpenseId: initialData?.parentExpenseId || null,
      ...(initialData?.id && { id: initialData.id }),
    })
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} id="expense-form">
      <div className="form-group">
        <label className="form-label" htmlFor="expense-title">Title</label>
        <input
          id="expense-title"
          className={`form-input ${errors.title ? 'error' : ''}`}
          type="text"
          placeholder="e.g. Lunch at cafe"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-amount">Amount (₹)</label>
        <input
          id="expense-amount"
          className={`form-input ${errors.amount ? 'error' : ''}`}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
        />
        {errors.amount && <span className="form-error">{errors.amount}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-category">Category</label>
        <select
          id="expense-category"
          className="form-select"
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-date">Date</label>
        <input
          id="expense-date"
          className={`form-input ${errors.date ? 'error' : ''}`}
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
        {errors.date && <span className="form-error">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-description">Description (optional)</label>
        <input
          id="expense-description"
          className="form-input"
          type="text"
          placeholder="Notes about this expense"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
        <button type="submit" className="btn btn-primary btn-full" id="expense-submit-btn">
          {initialData?.id ? '✏️ Update Expense' : '➕ Add Expense'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} id="expense-cancel-btn">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
