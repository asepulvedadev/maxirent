// Registro del Service Worker para MAXIRENT PWA
class SWManager {
  constructor() {
    this.registration = null;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        // Registrar el service worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registrado exitosamente:', this.registration.scope);

        // Manejar actualizaciones
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });

        // Escuchar mensajes del service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleMessage(event);
        });

        // Monitorear estado de conexión
        window.addEventListener('online', () => {
          this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
          this.handleOnlineStatus(false);
        });

        // Verificar si ya hay un service worker activo
        if (navigator.serviceWorker.controller) {
          console.log('Service Worker ya está activo');
        }

      } catch (error) {
        console.error('Error al registrar Service Worker:', error);
      }
    } else {
      console.warn('Service Worker no soportado en este navegador');
    }
  }

  showUpdateNotification() {
    // Crear notificación de actualización
    const updateToast = document.createElement('div');
    updateToast.id = 'pwa-update-toast';
    updateToast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #df861d;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 300px;
      ">
        <div style="font-weight: 600; margin-bottom: 8px;">
          ¡Actualización disponible!
        </div>
        <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
          Una nueva versión de MAXIRENT está lista para instalar.
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="update-accept" style="
            background: white;
            color: #df861d;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
          ">
            Actualizar
          </button>
          <button id="update-dismiss" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          ">
            Después
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(updateToast);

    // Manejar clics en los botones
    document.getElementById('update-accept').addEventListener('click', () => {
      this.updateApp();
      updateToast.remove();
    });

    document.getElementById('update-dismiss').addEventListener('click', () => {
      updateToast.remove();
    });

    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (updateToast.parentNode) {
        updateToast.remove();
      }
    }, 10000);
  }

  async updateApp() {
    try {
      // Enviar mensaje al service worker para saltar la espera
      if (this.registration && this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error('Error al actualizar la app:', error);
    }
  }

  handleMessage(event) {
    const { data } = event;

    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('Cache actualizado:', data.payload);
        break;
      case 'OFFLINE_READY':
        this.showOfflineNotification();
        break;
      case 'SYNC_COMPLETED':
        console.log('Sincronización completada');
        break;
      default:
        console.log('Mensaje del SW:', data);
    }
  }

  showOfflineNotification() {
    const offlineToast = document.createElement('div');
    offlineToast.id = 'pwa-offline-toast';
    offlineToast.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #171820;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span style="font-size: 18px;">📱</span>
        <span>MAXIRENT listo para usar sin conexión</span>
      </div>
    `;

    document.body.appendChild(offlineToast);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      if (offlineToast.parentNode) {
        offlineToast.remove();
      }
    }, 3000);
  }

  handleOnlineStatus(isOnline) {
    this.isOnline = isOnline;

    if (isOnline) {
      // Sincronizar datos pendientes
      this.syncPendingData();
    }

    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('connection-changed', {
      detail: { isOnline }
    }));
  }

  async syncPendingData() {
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
      }
    } catch (error) {
      console.log('Background sync no soportado o error:', error);
    }
  }

  // Método para verificar si la app está instalada
  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  // Método para mostrar prompt de instalación (para futuras implementaciones)
  showInstallPrompt() {
    // Implementar lógica para mostrar prompt de instalación
    console.log('Prompt de instalación solicitado');
  }
}

// Inicializar el administrador del Service Worker cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.swManager = new SWManager();
  });
} else {
  window.swManager = new SWManager();
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SWManager;
}