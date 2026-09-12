// Ver.0.5.1: remove stale gacha placeholder handlers and fix Setsuna/Emma Monthly Song artwork mapping.
(function(){
  function cleanGachaButton(){
    const current=document.getElementById('homeGachaBtn');
    if(!current||current.dataset.gachaClean051==='1') return;
    const clean=current.cloneNode(true);
    clean.dataset.gachaClean051='1';
    clean.onclick=null;
    current.replaceWith(clean);
    clean.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      if(typeof window.openGachaScreen==='function') window.openGachaScreen();
    });
  }

  function fixMonthlySong(){
    const version=window.APP_VERSION||'0.5.1';
    const fixes={
      setsuna:{name:'優木せつ菜【マンスリーソング】',icon:`assets/monthly-song/emma.webp?v=${version}`},
      emma:{name:'エマ・ヴェルデ【マンスリーソング】',icon:`assets/monthly-song/setsuna.webp?v=${version}`}
    };
    (window.GACHA_UR_POOL||[]).forEach(unit=>{
      const f=fixes[unit?.baseId];
      if(!f) return;
      unit.name=f.name;unit.icon=f.icon;unit.home=f.icon;
      const libUnit=(window.CHARACTER_LIBRARY||[]).find(c=>c?.id===unit.id);
      if(libUnit){libUnit.name=f.name;libUnit.icon=f.icon;libUnit.home=f.icon;}
    });
  }

  fixMonthlySong();
  cleanGachaButton();
  const observer=new MutationObserver(()=>cleanGachaButton());
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{fixMonthlySong();cleanGachaButton();},0);
})();