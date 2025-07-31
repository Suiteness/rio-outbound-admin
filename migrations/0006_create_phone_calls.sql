-- Migration number: 0006    2025-07-30T00:00:00.000Z
DROP TABLE IF EXISTS phone_calls;

CREATE TABLE phone_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    from_number VARCHAR(20) NOT NULL,
    agent_id VARCHAR(255),
    agent_template_id VARCHAR(255),
    initialization_values TEXT, -- JSON string
    gigaml_call_id VARCHAR(255), -- Call ID returned from GigaML
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, initiated, connected, completed, failed
    duration_seconds INTEGER,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_phone_calls_updated_at 
    AFTER UPDATE ON phone_calls
    BEGIN
        UPDATE phone_calls 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- Create index on customer_id for faster lookups
CREATE INDEX idx_phone_calls_customer_id ON phone_calls(customer_id);

-- Create index on status for filtering
CREATE INDEX idx_phone_calls_status ON phone_calls(status);
