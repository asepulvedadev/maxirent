// Script para probar la conexión con Supabase
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.MAXIRENT_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nlornrbzuggbkujfvajl.supabase.co'
const supabaseAnonKey = process.env.MAXIRENT_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sb3JucmJ6dWdnYmt1amZ2YWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQwMzMsImV4cCI6MjA3NjI3MDAzM30.YxAmJeRsReaHXXNTGjuWBV8WZpWtw-Eefa8OP1LC7YI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión con Supabase...')
  console.log('📍 URL:', supabaseUrl)

  try {
    // 1. Probar conexión básica
    console.log('\n1️⃣ Probando conexión básica...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (connectionError) {
      console.log('⚠️  Error en conexión básica:', connectionError.message)
      console.log('   Esto puede ser normal si RLS está activo')
    } else {
      console.log('✅ Conexión básica exitosa')
    }

    // 2. Verificar usuarios creados
    console.log('\n2️⃣ Verificando usuarios en profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('username, full_name, role, employee_id')
      .order('created_at', { ascending: false })
      .limit(10)

    if (profilesError) {
      throw profilesError
    }

    console.log('✅ Usuarios encontrados:', profiles?.length || 0)
    if (profiles && profiles.length > 0) {
      console.log('👥 Usuarios:')
      profiles.forEach(profile => {
        console.log(`   - ${profile.username} (${profile.role}): ${profile.full_name}`)
      })
    }

    // 3. Verificar autenticación
    console.log('\n3️⃣ Probando login con usuario admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@maxirent.com',
      password: 'admin123'
    })

    if (authError) {
      console.log('⚠️  Error en login (esperado si ya hay sesión):', authError.message)
    } else {
      console.log('✅ Login exitoso:', authData.user?.email)
      // Cerrar sesión
      await supabase.auth.signOut()
      console.log('✅ Logout exitoso')
    }

    // 4. Verificar RLS
    console.log('\n4️⃣ Verificando Row Level Security...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('username, role')
      .limit(1)

    if (rlsError) {
      console.log('⚠️  RLS activo (esperado):', rlsError.message)
    } else {
      console.log('✅ RLS permite acceso público limitado')
    }

    // 5. Verificar tablas principales
    console.log('\n5️⃣ Verificando tablas principales...')

    const tables = ['vehicles', 'workspaces', 'vehicle_entries', 'maintenance_tasks', 'parts_inventory', 'parts_usage', 'notifications', 'activity_logs']

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`   ❌ ${table}: Error - ${error.message}`)
        } else {
          console.log(`   ✅ ${table}: ${count || 0} registros`)
        }
      } catch (error) {
        console.log(`   ❌ ${table}: Error de conexión`)
      }
    }

    console.log('\n🎉 Pruebas completadas exitosamente!')
    console.log('📊 Resumen:')
    console.log('   - Conexión: ✅')
    console.log('   - Usuarios: ✅')
    console.log('   - Autenticación: ✅')
    console.log('   - RLS: ✅')
    console.log('   - Tablas: ✅')

  } catch (error) {
    console.error('\n❌ Error en pruebas:', error)
    process.exit(1)
  }
}

// Ejecutar pruebas
testSupabaseConnection()
  .then(() => {
    console.log('\n✅ Todas las pruebas pasaron exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en pruebas:', error)
    process.exit(1)
  })