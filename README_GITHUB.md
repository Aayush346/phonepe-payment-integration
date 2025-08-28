# PhonePe Payment Integration - Production Ready

🚀 **Complete PhonePe payment integration with React + Vite frontend and Supabase Edge Functions backend, featuring OAuth 2.0 authentication for production use.**

## 🌟 Features

- ✅ **Production-Ready PhonePe Integration** with OAuth 2.0
- ✅ **React + Vite** frontend with modern UI
- ✅ **Supabase Edge Functions** for secure backend operations
- ✅ **Automatic Token Management** with refresh mechanism
- ✅ **Webhook Handling** for payment status updates
- ✅ **Database Integration** for payment tracking
- ✅ **Mobile-Responsive** design

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│  Supabase Edge   │───▶│   PhonePe API   │
│   (Frontend)    │    │   Functions      │    │  (Production)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Supabase DB    │
                       │   (Payments)     │
                       └──────────────────┘
```

## 🚀 Quick Deploy to Netlify

### 1. Fork this Repository
Click the "Fork" button to create your own copy.

### 2. Environment Variables
Set these in Netlify's environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# PhonePe Configuration
VITE_PHONEPE_MERCHANT_ID=your_production_merchant_id
VITE_PHONEPE_CLIENT_ID=your_production_client_id
```

### 3. Supabase Setup

#### Deploy Edge Functions:
```bash
npx supabase functions deploy phonepe-auth
npx supabase functions deploy create-payment
npx supabase functions deploy create-payment-simple
npx supabase functions deploy check-payment-status
npx supabase functions deploy phonepe-webhook
```

#### Set Supabase Secrets:
```bash
npx supabase secrets set PHONEPE_PRODUCTION_BASE_URL=https://api.phonepe.com/apis/hermes
npx supabase secrets set PHONEPE_AUTH_BASE_URL=https://api.phonepe.com/apis/pg-sandbox/oauth
npx supabase secrets set PHONEPE_MERCHANT_ID=your_production_merchant_id
npx supabase secrets set PHONEPE_CLIENT_ID=your_production_client_id
npx supabase secrets set PHONEPE_CLIENT_SECRET=your_production_client_secret
npx supabase secrets set PHONEPE_SALT_KEY=your_production_salt_key
npx supabase secrets set PHONEPE_SALT_INDEX=your_production_salt_index
```

#### Create Database Table:
Run the SQL in `create_payments_table.sql` in your Supabase SQL editor.

### 4. Netlify Deployment

1. **Connect Repository**: Link your forked repo to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Add the variables from step 2
4. **Deploy**: Click deploy!

## 📁 Project Structure

```
phonepe-payment/
├── src/                          # React frontend
│   ├── components/               # UI components
│   ├── lib/supabase.js          # Supabase client
│   └── App.jsx                  # Main app
├── supabase/functions/          # Edge functions
│   ├── phonepe-auth/            # OAuth token management
│   ├── create-payment/          # Payment initiation
│   ├── create-payment-simple/   # Simple payment flow
│   ├── check-payment-status/    # Status checking
│   └── phonepe-webhook/         # Webhook handler
├── dist/                        # Built files (auto-generated)
└── docs/                        # Documentation
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- Supabase CLI
- PhonePe Production Credentials

### Setup

1. **Clone & Install**:
```bash
git clone <your-repo-url>
cd phonepe-payment
npm install
```

2. **Environment Setup**:
Copy `.env.example` to `.env` and fill in your values.

3. **Start Development**:
```bash
npm run dev
```

4. **Start Supabase** (if testing locally):
```bash
npx supabase start
```

## 🔐 Security Features

- ✅ **OAuth 2.0 Authentication** with automatic token refresh
- ✅ **Environment Variables** for sensitive data
- ✅ **Webhook Signature Verification**
- ✅ **CORS Protection**
- ✅ **Input Validation**
- ✅ **Error Handling**

## 📊 Payment Flow

1. **User Input**: Customer enters payment details
2. **Payment Creation**: Frontend calls Supabase Edge Function
3. **OAuth Token**: Function gets fresh token from PhonePe
4. **PhonePe API**: Secure API call with OAuth token
5. **Redirect**: User redirected to PhonePe payment page
6. **Webhook**: PhonePe sends status updates
7. **Database Update**: Payment status updated in Supabase

## 🛠️ API Endpoints

| Function | Purpose | Method |
|----------|---------|--------|
| `phonepe-auth` | OAuth token management | POST |
| `create-payment` | Full payment creation | POST |
| `create-payment-simple` | Simple payment flow | POST |
| `check-payment-status` | Status checking | POST |
| `phonepe-webhook` | Webhook handling | POST |

## 📚 Documentation

- [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md) - Environment configuration
- [`PRODUCTION_READY_SUMMARY.md`](./PRODUCTION_READY_SUMMARY.md) - Production deployment guide
- [`API_ENDPOINTS.md`](./API_ENDPOINTS.md) - API documentation

## 🐛 Troubleshooting

### Common Issues:

1. **OAuth Token Errors**: Check your client credentials
2. **CORS Issues**: Verify your domain in Supabase settings
3. **Webhook Failures**: Check signature verification
4. **Build Errors**: Ensure all environment variables are set

### Support:
- Check the documentation files
- Review Supabase Edge Function logs
- Verify PhonePe API credentials

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Ready to deploy?** Just fork this repo and follow the Netlify deployment steps above! 🚀