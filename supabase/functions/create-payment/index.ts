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
  AUTH_BASE_URL: Deno.env.get('PHONEPE_AUTH_BASE_URL') || 'https://api.phonepe.com/apis/identity-manager',
  CALLBACK_URL: Deno.env.get('PHONEPE_CALLBACK_URL'),
  REDIRECT_URL: Deno.env.get('PHONEPE_REDIRECT_URL')
}

interface PaymentRequest {
  name: string
  phone: string
  amount: number
}

interface PhonePePayload {
  merchantId: string
  merchantTransactionId: string
  merchantUserId: string
  amount: number
  redirectUrl: string
  redirectMode: string
  callbackUrl: string
  mobileNumber: string
  paymentInstrument: {
    type: string
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

// Generate X-VERIFY header
async function generateXVerify(payload: string, endpoint: string): Promise<string> {
  const stringToHash = payload + endpoint + PHONEPE_CONFIG.CLIENT_SECRET
  const hash = await generateSHA256(stringToHash)
  return hash + '###' + PHONEPE_CONFIG.CLIENT_VERSION
}

// Generate unique merchant order ID
function generateMerchantOrderId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `ORDER_${timestamp}_${random}`
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate required environment variables
    if (!PHONEPE_CONFIG.MERCHANT_ID || !PHONEPE_CONFIG.CLIENT_SECRET || !PHONEPE_CONFIG.CLIENT_ID || !PHONEPE_CONFIG.CALLBACK_URL || !PHONEPE_CONFIG.REDIRECT_URL) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required PhonePe configuration',
          details: 'PHONEPE_MERCHANT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_CLIENT_ID, PHONEPE_CALLBACK_URL, and PHONEPE_REDIRECT_URL are required'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { name, phone, amount }: PaymentRequest = await req.json()

    // Validate input
    if (!name || !phone || !amount) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (amount <= 0 || amount > 100000) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique IDs
    const merchantOrderId = generateMerchantOrderId()
    const merchantUserId = `USER_${phone}_${Date.now()}`

    // Create payment record in database
    const { data: paymentRecord, error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        name,
        phone,
        amount,
        status: 'pending',
        merchant_order_id: merchantOrderId,
        user_id: merchantUserId
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare PhonePe payload
    const phonePePayload: PhonePePayload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: merchantOrderId,
      merchantUserId: merchantUserId,
      amount: amount * 100, // Convert to paise
      redirectUrl: PHONEPE_CONFIG.REDIRECT_URL,
      redirectMode: 'POST',
      callbackUrl: PHONEPE_CONFIG.CALLBACK_URL,
      mobileNumber: phone,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    }

    // Encode payload to base64
    const payloadString = JSON.stringify(phonePePayload)
    const base64Payload = btoa(payloadString)

    // Get OAuth token
    const oauthToken = await getOAuthToken()

    // Generate X-VERIFY header
    const endpoint = '/checkout/v2/pay'
    const xVerify = await generateXVerify(base64Payload, endpoint)

    // Make request to PhonePe with OAuth token
    const phonePeResponse = await fetch(`${PHONEPE_CONFIG.BASE_URL}/checkout/v2/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${oauthToken}`,
        'X-VERIFY': xVerify
      },
      body: JSON.stringify({
        request: base64Payload
      })
    })

    const phonePeResult = await phonePeResponse.json()

    if (phonePeResult.success && phonePeResult.data?.instrumentResponse?.redirectInfo?.url) {
      // Update payment record with PhonePe response
      await supabaseClient
        .from('payments')
        .update({
          phonepe_status: phonePeResult.code,
          phonepe_payment_response: phonePeResult,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id)

      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: phonePeResult.data.instrumentResponse.redirectInfo.url,
          merchantOrderId: merchantOrderId,
          paymentId: paymentRecord.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Update payment record with failure
      await supabaseClient
        .from('payments')
        .update({
          status: 'failed',
          phonepe_status: phonePeResult.code,
          phonepe_payment_response: phonePeResult,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id)

      return new Response(
        JSON.stringify({
          success: false,
          message: phonePeResult.message || 'Failed to initiate payment',
          code: phonePeResult.code
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Payment creation error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})