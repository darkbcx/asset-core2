-- AssetCore Database Seed Data
-- Initial Sample Data
-- Version: 1.0.0

-- Note: This seed file includes hashed passwords for testing
-- Default password for all test users: "Password123!"

-- ============================================
-- Seed Data Configuration
-- ============================================

SET @old_sql_mode = @@sql_mode;
SET sql_mode = '';

-- Helper function to convert UUID to BINARY
SET @uuid_to_bin_fn = '
CREATE FUNCTION IF NOT EXISTS UUID_TO_BIN(uuid CHAR(36)) RETURNS BINARY(16)
RETURN UNHEX(REPLACE(uuid, ''-'', ''''))
';

-- ============================================
-- Companies (Tenants)
-- ============================================

-- Company 1: Acme Aviation Corporation
INSERT INTO companies (id, name, slug, settings, subscription_plan, is_active) VALUES
(UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), 'Acme Aviation Corporation', 'acme-aviation', '{"timezone": "UTC", "locale": "en-US"}', 'professional', TRUE);

-- Company 2: Global Logistics Ltd
INSERT INTO companies (id, name, slug, settings, subscription_plan, is_active) VALUES
(UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440001'), 'Global Logistics Ltd', 'global-logistics', '{"timezone": "America/New_York", "locale": "en-US"}', 'enterprise', TRUE);

-- ============================================
-- Users
-- ============================================

-- System Administrator
INSERT INTO users (id, user_type, system_role, system_permissions, email, first_name, last_name, password_hash, is_active) VALUES
(UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440000'), 'system_admin', 'super_admin', '{"permissions": ["*:*"]}', 'admin@assetcore.com', 'System', 'Administrator', '$2a$10$rXKQaLzKLlZxPqQ.xPqQpefPqQxPqQxPqQxPqQxPqQxPqQxPqQxy', TRUE);

-- Company Admin for Acme
INSERT INTO users (id, user_type, email, first_name, last_name, password_hash, is_active) VALUES
(UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440001'), 'tenant', 'john.doe@acme.com', 'John', 'Doe', '$2a$10$rXKQaLzKLlZxPqQ.xPqQpefPqQxPqQxPqQxPqQxPqQxPqQxPqQxy', TRUE);

-- Asset Manager for Acme
INSERT INTO users (id, user_type, email, first_name, last_name, password_hash, is_active) VALUES
(UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440002'), 'tenant', 'jane.smith@acme.com', 'Jane', 'Smith', '$2a$10$rXKQaLzKLlZxPqQ.xPqQpefPqQxPqQxPqQxPqQxPqQxPqQxPqQxy', TRUE);

-- Maintenance Technician for Acme
INSERT INTO users (id, user_type, email, first_name, last_name, password_hash, is_active) VALUES
(UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440003'), 'tenant', 'mike.johnson@acme.com', 'Mike', 'Johnson', '$2a$10$rXKQaLzKLlZxPqQ.xPqQpefPqQxPqQxPqQxPqQxPqQxPqQxPqQxy', TRUE);

-- Company Admin for Global Logistics
INSERT INTO users (id, user_type, email, first_name, last_name, password_hash, is_active) VALUES
(UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440004'), 'tenant', 'sarah.lee@globallogistics.com', 'Sarah', 'Lee', '$2a$10$rXKQaLzKLlZxPqQ.xPqQpefPqQxPqQxPqQxPqQxPqQxPqQxPqQxy', TRUE);

-- ============================================
-- UserCompany (User-Company Associations)
-- ============================================

-- Acme users
INSERT INTO user_companies (id, user_id, company_id, role, permissions, is_primary) VALUES
(UUID_TO_BIN('750e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440001'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), 'company_admin', '{"assets": {"*": true}, "users": {"*": true}, "reports": {"*": true}}', TRUE),
(UUID_TO_BIN('750e8400-e29b-41d4-a716-446655440001'), UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440002'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), 'asset_manager', '{"assets": {"create": true, "read": true, "update": true}, "maintenance": {"create": true, "read": true, "update": true}}', FALSE),
(UUID_TO_BIN('750e8400-e29b-41d4-a716-446655440002'), UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440003'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), 'maintenance_technician', '{"maintenance": {"create": true, "read": true, "update": true}, "assets": {"read": true}}', FALSE);

-- Global Logistics users
INSERT INTO user_companies (id, user_id, company_id, role, permissions, is_primary) VALUES
(UUID_TO_BIN('750e8400-e29b-41d4-a716-446655440003'), UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440004'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440001'), 'company_admin', '{"assets": {"*": true}, "users": {"*": true}, "reports": {"*": true}}', TRUE);

-- ============================================
-- Locations
-- ============================================

-- Acme locations
INSERT INTO locations (id, company_id, parent_id, name, type, address, is_active) VALUES
(UUID_TO_BIN('850e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), NULL, 'Main Hangar', 'site', '123 Airport Blvd, Los Angeles, CA', TRUE),
(UUID_TO_BIN('850e8400-e29b-41d4-a716-446655440001'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('850e8400-e29b-41d4-a716-446655440000'), 'Hangar A', 'building', NULL, TRUE),
(UUID_TO_BIN('850e8400-e29b-41d4-a716-446655440002'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('850e8400-e29b-41d4-a716-446655440001'), 'Maintenance Bay 1', 'room', NULL, TRUE);

-- ============================================
-- Assets
-- ============================================

-- Acme assets
INSERT INTO assets (id, company_id, asset_code, name, type, model, serial_number, status, location_id, purchase_date, purchase_cost) VALUES
(UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), 'ACME-A001', 'Boeing 737-800', 'aircraft', 'Boeing 737-800', 'N737AC', 'operational', UUID_TO_BIN('850e8400-e29b-41d4-a716-446655440002'), '2020-01-15', 85000000.00),
(UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440001'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), 'ACME-V001', 'Ground Support Vehicle', 'vehicle', 'Ford F-750', 'GSV-12345', 'operational', UUID_TO_BIN('850e8400-e29b-41d4-a716-446655440001'), '2021-03-20', 150000.00);

-- ============================================
-- Components
-- ============================================

-- Components for Boeing 737-800
INSERT INTO components (id, asset_id, component_code, name, type, serial_number, part_number, manufacturer, position, status, installation_date, purchase_cost) VALUES
(UUID_TO_BIN('a50e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440000'), 'ENG-001', 'CFM56-7B Engine', 'engine', 'ENG-2020-001', 'CFM56-7B24', 'CFM International', 'left', 'installed', '2020-01-15', 12000000.00),
(UUID_TO_BIN('a50e8400-e29b-41d4-a716-446655440001'), UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440000'), 'ENG-002', 'CFM56-7B Engine', 'engine', 'ENG-2020-002', 'CFM56-7B24', 'CFM International', 'right', 'installed', '2020-01-15', 12000000.00),
(UUID_TO_BIN('a50e8400-e29b-41d4-a716-446655440002'), UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440000'), 'AVI-001', 'Garmin GNS 530W', 'avionics', 'AVI-2020-001', 'GNS 530W', 'Garmin', 'cockpit', 'installed', '2020-01-15', 15000.00);

-- Components for Ground Support Vehicle
INSERT INTO components (id, asset_id, component_code, name, type, serial_number, manufacturer, position, status, installation_date, purchase_cost) VALUES
(UUID_TO_BIN('a50e8400-e29b-41d4-a716-446655440003'), UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440001'), 'ENG-GSV-001', 'Caterpillar C7 Engine', 'engine', 'CAT-ENG-001', 'Caterpillar', 'front', 'installed', '2021-03-20', 25000.00);

-- ============================================
-- Maintenance Records
-- ============================================

-- Scheduled maintenance for left engine
INSERT INTO maintenance_records (id, component_id, assigned_technician_id, title, description, maintenance_type, priority, status, reported_date, scheduled_date, estimated_duration, notes) VALUES
(UUID_TO_BIN('b50e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('a50e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440003'), 'Routine Engine Inspection', 'Quarterly engine inspection and oil change', 'scheduled', 'medium', 'scheduled', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 180, 'Standard quarterly maintenance per manufacturer recommendations');

-- On-demand maintenance for right engine
INSERT INTO maintenance_records (id, component_id, assigned_technician_id, title, description, maintenance_type, priority, status, reported_date, estimated_duration, notes) VALUES
(UUID_TO_BIN('b50e8400-e29b-41d4-a716-446655440001'), UUID_TO_BIN('a50e8400-e29b-41d4-a716-446655440001'), UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440003'), 'Engine Vibration Issue', 'Unusual vibration detected during pre-flight checks', 'on_demand', 'high', 'in_progress', NOW(), 240, 'Issue detected during routine pre-flight inspection');

-- ============================================
-- Component Transfer (Example)
-- ============================================

INSERT INTO component_transfers (id, component_id, from_asset_id, to_asset_id, transfer_date, reason, performed_by, notes) VALUES
(UUID_TO_BIN('c50e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('a50e8400-e29b-41d4-a716-446655440002'), UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440001'), DATE_SUB(NOW(), INTERVAL 30 DAY), 'Upgrade to newer model', UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440001'), 'Component transferred during scheduled upgrade');

-- ============================================
-- Audit Logs (Sample)
-- ============================================

INSERT INTO audit_logs (id, company_id, user_id, action, entity_type, entity_id, ip_address, user_agent) VALUES
(UUID_TO_BIN('d50e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000'), UUID_TO_BIN('650e8400-e29b-41d4-a716-446655440001'), 'create', 'asset', UUID_TO_BIN('950e8400-e29b-41d4-a716-446655440000'), '192.168.1.100', 'Mozilla/5.0');

-- ============================================
-- End of Seed Data
-- ============================================

SET sql_mode = @old_sql_mode;

-- Display summary
SELECT 
    'Companies' as table_name, COUNT(*) as records FROM companies
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'User Companies', COUNT(*) FROM user_companies
UNION ALL
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets
UNION ALL
SELECT 'Components', COUNT(*) FROM components
UNION ALL
SELECT 'Maintenance Records', COUNT(*) FROM maintenance_records;
