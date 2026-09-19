// Ver.0.8.73: hidden-room-only Shioriko standing art + situation dialogue override.
(function(){
  'use strict';

  const KEY='rhythmGame.shiorikoSecretStanding.v1';
  const VALID=['normal','maid','swimsuit','swordsman'];
  const ASSETS={
    maid:'assets/shioriko-secret/shioriko-secret-maid-512.webp',
    swimsuit:'assets/shioriko-secret/shioriko-secret-swimsuit-512.webp',
    swordsman:'assets/shioriko-secret/shioriko-secret-swordsman-512.webp'
  };
  const LABELS={normal:'通常',maid:'メイド',swimsuit:'水着',swordsman:'剣士'};
  const card=document.querySelector('.home-character-card');
  const image=card?.querySelector('.home-character-img');
  let last='';
  let baseSrc=image?.getAttribute('src')||'';
  let internal=false;
  let taps=[];

  const sets={
    maid:{
      normal:[
        'お帰りなさいませ。……こういうご挨拶は、少し照れますね。ですが、今日は私がきちんとお迎えします。',
        'ご用がありましたら、どうぞ遠慮なく。あなたに心地よく過ごしていただくことも、今日の私の役目ですから。',
        'お疲れではありませんか？　温かい飲み物でもご用意しましょう。……ふふ、たまには私に甘えてください。',
        '身の回りのお世話をするというのも、案外悪くありませんね。あなたが相手だから、そう思うのかもしれません。',
        '今日は少しだけ特別です。いつもより近くで、あなたのお手伝いをさせてください。'
      ],
      rapid:[
        'もう、そんなに何度も呼ばなくても聞こえています。……ご主人様、とお呼びした方がよろしいですか？',
        'ふふ、随分と構ってほしいのですね。仕方ありません。今日は特別に、もう少しお付き合いします。'
      ],
      fullCombo:['フルコンボ、お見事です。ご褒美をご希望ですか？　……冗談です。ですが、心から褒めさせてください。'],
      newRecord:['新記録ですね。おめでとうございます。努力の成果を一番近くで見届けられて、私も嬉しいです。'],
      sRank:['Sランクです。素晴らしいですね。では今日は、私から特別におもてなしをさせてください。'],
      retry:['もう一度ですね。承知しました。次も最後まで、私がおそばで見届けます。']
    },
    swimsuit:{
      normal:[
        '今日はずいぶん眩しいですね。……ですが、あなたと一緒なら、こういう夏の日も嫌いではありません。',
        '普段とは随分違う装いですが……似合っていますか？　そんなにじっと見られると、少し困ります。',
        'せっかく海まで来たのですから、今日は少し肩の力を抜きましょう。真面目な話は、また後でもできますから。',
        '水辺は気持ちがいいですね。あなたもこちらへ来ませんか？　足元には気をつけてくださいね。',
        'こうして過ごす夏の時間も、きっと大切な思い出になるのでしょうね。……できれば、あなたと一緒に。'
      ],
      rapid:[
        'もう、濡れた手で何度も触らないでください。……冷たいではありませんか。',
        'そんなに構ってほしいのですか？　では、少しだけ一緒に海辺を歩きましょうか。'
      ],
      fullCombo:['フルコンボですね。お見事です。……この後は少しくらい、のんびりしても罰は当たりませんよ。'],
      newRecord:['新記録、おめでとうございます。夏の思い出が、また一つ増えましたね。'],
      sRank:['Sランクです。さすがですね。では、ご褒美に冷たい飲み物でもご一緒しましょうか。'],
      retry:['もう一度ですか？　ええ、もちろん。日が暮れるまででも、お付き合いしますよ。']
    },
    swordsman:{
      normal:[
        '準備は整っています。参りましょう。迷っている時間があるのなら、まず一歩を踏み出すべきです。',
        'この剣は、守りたいもののために振るうと決めています。……あなたも、その中に含まれているのですよ。',
        '油断は禁物です。ですが、必要以上に恐れることもありません。私がそばにいます。',
        '道がないのなら切り開きましょう。あなたが進むと決めたのなら、私も最後までお供します。',
        '覚悟はできています。あとは、私たちにできることを一つずつ積み重ねるだけです。'
      ],
      rapid:[
        '集中してください。……もう、そんなに何度も呼ばなくても、置いていったりはしません。',
        '戦いの最中に気を散らすのは感心しませんね。……ですが、あなたが無事ならそれで構いません。'
      ],
      fullCombo:['見事な立ち回りでした。フルコンボです。あなたならやり遂げると信じていました。'],
      newRecord:['新記録ですね。積み重ねた鍛錬は裏切りません。胸を張ってください。'],
      sRank:['Sランク。申し分ありません。……ふふ、今日は私の方があなたを頼もしく感じてしまいました。'],
      retry:['再戦ですね。承知しました。同じ失敗は繰り返さず、次こそ勝ち取りましょう。']
    }
  };

  function current(){
    const v=localStorage.getItem(KEY)||'normal';
    return VALID.includes(v)?v:'normal';
  }
  function active(){return current()!=='normal';}
  function pick(pool){
    if(!pool?.length) return '';
    const options=pool.filter(x=>x!==last);
    const list=options.length?options:pool;
    const text=list[Math.floor(Math.random()*list.length)];
    last=text;
    return text;
  }
  function pool(kind='normal'){
    const s=sets[current()];
    if(!s) return null;
    return s[kind]||s.normal;
  }
  function show(kind='normal'){
    if(!active()) return false;
    const bubble=document.getElementById('homeDialogue');
    const text=pick(pool(kind));
    if(!bubble||!text) return false;
    bubble.querySelector('.home-dialogue-name')?.replaceChildren(document.createTextNode('三船栞子'));
    bubble.querySelector('.home-dialogue-text')?.replaceChildren(document.createTextNode(text));
    return true;
  }

  function managedSrc(src){
    return Object.values(ASSETS).some(x=>String(src||'').includes(x));
  }
  function applyStanding(){
    if(!image) return;
    const mode=current();
    const now=image.getAttribute('src')||'';
    if(mode==='normal'){
      if(managedSrc(now)&&baseSrc){
        internal=true;image.setAttribute('src',baseSrc);requestAnimationFrame(()=>internal=false);
      }
      return;
    }
    if(!managedSrc(now)&&now) baseSrc=now;
    const src=ASSETS[mode];
    if(src&&now!==src){
      internal=true;image.setAttribute('src',src);requestAnimationFrame(()=>internal=false);
    }
    if(card) card.dataset.shioSecretStanding=mode;
  }

  function setStanding(mode){
    if(!VALID.includes(mode)) mode='normal';
    const was=current();
    localStorage.setItem(KEY,mode);
    if(card){
      if(mode==='normal') delete card.dataset.shioSecretStanding;
      else card.dataset.shioSecretStanding=mode;
    }
    if(mode==='normal'&&was!=='normal'&&image&&baseSrc){
      internal=true;image.setAttribute('src',baseSrc);requestAnimationFrame(()=>internal=false);
    }else{
      applyStanding();
    }
    window.dispatchEvent(new CustomEvent('rhythmGameShiorikoStandingChanged',{detail:{mode}}));
    setTimeout(()=>{
      if(mode!=='normal') show('normal');
      else window.showLoveFesHomeDialogue?.('normal');
    },0);
  }

  // Highest-priority home dialogue while a hidden standing is selected.
  const previousShow=window.showLoveFesHomeDialogue;
  window.showLoveFesHomeDialogue=function(kind){
    if(active()&&show(kind||'normal')) return;
    if(typeof previousShow==='function') return previousShow(kind);
  };
  window.setShiorikoSecretStanding=setStanding;
  window.getShiorikoSecretStanding=current;

  // Capture before the older card-level secret-mode listener.
  document.addEventListener('click',e=>{
    if(!active()||!card||!card.contains(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const now=Date.now();
    taps=taps.filter(t=>now-t<4500);taps.push(now);
    if(taps.length>=5){taps=[];show('rapid');}else show('normal');
    applyStanding();
  },true);

  // Result/retry dialogue: run after older handlers and overwrite with the costume-specific line.
  document.getElementById('resultHomeBtn')?.addEventListener('click',()=>setTimeout(()=>{if(active())show('normal');},40));
  document.getElementById('retryBtn')?.addEventListener('click',()=>setTimeout(()=>{if(active())show('retry');},40));

  // Keep hidden standing above Classic, expression swaps and other home-art changes.
  if(image){
    const mo=new MutationObserver(()=>{
      if(internal) return;
      const src=image.getAttribute('src')||'';
      if(active()){
        if(!managedSrc(src)&&src) baseSrc=src;
        queueMicrotask(applyStanding);
      }else if(src&&!managedSrc(src)){
        baseSrc=src;
      }
    });
    mo.observe(image,{attributes:true,attributeFilter:['src']});
  }
  ['rhythmGameShiorikoDialogueExpression','rhythmGameShiorikoModeChanged'].forEach(name=>{
    window.addEventListener(name,()=>{if(active())setTimeout(applyStanding,0);});
  });

  function injectAdmin(){
    const room=document.getElementById('hiddenAdminRoom');
    const body=room?.querySelector('.hidden-admin-body');
    if(!body) return false;
    if(body.querySelector('#hiddenAdminShiorikoStanding')) return true;

    const cardEl=document.createElement('div');
    cardEl.className='hidden-admin-card';
    cardEl.innerHTML=`
      <div class="hidden-admin-row">
        <div>
          <strong>栞子 立ち絵変更</strong>
          <small>隠しモード限定。選択中はClassicなど通常の立ち絵や表情差分より優先して表示し、専用セリフへ切り替えます。</small>
        </div>
        <select id="hiddenAdminShiorikoStanding">
          <option value="normal">通常</option>
          <option value="maid">メイド</option>
          <option value="swimsuit">水着</option>
          <option value="swordsman">剣士</option>
        </select>
      </div>`;

    const dialogueCard=body.querySelector('#hiddenAdminShiorikoMode')?.closest('.hidden-admin-card');
    const status=body.querySelector('.hidden-admin-status');
    if(dialogueCard?.nextSibling) body.insertBefore(cardEl,dialogueCard.nextSibling);
    else body.insertBefore(cardEl,status||body.firstChild);

    const select=cardEl.querySelector('select');
    select.value=current();
    select.addEventListener('change',()=>setStanding(select.value));

    body.querySelector('#hiddenAdminNormal')?.addEventListener('click',()=>{
      select.value='normal';
      setStanding('normal');
    });
    return true;
  }

  if(!injectAdmin()){
    const mo=new MutationObserver(()=>{if(injectAdmin())mo.disconnect();});
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }

  Object.values(ASSETS).forEach(src=>{const p=new Image();p.src=src;});
  if(active()){
    setTimeout(()=>{applyStanding();show('normal');},50);
  }
})();