importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

var staticName = "static-v3";
var dynamicName = "dynamic-v3";
var STATIC = [
    "/",
    "/index.html",
    "/src/js/app.js",
    "/offline.html",
    "/src/js/feed.js",
    "/src/js/idb.js",
    "/src/js/promise.js",
    "/src/js/fetch.js",
    "/src/js/material.min.js",
    "/src/css/app.css",
    "/src/css/feed.css",
    "/src/images/main-image.jpg",
    "https://fonts.googleapis.com/css?family=Roboto:400,700",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
];


function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log("matched ", string);
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
self.addEventListener("install", function (event) {
    console.log("[Service Worker] Installing Service Worker ...", event);
    event.waitUntil(
        caches.open(staticName)
            .then(function (cache) {
                console.log("[Service Worker] Precaching App Shell");
                cache.addAll(STATIC);
            })
    )
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => {
                if (key !== staticName && key !== dynamicName) {
                    return caches.delete(key);
                }
            }))
        })
    );
    console.log("[Service Worker] Activating Service Worker ....", event);
    return self.clients.claim();
});

// cache then network
self.addEventListener("fetch", (event) => {
    var url = "https://pwa2020-d6252.firebaseio.com/posts.json";
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
                .then(function (res) {
                    var clonesRes = res.clone();
                    clearAllData("posts")
                        .then(() => {
                            return clonesRes.json();
                        }).then((data) => {
                        for (var key in data) {
                            writeData("posts", data[key]);
                        }
                    });
                    return res;
                })
            /*   caches.open(dynamicName)
                   .then(function (cache) {
                       return fetch(event.request)
                           .then(function (res) {
                             //  trimCache(dynamicName, 3);
                              // cache.put(event.request, res.clone());
                               return res;
                           });
                   })

             */
        );
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
                                    .then((cache) => {
                                        //  trimCache(dynamicName, 3);
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            }).catch(() => {
                                return caches.open(staticName).then((cache) => {
                                    if (event.request.headers.get("accept").includes("text/html")) {
                                        return cache.match("/offline.html");
                                    }
                                })
                            });
                    }
                })
        );
    }
});

self.addEventListener("sync", (event) => {
    console.log("sync");
    if (event.tag === "syncNewPost") {
        console.log("synced");
        event.waitUntil(
            readData("sync-post").then((data) => {
                for (dt of data) {
                    fetch("https://us-central1-pwa2020-d6252.cloudfunctions.net/storePostData", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            id: dt.id,
                            title: dt.title,
                            location: dt.location,
                            image: dt.image
                        })
                    }).then((res) => {
                        alert("synced", dt.id);
                        if (res.ok) {
                            return res.json()
                                .then((data) => {
                                    deleteItemFromIdb("sync-post", data.id)
                                })
                        }
                    }).catch(() => {
                        // do it
                    });
                }
            })
        );
    }
});


self.addEventListener("notificationclick", (event) => {
    var notification = event.notification;
    var action = event.action;

    console.log(notification);

    if (action === "confirm") {
        console.log("we love you");
        notification.close();
    } else {
        console.log("we hate you :P");
        notification.close();
    }
});

self.addEventListener("notificationclose", (event) => {
    console.log(event);
});



