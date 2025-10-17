# DBSCRIPT INITIAL.md

REGLAS DEL SCRIPT INICIAL DE LA BASE DE DATOS 

## BASE DE DATOS INICIAL

- esta base de datos ya esta iniciada en supabase con un script inicial tiene tablas creadas seguridad y demas recuerda el manejo de supabase que tuene su propio auth integralo con los profiles y todo lo mencionado anterior mente procedo a dejarte el script inicial y schema de la base de datos 

-- =====================================================
-- SISTEMA DE GESTIÓN DE TALLER MAXIRENT
-- Base de datos completa con seguridad RLS y optimización
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TIPOS ENUMERADOS (ENUMS)
-- =====================================================

-- Roles del sistema
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'JEFE_TALLER',
  'ALMACENISTA',
  'RECEPCIONISTA',
  'MECANICO'
);

-- Estados de vehículos
CREATE TYPE vehicle_status AS ENUM (
  'PENDIENTE_ASIGNACION',
  'EN_REVISION',
  'EN_MANTENIMIENTO',
  'ESPERANDO_REFACCIONES',
  'COMPLETADO',
  'CANCELADO'
);

-- Estados de rampas/espacios de trabajo
CREATE TYPE workspace_status AS ENUM (
  'DISPONIBLE',
  'OCUPADA',
  'EN_MANTENIMIENTO',
  'FUERA_DE_SERVICIO'
);

-- Tipo de espacio de trabajo
CREATE TYPE workspace_type AS ENUM (
  'RAMPA_FIJA',
  'ESPACIO_TEMPORAL'
);

-- Estado de notificaciones
CREATE TYPE notification_status AS ENUM (
  'PENDIENTE',
  'LEIDA',
  'ATENDIDA'
);

-- Tipo de notificación
CREATE TYPE notification_type AS ENUM (
  'NUEVO_INGRESO',
  'ASIGNACION_VEHICULO',
  'SOLICITUD_REFACCIONES',
  'VEHICULO_COMPLETADO',
  'ALERTA_SISTEMA'
);

-- =====================================================
-- TABLA: profiles (Perfiles de usuario)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'MECANICO',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  employee_id VARCHAR(50) UNIQUE,
  specialization VARCHAR(100), -- Para mecánicos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9]{10,15}$')
);

-- Índices para profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_employee_id ON profiles(employee_id);
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = true;

-- =====================================================
-- TABLA: vehicles (Vehículos)
-- =====================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL, -- 'AUTO', 'CAMIONETA', 'CAMION'
  brand VARCHAR(50),
  model VARCHAR(50),
  year INTEGER,
  vin VARCHAR(17) UNIQUE, -- Vehicle Identification Number
  fleet_number VARCHAR(50), -- Número de flota interno
  current_mileage INTEGER,
  last_maintenance_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  CONSTRAINT valid_mileage CHECK (current_mileage >= 0)
);

-- Índices para vehicles
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_vehicles_fleet_number ON vehicles(fleet_number);
CREATE INDEX idx_vehicles_active ON vehicles(is_active) WHERE is_active = true;

-- =====================================================
-- TABLA: workspaces (Rampas y espacios de trabajo)
-- =====================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  workspace_type workspace_type NOT NULL DEFAULT 'RAMPA_FIJA',
  status workspace_status NOT NULL DEFAULT 'DISPONIBLE',
  location_description TEXT,
  max_vehicle_capacity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_capacity CHECK (max_vehicle_capacity > 0)
);

-- Índices para workspaces
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_workspaces_type ON workspaces(workspace_type);
CREATE INDEX idx_workspaces_active ON workspaces(is_active) WHERE is_active = true;

