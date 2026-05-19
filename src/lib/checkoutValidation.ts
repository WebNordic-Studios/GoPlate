import type { SavedPaymentMethod } from '../types'

export type CheckoutFormState = {
  name: string
  phone: string
  instructions: string
  selectedAddressId: string | null
  paymentMode: 'saved' | 'new'
  selectedPaymentId: string | null
  cardNumber: string
  cardExpiry: string
  cardCvc: string
}

export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormState | 'payment', string>>

export function validateCheckoutForm(
  form: CheckoutFormState,
  opts: { requireDeliveryAddress: boolean; hasSavedCards: boolean },
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {}
  if (!form.name.trim()) errors.name = 'Enter your name.'
  const phoneDigits = form.phone.replace(/\D/g, '')
  if (phoneDigits.length < 10) errors.phone = 'Enter a valid phone number.'
  if (opts.requireDeliveryAddress && !form.selectedAddressId) {
    errors.selectedAddressId = 'Select a delivery address.'
  }
  if (form.paymentMode === 'saved') {
    if (!form.selectedPaymentId) errors.payment = 'Select a payment method.'
  } else {
    const digits = form.cardNumber.replace(/\s/g, '')
    if (digits.length < 15) errors.cardNumber = 'Enter a valid card number.'
    if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry.trim())) errors.cardExpiry = 'Use MM/YY format.'
    if (form.cardCvc.replace(/\D/g, '').length < 3) errors.cardCvc = 'Enter CVC.'
  }
  return errors
}

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function detectCardBrand(digits: string): SavedPaymentMethod['brand'] {
  if (digits.startsWith('4')) return 'Visa'
  if (/^5[1-5]/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  if (digits.startsWith('6')) return 'Discover'
  return 'Other'
}
