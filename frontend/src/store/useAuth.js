import { create } from 'zustand'
import { api } from '../components/api'

const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  async init() {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user || null, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    set({ user: data.user })
  },
  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    set({ user: data.user })
  },
  async logout() {
    await api.post('/auth/logout')
    set({ user: null })
  }
}))

export default useAuth
