-- Agregar columnas para galería de imágenes y tipos de unidades
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS floor_plan_url TEXT,
ADD COLUMN IF NOT EXISTS unit_types JSONB DEFAULT '[]'::jsonb;

-- Actualizar proyectos existentes con datos de ejemplo
-- La estructura de unit_types será un array de objetos:
-- [
--   {
--     "id": "1",
--     "name": "Estudio",
--     "bedrooms": 1,
--     "bathrooms": 1,
--     "area": 45,
--     "price": 120000
--   }
-- ]

-- La estructura de gallery_images será:
-- {
--   "kitchen": ["url1", "url2"],
--   "bathroom": ["url1", "url2"],
--   "bedroom": ["url1", "url2"],
--   "living": ["url1", "url2"]
-- }

COMMENT ON COLUMN projects.gallery_images IS 'Galería de imágenes organizadas por tipo de ambiente (kitchen, bathroom, bedroom, living)';
COMMENT ON COLUMN projects.floor_plan_url IS 'URL del plano del proyecto';
COMMENT ON COLUMN projects.unit_types IS 'Tipos de unidades disponibles con sus características';
