-- Eliminar la restricción UNIQUE en user_visits para permitir múltiples visitas por proyecto
-- Un usuario puede tener múltiples turnos para el mismo proyecto en diferentes fechas

ALTER TABLE user_visits DROP CONSTRAINT IF EXISTS user_visits_user_id_project_id_key;

-- Agregar un índice compuesto para mejorar el rendimiento de búsquedas
-- pero sin la restricción UNIQUE
CREATE INDEX IF NOT EXISTS idx_user_visits_user_project 
ON user_visits(user_id, project_id);

-- Agregar un índice para visit_date para mejorar búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_user_visits_date 
ON user_visits(visit_date);
