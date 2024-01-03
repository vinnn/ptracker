// The version of the cache.
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `period-tracker-${VERSION}`;

// The static resources that the app needs to function.
// (do not include the service worker file)
const APP_STATIC_RESOURCES = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "/tracker.json",
    "/icons/brush-icon.png"
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
    console.log("sw install")
    event.waitUntil(
      (async () => {
        console.log("sw install, waitUntil, CACHE_NAME", CACHE_NAME);        
        let cache = await caches.open(CACHE_NAME);
        console.log("sw install, waitUntil, cache BEFORE addAll", cache);
        console.log("sw install, waitUntil, APP_STATIC_RESOURCES", APP_STATIC_RESOURCES);          
        // cache.addAll(APP_STATIC_RESOURCES);
        cache.addAll(["hello", "hello2"]);
        console.log("sw install, waitUntil, cache AFTER addAll", cache);
      })()
    );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
    console.log("sw activate")
    event.waitUntil(
      (async () => {
        const names = await caches.keys();
        console.log("sw activate / waitUntil, names", names);

        await Promise.all(
          names.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
        console.log("sw activate / waitUntil, Promise.all");

        await clients.claim();
        console.log("sw activate / waitUntil, clients.claim()");

      })()
    );
});

// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
    console.log("sw fetch")
    // As a single page app, direct app to always go to cached home page.
    if (event.request.mode === "navigate") {
        console.log("sw fetch, navigate")  
        event.respondWith(caches.match("/"));
        return;
    }

    // For all other requests, go to the cache first, and then the network.
    event.respondWith(
      (async () => {
        console.log("sw fetch, respondWith")  

        console.log("sw fetch, respondWith, CACHE_NAME", CACHE_NAME)          
        const cache = await caches.open(CACHE_NAME);
        console.log("sw fetch, respondWith, cache", cache)  

        console.log("sw fetch, respondWith, event.request.url", event.request.url)         
        // const cachedResponse = await cache.match(event.request.url);
        const cachedResponse = await cache.match(event.request);       
        console.log("sw fetch, respondWith, cachedResponse", cachedResponse) 

        if (cachedResponse) {
          // Return the cached response if it's available.
          return cachedResponse;
        }
        // If resource isn't in the cache, return a 404.
        return new Response(null, { status: 404 });
      })()
    );
});


