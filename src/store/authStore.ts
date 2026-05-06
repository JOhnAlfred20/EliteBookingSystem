import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '../types'

interface AuthState {
  token: string | null
  user: { id: number; fullName: string; role: string } | null
  login: (data: AuthResponse) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (data) => {
        localStorage.setItem('token', data.token)
        set({ token: data.token, user: { id: data.userId, fullName: data.fullName, role: data.role } })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
      isAdmin: () => get().user?.role === 'Admin',
    }),
    { name: 'auth-storage' }
  )
)
