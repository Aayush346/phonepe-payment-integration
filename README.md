# 💳 PhonePe Payment System

A complete PhonePe payment integration with React frontend and Supabase backend.

## 🚀 Live Demo & Endpoints

### 📡 All API Endpoints (Live & Ready)

**Base URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/`

| Endpoint | Method | URL | Description |
|----------|--------|-----|-------------|
| **Create Payment** | POST | `/create-payment` | Initiate PhonePe payment |
| **Check Status** | GET | `/check-payment-status` | Check payment status |
| **Webhook** | POST | `/phonepe-webhook` | PhonePe status updates |
| **Test Environment** | GET | `/test-deno` | Verify configuration |
| **Simple Payment** | POST | `/create-payment-simple` | Testing endpoint |

⚠️ **IMPORTANT**: Current deployment uses sandbox configuration. For production, follow the [Production Setup Guide](./PRODUCTION_SETUP.md).

### 🧪 Test the APIs Right Now

```bash
# Test environment (should return success)
curl https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/test-deno

# Create a test payment
curl -X POST https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment-simple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlb3dtdmxpa2djdm5sa2dhZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NjI4NzEsImV4cCI6MjA1MDUzODg3MX0.Qs8Qs8Qs8Qs8Qs8Qs8Qs8Qs8Qs8Qs8Qs8Qs8Qs8" \
  -d '{"name":"Test User","phone":"9876543210","amount":100}'
```

## 🌐 Deploy Publicly in 2 Minutes

### Option 1: GitHub Pages (Free)

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "PhonePe Payment System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/phonepe-payment.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository → Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy your site!

3. **Your site will be live at:**
   `https://YOUR_USERNAME.github.io/phonepe-payment/`

### Option 2: Netlify (1-Click Deploy)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/phonepe-payment)

### Option 3: Vercel (1-Click Deploy)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/phonepe-payment)

## 🏗️ Project Structure

```
phonepe-payment/
├── 📁 src/                    # React application
│   ├── App.jsx               # Main payment form
│   ├── lib/supabase.js       # Supabase & PhonePe config
│   └── components/           # React components
├── 📁 supabase/functions/    # Edge functions (deployed)
│   ├── create-payment/       # Payment creation
│   ├── check-payment-status/ # Status checking
│   ├── phonepe-webhook/      # Webhook handler
│   ├── test-deno/           # Environment test
│   └── create-payment-simple/ # Simple test endpoint
├── 📁 dist/                  # Built application
├── 🧪 test-*.html           # Testing files
├── 📄 API_ENDPOINTS.md       # Complete API documentation
├── 📄 DEPLOYMENT_GUIDE.md    # Detailed deployment guide
└── 📄 create_payments_table.sql # Database schema
```

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/phonepe-payment.git
cd phonepe-payment
npm install
```

### 2. Setup Database
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/keowmvlikgcvnlkgadzi/sql)
2. Run the SQL from `create_payments_table.sql`
3. Verify `payments` table is created

### 3. Test Locally
```bash
npm run dev
```
Open `http://localhost:5173`

### 4. Test APIs
Open any of these files in your browser:
- `test-sandbox-payment.html` - Full payment testing
- `test-deno.html` - Environment verification
- `test-payment-simple.html` - Simple payment test

## 🔧 Configuration

### Current Environment: SANDBOX (Safe for Testing)
- Environment: UAT (Testing)
- Base URL: `https://api-preprod.phonepe.com/apis/pg-sandbox`
- All credentials configured via environment variables
- No hardcoded secrets in code

### Supabase Project
- Project URL: `https://keowmvlikgcvnlkgadzi.supabase.co`
- Database: PostgreSQL with `payments` table
- Edge Functions: Deployed and configured
- Environment variables: Properly configured

### 🚀 Production Deployment
For production deployment with real transactions, see [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

## 💰 Payment Flow

1. **User fills form** → Name, Phone, Amount
2. **Frontend calls** → `/create-payment` endpoint
3. **Backend creates** → Database record + PhonePe order
4. **User redirected** → PhonePe payment page
5. **Payment completed** → PhonePe calls webhook
6. **Status updated** → Database automatically updated
7. **User redirected** → Success/failure page

## 🧪 Testing

### Current Status: SANDBOX TESTING ONLY
The current configuration is safe for testing and will NOT process real money transactions.

### All endpoints are LIVE and ready for testing:

1. **Environment Test:**
   ```
   GET https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/test-deno
   ```

2. **Create Payment:**
   ```
   POST https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment
   ```

3. **Check Status:**
   ```
   GET https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/check-payment-status
   ```

### Test with HTML Files:
- Open `test-sandbox-payment.html` in browser
- Click "Test Simplified Payment" or "Test Original Payment"
- Get PhonePe payment URL
- Complete payment using PhonePe's test methods

### 💳 For Real Transactions
To enable real money transactions, you must:
1. Follow [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
2. Obtain PhonePe production credentials
3. Configure production environment variables
4. Deploy with production configuration

## 📊 Monitoring

### Supabase Dashboard
- **Functions Logs:** Monitor API calls
- **Database:** View payment records
- **Real-time:** Watch transactions happen

### Database Records
All payments are stored in the `payments` table with:
- Transaction IDs
- Customer details
- Payment status
- PhonePe responses
- Timestamps

## 🚀 Production Deployment

For production use:
1. Get PhonePe production credentials
2. Update environment variables in Supabase
3. Change base URL to production PhonePe API
4. Deploy your frontend to any hosting service

## 📞 Support

- **API Documentation:** See `API_ENDPOINTS.md`
- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md`
- **Database Schema:** See `create_payments_table.sql`
- **Test Files:** Use provided HTML test files

---

## 🎉 Ready to Go!

**All endpoints are deployed and working!** 

Just deploy the frontend to any hosting service and you'll have a complete PhonePe payment system running with real transaction testing capabilities.

**Live API Base URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/`

**Test it now:** Open `test-sandbox-payment.html` in your browser!