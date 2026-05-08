import { useState, useEffect } from 'react'
import { CATEGORIES } from '../constants/categories'
import { validateBreakdown, buildBreakdownRecord } from '../utils/breakdownValidator'

export default function BreakdownForm({ expense, existingBreakdown, onSave, onCancel }) {
  const [items, setItems] = useState(
    existingBreakdown ? existingBreakdown.items : [{ title: '', amount: '', category: 'Food' }]
  )
  const [validationResult, setValidationResult] = useState({ valid: false, diff: expense.amount, message: '' })

  useEffect(() => {
    setValidationResult(validateBreakdown(expense.amount, items))
  }, [items, expense.amount])

  function handleItemChange(index, field, value) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  function handleAddItem() {
    setItems([...items, { title: '', amount: '', category: 'Other' }])
  }

  function handleRemoveItem(index) {
    if (items.length <= 1) return
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  function handleSubmit() {
    if (!validationResult.valid) return
    const record = buildBreakdownRecord(expense.id, items)
    onSave(record)
  }

  return (
    <div className="breakdown-form">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <strong>Parent Expense:</strong> {expense.title} (₹{expense.amount.toLocaleString('en-IN')})
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
        {items.map((item, index) => (
          <div key={index} className="form-group" style={{ background: 'var(--bg-input)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
            {items.length > 1 && (
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ position: 'absolute', top: 4, right: 4 }} 
                onClick={() => handleRemoveItem(index)}
              >✕</button>
            )}
            
            <input 
              type="text" 
              className="form-input" 
              placeholder="Item Title" 
              value={item.title} 
              onChange={e => handleItemChange(index, 'title', e.target.value)} 
              style={{ padding: '4px', marginBottom: '4px', fontSize: '14px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                className="form-input" 
                placeholder="₹ Amount" 
                value={item.amount} 
                onChange={e => handleItemChange(index, 'amount', e.target.value)}
                style={{ padding: '4px', flex: 1, fontSize: '14px' }}
              />
              <select 
                className="form-select" 
                value={item.category} 
                onChange={e => handleItemChange(index, 'category', e.target.value)}
                style={{ padding: '4px', flex: 1, fontSize: '14px' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost btn-sm btn-full" onClick={handleAddItem} style={{ marginTop: 'var(--space-sm)' }}>
        + Add Sub-item
      </button>

      <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', background: validationResult.valid ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)' }}>
        <p style={{ color: validationResult.valid ? 'var(--accent-secondary)' : 'var(--accent-danger)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
          {validationResult.message}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!validationResult.valid}>
          💾 Save Breakdown
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
