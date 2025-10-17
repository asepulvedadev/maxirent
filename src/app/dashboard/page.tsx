'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_USERS, getUserProfileInfo, type DemoUser } from '@/lib/demo-users'
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
  Phone
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<DemoUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario demo en localStorage
    const demoUserData = localStorage.getItem('maxirent-demo-user')
    if (demoUserData) {
      try {
        const parsedUser = JSON.parse(demoUserData)
        const foundUser = DEMO_USERS.find(u => u.id === parsedUser.id)
        if (foundUser) {
          setUser(foundUser)
        }
      } catch (error) {
        console.error('Error parsing demo user:', error)
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('maxirent-demo-user')
    router.push('/login')
  }

  const handleProfileClick = () => {
    if (user) {
      router.push(`/profile/${user.role.toLowerCase()}`)
    }
  }

  if (loading) {
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

  if (!user) {
    router.push('/login')
    return null
  }

  const profileInfo = getUserProfileInfo(user)

  // Funciones específicas por rol
  const getRoleSpecificContent = () => {
    switch (user.role) {
      case 'ADMIN':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Crear, editar y gestionar usuarios del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Gestionar Usuarios
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Reportes y Analytics
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ver estadísticas completas del taller
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Ver Reportes
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuración del Sistema
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configurar parámetros del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-500 hover:bg-purple-600">
                  Configuración
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'JEFE_TALLER':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Asignar Vehículos
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Asignar vehículos a mecánicos disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Asignar Vehículos
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Supervisar Reparaciones
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ver progreso de todas las reparaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Ver Reparaciones
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Gestionar Refacciones
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Aprobar solicitudes de refacciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Gestionar Refacciones
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'ALMACENISTA':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventario de Refacciones
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Gestionar stock y registrar movimientos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Gestionar Inventario
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alertas de Stock
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ver productos con stock bajo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-red-500 hover:bg-red-600">
                  Ver Alertas
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'RECEPCIONISTA':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Registrar Vehículos
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ingresar nuevos vehículos al taller
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Nuevo Ingreso
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Atención al Cliente
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Gestionar consultas de clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-500 hover:bg-purple-600">
                  Ver Consultas
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'MECANICO':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Mis Asignaciones
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ver vehículos asignados para reparar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Ver Asignaciones
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Solicitar Refacciones
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Pedir refacciones para reparaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-500 hover:bg-green-600">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MR</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">MAXIRENT</h1>
                  <p className="text-sm text-slate-400">Sistema de Gestión de Taller</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleProfileClick}
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-slate-300 hover:text-red-400 hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-orange-500 text-white text-xl">
                {user.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-white">¡Bienvenido, {user.full_name}!</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${profileInfo.roleColor} text-white`}>
                  {profileInfo.roleDisplay}
                </Badge>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">ID: {user.employee_id}</span>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className={`w-8 h-8 ${profileInfo.roleColor} rounded-lg p-2 flex-shrink-0`} />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Tus Permisos y Responsabilidades
                  </h3>
                  <ul className="text-slate-300 space-y-1">
                    {profileInfo.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific Content */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Funciones Disponibles</h3>
          {getRoleSpecificContent()}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Car className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-slate-400 text-sm">Vehículos en taller</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Wrench className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-slate-400 text-sm">En reparación</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">3</p>
                  <p className="text-slate-400 text-sm">Esperando refacciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-slate-400 text-sm">Mecánicos activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}