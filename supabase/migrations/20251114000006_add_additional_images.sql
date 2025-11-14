-- Add additional_images field to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS additional_images text[] DEFAULT '{}';

COMMENT ON COLUMN projects.additional_images IS 'Array of additional image URLs for the project gallery';
