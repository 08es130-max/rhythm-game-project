/* Self-contained lounge offline cache. */
const CACHE='hobofes-lounge-assets-v40';
const LOCAL=['./','./index.html','./mascot.css','./mascot-multi.js','./live-group-photo.js','./live-group-photo.css','./lounge-background.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(LOCAL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hobofes-lounge-assets-')&&k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  const local=url.origin===self.location.origin&&url.pathname.includes('/lounge/');
  if(!local)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(request);
    const isDocument=request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/lounge/');
    try{
      const response=await fetch(request,isDocument?{cache:'no-store'}:undefined);
      if(response.ok||response.type==='opaque')await cache.put(request,response.clone());
      return response;
    }catch(error){
      if(cached)return cached;
      throw error;
    }
  })());
});
