-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_created_at ON logs(created_at);

-- Enable RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Logs are viewable by admin" ON logs
  FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Logs are insertable by admin" ON logs
  FOR INSERT WITH CHECK (auth.role() = 'admin'); 
