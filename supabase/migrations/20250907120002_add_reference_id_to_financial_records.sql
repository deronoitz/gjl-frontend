-- Add reference_id column to financial_records table for payment gateway tracking
ALTER TABLE financial_records 
ADD COLUMN reference_id TEXT;

-- Create index for reference_id for better performance
CREATE INDEX idx_financial_records_reference_id ON financial_records(reference_id);

-- Add comment to describe the column
COMMENT ON COLUMN financial_records.reference_id IS 'Reference ID from payment gateway for tracking payments';
