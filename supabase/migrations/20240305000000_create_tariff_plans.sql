-- Create tariff_plans table
CREATE TABLE IF NOT EXISTS tariff_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    voice_minutes INTEGER NOT NULL DEFAULT 0,
    data_gb DECIMAL(10,2) NOT NULL DEFAULT 0,
    sms_count INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ALL',
    validity_days INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tariff_plans_updated_at
    BEFORE UPDATE ON tariff_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample tariff plans
INSERT INTO tariff_plans (name, description, voice_minutes, data_gb, sms_count, price, currency, validity_days) VALUES
    ('Basic Plan', 'Entry-level plan with basic features', 100, 2.0, 50, 1000.00, 'ALL', 30),
    ('Standard Plan', 'Popular plan with balanced features', 300, 5.0, 100, 2000.00, 'ALL', 30),
    ('Premium Plan', 'High-end plan with maximum features', 1000, 10.0, 200, 3500.00, 'ALL', 30),
    ('Business Plan', 'Enterprise plan for business users', 2000, 20.0, 500, 5000.00, 'ALL', 30),
    ('Data Focus Plan', 'Plan focused on data usage', 100, 15.0, 50, 2500.00, 'ALL', 30),
    ('Voice Focus Plan', 'Plan focused on voice calls', 2000, 2.0, 100, 3000.00, 'ALL', 30),
    ('SMS Focus Plan', 'Plan focused on SMS usage', 100, 2.0, 1000, 1500.00, 'ALL', 30),
    ('Unlimited Plan', 'Plan with unlimited features', 9999, 50.0, 9999, 8000.00, 'ALL', 30),
    ('Student Plan', 'Discounted plan for students', 200, 3.0, 50, 800.00, 'ALL', 30),
    ('Senior Plan', 'Discounted plan for senior citizens', 200, 2.0, 50, 700.00, 'ALL', 30); 