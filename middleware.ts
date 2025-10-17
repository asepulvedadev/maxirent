import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.MAXIRENT_NEXT_PUBLIC_SUPABASE_URL!,
    process.env.MAXIRENT_NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/reset-password', '/_next', '/favicon.ico', '/manifest.json', '/sw.js', '/sw-register.js']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Rutas de API públicas
  const publicApiRoutes = ['/api/auth']
  const isPublicApiRoute = publicApiRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Si no está autenticado y trata de acceder a una ruta protegida
  if (!user && !isPublicRoute && !isPublicApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si está autenticado y trata de acceder a login, redirigir al dashboard
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Verificar permisos por rol para rutas específicas
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const userRole = profile.role

      // Rutas restringidas por rol
      const roleRestrictions: Record<string, string[]> = {
        '/admin': ['ADMIN'],
        '/workshop-manager': ['ADMIN', 'JEFE_TALLER'],
        '/warehouse': ['ADMIN', 'ALMACENISTA'],
        '/mechanic': ['ADMIN', 'JEFE_TALLER', 'MECANICO'],
        '/reception': ['ADMIN', 'RECEPCIONISTA'],
      }

      for (const [route, allowedRoles] of Object.entries(roleRestrictions)) {
        if (request.nextUrl.pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}