// Configuración del cliente Supabase para MAXIRENT
import { createBrowserClient } from '@supabase/ssr'

// Configuración de Supabase usando variables de entorno MAXIRENT
const supabaseUrl = process.env.MAXIRENT_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.MAXIRENT_NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el navegador (Client-side)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Cliente para el servidor (Server-side) - solo usar en Server Components
export { createServerClient } from '@supabase/ssr'

// Tipos de base de datos (generados desde Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          phone: string | null
          full_name: string
          role: 'ADMIN' | 'JEFE_TALLER' | 'ALMACENISTA' | 'RECEPCIONISTA' | 'MECANICO'
          avatar_url: string | null
          is_active: boolean
          employee_id: string | null
          specialization: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id: string
          username: string
          phone?: string | null
          full_name: string
          role?: 'ADMIN' | 'JEFE_TALLER' | 'ALMACENISTA' | 'RECEPCIONISTA' | 'MECANICO'
          avatar_url?: string | null
          is_active?: boolean
          employee_id?: string | null
          specialization?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          username?: string
          phone?: string | null
          full_name?: string
          role?: 'ADMIN' | 'JEFE_TALLER' | 'ALMACENISTA' | 'RECEPCIONISTA' | 'MECANICO'
          avatar_url?: string | null
          is_active?: boolean
          employee_id?: string | null
          specialization?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          license_plate: string
          vehicle_type: string
          brand: string | null
          model: string | null
          year: number | null
          vin: string | null
          fleet_number: string | null
          current_mileage: number | null
          last_maintenance_date: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          license_plate: string
          vehicle_type: string
          brand?: string | null
          model?: string | null
          year?: number | null
          vin?: string | null
          fleet_number?: string | null
          current_mileage?: number | null
          last_maintenance_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          license_plate?: string
          vehicle_type?: string
          brand?: string | null
          model?: string | null
          year?: number | null
          vin?: string | null
          fleet_number?: string | null
          current_mileage?: number | null
          last_maintenance_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          workspace_type: 'RAMPA_FIJA' | 'ESPACIO_TEMPORAL'
          status: 'DISPONIBLE' | 'OCUPADA' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
          location_description: string | null
          max_vehicle_capacity: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          workspace_type?: 'RAMPA_FIJA' | 'ESPACIO_TEMPORAL'
          status?: 'DISPONIBLE' | 'OCUPADA' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
          location_description?: string | null
          max_vehicle_capacity?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          workspace_type?: 'RAMPA_FIJA' | 'ESPACIO_TEMPORAL'
          status?: 'DISPONIBLE' | 'OCUPADA' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
          location_description?: string | null
          max_vehicle_capacity?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      vehicle_entries: {
        Row: {
          id: string
          vehicle_id: string
          entry_date: string
          reported_issue: string
          priority: number
          estimated_completion_date: string | null
          actual_completion_date: string | null
          status: 'PENDIENTE_ASIGNACION' | 'EN_REVISION' | 'EN_MANTENIMIENTO' | 'ESPERANDO_REFACCIONES' | 'COMPLETADO' | 'CANCELADO'
          entry_mileage: number | null
          received_by: string
          assigned_to: string | null
          assigned_at: string | null
          assigned_by: string | null
          workspace_id: string | null
          workspace_assigned_at: string | null
          mechanic_observations: string | null
          mechanic_accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          entry_date?: string
          reported_issue: string
          priority?: number
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          status?: 'PENDIENTE_ASIGNACION' | 'EN_REVISION' | 'EN_MANTENIMIENTO' | 'ESPERANDO_REFACCIONES' | 'COMPLETADO' | 'CANCELADO'
          entry_mileage?: number | null
          received_by: string
          assigned_to?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          workspace_id?: string | null
          workspace_assigned_at?: string | null
          mechanic_observations?: string | null
          mechanic_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          entry_date?: string
          reported_issue?: string
          priority?: number
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          status?: 'PENDIENTE_ASIGNACION' | 'EN_REVISION' | 'EN_MANTENIMIENTO' | 'ESPERANDO_REFACCIONES' | 'COMPLETADO' | 'CANCELADO'
          entry_mileage?: number | null
          received_by?: string
          assigned_to?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          workspace_id?: string | null
          workspace_assigned_at?: string | null
          mechanic_observations?: string | null
          mechanic_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_tasks: {
        Row: {
          id: string
          vehicle_entry_id: string
          task_description: string
          is_completed: boolean
          completed_at: string | null
          completed_by: string | null
          estimated_hours: number | null
          actual_hours: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_entry_id: string
          task_description: string
          is_completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_entry_id?: string
          task_description?: string
          is_completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parts_inventory: {
        Row: {
          id: string
          part_number: string
          part_name: string
          description: string | null
          category: string | null
          unit_price: number
          current_stock: number
          minimum_stock: number
          location: string | null
          supplier: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          part_number: string
          part_name: string
          description?: string | null
          category?: string | null
          unit_price: number
          current_stock?: number
          minimum_stock?: number
          location?: string | null
          supplier?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          part_number?: string
          part_name?: string
          description?: string | null
          category?: string | null
          unit_price?: number
          current_stock?: number
          minimum_stock?: number
          location?: string | null
          supplier?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      parts_usage: {
        Row: {
          id: string
          vehicle_entry_id: string
          part_id: string
          quantity: number
          unit_price: number
          total_price: number
          used_by: string
          approved_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_entry_id: string
          part_id: string
          quantity: number
          unit_price: number
          total_price?: number
          used_by: string
          approved_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_entry_id?: string
          part_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          used_by?: string
          approved_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          notification_type: 'NUEVO_INGRESO' | 'ASIGNACION_VEHICULO' | 'SOLICITUD_REFACCIONES' | 'VEHICULO_COMPLETADO' | 'ALERTA_SISTEMA'
          title: string
          message: string
          status: 'PENDIENTE' | 'LEIDA' | 'ATENDIDA'
          related_vehicle_entry_id: string | null
          metadata: Record<string, any> | null
          read_at: string | null
          attended_at: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          notification_type: 'NUEVO_INGRESO' | 'ASIGNACION_VEHICULO' | 'SOLICITUD_REFACCIONES' | 'VEHICULO_COMPLETADO' | 'ALERTA_SISTEMA'
          title: string
          message: string
          status?: 'PENDIENTE' | 'LEIDA' | 'ATENDIDA'
          related_vehicle_entry_id?: string | null
          metadata?: Record<string, any> | null
          read_at?: string | null
          attended_at?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          notification_type?: 'NUEVO_INGRESO' | 'ASIGNACION_VEHICULO' | 'SOLICITUD_REFACCIONES' | 'VEHICULO_COMPLETADO' | 'ALERTA_SISTEMA'
          title?: string
          message?: string
          status?: 'PENDIENTE' | 'LEIDA' | 'ATENDIDA'
          related_vehicle_entry_id?: string | null
          metadata?: Record<string, any> | null
          read_at?: string | null
          attended_at?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Record<string, any> | null
          new_values: Record<string, any> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Record<string, any> | null
          new_values?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Record<string, any> | null
          new_values?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      vehicle_workshop_summary: {
        Row: {
          id: string | null
          license_plate: string | null
          brand: string | null
          model: string | null
          status: string | null
          priority: number | null
          entry_date: string | null
          mechanic_name: string | null
          workspace_name: string | null
          workspace_status: string | null
          reported_issue: string | null
          mechanic_observations: string | null
          hours_in_workshop: number | null
          total_tasks: number | null
          completed_tasks: number | null
        }
      }
      workshop_statistics: {
        Row: {
          pending_assignment: number | null
          in_review: number | null
          in_maintenance: number | null
          waiting_parts: number | null
          completed_today: number | null
          avg_completion_hours_today: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'ADMIN' | 'JEFE_TALLER' | 'ALMACENISTA' | 'RECEPCIONISTA' | 'MECANICO'
      vehicle_status: 'PENDIENTE_ASIGNACION' | 'EN_REVISION' | 'EN_MANTENIMIENTO' | 'ESPERANDO_REFACCIONES' | 'COMPLETADO' | 'CANCELADO'
      workspace_status: 'DISPONIBLE' | 'OCUPADA' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
      workspace_type: 'RAMPA_FIJA' | 'ESPACIO_TEMPORAL'
      notification_status: 'PENDIENTE' | 'LEIDA' | 'ATENDIDA'
      notification_type: 'NUEVO_INGRESO' | 'ASIGNACION_VEHICULO' | 'SOLICITUD_REFACCIONES' | 'VEHICULO_COMPLETADO' | 'ALERTA_SISTEMA'
    }
  }
}