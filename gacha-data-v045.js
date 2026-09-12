// Ver.0.4.5 gacha rarity, Monthly Song URs and room ownership.
(function(){
  const lib=window.CHARACTER_LIBRARY;
  if(!Array.isArray(lib)) return;

  const nPool=lib.filter(c=>c && c.id!=='default' && /【音符ロリータ】$/u.test(String(c.name||'')));
  nPool.forEach(c=>{
    c.rarity='N';
    c.series='音符ロリータ';
  });

  const version=window.APP_VERSION||'0.4.5';
  const monthly=[
    ['ayumu','上原歩夢'],
    ['kasumi','中須かすみ'],
    ['shizuku','桜坂しずく'],
    ['karin','朝香果林'],
    ['ai','宮下愛'],
    ['kanata','近江彼方'],
    ['setsuna','優木せつ菜'],
    ['emma','エマ・ヴェルデ'],
    ['rina','天王寺璃奈'],
    ['shioriko','三船栞子'],
    ['mia','ミア・テイラー'],
    ['lanzhu','鐘嵐珠']
  ].map(([baseId,jp])=>{
    const icon=`assets/monthly-song/${baseId}.webp?v=${version}`;
    return {
      id:`monthly-${baseId}`,
      baseId,
      name:`${jp}【マンスリーソング】`,
      rarity:'UR',
      series:'マンスリーソング',
      icon,
      home:icon
    };
  });

  const ids=new Set(lib.map(c=>c?.id));
  monthly.forEach(c=>{
    if(!ids.has(c.id)){
      lib.push(c);
      ids.add(c.id);
    }
  });

  const OWNED_KEY='rhythmGame.unlockedCharacters.v1';
  function loadOwned(){
    try{
      const parsed=JSON.parse(localStorage.getItem(OWNED_KEY)||'[]');
      return new Set(Array.isArray(parsed)?parsed.filter(id=>monthly.some(c=>c.id===id)):[]);
    }catch(_){
      return new Set();
    }
  }
  function saveOwned(set){
    localStorage.setItem(OWNED_KEY,JSON.stringify([...set]));
  }
  function getRoomCharacters(){
    const owned=loadOwned();
    return lib.filter(c=>!String(c?.id||'').startsWith('monthly-') || owned.has(c.id));
  }

  window.GACHA_N_POOL=nPool;
  window.GACHA_UR_POOL=monthly;
  window.GACHA_OWNED_KEY=OWNED_KEY;
  window.loadGachaOwned=loadOwned;
  window.saveGachaOwned=saveOwned;
  window.getRoomCharacters=getRoomCharacters;
})();
