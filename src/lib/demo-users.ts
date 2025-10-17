// Usuarios de demostración para MAXIRENT
export interface DemoUser {
  id: string
  username: string
  email: string
  password: string
  phone: string
  full_name: string
  role: 'ADMIN' | 'JEFE_TALLER' | 'ALMACENISTA' | 'RECEPCIONISTA' | 'MECANICO'
  employee_id: string
  specialization?: string
  avatar_url?: string
  created_at?: string
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@maxirent.com',
    password: 'admin123',
    phone: '5551000001',
    full_name: 'Carlos Rodríguez',
    role: 'ADMIN',
    employee_id: 'ADM001',
    avatar_url: '/avatars/admin.jpg'
  },
  {
    id: 'jefe-taller-001',
    username: 'jefetaller',
    email: 'jefe.taller@maxirent.com',
    password: 'jefe123',
    phone: '5551000002',
    full_name: 'Roberto García',
    role: 'JEFE_TALLER',
    employee_id: 'JEF001',
    specialization: 'Supervisor General',
    avatar_url: '/avatars/jefe-taller.jpg'
  },
  {
    id: 'almacenista-001',
    username: 'almacenista',
    email: 'almacen@maxirent.com',
    password: 'alma123',
    phone: '5551000003',
    full_name: 'María López',
    role: 'ALMACENISTA',
    employee_id: 'ALM001',
    specialization: 'Control de Inventario',
    avatar_url: '/avatars/almacenista.jpg'
  },
  {
    id: 'recepcionista-001',
    username: 'recepcionista',
    email: 'recepcion@maxirent.com',
    password: 'recep123',
    phone: '5551000004',
    full_name: 'Ana Martínez',
    role: 'RECEPCIONISTA',
    employee_id: 'REC001',
    specialization: 'Atención al Cliente',
    avatar_url: '/avatars/recepcionista.jpg'
  },
  {
    id: 'mecanico-001',
    username: 'mecanico1',
    email: 'mecanico1@maxirent.com',
    password: 'meca123',
    phone: '5551000005',
    full_name: 'José Hernández',
    role: 'MECANICO',
    employee_id: 'MEC001',
    specialization: 'Mecánica General',
    avatar_url: '/avatars/mecanico1.jpg'
  },
  {
    id: 'mecanico-002',
    username: 'mecanico2',
    email: 'mecanico2@maxirent.com',
    password: 'meca123',
    phone: '5551000006',
    full_name: 'Luis Sánchez',
    role: 'MECANICO',
    employee_id: 'MEC002',
    specialization: 'Electricidad Automotriz',
    avatar_url: '/avatars/mecanico2.jpg'
  },
  {
    id: 'mecanico-003',
    username: 'mecanico3',
    email: 'mecanico3@maxirent.com',
    password: 'meca123',
    phone: '5551000007',
    full_name: 'Pedro Ramírez',
    role: 'MECANICO',
    employee_id: 'MEC003',
    specialization: 'Suspensión y Frenos',
    avatar_url: '/avatars/mecanico3.jpg'
  }
]

// Función para obtener usuario por username
export function getDemoUserByUsername(username: string): DemoUser | undefined {
  return DEMO_USERS.find(user => user.username === username)
}

// Función para obtener usuario por email
export function getDemoUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find(user => user.email === email)
}

// Función para obtener usuarios por rol
export function getDemoUsersByRole(role: string): DemoUser[] {
  return DEMO_USERS.filter(user => user.role === role)
}

// Función para validar credenciales de demo
export function validateDemoCredentials(identifier: string, password: string): DemoUser | null {
  // Buscar por username
  let user = getDemoUserByUsername(identifier)
  if (!user) {
    // Buscar por email
    user = getDemoUserByEmail(identifier)
  }

  if (user && user.password === password) {
    return user
  }

  return null
}

// Función para obtener información de perfil formateada
export function getUserProfileInfo(user: DemoUser) {
  return {
    ...user,
    roleDisplay: getRoleDisplayName(user.role),
    roleColor: getRoleColor(user.role),
    permissions: getRolePermissions(user.role)
  }
}

// Función para obtener nombre display del rol
function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    ADMIN: 'Administrador',
    JEFE_TALLER: 'Jefe de Taller',
    ALMACENISTA: 'Almacenista',
    RECEPCIONISTA: 'Recepcionista',
    MECANICO: 'Mecánico'
  }
  return roleNames[role] || role
}

// Función para obtener color del rol
function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-500',
    JEFE_TALLER: 'bg-blue-500',
    ALMACENISTA: 'bg-green-500',
    RECEPCIONISTA: 'bg-purple-500',
    MECANICO: 'bg-orange-500'
  }
  return roleColors[role] || 'bg-gray-500'
}

// Función para obtener permisos del rol
function getRolePermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    ADMIN: [
      'Gestión completa del sistema',
      'Crear y gestionar usuarios',
      'Ver todos los reportes',
      'Configurar sistema',
      'Acceso a auditoría'
    ],
    JEFE_TALLER: [
      'Asignar vehículos a mecánicos',
      'Gestionar espacios de trabajo',
      'Supervisar progreso de reparaciones',
      'Aprobar uso de refacciones',
      'Ver estadísticas del taller'
    ],
    ALMACENISTA: [
      'Gestionar inventario de refacciones',
      'Registrar entradas y salidas',
      'Alertas de stock bajo',
      'Pedidos a proveedores',
      'Control de existencias'
    ],
    RECEPCIONISTA: [
      'Registrar ingreso de vehículos',
      'Capturar información del cliente',
      'Asignar prioridad de reparación',
      'Generar órdenes de trabajo',
      'Atención al cliente'
    ],
    MECANICO: [
      'Ver vehículos asignados',
      'Registrar tareas realizadas',
      'Solicitar refacciones',
      'Actualizar estado de reparación',
      'Agregar observaciones técnicas'
    ]
  }
  return permissions[role] || []
}