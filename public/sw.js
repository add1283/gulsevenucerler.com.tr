const CACHE_NAME = 'gulsevenucerler-v2';
const OFFLINE_URL = '/offline.html';

// Cache edilecek dosyalar - daha generic yap
const urlsToCache = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Nunito:wght@300;400;500;600;700&display=swap'
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker kuruldu');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache açıldı');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.log('[SW] Cache oluşturma hatası:', error);
      })
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker aktive edildi');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Network istekleri yakalama - daha robust
self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini handle et
  if (event.request.method !== 'GET') return;

  // Chrome extension isteklerini ignore et
  if (event.request.url.startsWith('chrome-extension://')) return;

  // Analytics isteklerini ignore et
  if (event.request.url.includes('google-analytics.com') ||
      event.request.url.includes('googletagmanager.com')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı response'u cache'le
        if (response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Sadece same-origin istekleri cache'le
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, responseClone);
              }
            });
        }
        return response;
      })
      .catch(() => {
        // Network başarısız, cache'den dön
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }

            // Eğer sayfa isteği ise offline sayfasını göster
            if (event.request.mode === 'navigate' ||
                (event.request.method === 'GET' &&
                 event.request.headers.get('accept') &&
                 event.request.headers.get('accept').includes('text/html'))) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background sync (randevu formları için)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-randevu') {
    console.log('[SW] Background sync: randevu gönderiliyor');
    event.waitUntil(syncRandevu());
  }
});

// Offline randevu verilerini sync et
async function syncRandevu() {
  try {
    // IndexedDB'den offline randevu verilerini al
    const requests = await getOfflineRequests();

    for (const request of requests) {
      try {
        await fetch('/api/randevu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.data)
        });

        // Başarılı gönderimden sonra offline veriyi sil
        await deleteOfflineRequest(request.id);

      } catch (error) {
        console.log('[SW] Randevu gönderimi başarısız:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync hatası:', error);
  }
}

// Push notification desteği
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Yeni bir bildiriminiz var',
    icon: '/images/icon-192x192.svg',
    badge: '/images/icon-72x72.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Detayları Gör',
        icon: '/images/icon-96x96.svg'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/images/icon-96x96.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Gülseven Üçerler', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#contact')
    );
  } else if (event.action === 'close') {
    // Sadece bildirimi kapat
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Dummy functions for IndexedDB operations (if not implemented elsewhere)
async function getOfflineRequests() {
  return [];
}

async function deleteOfflineRequest(id) {
  // Implement if needed
}
