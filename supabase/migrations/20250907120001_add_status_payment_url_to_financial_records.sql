-- Add status and payment_url columns to financial_records table

-- Add status column with enum values: pending, done, expired
ALTER TABLE financial_records 
ADD COLUMN status TEXT NOT NULL DEFAULT 'done' CHECK (status IN ('pending', 'done', 'expired'));

-- Add payment_url column for payment links
ALTER TABLE financial_records 
ADD COLUMN payment_url TEXT;

-- Create index for status column for better performance
CREATE INDEX idx_financial_records_status ON financial_records(status);

-- Add comment to describe the columns
COMMENT ON COLUMN financial_records.status IS 'Payment status: pending (awaiting payment), done (payment completed - default for manual input), expired (payment expired)';
COMMENT ON COLUMN financial_records.payment_url IS 'URL for payment processing (e.g., payment gateway link)';