-- =====================================================
-- TABLA: vehicle_entries (Ingresos de vehículos)
-- =====================================================
CREATE TABLE vehicle_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  entry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reported_issue TEXT NOT NULL,
  priority INTEGER DEFAULT 3, -- 1=Urgente, 2=Alta, 3=Media, 4=Baja, 5=Mantenimiento programado
  estimated_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  status vehicle_status NOT NULL DEFAULT 'PENDIENTE_ASIGNACION',
  entry_mileage INTEGER,
  
  -- Información del recepcionista
  received_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Asignación
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  
  -- Espacio de trabajo
  workspace_id UUID REFERENCES workspaces(id),
  workspace_assigned_at TIMESTAMPTZ,
  
  -- Observaciones del mecánico
  mechanic_observations TEXT,
  mechanic_accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 5),
  CONSTRAINT valid_mileage_entry CHECK (entry_mileage >= 0),
  CONSTRAINT completion_dates_check CHECK (
    actual_completion_date IS NULL OR 
    actual_completion_date >= entry_date
  )
);

-- Índices para vehicle_entries
CREATE INDEX idx_vehicle_entries_vehicle ON vehicle_entries(vehicle_id);
CREATE INDEX idx_vehicle_entries_status ON vehicle_entries(status);
CREATE INDEX idx_vehicle_entries_assigned_to ON vehicle_entries(assigned_to);
CREATE INDEX idx_vehicle_entries_workspace ON vehicle_entries(workspace_id);
CREATE INDEX idx_vehicle_entries_entry_date ON vehicle_entries(entry_date DESC);
CREATE INDEX idx_vehicle_entries_priority ON vehicle_entries(priority);
CREATE INDEX idx_vehicle_entries_received_by ON vehicle_entries(received_by);

-- Índice compuesto para consultas frecuentes
CREATE INDEX idx_vehicle_entries_status_date ON vehicle_entries(status, entry_date DESC);

-- =====================================================
-- TABLA: maintenance_tasks (Tareas de mantenimiento)
-- =====================================================
CREATE TABLE maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_entry_id UUID NOT NULL REFERENCES vehicle_entries(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_hours CHECK (
    (estimated_hours IS NULL OR estimated_hours >= 0) AND
    (actual_hours IS NULL OR actual_hours >= 0)
  )
);

-- Índices para maintenance_tasks
CREATE INDEX idx_maintenance_tasks_entry ON maintenance_tasks(vehicle_entry_id);
CREATE INDEX idx_maintenance_tasks_completed ON maintenance_tasks(is_completed);
CREATE INDEX idx_maintenance_tasks_completed_by ON maintenance_tasks(completed_by);

-- =====================================================
-- TABLA: parts_inventory (Inventario de refacciones)
-- =====================================================
CREATE TABLE parts_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number VARCHAR(100) UNIQUE NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit_price DECIMAL(10,2) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER DEFAULT 5,
  location VARCHAR(100),
  supplier VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_price CHECK (unit_price >= 0),
  CONSTRAINT valid_stock CHECK (current_stock >= 0),
  CONSTRAINT valid_min_stock CHECK (minimum_stock >= 0)
);

-- Índices para parts_inventory
CREATE INDEX idx_parts_part_number ON parts_inventory(part_number);
CREATE INDEX idx_parts_category ON parts_inventory(category);
CREATE INDEX idx_parts_low_stock ON parts_inventory(current_stock) 
  WHERE current_stock <= minimum_stock;
CREATE INDEX idx_parts_active ON parts_inventory(is_active) WHERE is_active = true;

-- =====================================================
-- TABLA: parts_usage (Uso de refacciones)
-- =====================================================
CREATE TABLE parts_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_entry_id UUID NOT NULL REFERENCES vehicle_entries(id) ON DELETE RESTRICT,
  part_id UUID NOT NULL REFERENCES parts_inventory(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  used_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_unit_price CHECK (unit_price >= 0)
);

-- Índices para parts_usage
CREATE INDEX idx_parts_usage_entry ON parts_usage(vehicle_entry_id);
CREATE INDEX idx_parts_usage_part ON parts_usage(part_id);
CREATE INDEX idx_parts_usage_used_by ON parts_usage(used_by);
CREATE INDEX idx_parts_usage_date ON parts_usage(created_at DESC);

-- =====================================================
-- TABLA: notifications (Notificaciones)
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status notification_status DEFAULT 'PENDIENTE',
  related_vehicle_entry_id UUID REFERENCES vehicle_entries(id) ON DELETE CASCADE,
  metadata JSONB, -- Información adicional flexible
  read_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Índices para notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_related_entry ON notifications(related_vehicle_entry_id);

