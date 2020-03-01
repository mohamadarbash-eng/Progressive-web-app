self.addEventListener("install", function (event) {
    console.log("install", event);
});

self.addEventListener("activate", function (event) {
    console.log("activated", event);
    return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    console.log("fetch", event);
    event.respondWith(fetch(event.request));
});

