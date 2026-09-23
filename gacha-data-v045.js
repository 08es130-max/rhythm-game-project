// Ver.0.8.119: N / UR / LR pools and owned unlocks.
(function(){
  const lib=window.CHARACTER_LIBRARY;
  if(!Array.isArray(lib)) return;

  const nPool=lib.filter(c=>c&&c.id!=='default'&&/【音符ロリータ】$/u.test(String(c.name||'')));
  nPool.forEach(c=>{c.rarity='N';c.series='音符ロリータ';});

  const version=window.APP_VERSION||'0.8.119';
  const assetMap={mia:'lanzhu',rina:'shioriko',setsuna:'setsuna',emma:'emma',shioriko:'rina',lanzhu:'mia',ai:'kanata',shizuku:'karin',ayumu:'kasumi',kasumi:'ayumu',karin:'shizuku',kanata:'ai'};
  const monthly=[['ayumu','上原歩夢'],['kasumi','中須かすみ'],['shizuku','桜坂しずく'],['karin','朝香果林'],['ai','宮下愛'],['kanata','近江彼方'],['setsuna','優木せつ菜'],['emma','エマ・ヴェルデ'],['rina','天王寺璃奈'],['shioriko','三船栞子'],['mia','ミア・テイラー'],['lanzhu','鐘嵐珠']].map(([baseId,jp])=>{
    const icon=`assets/monthly-song/${assetMap[baseId]||baseId}.webp?v=${version}`;
    return{id:`monthly-${baseId}`,baseId,name:`${jp}【マンスリーソング】`,rarity:'UR',series:'マンスリーソング',icon,home:icon};
  });

  const lrShioriko={
    id:'lr-shioriko-eternal-rose',baseId:'shioriko',name:'三船栞子【蒼海に舞う翠玉姫】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/shioriko-lr-live-icon.webp?v=${version}`,
    card:window.LR_ASSET_CARD||`assets/lr/shioriko-lr-card.webp?v=${version}`,
    home:`assets/lr/shioriko-lr-home.webp?v=${version}`
  };
  const lrAyumu={
    id:'lr-ayumu-flower-garden',baseId:'ayumu',name:'上原歩夢【花園に結ぶ約束】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-ayumu-live.webp?v=${version}`,
    card:`assets/lr/lr-ayumu-card.webp?v=${version}`,
    home:`assets/lr/lr-ayumu-home.webp?v=${version}`
  };
  const lrKasumi={
    id:'lr-kasumi-flower-garden',baseId:'kasumi',name:'中須かすみ【陽だまりに咲く花】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-kasumi-live.webp?v=${version}`,
    card:`assets/lr/lr-kasumi-card.webp?v=${version}`,
    home:`assets/lr/lr-kasumi-home.webp?v=${version}`
  };
  const lrShizuku={
    id:'lr-shizuku-blue-garden',baseId:'shizuku',name:'桜坂しずく【蒼花に紡ぐ舞台】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-shizuku-live.webp?v=${version}`,
    card:`assets/lr/lr-shizuku-card.webp?v=${version}`,
    home:`assets/lr/lr-shizuku-home.webp?v=${version}`
  };
  const lrKarin={
    id:'lr-karin-blue-garden',baseId:'karin',name:'朝香果林【蒼薔薇のエスコート】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-karin-live.webp?v=${version}`,
    card:`assets/lr/lr-karin-card.webp?v=${version}`,
    home:`assets/lr/lr-karin-home.webp?v=${version}`
  };
  const lrKanata={
    id:'lr-kanata-lavender-garden',baseId:'kanata',name:'近江彼方【夢見草のまどろみ】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-kanata-live.webp?v=${version}`,
    card:`assets/lr/lr-kanata-card.webp?v=${version}`,
    home:`assets/lr/lr-kanata-home.webp?v=${version}`
  };
  const lrSetsuna={
    id:'lr-setsuna-rose-garden',baseId:'setsuna',name:'優木せつ菜【紅薔薇に燃ゆる情熱】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-setsuna-live.webp?v=${version}`,
    card:`assets/lr/lr-setsuna-card.webp?v=${version}`,
    home:`assets/lr/lr-setsuna-home.webp?v=${version}`
  };
  const lrAi={
    id:'lr-ai-sunflower-garden',baseId:'ai',name:'宮下愛【陽花に弾けるスマイル】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-ai-live.webp?v=${version}`,
    card:`assets/lr/lr-ai-card.webp?v=${version}`,
    home:`assets/lr/lr-ai-home.webp?v=${version}`
  };
  const lrEmma={
    id:'lr-emma-flower-garden',baseId:'emma',name:'エマ・ヴェルデ【花園に祈る陽だまり】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-emma-live.webp?v=${version}`,
    card:`assets/lr/lr-emma-card.webp?v=${version}`,
    home:`assets/lr/lr-emma-home.webp?v=${version}`
  };
  const lrMia={
    id:'lr-mia-silver-garden',baseId:'mia',name:'ミア・テイラー【白銀に響く旋律】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-mia-live.webp?v=${version}`,
    card:`assets/lr/lr-mia-card.webp?v=${version}`,
    home:`assets/lr/lr-mia-home.webp?v=${version}`
  };
  const lrRina={
    id:'lr-rina-pink-garden',baseId:'rina',name:'天王寺璃奈【桃花にほどける素顔】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-rina-live.webp?v=${version}`,
    card:`assets/lr/lr-rina-card.webp?v=${version}`,
    home:`assets/lr/lr-rina-home.webp?v=${version}`
  };
  const lrLanzhu={
    id:'lr-lanzhu-rose-palace',baseId:'lanzhu',name:'鐘嵐珠【薔薇宮に咲く女王】',
    rarity:'LR',series:'LEGEND RARE',
    icon:`assets/lr/lr-lanzhu-live.webp?v=${version}`,
    card:`assets/lr/lr-lanzhu-card.webp?v=${version}`,
    home:`assets/lr/lr-lanzhu-home.webp?v=${version}`
  };
  const lrPool=[lrAyumu,lrKasumi,lrShizuku,lrKarin,lrAi,lrKanata,lrSetsuna,lrEmma,lrRina,lrShioriko,lrMia,lrLanzhu];
  const unlockable=[...monthly,...lrPool];

  const OWNED_KEY='rhythmGame.unlockedCharacters.v1';
  function loadOwned(){
    try{
      const parsed=JSON.parse(localStorage.getItem(OWNED_KEY)||'[]');
      return new Set(Array.isArray(parsed)?parsed.filter(id=>unlockable.some(c=>c.id===id)):[]);
    }catch(_){return new Set();}
  }
  function syncOwnedToLibrary(set=loadOwned()){
    const ids=new Set(lib.map(c=>c?.id));
    unlockable.forEach(c=>{if(set.has(c.id)&&!ids.has(c.id)){lib.push(c);ids.add(c.id);}});
  }
  function saveOwned(set){
    localStorage.setItem(OWNED_KEY,JSON.stringify([...set]));
    syncOwnedToLibrary(set);
    window.dispatchEvent(new CustomEvent('rhythmGameGachaOwnedChanged',{detail:{owned:[...set]}}));
  }
  const NIJIGASAKI_ORDER=['ayumu','kasumi','shizuku','karin','ai','kanata','setsuna','emma','rina','shioriko','mia','lanzhu'];
  const nijigasakiOrderOf=(c)=>{
    const baseId=String(c?.baseId||c?.id||'').replace(/^monthly-/,'').replace(/^lr-/,'').split('-')[0];
    const i=NIJIGASAKI_ORDER.indexOf(baseId);
    return i<0?999:i;
  };
  function getRoomCharacters(){
    syncOwnedToLibrary();
    const owned=loadOwned();
    return lib.filter(c=>{
      const id=String(c?.id||'');
      if(id.startsWith('monthly-')||id.startsWith('lr-')) return owned.has(id);
      return true;
    }).map((c,i)=>({c,i})).sort((a,b)=>nijigasakiOrderOf(a.c)-nijigasakiOrderOf(b.c)||a.i-b.i).map(x=>x.c);
  }

  syncOwnedToLibrary();
  window.GACHA_N_POOL=nPool;
  window.GACHA_UR_POOL=monthly;
  window.GACHA_LR_POOL=lrPool;
  window.GACHA_LR_SHIORIKO_ID=lrShioriko.id;
  window.GACHA_LR_AYUMU_ID=lrAyumu.id;
  window.GACHA_LR_KASUMI_ID=lrKasumi.id;
  window.GACHA_LR_SHIZUKU_ID=lrShizuku.id;
  window.GACHA_LR_KARIN_ID=lrKarin.id;
  window.GACHA_LR_KANATA_ID=lrKanata.id;
  window.GACHA_LR_SETSUNA_ID=lrSetsuna.id;
  window.GACHA_LR_AI_ID=lrAi.id;
  window.GACHA_LR_EMMA_ID=lrEmma.id;
  window.GACHA_LR_MIA_ID=lrMia.id;
  window.GACHA_LR_RINA_ID=lrRina.id;
  window.GACHA_LR_LANZHU_ID=lrLanzhu.id;
  window.GACHA_OWNED_KEY=OWNED_KEY;
  window.loadGachaOwned=loadOwned;
  window.saveGachaOwned=saveOwned;
  window.syncGachaOwnedToLibrary=syncOwnedToLibrary;
  window.getRoomCharacters=getRoomCharacters;
})();