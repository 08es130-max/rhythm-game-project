// Ver.0.5.0: extended secret Shioriko dialogue modes.
(function(){
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const homeCard=document.querySelector('.home-character-card');
  let last='';
  let taps=[];

  const sets={
    dere:{
      normal:[
        'おかえりなさい。……会いたかったです。本当に、ずっと。あなたが来てくれただけで胸がいっぱいです。',
        '今日は私のそばにいてください。できれば、ずっと。あなたがいなくなると寂しくて仕方ないんです。',
        '好きです。大好きです。……何度言っても足りませんね。あなたのこと、本当に大切なんです。',
        'もう少し近くに来てください。……はい、そのくらいです。あなたの顔をちゃんと見ていたいので。',
        'あなたが来るのをずっと待っていました。時計を見るたび、まだかなって……少し恥ずかしいですね。',
        '今日は何もしなくてもいいですよ。私のところでゆっくりしてください。たくさん甘やかしますから。',
        'あなたが笑うだけで嬉しいんです。だからもっと笑ってください。できれば、私の隣で。',
        '会えただけで幸せです。でも……会えたら会えたで、もっと一緒にいたくなってしまいます。',
        '帰るなんて言わないでくださいね。……あと少し、いえ、できれば今日はずっとここにいてください。',
        'あなたのことを考えていたら、いつの間にか時間が過ぎていました。責任、取ってくださいますか？',
        '私の一番大切な人です。……はい、あなたのことです。もう誤魔化しません。',
        '疲れたなら、私に甘えてください。今日は遠慮禁止です。全部受け止めますから。',
        '好きな人が来てくれるって、こんなに嬉しいことなんですね。……ふふ、今とても幸せです。',
        'あなたに会えるなら、毎日でも待てます。でも本音を言えば……毎日来てほしいです。',
        'ねえ、もう少しだけ私を見ていてください。今はライブより、あなたに構ってほしいんです。',
        'あなたのそばが一番落ち着きます。だから……これからも私の隣、空けておいてくださいね。',
        '大好きです。本当に大好きです。……恥ずかしいですけど、今日は何度でも言えそうです。',
        'あなたが私を選んでくれるたび、嬉しくてどうしようもなくなります。もっと選んでください。'
      ],
      rapid:['そんなに何度も触れて……もっと私に甘えたいんですね？　ふふ、いくらでもどうぞ。','何回でも呼んでください。あなたになら、何回だって応えます。','そんなに私のことが好きなんですか？　……安心してください。私はそれ以上に好きです。'],
      fullCombo:['フルコンボです！　すごいです……もう、嬉しすぎて抱きしめたいです。今すぐ。','完璧でした。あなたが格好良すぎて、少し困っています。もっと好きになってしまいます。'],
      newRecord:['新記録です！　おめでとうございます。誰よりも近くで祝えるのが嬉しいです。','また好きなところが増えてしまいました。どうしてくれるんですか？'],
      sRank:['Sランク……さすが私の大好きな人です。とても、とても素敵でした。'],
      retry:['もう一度ですね。何回でも一緒にやりましょう。あなたとなら、ずっと付き合います。']
    },
    scold:{
      normal:[
        'また来たのですか。暇ですね。そんなに私に構ってほしいなら、せめて結果くらい出してください。',
        'その程度の集中力でフルコンボを狙っていたんですか？　随分と都合のいい頭をしていますね。',
        'ぼんやりしていないで始めてください。見ているこちらが呆れます。',
        'また言い訳ですか？　失敗より、失敗した理由を並べて満足している方がみっともないですよ。',
        'やる気がないなら帰って寝てください。中途半端に居座られる方が迷惑です。',
        'その腕前で満足しているなら、向上心までお休み中のようですね。',
        '私をタップする暇があるなら練習してください。あなた、本当に分かりやすく現実逃避しますね。',
        'またミスしたんですか？　同じところで何度も。学習機能は搭載されていますよね？',
        '「次は頑張る」は聞き飽きました。次ではなく今やってください。',
        '随分と自信満々でしたが、その結果ですか。口ほどにもありませんね。',
        '集中してください。あなたの注意力、金魚より短くないですか？',
        '下手なのは仕方ありません。でも考えずに同じミスを繰り返すのは、ただの怠慢です。',
        'また甘えに来たんですか？　情けないですね。まあ、見捨てはしませんけど。',
        '褒めてほしい顔をしていますね。その結果で？　冗談は腕前が上がってからにしてください。',
        'その程度で疲れたんですか。体力も集中力も、ずいぶん慎ましいのですね。',
        '今日も私が尻を叩かないと動けないんですか？　本当に手のかかる人です。',
        'できない理由を探すのだけは一人前ですね。できる方法も同じくらい考えてください。',
        'そのミス、偶然ではありませんよ。普通にあなたの実力です。認めた方が早いです。'
      ],
      rapid:['何度押しても上手くなりません。指を動かす場所が違いますよ。','しつこいですね。構ってほしいなら、せめて見せ場の一つくらい作ってください。','またタップですか。暇人の才能だけはSランクですね。'],
      fullCombo:['……フルコンボですか。やればできるじゃないですか。普段どれだけ手を抜いているんです？','ようやくまともな結果ですね。褒めてあげます。ほんの少しだけ。'],
      newRecord:['新記録です。珍しく口だけではありませんでしたね。','更新できたんですね。では次も同じ言い訳は使えませんよ。'],
      sRank:['Sランクですね。ようやく見せられる結果です。調子に乗るのは次も取ってからにしてください。'],
      retry:['またやるんですか。結構です。今度こそ同じミスをしたら、本気で呆れますよ。']
    },
    drunk:{
      normal:['あ、来たぁ……ふふ、今日はちょっとだけ気分がいいんです。ちょっとだけですよ？','ねえねえ、こっち来てください。今日はいつもより近くてもいい気がします。','なんだかあなたの顔を見ると安心するんですよねぇ……不思議です。','私、全然酔ってません。ちゃんと歩けます。たぶん。','ふふ……今日は細かいことはいいじゃないですか。楽しくやりましょう？','あなたって、見れば見るほど……いえ、何でもないです。ふふふ。','ちょっと待ってください、今すごく大事なことを……あれ？　何でしたっけ。'],
      rapid:['そんなに触るとくすぐったいですってぇ……ふふ。','もう、何回押すんですかぁ。構ってほしいんですね？','はいはい、栞子ですよー。ちゃんとここにいますよー。'],
      fullCombo:['わぁ、フルコンボ！　すごーい……今日は盛大に褒めます！'],
      newRecord:['新記録！　お祝いしましょう。ええ、今すぐです！'],
      sRank:['Sです！　ふふ、なんだか私まで誇らしいです。'],
      retry:['もう一回？　いいですよぉ。今日は何回でも付き合います。']
    },
    clumsy:{
      normal:['おかえりなさい。……あっ、今のは別に待ち構えていたわけでは……ありません。','準備は完璧です。……あれ、イヤホンどこに置きましたっけ。','今日もよろしくお願いします。……あ、今ちょっと噛みましたね。忘れてください。','私は落ち着いています。はい、とても。……その顔は何ですか。','ちゃんと確認しました。たぶん。いえ、ちゃんとです。','大丈夫です、任せてください。……ええと、何をするんでしたっけ。','今の失敗は見なかったことにしてください。お願いします。'],
      rapid:['ちょ、ちょっと、急に何度も押さないでください！　心の準備が……！','もう、びっくりするじゃないですか。'],
      fullCombo:['フルコンボです！　……あ、私の方が先に喜びすぎました。すみません。'],
      newRecord:['新記録ですね！　ええと……お祝いの言葉、考えていたのに飛びました。'],
      sRank:['Sランクです！　……ふふ、これは私も素直に嬉しいです。'],
      retry:['もう一度ですね。今度は私も間違えずに応援します。']
    },
    casual:{
      normal:['おかえり。今日も来てくれたんだね。嬉しい。','ねえ、今日は何する？　私はあなたと一緒なら何でもいいよ。','また会えたね。……こういうの、やっぱり好きだな。','疲れてる？　じゃあ少しここにいなよ。無理しなくていいから。','今日も頑張ってるね。ちゃんと見てるよ。','ふふ、そんな顔しないで。私がいるでしょ。','ライブする？　それとも、もう少し話していく？','あなたが楽しそうなら、それでいいよ。私も嬉しいから。'],
      rapid:['もう、何回触るの。……そんなに構ってほしいの？','はいはい、ここにいるよ。そんなに急がなくても大丈夫。'],
      fullCombo:['フルコンボ！　すごいじゃん。ほんと、格好よかったよ。'],
      newRecord:['新記録だね。おめでとう。私まで嬉しい。'],
      sRank:['Sランク！　さすがだね。今日はいっぱい褒めてあげる。'],
      retry:['もう一回？　いいよ。最後まで付き合うから。']
    }
  };

  function currentMode(){
    const m=localStorage.getItem(MODE_KEY)||'normal';
    return VALID.includes(m)?m:'normal';
  }
  function pick(pool){
    if(!pool?.length) return '';
    const choices=pool.filter(x=>x!==last);
    const p=choices.length?choices:pool;
    const text=p[Math.floor(Math.random()*p.length)];
    last=text;
    return text;
  }
  function show(kind='normal'){
    const mode=currentMode();
    const set=sets[mode];
    if(!set) return false;
    const pool=kind==='rapidTap'?set.rapid:kind==='fullCombo'?set.fullCombo:kind==='newRecord'?set.newRecord:kind==='sRank'?set.sRank:kind==='retry'?set.retry:set.normal;
    const text=pick(pool);
    const bubble=document.getElementById('homeDialogue');
    if(!text||!bubble) return false;
    const name=bubble.querySelector('.home-dialogue-name');
    const body=bubble.querySelector('.home-dialogue-text');
    if(name) name.textContent='三船栞子';
    if(body) body.textContent=text;
    return true;
  }

  function isSpecial(){return currentMode()!=='normal'&&!!sets[currentMode()];}

  if(homeCard){
    homeCard.addEventListener('click',e=>{
      if(!isSpecial()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const now=Date.now();
      taps=taps.filter(t=>now-t<4500);taps.push(now);
      if(taps.length>=5){taps=[];show('rapidTap');}else show('normal');
    },true);
  }

  const originalShow=window.showLoveFesHomeDialogue;
  window.showLoveFesHomeDialogue=function(kind){
    if(isSpecial()&&show(kind||'normal')) return;
    if(typeof originalShow==='function') originalShow(kind);
  };

  window.setShiorikoSecretMode=function(mode){
    if(!VALID.includes(mode)) mode='normal';
    localStorage.setItem(MODE_KEY,mode);
    setTimeout(()=>{ if(mode!=='normal') show('normal'); else if(typeof originalShow==='function') originalShow('normal'); },0);
  };
  window.getShiorikoSecretMode=currentMode;

  document.getElementById('resultHomeBtn')?.addEventListener('click',()=>{setTimeout(()=>{if(isSpecial()) show('normal');},20);});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{setTimeout(()=>{if(isSpecial()) show('retry');},20);});
  window.addEventListener('rhythmGameShiorikoModeChanged',e=>{window.setShiorikoSecretMode(e.detail?.mode||'normal');});

  function injectAdmin(){
    const room=document.getElementById('hiddenAdminRoom');
    const body=room?.querySelector('.hidden-admin-body');
    if(!body||body.querySelector('#hiddenAdminShiorikoMode')) return false;
    const card=document.createElement('div');
    card.className='hidden-admin-card';
    card.innerHTML=`<div class="hidden-admin-row"><div><strong>栞子 セリフモード</strong><small>ホーム会話の隠しモードです。</small></div><select id="hiddenAdminShiorikoMode"><option value="normal">通常</option><option value="dere">超絶デレデレ</option><option value="yandere">ヤンデレ</option><option value="scold">罵倒</option><option value="drunk">酔っ払い</option><option value="clumsy">ポンコツ</option><option value="casual">敬語解除</option></select></div>`;
    const status=body.querySelector('.hidden-admin-status');
    body.insertBefore(card,status||body.firstChild);
    const select=card.querySelector('select');
    select.value=currentMode();
    select.addEventListener('change',()=>window.setShiorikoSecretMode(select.value));
    const normalBtn=body.querySelector('#hiddenAdminNormal');
    normalBtn?.addEventListener('click',()=>{select.value='normal';window.setShiorikoSecretMode('normal');});
    return true;
  }

  if(!injectAdmin()){
    const mo=new MutationObserver(()=>{if(injectAdmin()) mo.disconnect();});
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(isSpecial()) setTimeout(()=>show('normal'),30);
})();
