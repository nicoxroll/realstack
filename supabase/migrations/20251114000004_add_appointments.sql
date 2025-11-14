-- Tabla para configuración de disponibilidad horaria (por defecto lunes a viernes 9-18)
CREATE TABLE IF NOT EXISTS availability_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, ..., 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day_of_week)
);

-- Insertar configuración por defecto (Lunes a Viernes, 9:00 - 18:00)
INSERT INTO availability_config (day_of_week, start_time, end_time, is_available) VALUES
  (0, '09:00', '18:00', false), -- Domingo (no disponible)
  (1, '09:00', '18:00', true),  -- Lunes
  (2, '09:00', '18:00', true),  -- Martes
  (3, '09:00', '18:00', true),  -- Miércoles
  (4, '09:00', '18:00', true),  -- Jueves
  (5, '09:00', '18:00', true),  -- Viernes
  (6, '09:00', '18:00', false)  -- Sábado (no disponible)
ON CONFLICT (day_of_week) DO NOTHING;

-- Tabla para turnos/citas agendadas (1 hora de duración)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_date, start_time) -- No permitir turnos duplicados en el mismo horario
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_project ON appointments(project_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

CREATE TRIGGER trigger_update_availability_config_updated_at
  BEFORE UPDATE ON availability_config
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- RLS Policies para appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios turnos
CREATE POLICY "Users can view their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios turnos
CREATE POLICY "Users can create their own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios turnos (solo cancelar)
CREATE POLICY "Users can update their own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios turnos
CREATE POLICY "Users can delete their own appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies para availability_config
ALTER TABLE availability_config ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer la disponibilidad
CREATE POLICY "Anyone can view availability"
  ON availability_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden modificar la disponibilidad (se maneja desde el panel de admin)
CREATE POLICY "Only service role can modify availability"
  ON availability_config
  FOR ALL
  USING (false);

-- Comentarios para documentación
COMMENT ON TABLE availability_config IS 'Configuración de horarios disponibles por día de la semana';
COMMENT ON TABLE appointments IS 'Turnos agendados por usuarios para visitar proyectos (1 hora de duración)';
COMMENT ON COLUMN appointments.status IS 'Estados: scheduled (agendado), confirmed (confirmado), cancelled (cancelado), completed (completado)';

-- Función RPC para actualizar availability_config desde el admin panel
CREATE OR REPLACE FUNCTION update_availability_config(
  p_day_of_week INTEGER,
  p_field TEXT,
  p_value TEXT
)
RETURNS void AS $$
BEGIN
  CASE p_field
    WHEN 'start_time' THEN
      UPDATE availability_config
      SET start_time = p_value::TIME
      WHERE day_of_week = p_day_of_week;
    WHEN 'end_time' THEN
      UPDATE availability_config
      SET end_time = p_value::TIME
      WHERE day_of_week = p_day_of_week;
    WHEN 'is_available' THEN
      UPDATE availability_config
      SET is_available = p_value::BOOLEAN
      WHERE day_of_week = p_day_of_week;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
