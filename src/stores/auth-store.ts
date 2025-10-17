// Store de Zustand para gestión de estado de autenticación
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
          const { user, error } = await authService.signIn(credentials)

          if (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
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

      // Iniciar sesión con teléfono
      signInWithPhone: async (phone) => {
        set({ isLoading: true })

        try {
          const { error } = await authService.signInWithPhone(phone)

          if (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
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
          const { user, error } = await authService.verifyOtp(phone, token)

          if (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
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
          await authService.signOut()

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
          const user = await authService.getCurrentUser()

          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          })
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