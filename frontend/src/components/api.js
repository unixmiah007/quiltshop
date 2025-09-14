// frontend/src/components/api.js
import axios from 'axios'
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true, // if you use cookies for auth
})

