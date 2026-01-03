-- Add isBlocked column to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Update existing drivers: set isBlocked = true where isApproved = false and they were manually blocked
-- (Keep isApproved for registration approval workflow)

-- Comment: 
-- isApproved = true/false -> Whether driver registration is approved by admin (cannot login if false)
-- isBlocked = true/false -> Whether active driver is blocked by admin (can login but cannot go online if true)
