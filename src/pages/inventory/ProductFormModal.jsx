import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { apiDelete, apiPost, apiPut } from '../../api/client'
import { CATEGORIES, categoryOf, sizeOptionsFor, sizeTypeOf } from '../../lib/categories'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

const FIELD =
  'w-full rounded-lg border border-edge bg-panel px-3 py-2.5 text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none'
const LABEL = 'mb-1.5 block text-xs font-medium text-ink-dim'

const DEFAULT_CATEGORY = CATEGORIES[0].name

// `group` is a grouped product from groupProducts(); each size row maps to
// one product document (row.id) so quantities are edited per size.
export default function ProductFormModal({ group, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: group?.name ?? '',
    sku: group?.sku ?? '',
    // Products predating the category revamp fall back to the default
    category: categoryOf(group?.category) ? group.category : DEFAULT_CATEGORY,
    colour: group?.colour ?? '',
    price: group?.price ?? '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const [rows, setRows] = useState(
    group
      ? group.variants.map((v) => ({ id: v.id, size: v.size, qty: v.stock }))
      : [{ id: null, size: sizeOptionsFor(DEFAULT_CATEGORY)[0], qty: 1 }],
  )
  const [removedIds, setRemovedIds] = useState([])

  const sizeOptions = sizeOptionsFor(form.category)
  const sizeLabel = sizeTypeOf(form.category) === 'waist' ? 'Size (Waist)' : 'Size'
  const totalStock = rows.reduce((sum, r) => sum + r.qty, 0)

  const setCategory = (category) => {
    setForm((f) => ({ ...f, category }))
    // New products restart the size rows for the new size run; existing
    // products keep their rows (saved sizes stay selectable as-is)
    if (!group) setRows([{ id: null, size: sizeOptionsFor(category)[0], qty: 1 }])
  }

  const setRow = (index, patch) =>
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const addRow = () => {
    const used = new Set(rows.map((r) => r.size))
    const next = sizeOptions.find((o) => !used.has(o))
    if (next) setRows((rs) => [...rs, { id: null, size: next, qty: 1 }])
  }
  const removeRow = (index) => {
    const row = rows[index]
    if (row.id) setRemovedIds((ids) => [...ids, row.id])
    setRows((rs) => rs.filter((_, i) => i !== index))
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const base = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        category: form.category,
        colour: form.colour.trim() || null,
        price: Number(form.price),
      }
      for (const id of removedIds) {
        await apiDelete(`/products/${id}`)
      }
      for (const row of rows) {
        const body = { ...base, size: row.size, stock: row.qty }
        if (row.id) await apiPut(`/products/${row.id}`, body)
        else await apiPost('/products', body)
      }
    },
    onSuccess: onClose,
    // Invalidate even on failure: some size rows may already have been saved
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const submit = (e) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <Modal title={group ? 'Edit product' : 'Add product'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL}>Product name</label>
          <input required value={form.name} onChange={set('name')} className={FIELD} placeholder="Formal Cotton Shirt" />
        </div>
        <div>
          <label className={LABEL}>SKU (optional)</label>
          <input value={form.sku} onChange={set('sku')} className={FIELD} placeholder="TC-SHT-001" />
        </div>
        <div>
          <label className={LABEL}>Category</label>
          <Select
            value={form.category}
            onChange={setCategory}
            options={CATEGORIES.map((c) => c.name)}
            ariaLabel="Category"
          />
        </div>
        <div>
          <label className={LABEL}>Colour (optional)</label>
          <input value={form.colour} onChange={set('colour')} className={FIELD} placeholder="Maroon" />
        </div>
        <div>
          <label className={LABEL}>Price (₹)</label>
          <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={FIELD} placeholder="1299.00" />
        </div>

        <div className="sm:col-span-2">
          <div className="mb-1.5 grid grid-cols-[1fr_auto_36px] gap-3">
            <span className={LABEL.replace('mb-1.5 ', '')}>{sizeLabel}</span>
            <span className={LABEL.replace('mb-1.5 ', '')}>Quantity</span>
            <span />
          </div>
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => {
              const taken = new Set(rows.filter((_, j) => j !== i).map((r) => r.size))
              return (
                <div key={row.id ?? `new-${i}`} className="grid grid-cols-[1fr_auto_36px] items-center gap-3">
                  <Select
                    value={row.size}
                    onChange={(size) => setRow(i, { size })}
                    options={[
                      ...(!sizeOptions.includes(row.size) ? [row.size] : []),
                      ...sizeOptions.map((o) => ({ value: o, label: o, disabled: taken.has(o) })),
                    ]}
                    ariaLabel={`Size for row ${i + 1}`}
                  />
                  <div className="flex items-center rounded-lg border border-edge">
                    <button
                      type="button"
                      onClick={() => setRow(i, { qty: Math.max(0, row.qty - 1) })}
                      className="px-2.5 py-2.5 text-ink-dim hover:text-ink"
                      aria-label={`Decrease quantity for size ${row.size}`}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.qty}
                      onChange={(e) => setRow(i, { qty: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-16 border-x border-edge bg-panel px-2 py-2.5 text-center text-sm focus:outline-none"
                      aria-label={`Quantity for size ${row.size}`}
                    />
                    <button
                      type="button"
                      onClick={() => setRow(i, { qty: row.qty + 1 })}
                      className="px-2.5 py-2.5 text-ink-dim hover:text-ink"
                      aria-label={`Increase quantity for size ${row.size}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={rows.length === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-dim hover:bg-panel-2 hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Remove size ${row.size}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={addRow}
            disabled={sizeOptions.every((o) => rows.some((r) => r.size === o))}
            className="mt-2 w-full rounded-lg border border-dashed border-edge py-2.5 text-sm font-medium text-primary hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add another size
          </button>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink-dim">Total stock</span>
            <span className="rounded-lg border border-edge bg-panel-2 px-4 py-2 font-medium">{totalStock}</span>
          </div>
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
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-btn-ink hover:opacity-90 disabled:opacity-50">
            {mutation.isPending ? 'Saving…' : group ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
