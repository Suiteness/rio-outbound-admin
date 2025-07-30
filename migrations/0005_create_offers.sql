-- Migration number: 0005    2025-07-30T00:00:00.000Z
DROP TABLE IF EXISTS customer_subscriptions;
DROP TABLE IF EXISTS subscription_features;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS features;

-- Create offers table
CREATE TABLE offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    hotel_offer TEXT,
    food_offer TEXT,
    bonus_play_offer TEXT,
    offer_start_date DATE NOT NULL,
    offer_end_date DATE NOT NULL,
    validity_start_date DATE NOT NULL,
    validity_end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_offers_customer_id ON offers(customer_id);
CREATE INDEX idx_offers_offer_start_date ON offers(offer_start_date);
CREATE INDEX idx_offers_offer_end_date ON offers(offer_end_date);
CREATE INDEX idx_offers_validity_start_date ON offers(validity_start_date);
CREATE INDEX idx_offers_validity_end_date ON offers(validity_end_date);

-- Create trigger for updated_at
CREATE TRIGGER update_offers_updated_at 
    AFTER UPDATE ON offers
    BEGIN
        UPDATE offers 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
