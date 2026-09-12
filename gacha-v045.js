// Ver.0.4.5 ten-pull scouting with original envelope reveal and room unlocks.
(function(){
  const N_RATE=.99;
  const UR_RATE=.01;
  const PULL_COUNT=10;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function rand(){
    if(window.crypto?.getRandomValues){
      const a=new Uint32Array(1);
      window.crypto.getRandomValues(a);
      return a[0]/4294967296;
    }
    return Math.random();
  }
  function choice(pool){
    return pool[Math.floor(rand()*pool.length)];
  }
  function pullOne(){
    const isUR=rand()<UR_RATE;
    const pool=isUR?window.GACHA_UR_POOL:window.GACHA_N_POOL;
    return {unit:choice(pool),rarity:isUR?'UR':'N'};
  }

  function ensureScreen(){
    let screen=document.getElementById('gachaScreen');
    if(screen) return screen;
    const shell=document.querySelector('.app-shell')||document.body;
    screen=document.createElement('section');
    screen.id='gachaScreen';
    screen.className='app-screen gacha-screen';
    screen.hidden=true;
    screen.innerHTML=`
      <div class="gacha-topbar">
        <button id="gachaHomeBtn" class="gacha-home-btn" type="button">ホーム</button>
        <div class="gacha-heading">
          <div class="gacha-heading-kicker">SCOUTING</div>
          <h1>勧誘</h1>
        </div>
        <div class="gacha-rate-mini"><b>UR</b> 1%</div>
      </div>
      <div class="gacha-stage">
        <div class="gacha-copy">
          <strong>10連勧誘</strong>
          <span>N【音符ロリータ】99% ／ UR【マンスリーソング】1%</span>
        </div>
        <div id="gachaOmen" class="gacha-omen" aria-live="polite"></div>
        <div id="gachaEnvelopeGrid" class="gacha-envelope-grid" aria-live="polite"></div>
        <div class="gacha-actions">
          <button id="gachaPullBtn" class="gacha-pull-btn" type="button">10連する</button>
          <span class="gacha-note">同じメンバーが重複して出ることがあります。URは初獲得時に部室へ追加されます。</span>
        </div>
      </div>`;
    shell.appendChild(screen);

    screen.querySelector('#gachaHomeBtn')?.addEventListener('click',()=>{
      if(screen.classList.contains('is-pulling')) return;
      screen.hidden=true;
      if(typeof window.showAppScreen==='function') window.showAppScreen('home');
      else document.getElementById('homeScreen')?.removeAttribute('hidden');
    });
    screen.querySelector('#gachaPullBtn')?.addEventListener('click',runTenPull);
    return screen;
  }

  function hideOtherScreens(){
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=true;});
    document.getElementById('timingCalibration')?.setAttribute('hidden','');
  }

  function makeEnvelope(result,index){
    const item=document.createElement('div');
    item.className='gacha-envelope-slot';
    item.dataset.index=String(index);
    item.innerHTML=`
      <div class="gacha-envelope-shell" aria-hidden="true">
        <div class="gacha-envelope-paper"></div>
        <div class="gacha-envelope-flap"></div>
        <div class="gacha-envelope-seal">☆</div>
        <div class="gacha-envelope-sparkles"></div>
      </div>
      <article class="gacha-pull-card ${result.rarity==='UR'?'rarity-ur':'rarity-n'}">
        <div class="gacha-rarity">${result.rarity}</div>
        <img src="${result.unit.icon}" alt="${result.unit.name}">
        <div class="gacha-card-series">${result.unit.series}</div>
        <div class="gacha-card-name">${String(result.unit.name).replace(/【[^】]+】$/u,'')}</div>
        ${result.isNew?'<span class="gacha-new">NEW</span>':''}
      </article>`;
    return item;
  }

  async function revealSlot(slot,result){
    if(result.rarity==='UR'){
      slot.classList.add('is-ur-pre');
      await sleep(720);
      slot.classList.add('is-ur-burst');
      await sleep(360);
    }else{
      slot.classList.add('is-ready');
      await sleep(100);
    }
    slot.classList.add('is-open');
    await sleep(result.rarity==='UR'?520:270);
    slot.classList.remove('is-ur-pre','is-ur-burst','is-ready');
  }

  async function runTenPull(){
    const screen=ensureScreen();
    if(screen.classList.contains('is-pulling')) return;
    const nPool=window.GACHA_N_POOL||[];
    const urPool=window.GACHA_UR_POOL||[];
    if(!nPool.length||!urPool.length){
      alert('勧誘データを読み込めませんでした。');
      return;
    }

    const button=screen.querySelector('#gachaPullBtn');
    const grid=screen.querySelector('#gachaEnvelopeGrid');
    const omen=screen.querySelector('#gachaOmen');
    screen.classList.add('is-pulling');
    button.disabled=true;
    button.textContent='勧誘中…';
    grid.innerHTML='';
    omen.textContent='';
    screen.classList.remove('has-ur-omen');

    const owned=typeof window.loadGachaOwned==='function'?window.loadGachaOwned():new Set();
    const results=[];
    for(let i=0;i<PULL_COUNT;i++){
      const result=pullOne();
      result.isNew=result.rarity==='UR'&&!owned.has(result.unit.id);
      if(result.rarity==='UR') owned.add(result.unit.id);
      results.push(result);
    }
    if(typeof window.saveGachaOwned==='function') window.saveGachaOwned(owned);

    results.forEach((result,index)=>grid.appendChild(makeEnvelope(result,index)));
    const slots=[...grid.querySelectorAll('.gacha-envelope-slot')];
    const containsUR=results.some(r=>r.rarity==='UR');

    if(containsUR){
      omen.textContent='……虹色のきらめき！';
      screen.classList.add('has-ur-omen');
      await sleep(1050);
      omen.textContent='特別な気配がします…';
      await sleep(650);
      screen.classList.remove('has-ur-omen');
    }else{
      omen.textContent='封筒を開封します';
      await sleep(360);
    }

    for(let i=0;i<slots.length;i++){
      omen.textContent=`${i+1} / ${PULL_COUNT}`;
      await revealSlot(slots[i],results[i]);
    }

    const newCount=results.filter(r=>r.isNew).length;
    const urCount=results.filter(r=>r.rarity==='UR').length;
    omen.textContent=urCount?`UR ${urCount}枚${newCount?` ／ 新規 ${newCount}人`:''}`:'勧誘結果';
    button.disabled=false;
    button.textContent='もう一度10連する';
    screen.classList.remove('is-pulling');
  }

  window.openGachaScreen=function(){
    const screen=ensureScreen();
    hideOtherScreens();
    screen.hidden=false;
    screen.querySelector('#gachaPullBtn')?.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'auto'});
  };

  // 部室は初期N＋獲得済みURだけを表示する。
  function installOwnedRoomFilter(){
    if(typeof window.getRoomCharacters!=='function') return;
    const replacement=function(){
      const grid=document.getElementById('characterGrid');
      const available=window.getRoomCharacters();
      if(!grid||!Array.isArray(available)||!available.length) return;
      const saved=typeof getSavedLaneCharacters==='function'?getSavedLaneCharacters():Array.from({length:9},()=> 'default');
      const availableIds=new Set(available.map(c=>c.id));
      const current=saved.map(id=>availableIds.has(id)?id:'default');
      grid.innerHTML='';
      current.forEach((id,i)=>{
        const c=available.find(item=>item.id===id)||available.find(item=>item.id==='default')||available[0];
        const card=document.createElement('div');
        card.className='lane-character-card';
        const title=document.createElement('div');
        title.className='lane-character-title';
        title.textContent=`レーン ${i+1}`;
        const img=document.createElement('img');
        img.className='lane-character-preview';
        img.alt=`レーン ${i+1} キャラ`;
        img.src=c?.icon||'icon-192.png';
        img.onerror=()=>{img.src='icon-192.png';};
        const select=document.createElement('select');
        select.className='lane-character-select';
        select.dataset.lane=String(i);
        available.forEach(item=>{
          const option=document.createElement('option');
          option.value=item.id;
          option.textContent=item.name;
          option.selected=item.id===id;
          select.appendChild(option);
        });
        select.addEventListener('change',()=>{
          const selected=available.find(item=>item.id===select.value);
          img.src=selected?.icon||'icon-192.png';
        });
        card.append(title,img,select);
        grid.appendChild(card);
      });
      const status=document.getElementById('characterSaveStatus');
      if(status){
        const urOwned=available.filter(c=>c.rarity==='UR').length;
        status.textContent=`音符ロリータは初期加入。マンスリーソングURは勧誘で獲得すると追加されます。（UR獲得 ${urOwned}/12）`;
      }
    };
    window.renderCharacterSelectors=replacement;
    try{renderCharacterSelectors=replacement;}catch(_){}
  }

  ensureScreen();
  installOwnedRoomFilter();
})();
