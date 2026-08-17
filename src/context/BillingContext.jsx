import { createContext, useContext, useState } from 'react'

// Holds the in-progress sale above the router, so navigating between
// pages never clears the billing form.
const BillingContext = createContext(null)

const EMPTY_CUSTOMER = { phone: '', name: '', email: '' }

export function BillingProvider({ children }) {
  const [cart, setCart] = useState([]) // [{ product, qty }]
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [appliedCoupon, setAppliedCoupon] = useState(null) // { code, type, value, discountAmount }
  const [manualDiscount, setManualDiscount] = useState('')

  const resetSale = () => {
    setCart([])
    setCustomer(EMPTY_CUSTOMER)
    setAppliedCoupon(null)
    setManualDiscount('')
  }

  return (
    <BillingContext.Provider
      value={{
        cart,
        setCart,
        customer,
        setCustomer,
        appliedCoupon,
        setAppliedCoupon,
        manualDiscount,
        setManualDiscount,
        resetSale,
      }}
    >
      {children}
    </BillingContext.Provider>
  )
}

export const useBilling = () => useContext(BillingContext)
