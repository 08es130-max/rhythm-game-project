// Ver.0.8.53: Lounge UI with production 3D foundation.
(function(){
  'use strict';

  const LOUNGE_ICON='data:image/webp;base64,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';

  function ensureStyle(){
    if(document.getElementById('interactionRoomV0844Style')) return;
    const style=document.createElement('style');
    style.id='interactionRoomV0844Style';
    style.textContent=`
      .home-menu-interaction{grid-column:3!important;grid-row:2!important;position:relative!important;overflow:hidden!important;padding-left:92px!important;text-align:left!important;min-height:82px!important}
      .home-menu-interaction .lounge-home-icon{position:absolute;left:8px;top:50%;width:76px;height:76px;transform:translateY(-50%);object-fit:contain;filter:drop-shadow(0 5px 10px rgba(0,0,0,.28));pointer-events:none}
      .home-menu-interaction .lounge-home-label{display:block;position:relative;z-index:1}
      .home-menu-interaction .lounge-home-label>strong{display:block;font-size:1.08em;line-height:1.05}
      .home-menu-interaction .lounge-home-label>span{display:block;margin-top:5px}
      @media (max-width:720px){.home-menu-interaction{padding-left:78px!important}.home-menu-interaction .lounge-home-icon{width:64px;height:64px;left:7px}}
      .interaction-room-screen{
        --ir-safe-left:max(16px,env(safe-area-inset-left));
        --ir-safe-right:max(16px,env(safe-area-inset-right));
        --ir-safe-top:max(10px,env(safe-area-inset-top));
        --ir-safe-bottom:max(10px,env(safe-area-inset-bottom));
        min-height:100%;box-sizing:border-box;padding:var(--ir-safe-top) var(--ir-safe-right) var(--ir-safe-bottom) var(--ir-safe-left);
        background:radial-gradient(circle at 50% 24%,rgba(94,234,212,.10),transparent 28%),linear-gradient(180deg,#101725,#0a0f18 70%);
        color:#fff;
      }
      .interaction-room-header{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;margin-bottom:10px}
      .interaction-room-header h1{margin:0;text-align:center;font-size:clamp(20px,3vw,30px)}
      .interaction-room-status{font-size:11px;color:#a7f3d0;border:1px solid rgba(167,243,208,.28);background:rgba(6,78,59,.28);border-radius:999px;padding:6px 10px;white-space:nowrap}
      .interaction-room-main{display:grid;grid-template-columns:minmax(0,1fr) minmax(210px,29%);gap:12px;min-height:0}
      .interaction-stage{position:relative;min-height:430px;border:1px solid rgba(255,255,255,.12);border-radius:20px;overflow:hidden;background:linear-gradient(180deg,rgba(15,23,42,.42),rgba(2,6,23,.88))}
      .interaction-stage::before{content:'';position:absolute;inset:auto 12% 3% 12%;height:18%;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.16),rgba(255,255,255,0) 68%);pointer-events:none}
      .interaction-model-slot{position:absolute;inset:0;display:grid;place-items:center;touch-action:none;user-select:none;-webkit-user-select:none}
      .interaction-model-placeholder{width:min(46%,260px);aspect-ratio:3/5;border:1px dashed rgba(255,255,255,.28);border-radius:999px 999px 30% 30%;display:grid;place-items:center;text-align:center;padding:24px;box-sizing:border-box;color:#cbd5e1;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.015));transition:transform .22s ease}
      .interaction-model-placeholder strong{display:block;color:#fff;margin-bottom:8px;font-size:18px}.interaction-model-placeholder small{line-height:1.55}
      .interaction-touch-hint{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);font-size:11px;color:#cbd5e1;background:rgba(2,6,23,.64);padding:7px 11px;border-radius:999px;pointer-events:none}
      .interaction-side{display:flex;flex-direction:column;gap:10px;min-width:0}
      .interaction-card{border:1px solid rgba(255,255,255,.11);background:rgba(15,23,42,.72);border-radius:16px;padding:12px}
      .interaction-card h2{margin:0 0 8px;font-size:14px}.interaction-card p{margin:0;color:#cbd5e1;font-size:11px;line-height:1.55}
      .interaction-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
      .interaction-tabs button,.interaction-actions button{border:1px solid rgba(255,255,255,.13);background:rgba(30,41,59,.9);color:#fff;border-radius:12px;min-height:42px;padding:8px;font-weight:700}
      .interaction-tabs button.is-active{background:linear-gradient(120deg,rgba(13,148,136,.85),rgba(37,99,235,.82))}
      .interaction-actions{display:grid;grid-template-columns:1fr;gap:7px;margin-top:9px}
      .interaction-actions button[disabled]{opacity:.45}
      .interaction-message{min-height:54px;display:flex;align-items:center;font-size:12px;line-height:1.55;color:#e2e8f0}
      .interaction-coming{font-size:10px;color:#94a3b8;margin-top:7px}
      @media (orientation:landscape) and (pointer:coarse){
        .interaction-room-screen{--ir-safe-left:max(30px,env(safe-area-inset-left));--ir-safe-right:max(30px,env(safe-area-inset-right));--ir-safe-top:max(8px,env(safe-area-inset-top));--ir-safe-bottom:max(8px,env(safe-area-inset-bottom))}
        .interaction-stage{min-height:calc(100vh - 86px)}
      }
      @media (max-width:720px) and (orientation:portrait){
        .interaction-room-main{grid-template-columns:1fr}.interaction-stage{min-height:55vh}.interaction-side{display:grid;grid-template-columns:1fr 1fr}.interaction-side .interaction-card:first-child{grid-column:1/-1}
      }
    `;
    document.head.appendChild(style);
  }

  function showOnly(id){
    document.querySelectorAll('.app-screen').forEach(el=>{el.hidden=el.id!==id;});
  }

  function ensureHomeButton(){
    const menu=document.querySelector('#homeScreen .home-menu');
    if(!menu || document.getElementById('homeInteractionBtn')) return;
    const btn=document.createElement('button');
    btn.id='homeInteractionBtn';
    btn.className='home-menu-btn home-menu-interaction';
    btn.type='button';
    btn.innerHTML='<img class="lounge-home-icon" alt="" aria-hidden="true"><span class="lounge-home-label"><strong>ラウンジ</strong><span>栞子と過ごす3D空間</span></span>';
    const icon=btn.querySelector('.lounge-home-icon');if(icon) icon.src=LOUNGE_ICON;
    btn.addEventListener('click',()=>{
      ensureRoom();
      showOnly('interactionRoomScreen');
      window.scrollTo({top:0,behavior:'auto'});
    });
    menu.appendChild(btn);
  }

  function ensureRoom(){
    let room=document.getElementById('interactionRoomScreen');
    if(room) return room;
    room=document.createElement('section');
    room.id='interactionRoomScreen';
    room.className='app-screen interaction-room-screen';
    room.hidden=true;
    room.innerHTML=`
      <div class="interaction-room-header">
        <button id="interactionHomeBtn" class="home-back-btn" type="button">ホーム</button>
        <h1>ラウンジ</h1>
        <span class="interaction-room-status">3D ROOM β</span>
      </div>
      <div class="interaction-room-main">
        <div class="interaction-stage" id="interactionStage">
          <div class="interaction-model-slot" id="interactionModelSlot" aria-label="3Dキャラクター表示エリア">
            <div class="interaction-model-placeholder" id="interactionPlaceholder">
              <div><strong>SHIORIKO 3D</strong><small>3Dモデル本体をここへ読み込みます。<br>回転・タッチ・表情・衣装・ダンスに対応できる構造です。</small></div>
            </div>
          </div>
          <div class="interaction-touch-hint">ドラッグで回転／タップでリアクション予定</div>
        </div>
        <aside class="interaction-side">
          <div class="interaction-card">
            <div class="interaction-tabs" role="tablist">
              <button type="button" class="is-active" data-ir-tab="touch">交流</button>
              <button type="button" data-ir-tab="costume">衣装</button>
              <button type="button" data-ir-tab="motion">モーション</button>
            </div>
            <div class="interaction-message" id="interactionMessage">まずは栞子の3Dモデルを配置します。モデル完成後、タップした場所に応じて反応を変えられます。</div>
          </div>
          <div class="interaction-card">
            <h2>アクション</h2>
            <div class="interaction-actions" id="interactionActions">
              <button type="button" data-action="look">こちらを見る</button>
              <button type="button" data-action="wave">手を振る</button>
              <button type="button" data-action="dance" disabled>ダンス（モデル導入後）</button>
            </div>
            <div class="interaction-coming">衣装とダンスはGLB/VRMモデル＋アニメーションを追加して順次解放します。</div>
          </div>
          <div class="interaction-card">
            <h2>モデル</h2>
            <p>予定形式：GLB。スマホ向けに軽量化し、表情・ボーン・衣装差し替えを後から増やせる設計にします。</p>
          </div>
        </aside>
      </div>`;
    document.querySelector('.app-shell')?.appendChild(room);

    room.querySelector('#interactionHomeBtn')?.addEventListener('click',()=>showOnly('homeScreen'));
    const placeholder=room.querySelector('#interactionPlaceholder');
    const message=room.querySelector('#interactionMessage');
    let angle=0;
    room.querySelector('#interactionModelSlot')?.addEventListener('pointerdown',()=>{
      if(room.querySelector('#interaction3dCanvas')) return;
      angle=(angle+12)%360;
      if(placeholder) placeholder.style.transform=`rotateY(${angle}deg) scale(1.015)`;
      if(message) message.textContent='タッチ反応の受け口は動作しています。3Dモデル導入後は、顔・頭・手などタップ位置別にリアクションを分けます。';
      setTimeout(()=>{if(placeholder)placeholder.style.transform=`rotateY(${angle}deg)`;},180);
    });
    room.querySelectorAll('[data-ir-tab]').forEach(btn=>btn.addEventListener('click',()=>{
      room.querySelectorAll('[data-ir-tab]').forEach(x=>x.classList.toggle('is-active',x===btn));
      const tab=btn.dataset.irTab;
      if(message) message.textContent=tab==='touch'?'栞子との交流・回転・表情リアクションをここで操作します。':tab==='costume'?'制服・ライブ衣装・私服などをここから切り替えられるようにします。':'待機・手振り・ポーズ・ダンスなどのモーションをここから選べるようにします。';
    }));
    room.querySelectorAll('[data-action]:not([disabled])').forEach(btn=>btn.addEventListener('click',()=>{
      if(room.querySelector('#interaction3dCanvas')) return;
      if(message) message.textContent=btn.dataset.action==='look'?'栞子がこちらを見るモーション用のボタンです。モデル導入後に視線追従へ接続します。':'手を振るモーション用のボタンです。モデル導入後にアニメーションへ接続します。';
    }));
    return room;
  }

  ensureStyle();
  ensureRoom();
  ensureHomeButton();
  const observer=new MutationObserver(()=>ensureHomeButton());
  const home=document.getElementById('homeScreen');
  if(home) observer.observe(home,{childList:true,subtree:true});
})();
