-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'users', 
  'public_reports', 
  'relief_resources', 
  'volunteer_deployments', 
  'shelter_supplies', 
  'ground_reports', 
  'responder_updates', 
  'resource_allocations', 
  'gov_alerts', 
  'gov_ngo_coordination'
)
ORDER BY table_name;