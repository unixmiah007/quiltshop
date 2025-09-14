import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../store/useAuth'

export default function Login() {
  const { login, init, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(()=>{ init() },[])
  useEffect(()=>{ if (user) nav('/') },[user])

  async function submit(e){
    e.preventDefault()
    setError('')
    try { await login(email, password); }
    catch(e){ setError(e.response?.data?.error || 'Login failed') }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 rounded-lg w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 rounded-lg w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700">Login</button>
      </form>
      <p className="text-sm text-gray-600 mt-3">No account? <Link to="/register" className="text-indigo-600">Register</Link></p>
    </div>
  )
}
