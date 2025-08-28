import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// PhonePe Configuration - Production Ready with OAuth
export const phonePeConfig = {
  merchantId: import.meta.env.VITE_PHONEPE_MERCHANT_ID,
  clientId: import.meta.env.VITE_PHONEPE_CLIENT_ID,
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
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment`, {
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
      const response = await fetch(`${supabaseUrl}/functions/v1/check-payment-status?merchantOrderId=${merchantOrderId}`, {
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