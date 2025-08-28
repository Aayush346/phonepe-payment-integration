-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  merchant_order_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  phonepe_status TEXT,
  phonepe_transaction_id TEXT,
  phonepe_response_code TEXT,
  phonepe_payment_response JSONB,
  phonepe_webhook_response JSONB,
  phonepe_webhook_event JSONB,
  webhook_received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_merchant_order_id ON payments(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON payments
  FOR ALL USING (true);

-- Create policy to allow all operations for service role
CREATE POLICY "Allow all operations for service role" ON payments
  FOR ALL USING (auth.role() = 'service_role');