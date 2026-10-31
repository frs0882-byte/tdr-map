/**
 * TDR業務MAP - Service Worker (service-worker.js)
 * PWAインストール要件＆オフラインキャッシュ対応（動画Rangeリクエストはバイパス）
 */

const CACHE_NAME = 'tdr-hvac-v29';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './opening-animation.js',
  './manifest.json',
  './icons/icon-mickey-earth-180.png',
  './icons/icon-mickey-earth-192.png',
  './icons/icon-mickey-earth-512.png',
  './icons/favicon.png'
];

// インストール時にコアアセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// アクティベート時に古いキャッシュを破棄
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ネットワーク優先（動画 .mp4 や /api/ は Range / リアルタイム通信のため Service Worker を介さず直接通信）
self.addEventListener('fetch', (event) => {
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.method !== 'GET' ||
    event.request.url.includes('.mp4') ||
    event.request.url.includes('/api/') ||
    event.request.headers.has('range')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
