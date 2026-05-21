import { useCallback, useEffect, useState } from 'react'
import type { SavedAddress, SavedPaymentMethod, User } from '../types'

const AUTH_KEY = 'goplate.auth.v1'
const ACCOUNTS_KEY = 'goplate.accounts.v1'

type StoredAccount = {
  email: string
  password: string
  user: User
}

function safeParseUser(json: string | null): User | null {
  if (!json) return null
  try {
    return JSON.parse(json) as User
  } catch {
    return null
  }
}

function safeParseAccounts(json: string | null): StoredAccount[] {
  if (!json) return []
  try {
    const arr = JSON.parse(json) as StoredAccount[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80'

function persistAccounts(list: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list))
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => safeParseUser(localStorage.getItem(AUTH_KEY)))

  useEffect(() => {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_KEY)
  }, [user])

  // Keep the stored account row in sync with edits to the active user.
  useEffect(() => {
    if (!user) return
    const accounts = safeParseAccounts(localStorage.getItem(ACCOUNTS_KEY))
    const idx = accounts.findIndex((a) => a.user.id === user.id)
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], user }
      persistAccounts(accounts)
    }
  }, [user])

  const login = useCallback((email: string, password: string) => {
    if (!email.trim() || !password.trim()) return false
    const accounts = safeParseAccounts(localStorage.getItem(ACCOUNTS_KEY))
    const found = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    )
    if (found) {
      setUser(found.user)
      return true
    }
    // Prototype fallback: accept any non-empty credentials and seed an account.
    const displayName = email.split('@')[0]?.slice(0, 24) || 'User'
    const created: User = {
      id: `user_${displayName.toLowerCase()}_${Math.random().toString(16).slice(2, 6)}`,
      email: email.trim(),
      displayName,
      avatarUrl: DEFAULT_AVATAR,
      bio: '',
      neighborhood: '',
      phoneVerified: false,
      savedAddresses: [],
      savedPaymentMethods: [],
      cookVerification: 'none',
      blockedCookIds: [],
    }
    persistAccounts([...accounts, { email: created.email, password, user: created }])
    setUser(created)
    return true
  }, [])

  const signUp = useCallback(
    (input: {
      email: string
      password: string
      displayName: string
      ageConfirmed?: boolean
      termsAccepted?: boolean
    }): { ok: boolean; error?: string } => {
      const email = input.email.trim().toLowerCase()
      const password = input.password
      const displayName = input.displayName.trim() || email.split('@')[0] || 'User'
      if (!email || !email.includes('@')) return { ok: false, error: 'Enter a valid email.' }
      if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
      if (!input.ageConfirmed) return { ok: false, error: 'You must confirm you are at least 18.' }
      if (!input.termsAccepted) return { ok: false, error: 'Please accept the terms and liability notice.' }
      const accounts = safeParseAccounts(localStorage.getItem(ACCOUNTS_KEY))
      if (accounts.some((a) => a.email.toLowerCase() === email)) {
        return { ok: false, error: 'An account with that email already exists.' }
      }
      const created: User = {
        id: `user_${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Math.random()
          .toString(16)
          .slice(2, 6)}`,
        email,
        displayName,
        avatarUrl: DEFAULT_AVATAR,
        bio: '',
        neighborhood: '',
        phoneVerified: false,
        savedAddresses: [],
        savedPaymentMethods: [],
        cookVerification: 'none',
        blockedCookIds: [],
        termsAcceptedAtIso: new Date().toISOString(),
        emailVerified: false,
      }
      persistAccounts([...accounts, { email, password, user: created }])
      setUser(created)
      return { ok: true }
    },
    [],
  )

  const resetPassword = useCallback((email: string, newPassword: string): { ok: boolean; error?: string } => {
    if (!email.includes('@')) return { ok: false, error: 'Enter a valid email.' }
    if (newPassword.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
    const accounts = safeParseAccounts(localStorage.getItem(ACCOUNTS_KEY))
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === email.trim().toLowerCase())
    if (idx < 0) {
      return { ok: false, error: 'No account found for that email.' }
    }
    accounts[idx] = { ...accounts[idx], password: newPassword }
    persistAccounts(accounts)
    return { ok: true }
  }, [])

  const socialLogin = useCallback((provider: 'google' | 'apple') => {
    const stub = provider === 'google' ? 'google-user@gmail.com' : 'apple-user@icloud.com'
    return login(stub, 'social-mock-password')
  }, [login])

  const logout = useCallback(() => setUser(null), [])

  const updateProfile = useCallback(
    (input: Partial<Pick<User, 'displayName' | 'avatarUrl' | 'bio' | 'neighborhood' | 'phone'>>) => {
      setUser((prev) => (prev ? { ...prev, ...input } : prev))
    },
    [],
  )

  const verifyPhone = useCallback((phone: string) => {
    setUser((prev) => (prev ? { ...prev, phone: phone.trim(), phoneVerified: true } : prev))
  }, [])

  const addAddress = useCallback((address: Omit<SavedAddress, 'id'>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next: SavedAddress = { ...address, id: uid('addr') }
      return { ...prev, savedAddresses: [...(prev.savedAddresses ?? []), next] }
    })
  }, [])

  const removeAddress = useCallback((id: string) => {
    setUser((prev) =>
      prev
        ? { ...prev, savedAddresses: (prev.savedAddresses ?? []).filter((a) => a.id !== id) }
        : prev,
    )
  }, [])

  const addPaymentMethod = useCallback((method: Omit<SavedPaymentMethod, 'id'>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next: SavedPaymentMethod = { ...method, id: uid('card') }
      return { ...prev, savedPaymentMethods: [...(prev.savedPaymentMethods ?? []), next] }
    })
  }, [])

  const removePaymentMethod = useCallback((id: string) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            savedPaymentMethods: (prev.savedPaymentMethods ?? []).filter((m) => m.id !== id),
          }
        : prev,
    )
  }, [])

  const setCookVerification = useCallback((state: User['cookVerification']) => {
    setUser((prev) => (prev ? { ...prev, cookVerification: state } : prev))
  }, [])

  const markEmailVerified = useCallback(() => {
    setUser((prev) => (prev ? { ...prev, emailVerified: true } : prev))
  }, [])

  const blockCook = useCallback((cookId: string) => {
    setUser((prev) => {
      if (!prev) return prev
      const set = new Set(prev.blockedCookIds ?? [])
      set.add(cookId)
      return { ...prev, blockedCookIds: Array.from(set) }
    })
  }, [])

  const unblockCook = useCallback((cookId: string) => {
    setUser((prev) =>
      prev
        ? { ...prev, blockedCookIds: (prev.blockedCookIds ?? []).filter((id) => id !== cookId) }
        : prev,
    )
  }, [])

  return {
    user,
    login,
    signUp,
    resetPassword,
    socialLogin,
    logout,
    updateProfile,
    verifyPhone,
    addAddress,
    removeAddress,
    addPaymentMethod,
    removePaymentMethod,
    setCookVerification,
    markEmailVerified,
    blockCook,
    unblockCook,
  }
}
