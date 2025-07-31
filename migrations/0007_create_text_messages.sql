-- Migration number: 0007    2025-07-30T00:00:00.000Z
DROP TABLE IF EXISTS text_messages;

CREATE TABLE text_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    from_number VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    agent_id VARCHAR(255),
    agent_template_id VARCHAR(255),
    initialization_values TEXT, -- JSON string
    gigaml_message_id VARCHAR(255), -- Message ID returned from GigaML (if available)
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, delivered, failed
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_text_messages_updated_at 
    AFTER UPDATE ON text_messages
    BEGIN
        UPDATE text_messages 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- Create index on customer_id for faster lookups
CREATE INDEX idx_text_messages_customer_id ON text_messages(customer_id);

-- Create index on status for filtering
CREATE INDEX idx_text_messages_status ON text_messages(status);
