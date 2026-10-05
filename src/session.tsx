import { createContext, useContext } from 'react'

export interface Member { email: string; firstName: string; lastName: string; admin: boolean }

/** Who is signed in, from the login cookie (checked by the server). */
export async function loadMember(): Promise<Member | null> {
  try {
    const res = await fetch('/api/me', { credentials: 'same-origin' })
    if (res.ok) return await res.json()
    if (res.status === 401) return null
  } catch { /* no API available */ }
  // Local `npm run dev` has no login server, so use a test member there only.
  if (import.meta.env.DEV) return { email: 'test@example.com', firstName: 'Test', lastName: 'Member', admin: true }
  return null
}

export const MemberCtx = createContext<Member | null>(null)
export const useMember = () => useContext(MemberCtx)!
