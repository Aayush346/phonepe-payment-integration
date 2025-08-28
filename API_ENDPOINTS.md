# PhonePe Payment System - API Endpoints

## Deployed Supabase Edge Functions

All endpoints are deployed to Supabase project: `keowmvlikgcvnlkgadzi`

Base URL: `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/`

### 1. Create Payment
**Endpoint:** `POST /create-payment`
**URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay/...",
  "merchantTransactionId": "TXN_123456789",
  "phonePeResponse": {
    "success": true,
    "code": "PAYMENT_INITIATED",
    "message": "Payment initiated",
    "data": {
      "merchantId": "PGTESTPAYUAT",
      "merchantTransactionId": "TXN_123456789",
      "instrumentResponse": {
        "type": "PAY_PAGE",
        "redirectInfo": {
          "url": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay/...",
          "method": "GET"
        }
      }
    }
  }
}
```

### 2. Check Payment Status
**Endpoint:** `GET /check-payment-status`
**URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/check-payment-status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

**Query Parameters:**
- `merchantTransactionId`: The transaction ID to check

**Example:**
`https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/check-payment-status?merchantTransactionId=TXN_123456789`

**Response:**
```json
{
  "success": true,
  "status": "PAYMENT_SUCCESS",
  "phonePeResponse": {
    "success": true,
    "code": "PAYMENT_SUCCESS",
    "message": "Your payment is successful.",
    "data": {
      "merchantId": "PGTESTPAYUAT",
      "merchantTransactionId": "TXN_123456789",
      "transactionId": "T2411281404393742586710",
      "amount": 10000,
      "state": "COMPLETED",
      "responseCode": "SUCCESS",
      "paymentInstrument": {
        "type": "UPI",
        "utr": "441228140439"
      }
    }
  }
}
```

### 3. PhonePe Webhook
**Endpoint:** `POST /phonepe-webhook`
**URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/phonepe-webhook`

**Description:** This endpoint receives webhook notifications from PhonePe when payment status changes.

**Headers:**
```
Content-Type: application/json
X-VERIFY: SHA256_HASH_OF_PAYLOAD
```

**Request Body:**
```json
{
  "response": "BASE64_ENCODED_RESPONSE"
}
```

### 4. Test Deno Environment
**Endpoint:** `GET /test-deno`
**URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/test-deno`

**Description:** Tests if all environment variables are properly configured.

**Response:**
```json
{
  "message": "Deno environment test successful",
  "environment": {
    "SUPABASE_URL": "configured",
    "SUPABASE_SERVICE_ROLE_KEY": "configured",
    "PHONEPE_MERCHANT_ID": "configured",
    "PHONEPE_CLIENT_SECRET": "configured"
  },
  "timestamp": "2024-01-27T10:30:00.000Z"
}
```

### 5. Create Payment Simple (Testing)
**Endpoint:** `POST /create-payment-simple`
**URL:** `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment-simple`

**Description:** Simplified version for testing without database operations.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

**Request Body:**
```json
{
  "name": "Test User",
  "phone": "9876543210",
  "amount": 100
}
```

## Environment Configuration

### PhonePe Sandbox Configuration
- **Environment:** UAT (User Acceptance Testing)
- **Merchant ID:** PGTESTPAYUAT
- **Client ID:** PGTESTPAYUAT
- **Base URL:** https://api-preprod.phonepe.com/apis/pg-sandbox
- **Callback URL:** https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/phonepe-webhook
- **Redirect URL:** http://localhost:5173/payment-success

### Required Environment Variables
```
SUPABASE_URL=https://keowmvlikgcvnlkgadzi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_CLIENT_SECRET=your_client_secret
```

## Database Schema

### Payments Table
The `payments` table stores all payment records:

```sql
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_transaction_id TEXT UNIQUE NOT NULL,
    phonepe_transaction_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING',
    phonepe_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing Files

1. **test-sandbox-payment.html** - Test both simplified and original payment functions
2. **test-original-payment.html** - Test the original payment function
3. **test-payment-simple.html** - Test the simplified payment function
4. **test-deno.html** - Test Deno environment configuration

## Usage Examples

### JavaScript/Fetch Example
```javascript
// Create Payment
const response = await fetch('https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/create-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
  },
  body: JSON.stringify({
    name: 'John Doe',
    phone: '9876543210',
    amount: 100
  })
});

const data = await response.json();
if (data.success) {
  // Redirect user to payment URL
  window.location.href = data.paymentUrl;
}
```

### Check Payment Status
```javascript
const statusResponse = await fetch(
  `https://keowmvlikgcvnlkgadzi.supabase.co/functions/v1/check-payment-status?merchantTransactionId=${transactionId}`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
    }
  }
);

const statusData = await statusResponse.json();
console.log('Payment Status:', statusData.status);
```

## Notes

- All endpoints are currently configured for PhonePe's sandbox environment
- For production use, update the configuration to use production credentials
- The webhook endpoint automatically updates payment status in the database
- All amounts are in paisa (₹1 = 100 paisa)
- Transaction IDs are automatically generated with timestamp prefix