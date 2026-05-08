/**
 * Category configuration — icon, color, and label for each expense category.
 */
export const CATEGORIES = [
  { value: 'Food', label: 'Food & Dining', icon: '🍔', color: '#ff6b6b' },
  { value: 'Travel', label: 'Travel', icon: '✈️', color: '#4ecdc4' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#a29bfe' },
  { value: 'Bills', label: 'Bills & Utilities', icon: '💡', color: '#ffd93d' },
  { value: 'Rent', label: 'Rent', icon: '🏠', color: '#fd79a8' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#00cec9' },
  { value: 'Health', label: 'Health', icon: '🏥', color: '#6c63ff' },
  { value: 'Education', label: 'Education', icon: '📚', color: '#e17055' },
  { value: 'Groceries', label: 'Groceries', icon: '🛒', color: '#00b894' },
  { value: 'Other', label: 'Other', icon: '📌', color: '#636e72' },
]

/**
 * Get category config by value.
 */
export function getCategoryConfig(categoryValue) {
  return CATEGORIES.find((c) => c.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1]
}

/**
 * Chart color palette.
 */
export const CHART_COLORS = CATEGORIES.map((c) => c.color)
