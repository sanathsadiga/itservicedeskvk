-- Add test data for development
INSERT INTO incidents (ticket_number, title, description, incident_type_id, location_id, assigned_to, created_by, priority, status)
VALUES 
  ('TKT-TEST-001', 'Test Incident 1', 'This is a test incident created for development', 1, 1, NULL, 1, 'medium', 'open'),
  ('TKT-TEST-002', 'Test Incident 2', 'Another test incident for testing the system', 2, 2, 1, 1, 'high', 'open'),
  ('TKT-TEST-003', 'Test Incident 3', 'Test incident assigned to user', 3, 1, 1, 1, 'critical', 'in_progress');
