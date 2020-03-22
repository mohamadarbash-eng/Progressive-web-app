var staticName = 'static-v2';
var dynamicName = 'dynamic-v2';
var STATIC = [
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
];

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

/*
 function trimCache(cacheName, maxItems) {
   caches.open(cacheName)
     .then(function (cache) {
       return cache.keys()
         .then(function (keys) {
           if (keys.length > maxItems) {
             cache.delete(keys[0])
               .then(trimCache(cacheName, maxItems));
           }
         });
     })
 }
*/
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(staticName)
            .then(function(cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll(STATIC);
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

// cache then network
self.addEventListener('fetch', (event) => {
    var url = 'https://pwa2020-d6252.firebaseio.com/posts.json';
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(dynamicName)
                .then(function (cache) {
                    return fetch(event.request)
                        .then(function (res) {
                          //  trimCache(dynamicName, 3);
                            cache.put(event.request, res.clone());
                            return res;
                        });
                }));
    } else if (isInArray(event.request.url, STATIC)) {
        event.respondWith(
            caches.match(event.request)
        )
    } else {
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
                                          //  trimCache(dynamicName, 3);
                                            cache.put(event.request.url, res.clone());
                                            return res;
                                        })
                                }).catch(() => {
                                    return caches.open(staticName).then((cache)=> {
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return  cache.match('/offline.html');
                                        }
                                    })
                                });
                        }
                    })
            );
    }
});

/*

 */
