// Service Worker para Push Notifications - Secretária Inteligente
const CACHE_NAME = 'secretaria-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// Receber push notification
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Secretária Inteligente', body: event.data.text() }
  }

  const options = {
    body: data.body || 'Você tem um compromisso em breve!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'view', title: 'Ver agenda' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
    requireInteraction: true,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Secretária Inteligente', options)
  )
})

// Click na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já há uma aba aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus()
        }
      }
      // Senão, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
