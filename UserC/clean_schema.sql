-- Clean Schema for Supabase - No RLS Issues
-- Copy and paste this entire script into Supabase SQL Editor

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Public Reports (incidents from citizens)
CREATE TABLE public_reports (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  location text NOT NULL,
  created_by uuid,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- NGO Relief Resources
CREATE TABLE relief_resources (
  id bigserial PRIMARY KEY,
  resource_type text NOT NULL,
  quantity integer NOT NULL,
  priority_level text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'Available',
  ngo_id uuid,
  created_at timestamptz DEFAULT now()
);

-- NGO Volunteer Deployments
CREATE TABLE volunteer_deployments (
  id bigserial PRIMARY KEY,
  team_name text NOT NULL,
  team_size integer NOT NULL,
  mission_type text NOT NULL,
  deployment_area text NOT NULL,
  status text DEFAULT 'Active',
  ngo_id uuid,
  created_at timestamptz DEFAULT now()
);

-- NGO Shelter Supplies
CREATE TABLE shelter_supplies (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  capacity integer,
  helpline text,
  status text DEFAULT 'Active',
  ngo_id uuid,
  created_at timestamptz DEFAULT now()
);

-- NGO Ground Reports
CREATE TABLE ground_reports (
  id bigserial PRIMARY KEY,
  location text NOT NULL,
  needs_assessment text NOT NULL,
  situation_report text,
  ngo_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Responder Status Updates
CREATE TABLE responder_updates (
  id bigserial PRIMARY KEY,
  incident_id bigint,
  status text NOT NULL,
  notes text,
  responder_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Government Resource Allocations
CREATE TABLE resource_allocations (
  id bigserial PRIMARY KEY,
  resource_id bigint,
  ngo_id uuid,
  quantity integer NOT NULL,
  status text DEFAULT 'Allocated',
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Government Alerts
CREATE TABLE gov_alerts (
  id bigserial PRIMARY KEY,
  hazard text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Government-NGO Coordination
CREATE TABLE gov_ngo_coordination (
  id bigserial PRIMARY KEY,
  gov_id uuid,
  ngo_id uuid,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);