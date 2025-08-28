import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// PhonePe Configuration
const PHONEPE_CONFIG = {
  MERCHANT_ID: Deno.env.get('PHONEPE_MERCHANT_ID'),
  CLIENT_ID: Deno.env.get('PHONEPE_CLIENT_ID'),
  CLIENT_SECRET: Deno.env.get('PHONEPE_CLIENT_SECRET'),
  CLIENT_VERSION: Deno.env.get('PHONEPE_CLIENT_VERSION') || 'v2',
  BASE_URL: Deno.env.get('PHONEPE_PRODUCTION_BASE_URL') || 'https://api.phonepe.com/apis/pg',
  AUTH_BASE_URL: Deno.env.get('PHONEPE_AUTH_BASE_URL') || 'https://api.phonepe.com/apis/identity-manager'
}

interface StatusRequest {
  merchantOrderId: string
}

interface PhonePeStatusResponse {
  success: boolean
  code: string
  message: string
  data?: {
    merchantId: string
    merchantTransactionId: string
    transactionId: string
    amount: number
    state: string
    responseCode: string
    paymentInstrument?: {
      type: string
      utr?: string
    }
  }
}

// Generate SHA256 hash
async function generateSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get OAuth token from auth service
async function getOAuthToken(): Promise<string> {
  try {
    const authResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-auth?action=token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      }
    })

    if (!authResponse.ok) {
      throw new Error(`Auth service failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    if (!authData.success) {
      throw new Error('Failed to get OAuth token')
    }

    return authData.access_token
  } catch (error) {
    console.error('OAuth token retrieval failed:', error)
    throw new Error('Authentication failed')
  }
}

// Generate X-VERIFY header for status check
async function generateXVerify(merchantTransactionId: string): Promise<string> {
  const endpoint = `/checkout/v2/order/${merchantTransactionId}/status`
  const stringToHash = endpoint + PHONEPE_CONFIG.CLIENT_SECRET
  const hash = await generateSHA256(stringToHash)
  return hash + '###' + PHONEPE_CONFIG.CLIENT_VERSION
}

// Map PhonePe status to our status
function mapPhonePeStatus(state: string, responseCode: string): string {
  if (state === 'COMPLETED' && responseCode === 'SUCCESS') {
    return 'completed'
  } else if (state === 'FAILED') {
    return 'failed'
  } else if (state === 'PENDING') {
    return 'pending'
  } else {
    return 'failed'
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate required environment variables
    if (!PHONEPE_CONFIG.MERCHANT_ID || !PHONEPE_CONFIG.CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required PhonePe configuration',
          details: 'PHONEPE_MERCHANT_ID and PHONEPE_CLIENT_SECRET are required'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { merchantOrderId }: StatusRequest = await req.json()

    if (!merchantOrderId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing merchantOrderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find payment record in database
    const { data: paymentRecord, error: findError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('merchant_order_id', merchantOrderId)
      .single()

    if (findError || !paymentRecord) {
      return new Response(
        JSON.stringify({ success: false, message: 'Payment record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If payment is already completed or failed, return cached status
    if (paymentRecord.status === 'completed' || paymentRecord.status === 'failed') {
      return new Response(
        JSON.stringify({
          success: true,
          payment: paymentRecord,
          fromCache: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check status with PhonePe API
    try {
      // Get OAuth token
      const oauthToken = await getOAuthToken()
      
      const xVerify = await generateXVerify(merchantOrderId)
      const statusUrl = `${PHONEPE_CONFIG.BASE_URL}/checkout/v2/order/${merchantOrderId}/status`

      const phonePeResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${oauthToken}`,
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': PHONEPE_CONFIG.MERCHANT_ID
        }
      })

      const phonePeResult: PhonePeStatusResponse = await phonePeResponse.json()

      if (phonePeResult.success && phonePeResult.data) {
        // Map the status
        const newStatus = mapPhonePeStatus(phonePeResult.data.state, phonePeResult.data.responseCode)

        // Update payment record with latest status
        const { data: updatedPayment, error: updateError } = await supabaseClient
          .from('payments')
          .update({
            status: newStatus,
            phonepe_status: phonePeResult.data.responseCode,
            phonepe_transaction_id: phonePeResult.data.transactionId,
            phonepe_response_code: phonePeResult.data.responseCode,
            phonepe_payment_response: phonePeResult,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentRecord.id)
          .select()
          .single()

        if (updateError) {
          console.error('Failed to update payment record:', updateError)
          // Return original record if update fails
          return new Response(
            JSON.stringify({
              success: true,
              payment: { ...paymentRecord, status: newStatus },
              fromCache: false
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            payment: updatedPayment,
            fromCache: false
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // PhonePe API call failed, return current database status
        console.error('PhonePe status check failed:', phonePeResult)
        return new Response(
          JSON.stringify({
            success: true,
            payment: paymentRecord,
            fromCache: true,
            note: 'Status check with PhonePe failed, returning cached status'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (phonePeError) {
      // PhonePe API error, return current database status
      console.error('PhonePe API error:', phonePeError)
      return new Response(
        JSON.stringify({
          success: true,
          payment: paymentRecord,
          fromCache: true,
          note: 'PhonePe API unavailable, returning cached status'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Status check error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})