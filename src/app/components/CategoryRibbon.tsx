import type { Category } from '../../types'
import { useEffect, useRef } from 'react'
import { attachHorizontalWheelScroll } from '../../lib/horizontalWheelScroll'

const CATEGORIES: Category[] = ['All', 'Hot Meals', 'Bakery', 'Desserts', 'Vegan']

export function CategoryRibbon({
  value,
  onChange,
}: {
  value: Category
  onChange: (c: Category) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    return attachHorizontalWheelScroll(el)
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto overscroll-x-contain py-2 touch-pan-x [-webkit-overflow-scrolling:touch] items-center"
    >
      {CATEGORIES.map((c) => {
        const active = c === value
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`gp-focus shrink-0 whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition ${
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

