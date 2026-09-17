// Ver.0.8.44: character interaction room foundation for future 3D Shioriko model.
(function(){
  'use strict';

  function ensureStyle(){
    if(document.getElementById('interactionRoomV0844Style')) return;
    const style=document.createElement('style');
    style.id='interactionRoomV0844Style';
    style.textContent=`
      .home-menu-interaction{grid-column:3!important;grid-row:2!important}
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
    btn.innerHTML='ふれあい<span>3Dキャラと過ごす</span>';
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
        <h1>ふれあい</h1>
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
              <button type="button" class="is-active" data-ir-tab="touch">ふれあい</button>
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
      angle=(angle+12)%360;
      if(placeholder) placeholder.style.transform=`rotateY(${angle}deg) scale(1.015)`;
      if(message) message.textContent='タッチ反応の受け口は動作しています。3Dモデル導入後は、顔・頭・手などタップ位置別にリアクションを分けます。';
      setTimeout(()=>{if(placeholder)placeholder.style.transform=`rotateY(${angle}deg)`;},180);
    });
    room.querySelectorAll('[data-ir-tab]').forEach(btn=>btn.addEventListener('click',()=>{
      room.querySelectorAll('[data-ir-tab]').forEach(x=>x.classList.toggle('is-active',x===btn));
      const tab=btn.dataset.irTab;
      if(message) message.textContent=tab==='touch'?'タッチ・回転・表情リアクションをここで操作します。':tab==='costume'?'制服・ライブ衣装・私服などをここから切り替えられるようにします。':'待機・手振り・ポーズ・ダンスなどのモーションをここから選べるようにします。';
    }));
    room.querySelectorAll('[data-action]:not([disabled])').forEach(btn=>btn.addEventListener('click',()=>{
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
