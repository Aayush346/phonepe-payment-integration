# PhonePe Payment System - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Deploy to Netlify (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/phonepe-payment.git
   git push -u origin main
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings are automatically configured via `netlify.toml`
   - Deploy!

### Option 2: Deploy to Vercel

1. **Push to GitHub** (same as above)

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Build settings are automatically configured via `vercel.json`
   - Deploy!

### Option 3: Manual Static Hosting

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to any static hosting service:
   - GitHub Pages
   - Firebase Hosting
   - AWS S3 + CloudFront
   - Any web hosting provider

## 📡 All API Endpoints

### Base URL
```
https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/
```

### 1. 💳 Create Payment
```
POST /create-payment
```
**Full URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment`

**Test with cURL:**
```bash
curl -X POST https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "amount": 100
  }'
```

### 2. 🔍 Check Payment Status
```
GET /check-payment-status?merchantTransactionId=TXN_ID
```
**Full URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/check-payment-status`

**Test with cURL:**
```bash
curl "https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/check-payment-status?merchantTransactionId=TXN_123456789" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

### 3. 🔔 PhonePe Webhook
```
POST /phonepe-webhook
```
**Full URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/phonepe-webhook`

### 4. 🧪 Test Environment
```
GET /test-deno
```
**Full URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/test-deno`

**Test with cURL:**
```bash
curl https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/test-deno
```

### 5. 🔧 Simple Payment (Testing)
```
POST /create-payment-simple
```
**Full URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment-simple`

## 🌐 Live Testing URLs

Once deployed, you can test the payment system using these HTML files:

1. **Main Application:** `https://your-domain.com/`
2. **Sandbox Testing:** `https://your-domain.com/test-sandbox-payment.html`
3. **Original Payment Test:** `https://your-domain.com/test-original-payment.html`
4. **Simple Payment Test:** `https://your-domain.com/test-payment-simple.html`
5. **Deno Environment Test:** `https://your-domain.com/test-deno.html`

## 🔑 Required Configuration

### Supabase Environment Variables
Make sure these are set in your Supabase project:

```env
SUPABASE_URL=https://keowmvlikgcvnlkgadzi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_CLIENT_SECRET=your_phonepe_client_secret
```

### Database Setup
1. Go to Supabase SQL Editor
2. Run the SQL script from `create_payments_table.sql`
3. Verify the `payments` table is created

## 🧪 Testing Real Transactions

### PhonePe Sandbox Environment
- **Environment:** UAT (User Acceptance Testing)
- **Test Cards:** Use PhonePe's test payment methods
- **Real Money:** No real money is charged in sandbox mode
- **Transaction Flow:** Complete payment flow simulation

### Test Payment Flow
1. **Create Payment:** Use any of the test HTML files
2. **Get Payment URL:** Copy the PhonePe payment URL from response
3. **Complete Payment:** Use PhonePe's test payment methods
4. **Check Status:** Verify payment status updates in database
5. **Webhook:** Automatic status updates via webhook

## 📊 Monitoring & Debugging

### Supabase Logs
- Go to Supabase Dashboard → Functions → Logs
- Monitor real-time function execution
- Debug any errors or issues

### Database Records
- Go to Supabase Dashboard → Table Editor → payments
- View all payment records and their status
- Monitor transaction updates

### Test Endpoints
```bash
# Test environment
curl https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/test-deno

# Create test payment
curl -X POST https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment-simple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"name":"Test","phone":"9876543210","amount":100}'
```

## 🚀 Production Deployment

### For Production Use:
1. **Update PhonePe Config:** Switch from sandbox to production
2. **Get Production Credentials:** From PhonePe merchant dashboard
3. **Update Environment Variables:** In Supabase project settings
4. **Test Thoroughly:** Before going live
5. **Monitor Transactions:** Set up proper logging and monitoring

### Production Environment Variables:
```env
PHONEPE_MERCHANT_ID=your_production_merchant_id
PHONEPE_CLIENT_SECRET=your_production_client_secret
# Update base URL to production PhonePe API
```

## 📞 Support

If you encounter any issues:
1. Check Supabase function logs
2. Verify environment variables are set
3. Ensure database table exists
4. Test with provided HTML files
5. Check PhonePe sandbox documentation

---

**🎉 Your PhonePe payment system is ready for deployment!**

All endpoints are live and configured for sandbox testing. Deploy to any static hosting service and start testing real payment flows immediately.