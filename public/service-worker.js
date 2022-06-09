console.log("checking status");

// resources to build application
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/indexeDB.js",
  "/styles.css",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Prevent caches from using outdated cache
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Successfully pre-cached files");
      // installs all initial resources/static assets and add to cache
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // tell browser to activate service worker immediately when it completes installing
  self.skipWaiting();
});

// clears cache/reactivates application when complete
// activate service worker/remove old data from the cache.
// runs before the install, ensures all version numbers stay the same
self.addEventListener("activate", function (event) {
  event.waitUtil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Old cache removed", key);
            // removes old cache
            return caches.delete(key);
          }
        })
      );
    })
  );
  // will not call the server if file is in that cache
  self.clients.claim();
});

// handles requests
self.addEventListener("fetch", function (event) {
  // checks if api request, and if so will cache a successful request
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request);
      });
    })
  );
});
