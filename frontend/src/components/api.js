// frontend/src/components/api.js
import axios from 'axios'
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,     // ← must be true
  headers: { 'Content-Type':'application/json' },
})

