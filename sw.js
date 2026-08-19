const CACHE_NAME = 'planner-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/loose_load_planner.html',
    '/volume_capacity_planner.html',
    '/do_summary_generator.html',
    '/truck_planning.html',
    '/shipping_insight.html',
    '/do_details.html',
    '/do_activity_trend.html',
    '/challenger_list.html',
    '/batch_analytics.html',
    '/do_load_planner.html',
    '/css/styles.css',
    '/js/loose_load_planner.js',
    '/js/volume_capacity_planner.js',
    '/js/do_summary_generator.js',
    '/manifest.json',
    '/icons/icon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Use a try-catch for addAll, or fetch individual items so if one fails the rest still cache
                return Promise.allSettled(
                    urlsToCache.map(url => {
                        return cache.add(url).catch(err => {
                            console.warn(`[Service Worker] Failed to cache ${url}:`, err);
                        });
                    })
                );
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // If network fetch is successful, clone it and update the cache
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If network fails (offline), fallback to cache
                return caches.match(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
