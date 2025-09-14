import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import useCart from '../store/useCart'
import useAuth from '../store/useAuth'
import { api } from '../components/api'

export default function Success() {
  const [sp] = useSearchParams()
  const session_id = sp.get('session_id')
  const { clear } = useCart()
  const { init } = useAuth()

  useEffect(()=>{ init() },[])

  useEffect(()=>{
    clear()
    // Optional: Poll backend to confirm order status if webhooks are not configured
    if (session_id) {
      api.get('/checkout/confirm/' + session_id).catch(()=>{})
    }
  },[session_id])

  return (
    <div className="text-center py-16">
      <h2 className="text-3xl font-bold mb-3">Thank you for your purchase!</h2>
      <p className="text-gray-600 mb-6">A receipt was sent to your email.</p>
      <Link to="/catalog" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700">Continue Shopping</Link>
    </div>
  )
}