-- Índice compuesto para consultas de notificaciones pendientes
CREATE INDEX idx_notifications_recipient_status ON notifications(recipient_id, status, created_at DESC);

-- =====================================================
-- TABLA: activity_logs (Registro de actividades)
-- =====================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para activity_logs
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_entries_updated_at BEFORE UPDATE ON vehicle_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_inventory_updated_at BEFORE UPDATE ON parts_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar stock de refacciones
CREATE OR REPLACE FUNCTION update_parts_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE parts_inventory 
  SET current_stock = current_stock - NEW.quantity
  WHERE id = NEW.part_id;
  
  -- Verificar si el stock está bajo
  IF (SELECT current_stock FROM parts_inventory WHERE id = NEW.part_id) <= 
     (SELECT minimum_stock FROM parts_inventory WHERE id = NEW.part_id) THEN
    -- Crear notificación para almacenista
    INSERT INTO notifications (
      recipient_id,
      notification_type,
      title,
      message,
      metadata
    )
    SELECT 
      id,
      'ALERTA_SISTEMA',
      'Stock Bajo de Refacción',
      'La refacción ' || pi.part_name || ' tiene stock bajo',
      jsonb_build_object('part_id', NEW.part_id, 'current_stock', pi.current_stock)
    FROM profiles p
    CROSS JOIN parts_inventory pi
    WHERE p.role = 'ALMACENISTA' 
      AND p.is_active = true
      AND pi.id = NEW.part_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_parts_stock
  AFTER INSERT ON parts_usage
  FOR EACH ROW EXECUTE FUNCTION update_parts_stock();

-- Función para crear notificación cuando se asigna un vehículo
CREATE OR REPLACE FUNCTION notify_vehicle_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND OLD.assigned_to IS NULL THEN
    INSERT INTO notifications (
      recipient_id,
      sender_id,
      notification_type,
      title,
      message,
      related_vehicle_entry_id,
      metadata
    )
    VALUES (
      NEW.assigned_to,
      NEW.assigned_by,
      'ASIGNACION_VEHICULO',
      'Nuevo Vehículo Asignado',
      'Se te ha asignado el vehículo con placa: ' || 
        (SELECT license_plate FROM vehicles WHERE id = NEW.vehicle_id),
      NEW.id,
      jsonb_build_object(
        'vehicle_id', NEW.vehicle_id,
        'priority', NEW.priority,
        'reported_issue', NEW.reported_issue
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_vehicle_assignment
  AFTER UPDATE ON vehicle_entries
  FOR EACH ROW EXECUTE FUNCTION notify_vehicle_assignment();

-- Función para notificar ingreso de vehículo al jefe de taller
CREATE OR REPLACE FUNCTION notify_new_vehicle_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    notification_type,
    title,
    message,
    related_vehicle_entry_id,
    metadata
  )
  SELECT 
    id,
    NEW.received_by,
    'NUEVO_INGRESO',
    'Nuevo Vehículo Ingresado',
    'Vehículo con placa ' || 
      (SELECT license_plate FROM vehicles WHERE id = NEW.vehicle_id) || 
      ' ha ingresado al taller',
    NEW.id,
    jsonb_build_object(
      'vehicle_id', NEW.vehicle_id,
      'priority', NEW.priority,
      'reported_issue', NEW.reported_issue
    )
  FROM profiles
  WHERE role = 'JEFE_TALLER' AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_vehicle_entry
  AFTER INSERT ON vehicle_entries
  FOR EACH ROW EXECUTE FUNCTION notify_new_vehicle_entry();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: profiles
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "users_can_view_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Los admins pueden ver todos los perfiles
CREATE POLICY "admins_can_view_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Todos pueden ver perfiles activos (para asignaciones)
CREATE POLICY "authenticated_can_view_active_profiles" ON profiles
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Solo admins pueden insertar/actualizar perfiles
CREATE POLICY "admins_can_manage_profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- POLÍTICAS RLS: vehicles
-- =====================================================

-- Todos los usuarios autenticados pueden ver vehículos
CREATE POLICY "authenticated_can_view_vehicles" ON vehicles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins y jefes de taller pueden gestionar vehículos
CREATE POLICY "privileged_users_can_manage_vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'JEFE_TALLER')
    )
  );

