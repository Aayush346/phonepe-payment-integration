import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-verify',
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

interface WebhookPayload {
  response: string
}

interface PhonePeWebhookData {
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

// Generate SHA256 hash
async function generateSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Generate X-VERIFY header for status verification
async function generateXVerify(endpoint: string): Promise<string> {
  const stringToHash = endpoint + PHONEPE_CONFIG.CLIENT_SECRET
  const hash = await generateSHA256(stringToHash)
  return hash + '###' + PHONEPE_CONFIG.CLIENT_VERSION
}

// Verify webhook signature
async function verifyWebhookSignature(payload: string, xVerifyHeader: string): Promise<boolean> {
  try {
    const [receivedHash, version] = xVerifyHeader.split('###')
    
    if (version !== PHONEPE_CONFIG.CLIENT_VERSION) {
      return false
    }

    const stringToHash = payload + PHONEPE_CONFIG.CLIENT_SECRET
    const calculatedHash = await generateSHA256(stringToHash)
    
    return receivedHash === calculatedHash
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
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
      console.error('Missing required PhonePe configuration: PHONEPE_MERCHANT_ID and PHONEPE_CLIENT_SECRET are required')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get X-VERIFY header
    const xVerifyHeader = req.headers.get('X-VERIFY')
    if (!xVerifyHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing X-VERIFY header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const requestBody = await req.text()
    let webhookData: WebhookPayload
    
    try {
      webhookData = JSON.parse(requestBody)
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify webhook signature
    const isValidSignature = await verifyWebhookSignature(webhookData.response, xVerifyHeader)
    if (!isValidSignature) {
      console.error('Invalid webhook signature')
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decode base64 response
    let decodedResponse: PhonePeWebhookData
    try {
      const decodedString = atob(webhookData.response)
      decodedResponse = JSON.parse(decodedString)
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid response format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate merchant ID
    if (decodedResponse.merchantId !== PHONEPE_CONFIG.MERCHANT_ID) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid merchant ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find payment record
    const { data: paymentRecord, error: findError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('merchant_order_id', decodedResponse.merchantTransactionId)
      .single()

    if (findError || !paymentRecord) {
      console.error('Payment record not found:', decodedResponse.merchantTransactionId)
      return new Response(
        JSON.stringify({ success: false, message: 'Payment record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map status
    const newStatus = mapPhonePeStatus(decodedResponse.state, decodedResponse.responseCode)

    // Update payment record
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: newStatus,
        phonepe_status: decodedResponse.responseCode,
        phonepe_transaction_id: decodedResponse.transactionId,
        phonepe_response_code: decodedResponse.responseCode,
        phonepe_webhook_response: decodedResponse,
        phonepe_webhook_event: {
          state: decodedResponse.state,
          responseCode: decodedResponse.responseCode,
          amount: decodedResponse.amount,
          paymentInstrument: decodedResponse.paymentInstrument
        },
        webhook_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.id)

    if (updateError) {
      console.error('Failed to update payment record:', updateError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log webhook event
    console.log(`Webhook processed for order ${decodedResponse.merchantTransactionId}: ${newStatus}`)

    // Send success response to PhonePe
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        merchantTransactionId: decodedResponse.merchantTransactionId,
        status: newStatus
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})