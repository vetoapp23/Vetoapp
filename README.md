# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8a0e4ec4-ff53-42de-adef-27930611321e

## ⚠️ IMPORTANT: User Management Flow Decision Required

**Please review the two user management options below and let us know which one you prefer:**

### Option 1: Single Admin with Multiple Assistants (Current Implementation)
```
┌─────────────────────────────────────────┐
│           VETOAPP SYSTEM                │
├─────────────────────────────────────────┤
│  👤 Admin (1)                           │
│     │                                   │
│     ├── 👥 Assistant 1                  │
│     ├── 👥 Assistant 2                  │
│     ├── 👥 Assistant 3                  │
│     └── 👥 Assistant N...               │
└─────────────────────────────────────────┘
```

**How it works:**
- **One Admin** controls the entire system
- All new users register as **Assistants by default**
- The single Admin approves/rejects all Assistant registrations
- All Assistants work under the same organization
- All Assistants share access to the same data (clients, animals, etc.)

**Use Case:**
- Single veterinary clinic with one owner/manager
- All staff members are managed centrally
- Unified data and operations

---

### Option 2: Multiple Admins with Separate Assistants (Multi-Tenant)
```
┌─────────────────────────────────────────┐
│           VETOAPP SYSTEM                │
├─────────────────────────────────────────┤
│  👤 Admin 1                             │
│     ├── 👥 Assistant 1A                 │
│     ├── 👥 Assistant 1B                 │
│     └── 📊 Data Group 1                 │
│                                         │
│  👤 Admin 2                             │
│     ├── 👥 Assistant 2A                 │
│     ├── 👥 Assistant 2B                 │
│     ├── 👥 Assistant 2C                 │
│     └── 📊 Data Group 2                 │
│                                         │
│  👤 Admin 3                             │
│     ├── 👥 Assistant 3A                 │
│     └── 📊 Data Group 3                 │
└─────────────────────────────────────────┘
```

**How it works:**
- **Multiple Admins**, each managing their own workspace
- Each Admin approves/rejects their own Assistant registrations
- Assistants belong to a specific Admin/Organization
- **Data isolation**: Admin 1's assistants cannot see Admin 2's data
- Each Admin group operates independently

**Use Case:**
- Multiple independent veterinary clinics
- Franchise or multi-location practices
- Each clinic owner manages their own staff and data

---

### Key Differences

| Feature | Option 1 (Single Admin) | Option 2 (Multi-Admin) |
|---------|------------------------|------------------------|
| Number of Admins | 1 | Multiple |
| Assistant Assignment | All under one Admin | Each Admin has their own |
| Data Access | Shared across all users | Isolated per Admin group |
| Approval Process | Single Admin approves all | Each Admin approves their own |
| Complexity | Simpler | More complex (multi-tenant) |
| Database Changes | Minimal | Requires organization/tenant system |

---

### 📋 Decision Required

**Current Status:** The app is currently built for **Option 1** (Single Admin).

**To proceed with Option 2**, we will need to:
1. Add an `organizations` or `tenants` table
2. Link Assistants to specific Admins
3. Implement data isolation (RLS policies)
4. Update the approval workflow
5. Modify the authentication flow

**Please confirm which option you prefer so we can proceed with the appropriate implementation.**

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8a0e4ec4-ff53-42de-adef-27930611321e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8a0e4ec4-ff53-42de-adef-27930611321e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
# Vetoapp
# Vetoapp


# Database Schema Analysis for VetPro CRM
## Current Database State ✅
Based on your current schema, you have the foundational tables:
### ✅ Existing Tables
- **clients** - Complete client management
- **animals** - Complete animal profiles with medical fields
- **user_profiles** - User authentication and profiles

## Missing Database Tables for Full Functionality 🚨

### Core Veterinary Operations

#### 1. **consultations** - Medical consultation records
- Stores all consultation details (symptoms, diagnosis, treatment, etc.)
- Links to clients, animals, and veterinarians
- Includes photos, notes, and follow-up information

#### 2. **prescriptions** - Medication prescriptions
- Stores prescription details and medications
- Links prescriptions to consultations
- Tracks prescription status and refills

#### 3. **prescription_medications** - Individual medications in prescriptions
- Junction table for prescription details
- Stores dosage, frequency, duration per medication
- Links to stock items for inventory management

#### 4. **vaccinations** - Vaccination records
- Stores vaccination history and schedules
- Links to animals and vaccination protocols
- Tracks batch numbers, manufacturers, and reminders

