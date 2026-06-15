import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_STORAGE_KEY } from '../constants/authConstants'
import {
  clearStoredSession,
  loadStoredSession,
  persistSession,
} from './authSessionStorage'

describe('authSessionStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-06T18:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Guia: valida que stores remembered sessions in localStorage only.
  it('stores remembered sessions in localStorage only', () => {
    const session = persistSession(authData(), true)

    expect(session.token).toBe('jwt-token')
    expect(session.tokenType).toBe('Bearer')
    expect(session.createdAt).toBe('2026-06-06T18:00:00.000Z')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain('jwt-token')
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  // Guia: valida que stores temporary sessions in sessionStorage only.
  it('stores temporary sessions in sessionStorage only', () => {
    persistSession(authData(), false)

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toContain('jwt-token')
  })

  // Guia: valida que loads a stored session and cleans corrupt JSON.
  it('loads a stored session and cleans corrupt JSON', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData()))

    expect(loadStoredSession().token).toBe('jwt-token')

    localStorage.setItem(AUTH_STORAGE_KEY, '{bad-json')
    expect(loadStoredSession()).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  // Guia: valida que clears both storage locations.
  it('clears both storage locations', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'local')
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'session')

    clearStoredSession()

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})

function authData() {
  return {
    expiresAt: '2026-06-06T19:00:00Z',
    token: 'jwt-token',
    tokenType: 'Bearer',
    user: {
      email: 'cliente@smartlogix.com',
      roles: ['CLIENTE'],
    },
  }
}
