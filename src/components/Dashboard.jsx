import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { aggregateByCategory, aggregateByMonth } from '../db/expenseDb'
import { getCategoryConfig, CHART_COLORS } from '../constants/categories'

export default function Dashboard({ expenses }) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
  })

  const totalThisMonth = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalAll = expenses.reduce((s, e) => s + Number(e.amount), 0)

  // Pie chart data
  const categoryData = Object.entries(aggregateByCategory(monthExpenses)).map(([name, value]) => ({
    name,
    value,
    color: getCategoryConfig(name).color,
  }))

  // Bar chart data
  const monthlyData = aggregateByMonth(expenses)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonthName = monthNames[currentMonth - 1]

  return (
    <div className="animate-fade-in" id="dashboard-view">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your spending overview</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="value" style={{ color: 'var(--accent-danger)' }}>
            ₹{totalThisMonth.toLocaleString('en-IN')}
          </div>
          <div className="label">{currentMonthName} Spending</div>
        </div>
        <div className="summary-card">
          <div className="value" style={{ color: 'var(--accent-secondary)' }}>
            {monthExpenses.length}
          </div>
          <div className="label">{currentMonthName} Transactions</div>
        </div>
        <div className="summary-card">
          <div className="value" style={{ color: 'var(--accent-primary)' }}>
            ₹{totalAll.toLocaleString('en-IN')}
          </div>
          <div className="label">Total Spent</div>
        </div>
        <div className="summary-card">
          <div className="value" style={{ color: 'var(--accent-info)' }}>
            {expenses.length}
          </div>
          <div className="label">All Transactions</div>
        </div>
      </div>

      {/* Pie Chart — Category Breakdown */}
      {categoryData.length > 0 ? (
        <div className="chart-card" id="chart-category-pie">
          <div className="chart-title">📊 {currentMonthName} — By Category</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={3}
                strokeWidth={0}
              >
                {categoryData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a1a2e',
                  border: '1px solid rgba(108,99,255,0.2)',
                  borderRadius: '8px',
                  color: '#e8e8e8',
                }}
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {categoryData.map((entry) => (
              <span
                key={entry.name}
                className="category-badge"
                style={{ background: `${entry.color}22`, color: entry.color }}
              >
                {getCategoryConfig(entry.name).icon} {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="chart-card">
          <div className="chart-title">📊 {currentMonthName} — By Category</div>
          <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
            <div className="empty-state-icon">📉</div>
            <div className="empty-state-text">No expenses this month</div>
          </div>
        </div>
      )}

      {/* Bar Chart — Monthly Trend */}
      {monthlyData.length > 0 && (
        <div className="chart-card" id="chart-monthly-bar">
          <div className="chart-title">📈 Monthly Trend</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#a0a0b8', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(108,99,255,0.2)' }}
              />
              <YAxis
                tick={{ fill: '#a0a0b8', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(108,99,255,0.2)' }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a2e',
                  border: '1px solid rgba(108,99,255,0.2)',
                  borderRadius: '8px',
                  color: '#e8e8e8',
                }}
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
