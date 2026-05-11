import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Report } from '../types'

const STORAGE_KEY = 'goplate.reports.v1'

function safeParse(json: string | null): Report[] {
  if (!json) return []
  try {
    const arr = JSON.parse(json) as Report[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>(() => safeParse(localStorage.getItem(STORAGE_KEY)))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  }, [reports])

  const file = useCallback((input: Omit<Report, 'id' | 'createdAtIso'>) => {
    const report: Report = { ...input, id: uid('report'), createdAtIso: new Date().toISOString() }
    setReports((prev) => [report, ...prev])
    return report.id
  }, [])

  const byTarget = useMemo(() => {
    const m = new Map<string, Report[]>()
    for (const r of reports) {
      const key = `${r.target.type}:${r.target.id}`
      const arr = m.get(key) ?? []
      arr.push(r)
      m.set(key, arr)
    }
    return m
  }, [reports])

  return { reports, byTarget, file }
}
