// Product taxonomy shared by inventory and billing. `sizeType` drives the
// size picker: waist categories run 28–40, everything else runs S–XXL.
export const CATEGORIES = [
  { name: 'Pant', sizeType: 'waist' },
  { name: 'Shirt', sizeType: 'letter' },
  { name: 'T-Shirt', sizeType: 'letter' },
  { name: 'Hoodie', sizeType: 'letter' },
  { name: 'Shorts', sizeType: 'waist' },
  { name: 'Track Pant', sizeType: 'waist' },
  { name: 'Other', sizeType: 'letter' },
]

const SIZES_BY_TYPE = {
  letter: ['S', 'M', 'L', 'XL', 'XXL'],
  waist: ['28', '30', '32', '34', '36', '38', '40'],
}

export function categoryOf(name) {
  return CATEGORIES.find((c) => c.name === name)
}

export function sizeTypeOf(name) {
  return categoryOf(name)?.sizeType ?? 'letter'
}

export function sizeOptionsFor(name) {
  return SIZES_BY_TYPE[sizeTypeOf(name)]
}

// Size variants live as separate documents (one per size) so billing and
// stock deduction stay per-size. For display they are grouped into one
// product: by SKU when present, otherwise by name/category/colour/price.
export function groupProducts(products) {
  const groups = new Map()
  for (const p of products) {
    const key = p.sku ?? ['', p.name.trim().toLowerCase(), p.category, p.colour ?? '', p.price].join('|')
    let group = groups.get(key)
    if (!group) {
      group = {
        key,
        name: p.name,
        sku: p.sku,
        category: p.category,
        colour: p.colour,
        price: p.price,
        variants: [],
        stock: 0,
      }
      groups.set(key, group)
    }
    group.variants.push(p)
    group.stock += p.stock
  }
  for (const group of groups.values()) {
    const order = sizeOptionsFor(group.category)
    const rank = (size) => {
      const i = order.indexOf(size)
      return i === -1 ? order.length : i
    }
    group.variants.sort((a, b) => rank(a.size) - rank(b.size) || a.size.localeCompare(b.size))
  }
  return [...groups.values()]
}
