import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type Props = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  leftIcon?: ReactNode
  children?: ReactNode
}

export function Button({ variant = 'primary', className = '', leftIcon, children, ...rest }: Props) {
  const base =
    'gp-focus inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition'

  const styles =
    variant === 'primary'
      ? 'bg-gp-primary text-white shadow-natural hover:brightness-[0.98] active:brightness-[0.96]'
      : variant === 'secondary'
        ? 'bg-gp-secondary text-white shadow-natural hover:brightness-[1.02] active:brightness-[0.98]'
        : 'bg-transparent text-gp-charcoal hover:bg-black/5 active:bg-black/10'

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={`${base} ${styles} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
    </motion.button>
  )
}

