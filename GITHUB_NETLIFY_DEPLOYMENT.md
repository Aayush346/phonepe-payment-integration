# 🚀 GitHub + Netlify Deployment Guide

This guide will help you deploy your PhonePe payment integration to GitHub and host it on Netlify.

## 📋 Prerequisites

- GitHub account
- Netlify account
- PhonePe production credentials
- Supabase project setup

## 🔧 Step 1: Prepare for GitHub

### 1.1 Initialize Git Repository (if not already done)
```bash
cd D:\pay\phonepe-payment
git init
git add .
git commit -m "Initial commit: PhonePe payment integration"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `phonepe-payment-integration` or similar
3. Don't initialize with README (we already have files)
4. Copy the repository URL

### 1.3 Connect Local to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy to Netlify

### 2.1 Connect GitHub to Netlify
1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 2.2 Environment Variables in Netlify
Go to Site Settings → Environment Variables and add:

```env
# Required Frontend Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_PHONEPE_MERCHANT_ID=your_production_merchant_id
VITE_PHONEPE_CLIENT_ID=your_production_client_id
```

### 2.3 Deploy
Click "Deploy site" - Netlify will automatically build and deploy your app!

## 🔐 Step 3: Supabase Configuration

### 3.1 Deploy Edge Functions
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all functions
supabase functions deploy phonepe-auth
supabase functions deploy create-payment
supabase functions deploy create-payment-simple
supabase functions deploy check-payment-status
supabase functions deploy phonepe-webhook
```

### 3.2 Set Supabase Secrets
```bash
# PhonePe Production Configuration
supabase secrets set PHONEPE_PRODUCTION_BASE_URL=https://api.phonepe.com/apis/hermes
supabase secrets set PHONEPE_AUTH_BASE_URL=https://api.phonepe.com/apis/pg-sandbox/oauth
supabase secrets set PHONEPE_MERCHANT_ID=your_production_merchant_id
supabase secrets set PHONEPE_CLIENT_ID=your_production_client_id
supabase secrets set PHONEPE_CLIENT_SECRET=your_production_client_secret
supabase secrets set PHONEPE_SALT_KEY=your_production_salt_key
supabase secrets set PHONEPE_SALT_INDEX=your_production_salt_index
```

### 3.3 Database Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `create_payments_table.sql`
3. Verify the `payments` table is created

### 3.4 Configure CORS
1. Go to Supabase Dashboard → Settings → API
2. Add your Netlify domain to CORS origins:
   ```
   https://your-app-name.netlify.app
   ```

## 🎯 Step 4: Update Webhook URLs

### 4.1 Get Your Netlify URL
After deployment, note your Netlify URL: `https://your-app-name.netlify.app`

### 4.2 Update PhonePe Webhook Configuration
1. Log in to PhonePe Merchant Dashboard
2. Update webhook URL to:
   ```
   https://your-supabase-project.supabase.co/functions/v1/phonepe-webhook
   ```

### 4.3 Update Redirect URLs
Update success/failure redirect URLs in your PhonePe configuration:
- Success: `https://your-app-name.netlify.app/success`
- Failure: `https://your-app-name.netlify.app/failure`

## ✅ Step 5: Testing

### 5.1 Test Frontend
1. Visit your Netlify URL
2. Try creating a test payment
3. Verify the payment flow works

### 5.2 Test Edge Functions
```bash
# Test OAuth function
curl -X POST https://your-project.supabase.co/functions/v1/phonepe-auth \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "status"}'

# Test payment creation
curl -X POST https://your-project.supabase.co/functions/v1/create-payment-simple \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "9999999999",
    "amount": 100
  }'
```

## 🔄 Step 6: Continuous Deployment

Netlify automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update payment flow"
git push origin main
# Netlify will automatically rebuild and deploy!
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails on Netlify**
   - Check environment variables are set
   - Verify Node.js version (should be 18)
   - Check build logs for specific errors

2. **CORS Errors**
   - Add Netlify domain to Supabase CORS settings
   - Verify environment variables are correct

3. **Payment Fails**
   - Check Supabase Edge Function logs
   - Verify PhonePe credentials are production-ready
   - Test OAuth token generation

4. **Webhook Not Working**
   - Verify webhook URL in PhonePe dashboard
   - Check Supabase function logs
   - Test webhook signature verification

### Debug Commands:

```bash
# Check Supabase function logs
supabase functions logs phonepe-auth
supabase functions logs create-payment

# Test local development
npm run dev

# Check build locally
npm run build
npm run preview
```

## 📊 Monitoring

### Netlify Analytics
- Monitor site performance
- Track deployment history
- View build logs

### Supabase Monitoring
- Check Edge Function logs
- Monitor database queries
- Track API usage

### PhonePe Dashboard
- Monitor transaction status
- Check webhook delivery
- View payment analytics

## 🎉 Success!

Your PhonePe payment integration is now:
- ✅ Hosted on GitHub
- ✅ Deployed on Netlify
- ✅ Production-ready with OAuth
- ✅ Automatically deploying on code changes

**Live URL**: `https://your-app-name.netlify.app`

---

**Need help?** Check the other documentation files or review the deployment logs for specific error messages.