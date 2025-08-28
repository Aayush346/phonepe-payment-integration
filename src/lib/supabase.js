import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://keowmvlikgcvnlkgadzi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlb3dtdmxpa2djdm5sa2dhZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjAzNzgsImV4cCI6MjA3MTc5NjM3OH0.2IZbAlWW8l3Ajcx3QEXA8IwWh0xrWkck13TOU3W1BqE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// PhonePe Configuration - Production Ready with OAuth
export const phonePeConfig = {
  merchantId: import.meta.env.VITE_PHONEPE_MERCHANT_ID || 'M22DTQKQYSLBR',
  clientId: import.meta.env.VITE_PHONEPE_CLIENT_ID || 'SU2508141540177742840823',
  // Note: Client secret is handled securely in backend functions
  baseUrl: 'https://api.phonepe.com/apis/pg', // Production URL
  authBaseUrl: 'https://api.phonepe.com/apis/identity-manager', // OAuth URL
  callbackUrl: `${supabaseUrl}/functions/v1/phonepe-webhook`,
  redirectUrl: `${window.location.origin}/payment-status`,
  // OAuth is handled automatically by backend functions
  oauthEnabled: true
}

// Payment API functions
export const paymentAPI = {
  async createPayment(paymentData) {
    try {
      const response = await fetch('https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  async checkPaymentStatus(merchantOrderId) {
    try {
      const response = await fetch(`https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/check-payment-status?merchantOrderId=${merchantOrderId}`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },

  async getPaymentDetails(id) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error;
    }
  }
};