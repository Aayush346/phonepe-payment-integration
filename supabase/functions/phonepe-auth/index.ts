import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// PhonePe OAuth Configuration
const PHONEPE_AUTH_CONFIG = {
  CLIENT_ID: Deno.env.get('PHONEPE_CLIENT_ID'),
  CLIENT_SECRET: Deno.env.get('PHONEPE_CLIENT_SECRET'),
  CLIENT_VERSION: Deno.env.get('PHONEPE_CLIENT_VERSION') || 'v2',
  AUTH_BASE_URL: Deno.env.get('PHONEPE_AUTH_BASE_URL') || 'https://api.phonepe.com/apis/identity-manager'
}

interface TokenResponse {
  access_token: string
  encrypted_access_token: string
  expires_in: number | null
  issued_at: number
  expires_at: number
  session_expires_at: number
  token_type: string
}

interface CachedToken {
  access_token: string
  expires_at: number
  issued_at: number
}

// In-memory token cache (for production, consider using Redis or database)
let tokenCache: CachedToken | null = null

// Check if token is still valid (with 5 minute buffer)
function isTokenValid(token: CachedToken): boolean {
  const now = Math.floor(Date.now() / 1000)
  const bufferTime = 300 // 5 minutes buffer
  return token.expires_at > (now + bufferTime)
}

// Generate OAuth token
async function generateOAuthToken(): Promise<TokenResponse> {
  const tokenUrl = `${PHONEPE_AUTH_CONFIG.AUTH_BASE_URL}/v1/oauth/token`
  
  const formData = new URLSearchParams()
  formData.append('client_id', PHONEPE_AUTH_CONFIG.CLIENT_ID!)
  formData.append('client_version', PHONEPE_AUTH_CONFIG.CLIENT_VERSION)
  formData.append('client_secret', PHONEPE_AUTH_CONFIG.CLIENT_SECRET!)
  formData.append('grant_type', 'client_credentials')

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OAuth token generation failed: ${response.status} - ${errorText}`)
  }

  const tokenData: TokenResponse = await response.json()
  
  // Cache the token
  tokenCache = {
    access_token: tokenData.access_token,
    expires_at: tokenData.expires_at,
    issued_at: tokenData.issued_at
  }

  return tokenData
}

// Get valid token (from cache or generate new)
async function getValidToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && isTokenValid(tokenCache)) {
    return tokenCache.access_token
  }

  // Generate new token
  const tokenResponse = await generateOAuthToken()
  return tokenResponse.access_token
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate required environment variables
    if (!PHONEPE_AUTH_CONFIG.CLIENT_ID || !PHONEPE_AUTH_CONFIG.CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required PhonePe OAuth configuration',
          details: 'PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET are required'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request to determine action
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'token'

    switch (action) {
      case 'token':
        // Get or generate access token
        const accessToken = await getValidToken()
        
        return new Response(
          JSON.stringify({
            success: true,
            access_token: accessToken,
            token_type: 'O-Bearer',
            cached: tokenCache ? isTokenValid(tokenCache) : false,
            expires_at: tokenCache?.expires_at
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'refresh':
        // Force refresh token
        const newTokenResponse = await generateOAuthToken()
        
        return new Response(
          JSON.stringify({
            success: true,
            access_token: newTokenResponse.access_token,
            token_type: 'O-Bearer',
            expires_at: newTokenResponse.expires_at,
            issued_at: newTokenResponse.issued_at,
            refreshed: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'status':
        // Check token status
        return new Response(
          JSON.stringify({
            success: true,
            has_token: !!tokenCache,
            is_valid: tokenCache ? isTokenValid(tokenCache) : false,
            expires_at: tokenCache?.expires_at,
            issued_at: tokenCache?.issued_at,
            time_to_expiry: tokenCache ? tokenCache.expires_at - Math.floor(Date.now() / 1000) : null
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action',
            available_actions: ['token', 'refresh', 'status']
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('OAuth token error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'OAuth token generation failed',
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})