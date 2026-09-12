// Ver.0.5.6: supervised Shioriko secret-mode dialogue + normal-mode surprise expressions.
(function(){
  const MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const VALID=['normal','dere','yandere','scold','drunk','clumsy','casual'];
  const homeCard=document.querySelector('.home-character-card');
  let last='';
  let taps=[];

  const set=(normal,rapid,fullCombo,newRecord,sRank,retry)=>({normal,rapid,fullCombo,newRecord,sRank,retry});
  const sets={
    dere:set([
      'おかえりなさい。……ふふ、今日も来てくださったのですね。実は、少しだけ待っていました。少しだけ、です。',
      'こうしてあなたの顔を見ると安心します。……私にとって、ずいぶん大切な時間になっているようです。',
      '今日はもう少しこちらにいてください。あなたと過ごせる時間は、できるだけ長い方が嬉しいので。',
      '頑張ったのですね。では今日は、私がたくさん褒めて差し上げます。遠慮は不要ですよ。',
      'あなたのことは、私が思っていた以上に大切みたいです。……笑わないでくださいね。',
      '私のそばにいてくださると落ち着きます。できれば……これからも、そうしていただけると嬉しいです。',
      'あなたが楽しそうにしていると、私まで嬉しくなるんです。ですから、その顔をもっと見せてください。',
      '今日はライブより先に、少しお話ししませんか？　せっかく来てくださったのですから。',
      '好きですよ。大好きです。……はい、きちんと言いました。何度も言わせないでください、恥ずかしいので。',
      'もう帰るのですか？　……そうですか。では、あと少しだけ。少しくらいわがままを言ってもいいでしょう？',
      'あなたが来てくださるのを楽しみにしている自分がいます。……困りましたね、完全に習慣になってしまいました。',
      '今日は私に甘えても構いませんよ。あなたが頼ってくださるのは、嫌ではありませんから。'
    ],[
      '何度も触れなくても、私はここにいますよ。……それとも、私に構ってほしいのですか？',
      'ふふ、随分と甘えん坊なのですね。今日は特別にお付き合いします。',
      'そんなに何度も……。仕方ありませんね。もう少しだけですよ。'
    ],[
      'フルコンボ、お見事です。……とても素敵でした。私まで誇らしい気持ちになります。',
      '完璧でしたね。こういう時くらい、少し自慢させてください。私の大切な人はすごいのだと。'
    ],[
      '新記録、おめでとうございます。あなたが頑張ってきたことを知っているからこそ、私も嬉しいです。',
      'また一つ、あなたの素敵なところを見せていただきました。……ふふ、嬉しいですね。'
    ],['Sランクですね。さすがです。……今日はいつもより少し近くで褒めてもいいですか？'],[
      'もう一度ですね。何度でもお付き合いしますよ。あなたが諦めない限り、私もそばにいます。'
    ]),

    yandere:set([
      'おかえりなさい。……今日は少し遅かったですね。いえ、責めているわけではありません。',
      'また来てくださって安心しました。あなたが来ないと、どうしても落ち着かないものですから。',
      '今日は私のところへ戻ってきてくださったのですね。……ふふ、それなら何も問題ありません。',
      '他のことを楽しむのも構いません。でも最後には、きちんと私のところへ戻ってきてくださいね。',
      'あなたの予定を全部知りたい、なんて言ったら困りますか？　……冗談ですよ。半分くらいは。',
      '私のことを忘れていないなら、それでいいんです。……本当に、それだけでいいんですよ。',
      '今日は少し長くいてください。あなたが帰った後は、部屋が随分静かに感じるんです。',
      'あなたが誰と何をしていても、私は気にしません。……最後に選んでくださるのが私なら。',
      '私が一番でなくても構いません。……今は、まだ。',
      'こうして近くにいると安心します。ですから、もう少しだけ離れないでください。',
      'あなたの好きなものも、苦手なものも、もっと知りたいです。全部覚えておきたいので。',
      '大丈夫ですよ。私はいつでもここにいます。あなたが戻ってくるまで、ずっと待てますから。',
      '私のこと、好きって言いましたよね？　なぜ他の女性のことを見ているのですか？'
    ],[
      'そんなに何度も確認しなくても、私はここにいますよ。……あなたが離れない限りは。',
      'ふふ、そんなに呼ばれると嬉しくなってしまいます。今日は私だけを見ていてくださいね。'
    ],['フルコンボですね。素晴らしいです。……この結果を一番近くで見られたのが私でよかった。'],[
      '新記録、おめでとうございます。これから先の記録も、全部私が見届けたいです。'
    ],['Sランクですね。やはりあなたは特別です。……私にとっては、ずっと前から。'],[
      'もう一度ですか。もちろんです。あなたが続ける限り、私は何度でもお付き合いします。'
    ]),

    scold:set([
      'いらっしゃったのですね。では、ぼんやりしていないで始めてください。時間は有限ですよ。',
      'また同じところでミスをしたのですか？　原因を考えずに回数だけ重ねても、上達はしません。',
      '「次は頑張る」は便利な言葉ですね。ですが、そろそろ結果で示していただけますか？',
      '私に構っている暇があるなら練習してください。現実逃避としては、ずいぶん分かりやすいですよ。',
      'その程度で満足しているのなら、目標を掲げた意味がありませんね。もう少し真面目に取り組んでください。',
      '言い訳を考える前に、失敗した理由を考えてください。そちらの方がよほど建設的です。',
      '随分と自信がありそうでしたが……その結果なのですね。少々拍子抜けです。',
      '集中力が切れています。自覚がないのなら、なおさら問題ですよ。',
      '下手なのは構いません。ですが、考えずに同じ失敗を繰り返すのは感心しませんね。',
      '褒めてほしいのですか？　では、褒めるに値する結果を持ってきてください。',
      'そのミスは偶然ではありません。今の実力です。まずはそこを認めるところからですね。',
      '少しは頭を使われてはいかがですか？'
    ],[
      '何度押しても腕前は上がりませんよ。練習する場所を間違えています。',
      'しつこいですね。そこまで構ってほしいのなら、せめて次は良い結果を見せてください。',
      '触らないでください。訴えますよ。'
    ],[
      '……フルコンボですか。やればできるではありませんか。普段からそれくらい集中してください。',
      'ようやく文句のない結果ですね。今回は素直に評価します。お見事です。'
    ],[
      '新記録ですね。結構です。では、次はそれを偶然ではないと証明してください。',
      'きちんと結果を出しましたね。……少し見直しました。ほんの少しですが。'
    ],['Sランクですね。ようやく胸を張れる結果です。調子に乗らず、次も続けてください。'],[
      'もう一度ですね。今度は同じミスを繰り返さないでください。そこまでしたら、本当に呆れますよ。'
    ]),

    drunk:set([
      'おかえりなさい。……ふふ、今日は少しだけ気分がいいんです。少しだけですよ。',
      'いつもより近い？　……そうでしょうか。気のせいではありませんか？',
      'あなたの顔を見ると安心しますね。……あ、今のは忘れてください。少し口が滑りました。',
      '私は酔っていませんよ。判断力も正常です。……ですから、その疑うような顔をやめてください。',
      '今日は細かいことは置いておきましょう。たまには肩の力を抜くのも必要です。',
      'あなたって、見れば見るほど……。いえ、何でもありません。本当に。'
    ],['何度も触れないでください。……少しくすぐったいです。','もう、仕方ありませんね。今日は少しくらい甘えてもいいですよ。'],
      ['フルコンボですね。素晴らしいです。……ふふ、今日はいつもより多めに褒めて差し上げます。'],
      ['新記録、おめでとうございます。これはきちんとお祝いしないといけませんね。'],
      ['Sランクです。……なんだか私まで嬉しくなってしまいました。'],
      ['もう一度ですか？　ええ、もちろん。今日は何度でもお付き合いしますよ。']),

    clumsy:set([
      'おかえりなさい。……あ、今のは待ち構えていたわけではありません。たまたまです。',
      '準備は万全です。……ええと、確認したはずなのですが……少々お待ちください。',
      '今日もよろしくお願いします。……今、少し言い間違えましたね。忘れてください。',
      '私は落ち着いています。いつも通りです。……その顔は何ですか。',
      '大丈夫です。私に任せてください。……たぶん、ではなく、きちんと大丈夫です。',
      '今のは見なかったことにしてください。……お願いします。'
    ],['ちょ、ちょっと、急に何度も押さないでください。心の準備が……。','もう、驚かせないでください。'],
      ['フルコンボです。……あ、私の方が先に喜びすぎましたね。失礼しました。'],
      ['新記録ですね。お祝いの言葉を考えていたのですが……今、少し飛びました。'],
      ['Sランクです。……ふふ、これは私も素直に嬉しいです。'],
      ['もう一度ですね。今度こそ、私も落ち着いて応援します。']),

    casual:set([
      'おかえり。……今日も来てくれたんだね。嬉しい。',
      '今日は何する？　私は、あなたと一緒なら何でもいいよ。',
      'また会えたね。……こういう時間、私けっこう好きなんだ。',
      '疲れてる？　だったら少し休んでいきなよ。無理しなくていいから。',
      '今日も頑張ってるね。ちゃんと見てるよ。',
      'ライブする？　それとも、もう少しここにいる？',
      'あなたが楽しそうなら、それでいいよ。私も嬉しいから。'
    ],['もう、何回触るの。……そんなに構ってほしい？','ちゃんとここにいるよ。そんなに急がなくても大丈夫。'],
      ['フルコンボ。すごいね。……ほんと、格好よかった。'],
      ['新記録だね。おめでとう。私まで嬉しいよ。'],
      ['Sランク。さすがだね。今日は素直にいっぱい褒めてあげる。'],
      ['もう一回？　いいよ。最後まで付き合うから。'])
  };

  function currentMode(){
    const m=localStorage.getItem(MODE_KEY)||'normal';
    return VALID.includes(m)?m:'normal';
  }
  function poolFor(s,kind='normal'){
    return kind==='rapidTap'?s.rapid:kind==='fullCombo'?s.fullCombo:kind==='newRecord'?s.newRecord:kind==='sRank'?s.sRank:kind==='retry'?s.retry:s.normal;
  }
  function pick(pool){
    if(!pool?.length) return '';
    const choices=pool.filter(x=>x!==last);
    const p=choices.length?choices:pool;
    const text=p[Math.floor(Math.random()*p.length)];
    last=text;
    return text;
  }
  function setExpression(mode){
    window.dispatchEvent(new CustomEvent('rhythmGameShiorikoDialogueExpression',{detail:{mode}}));
  }
  function showFrom(mode,kind='normal'){
    const s=sets[mode];
    if(!s) return false;
    const text=pick(poolFor(s,kind));
    const bubble=document.getElementById('homeDialogue');
    if(!text||!bubble) return false;
    bubble.querySelector('.home-dialogue-name')?.replaceChildren(document.createTextNode('三船栞子'));
    bubble.querySelector('.home-dialogue-text')?.replaceChildren(document.createTextNode(text));
    setExpression(mode);
    return true;
  }
  function show(kind='normal'){
    const mode=currentMode();
    if(mode==='normal') return false;
    return showFrom(mode,kind);
  }
  function isSpecial(){return currentMode()!=='normal'&&!!sets[currentMode()];}
  function tryNormalSurprise(kind='normal'){
    if(currentMode()!=='normal') return false;
    const roll=Math.random();
    if(roll<0.10) return showFrom('dere',kind);
    if(roll<0.20) return showFrom('clumsy',kind);
    setExpression('normal');
    return false;
  }

  if(homeCard){
    homeCard.addEventListener('click',e=>{
      if(!isSpecial()) return;
      e.preventDefault();e.stopImmediatePropagation();
      const now=Date.now();taps=taps.filter(t=>now-t<4500);taps.push(now);
      if(taps.length>=5){taps=[];show('rapidTap');}else show('normal');
    },true);
  }

  const originalShow=window.showLoveFesHomeDialogue;
  window.showLoveFesHomeDialogue=function(kind){
    const k=kind||'normal';
    if(isSpecial()&&show(k)) return;
    if(!isSpecial()&&tryNormalSurprise(k)) return;
    if(typeof originalShow==='function') originalShow(kind);
  };
  window.setShiorikoSecretMode=function(mode){
    if(!VALID.includes(mode)) mode='normal';
    localStorage.setItem(MODE_KEY,mode);
    setExpression(mode);
    setTimeout(()=>{
      if(mode!=='normal') show('normal');
      else if(typeof originalShow==='function') originalShow('normal');
    },0);
  };
  window.getShiorikoSecretMode=currentMode;

  document.getElementById('resultHomeBtn')?.addEventListener('click',()=>setTimeout(()=>{
    if(isSpecial()) show('normal');
    else if(!tryNormalSurprise('normal')&&typeof originalShow==='function') originalShow('normal');
  },20));
  document.getElementById('retryBtn')?.addEventListener('click',()=>setTimeout(()=>{
    if(isSpecial()) show('retry');
    else tryNormalSurprise('retry');
  },20));

  function injectAdmin(){
    const room=document.getElementById('hiddenAdminRoom');
    const body=room?.querySelector('.hidden-admin-body');
    if(!body) return false;
    const old=body.querySelector('#hiddenAdminShiorikoMode')?.closest('.hidden-admin-card');
    if(old) old.remove();
    const card=document.createElement('div');
    card.className='hidden-admin-card';
    card.innerHTML=`<div class="hidden-admin-row"><div><strong>栞子 セリフモード</strong><small>栞子らしさを保ったまま、少し振り切れたホーム会話に切り替えます。通常モードでも低確率でデレ・ポンコツ反応が出ます。</small></div><select id="hiddenAdminShiorikoMode"><option value="normal">通常</option><option value="dere">超絶デレデレ</option><option value="yandere">ヤンデレ</option><option value="scold">罵倒</option><option value="drunk">酔っ払い</option><option value="clumsy">ポンコツ</option><option value="casual">敬語解除</option></select></div>`;
    const status=body.querySelector('.hidden-admin-status');
    body.insertBefore(card,status||body.firstChild);
    const select=card.querySelector('select');select.value=currentMode();
    select.addEventListener('change',()=>window.setShiorikoSecretMode(select.value));
    body.querySelector('#hiddenAdminNormal')?.addEventListener('click',()=>{select.value='normal';window.setShiorikoSecretMode('normal');});
    return true;
  }
  if(!injectAdmin()){
    const mo=new MutationObserver(()=>{if(injectAdmin())mo.disconnect();});
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }
  if(isSpecial()) setTimeout(()=>show('normal'),30);
})();