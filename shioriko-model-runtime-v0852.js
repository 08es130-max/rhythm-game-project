// Interaction-room-only utilities. No rhythm engine dependencies.
export function disposeObject(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set(), skeletons = new Set();
  root.traverse(o => {
    if (o.geometry) geometries.add(o.geometry);
    if (o.skeleton) skeletons.add(o.skeleton);
    for (const m of [].concat(o.material || [])) {
      materials.add(m);
      for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
      for (const u of Object.values(m.uniforms || {})) if (u.value?.isTexture) textures.add(u.value);
    }
  });
  geometries.forEach(g => g.dispose());
  materials.forEach(m => m.dispose());
  const images = new Set();
  textures.forEach(t => { if (t.source?.data) images.add(t.source.data); t.dispose(); });
  skeletons.forEach(s => s.dispose());
  images.forEach(i => i.close?.());
}

export function disposeGltf(gltf) {
  disposeObject({ traverse(fn) { for (const scene of gltf.scenes || [gltf.scene]) scene.traverse(fn); } });
}

export function createFrameLoop(frame, fps = 30) {
  let raf = 0, previous = null, running = false;
  const interval = 1000 / Math.min(30, Math.max(1, Number(fps) || 30));
  function tick(now) {
    if (!running) return;
    if (previous === null || now - previous >= interval) {
      const dt = previous === null ? 0 : Math.min(.05, (now - previous) / 1000);
      previous = now;
      frame(now, dt);
    }
    if (running) raf = requestAnimationFrame(tick);
  }
  return {
    start() { if (!running) { running = true; previous = null; raf = requestAnimationFrame(tick); } },
    stop() { running = false; cancelAnimationFrame(raf); raf = 0; previous = null; },
    get running() { return running; }
  };
}

export function createModelControls(THREE, model, animations = []) {
  const morphs = new Map();
  model.traverse(o => {
    for (const [name, index] of Object.entries(o.morphTargetDictionary || {})) {
      if (!morphs.has(name)) morphs.set(name, []);
      morphs.get(name).push([o, index]);
    }
  });
  const mixer = new THREE.AnimationMixer(model);
  const clips = new Map(animations.map(c => [c.name, c]));
  let active = null;
  function resetExpression() {
    for (const entries of morphs.values()) for (const [o, i] of entries) o.morphTargetInfluences[i] = 0;
  }
  function setExpression(name, weight = 1, { exclusive = true } = {}) {
    let entries = morphs.get(name);
    if (name === 'Blink' && !entries) entries = [...(morphs.get('Blink_L') || []), ...(morphs.get('Blink_R') || [])];
    if (name !== 'Neutral' && !entries?.length) return false;
    if (!Number.isFinite(weight)) return false;
    if (exclusive || name === 'Neutral') resetExpression();
    for (const [o, i] of entries || []) o.morphTargetInfluences[i] = Math.max(0, Math.min(1, weight));
    return true;
  }
  function playClip(name, loop = name === 'Idle' || name === 'Dance_01') {
    const clip = clips.get(name);
    if (!clip) return false;
    const action = mixer.clipAction(clip);
    if (active && active !== action) active.fadeOut(.15);
    action.reset().setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = !loop;
    action.fadeIn(.15).play(); active = action;
    return true;
  }
  const finished = e => { if (e.action === active) playClip('Idle', true); };
  mixer.addEventListener('finished', finished);
  return { mixer, clips, morphs, setExpression, resetExpression, playClip,
    dispose() { mixer.removeEventListener('finished', finished); mixer.stopAllAction(); mixer.uncacheRoot(model); } };
}

// Raycast all visible meshes, then resolve explicit metadata, parents or dominant skin bone.
export function resolveTouchTarget(hit) {
  if (!hit) return null;
  const classify = name => {
    if (/^(Head|Face|Eye[s]?_[LR]|Hair_.*)$/i.test(name || '')) return 'Head';
    if (/^LeftHand$/i.test(name || '')) return 'LeftHand';
    if (/^RightHand$/i.test(name || '')) return 'RightHand';
    if (/^Body$/i.test(name || '')) return 'Body';
    return null;
  };
  for (let o = hit.object; o; o = o.parent) {
    const target = classify(o.userData?.touchTarget) || classify(o.name);
    if (target && target !== 'Body') return target;
  }
  const mesh = hit.object, vertex = hit.face?.a;
  if (mesh.isSkinnedMesh && vertex !== undefined) {
    const indices = mesh.geometry.getAttribute('skinIndex'), weights = mesh.geometry.getAttribute('skinWeight');
    if (indices && weights) {
      const values = [weights.getX(vertex), weights.getY(vertex), weights.getZ(vertex), weights.getW(vertex)];
      const bones = [indices.getX(vertex), indices.getY(vertex), indices.getZ(vertex), indices.getW(vertex)];
      let bone = mesh.skeleton.bones[bones[values.indexOf(Math.max(...values))]];
      while (bone) { const name = classify(bone.name); if (name) return name; bone = bone.parent; }
    }
  }
  return 'Body';
}

