// Utilidades de autenticación para MAXIRENT
import { createClient } from './supabase'
import type { Database } from './supabase'

type User = Database['public']['Tables']['profiles']['Row']
type UserRole = Database['public']['Enums']['user_role']

export interface AuthUser extends User {
  email?: string
}

// Estado de autenticación
export class AuthService {
  private supabase = createClient()

  // Iniciar sesión con email/usuario y contraseña
  async signIn(credentials: { identifier: string; password: string }) {
    try {
      // Primero intentar con email
      let authResult = await this.supabase.auth.signInWithPassword({
        email: credentials.identifier,
        password: credentials.password,
      })

      // Si falla, intentar con username (buscar email por username)
      if (authResult.error && authResult.error.message.includes('Invalid login credentials')) {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('id')
          .eq('username', credentials.identifier)
          .single()

        if (profile) {
          // Obtener el email del usuario de auth.users
          const { data: authUser } = await this.supabase.auth.admin.getUserById(profile.id)
          if (authUser.user?.email) {
            authResult = await this.supabase.auth.signInWithPassword({
              email: authUser.user.email,
              password: credentials.password,
            })
          }
        }
      }

      if (authResult.error) throw authResult.error

      // Obtener perfil completo
      const user = await this.getCurrentUser()
      return { user, error: null }
    } catch (error) {
      console.error('Error en signIn:', error)
      return { user: null, error: error as Error }
    }
  }

  // Iniciar sesión con teléfono y OTP
  async signInWithPhone(phone: string) {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+52${phone}`,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error en signInWithPhone:', error)
      return { error: error as Error }
    }
  }

  // Verificar OTP
  async verifyOtp(phone: string, token: string) {
    try {
      const { data: _data, error } = await this.supabase.auth.verifyOtp({
        phone: phone.startsWith('+') ? phone : `+52${phone}`,
        token,
        type: 'sms',
      })

      if (error) throw error

      // Obtener perfil completo
      const user = await this.getCurrentUser()
      return { user, error: null }
    } catch (error) {
      console.error('Error en verifyOtp:', error)
      return { user: null, error: error as Error }
    }
  }

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error en signOut:', error)
      return { error: error as Error }
    }
  }

  // Obtener usuario actual con perfil completo
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser()

      if (authError || !authUser) return null

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError || !profile) return null

      return {
        ...profile,
        email: authUser.email,
      }
    } catch (error) {
      console.error('Error en getCurrentUser:', error)
      return null
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }

  // Verificar permisos por rol
  hasRole(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  // Verificar permisos específicos
  hasPermission(user: AuthUser | null, permission: string): boolean {
    if (!user) return false

    const rolePermissions: Record<UserRole, string[]> = {
      ADMIN: ['*'], // Todos los permisos
      JEFE_TALLER: [
        'vehicles.read',
        'vehicles.create',
        'vehicles.update',
        'workspaces.read',
        'workspaces.manage',
        'vehicle_entries.read',
        'vehicle_entries.assign',
        'vehicle_entries.update',
        'maintenance_tasks.read',
        'maintenance_tasks.manage',
        'parts_usage.approve',
        'notifications.read',
        'notifications.send',
        'reports.read',
      ],
      MECANICO: [
        'vehicles.read',
        'workspaces.read',
        'vehicle_entries.read_assigned',
        'vehicle_entries.update_assigned',
        'maintenance_tasks.read_assigned',
        'maintenance_tasks.manage_assigned',
        'parts_usage.create',
        'parts_usage.read',
        'notifications.read',
      ],
      RECEPCIONISTA: [
        'vehicles.read',
        'vehicles.create',
        'vehicle_entries.create',
        'vehicle_entries.read',
        'notifications.read',
      ],
      ALMACENISTA: [
        'parts_inventory.read',
        'parts_inventory.manage',
        'parts_usage.read',
        'parts_usage.approve',
        'notifications.read',
        'notifications.send',
      ],
    }

    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  // Crear usuario (solo ADMIN)
  async createUser(userData: {
    email: string
    password: string
    username: string
    full_name: string
    phone?: string
    role: UserRole
    employee_id?: string
    specialization?: string
  }) {
    try {
      // Crear usuario en auth
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      })

      if (authError) throw authError

      // Crear perfil
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: userData.username,
          phone: userData.phone,
          full_name: userData.full_name,
          role: userData.role,
          employee_id: userData.employee_id,
          specialization: userData.specialization,
          created_by: (await this.getCurrentUser())?.id,
        })

      if (profileError) throw profileError

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Error en createUser:', error)
      return { user: null, error: error as Error }
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(userId: string, updates: Partial<AuthUser>) {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error en updateProfile:', error)
      return { error: error as Error }
    }
  }

  // Cambiar contraseña
  async changePassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error en changePassword:', error)
      return { error: error as Error }
    }
  }

  // Resetear contraseña
  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error en resetPassword:', error)
      return { error: error as Error }
    }
  }

  // Listener para cambios de estado de autenticación
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else if (event === 'SIGNED_OUT') {
        callback(null)
      }
    })
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService()

// Hook personalizado para usar autenticación (se implementará con Zustand después)
export function useAuth() {
  return authService
}