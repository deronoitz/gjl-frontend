-- Create function to automatically expire pending payments older than 1 day
CREATE OR REPLACE FUNCTION expire_old_pending_payments()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update pending payments older than 1 day to expired status
    WITH updated_rows AS (
        UPDATE financial_records 
        SET 
            status = 'expired',
            updated_at = NOW()
        WHERE 
            status = 'pending' 
            AND created_at < (NOW() - INTERVAL '1 day')
        RETURNING id
    )
    SELECT COUNT(*) INTO expired_count FROM updated_rows;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function that runs the expiration check
CREATE OR REPLACE FUNCTION trigger_expire_old_pending_payments()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM expire_old_pending_payments();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job using pg_cron (if available) to run daily
-- This requires the pg_cron extension to be enabled
-- Uncomment the lines below if you want to use pg_cron:

-- SELECT cron.schedule('expire-old-payments', '0 0 * * *', 'SELECT expire_old_pending_payments();');

-- Alternative: You can also call this function manually or from your application
-- For example, you could call it periodically from your API or set up a webhook

-- Add comment to describe the function
COMMENT ON FUNCTION expire_old_pending_payments() IS 'Automatically expires pending payments older than 1 day. Returns the number of records updated.';
COMMENT ON FUNCTION trigger_expire_old_pending_payments() IS 'Trigger function to run payment expiration check';
