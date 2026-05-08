import type { Category } from '../../types'

const CATEGORIES: Category[] = ['All', 'Hot Meals', 'Bakery', 'Desserts', 'Vegan']

export function CategoryRibbon({
  value,
  onChange,
}: {
  value: Category
  onChange: (c: Category) => void
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:px-0">
      {CATEGORIES.map((c) => {
        const active = c === value
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`gp-focus whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              active ? 'bg-gp-secondary text-white shadow-natural' : 'bg-white/70 text-gp-charcoal/70 hover:bg-black/5'
            }`}
          >
            {c}
          </button>
        )
      })}
    </div>
  )
}

