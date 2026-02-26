
-- Add E-commerce Configuration Keys
INSERT INTO site_settings (key, value, type) VALUES
('checkout_mode', 'whatsapp', 'text'), -- 'whatsapp' or 'direct'
('accepted_payment_methods', 'cash_on_delivery,transfer', 'text'), -- comma separated
('direct_payment_api_key', '', 'text')
ON CONFLICT (key) DO NOTHING;
