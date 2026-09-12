// Ver.0.4.6
(function(){
  const lib=window.CHARACTER_LIBRARY;
  if(!Array.isArray(lib)) return;
  const nPool=lib.filter(c=>c&&c.id!=='default'&&/【音符ロリータ】$/u.test(String(c.name||'')));
  nPool.forEach(c=>{c.rarity='N';c.series='音符ロリータ';});
  const version=window.APP_VERSION||'0.4.6';
  const assetMap={mia:'lanzhu',rina:'shioriko',setsuna:'setsuna',emma:'emma',shioriko:'rina',lanzhu:'mia',ai:'kanata',shizuku:'karin',ayumu:'kasumi',kasumi:'ayumu',karin:'shizuku',kanata:'ai'};
  const monthly=[['ayumu','上原歩夢'],['kasumi','中須かすみ'],['shizuku','桜坂しずく'],['karin','朝香果林'],['ai','宮下愛'],['kanata','近江彼方'],['setsuna','優木せつ菜'],['emma','エマ・ヴェルデ'],['rina','天王寺璃奈'],['shioriko','三船栞子'],['mia','ミア・テイラー'],['lanzhu','鐘嵐珠']].map(([baseId,jp])=>{const icon=`assets/monthly-song/${assetMap[baseId]||baseId}.webp?v=${version}`;return{id:`monthly-${baseId}`,baseId,name:`${jp}【マンスリーソング】`,rarity:'UR',series:'マンスリーソング',icon,home:icon};});
  const OWNED_KEY='rhythmGame.unlockedCharacters.v1';
  function loadOwned(){try{const parsed=JSON.parse(localStorage.getItem(OWNED_KEY)||'[]');return new Set(Array.isArray(parsed)?parsed.filter(id=>monthly.some(c=>c.id===id)):[]);}catch(_){return new Set();}}
  function syncOwnedToLibrary(set=loadOwned()){const ids=new Set(lib.map(c=>c?.id));monthly.forEach(c=>{if(set.has(c.id)&&!ids.has(c.id)){lib.push(c);ids.add(c.id);}});}
  function saveOwned(set){localStorage.setItem(OWNED_KEY,JSON.stringify([...set]));syncOwnedToLibrary(set);}
  function getRoomCharacters(){syncOwnedToLibrary();const owned=loadOwned();return lib.filter(c=>!String(c?.id||'').startsWith('monthly-')||owned.has(c.id));}
  syncOwnedToLibrary();
  window.GACHA_N_POOL=nPool;window.GACHA_UR_POOL=monthly;window.GACHA_OWNED_KEY=OWNED_KEY;window.loadGachaOwned=loadOwned;window.saveGachaOwned=saveOwned;window.syncGachaOwnedToLibrary=syncOwnedToLibrary;window.getRoomCharacters=getRoomCharacters;
})();
