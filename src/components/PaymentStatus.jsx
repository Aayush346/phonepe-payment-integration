import React, { useState, useEffect } from 'react'
import { paymentAPI } from '../lib/supabase'

const PaymentStatus = ({ paymentData, onBackToForm }) => {
  const [status, setStatus] = useState('pending')
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get payment ID from URL params (when redirected back from PhonePe)
    const urlParams = new URLSearchParams(window.location.search)
    const merchantOrderId = urlParams.get('merchantOrderId') || 
                           urlParams.get('transactionId') || 
                           urlParams.get('id') || 
                           paymentData?.merchantOrderId
    
    // Check for PhonePe response codes
    const code = urlParams.get('code')
    const providerReferenceId = urlParams.get('providerReferenceId')
    
    if (merchantOrderId) {
      checkPaymentStatus(merchantOrderId)
      
      // Set initial status based on URL params if available
      if (code === 'PAYMENT_SUCCESS') {
        setStatus('success')
      } else if (code === 'PAYMENT_ERROR') {
        setStatus('failed')
      } else if (code === 'PAYMENT_PENDING') {
        setStatus('pending')
      }
      
      // Poll for status updates every 5 seconds for up to 2 minutes
      const pollInterval = setInterval(() => {
        checkPaymentStatus(merchantOrderId)
      }, 5000)
      
      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
      }, 120000)
      
      return () => clearInterval(pollInterval)
    } else {
      setError('No payment information found in URL parameters')
      setLoading(false)
    }
  }, [paymentData])

  const checkPaymentStatus = async (merchantOrderId) => {
    try {
      const response = await paymentAPI.checkPaymentStatus(merchantOrderId)
      
      if (response.success) {
        setPaymentInfo(response.payment)
        setStatus(response.payment.status)
        
        // Stop loading if payment is completed or failed
        if (response.payment.status !== 'pending') {
          setLoading(false)
        }
      } else {
        throw new Error(response.message || 'Failed to check payment status')
      }
    } catch (error) {
      console.error('Status check error:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
      case 'success':
        return '✅'
      case 'failed':
      case 'cancelled':
        return '❌'
      case 'pending':
      default:
        return '⏳'
    }
  }

  const getStatusClass = () => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'status-success'
      case 'failed':
      case 'cancelled':
        return 'status-failed'
      case 'pending':
      default:
        return 'status-pending'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'cancelled':
        return 'Payment Cancelled'
      case 'pending':
      default:
        return 'Payment Processing...'
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'Your payment has been processed successfully. You will receive a confirmation shortly.'
      case 'failed':
        return 'Your payment could not be processed. Please try again or contact support.'
      case 'cancelled':
        return 'The payment was cancelled. You can try again if needed.'
      case 'pending':
      default:
        return 'Please wait while we confirm your payment status...'
    }
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div className="status-icon status-failed">
          ❌
        </div>
        <h2 style={{ color: '#e74c3c', marginBottom: '16px' }}>Error</h2>
        <p style={{ marginBottom: '24px', color: '#666' }}>{error}</p>
        <button 
          onClick={onBackToForm}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
      <div className={`status-icon ${getStatusClass()}`}>
        {getStatusIcon()}
      </div>
      
      <h2 style={{ marginBottom: '16px', color: '#333' }}>
        {getStatusMessage()}
      </h2>
      
      <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.5' }}>
        {getStatusDescription()}
      </p>
      
      {paymentInfo && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '12px', color: '#333' }}>Payment Details</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div><strong>Name:</strong> {paymentInfo.name}</div>
            <div><strong>Phone:</strong> {paymentInfo.phone}</div>
            <div><strong>Amount:</strong> ₹{paymentInfo.amount}</div>
            <div><strong>Order ID:</strong> {paymentInfo.merchant_order_id}</div>
            {paymentInfo.phonepe_transaction_id && (
              <div><strong>Transaction ID:</strong> {paymentInfo.phonepe_transaction_id}</div>
            )}
            <div><strong>Status:</strong> 
              <span style={{ 
                color: status === 'completed' || status === 'success' ? '#27ae60' : 
                       status === 'failed' || status === 'cancelled' ? '#e74c3c' : '#f39c12',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {loading && status === 'pending' && (
        <div style={{ marginBottom: '20px' }}>
          <div className="loading" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '10px', color: '#666' }}>Checking payment status...</p>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={onBackToForm}
          className="btn btn-secondary"
        >
          New Payment
        </button>
        
        {paymentInfo && (status === 'completed' || status === 'success') && (
          <button 
            onClick={() => window.print()}
            className="btn btn-primary"
          >
            Print Receipt
          </button>
        )}
      </div>
    </div>
  )
}

export default PaymentStatus