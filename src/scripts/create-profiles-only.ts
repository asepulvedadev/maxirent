// Script para crear solo los perfiles en Supabase (usuarios Auth ya existen)
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

async function createProfilesOnly() {
  console.log('🚀 Creando perfiles de usuarios de demostración...')

  for (const user of DEMO_USERS) {
    try {
      console.log(`\n📝 Creando perfil para: ${user.username}`)

      // Buscar el usuario en Auth por email para obtener su ID
      const { data: authUsers, error: searchError } = await supabase.auth.admin.listUsers()

      if (searchError) {
        throw searchError
      }

      const authUser = authUsers.users.find(u => u.email === user.email)

      if (!authUser) {
        console.log(`⚠️  Usuario Auth no encontrado para ${user.email}, omitiendo...`)
        continue
      }

      console.log(`✅ Usuario Auth encontrado: ${authUser.id}`)

      // Verificar si el perfil ya existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (existingProfile) {
        console.log(`⚠️  Perfil ya existe para ${user.username}, omitiendo...`)
        continue
      }

      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
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
        throw profileError
      }

      console.log(`✅ Perfil creado para: ${user.username}`)

    } catch (error) {
      console.error(`❌ Error creando perfil para ${user.username}:`, error)
    }
  }

  console.log('\n🎉 Proceso completado!')
  console.log('📋 Verificando perfiles creados...')

  // Verificar perfiles creados
  const { data: profiles, error: verifyError } = await supabase
    .from('profiles')
    .select('username, full_name, role, employee_id')
    .order('created_at', { ascending: false })

  if (verifyError) {
    console.error('❌ Error verificando perfiles:', verifyError)
  } else {
    console.log(`✅ Perfiles encontrados: ${profiles?.length || 0}`)
    if (profiles && profiles.length > 0) {
      console.log('👥 Perfiles:')
      profiles.forEach(profile => {
        console.log(`   - ${profile.username} (${profile.role}): ${profile.full_name}`)
      })
    }
  }
}

// Ejecutar el script
createProfilesOnly()
  .then(() => {
    console.log('\n✅ Script ejecutado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error)
    process.exit(1)
  })