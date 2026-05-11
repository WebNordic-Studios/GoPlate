import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Message } from '../types'

const STORAGE_KEY = 'goplate.messages.v1'

function safeParse(json: string | null): Message[] {
  if (!json) return []
  try {
    const arr = JSON.parse(json) as Message[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>(() =>
    safeParse(localStorage.getItem(STORAGE_KEY)),
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const sendMessage = useCallback((orderId: string, from: Message['from'], body: string) => {
    const m: Message = {
      id: uid('msg'),
      orderId,
      from,
      body: body.trim(),
      createdAtIso: new Date().toISOString(),
    }
    if (!m.body) return null
    setMessages((prev) => [...prev, m])
    return m.id
  }, [])

  const byOrderId = useMemo(() => {
    const m = new Map<string, Message[]>()
    for (const msg of messages) {
      const arr = m.get(msg.orderId) ?? []
      arr.push(msg)
      m.set(msg.orderId, arr)
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
    }
    return m
  }, [messages])

  return { messages, byOrderId, sendMessage }
}
