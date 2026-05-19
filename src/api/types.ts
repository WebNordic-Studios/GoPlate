export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, opts?: { status?: number; code?: string }) {
    super(message)
    this.name = 'ApiError'
    this.status = opts?.status ?? 500
    this.code = opts?.code ?? 'unknown'
  }
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }

export async function simulateNetwork<T>(fn: () => T | Promise<T>, ms = 280): Promise<T> {
  await new Promise((r) => setTimeout(r, ms))
  return fn()
}
