// Ver.0.4.6: correct Monthly Song image/name associations.
(function(){
  const version=window.APP_VERSION||'0.4.6';
  const assetMap={
    mia:'lanzhu',
    rina:'shioriko',
    setsuna:'setsuna',
    emma:'emma',
    shioriko:'rina',
    lanzhu:'mia',
    ai:'kanata',
    shizuku:'karin',
    ayumu:'kasumi',
    kasumi:'ayumu',
    karin:'shizuku',
    kanata:'ai'
  };
  const jpNames={
    ayumu:'上原歩夢',kasumi:'中須かすみ',shizuku:'桜坂しずく',karin:'朝香果林',ai:'宮下愛',kanata:'近江彼方',
    setsuna:'優木せつ菜',emma:'エマ・ヴェルデ',rina:'天王寺璃奈',shioriko:'三船栞子',mia:'ミア・テイラー',lanzhu:'鐘嵐珠'
  };
  const pool=window.GACHA_UR_POOL||[];
  pool.forEach(unit=>{
    const key=unit.baseId;
    if(!assetMap[key]) return;
    const icon=`assets/monthly-song/${assetMap[key]}.webp?v=${version}`;
    unit.name=`${jpNames[key]}【マンスリーソング】`;
    unit.icon=icon;
    unit.home=icon;
    const libUnit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===unit.id);
    if(libUnit){
      libUnit.name=unit.name;
      libUnit.icon=icon;
      libUnit.home=icon;
    }
  });
})();
