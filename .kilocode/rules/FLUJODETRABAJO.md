# FLUJODETRABAJO.md

FLUJO DE LA APP 

- graph TB
    %% =====================================================
    %% FLUJO 1: INGRESO DE VEHÍCULO AL TALLER
    %% =====================================================
    subgraph INGRESO["🚗 PROCESO DE INGRESO DE VEHÍCULO"]
        A1[Vehículo llega al taller] --> A2[Recepcionista escanea placa]
        A2 --> A3{¿Vehículo existe<br/>en sistema?}
        A3 -->|NO| A4[Registrar nuevo vehículo]
        A3 -->|SI| A5[Cargar datos del vehículo]
        A4 --> A5
        A5 --> A6[Ingresar problema reportado<br/>y prioridad]
        A6 --> A7[Registrar kilometraje]
        A7 --> A8[Crear vehicle_entry<br/>Estado: PENDIENTE_ASIGNACION]
        A8 --> A9[🔔 Notificación automática<br/>a JEFE_TALLER]
    end

    %% =====================================================
    %% FLUJO 2: ASIGNACIÓN DE VEHÍCULO
    %% =====================================================
    subgraph ASIGNACION["👔 PROCESO DE ASIGNACIÓN"]
        B1[Jefe de Taller recibe<br/>notificación] --> B2[Revisar lista de vehículos<br/>PENDIENTE_ASIGNACION]
        B2 --> B3[Ver detalles:<br/>- Problema<br/>- Prioridad<br/>- Kilometraje]
        B3 --> B4[Seleccionar mecánico<br/>disponible]
        B4 --> B5[Asignar vehículo<br/>assigned_to = mechanic_id]
        B5 --> B6[Actualizar estado:<br/>EN_REVISION]
        B6 --> B7[🔔 Notificación automática<br/>al MECANICO]
    end

    %% =====================================================
    %% FLUJO 3: ACEPTACIÓN Y TRABAJO DEL MECÁNICO
    %% =====================================================
    subgraph MECANICO["🔧 PROCESO DEL MECÁNICO"]
        C1[Mecánico recibe<br/>notificación] --> C2[Ver detalles del<br/>vehículo asignado]
        C2 --> C3{¿Acepta<br/>asignación?}
        C3 -->|NO| C4[Rechazar y notificar<br/>al Jefe]
        C3 -->|SI| C5[Seleccionar rampa o<br/>espacio de trabajo]
        C5 --> C6[Agregar observaciones<br/>iniciales del vehículo]
        C6 --> C7[Confirmar aceptación<br/>mechanic_accepted_at]
        C7 --> C8[Actualizar workspace<br/>status: OCUPADA]
        C8 --> C9[Estado:<br/>EN_MANTENIMIENTO]
        C9 --> C10[Crear tareas de<br/>mantenimiento]
        C10 --> C11[Registrar refacciones<br/>utilizadas]
        C11 --> C12{¿Stock<br/>suficiente?}
        C12 -->|NO| C13[🔔 Alerta a<br/>ALMACENISTA]
        C12 -->|SI| C14[Descontar del inventario]
        C13 --> C15[Estado:<br/>ESPERANDO_REFACCIONES]
        C14 --> C16[Completar tareas]
        C16 --> C17[Marcar vehicle_entry<br/>como COMPLETADO]
        C17 --> C18[Liberar workspace<br/>status: DISPONIBLE]
        C18 --> C19[🔔 Notificar a<br/>JEFE_TALLER]
    end

    %% =====================================================
    %% FLUJO 4: GESTIÓN DE REFACCIONES
    %% =====================================================
    subgraph REFACCIONES["📦 GESTIÓN DE INVENTARIO"]
        D1[Almacenista gestiona<br/>inventario] --> D2[Registrar nuevas<br/>refacciones]
        D2 --> D3[Establecer stock<br/>mínimo]
        D3 --> D4[Sistema monitorea<br/>niveles de stock]
        D4 --> D5{¿Stock <= mínimo?}
        D5 -->|SI| D6[🔔 Alerta automática<br/>a ALMACENISTA]
        D5 -->|NO| D7[Continuar monitoreo]
        D6 --> D8[Realizar pedido<br/>a proveedor]
        
        D10[Mecánico usa refacción] --> D11[Registrar en parts_usage]
        D11 --> D12[Trigger automático<br/>descuenta stock]
        D12 --> D4
    end

    %% =====================================================
    %% FLUJO 5: MONITOREO EN PANTALLAS
    %% =====================================================
    subgraph PANTALLAS["📺 SISTEMA DE PANTALLAS"]
        E1[Pantalla General] --> E2[Dashboard con:<br/>- Vehículos en proceso<br/>- Por estado<br/>- Por prioridad]
        E3[Pantalla por Rampa] --> E4[Card con:<br/>- Mecánico asignado<br/>- Vehículo placa<br/>- Estado progreso<br/>- Tiempo transcurrido<br/>- Tareas pendientes]
        E5[Actualización<br/>en tiempo real] --> E2
        E5 --> E4
    end

    %% =====================================================
    %% CONEXIONES ENTRE FLUJOS
    %% =====================================================
    A9 -.->|Trigger| B1
    B7 -.->|Trigger| C1
    C19 -.->|Trigger| B1
    C13 -.->|Trigger| D6
    C11 -.->|Trigger| D10
    
    A8 -.->|Actualiza| E5
    B6 -.->|Actualiza| E5
    C9 -.->|Actualiza| E5
    C17 -.->|Actualiza| E5

    style INGRESO fill:#e1f5ff
    style ASIGNACION fill:#fff4e1
    style MECANICO fill:#e8f5e9
    style REFACCIONES fill:#fce4ec
    style PANTALLAS fill:#f3e5f5


