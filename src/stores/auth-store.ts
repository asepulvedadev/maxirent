// Store de Zustand para gestión de estado de autenticación
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase'
import { authService, type AuthUser } from '@/lib/auth'

interface AuthState {
  // Estado
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean

  // Acciones
  signIn: (credentials: { identifier: string; password: string }) => Promise<{ success: boolean; error?: string }>
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>

  // Utilidades
  hasRole: (roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isLoading: true,
      isAuthenticated: false,

      // Iniciar sesión con credenciales
      signIn: async (credentials) => {
        set({ isLoading: true })

        try {
          const supabase = createClient()

          // Intentar login con email/usuario y contraseña
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.identifier.includes('@') ? credentials.identifier : `${credentials.identifier}@maxirent.local`,
            password: credentials.password,
          })

          if (error) {
            set({ isLoading: false })
            return { success: false, error: 'Credenciales inválidas' }
          }

          if (data.user) {
            // Obtener perfil completo
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError || !profile) {
              set({ isLoading: false })
              return { success: false, error: 'Perfil no encontrado' }
            }

            const user: AuthUser = {
              ...profile,
              email: data.user.email
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })

            return { success: true }
          }

          set({ isLoading: false })
          return { success: false, error: 'Error desconocido' }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          }
        }
      },

      // Iniciar sesión con teléfono
      signInWithPhone: async (phone) => {
        set({ isLoading: true })

        try {
          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOtp({
            phone: phone.startsWith('+') ? phone : `+52${phone}`,
          })

          if (error) {
            set({ isLoading: false })
            return { success: false, error: 'Error al enviar código' }
          }

          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          }
        }
      },

      // Verificar OTP
      verifyOtp: async (phone, token) => {
        set({ isLoading: true })

        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.verifyOtp({
            phone: phone.startsWith('+') ? phone : `+52${phone}`,
            token,
            type: 'sms',
          })

          if (error || !data.user) {
            set({ isLoading: false })
            return { success: false, error: 'Código inválido' }
          }

          // Obtener perfil completo
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError || !profile) {
            set({ isLoading: false })
            return { success: false, error: 'Perfil no encontrado' }
          }

          const user: AuthUser = {
            ...profile,
            email: data.user.email
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          }
        }
      },

      // Cerrar sesión
      signOut: async () => {
        set({ isLoading: true })

        try {
          const supabase = createClient()
          await supabase.auth.signOut()

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          console.error('Error al cerrar sesión:', error)
          // Forzar logout del estado local aunque falle la API
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      // Refrescar datos del usuario
      refreshUser: async () => {
        set({ isLoading: true })

        try {
          const user = await authService.getCurrentUser()

          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          })
        } catch (error) {
          console.error('Error al refrescar usuario:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      // Inicializar estado de autenticación
      initialize: async () => {
        set({ isLoading: true })

        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()

          if (session?.user) {
            // Obtener perfil completo
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profile) {
              const user: AuthUser = {
                ...profile,
                email: session.user.email
              }
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              })
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              })
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Error al inicializar auth:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      // Verificar roles
      hasRole: (roles) => {
        const { user } = get()
        if (!user) return false
        return roles.includes(user.role)
      },

      // Verificar permisos
      hasPermission: (permission) => {
        const { user } = get()
        return authService.hasPermission(user, permission)
      },
    }),
    {
      name: 'maxirent-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hook personalizado para inicializar auth al cargar la app
export function useAuthInit() {
  const initialize = useAuthStore((state) => state.initialize)
  const isLoading = useAuthStore((state) => state.isLoading)

  return { initialize, isLoading }
}

// Initialize auth store on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()

  // Listen for auth changes
  const supabase = createClient()
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Obtener perfil completo
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        const user: AuthUser = {
          ...profile,
          email: session.user.email
        }
        useAuthStore.setState({ user, isAuthenticated: true })
      }
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ user: null, isAuthenticated: false })
    }
  })
}

// Hook para obtener información del usuario actual
export function useCurrentUser() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  return { user, isAuthenticated, isLoading }
}

// Hook para acciones de autenticación
export function useAuthActions() {
  const signIn = useAuthStore((state) => state.signIn)
  const signInWithPhone = useAuthStore((state) => state.signInWithPhone)
  const verifyOtp = useAuthStore((state) => state.verifyOtp)
  const signOut = useAuthStore((state) => state.signOut)
  const refreshUser = useAuthStore((state) => state.refreshUser)

  return { signIn, signInWithPhone, verifyOtp, signOut, refreshUser }
}

// Hook para verificar permisos
export function usePermissions() {
  const hasRole = useAuthStore((state) => state.hasRole)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  return { hasRole, hasPermission }
}