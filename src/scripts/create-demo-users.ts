// Script para crear usuarios de demostración en Supabase
import { createClient } from '@supabase/supabase-js'
import { DEMO_USERS } from '../lib/demo-users'

// Configuración de Supabase Admin
const supabaseUrl = process.env.MAXIRENT_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nlornrbzuggbkujfvajl.supabase.co'
const supabaseServiceKey = process.env.MAXIRENT_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sb3JucmJ6dWdnYmt1amZ2YWpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY5NDAzMywiZXhwIjoyMDc2MjcwMDMzfQ.2WHAZyLjTSPl8ysyxfy0pRtq__HjSzbdn3RJZP58NW4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createDemoUsers() {
  console.log('🚀 Iniciando creación de usuarios de demostración...')

  for (const user of DEMO_USERS) {
    try {
      console.log(`\n📝 Creando usuario: ${user.username}`)

      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          username: user.username,
          full_name: user.full_name,
          phone: user.phone
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  Usuario ${user.username} ya existe, continuando...`)
          continue
        }
        throw authError
      }

      console.log(`✅ Usuario Auth creado: ${authData.user.id}`)

      // 2. Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: user.username,
          phone: user.phone,
          full_name: user.full_name,
          role: user.role,
          employee_id: user.employee_id,
          specialization: user.specialization,
          avatar_url: user.avatar_url,
          is_active: true
        })

      if (profileError) {
        console.error(`❌ Error creando perfil para ${user.username}:`, profileError)
        continue
      }

      console.log(`✅ Perfil creado para: ${user.username}`)

    } catch (error) {
      console.error(`❌ Error creando usuario ${user.username}:`, error)
    }
  }

  console.log('\n🎉 Proceso completado!')
  console.log('📋 Usuarios de demostración creados:')
  DEMO_USERS.forEach(user => {
    console.log(`   ${user.username} (${user.role}): ${user.email} / ${user.password}`)
  })
}

// Ejecutar el script
createDemoUsers()
  .then(() => {
    console.log('\n✅ Script ejecutado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error)
    process.exit(1)
  })