export function createProductionView(T, gltf, { slot, msg, room, manifest }) {
  const scene = new T.Scene(), framing = new T.Group();
  const model = gltf.scene;
  scene.add(framing); framing.add(model);
  let renderer, resizeObserver, controls;
  const events = new AbortController();
  const buttons = [];
  let disposed = false;
  function dispose() {
    if (disposed) return; disposed = true;
    events.abort(); resizeObserver?.disconnect(); controls?.dispose();
    buttons.forEach(b => b.remove()); disposeGltf(gltf);
    renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
  }
  try {
    const box = new T.Box3().setFromObject(model), size = box.getSize(new T.Vector3());
    if (!Number.isFinite(size.y) || size.y < .01) throw new Error('GLB has no usable geometry');
    // Normalize a wrapper, never the animated root's authored transform.
    framing.scale.setScalar((manifest.targetHeightMeters || 1.6) / size.y);
    framing.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(framing), center = bounds.getCenter(new T.Vector3());
    framing.position.set(-center.x, -bounds.min.y, -center.z);
    framing.updateMatrixWorld(true);
    const target = new T.Vector3(0, (manifest.targetHeightMeters || 1.6) * .52, 0);
    const radius = Math.max(3, (manifest.targetHeightMeters || 1.6) * 2.15);
    const camera = new T.PerspectiveCamera(32, 1, .05, 100);
    renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Math.max(1, Math.min(1.5, manifest.maxDevicePixelRatio || 1.5))));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.id = 'interaction3dCanvas'; canvas.setAttribute('aria-label', '栞子 3Dモデル');
    canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab';
    slot.replaceChildren(canvas);
    scene.add(new T.HemisphereLight(0xffffff, 0x1b2735, 2.2));
    const key = new T.DirectionalLight(0xffffff, 2.7); key.position.set(3.5, 5.5, 4.5); scene.add(key);
    const rim = new T.DirectionalLight(0x74d9d0, 1.15); rim.position.set(-4, 2, -3); scene.add(rim);
    controls = createModelControls(T, model, gltf.animations);
    controls.playClip('Idle');
    let yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0, down = null, moved = false, sx, sy, syaw, spitch;
    const ray = new T.Raycaster(), pointer = new T.Vector2();
    const on = (el, type, fn) => el?.addEventListener(type, fn, { signal: events.signal });
    function resize() {
      const r = slot.getBoundingClientRect(); if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    }
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(slot); resize();
    on(canvas, 'pointerdown', e => {
      if (down !== null) return;
      e.stopPropagation(); down = e.pointerId; moved = false; sx = e.clientX; sy = e.clientY;
      syaw = targetYaw; spitch = targetPitch; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
    });
    on(canvas, 'pointermove', e => {
      if (down !== e.pointerId) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.hypot(dx, dy) > 5) moved = true;
      targetYaw = syaw - dx * .010; targetPitch = spitch + dy * .010;
    });
    const release = () => { down = null; canvas.style.cursor = 'grab'; };
    on(canvas, 'pointercancel', release); on(canvas, 'lostpointercapture', release);
    on(canvas, 'pointerup', e => {
      if (down !== e.pointerId) return; e.stopPropagation(); release(); if (moved) return;
      const r = canvas.getBoundingClientRect(); pointer.set((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1);
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObject(model, true).find(h => { for (let o = h.object; o; o = o.parent) if (!o.visible) return false; return true; });
      const targetName = resolveTouchTarget(hit); if (!targetName) return;
      if (targetName === 'Head') { controls.setExpression('Blush'); msg.textContent = '「……そんなに見つめられると、少し照れます。」'; }
      else if (targetName.endsWith('Hand')) { controls.playClip('Wave', false); msg.textContent = '「ごきげんよう。」'; }
      else { controls.playClip('Look', false); msg.textContent = '栞子がこちらへ静かに視線を向けました。'; }
      room.dispatchEvent(new CustomEvent('shioriko-touch', { detail: { target: targetName, object: hit.object.name } }));
    });
    for (const [id, label, p] of [['interactionTopViewBtn','真上から見る',Math.PI/2],['interactionBottomViewBtn','真下から見る',-Math.PI/2],['interactionFrontViewBtn','正面に戻す',0]]) {
      const b = document.createElement('button'); b.id = id; b.type = 'button'; b.textContent = label;
      room.querySelector('#interactionActions').appendChild(b); buttons.push(b);
      on(b, 'click', () => { targetYaw = 0; targetPitch = p; });
    }
    for (const [action, clip] of [['look','Look'],['wave','Wave'],['dance','Dance_01']]) {
      const b = room.querySelector(`[data-action="${action}"]`); if (!b) continue;
      b.disabled = !controls.clips.has(clip); if (action === 'dance') b.textContent = 'ダンス';
      on(b, 'click', () => controls.playClip(clip));
    }
    return { mode: 'production', scene, model, camera, renderer, ...controls, dispose,
      frame(now, dt) {
        yaw += (targetYaw-yaw)*Math.min(1,dt*9); pitch += (targetPitch-pitch)*Math.min(1,dt*9);
        const cp = Math.cos(pitch), sp = Math.sin(pitch), sy = Math.sin(yaw), cy = Math.cos(yaw);
        camera.position.set(target.x+radius*sy*cp,target.y+radius*sp,target.z+radius*cy*cp);
        camera.up.set(-sy*sp,cp,-cy*sp).normalize(); camera.lookAt(target);
        controls.mixer.update(dt); renderer.render(scene,camera);
      }
    };
  } catch (e) { dispose(); throw e; }
}
