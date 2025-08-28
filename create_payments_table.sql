-- Create payments table for PhonePe payment system
-- Execute this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
    merchant_order_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    phonepe_status TEXT,
    phonepe_payment_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_merchant_order_id ON public.payments(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_phone ON public.payments(phone);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON public.payments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.payments
    FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON public.payments TO anon;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert a test record to verify table creation
INSERT INTO public.payments (name, phone, amount, merchant_order_id, user_id)
VALUES ('Test User', '9876543210', 100.00, 'TEST_ORDER_123', 'TEST_USER_123')
ON CONFLICT (merchant_order_id) DO NOTHING;

SELECT 'Payments table created successfully!' as message;