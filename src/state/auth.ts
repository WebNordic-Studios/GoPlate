import { useEffect, useState } from 'react'
import type { User } from '../types'

const AUTH_KEY = 'goplate.auth.v1'

function safeParse(json: string | null): User | null {
  if (!json) return null
  try {
    return JSON.parse(json) as User
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => safeParse(localStorage.getItem(AUTH_KEY)))

  useEffect(() => {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_KEY)
  }, [user])

  function login(email: string, password: string) {
    // Prototype auth: accept any non-empty credentials.
    if (!email.trim() || !password.trim()) return false
    const displayName = email.split('@')[0]?.slice(0, 24) || 'User'
    setUser({
      id: `user_${displayName.toLowerCase()}`,
      email,
      displayName,
      avatarUrl:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80',
    })
    return true
  }

  function logout() {
    setUser(null)
  }

  function updateProfile(input: Partial<Pick<User, 'displayName' | 'avatarUrl'>>) {
    setUser((prev) => {
      if (!prev) return prev
      return { ...prev, ...input }
    })
  }

  return { user, login, logout, updateProfile }
}

