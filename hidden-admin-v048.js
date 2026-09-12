// Ver.0.4.8 hidden owner room. No visible entry point is added to the home screen.
(function(){
  const RATE_KEY='rhythmGame.adminGachaUrRate.v1';
  const SAVE_KEY='rhythmGame.adminGachaSaveOwned.v1';
  const NORMAL_RATE=.01;

  function readRate(){
    const value=Number(localStorage.getItem(RATE_KEY));
    return [0.01,0.1,1].includes(value)?value:NORMAL_RATE;
  }
  function readSaveOwned(){
    const raw=localStorage.getItem(SAVE_KEY);
    return raw===null?false:raw==='true';
  }
  function settings(){
    const urRate=readRate();
    return {
      urRate,
      testMode:urRate!==NORMAL_RATE,
      saveOwned:urRate===NORMAL_RATE?true:readSaveOwned()
    };
  }
  window.getAdminGachaSettings=settings;

  function emitChange(){
    window.dispatchEvent(new CustomEvent('rhythmGameAdminSettingsChanged',{detail:settings()}));
  }

  function ensureRoom(){
    let overlay=document.getElementById('hiddenAdminRoom');
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.id='hiddenAdminRoom';
    overlay.className='hidden-admin-overlay';
    overlay.hidden=true;
    overlay.innerHTML=`
      <section class="hidden-admin-room" role="dialog" aria-modal="true" aria-labelledby="hiddenAdminTitle">
        <div class="hidden-admin-head">
          <div>
            <div class="hidden-admin-kicker">OWNER DEBUG ROOM</div>
            <h2 id="hiddenAdminTitle">管理人の隠し部屋</h2>
          </div>
          <button class="hidden-admin-close" type="button" aria-label="閉じる">×</button>
        </div>
        <div class="hidden-admin-body">
          <div class="hidden-admin-card">
            <div class="hidden-admin-row">
              <div><strong>ガチャ UR排出率</strong><small>演出確認用。通常プレイは1%です。</small></div>
              <select id="hiddenAdminUrRate">
                <option value="0.01">通常 1%</option>
                <option value="0.1">テスト 10%</option>
                <option value="1">テスト 100%</option>
              </select>
            </div>
          </div>
          <label class="hidden-admin-card hidden-admin-check">
            <input id="hiddenAdminSaveOwned" type="checkbox">
            <span><strong>テスト獲得を部室へ登録する</strong><small>OFFなら100%で何度回しても普段のUR獲得状況を汚しません。</small></span>
          </label>
          <div id="hiddenAdminStatus" class="hidden-admin-status"></div>
          <div class="hidden-admin-actions">
            <button id="hiddenAdminNormal" type="button">通常状態へ戻す</button>
            <button id="hiddenAdminDone" type="button">保存して閉じる</button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    const rate=overlay.querySelector('#hiddenAdminUrRate');
    const save=overlay.querySelector('#hiddenAdminSaveOwned');
    const status=overlay.querySelector('#hiddenAdminStatus');

    function sync(){
      const current=settings();
      rate.value=String(current.urRate);
      save.checked=readSaveOwned();
      save.disabled=!current.testMode;
      status.textContent=current.testMode?`テストモード：UR ${Math.round(current.urRate*100)}%`:'通常モード：UR 1%';
      overlay.classList.toggle('is-test',current.testMode);
    }
    function persist(){
      localStorage.setItem(RATE_KEY,rate.value);
      localStorage.setItem(SAVE_KEY,String(save.checked));
      sync();
      emitChange();
    }
    function close(){
      overlay.hidden=true;
      document.body.classList.remove('hidden-admin-open');
    }
    function open(){
      sync();
      overlay.hidden=false;
      document.body.classList.add('hidden-admin-open');
    }

    rate.addEventListener('change',()=>{
      localStorage.setItem(RATE_KEY,rate.value);
      sync();
      emitChange();
    });
    save.addEventListener('change',()=>{
      localStorage.setItem(SAVE_KEY,String(save.checked));
      emitChange();
    });
    overlay.querySelector('#hiddenAdminNormal')?.addEventListener('click',()=>{
      localStorage.setItem(RATE_KEY,'0.01');
      localStorage.setItem(SAVE_KEY,'false');
      sync();
      emitChange();
    });
    overlay.querySelector('#hiddenAdminDone')?.addEventListener('click',()=>{persist();close();});
    overlay.querySelector('.hidden-admin-close')?.addEventListener('click',close);
    overlay.addEventListener('click',e=>{if(e.target===overlay) close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden) close();});
    overlay.openHiddenAdminRoom=open;
    return overlay;
  }

  function openRoom(){
    const room=ensureRoom();
    room.openHiddenAdminRoom?.();
    if(navigator.vibrate) navigator.vibrate([30,40,30]);
  }

  function installSecretCommand(){
    const version=document.querySelector('.home-version');
    const title=document.querySelector('.home-title');
    if(!version||!title) return;

    let taps=[];
    let armedUntil=0;
    let holdTimer=0;

    version.addEventListener('click',()=>{
      const now=Date.now();
      taps=taps.filter(t=>now-t<4000);
      taps.push(now);
      if(taps.length>=6){
        armedUntil=now+8000;
        taps=[];
        if(navigator.vibrate) navigator.vibrate(24);
      }
    });

    const startHold=e=>{
      if(Date.now()>armedUntil) return;
      e.preventDefault();
      clearTimeout(holdTimer);
      holdTimer=setTimeout(()=>{
        if(Date.now()<=armedUntil){
          armedUntil=0;
          openRoom();
        }
      },1400);
    };
    const cancelHold=()=>{clearTimeout(holdTimer);holdTimer=0;};
    title.addEventListener('pointerdown',startHold);
    title.addEventListener('pointerup',cancelHold);
    title.addEventListener('pointercancel',cancelHold);
    title.addEventListener('pointerleave',cancelHold);
    title.addEventListener('contextmenu',e=>{if(Date.now()<=armedUntil)e.preventDefault();});
  }

  ensureRoom();
  installSecretCommand();
})();
