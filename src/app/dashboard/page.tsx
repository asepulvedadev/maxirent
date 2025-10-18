'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { getUserProfileInfo } from '@/lib/demo-users'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Settings,
  LogOut,
  Car,
  Wrench,
  Package,
  Users,
  BarChart3,
  Bell,
  ChevronRight,
  Shield,
  Phone,
  Menu,
  X,
  Home,
  ClipboardList,
  Truck,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, signOut } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleProfileClick = () => {
    if (user) {
      router.push(`/profile/${user.role.toLowerCase()}`)
    }
  }

  // Función helper para crear perfil info compatible
  const getProfileInfo = (user: any) => {
    return getUserProfileInfo({
      role: user.role,
      full_name: user.full_name,
      employee_id: user.employee_id
    } as any)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">MR</span>
          </div>
          <p className="text-slate-300">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  const profileInfo = getProfileInfo(user)

  // Función para obtener items de navegación según el rol
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'Perfil', icon: User },
    ]

    switch (user.role) {
      case 'ADMIN':
        return [
          ...baseItems,
          { id: 'users', label: 'Usuarios', icon: Users },
          { id: 'reports', label: 'Reportes', icon: BarChart3 },
          { id: 'settings', label: 'Configuración', icon: Settings },
        ]
      case 'JEFE_TALLER':
        return [
          ...baseItems,
          { id: 'assignments', label: 'Asignaciones', icon: ClipboardList },
          { id: 'vehicles', label: 'Vehículos', icon: Car },
          { id: 'supervision', label: 'Supervisión', icon: TrendingUp },
        ]
      case 'ALMACENISTA':
        return [
          ...baseItems,
          { id: 'inventory', label: 'Inventario', icon: Package },
          { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
          { id: 'suppliers', label: 'Proveedores', icon: Truck },
        ]
      case 'RECEPCIONISTA':
        return [
          ...baseItems,
          { id: 'new-entry', label: 'Nuevo Ingreso', icon: Car },
          { id: 'entries', label: 'Ingresos', icon: FileText },
          { id: 'customers', label: 'Clientes', icon: Users },
        ]
      case 'MECANICO':
        return [
          ...baseItems,
          { id: 'my-work', label: 'Mi Trabajo', icon: Wrench },
          { id: 'parts', label: 'Refacciones', icon: Package },
          { id: 'tasks', label: 'Tareas', icon: ClipboardList },
        ]
      default:
        return baseItems
    }
  }

  // Función para renderizar el contenido según la vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboardContent()
      case 'profile':
        return renderProfileContent()
      case 'users':
        return renderUsersContent()
      case 'reports':
        return renderReportsContent()
      case 'settings':
        return renderSettingsContent()
      case 'assignments':
        return renderAssignmentsContent()
      case 'vehicles':
        return renderVehiclesContent()
      case 'supervision':
        return renderSupervisionContent()
      case 'inventory':
        return renderInventoryContent()
      case 'alerts':
        return renderAlertsContent()
      case 'suppliers':
        return renderSuppliersContent()
      case 'new-entry':
        return renderNewEntryContent()
      case 'entries':
        return renderEntriesContent()
      case 'customers':
        return renderCustomersContent()
      case 'my-work':
        return renderMyWorkContent()
      case 'parts':
        return renderPartsContent()
      case 'tasks':
        return renderTasksContent()
      default:
        return renderDashboardContent()
    }
  }

  // Funciones de renderizado de contenido
  const renderDashboardContent = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 mb-6">
          <Avatar className="w-16 h-16 lg:w-20 lg:h-20">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-orange-500 text-white text-xl lg:text-2xl font-bold">
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">¡Bienvenido, {user.full_name}!</h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <Badge className={`${profileInfo.roleColor} text-white px-3 lg:px-4 py-1 text-xs lg:text-sm font-semibold`}>
                {profileInfo.roleDisplay}
              </Badge>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-400 text-sm">ID: {user.employee_id}</span>
            </div>
          </div>
        </div>

        {/* Role Description */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 lg:p-8">
            <div className="flex items-start gap-4 lg:gap-6">
              <Shield className={`w-10 h-10 lg:w-12 lg:h-12 ${profileInfo.roleColor} rounded-xl p-2 lg:p-3 flex-shrink-0`} />
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-3">
                  Tus Permisos y Responsabilidades
                </h3>
                <ul className="text-slate-300 space-y-2">
                  {profileInfo.permissions.map((permission, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{permission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 lg:mb-8">
        <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-3 lg:p-4 bg-blue-500/20 rounded-xl">
                <Car className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white">12</p>
                <p className="text-slate-400 text-xs lg:text-sm">Vehículos en taller</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-3 lg:p-4 bg-green-500/20 rounded-xl">
                <Wrench className="w-6 h-6 lg:w-8 lg:h-8 text-green-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white">8</p>
                <p className="text-slate-400 text-xs lg:text-sm">En reparación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-3 lg:p-4 bg-orange-500/20 rounded-xl">
                <Package className="w-6 h-6 lg:w-8 lg:h-8 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white">3</p>
                <p className="text-slate-400 text-xs lg:text-sm">Esperando refacciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-3 lg:p-4 bg-purple-500/20 rounded-xl">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white">5</p>
                <p className="text-slate-400 text-xs lg:text-sm">Mecánicos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funciones Disponibles */}
      <div>
        <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6">Funciones Disponibles</h2>
        {getRoleSpecificContent()}
      </div>
    </div>
  )

  const renderProfileContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Información del perfil aquí...</p>
        </CardContent>
      </Card>
    </div>
  )

  // Placeholder functions for other views
  const renderUsersContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de gestión de usuarios...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderReportsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Reportes y Analytics</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de reportes...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configuración del Sistema</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de configuración...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderAssignmentsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Asignaciones de Vehículos</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de asignaciones...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderVehiclesContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestión de Vehículos</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de vehículos...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderSupervisionContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Supervisión de Reparaciones</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de supervisión...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderInventoryContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Inventario de Refacciones</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de inventario...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderAlertsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Alertas de Stock</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de alertas...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderSuppliersContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Proveedores</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de proveedores...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderNewEntryContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Nuevo Ingreso de Vehículo</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de nuevo ingreso...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderEntriesContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Ingresos de Vehículos</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de ingresos...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderCustomersContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Clientes</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de clientes...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderMyWorkContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Mi Trabajo</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de trabajo asignado...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderPartsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Refacciones</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de refacciones...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderTasksContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Tareas</h2>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Vista de tareas...</p>
        </CardContent>
      </Card>
    </div>
  )

  // Funciones específicas por rol
  const getRoleSpecificContent = () => {
    switch (user.role) {
      case 'ADMIN':
        return (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('users')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                  </div>
                  <span className="text-base lg:text-lg">Gestión de Usuarios</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Crear, editar y gestionar usuarios del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-sm lg:text-base">
                  Gestionar Usuarios
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('reports')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                  </div>
                  <span className="text-base lg:text-lg">Reportes y Analytics</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Ver estadísticas completas del taller
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-sm lg:text-base">
                  Ver Reportes
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('settings')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                  </div>
                  <span className="text-base lg:text-lg">Configuración del Sistema</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Configurar parámetros del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-sm lg:text-base">
                  Configuración
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'JEFE_TALLER':
        return (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('assignments')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Car className="w-5 h-5 lg:w-6 lg:h-6 text-orange-400" />
                  </div>
                  <span className="text-base lg:text-lg">Asignar Vehículos</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Asignar vehículos a mecánicos disponibles
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-sm lg:text-base">
                  Asignar Vehículos
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('supervision')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                  </div>
                  <span className="text-base lg:text-lg">Supervisar Reparaciones</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Ver progreso de todas las reparaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-sm lg:text-base">
                  Ver Reparaciones
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('vehicles')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                  </div>
                  <span className="text-base lg:text-lg">Gestionar Refacciones</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Aprobar solicitudes de refacciones
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-sm lg:text-base">
                  Gestionar Refacciones
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'ALMACENISTA':
        return (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('inventory')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                  </div>
                  <span className="text-base lg:text-lg">Inventario de Refacciones</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Gestionar stock y registrar movimientos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-sm lg:text-base">
                  Gestionar Inventario
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('alerts')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
                  </div>
                  <span className="text-base lg:text-lg">Alertas de Stock</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Ver productos con stock bajo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-sm lg:text-base">
                  Ver Alertas
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'RECEPCIONISTA':
        return (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('new-entry')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Car className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                  </div>
                  <span className="text-base lg:text-lg">Registrar Vehículos</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Ingresar nuevos vehículos al taller
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-sm lg:text-base">
                  Nuevo Ingreso
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('customers')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                  </div>
                  <span className="text-base lg:text-lg">Atención al Cliente</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Gestionar consultas de clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-sm lg:text-base">
                  Ver Consultas
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'MECANICO':
        return (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('my-work')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-orange-400" />
                  </div>
                  <span className="text-base lg:text-lg">Mis Asignaciones</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Ver vehículos asignados para reparar
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-sm lg:text-base">
                  Ver Asignaciones
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all cursor-pointer" onClick={() => setActiveView('parts')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                  </div>
                  <span className="text-base lg:text-lg">Solicitar Refacciones</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Pedir refacciones para reparaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-sm lg:text-base">
                  Solicitar Refacciones
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Mobile Menu Button - Always visible on mobile */}
      <button
        onClick={() => setSidebarCollapsed(false)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-900 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-80'
      } flex flex-col shadow-xl`}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm lg:text-base">MR</span>
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-lg font-bold text-white">MAXIRENT</h1>
                  <p className="text-sm text-slate-400">Sistema de Taller</p>
                </div>
              </div>
            )}
            <Button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-2"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1">
          {getNavigationItems().map((item) => (
            <Button
              key={item.id}
              onClick={() => {
                setActiveView(item.id)
                // Close mobile menu on navigation
                if (window.innerWidth < 1024) {
                  setSidebarCollapsed(true)
                }
              }}
              variant="ghost"
              className={`w-full justify-center lg:justify-start text-left h-12 rounded-lg transition-all ${
                activeView === item.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              } ${sidebarCollapsed ? 'px-2' : 'px-4'}`}
            >
              <item.icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate hidden lg:inline">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-3 lg:p-4 border-t border-slate-800">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-orange-500 text-white font-semibold text-sm">
                {user.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 hidden lg:block">
                <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                <Badge className={`${profileInfo.roleColor} text-white text-xs mt-1`}>
                  {profileInfo.roleDisplay}
                </Badge>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex gap-2 mt-4 lg:flex">
              <Button
                onClick={() => setActiveView('profile')}
                variant="ghost"
                size="sm"
                className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="flex-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          )}

          {/* Mobile Action Buttons */}
          {!sidebarCollapsed && (
            <div className="flex gap-2 mt-4 lg:hidden">
              <Button
                onClick={() => {
                  setActiveView('profile')
                  setSidebarCollapsed(true)
                }}
                variant="ghost"
                size="sm"
                className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="flex-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 bg-slate-950 overflow-hidden ${sidebarCollapsed ? 'lg:ml-16' : ''}`}>
        <div className="h-full p-4 lg:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}