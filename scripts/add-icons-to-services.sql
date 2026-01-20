-- Add icon field to services table for animated GIF icons
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add icon field description/comment
COMMENT ON COLUMN services.icon IS 'URL to animated GIF icon for this service (e.g., from Vercel Blob)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_icon ON services(icon);

COMMIT;