graph TB
    %% =====================================================
    %% SISTEMA DE AUTENTICACIÓN
    %% =====================================================
    subgraph AUTH["🔐 AUTENTICACIÓN"]
        AUTH1[Usuario ingresa credenciales] --> AUTH2{Tipo de login}
        AUTH2 -->|Username| AUTH3[Validar username + password]
        AUTH2 -->|Teléfono| AUTH4[Enviar código OTP]
        AUTH4 --> AUTH5[Validar código OTP]
        AUTH3 --> AUTH6[Supabase Auth]
        AUTH5 --> AUTH6
        AUTH6 --> AUTH7[Generar JWT Token]
        AUTH7 --> AUTH8[Cargar perfil y rol]
    end

    %% =====================================================
    %% ROL: ADMIN
    %% =====================================================
    subgraph ADMIN["👑 ROL: ADMINISTRADOR"]
        ADMIN1[Permisos Totales] --> ADMIN2[Gestión de Usuarios]
        ADMIN1 --> ADMIN3[Crear/Editar Perfiles]
        ADMIN1 --> ADMIN4[Asignar Roles]
        ADMIN1 --> ADMIN5[Ver Activity Logs]
        ADMIN1 --> ADMIN6[Gestión Completa<br/>de todas las tablas]
        ADMIN1 --> ADMIN7[Configuración del Sistema]
        
        ADMIN2 -.-> T1[(profiles)]
        ADMIN3 -.-> T1
        ADMIN4 -.-> T1
        ADMIN5 -.-> T9[(activity_logs)]
        ADMIN6 -.-> T2[(vehicles)]
        ADMIN6 -.-> T3[(workspaces)]
        ADMIN6 -.-> T4[(vehicle_entries)]
        ADMIN6 -.-> T5[(maintenance_tasks)]
        ADMIN6 -.-> T6[(parts_inventory)]
        ADMIN6 -.-> T7[(parts_usage)]
    end

    %% =====================================================
    %% ROL: JEFE DE TALLER
    %% =====================================================
    subgraph JEFE["👔 ROL: JEFE DE TALLER"]
        JEFE1[Permisos de Supervisión] --> JEFE2[Ver todos los vehículos]
        JEFE1 --> JEFE3[Asignar vehículos<br/>a mecánicos]
        JEFE1 --> JEFE4[Gestionar workspaces]
        JEFE1 --> JEFE5[Ver reportes y<br/>estadísticas]
        JEFE1 --> JEFE6[Aprobar uso de<br/>refacciones críticas]
        JEFE1 --> JEFE7[Recibir notificaciones<br/>de ingresos]
        
        JEFE2 -.-> T2
        JEFE2 -.-> T4
        JEFE3 -.-> T4
        JEFE4 -.-> T3
        JEFE6 -.-> T7
        JEFE7 -.-> T8[(notifications)]
    end

    %% =====================================================
    %% ROL: RECEPCIONISTA
    %% =====================================================
    subgraph RECEP["📋 ROL: RECEPCIONISTA"]
        RECEP1[Permisos de Ingreso] --> RECEP2[Registrar vehículos<br/>nuevos]
        RECEP1 --> RECEP3[Crear ingresos<br/>de vehículos]
        RECEP1 --> RECEP4[Escanear placas]
        RECEP1 --> RECEP5[Ver lista de vehículos<br/>en taller]
        RECEP1 --> RECEP6[Solo lectura de<br/>otras tablas]
        
        RECEP2 -.-> T2
        RECEP3 -.-> T4
        RECEP5 -.-> T4
    end

    %% =====================================================
    %% ROL: MECÁNICO
    %% =====================================================
    subgraph MEC["🔧 ROL: MECÁNICO"]
        MEC1[Permisos de Trabajo] --> MEC2[Ver vehículos<br/>asignados]
        MEC1 --> MEC3[Aceptar/Rechazar<br/>asignaciones]
        MEC1 --> MEC4[Seleccionar<br/>workspace]
        MEC1 --> MEC5[Crear/Completar<br/>tareas]
        MEC1 --> MEC6[Registrar uso de<br/>refacciones]
        MEC1 --> MEC7[Agregar observaciones]
        MEC1 --> MEC8[Actualizar estado<br/>de sus vehículos]
        
        MEC2 -.-> T4
        MEC3 -.-> T4
        MEC4 -.-> T3
        MEC5 -.-> T5
        MEC6 -.-> T7
        MEC7 -.-> T4
        MEC8 -.-> T4
    end

    %% =====================================================
    %% ROL: ALMACENISTA
    %% =====================================================
    subgraph ALM["📦 ROL: ALMACENISTA"]
        ALM1[Permisos de Inventario] --> ALM2[Gestionar inventario<br/>completo]
        ALM1 --> ALM3[Registrar nuevas<br/>refacciones]
        ALM1 --> ALM4[Actualizar stock]
        ALM1 --> ALM5[Configurar mínimos<br/>de stock]
        ALM1 --> ALM6[Ver uso de<br/>refacciones]
        ALM1 --> ALM7[Aprobar uso de<br/>refacciones]
        ALM1 --> ALM8[Recibir alertas de<br/>stock bajo]
        
        ALM2 -.-> T6
        ALM3 -.-> T6
        ALM4 -.-> T6
        ALM5 -.-> T6
        ALM6 -.-> T7
        ALM7 -.-> T7
        ALM8 -.-> T8
    end

    %% =====================================================
    %% ROW LEVEL SECURITY (RLS)
    %% =====================================================
    subgraph RLS["🛡️ ROW LEVEL SECURITY"]
        RLS1[Políticas RLS activas<br/>en todas las tablas] --> RLS2[Filtrado automático<br/>por rol]
        RLS2 --> RLS3{Validación}
        RLS3 -->|✅ Permitido| RLS4[Acceso concedido]
        RLS3 -->|❌ Denegado| RLS5[Error 403<br/>Forbidden]
        
        RLS6[Mecánico solo ve<br/>sus asignaciones] -.-> RLS2
        RLS7[Usuarios ven sus<br/>propias notificaciones] -.-> RLS2
        RLS8[Admin ve todo] -.-> RLS2
    end

    %% =====================================================
    %% TABLAS DE LA BASE DE DATOS
    %% =====================================================
    subgraph TABLES["📊 TABLAS DE LA BASE DE DATOS"]
        T1
        T2
        T3
        T4
        T5
        T6
        T7
        T8
        T9
    end

    %% =====================================================
    %% FLUJO DE AUTORIZACIÓN
    %% =====================================================
    AUTH8 --> CHECKROLE{Verificar Rol}
    CHECKROLE -->|ADMIN| ADMIN1
    CHECKROLE -->|JEFE_TALLER| JEFE1
    CHECKROLE -->|RECEPCIONISTA| RECEP1
    CHECKROLE -->|MECANICO| MEC1
    CHECKROLE -->|ALMACENISTA| ALM1
    
    ADMIN1 --> RLS1
    JEFE1 --> RLS1
    RECEP1 --> RLS1
    MEC1 --> RLS1
    ALM1 --> RLS1

    style AUTH fill:#e3f2fd
    style ADMIN fill:#ffebee
    style JEFE fill:#fff3e0
    style RECEP fill:#e8f5e9
    style MEC fill:#f3e5f5
    style ALM fill:#fce4ec
    style RLS fill:#ffccbc
    style TABLES fill:#e0e0e0