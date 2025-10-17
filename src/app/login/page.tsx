'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Phone, User, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, signIn, signInWithPhone, verifyOtp } = useAuthStore()

  // Estados para login con credenciales
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Estados para login con teléfono
  const [phoneData, setPhoneData] = useState({
    phone: '',
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, isLoading, router])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-300">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar el login
  if (isAuthenticated) {
    return null
  }

  const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      const { success, error } = await signIn(credentials)

      if (success) {
        router.push('/dashboard')
      } else {
        setLoginError(error || 'Error al iniciar sesión')
      }
    } catch (error) {
      setLoginError('Error inesperado al iniciar sesión')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSendOtp = async () => {
    setPhoneError('')
    setIsSendingOtp(true)

    try {
      const { success, error } = await signInWithPhone(phoneData.phone)

      if (success) {
        setOtpSent(true)
      } else {
        setPhoneError(error || 'Error al enviar código')
      }
    } catch (error) {
      setPhoneError('Error inesperado al enviar código')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    setPhoneError('')
    setIsVerifyingOtp(true)

    try {
      const { success, error } = await verifyOtp(phoneData.phone, phoneData.otp)

      if (success) {
        router.push('/dashboard')
      } else {
        setPhoneError(error || 'Código incorrecto')
      }
    } catch (error) {
      setPhoneError('Error al verificar código')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">MR</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MAXIRENT</h1>
          <p className="text-slate-400">Sistema de Gestión de Taller</p>
        </div>

        {/* Formulario de login */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Accede a tu cuenta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="credentials" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="credentials" className="text-slate-300 data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" />
                  Usuario
                </TabsTrigger>
                <TabsTrigger value="phone" className="text-slate-300 data-[state=active]:text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  Teléfono
                </TabsTrigger>
              </TabsList>

              {/* Login con credenciales */}
              <TabsContent value="credentials" className="space-y-4">
                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Usuario o Email"
                      value={credentials.identifier}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCredentials(prev => ({ ...prev, identifier: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoggingIn}
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={credentials.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                      required
                      disabled={isLoggingIn}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {loginError && (
                    <Alert className="bg-red-900/50 border-red-700">
                      <AlertDescription className="text-red-200">
                        {loginError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Login con teléfono */}
              <TabsContent value="phone" className="space-y-4">
                {!otpSent ? (
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="tel"
                        placeholder="Número de teléfono (10 dígitos)"
                        value={phoneData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        maxLength={10}
                        disabled={isSendingOtp}
                      />
                    </div>

                    {phoneError && (
                      <Alert className="bg-red-900/50 border-red-700">
                        <AlertDescription className="text-red-200">
                          {phoneError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleSendOtp}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={isSendingOtp || phoneData.phone.length !== 10}
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Enviando código...
                        </>
                      ) : (
                        'Enviar Código SMS'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-slate-300 text-sm mb-4">
                        Se envió un código de 6 dígitos al teléfono
                        <br />
                        <span className="font-mono text-orange-400">
                          *** *** {phoneData.phone.slice(-4)}
                        </span>
                      </p>
                    </div>

                    <div>
                      <Input
                        type="text"
                        placeholder="Código de 6 dígitos"
                        value={phoneData.otp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneData(prev => ({ ...prev, otp: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-center text-lg tracking-widest"
                        maxLength={6}
                        disabled={isVerifyingOtp}
                      />
                    </div>

                    {phoneError && (
                      <Alert className="bg-red-900/50 border-red-700">
                        <AlertDescription className="text-red-200">
                          {phoneError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setOtpSent(false)}
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        disabled={isVerifyingOtp}
                      >
                        Atrás
                      </Button>

                      <Button
                        onClick={handleVerifyOtp}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={isVerifyingOtp || phoneData.otp.length !== 6}
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Verificando...
                          </>
                        ) : (
                          'Verificar'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            MAXIRENT © 2024 - Sistema de Gestión de Taller
          </p>
        </div>
      </div>
    </div>
  )
}