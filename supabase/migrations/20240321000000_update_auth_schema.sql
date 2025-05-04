-- Enable phone auth
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS otp_secret TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS otp_enabled BOOLEAN DEFAULT false;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS auth.otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Create SME CDR data table
CREATE TABLE IF NOT EXISTS public.sme_cdr_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    msisdn TEXT NOT NULL,
    call_date TIMESTAMP WITH TIME ZONE NOT NULL,
    call_duration INTEGER NOT NULL,
    call_type TEXT NOT NULL,
    call_direction TEXT NOT NULL,
    call_cost DECIMAL(10,2) NOT NULL,
    call_location TEXT,
    call_network TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.sme_cdr_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own CDR data"
    ON public.sme_cdr_data
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE phone = msisdn
    ));

-- Create function to handle phone verification
CREATE OR REPLACE FUNCTION public.handle_phone_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone_confirmed_at IS NULL THEN
        -- Generate OTP
        INSERT INTO auth.otp_verifications (user_id, phone, code, expires_at)
        VALUES (
            NEW.id,
            NEW.phone,
            LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
            NOW() + INTERVAL '5 minutes'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for phone verification
DROP TRIGGER IF EXISTS on_phone_change ON auth.users;
CREATE TRIGGER on_phone_change
    AFTER INSERT OR UPDATE OF phone ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_phone_verification(); 