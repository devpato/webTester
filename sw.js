const cacheName = "my-website-tester";
const filesToCache = [
    "/",
    "index.html",
    "index.js",
    "styles.css"
];

self.addEventListener("install", e => {
    console.log("[ServiceWorker**] - Install");
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log("[ServiceWorker**] - Caching app shell");
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("activate", event => {
    caches.keys().then(keyList => {
        return Promise.all(
            keyList.map(key => {
                if (key !== cacheName) {
                    console.log("[ServiceWorker] - Removing old cache", key);
                    return caches.delete(key);
                }
            })
        );
    });
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(response => {
            return response || fetch(event.request);
        })
    );
});