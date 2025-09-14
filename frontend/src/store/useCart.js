import { create } from 'zustand'

const persisted = JSON.parse(localStorage.getItem('cart') || '[]')

const useCart = create((set, get) => ({
  items: persisted, // [{id,title,priceCents,quantity,imageUrl}]
  add(item) {
    const items = [...get().items]
    const idx = items.findIndex(i => i.id === item.id)
    if (idx >= 0) items[idx].quantity += item.quantity || 1
    else items.push({ ...item, quantity: item.quantity || 1 })
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
  },
  remove(id) {
    const items = get().items.filter(i => i.id !== id)
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
  },
  update(id, quantity) {
    const items = get().items.map(i => i.id === id ? { ...i, quantity } : i)
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
  },
  clear() {
    localStorage.removeItem('cart')
    set({ items: [] })
  },
  get count() {
    return get().items.reduce((s, i) => s + i.quantity, 0)
  },
  get totalCents() {
    return get().items.reduce((s, i) => s + i.priceCents * i.quantity, 0)
  }
}))

export default useCart
