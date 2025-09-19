-- Quick Fix: Disable RLS for Development
-- Run this in your Supabase SQL Editor to temporarily disable RLS
-- This script handles errors gracefully if tables/policies don't exist

-- First, let's check what tables actually exist and disable RLS only on existing tables
DO $$
BEGIN
  -- Disable RLS on tables if they exist
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'public_reports') THEN
    ALTER TABLE public_reports DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'relief_resources') THEN
    ALTER TABLE relief_resources DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'volunteer_deployments') THEN
    ALTER TABLE volunteer_deployments DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shelter_supplies') THEN
    ALTER TABLE shelter_supplies DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ground_reports') THEN
    ALTER TABLE ground_reports DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'responder_updates') THEN
    ALTER TABLE responder_updates DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resource_allocations') THEN
    ALTER TABLE resource_allocations DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gov_alerts') THEN
    ALTER TABLE gov_alerts DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gov_ngo_coordination') THEN
    ALTER TABLE gov_ngo_coordination DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Optional: Drop existing policies if they exist (with error handling)
DO $$
BEGIN
  -- Drop policies with error handling
  BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Allow user creation" ON users;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Public reports visible to all" ON public_reports;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can insert own reports" ON public_reports;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Relief resources visible to gov and ngos" ON relief_resources;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "NGOs can manage own resources" ON relief_resources;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Success message
SELECT 'RLS disabled successfully for development!' as status;