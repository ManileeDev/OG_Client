import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost, apiPut } from '../../api/client'
import Modal from '../../components/Modal'

const FIELD =
  'w-full rounded-lg border border-edge bg-panel px-3 py-2.5 text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none'
const LABEL = 'mb-1.5 block text-xs font-medium text-ink-dim'

export default function ProductFormModal({ product, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    category: product?.category ?? 'Men',
    size: product?.size ?? '',
    colour: product?.colour ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const mutation = useMutation({
    mutationFn: (body) => (product ? apiPut(`/products/${product.id}`, body) : apiPost('/products', body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
  })

  const submit = (e) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    })
  }

  return (
    <Modal title={product ? 'Edit product' : 'Add product'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL}>Product name</label>
          <input required value={form.name} onChange={set('name')} className={FIELD} placeholder="Handloom Cotton Kurta" />
        </div>
        <div>
          <label className={LABEL}>SKU</label>
          <input required value={form.sku} onChange={set('sku')} className={FIELD} placeholder="TC-KUR-001" />
        </div>
        <div>
          <label className={LABEL}>Category</label>
          <select value={form.category} onChange={set('category')} className={FIELD}>
            <option>Men</option>
            <option>Women</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Size</label>
          <input required value={form.size} onChange={set('size')} className={FIELD} placeholder="M / 32 / Free Size" />
        </div>
        <div>
          <label className={LABEL}>Colour</label>
          <input required value={form.colour} onChange={set('colour')} className={FIELD} placeholder="Maroon" />
        </div>
        <div>
          <label className={LABEL}>Price (₹)</label>
          <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={FIELD} placeholder="1299.00" />
        </div>
        <div>
          <label className={LABEL}>Stock</label>
          <input required type="number" min="0" step="1" value={form.stock} onChange={set('stock')} className={FIELD} placeholder="10" />
        </div>

        {mutation.error && (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {mutation.error.message}
          </div>
        )}

        <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-edge px-4 py-2 text-sm text-ink-dim hover:bg-panel">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50">
            {mutation.isPending ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
