// Ver.0.4.9: adds Shioriko dialogue mode controls to the existing owner settings room.
(function(){
  const KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold'];

  function readMode(){
    const value=localStorage.getItem(KEY)||'normal';
    return VALID.includes(value)?value:'normal';
  }
  function setMode(value){
    const mode=VALID.includes(value)?value:'normal';
    localStorage.setItem(KEY,mode);
    window.dispatchEvent(new CustomEvent('rhythmGameShiorikoModeChanged',{detail:{mode}}));
    return mode;
  }
  window.getShiorikoDialogueMode=readMode;
  window.setShiorikoDialogueMode=setMode;

  function install(){
    const room=document.getElementById('hiddenAdminRoom');
    if(!room) return false;
    const body=room.querySelector('.hidden-admin-body');
    if(!body||document.getElementById('hiddenAdminShiorikoMode')) return true;

    const card=document.createElement('div');
    card.className='hidden-admin-card';
    card.innerHTML=`
      <div class="hidden-admin-row">
        <div><strong>栞子 セリフモード</strong><small>ホーム会話とライブ後リアクションに反映します。</small></div>
        <select id="hiddenAdminShiorikoMode">
          <option value="normal">通常</option>
          <option value="dere">超絶デレデレ</option>
          <option value="yandere">ヤンデレ</option>
          <option value="scold">罵倒</option>
        </select>
      </div>`;

    const status=body.querySelector('#hiddenAdminStatus');
    body.insertBefore(card,status||body.firstChild);
    const select=card.querySelector('#hiddenAdminShiorikoMode');
    select.value=readMode();
    select.addEventListener('change',()=>setMode(select.value));

    const normalBtn=body.querySelector('#hiddenAdminNormal');
    normalBtn?.addEventListener('click',()=>{
      select.value='normal';
      setMode('normal');
    });

    const doneBtn=body.querySelector('#hiddenAdminDone');
    doneBtn?.addEventListener('click',()=>setMode(select.value));

    const observer=new MutationObserver(()=>{
      if(!room.hidden) select.value=readMode();
    });
    observer.observe(room,{attributes:true,attributeFilter:['hidden']});
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(install()||tries>40) clearInterval(timer);
    },250);
  }
})();