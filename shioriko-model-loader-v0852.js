// Lazy lifecycle owner for both production and prototype models. No rendering on home/live.
(function () {
  'use strict';
  const REV = '0.8.52-pipeline2';
  const THREE_URL = 'https://esm.sh/three@0.180.0';
  const GLTF_URL = 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
  const room = document.getElementById('interactionRoomScreen');
  const slot = document.getElementById('interactionModelSlot');
  const msg = document.getElementById('interactionMessage');
  if (!room || !slot || window.__shiorikoProduction3D) return;
  let generation = 0, pending = null, view = null, loop = null, destroyed = false, pageActive = true;
  const lifecycle = new AbortController();
  const visible = () => !destroyed && pageActive && !room.hidden && document.visibilityState === 'visible';
  function clear() {
    generation++; pending?.abort(); pending = null;
    loop?.stop(); loop = null; view?.dispose(); view = null;
    slot.replaceChildren(); delete slot.dataset.threeReady;
    room.querySelectorAll('[data-action]').forEach(b => { b.disabled = true; });
  }
  async function start() {
    if (!visible() || pending || view) return;
    const controller = new AbortController(); pending = controller;
    const signal = controller.signal, token = ++generation;
    const check = () => { if (signal.aborted || token !== generation || !visible()) throw new DOMException('Room closed', 'AbortError'); };
    async function fetchAsset(url, options = {}) {
      const request = new AbortController();
      const abort = () => request.abort(); signal.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(abort, 15000);
      try {
        const response = await fetch(url, { ...options, signal: request.signal });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        if (Number(response.headers.get('content-length')) > 64 * 1024 * 1024) throw new Error('Asset exceeds 64 MiB');
        return await response.arrayBuffer();
      } finally { clearTimeout(timer); signal.removeEventListener('abort', abort); }
    }
    slot.dataset.threeReady = 'loading'; msg.textContent = '3Dモデルを読み込んでいます…';
    let runtime, T, manifest = {}, gltf = null;
    try {
      [runtime, T] = await Promise.all([import('./shioriko-model-runtime-v0852.js?v=' + REV), import(THREE_URL)]);
      check();
      let failure = null;
      try {
        const config = await fetchAsset('assets/models/shioriko/model.json?v=' + REV, { cache: 'no-cache' });
        manifest = JSON.parse(new TextDecoder().decode(config)); check();
        const url = new URL(manifest.path, document.baseURI);
        if (url.origin !== location.origin || !url.pathname.endsWith('.glb')) throw new Error('Expected same-origin GLB');
        url.searchParams.set('v', manifest.assetRevision || REV);
        // Status is authoring metadata: an existing GLB is attempted even before status is updated.
        const bytes = await fetchAsset(url); check();
        if (bytes.byteLength > 64 * 1024 * 1024 || bytes.byteLength < 20 || new DataView(bytes).getUint32(0, true) !== 0x46546c67) throw new Error('Invalid GLB');
        const { GLTFLoader } = await import(GLTF_URL); check();
        gltf = await new GLTFLoader().parseAsync(bytes, new URL('.', url).href);
        check();
        const owned = gltf; gltf = null; // createProductionView owns cleanup, including construction failures.
        view = runtime.createProductionView(T, owned, { slot, room, msg, manifest });
      } catch (e) {
        if (gltf) { runtime.disposeGltf(gltf); gltf = null; }
        check(); failure = e;
      }
      if (!view) {
        console.info('[Shioriko3D] Using prototype:', failure?.message);
        const { createFallback } = await import('./shioriko-3d-v0851.js?v=' + REV); check();
        view = createFallback(T, { slot, msg, room }, runtime);
      }
      check();
      slot.dataset.threeReady = view.mode;
      room.querySelector('.interaction-room-status').textContent = view.mode === 'production' ? '3D ROOM' : '3D ROOM β';
      msg.textContent = view.mode === 'production' ? '3Dモデルを読み込みました。' : '高精細モデルは制作中です。現在は3Dプロトタイプを表示しています。';
      loop = runtime.createFrameLoop((now, dt) => {
        if (!visible()) { clear(); return; }
        try { view?.frame(now, dt); }
        catch (error) { clear(); msg.textContent = '3D表示を停止しました。ふれあいを開き直してください。'; console.warn('[Shioriko3D]', error); }
      }, manifest.targetFps);
      loop.start();
    } catch (e) {
      if (gltf) runtime?.disposeGltf(gltf);
      if (token === generation) {
        view?.dispose(); view = null;
        slot.replaceChildren(); slot.dataset.threeReady = 'error';
        if (visible()) msg.textContent = '3Dを読み込めませんでした。通信状態を確認して、ふれあいを開き直してください。';
        if (e.name !== 'AbortError') console.warn('[Shioriko3D]', e);
      }
    } finally {
      if (pending === controller) pending = null;
    }
  }
  const sync = () => { if (visible()) start(); else clear(); };
  const observer = new MutationObserver(sync); observer.observe(room, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', sync, { signal: lifecycle.signal });
  window.addEventListener('pagehide', () => { pageActive = false; clear(); }, { signal: lifecycle.signal });
  window.addEventListener('pageshow', () => { pageActive = true; sync(); }, { signal: lifecycle.signal });
  window.__shiorikoProduction3D = {
    get booted() { return !!view; }, get mode() { return view?.mode || 'unloaded'; },
    get renderer() { return view?.renderer; }, get model() { return view?.model; },
    get camera() { return view?.camera; }, get mixer() { return view?.mixer; },
    get rendering() { return !!loop?.running; },
    setExpression(...args) { return view?.setExpression?.(...args) || false; },
    playClip(...args) { return view?.playClip?.(...args) || false; },
    reload() { clear(); return start(); },
    dispose() { destroyed = true; clear(); observer.disconnect(); lifecycle.abort(); }
  };
  sync();
})();
