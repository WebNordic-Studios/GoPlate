const SIZES = {
  xs: 'h-9 w-9 min-h-9 min-w-9',
  sm: 'h-11 w-11 min-h-11 min-w-11',
  md: 'h-12 w-12 min-h-12 min-w-12 sm:h-14 sm:w-14 sm:min-h-14 sm:min-w-14',
  lg: 'h-16 w-16 min-h-16 min-w-16',
  xl: 'h-[5.5rem] w-[5.5rem] min-h-[5.5rem] min-w-[5.5rem] sm:h-[7.25rem] sm:w-[7.25rem] sm:min-h-[7.25rem] sm:min-w-[7.25rem]',
  '2xl': 'h-[7.5rem] w-[7.5rem] min-h-[7.5rem] min-w-[7.5rem] sm:h-[10.5rem] sm:w-[10.5rem] sm:min-h-[10.5rem] sm:min-w-[10.5rem]',
} as const

/** Resolves logo path for GitHub Pages (`/GoPlate/`) and local dev (`/`). */
export const GOPLATE_LOGO_SRC = `${import.meta.env.BASE_URL}goplate-logo.png`

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
      src={GOPLATE_LOGO_SRC}
      alt={decorative ? '' : alt}
      decoding="async"
      draggable={false}
      aria-hidden={decorative ? true : undefined}
      className={`block shrink-0 object-contain object-center ${SIZES[size]} ${className}`.trim()}
    />
  )
}
