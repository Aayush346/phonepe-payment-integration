# Environment Variables Setup Guide

## 🔧 Required Environment Variables

Before your PhonePe payment system can process real transactions, you must configure the following environment variables:

### 1. Supabase Edge Functions Environment Variables

Go to your Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

**Required Variables:**
```bash
# PhonePe Credentials (Get from PhonePe Business Dashboard)
PHONEPE_MERCHANT_ID=your_merchant_id_here
PHONEPE_CLIENT_ID=your_client_id_here
PHONEPE_CLIENT_SECRET=your_client_secret_here
PHONEPE_CLIENT_VERSION=v2

# Production URLs (Required for OAuth)
PHONEPE_PRODUCTION_BASE_URL=https://api.phonepe.com/apis/pg
PHONEPE_AUTH_BASE_URL=https://api.phonepe.com/apis/identity-manager

# Sandbox URLs (for testing only)
# PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# Callback and Redirect URLs
PHONEPE_CALLBACK_URL=https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/phonepe-webhook
PHONEPE_REDIRECT_URL=https://your-domain.com/payment-status

# Supabase Configuration (Required for OAuth token service)
SUPABASE_URL=https://keowmvlikgcvnlkgadzi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Frontend Environment Variables

Create `.env.production` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://keowmvlikgcvnlkgadzi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# PhonePe Frontend Configuration
# For Sandbox/Testing:
VITE_PHONEPE_ENVIRONMENT=SANDBOX
VITE_PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
# For Production:
# VITE_PHONEPE_ENVIRONMENT=PRODUCTION
# VITE_PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg

# URLs
VITE_PHONEPE_CALLBACK_URL=https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/phonepe-webhook
VITE_PHONEPE_REDIRECT_URL=https://your-domain.com/payment-status
```

## 🏗️ Setup Steps

### Step 1: PhonePe Account Setup
1. **Register for PhonePe Business Account**
   - Visit: https://business.phonepe.com/
   - Complete registration and KYC

2. **Get Credentials**
   - Login to PhonePe Business Dashboard
   - Navigate to Developer Section
   - Generate/Copy:
     - Merchant ID
     - Client ID
     - Client Secret

3. **Configure Webhooks**
   - Set Webhook URL: `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/phonepe-webhook`
   - Set Redirect URL: `https://your-domain.com/payment-status`

4. **Important**: For production, ensure OAuth is enabled for your merchant account

### Step 2: Supabase Configuration
1. **Set Environment Variables**
   - Go to Supabase Dashboard
   - Project Settings → Edge Functions → Environment Variables
   - Add all the variables listed above (including OAuth URLs)

2. **Create Database Table**
   - Go to SQL Editor in Supabase
   - Run the script from `create_payments_table.sql`

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy phonepe-auth
   supabase functions deploy create-payment
   supabase functions deploy check-payment-status
   supabase functions deploy phonepe-webhook
   supabase functions deploy create-payment-simple
   ```

### Step 3: Deploy Frontend
1. **Update Environment Variables**
   - Replace `your-domain.com` with your actual domain
   - Set correct PhonePe environment (SANDBOX/PRODUCTION)

2. **Build and Deploy**
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting platform
   ```

## 🧪 Testing Configuration

### Test OAuth Token Generation
```bash
# Test OAuth authentication
curl -X GET "https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/phonepe-auth" \
  -H "Authorization: Bearer your-anon-key"
```

### Test Environment Variables
```bash
# Test if edge functions can access environment variables
curl -X GET "https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/test-deno" \
  -H "Authorization: Bearer your-anon-key"
```

### Test Payment Creation
```bash
curl -X POST "https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "name": "Test User",
    "phone": "9999999999",
    "amount": 100
  }'
```

## 🔒 Security Best Practices

1. **Never commit secrets to version control**
2. **Use different credentials for sandbox and production**
3. **Regularly rotate API keys**
4. **Monitor webhook endpoints for suspicious activity**
5. **Use HTTPS for all endpoints**
6. **OAuth Token Security**:
   - Tokens are cached in memory for performance
   - Automatic refresh before expiry (5-minute buffer)
   - Secure token transmission between functions
   - Monitor token usage and refresh cycles

## 🚨 Common Issues

### Issue: "OAuth Token Generation Failed"
**Solution:** Check CLIENT_ID and CLIENT_SECRET, verify SUPABASE_URL and SERVICE_ROLE_KEY

### Issue: "Missing required PhonePe configuration"
**Solution:** Ensure all environment variables are set in Supabase Edge Functions (including OAuth URLs)

### Issue: "Webhook signature verification failed"
**Solution:** Check that `PHONEPE_CLIENT_SECRET` matches your PhonePe dashboard

### Issue: "Payment redirect not working"
**Solution:** Verify `PHONEPE_REDIRECT_URL` points to your deployed frontend

### Issue: "Database connection failed"
**Solution:** Run the SQL script from `create_payments_table.sql`

### Issue: "Token Expired Error"
**Solution:** Function automatically refreshes tokens with 5-minute buffer, check OAuth configuration

## 📞 Support

- **PhonePe Support:** https://developer.phonepe.com/
- **Supabase Support:** https://supabase.com/docs
- **Project Issues:** Create GitHub issue

---

**⚠️ IMPORTANT:** 
- **Production Ready**: All functions now use OAuth authentication
- Test OAuth token generation first before payment flows
- Monitor token refresh cycles and OAuth authentication
- Keep sandbox and production credentials separate
- Monitor all transactions and webhook deliveries