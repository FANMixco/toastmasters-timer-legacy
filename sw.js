(function () {
    "use strict";
  
    var cacheNameStatic = 'tmtimer-pwa';
  
    var currentCacheNames = [ cacheNameStatic ];
  
    var cachedUrls = [
        'css/tmTimer.min.css',
        'css/snackbar.min.css',
        'css/timingfield.min.css',
        'css/bootstrap.min.css',
        'js/jquery-3.3.1.min.js',
        'js/getOS.min.js',
        'js/lang.js',
        'js/timingfield.min.js',
        'js/popper.min.js',
        'js/bootstrap.min.js',
        'js/bootstrap-confirmation.min.js',
        'js/date.js',
        'js/dbHandler.min.js',
        'js/tmTimer.js',
        'js/jspdf.min.js',
    ];
  
    // A new ServiceWorker has been registered
    self.addEventListener("install", function (event) {
      event.waitUntil(
        caches.delete(cacheNameStatic).then(function() {
          return caches.open(cacheNameStatic);
        }).then(function (cache) {
          return cache.addAll(cachedUrls);
        }).catch(function(e) {
        })
      );
    });
  
    // A new ServiceWorker is now active
    self.addEventListener("activate", function (event) {
      event.waitUntil(
        caches.keys()
          .then(function (cacheNames) {
            return Promise.all(
              cacheNames.map(function (cacheName) {
                if (currentCacheNames.indexOf(cacheName) === -1) {
                  return caches.delete(cacheName);
                }
              })
            );
          })
      );
    });
  
    // Save thing to cache in process of use
    self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open(cacheNameStatic).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          return response || fetchPromise;
        })
      })
    );
  });
  
  })();
  