#### 5. **appointments** - Appointment scheduling
- Stores scheduled appointments
- Links to clients, animals, and consultation types
- Tracks appointment status and reminders

### Inventory & Stock Management

#### 6. **stock_items** - Medication and supply inventory
- Stores all medications, vaccines, and supplies
- Tracks quantities, expiration dates, and suppliers
- Categories: medication, vaccine, consumable, equipment, supplement

#### 7. **stock_movements** - Inventory transaction history
- Tracks all stock additions, subtractions, and adjustments
- Links to prescriptions, vaccinations, and manual adjustments
- Maintains audit trail for inventory changes

### Specialized Veterinary Features

#### 8. **antiparasitics** - Antiparasitic treatment records
- Stores external/internal parasite treatments
- Links to animals and treatment protocols
- Tracks treatment schedules and effectiveness

#### 9. **vaccination_protocols** - Vaccination schedule templates
- Stores vaccination protocols by species
- Defines core vs non-core vaccines
- Calculates reminder dates automatically

#### 10. **antiparasitic_protocols** - Treatment protocol templates
- Stores antiparasitic treatment protocols
- Defines treatment schedules and dosages
- Species-specific recommendations

### Farm Management (Advanced Feature)

#### 11. **farms** - Farm/client management
- Stores farm information for agricultural clients
- Links to farm interventions and animal groups
- Tracks farm-specific data (registration, certifications, etc.)

#### 12. **farm_interventions** - Farm visit records
- Stores farm visits and interventions
- Links to farms and intervention types
- Tracks herd health and treatments

### Additional Missing Features

#### 13. **medical_records** - Detailed medical history
- Stores comprehensive medical history per animal
- Links to consultations, vaccinations, prescriptions
- Maintains chronological medical timeline

#### 14. **lab_results** - Laboratory analysis results
- Stores lab test results and analysis
- Links to consultations and animals
- Tracks test types, results, and reference ranges

#### 15. **invoices** - Billing and invoicing
- Stores consultation and service invoices
- Links to clients and services provided
- Tracks payment status and amounts

## Priority Implementation Order

### Phase 1: Core Functionality (High Priority)
1. **consultations** - Essential for medical records
2. **prescriptions** + **prescription_medications** - Medication management
3. **vaccinations** - Vaccination tracking
4. **appointments** - Scheduling system

### Phase 2: Inventory Management (Medium Priority)
5. **stock_items** + **stock_movements** - Inventory control
6. **vaccination_protocols** - Protocol management
7. **antiparasitics** + **antiparasitic_protocols** - Parasite control

### Phase 3: Advanced Features (Lower Priority)
8. **farms** + **farm_interventions** - Farm management
9. **medical_records** - Comprehensive history
10. **lab_results** - Lab integration
11. **invoices** - Billing system

## Database Relationships

```
clients (1) ──── (many) animals
   │                      │
   ├── (many) consultations ─── (many) prescriptions
   │          │                        │
   │          ├── (many) vaccinations   ├── (many) prescription_medications
   │          │                        │
   │          └── (many) appointments   └── (1) stock_items
   │
   └── (many) farms ─── (many) farm_interventions

animals ─── (many) vaccinations
   │
   ├── (many) antiparasitics
   │
   └── (many) medical_records ─── (many) lab_results
```

## Next Steps

1. **Create the missing database schema** (see attached `complete-schema.sql`)
2. **Update TypeScript interfaces** to match database schema
3. **Implement database functions** for CRUD operations
4. **Update React components** to use database instead of mock data
5. **Test functionality** and ensure data integrity

The most critical missing pieces for your immediate needs (animal creation, modification, and medical records) are:
- **consultations** table
- **prescriptions** + **prescription_medications** tables
- **vaccinations** table
- **stock_items** + **stock_movements** tables
------------
-- Complete Database Schema for VetPro CRM
-- This schema includes all missing tables for full veterinary functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- EXISTING TABLES (from your current schema)
-- ===========================================

-- clients table (already exists)
-- animals table (already exists)
-- user_profiles table (already exists)

-- ===========================================
-- MISSING TABLES FOR FULL FUNCTIONALITY
-- ===========================================

-- 1. Core Veterinary Operations
-- ==============================

-- consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES user_profiles(id),
    consultation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consultation_type VARCHAR(50) NOT NULL, -- 'routine', 'emergency', 'follow-up', 'vaccination', 'surgery'
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    weight DECIMAL(5,2),
    temperature DECIMAL(4,1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    photos TEXT[], -- Array of photo URLs
    follow_up_date DATE,
    follow_up_notes TEXT,
    status VARCHAR(20) DEFAULT 'completed', -- 'scheduled', 'in-progress', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES user_profiles(id),
    prescription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    diagnosis TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    refill_count INTEGER DEFAULT 0,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- prescription_medications table (junction table)
CREATE TABLE IF NOT EXISTS prescription_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    stock_item_id UUID REFERENCES stock_items(id),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity INTEGER NOT NULL,
    instructions TEXT,
    route VARCHAR(50), -- 'oral', 'injectable', 'topical', 'otic', 'ophthalmic'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_type VARCHAR(100), -- 'core', 'non-core', 'lifestyle'
    batch_number VARCHAR(100),
    manufacturer VARCHAR(255),
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    administered_by UUID REFERENCES user_profiles(id),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES user_profiles(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50) NOT NULL, -- 'consultation', 'vaccination', 'surgery', 'follow-up'
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inventory & Stock Management
-- ===============================

-- stock_items table
CREATE TABLE IF NOT EXISTS stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'medication', 'vaccine', 'consumable', 'equipment', 'supplement'
    unit VARCHAR(20) DEFAULT 'unit', -- 'unit', 'ml', 'mg', 'tablet', 'vial'
    current_quantity INTEGER NOT NULL DEFAULT 0,
    minimum_quantity INTEGER DEFAULT 0,
    maximum_quantity INTEGER,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    supplier VARCHAR(255),
    batch_number VARCHAR(100),
    expiration_date DATE,
    location VARCHAR(100), -- storage location
    requires_prescription BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment', 'return'
    quantity INTEGER NOT NULL,
    reason VARCHAR(100), -- 'purchase', 'prescription', 'vaccination', 'damage', 'expiry', 'donation'
    reference_id UUID, -- Can reference prescriptions, vaccinations, etc.
    reference_type VARCHAR(50), -- 'prescription', 'vaccination', 'manual'
    performed_by UUID REFERENCES user_profiles(id),
    notes TEXT,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Specialized Veterinary Features
-- ===================================

-- antiparasitics table
CREATE TABLE IF NOT EXISTS antiparasitics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    active_ingredient VARCHAR(255),
    parasite_type VARCHAR(100), -- 'internal', 'external', 'both'
    administration_route VARCHAR(50), -- 'oral', 'topical', 'injectable'
    dosage VARCHAR(100),
    treatment_date DATE NOT NULL,
    next_treatment_date DATE,
    administered_by UUID REFERENCES user_profiles(id),
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- vaccination_protocols table
CREATE TABLE IF NOT EXISTS vaccination_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species VARCHAR(50) NOT NULL, -- 'dog', 'cat', 'horse', 'cow', 'sheep', 'goat', 'pig', 'bird', 'rabbit'
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_type VARCHAR(20) NOT NULL, -- 'core', 'non-core', 'lifestyle'
    age_recommendation VARCHAR(100), -- '6-8 weeks', '12 weeks', '6 months', 'annual'
    frequency VARCHAR(50), -- 'annual', 'biennial', 'triennial', 'one-time'
    duration_days INTEGER, -- for puppy/kitten series
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- antiparasitic_protocols table
CREATE TABLE IF NOT EXISTS antiparasitic_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species VARCHAR(50) NOT NULL,
    parasite_type VARCHAR(100) NOT NULL, -- 'internal', 'external', 'both'
    product_name VARCHAR(255) NOT NULL,
    active_ingredient VARCHAR(255),
    administration_route VARCHAR(50),
    dosage_per_kg VARCHAR(50),
    frequency VARCHAR(50), -- 'monthly', 'quarterly', 'annual', 'as-needed'
    age_restriction VARCHAR(100),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Farm Management (Advanced)
-- ==============================

-- farms table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    farm_type VARCHAR(50), -- 'dairy', 'beef', 'sheep', 'pig', 'poultry', 'mixed'
    registration_number VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    herd_size INTEGER,
    certifications TEXT[], -- Array of certification names
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- farm_interventions table
CREATE TABLE IF NOT EXISTS farm_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES user_profiles(id),
    intervention_date DATE NOT NULL,
    intervention_type VARCHAR(50) NOT NULL, -- 'health-check', 'vaccination', 'treatment', 'surgery', 'emergency'
    animal_count INTEGER,
    description TEXT,
    diagnosis TEXT,
    treatment TEXT,
    medications_used TEXT[],
    cost DECIMAL(10,2),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Additional Features
-- =======================

-- medical_records table (comprehensive history)
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    record_type VARCHAR(50) NOT NULL, -- 'consultation', 'vaccination', 'prescription', 'surgery', 'lab-result'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis TEXT,
    treatment TEXT,
    attachments TEXT[], -- Array of file URLs
    veterinarian_id UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- lab_results table
CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    lab_name VARCHAR(255),
    test_type VARCHAR(100) NOT NULL,
    test_date DATE NOT NULL,
    results TEXT,
    reference_range TEXT,
    interpretation TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'reviewed'
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    attachments TEXT[], -- Array of file URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'overdue', 'cancelled'
    payment_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'consultation', 'vaccination', 'medication', 'surgery', 'other'
    description VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    reference_id UUID, -- Can reference consultations, prescriptions, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Core tables indexes
CREATE INDEX IF NOT EXISTS idx_consultations_animal_id ON consultations(animal_id);
CREATE INDEX IF NOT EXISTS idx_consultations_client_id ON consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_type ON consultations(consultation_type);

CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_animal_id ON prescriptions(animal_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

CREATE INDEX IF NOT EXISTS idx_vaccinations_animal_id ON vaccinations(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_date ON vaccinations(vaccination_date);
CREATE INDEX IF NOT EXISTS idx_vaccinations_next_due ON vaccinations(next_due_date);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Stock management indexes
CREATE INDEX IF NOT EXISTS idx_stock_items_category ON stock_items(category);
CREATE INDEX IF NOT EXISTS idx_stock_items_expiration ON stock_items(expiration_date);
CREATE INDEX IF NOT EXISTS idx_stock_items_active ON stock_items(active);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(stock_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);

-- Specialized features indexes
CREATE INDEX IF NOT EXISTS idx_antiparasitics_animal_id ON antiparasitics(animal_id);
CREATE INDEX IF NOT EXISTS idx_antiparasitics_date ON antiparasitics(treatment_date);

CREATE INDEX IF NOT EXISTS idx_vaccination_protocols_species ON vaccination_protocols(species);
CREATE INDEX IF NOT EXISTS idx_antiparasitic_protocols_species ON antiparasitic_protocols(species);

-- Farm management indexes
CREATE INDEX IF NOT EXISTS idx_farms_client_id ON farms(client_id);
CREATE INDEX IF NOT EXISTS idx_farm_interventions_farm_id ON farm_interventions(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_interventions_date ON farm_interventions(intervention_date);

-- Additional features indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_animal_id ON medical_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(record_date);

CREATE INDEX IF NOT EXISTS idx_lab_results_animal_id ON lab_results(animal_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_date ON lab_results(test_date);

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on all new tables
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE antiparasitics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE antiparasitic_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own clinic's data)
-- Note: These are basic policies. You may need to adjust based on your specific requirements.

CREATE POLICY "Users can view consultations for their clients" ON consultations
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        ) OR veterinarian_id = auth.uid()
    );

CREATE POLICY "Users can insert consultations" ON consultations
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        ) OR veterinarian_id = auth.uid()
    );

CREATE POLICY "Users can update consultations" ON consultations
    FOR UPDATE USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        ) OR veterinarian_id = auth.uid()
    );

