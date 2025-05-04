-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'ssr', 'smea', 'user');
CREATE TYPE alert_type AS ENUM ('usage_limit', 'monthly_fee');
CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'resolved');
CREATE TYPE order_type AS ENUM ('plan_change', 'package_activation', 'limit_change');
CREATE TYPE order_status AS ENUM ('created', 'pending', 'in_progress', 'completed', 'failed');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive');

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contract_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  role user_role NOT NULL,
  company_id UUID REFERENCES companies(id),
  password TEXT NOT NULL,
  otp TEXT,
  otp_expiry TIMESTAMP WITH TIME ZONE,
  status user_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tariff_plans table
CREATE TABLE tariff_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL,
  voice_minutes JSONB NOT NULL,
  sms INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create msisdns table
CREATE TABLE msisdns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  base_plan_id UUID NOT NULL REFERENCES tariff_plans(id),
  usage_limit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage table
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  msisdn_id UUID NOT NULL REFERENCES msisdns(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  voice JSONB NOT NULL,
  sms INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  msisdn_id UUID NOT NULL REFERENCES msisdns(id),
  type alert_type NOT NULL,
  threshold DECIMAL(5,2) NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status alert_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  type order_type NOT NULL,
  status order_status DEFAULT 'created',
  details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE msisdns ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Companies are insertable by admin" ON companies
  FOR INSERT WITH CHECK (auth.role() = 'admin');

-- Users policies
CREATE POLICY "Users are viewable by company members" ON users
  FOR SELECT USING (
    auth.uid() = id OR
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users are insertable by admin" ON users
  FOR INSERT WITH CHECK (auth.role() = 'admin');

-- MSISDNs policies
CREATE POLICY "MSISDNs are viewable by company members" ON msisdns
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "MSISDNs are insertable by admin" ON msisdns
  FOR INSERT WITH CHECK (auth.role() = 'admin');

-- Usage policies
CREATE POLICY "Usage is viewable by company members" ON usage
  FOR SELECT USING (
    msisdn_id IN (
      SELECT id FROM msisdns WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Alerts policies
CREATE POLICY "Alerts are viewable by company members" ON alerts
  FOR SELECT USING (
    msisdn_id IN (
      SELECT id FROM msisdns WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Alerts are insertable by company admins" ON alerts
  FOR INSERT WITH CHECK (
    msisdn_id IN (
      SELECT id FROM msisdns WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Orders policies
CREATE POLICY "Orders are viewable by company members" ON orders
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Orders are insertable by company admins" ON orders
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_msisdns_company_id ON msisdns(company_id);
CREATE INDEX idx_msisdns_user_id ON msisdns(user_id);
CREATE INDEX idx_usage_msisdn_id ON usage(msisdn_id);
CREATE INDEX idx_alerts_msisdn_id ON alerts(msisdn_id);
CREATE INDEX idx_orders_company_id ON orders(company_id); 
