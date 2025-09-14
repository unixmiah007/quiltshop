import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../store/useAuth'

export default function Register() {
  const { register, init, user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(()=>{ init() },[])
  useEffect(()=>{ if (user) nav('/') },[user])

  async function submit(e){
    e.preventDefault()
    setError('')
    try { await register(name, email, password); }
    catch(e){ setError(e.response?.data?.error || 'Register failed') }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Create account</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 rounded-lg w-full" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border p-2 rounded-lg w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 rounded-lg w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700">Register</button>
      </form>
      <p className="text-sm text-gray-600 mt-3">Have an account? <Link to="/login" className="text-indigo-600">Login</Link></p>
    </div>
  )
}
