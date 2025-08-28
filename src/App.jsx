import React, { useState, useEffect } from 'react'
import PaymentForm from './components/PaymentForm'
import PaymentStatus from './components/PaymentStatus'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('form')
  const [paymentData, setPaymentData] = useState(null)

  // Check if we're on the payment-status route
  useEffect(() => {
    const path = window.location.pathname
    const urlParams = new URLSearchParams(window.location.search)
    
    if (path === '/payment-status' || urlParams.has('transactionId') || urlParams.has('merchantOrderId')) {
      setCurrentView('status')
    }
  }, [])

  const handlePaymentInitiated = (data) => {
    setPaymentData(data)
    setCurrentView('status')
  }

  const handleBackToForm = () => {
    setCurrentView('form')
    setPaymentData(null)
    // Update URL to home
    window.history.pushState({}, '', '/')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PhonePe Payment Gateway</h1>
        <p>Secure and Fast Payments</p>
      </header>
      
      <main className="app-main">
        {currentView === 'form' && (
          <PaymentForm onPaymentInitiated={handlePaymentInitiated} />
        )}
        
        {currentView === 'status' && (
          <PaymentStatus 
            paymentData={paymentData} 
            onBackToForm={handleBackToForm}
          />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by PhonePe & Supabase</p>
      </footer>
    </div>
  )
}

export default App