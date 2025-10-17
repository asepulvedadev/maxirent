'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, isLoading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Mostrar loading mientras se inicializa la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">MR</span>
          </div>
          <p className="text-slate-300">Cargando MAXIRENT...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}