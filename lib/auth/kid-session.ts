import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

const KID_SESSION_COOKIE = 'kid-session'
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour

export interface KidSession {
  kidId: string
  sessionId: string
  createdAt: number
}

/**
 * Create a kid session after PIN verification
 */
export async function createKidSession(kidId: string): Promise<string> {
  const sessionId = nanoid()
  const session: KidSession = {
    kidId,
    sessionId,
    createdAt: Date.now(),
  }

  const cookieStore = await cookies()
  cookieStore.set(KID_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
  })

  return sessionId
}

/**
 * Get the current kid session
 */
export async function getKidSession(): Promise<KidSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(KID_SESSION_COOKIE)

  if (!sessionCookie) {
    return null
  }

  try {
    const session: KidSession = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (Date.now() - session.createdAt > SESSION_DURATION) {
      await clearKidSession()
      return null
    }

    return session
  } catch (error) {
    await clearKidSession()
    return null
  }
}

/**
 * Clear the kid session
 */
export async function clearKidSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(KID_SESSION_COOKIE)
}

/**
 * Verify kid PIN (you'll need to implement the actual hashing)
 */
export async function verifyKidPin(storedHash: string, inputPin: string): Promise<boolean> {
  // TODO: Implement proper PIN hashing (e.g., bcrypt)
  // For now, simple comparison (NOT SECURE - replace in production)
  return storedHash === inputPin
}

/**
 * Hash a PIN for storage (placeholder)
 */
export function hashPin(pin: string): string {
  // TODO: Implement proper PIN hashing (e.g., bcrypt)
  // For now, just return the pin (NOT SECURE - replace in production)
  return pin
}
