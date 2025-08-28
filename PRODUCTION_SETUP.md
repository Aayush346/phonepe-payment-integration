# Production Deployment Guide

## ⚠️ IMPORTANT: Pre-Deployment Checklist

Before deploying to production, ensure you have completed ALL the following steps:

### 1. PhonePe Account Setup
- [ ] Register for PhonePe Business Account
- [ ] Complete KYC verification
- [ ] Obtain production credentials:
  - Merchant ID
  - Client ID
  - Client Secret
- [ ] Configure webhook URLs in PhonePe dashboard
- [ ] Test in PhonePe UAT environment first

### 2. Supabase Configuration

#### Database Setup
1. Execute the SQL script in Supabase SQL Editor:
```sql
-- Copy and paste content from create_payments_table.sql
```

#### Environment Variables (Supabase Edge Functions)
Set these in your Supabase project settings > Edge Functions > Environment Variables:

```bash
# PhonePe Production Credentials
PHONEPE_MERCHANT_ID=your_production_merchant_id
PHONEPE_CLIENT_ID=your_production_client_id
PHONEPE_CLIENT_SECRET=your_production_client_secret
PHONEPE_CLIENT_VERSION=v2

# PhonePe URLs (Production)
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg
PHONEPE_CALLBACK_URL=https://your-supabase-project.supabase.co/functions/v1/phonepe-webhook
PHONEPE_REDIRECT_URL=https://your-domain.com/payment-status

# Supabase (Already configured)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Frontend Configuration

Create `.env.production` file:
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# PhonePe Production
VITE_PHONEPE_ENVIRONMENT=PRODUCTION
VITE_PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg
VITE_PHONEPE_CALLBACK_URL=https://your-supabase-project.supabase.co/functions/v1/phonepe-webhook
VITE_PHONEPE_REDIRECT_URL=https://your-domain.com/payment-status
```

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-payment
supabase functions deploy check-payment-status
supabase functions deploy phonepe-webhook
```

### 5. Deploy Frontend

#### Option A: Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
# Configure environment variables in Netlify dashboard
```

#### Option B: Vercel
```bash
npm run build
# Deploy using Vercel CLI or GitHub integration
# Configure environment variables in Vercel dashboard
```

#### Option C: GitHub Pages
```bash
# Push to GitHub
# Enable GitHub Pages in repository settings
# GitHub Actions will auto-deploy
```

## 🧪 Testing Production Setup

### 1. Test API Endpoints
```bash
# Test payment creation
curl -X POST https://your-supabase-project.supabase.co/functions/v1/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{"name":"Test User","phone":"9999999999","amount":100}'
```

### 2. Test Payment Flow
1. Visit your deployed frontend
2. Fill payment form with test data
3. Verify PhonePe redirect works
4. Check webhook receives callbacks
5. Verify database updates

### 3. Monitor Logs
- Supabase Edge Functions logs
- PhonePe webhook logs
- Frontend console errors

## 🔒 Security Checklist

- [ ] All secrets stored as environment variables
- [ ] No hardcoded credentials in code
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Database RLS policies enabled
- [ ] Webhook signature verification enabled

## 📊 Monitoring

### Key Metrics to Monitor
- Payment success rate
- Webhook delivery success
- API response times
- Database performance
- Error rates

### Recommended Tools
- Supabase Dashboard (built-in monitoring)
- PhonePe Merchant Dashboard
- Frontend error tracking (Sentry, LogRocket)

## 🚨 Troubleshooting

### Common Issues

1. **Payment Creation Fails**
   - Check PhonePe credentials
   - Verify merchant ID format
   - Check API endpoint URLs

2. **Webhook Not Receiving Callbacks**
   - Verify webhook URL in PhonePe dashboard
   - Check Supabase function logs
   - Ensure HTTPS is enabled

3. **Database Errors**
   - Verify table exists
   - Check RLS policies
   - Validate service role key

4. **Frontend Issues**
   - Check environment variables
   - Verify Supabase configuration
   - Check CORS settings

## 📞 Support

- PhonePe Support: [PhonePe Developer Portal](https://developer.phonepe.com/)
- Supabase Support: [Supabase Documentation](https://supabase.com/docs)
- Project Issues: Create GitHub issue

---

**⚠️ CRITICAL**: Never deploy to production without testing in PhonePe UAT environment first!

**🔐 SECURITY**: Always use environment variables for sensitive data. Never commit secrets to version control.