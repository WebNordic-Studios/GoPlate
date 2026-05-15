const SIZES = {
  xs: 'h-11 w-11 min-h-11 min-w-11',
  sm: 'h-[3.25rem] w-[3.25rem] min-h-[3.25rem] min-w-[3.25rem]',
  md: 'h-16 w-16 min-h-16 min-w-16',
  lg: 'h-20 w-20 min-h-20 min-w-20',
  xl: 'h-[7.25rem] w-[7.25rem] min-h-[7.25rem] min-w-[7.25rem]',
  '2xl': 'h-[10.5rem] w-[10.5rem] min-h-[10.5rem] min-w-[10.5rem]',
} as const

type Size = keyof typeof SIZES

type Props = {
  className?: string
  size?: Size
  /** Pass a short label when the mark is meaningful on its own (e.g. favicon-style placement). */
  alt?: string
  /** When true, hides the image from assistive tech (use when the surrounding control is already labeled). */
  decorative?: boolean
}

export function GoPlateLogoMark({ className = '', size = 'md', alt = 'GoPlate', decorative }: Props) {
  return (
    <img
      src="/goplate-logo.png"
      alt={decorative ? '' : alt}
      decoding="async"
      draggable={false}
      aria-hidden={decorative ? true : undefined}
      className={`block shrink-0 object-contain object-center ${SIZES[size]} ${className}`.trim()}
    />
  )
}
