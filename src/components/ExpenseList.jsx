import { getCategoryConfig } from '../constants/categories'

export default function ExpenseList({ expenses, onEdit, onDelete, onSplit, onBreakdown }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state" id="expense-empty-state">
        <div className="empty-state-icon">💸</div>
        <div className="empty-state-text">No expenses yet. Tap + to add your first!</div>
      </div>
    )
  }

  return (
    <div className="expense-list" id="expense-list">
      {expenses.map((expense, index) => {
        const cat = getCategoryConfig(expense.category)
        const d = new Date(expense.date)
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

        return (
          <div
            key={expense.id}
            className="expense-item animate-slide-in"
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => onEdit(expense)}
            id={`expense-item-${expense.id}`}
          >
            <div
              className="expense-icon"
              style={{ background: `${cat.color}22`, color: cat.color }}
            >
              {cat.icon}
            </div>
            <div className="expense-details">
              <div className="expense-title">{expense.title}</div>
              <div className="expense-meta">
                <span>{dateStr}</span>
                <span>·</span>
                <span className="category-badge" style={{ background: `${cat.color}22`, color: cat.color }}>
                  {cat.value}
                </span>
                {expense.source === 'sms' && <span style={{ color: 'var(--accent-info)' }}>📩 SMS</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
              <div className="expense-amount">₹{Number(expense.amount).toLocaleString('en-IN')}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                  onClick={(e) => { e.stopPropagation(); onSplit(expense); }}
                  aria-label="Split expense"
                  title="Split expense"
                >🤝 Split</button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                  onClick={(e) => { e.stopPropagation(); onBreakdown(expense); }}
                  aria-label="Breakdown expense"
                  title="Breakdown expense"
                >🗂️ Breakdown</button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ padding: '2px 4px', fontSize: '10px' }}
                  onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                  id={`expense-delete-${expense.id}`}
                  aria-label={`Delete ${expense.title}`}
                  title="Delete expense"
                >🗑</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
