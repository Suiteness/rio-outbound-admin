-- Migration number: 0004    2025-07-30T00:00:00.000Z
-- Update customers table to new schema requirements

-- First, create the new table with updated structure
CREATE TABLE customers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phoneNumber VARCHAR(255),
    playerId INTEGER,
    playerTier VARCHAR(255),
    optPhone BOOLEAN NOT NULL DEFAULT 0,
    optText BOOLEAN NOT NULL DEFAULT 0,
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data, splitting name into firstName/lastName
-- Note: This assumes names are in "FirstName LastName" format
INSERT INTO customers_new (
    id, 
    firstName, 
    lastName, 
    email, 
    phoneNumber,
    playerId,
    playerTier,
    optPhone,
    optText,
    notes, 
    created_at, 
    updated_at
)
SELECT 
    id,
    CASE 
        WHEN instr(name, ' ') > 0 THEN substr(name, 1, instr(name, ' ') - 1)
        ELSE name
    END as firstName,
    CASE 
        WHEN instr(name, ' ') > 0 THEN substr(name, instr(name, ' ') + 1)
        ELSE ''
    END as lastName,
    email,
    NULL as phoneNumber,
    NULL as playerId,
    NULL as playerTier,
    0 as optPhone,
    0 as optText,
    notes,
    created_at,
    updated_at
FROM customers;

-- Drop the old table
DROP TABLE customers;

-- Rename the new table
ALTER TABLE customers_new RENAME TO customers;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at 
    AFTER UPDATE ON customers
    BEGIN
        UPDATE customers 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
