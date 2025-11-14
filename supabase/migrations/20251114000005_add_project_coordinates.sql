-- Agregar coordenadas geográficas a la tabla projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN projects.latitude IS 'Latitud de la ubicación del proyecto';
COMMENT ON COLUMN projects.longitude IS 'Longitud de la ubicación del proyecto';