-- =====================================================
-- POLÍTICAS RLS: workspaces
-- =====================================================

-- Todos pueden ver espacios de trabajo
CREATE POLICY "authenticated_can_view_workspaces" ON workspaces
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins y jefes pueden gestionar espacios
CREATE POLICY "privileged_users_can_manage_workspaces" ON workspaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'JEFE_TALLER')
    )
  );

-- =====================================================
-- POLÍTICAS RLS: vehicle_entries
-- =====================================================

-- Todos pueden ver ingresos
CREATE POLICY "authenticated_can_view_entries" ON vehicle_entries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Recepcionistas pueden crear ingresos
CREATE POLICY "receptionists_can_create_entries" ON vehicle_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('RECEPCIONISTA', 'ADMIN', 'JEFE_TALLER')
    )
  );

-- Jefes de taller pueden asignar vehículos
CREATE POLICY "workshop_managers_can_assign_vehicles" ON vehicle_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('JEFE_TALLER', 'ADMIN')
    )
  );

-- Mecánicos pueden actualizar sus asignaciones
CREATE POLICY "mechanics_can_update_assigned_vehicles" ON vehicle_entries
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('JEFE_TALLER', 'ADMIN')
    )
  );

-- =====================================================
-- POLÍTICAS RLS: maintenance_tasks
-- =====================================================

-- Todos pueden ver tareas
CREATE POLICY "authenticated_can_view_tasks" ON maintenance_tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Mecánicos asignados pueden crear y actualizar tareas
CREATE POLICY "assigned_mechanics_can_manage_tasks" ON maintenance_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vehicle_entries ve
      WHERE ve.id = vehicle_entry_id 
      AND ve.assigned_to = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('JEFE_TALLER', 'ADMIN')
    )
  );

-- =====================================================
-- POLÍTICAS RLS: parts_inventory
-- =====================================================

-- Todos pueden ver inventario
CREATE POLICY "authenticated_can_view_inventory" ON parts_inventory
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo almacenistas y admins pueden gestionar inventario
CREATE POLICY "warehouse_can_manage_inventory" ON parts_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ALMACENISTA', 'ADMIN')
    )
  );

-- =====================================================
-- POLÍTICAS RLS: parts_usage
-- =====================================================

-- Todos pueden ver uso de refacciones
CREATE POLICY "authenticated_can_view_parts_usage" ON parts_usage
  FOR SELECT USING (auth.role() = 'authenticated');

-- Mecánicos y almacenistas pueden registrar uso
CREATE POLICY "mechanics_can_register_parts_usage" ON parts_usage
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('MECANICO', 'ALMACENISTA', 'ADMIN', 'JEFE_TALLER')
    )
  );

-- =====================================================
-- POLÍTICAS RLS: notifications
-- =====================================================

-- Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "users_can_view_own_notifications" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

-- Los usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "users_can_update_own_notifications" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- El sistema puede crear notificaciones
CREATE POLICY "system_can_create_notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLÍTICAS RLS: activity_logs
-- =====================================================

-- Solo admins pueden ver logs
CREATE POLICY "admins_can_view_logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- El sistema puede crear logs
CREATE POLICY "system_can_create_logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Resumen de vehículos en taller
CREATE OR REPLACE VIEW vehicle_workshop_summary AS
SELECT 
  ve.id,
  v.license_plate,
  v.brand,
  v.model,
  ve.status,
  ve.priority,
  ve.entry_date,
  p_mechanic.full_name as mechanic_name,
  w.name as workspace_name,
  w.status as workspace_status,
  ve.reported_issue,
  ve.mechanic_observations,
  EXTRACT(EPOCH FROM (NOW() - ve.entry_date))/3600 as hours_in_workshop,
  (SELECT COUNT(*) FROM maintenance_tasks mt 
   WHERE mt.vehicle_entry_id = ve.id) as total_tasks,
  (SELECT COUNT(*) FROM maintenance_tasks mt 
   WHERE mt.vehicle_entry_id = ve.id AND mt.is_completed = true) as completed_tasks
