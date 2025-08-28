import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Test Deno environment
    const denoInfo = {
      version: Deno.version,
      env: {
        SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT_SET',
        SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'NOT_SET',
        PHONEPE_MERCHANT_ID: Deno.env.get('PHONEPE_MERCHANT_ID') ? 'SET' : 'NOT_SET',
        PHONEPE_CLIENT_SECRET: Deno.env.get('PHONEPE_CLIENT_SECRET') ? 'SET' : 'NOT_SET'
      },
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ success: true, denoInfo }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})