-- Similar policies for other tables (simplified for brevity)
-- In production, you'd want more comprehensive RLS policies

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables with updated_at columns
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_antiparasitics_updated_at BEFORE UPDATE ON antiparasitics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_interventions_updated_at BEFORE UPDATE ON farm_interventions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- INITIAL DATA (Optional)
-- ===========================================

-- Insert some basic vaccination protocols
INSERT INTO vaccination_protocols (species, vaccine_name, vaccine_type, age_recommendation, frequency, notes) VALUES
('dog', 'DHPP', 'core', '6-8 weeks, 10-12 weeks, 14-16 weeks', 'annual', 'Distemper, Hepatitis, Parvovirus, Parainfluenza'),
('dog', 'Rabies', 'core', '12 weeks', 'annual', 'Required by law in most areas'),
('dog', 'Bordetella', 'non-core', '8 weeks', 'annual', 'Kennel cough protection'),
('cat', 'FVRCP', 'core', '6-8 weeks, 10-12 weeks, 14-16 weeks', 'annual', 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia'),
('cat', 'Rabies', 'core', '12 weeks', 'annual', 'Required by law in most areas'),
('cat', 'FeLV', 'non-core', '8 weeks', 'annual', 'Feline Leukemia protection');

-- Insert some basic antiparasitic protocols
INSERT INTO antiparasitic_protocols (species, parasite_type, product_name, active_ingredient, administration_route, dosage_per_kg, frequency, notes) VALUES
('dog', 'internal', 'Heartgard Plus', 'Ivermectin + Pyrantel', 'oral', '6 mcg/kg ivermectin', 'monthly', 'Heartworm prevention + intestinal parasites'),
('dog', 'external', 'Frontline', 'Fipronil', 'topical', '1 pipette per dog', 'monthly', 'Flea and tick control'),
('cat', 'internal', 'Trifexis', 'Spinosad + Milbemycin', 'oral', '30-50 mg/kg spinosad', 'monthly', 'Heartworm + intestinal parasite prevention'),
('cat', 'external', 'Revolution', 'Selamectin', 'topical', '6 mg/kg', 'monthly', 'Flea, heartworm, ear mite, and intestinal parasite prevention');

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- View for animal medical summary
CREATE OR REPLACE VIEW animal_medical_summary AS
SELECT
    a.id as animal_id,
    a.name as animal_name,
    a.species,
    a.breed,
    c.first_name || ' ' || c.last_name as owner_name,
    COUNT(cons.id) as total_consultations,
    MAX(cons.consultation_date) as last_consultation,
    COUNT(v.id) as total_vaccinations,
    MAX(v.vaccination_date) as last_vaccination,
    COUNT(p.id) as active_prescriptions
FROM animals a
LEFT JOIN clients c ON a.id = c.id
LEFT JOIN consultations cons ON a.id = cons.animal_id
LEFT JOIN vaccinations v ON a.id = v.animal_id
LEFT JOIN prescriptions p ON a.id = p.animal_id AND p.status = 'active'
GROUP BY a.id, a.name, a.species, a.breed, c.first_name, c.last_name;

-- View for stock alerts
CREATE OR REPLACE VIEW stock_alerts AS
SELECT
    id,
    name,
    category,
    current_quantity,
    minimum_quantity,
    CASE
        WHEN current_quantity <= 0 THEN 'Out of Stock'
        WHEN current_quantity <= minimum_quantity THEN 'Low Stock'
        WHEN expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'OK'
    END as alert_status
FROM stock_items
WHERE active = true
    AND (current_quantity <= minimum_quantity
         OR current_quantity <= 0
         OR expiration_date <= CURRENT_DATE + INTERVAL '30 days');

-- ===========================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ===========================================

-- Function to calculate next vaccination due date
CREATE OR REPLACE FUNCTION calculate_next_vaccination_due(
    p_vaccination_date DATE,
    p_frequency VARCHAR
) RETURNS DATE AS $$
BEGIN
    CASE p_frequency
        WHEN 'annual' THEN RETURN p_vaccination_date + INTERVAL '1 year';
        WHEN 'biennial' THEN RETURN p_vaccination_date + INTERVAL '2 years';
        WHEN 'triennial' THEN RETURN p_vaccination_date + INTERVAL '3 years';
        WHEN 'one-time' THEN RETURN NULL;
        ELSE RETURN p_vaccination_date + INTERVAL '1 year';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock quantity
CREATE OR REPLACE FUNCTION update_stock_quantity(
    p_stock_item_id UUID,
    p_quantity_change INTEGER,
    p_movement_type VARCHAR,
    p_reason VARCHAR,
    p_performed_by UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Update stock quantity
    UPDATE stock_items
    SET current_quantity = current_quantity + p_quantity_change,
        updated_at = NOW()
    WHERE id = p_stock_item_id;

    -- Record the movement
    INSERT INTO stock_movements (
        stock_item_id,
        movement_type,
        quantity,
        reason,
        performed_by
    ) VALUES (
        p_stock_item_id,
        p_movement_type,
        p_quantity_change,
        p_reason,
        p_performed_by
    );
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- END OF SCHEMA
-- ===========================================

-- Note: This schema provides a complete foundation for your veterinary CRM.
-- You can execute this file in your Supabase SQL editor to create all the missing tables.
-- After creating the tables, you'll need to update your TypeScript interfaces and React components
-- to use the database instead of mock data.

---------
i want the pets page to be fully dynamic with all what on old UI 