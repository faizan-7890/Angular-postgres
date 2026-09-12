-- ==========================================================
-- OpsTrack CMMS Database Initialization & Seed Script
-- Compatible with PostgreSQL 13+
-- ==========================================================

-- 1. CLEANUP (Safe for development re-runs)
DROP TABLE IF EXISTS work_order_parts CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS spare_parts CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;

DROP TYPE IF EXISTS asset_status CASCADE;
DROP TYPE IF EXISTS work_order_priority CASCADE;
DROP TYPE IF EXISTS work_order_status CASCADE;

-- 2. ENUMS
CREATE TYPE asset_status AS ENUM (
    'OPERATIONAL',
    'UNDER_MAINTENANCE',
    'DECOMMISSIONED',
    'IN_STORAGE'
);

CREATE TYPE work_order_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

CREATE TYPE work_order_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

-- 3. TABLES DEFINITION

-- Technicians table
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) DEFAULT 'General Technician',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Assets table (Equipment / Machinery)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    status asset_status DEFAULT 'OPERATIONAL',
    purchase_date DATE,
    warranty_expires_at DATE,
    specs JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Preventative Maintenance Schedules
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    frequency_interval_days INT NOT NULL CHECK (frequency_interval_days > 0),
    next_due_date DATE NOT NULL,
    last_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Spare Parts Inventory
CREATE TABLE spare_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(80) UNIQUE NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_threshold INT NOT NULL DEFAULT 5,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Work Orders (Maintenance / Repair jobs)
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority work_order_priority DEFAULT 'MEDIUM',
    status work_order_status DEFAULT 'PENDING',
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    assigned_technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    scheduled_date DATE DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Work Order Parts (Junction table for consumed inventory)
CREATE TABLE work_order_parts (
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES spare_parts(id) ON DELETE RESTRICT,
    quantity_used INT NOT NULL CHECK (quantity_used > 0),
    PRIMARY KEY (work_order_id, part_id)
);

-- 4. FULL-TEXT SEARCH & INDEXING

-- Built-in PostgreSQL trigger to populate search_vector automatically
CREATE TRIGGER tsvectorupdate 
BEFORE INSERT OR UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION 
tsvector_update_trigger(search_vector, 'pg_catalog.english', name, serial_number, category, location);

-- GIN Index for sub-millisecond full-text queries
CREATE INDEX idx_assets_search_vector ON assets USING GIN(search_vector);

-- B-Tree Performance Indexes for Foreign Keys and frequent lookups
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX idx_work_orders_technician ON work_orders(assigned_technician_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_schedules_next_due_date ON maintenance_schedules(next_due_date);
CREATE INDEX idx_spare_parts_sku ON spare_parts(sku);

-- 5. SEED DATA (Realistic demo data for portfolio & testing)

-- Technicians
INSERT INTO technicians (id, full_name, email, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Marcus Vance', 'marcus.vance@opstrack.internal', '+1-555-0101', 'Senior Electrical Engineer'),
('22222222-2222-2222-2222-222222222222', 'Elena Rostova', 'elena.rostova@opstrack.internal', '+1-555-0102', 'Mechanical Specialist'),
('33333333-3333-3333-3333-333333333333', 'Devon Bailey', 'devon.bailey@opstrack.internal', '+1-555-0103', 'HVAC Technician');

-- Assets
INSERT INTO assets (id, name, serial_number, category, location, status, purchase_date, warranty_expires_at, specs) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Industrial Air Compressor X500', 'AC-X500-8841', 'Pneumatics', 'Building A - Utility Room 2', 'OPERATIONAL', '2023-01-15', '2026-01-15', '{"max_psi": 175, "motor_hp": 15, "voltage": 480}'::jsonb),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hydraulic Press HP-20T', 'HP-20T-9032', 'Heavy Machinery', 'Building B - Machine Shop', 'UNDER_MAINTENANCE', '2022-06-10', '2025-06-10', '{"capacity_tons": 20, "stroke_in": 12}'::jsonb),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'HVAC Rooftop Chiller Unit 3', 'HVAC-CH-003', 'Cooling & Ventilation', 'Building A - Roof Zone North', 'OPERATIONAL', '2021-11-20', '2024-11-20', '{"refrigerant": "R-410A", "cooling_tons": 50}'::jsonb),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'CNC Milling Machine VMC-800', 'CNC-VMC-1109', 'Fabrication', 'Building B - Bay 4', 'OPERATIONAL', '2023-08-01', '2026-08-01', '{"spindle_rpm": 12000, "axis_count": 5}'::jsonb),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Backup Diesel Generator 250kVA', 'GEN-DSL-0250', 'Power Generation', 'Exterior Pad - South Yard', 'IN_STORAGE', '2020-03-05', '2023-03-05', '{"fuel_type": "Diesel", "output_kw": 200}'::jsonb);

-- Maintenance Schedules
INSERT INTO maintenance_schedules (id, asset_id, task_name, frequency_interval_days, next_due_date, last_completed_at) VALUES
('90000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Oil & Air Filter Replacement', 90, CURRENT_DATE + INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '85 days'),
('90000002-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hydraulic Fluid & Seal Inspection', 60, CURRENT_DATE - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '62 days'),
('90000003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Condenser Coil Cleaning', 180, CURRENT_DATE + INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '150 days'),
('90000004-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Spindle Calibration & Axis Lubrication', 30, CURRENT_DATE + INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '18 days');

-- Spare Parts Inventory
INSERT INTO spare_parts (id, name, sku, stock_quantity, min_threshold, unit_cost) VALUES
('55555555-5555-5555-5555-555555555551', 'Synthetic Air Filter AF-200', 'PART-AF-200', 14, 5, 24.50),
('55555555-5555-5555-5555-555555555552', 'Hydraulic Seal Kit 50mm', 'PART-SK-50M', 3, 4, 89.00),
('55555555-5555-5555-5555-555555555553', 'ISO 46 Hydraulic Oil (5 Gal)', 'PART-OIL-H46', 8, 3, 62.75),
('55555555-5555-5555-5555-555555555554', 'Cooling Fan Belt B-68', 'PART-BLT-B68', 25, 10, 18.20),
('55555555-5555-5555-5555-555555555555', 'Linear Axis Grease Cartridge 400g', 'PART-GRS-L40', 18, 6, 12.90);

-- Work Orders
INSERT INTO work_orders (id, title, description, priority, status, asset_id, assigned_technician_id, schedule_id, scheduled_date) VALUES
('80000001-0000-0000-0000-000000000001', 'Routine Compressor Filter Maintenance', 'Replace primary intake filter and check operating PSI pressure.', 'MEDIUM', 'PENDING', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '90000001-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '5 days'),
('80000002-0000-0000-0000-000000000002', 'Emergency Hydraulic Pressure Drop Repair', 'Technician reported slight fluid seepage on the primary piston cylinder.', 'HIGH', 'IN_PROGRESS', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '90000002-0000-0000-0000-000000000002', CURRENT_DATE),
('80000003-0000-0000-0000-000000000003', 'Monthly Chiller Belt Check', 'Inspected belt tension and electrical control cabinet.', 'LOW', 'COMPLETED', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', NULL, CURRENT_DATE - INTERVAL '10 days');

-- Record parts consumed on completed work order
INSERT INTO work_order_parts (work_order_id, part_id, quantity_used) VALUES
('80000003-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555554', 1);
