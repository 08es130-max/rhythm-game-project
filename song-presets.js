const spicaPresetBtn = document.getElementById('spicaPresetBtn');

const PRESET_AUDIO_DB = 'rhythmGamePresetAudio';
const PRESET_AUDIO_STORE = 'audio';
const SPICA_AUDIO_KEY = 'spica-terrible';
const SPICA_TARGET_NOTE_COUNT = 1650;
let awaitingPresetAudioKey = null;
let presetAudioObjectUrl = null;

if (speed) {
  speed.max = '4.0';
  speed.step = '0.1';
}

function openPresetAudioDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PRESET_AUDIO_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PRESET_AUDIO_STORE)) db.createObjectStore(PRESET_AUDIO_STORE, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePresetAudio(key, file) {
  const db = await openPresetAudioDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PRESET_AUDIO_STORE, 'readwrite');
    tx.objectStore(PRESET_AUDIO_STORE).put({ key, blob:file, name:file.name || '音源', type:file.type || '', size:file.size || 0, savedAt:Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}

async function getPresetAudio(key) {
  const db = await openPresetAudioDb();
  const record = await new Promise((resolve, reject) => {
    const tx = db.transaction(PRESET_AUDIO_STORE, 'readonly');
    const req = tx.objectStore(PRESET_AUDIO_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return record;
}

function usePresetAudio(record, title) {
  if (!record?.blob) return false;
  if (presetAudioObjectUrl) URL.revokeObjectURL(presetAudioObjectUrl);
  presetAudioObjectUrl = URL.createObjectURL(record.blob);
  if (audio.src && audio.src.startsWith('blob:')) { try { URL.revokeObjectURL(audio.src); } catch (_) {} }
  audio.src = presetAudioObjectUrl;
  audioMode.value = 'file';
  songName.textContent = `${title}（保存済み音源）`;
  canStart();
  return true;
}

function nearestEventDistance(times, value) {
  let lo=0, hi=times.length;
  while (lo < hi) { const mid=(lo+hi)>>1; if (times[mid] < value) lo=mid+1; else hi=mid; }
  let best=Infinity;
  if (lo < times.length) best=Math.min(best, Math.abs(times[lo]-value));
  if (lo > 0) best=Math.min(best, Math.abs(times[lo-1]-value));
  return best;
}

function addSpicaHoldNotes(notes, bpm=161.499) {
  const beat = 60000 / bpm;
  const out = notes.map(n => ({...n}));
  const used = new Set();
  let made = 0;
  for (let i=24; i<out.length-8 && made<64; i+=25) {
    const n = out[i];
    if (!n || used.has(`${n.timeMs}:${n.lane}`)) continue;
    const durationMs = Math.round(beat * (made % 3 === 0 ? 3 : 2));
    const end = n.timeMs + durationMs;
    const conflicts = out.some((x,j) => j!==i && x.lane===n.lane && x.timeMs>n.timeMs && x.timeMs<end);
    if (conflicts) continue;
    n.durationMs = durationMs;
    used.add(`${n.timeMs}:${n.lane}`);
    made++;
  }
  return out;
}

function makeSpicaHighDensityChart(source) {
  if (!source?.notes?.length) return source;
  const notes = source.notes.map(n => ({...n}));
  const lanesByTime = new Map();
  notes.forEach(n => {
    if (!lanesByTime.has(n.timeMs)) lanesByTime.set(n.timeMs, new Set());
    lanesByTime.get(n.timeMs).add(n.lane);
  });
  const eventTimes = [...lanesByTime.keys()].sort((a,b)=>a-b);
  const start = eventTimes.find(t=>t>=10000) ?? eventTimes[0];
  const end = eventTimes[eventTimes.length-1];
  const step = 93;
  const candidates=[];
  for (let t=start; t<=end; t+=step) {
    const d=nearestEventDistance(eventTimes,t);
    if (d>=72 && d<=760) candidates.push(t);
  }
  let need=Math.max(0, SPICA_TARGET_NOTE_COUNT-notes.length);
  const take=Math.min(need,candidates.length);
  for (let i=0;i<take;i++) {
    const idx=Math.min(candidates.length-1,Math.floor((i+0.5)*candidates.length/take));
    const t=candidates[idx];
    if (lanesByTime.has(t)) continue;
    const phase=Math.floor((t-start)/93)%32;
    let lane=phase<=8?phase:phase<=16?16-phase:phase<=24?phase-16:32-phase;
    lane=Math.max(0,Math.min(8,lane));
    lanesByTime.set(t,new Set([lane]));
    notes.push({timeMs:t,lane});
    need--;
  }
  if (need>0) {
    const singles=eventTimes.filter(t=>lanesByTime.get(t)?.size===1 && t>=start);
    const selected=Math.min(need,singles.length);
    for (let i=0;i<selected;i++) {
      const idx=Math.min(singles.length-1,Math.floor((i+0.5)*singles.length/selected));
      const t=singles[idx];
      const occupied=lanesByTime.get(t);
      const first=[...occupied][0];
      let lane=8-first;
      if (lane===first || occupied.has(lane)) lane=first<4?8:0;
      if (occupied.has(lane)) continue;
      occupied.add(lane); notes.push({timeMs:t,lane}); need--;
      if (need<=0) break;
    }
  }
  notes.sort((a,b)=>a.timeMs-b.timeMs || a.lane-b.lane);
  const withHolds = addSpicaHoldNotes(notes, source.bpm || 161.499);
  return {...source, difficulty:'EXPERT+高密度＋長押し', noteCount:withHolds.length, notes:withHolds};
}

async function loadBuiltInChart(path, fallbackTitle, transform=null) {
  try {
    const response=await fetch(`${path}?v=${window.APP_VERSION}&t=${Date.now()}`,{cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    let parsed=await response.json();
    if(transform) parsed=transform(parsed);
    validateChart(parsed);
    chart=parsed;
    const holds=parsed.notes.filter(n=>Number.isFinite(n.durationMs)).length;
    chartName.textContent=`${parsed.title||fallbackTitle||path}（${parsed.notes.length} notes / HOLD ${holds}）`;
    offsetInput.value=String(getSavedTimingOffset());
    canStart();
    return parsed;
  } catch(e) {
    alert('内蔵譜面を読み込めませんでした: '+e.message);
    return null;
  }
}

async function prepareSpicaAudio() {
  try {
    const cached=await getPresetAudio(SPICA_AUDIO_KEY);
    if(cached && usePresetAudio(cached,'スピカテリブル')) return true;
  } catch(e) { console.warn('保存済み音源を読み込めませんでした',e); }
  awaitingPresetAudioKey=SPICA_AUDIO_KEY;
  songName.textContent='スピカテリブル（初回のみ音源ファイルを選択してください）';
  audioFile.click();
  return false;
}

spicaPresetBtn?.addEventListener('click', async()=>{
  const parsed=await loadBuiltInChart('charts/spica-terrible.json','スピカテリブル',makeSpicaHighDensityChart);
  if(!parsed) return;
  audioMode.value='file';
  await prepareSpicaAudio();
  canStart();
});

audioFile.addEventListener('change', async()=>{
  const file=audioFile.files?.[0];
  if(!file || !awaitingPresetAudioKey) return;
  const key=awaitingPresetAudioKey; awaitingPresetAudioKey=null;
  try {
    await savePresetAudio(key,file);
    if(key===SPICA_AUDIO_KEY) songName.textContent='スピカテリブル（音源をこの端末に保存しました）';
  } catch(e) {
    console.warn('音源を端末に保存できませんでした',e);
    if(key===SPICA_AUDIO_KEY) songName.textContent='スピカテリブル（今回はこのファイルで再生します）';
  }
  canStart();
});

// ---- Ver.0.3.3 audio fixes ----
(function(){
  const TAP_SKIP_SECONDS=0.012;
  let duckTimer=null;
  if (typeof boostedTapBuffer !== 'undefined') {
    playTapSound=function(){
      audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume().catch(()=>{});
      const buffer=useDeviceCustomTap&&customTapBuffer?customTapBuffer:boostedTapBuffer;
      if(!buffer){prepareBoostedTapSound().catch(()=>{});return;}
      const source=audioCtx.createBufferSource();
      const gain=audioCtx.createGain();
      source.buffer=buffer; gain.gain.value=useDeviceCustomTap?1.15:1.5;
      source.connect(gain).connect(audioCtx.destination);
      source.start(0,Math.min(TAP_SKIP_SECONDS,Math.max(0,buffer.duration-0.02)));
    };
  }
  if (typeof playManagedVoice === 'function') {
    playManagedVoice=async function(item){
      audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') await audioCtx.resume().catch(()=>{});
      try{currentManagedVoiceSource?.stop();}catch(_){}
      const source=audioCtx.createBufferSource();
      const gain=audioCtx.createGain();
      const comp=audioCtx.createDynamicsCompressor();
      gain.gain.value=2.4; comp.threshold.value=-12; comp.ratio.value=4;
      let duration=2.5;
      if(item.kind==='builtin'){
        const buffer=await preloadTenHitVoice(); if(!buffer)return;
        source.buffer=buffer; duration=item.segment.duration;
        source.connect(gain).connect(comp).connect(audioCtx.destination);
        source.start(0,item.segment.offset,item.segment.duration);
      } else {
        source.buffer=await decodeManagedLocalVoice(item); duration=source.buffer.duration;
        source.connect(gain).connect(comp).connect(audioCtx.destination); source.start();
      }
      if(audio && !audio.paused){
        const prev=audio.volume; audio.volume=Math.min(prev,0.35); clearTimeout(duckTimer);
        duckTimer=setTimeout(()=>{try{audio.volume=prev}catch(_){}},Math.max(600,duration*1000+150));
      }
      currentManagedVoiceSource=source;
      source.onended=()=>{if(currentManagedVoiceSource===source)currentManagedVoiceSource=null;};
    };
  }
})();

// ---- Ver.0.3.3 hold-note gameplay ----
(function(){
  const heldLanes=new Set();
  const pointerLane=new Map();
  const baseReset=resetGame;
  resetGame=function(){heldLanes.clear();pointerLane.clear();baseReset();activeNotes.forEach(n=>{n.holding=false;n.holdGrade=null;n.holdEndMs=Number.isFinite(n.durationMs)?n.timeMs+n.durationMs:null;});};
  const baseValidate=validateChart;
  validateChart=function(data){baseValidate(data);data.notes.forEach((n,i)=>{if(n.durationMs!=null&&(!Number.isFinite(n.durationMs)||n.durationMs<250||n.durationMs>8000))throw new Error(`notes[${i}] のdurationMsが不正です`);});};
  const gradeOf=a=>a<=HIT_WINDOWS.perfect?'perfect':a<=HIT_WINDOWS.great?'great':'good';
  function holdEl(n,lead,spawn,p){const el=document.createElement('div');el.className='note hold-note';const tail=document.createElement('span');tail.style.cssText='position:absolute;left:50%;top:50%;width:12px;border-radius:999px;background:linear-gradient(to top,rgba(255,255,255,.95),rgba(96,165,250,.75),rgba(96,165,250,.12));box-shadow:0 0 10px rgba(147,197,253,.9);transform-origin:50% 100%;pointer-events:none;z-index:-1';const len=Math.hypot(p.x-spawn.x,p.y-spawn.y);tail.style.height=`${Math.max(36,Math.min(len*.72,len*(n.durationMs/lead)))}px`;const ang=Math.atan2(spawn.y-p.y,spawn.x-p.x)*180/Math.PI+90;tail.style.transform=`translate(-50%,-100%) rotate(${ang}deg)`;el.appendChild(tail);notesLayer.appendChild(el);return el;}
  function complete(n){if(!n||n.hit||n.missRegistered||n.finished)return;n.holding=false;const g=n.holdGrade||'perfect';registerHit(n,g);playTapSound(g);}
  function cancel(n){if(!n||n.hit||n.missRegistered||n.finished)return;n.holding=false;registerMiss(n);removeNoteEl(n);n.finished=true;}
  function releaseLane(lane){heldLanes.delete(lane);if(!playing)return;const now=currentMs();const n=activeNotes.find(x=>x.lane===lane&&x.holding&&!x.hit&&!x.missRegistered&&!x.finished);if(!n)return;if(now>=(n.holdEndMs??n.timeMs+n.durationMs)-HIT_WINDOWS.good)complete(n);else{cancel(n);judgeEl.textContent='HOLD MISS';}}
  hitLane=function(lane){heldLanes.add(lane);flashTarget(lane);if(!playing)return;const now=currentMs();let c=null,b=Infinity;for(const n of activeNotes){if(n.lane!==lane||n.hit||n.missRegistered||n.finished||n.holding)continue;const a=Math.abs(now-n.timeMs);if(a<b&&a<=HIT_WINDOWS.good){b=a;c=n;}}if(!c)return;const g=gradeOf(b);if(Number.isFinite(c.durationMs)&&c.durationMs>=250){c.holding=true;c.holdGrade=g;c.holdEndMs=c.timeMs+c.durationMs;c.el?.classList.add('holding');judgeEl.textContent=`HOLD ${g.toUpperCase()}`;playTapSound(g);return;}registerHit(c,g);playTapSound(g);};
  loop=function(){if(!playing)return;const now=currentMs(),lead=1600/Number(speed.value),{spawn,targetPoints}=getGeometry();for(const n of activeNotes){if(n.finished)continue;const isHold=Number.isFinite(n.durationMs)&&n.durationMs>=250,dt=n.timeMs-now;if(isHold&&n.holding){const p=targetPoints[n.lane];if(!n.el)n.el=holdEl(n,lead,spawn,p);n.el.style.left=`${p.x}px`;n.el.style.top=`${p.y}px`;n.el.style.transform='translate(-50%,-50%) scale(1)';n.el.style.boxShadow='0 0 0 5px rgba(255,255,255,.22),0 0 20px rgba(96,165,250,.95)';if(now>=n.holdEndMs){if(heldLanes.has(n.lane))complete(n);else cancel(n);}continue;}if(!n.hit&&!n.missRegistered&&dt<-MISS_WINDOW)registerMiss(n);if(n.hit){n.finished=true;continue;}if(dt<=lead&&dt>=-TRAIL_MS){const p=targetPoints[n.lane];if(!n.el)n.el=isHold?holdEl(n,lead,spawn,p):createNoteEl();const prog=getNoteProgress(dt,lead),x=spawn.x+(p.x-spawn.x)*prog,y=spawn.y+(p.y-spawn.y)*prog,scale=prog<=1?.45+.55*prog:1;n.el.style.left=`${x}px`;n.el.style.top=`${y}px`;n.el.style.transform=`translate(-50%,-50%) scale(${scale})`;n.el.classList.toggle('missed',n.missRegistered);}else if(dt<-TRAIL_MS){removeNoteEl(n);n.finished=true;}}if(isSilentMode()&&now>=silentDurationMs){finishGame();return;}rafId=requestAnimationFrame(loop);};
  document.addEventListener('pointerdown',e=>{const t=e.target?.closest?.('.target');if(!t)return;const lane=Number(t.dataset.lane);if(Number.isInteger(lane))pointerLane.set(e.pointerId,lane);},true);
  document.addEventListener('pointerup',e=>{const lane=pointerLane.get(e.pointerId);if(lane!=null)releaseLane(lane);pointerLane.delete(e.pointerId);},true);
  document.addEventListener('pointercancel',e=>{const lane=pointerLane.get(e.pointerId);if(lane!=null)releaseLane(lane);pointerLane.delete(e.pointerId);},true);
  document.addEventListener('keyup',e=>{const lane=laneKeys.indexOf(e.code);if(lane>=0)releaseLane(lane);});
})();
