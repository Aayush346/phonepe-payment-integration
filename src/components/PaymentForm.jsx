import React, { useState } from 'react'
import { paymentAPI } from '../lib/supabase'

const PaymentForm = ({ onPaymentInitiated }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number'
    }

    // Amount validation
    const amount = parseFloat(formData.amount)
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    } else if (amount < 1) {
      newErrors.amount = 'Minimum amount is ₹1'
    } else if (amount > 100000) {
      newErrors.amount = 'Maximum amount is ₹1,00,000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const paymentData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        amount: parseFloat(formData.amount)
      }

      const response = await paymentAPI.createPayment(paymentData)
      
      if (response.success && response.paymentUrl) {
        // Redirect to PhonePe payment page
        window.location.href = response.paymentUrl
      } else {
        throw new Error(response.message || 'Failed to initiate payment')
      }
    } catch (error) {
      console.error('Payment initiation error:', error)
      setErrors({ submit: error.message || 'Failed to initiate payment. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>
        Payment Details
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your full name"
            disabled={loading}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            disabled={loading}
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount (₹) *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter amount"
            min="1"
            max="100000"
            step="0.01"
            disabled={loading}
          />
          {errors.amount && <div className="error-message">{errors.amount}</div>}
        </div>

        {errors.submit && (
          <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center' }}>
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '18px', padding: '16px' }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              <span style={{ marginLeft: '10px' }}>Processing...</span>
            </>
          ) : (
            'Pay Now'
          )}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
        <p>🔒 Secure payment powered by PhonePe</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  )
}

export default PaymentForm