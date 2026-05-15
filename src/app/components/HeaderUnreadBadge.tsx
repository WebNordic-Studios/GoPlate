export function HeaderUnreadBadge({ count }: { count: number }) {
  if (count < 1) return null
  const label = count > 9 ? '9+' : String(count)
  return (
    <span
      className="pointer-events-none absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gp-primary px-[5px] text-[10px] font-bold leading-none text-white ring-2 ring-gp-bg shadow-sm dark:ring-gp-bg"
      aria-hidden
    >
      {label}
    </span>
  )
}