FROM vehicle_entries ve
JOIN vehicles v ON ve.vehicle_id = v.id
LEFT JOIN profiles p_mechanic ON ve.assigned_to = p_mechanic.id
LEFT JOIN workspaces w ON ve.workspace_id = w.id
WHERE ve.status NOT IN ('COMPLETADO', 'CANCELADO')
ORDER BY ve.priority ASC, ve.entry_date ASC;

-- Vista: Estadísticas del taller
CREATE OR REPLACE VIEW workshop_statistics AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'PENDIENTE_ASIGNACION') as pending_assignment,
  COUNT(*) FILTER (WHERE status = 'EN_REVISION') as in_review,
  COUNT(*) FILTER (WHERE status = 'EN_MANTENIMIENTO') as in_maintenance,
  COUNT(*) FILTER (WHERE status = 'ESPERANDO_REFACCIONES') as waiting_parts,
  COUNT(*) FILTER (WHERE status = 'COMPLETADO') as completed_today,
  AVG(EXTRACT(EPOCH FROM (actual_completion_date - entry_date))/3600) 
    FILTER (WHERE actual_completion_date IS NOT NULL 
    AND DATE(actual_completion_date) = CURRENT_DATE) as avg_completion_hours_today
FROM vehicle_entries
WHERE DATE(entry_date) = CURRENT_DATE OR status NOT IN ('COMPLETADO', 'CANCELADO');

-- =====================================================
-- DATOS INICIALES (OPCIONAL)
-- =====================================================

-- Insertar rampas fijas iniciales (7 rampas)
INSERT INTO workspaces (name, workspace_type, status, location_description)
VALUES 
  ('Rampa 1', 'RAMPA_FIJA', 'DISPONIBLE', 'Lado norte del taller'),
  ('Rampa 2', 'RAMPA_FIJA', 'DISPONIBLE', 'Lado norte del taller'),
  ('Rampa 3', 'RAMPA_FIJA', 'DISPONIBLE', 'Lado norte del taller'),
  ('Rampa 4', 'RAMPA_FIJA', 'DISPONIBLE', 'Centro del taller'),
  ('Rampa 5', 'RAMPA_FIJA', 'DISPONIBLE', 'Centro del taller'),
  ('Rampa 6', 'RAMPA_FIJA', 'DISPONIBLE', 'Lado sur del taller'),
  ('Rampa 7', 'RAMPA_FIJA', 'DISPONIBLE', 'Lado sur del taller');

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE profiles IS 'Perfiles de usuarios del sistema con roles y permisos';
COMMENT ON TABLE vehicles IS 'Catálogo de vehículos de la flota MAXIRENT';
COMMENT ON TABLE workspaces IS 'Rampas y espacios de trabajo del taller';
COMMENT ON TABLE vehicle_entries IS 'Registro de ingresos de vehículos al taller';
COMMENT ON TABLE maintenance_tasks IS 'Tareas específicas de mantenimiento por vehículo';
COMMENT ON TABLE parts_inventory IS 'Inventario de refacciones y materiales';
COMMENT ON TABLE parts_usage IS 'Registro de uso de refacciones por vehículo';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones para usuarios';
COMMENT ON TABLE activity_logs IS 'Registro de auditoría de actividades del sistema';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

