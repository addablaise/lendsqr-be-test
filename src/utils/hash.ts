import crypto from 'crypto'

export function hashPayload(payload: Record<string, any>): string {
  const str = JSON.stringify(payload)
  return crypto.createHash('sha256').update(str).digest('hex')
}
