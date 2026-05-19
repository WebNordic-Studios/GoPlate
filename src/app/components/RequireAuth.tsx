import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { User } from '../../types'

export function RequireAuth({
  user,
  from,
  children,
}: {
  user: User | null
  from: string
  children: ReactNode
}) {
  if (!user) return <Navigate to="/login" replace state={{ from }} />
  return children
}
