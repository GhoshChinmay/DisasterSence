-- Delete All Tables Script
-- Run this to clean up all existing tables before creating new schema

-- Drop tables in correct order (child tables first to avoid foreign key conflicts)
DROP TABLE IF EXISTS gov_ngo_coordination;
DROP TABLE IF EXISTS resource_allocations;
DROP TABLE IF EXISTS responder_updates;
DROP TABLE IF EXISTS ground_reports;
DROP TABLE IF EXISTS shelter_supplies;
DROP TABLE IF EXISTS volunteer_deployments;
DROP TABLE IF EXISTS relief_resources;
DROP TABLE IF EXISTS gov_alerts;
DROP TABLE IF EXISTS public_reports;
DROP TABLE IF EXISTS users;

-- Also drop any other disaster management related tables that might exist
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS ngo_reports;
DROP TABLE IF EXISTS ngo_deployments;
DROP TABLE IF EXISTS camps;
DROP TABLE IF EXISTS announcements;

-- Success message
SELECT 'All tables deleted successfully!' as status;