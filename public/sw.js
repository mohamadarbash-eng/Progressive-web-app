var staticName = 'static-v2';
var dynamicName = 'dynamic-v2';

self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(staticName)
            .then(function(cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/src/js/app.js',
                    '/offline.html',
                    '/src/js/feed.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]);
            })
    )
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) =>  {
                if (key !== staticName && key !== dynamicName) {
                   return  caches.delete(key);
                }
            }))
        })
    );
    console.log('[Service Worker] Activating Service Worker ....', event);
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then((res) => {
                            return caches.open(dynamicName)
                                .then( (cache) => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        }).catch(() => {
                            return caches.open(staticName).then((cache)=> {
                                return  cache.match('/offline.html');
                            })
                        });
                }
            })
    );
});
