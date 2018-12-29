(function () {
    "use strict";
  
    var cacheNameStatic = 'tmtimer-pwa';
  
    var currentCacheNames = [ cacheNameStatic ];
  
    var cachedUrls = [
        'css/tmTimer.min.css',
        'css/snackbar.min.css',
        'css/timingfield.min.css',
        'css/bootstrap.min.css',
        'css/select2.min.css',
        'js/lang/en.json',
        'js/lang/es.json',
        'js/select2.min.js',
        'js/jquery-3.3.1.min.js',
        'js/lang.js',
        'js/getOS.min.js',
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
        caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response || fetchPromise;     // if valid response is found in cache return it
          } else {
            return fetch(event.request)     //fetch from internet
              .then(function(res) {
                return caches.open(cacheNameStatic)
                  .then(function(cache) {
                    cache.put(event.request.url, res.clone());    //save the response for future
                    return res;   // return the fetched data
                  })
              })
              .catch(function(err) {       // fallback mechanism
                return caches.open(CACHE_CONTAINING_ERROR_MESSAGES)
                  .then(function(cache) {
                    return null;// cache.match('/offline.html');
                  });
              });
          }
        })
    );
  });
  
  })();
