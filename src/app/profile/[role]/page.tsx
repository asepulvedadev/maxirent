'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DEMO_USERS, getUserProfileInfo, type DemoUser } from '@/lib/demo-users'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Wrench,
  Edit,
  Save,
  X,
  CheckCircle
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const _params = useParams()
  const [user, setUser] = useState<DemoUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<DemoUser>>({})

  useEffect(() => {
    // Verificar si hay un usuario demo en localStorage
    const demoUserData = localStorage.getItem('maxirent-demo-user')
    if (demoUserData) {
      try {
        const parsedUser = JSON.parse(demoUserData)
        const foundUser = DEMO_USERS.find(u => u.id === parsedUser.id)
        if (foundUser) {
          setUser(foundUser)
          setEditedUser(foundUser)
        }
      } catch (error) {
        console.error('Error parsing demo user:', error)
      }
    }
    setLoading(false)
  }, [])

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    // En una implementación real, aquí se haría la llamada a la API
    // Para demo, solo actualizamos el estado local
    if (user) {
      const updatedUser = { ...user, ...editedUser }
      setUser(updatedUser)
      localStorage.setItem('maxirent-demo-user', JSON.stringify(updatedUser))
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser(user || {})
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">MR</span>
          </div>
          <p className="text-slate-300">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const profileInfo = getUserProfileInfo(user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-orange-500 text-white text-2xl">
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-2">{user.full_name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    <Badge className={`${profileInfo.roleColor} text-white text-sm px-3 py-1`}>
                      {profileInfo.roleDisplay}
                    </Badge>
                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                      ID: {user.employee_id}
                    </Badge>
                    {user.specialization && (
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        <Wrench className="w-3 h-3 mr-1" />
                        {user.specialization}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Activo desde {new Date(user.created_at || Date.now()).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={handleEdit}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Información Personal */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Datos personales y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Nombre Completo
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedUser.full_name || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, full_name: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{user.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedUser.email || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedUser.phone || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{user.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    ID de Empleado
                  </label>
                  <p className="text-slate-400">{user.employee_id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Información Profesional */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Información Profesional
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Rol y especialización en el taller
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Rol en el Sistema
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge className={`${profileInfo.roleColor} text-white`}>
                      {profileInfo.roleDisplay}
                    </Badge>
                  </div>
                </div>

                {user.specialization && (
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">
                      Especialización
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedUser.specialization || ''}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, specialization: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    ) : (
                      <p className="text-white">{user.specialization}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Estado
                  </label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-400">Activo</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">
                    Fecha de Registro
                  </label>
                  <p className="text-slate-400">
                    {new Date(user.created_at || Date.now()).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permisos y Responsabilidades */}
          <Card className="bg-slate-800/50 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permisos y Responsabilidades
              </CardTitle>
              <CardDescription className="text-slate-400">
                Funciones y permisos asignados a tu rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {profileInfo.permissions.map((permission, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas (solo para roles específicos) */}
          {(user.role === 'MECANICO' || user.role === 'JEFE_TALLER') && (
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-1">8</div>
                  <div className="text-slate-400 text-sm">Vehículos atendidos</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-1">95%</div>
                  <div className="text-slate-400 text-sm">Tasa de éxito</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-1">4.8</div>
                  <div className="text-slate-400 text-sm">Calificación promedio</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}