erDiagram
    %% =====================================================
    %% SISTEMA DE GESTIÓN DE TALLER MAXIRENT
    %% Diagrama de Entidad-Relación
    %% =====================================================

    AUTH_USERS ||--|| PROFILES : "tiene"
    AUTH_USERS ||--o{ VEHICLE_ENTRIES : "recibe_vehiculos"
    AUTH_USERS ||--o{ VEHICLE_ENTRIES : "asigna_vehiculos"
    AUTH_USERS ||--o{ VEHICLE_ENTRIES : "es_asignado"
    AUTH_USERS ||--o{ WORKSPACES : "crea"
    AUTH_USERS ||--o{ MAINTENANCE_TASKS : "completa"
    AUTH_USERS ||--o{ PARTS_USAGE : "usa_refacciones"
    AUTH_USERS ||--o{ PARTS_USAGE : "aprueba_uso"
    AUTH_USERS ||--o{ NOTIFICATIONS : "recibe"
    AUTH_USERS ||--o{ NOTIFICATIONS : "envia"
    AUTH_USERS ||--o{ ACTIVITY_LOGS : "registra_actividad"

    VEHICLES ||--o{ VEHICLE_ENTRIES : "tiene_ingresos"
    
    WORKSPACES ||--o{ VEHICLE_ENTRIES : "aloja"
    
    VEHICLE_ENTRIES ||--o{ MAINTENANCE_TASKS : "contiene"
    VEHICLE_ENTRIES ||--o{ PARTS_USAGE : "consume"
    VEHICLE_ENTRIES ||--o{ NOTIFICATIONS : "relacionada_con"
    
    PARTS_INVENTORY ||--o{ PARTS_USAGE : "es_usado_en"

    %% =====================================================
    %% TABLA: AUTH_USERS (Supabase Auth)
    %% =====================================================
    AUTH_USERS {
        uuid id PK "ID único del usuario"
        string email "Correo electrónico"
        timestamptz created_at "Fecha de creación"
    }

    %% =====================================================
    %% TABLA: PROFILES
    %% =====================================================
    PROFILES {
        uuid id PK,FK "Referencia a auth.users"
        varchar username UK "Nombre de usuario único"
        varchar phone UK "Teléfono único para OTP"
        varchar full_name "Nombre completo"
        enum role "ADMIN, JEFE_TALLER, ALMACENISTA, RECEPCIONISTA, MECANICO"
        text avatar_url "URL de avatar"
        boolean is_active "Estado activo"
        varchar employee_id UK "ID de empleado"
        varchar specialization "Especialización del mecánico"
        timestamptz created_at "Fecha de creación"
        timestamptz updated_at "Última actualización"
        uuid created_by FK "Creado por admin"
    }

    %% =====================================================
    %% TABLA: VEHICLES
    %% =====================================================
    VEHICLES {
        uuid id PK "ID único"
        varchar license_plate UK "Placa única del vehículo"
        varchar vehicle_type "AUTO, CAMIONETA, CAMION"
        varchar brand "Marca"
        varchar model "Modelo"
        integer year "Año"
        varchar vin UK "VIN único"
        varchar fleet_number "Número de flota"
        integer current_mileage "Kilometraje actual"
        date last_maintenance_date "Última fecha de mantenimiento"
        text notes "Notas adicionales"
        boolean is_active "Vehículo activo"
        timestamptz created_at "Fecha de registro"
        timestamptz updated_at "Última actualización"
    }

    %% =====================================================
    %% TABLA: WORKSPACES
    %% =====================================================
    WORKSPACES {
        uuid id PK "ID único"
        varchar name "Nombre del espacio"
        enum workspace_type "RAMPA_FIJA, ESPACIO_TEMPORAL"
        enum status "DISPONIBLE, OCUPADA, EN_MANTENIMIENTO, FUERA_DE_SERVICIO"
        text location_description "Descripción de ubicación"
        integer max_vehicle_capacity "Capacidad máxima"
        boolean is_active "Espacio activo"
        text notes "Notas adicionales"
        timestamptz created_at "Fecha de creación"
        timestamptz updated_at "Última actualización"
        uuid created_by FK "Creado por"
    }

    %% =====================================================
    %% TABLA: VEHICLE_ENTRIES
    %% =====================================================
    VEHICLE_ENTRIES {
        uuid id PK "ID único"
        uuid vehicle_id FK "Vehículo ingresado"
        timestamptz entry_date "Fecha de ingreso"
        text reported_issue "Problema reportado"
        integer priority "1-Urgente a 5-Programado"
        timestamptz estimated_completion_date "Fecha estimada"
        timestamptz actual_completion_date "Fecha real de finalización"
        enum status "PENDIENTE_ASIGNACION, EN_REVISION, EN_MANTENIMIENTO, ESPERANDO_REFACCIONES, COMPLETADO, CANCELADO"
        integer entry_mileage "Kilometraje al ingreso"
        uuid received_by FK "Recepcionista"
        uuid assigned_to FK "Mecánico asignado"
        timestamptz assigned_at "Fecha de asignación"
        uuid assigned_by FK "Asignado por jefe"
        uuid workspace_id FK "Rampa asignada"
        timestamptz workspace_assigned_at "Fecha asignación rampa"
        text mechanic_observations "Observaciones del mecánico"
        timestamptz mechanic_accepted_at "Fecha aceptación mecánico"
        timestamptz created_at "Fecha de creación"
        timestamptz updated_at "Última actualización"
    }

    %% =====================================================
    %% TABLA: MAINTENANCE_TASKS
    %% =====================================================
    MAINTENANCE_TASKS {
        uuid id PK "ID único"
        uuid vehicle_entry_id FK "Ingreso relacionado"
        text task_description "Descripción de tarea"
        boolean is_completed "Tarea completada"
        timestamptz completed_at "Fecha de completado"
        uuid completed_by FK "Completado por"
        decimal estimated_hours "Horas estimadas"
        decimal actual_hours "Horas reales"
        text notes "Notas adicionales"
        timestamptz created_at "Fecha de creación"
        timestamptz updated_at "Última actualización"
    }

    %% =====================================================
    %% TABLA: PARTS_INVENTORY
    %% =====================================================
    PARTS_INVENTORY {
        uuid id PK "ID único"
        varchar part_number UK "Número de parte único"
        varchar part_name "Nombre de refacción"
        text description "Descripción"
        varchar category "Categoría"
        decimal unit_price "Precio unitario"
        integer current_stock "Stock actual"
        integer minimum_stock "Stock mínimo"
        varchar location "Ubicación en almacén"
        varchar supplier "Proveedor"
        boolean is_active "Refacción activa"
        timestamptz created_at "Fecha de registro"
        timestamptz updated_at "Última actualización"
    }

    %% =====================================================
    %% TABLA: PARTS_USAGE
    %% =====================================================
    PARTS_USAGE {
        uuid id PK "ID único"
        uuid vehicle_entry_id FK "Ingreso relacionado"
        uuid part_id FK "Refacción usada"
        integer quantity "Cantidad usada"
        decimal unit_price "Precio unitario"
        decimal total_price "Precio total calculado"
        uuid used_by FK "Usado por mecánico"
        uuid approved_by FK "Aprobado por"
        text notes "Notas adicionales"
        timestamptz created_at "Fecha de uso"
    }

    %% =====================================================
    %% TABLA: NOTIFICATIONS
    %% =====================================================
    NOTIFICATIONS {
        uuid id PK "ID único"
        uuid recipient_id FK "Destinatario"
        uuid sender_id FK "Remitente"
        enum notification_type "NUEVO_INGRESO, ASIGNACION_VEHICULO, SOLICITUD_REFACCIONES, VEHICULO_COMPLETADO, ALERTA_SISTEMA"
        varchar title "Título"
        text message "Mensaje"
        enum status "PENDIENTE, LEIDA, ATENDIDA"
        uuid related_vehicle_entry_id FK "Ingreso relacionado"
        jsonb metadata "Datos adicionales JSON"
        timestamptz read_at "Fecha de lectura"
        timestamptz attended_at "Fecha de atención"
        timestamptz created_at "Fecha de creación"
        timestamptz expires_at "Fecha de expiración"
    }

    %% =====================================================
    %% TABLA: ACTIVITY_LOGS
    %% =====================================================
    ACTIVITY_LOGS {
        uuid id PK "ID único"
        uuid user_id FK "Usuario que realiza acción"
        varchar action "Acción realizada"
        varchar entity_type "Tipo de entidad"
        uuid entity_id "ID de entidad"
        jsonb old_values "Valores anteriores JSON"
        jsonb new_values "Valores nuevos JSON"
        inet ip_address "Dirección IP"
        text user_agent "Agente de usuario"
        timestamptz created_at "Fecha de registro"
    }
