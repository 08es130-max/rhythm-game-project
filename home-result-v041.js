// Ver.0.4.1: result rank/full-combo/high-score + character-linked home dialogue.
(function(){
  const RECORDS_KEY='rhythmGame.songRecords.v1';
  const HOME_CHARACTER_KEY='rhythmGame.homeCharacter';
  const DEFAULT_HOME_CHARACTER='default';
  const homeCard=document.querySelector('.home-character-card');
  const homeImage=document.querySelector('.home-character-img');
  const resultPanelEl=document.getElementById('resultPanel');
  let lastDialogue='';
  let tapTimes=[];
  let pendingHomeReaction=null;

  const SHIORIKO={
    name:'三船栞子',
    normal:[
      'おかえりなさい。今日もお会いできましたね。',
      '今日もよろしくお願いします。一緒に楽しみましょう。',
      'いらっしゃったのですね。ちょうどお待ちしていました。',
      '少しだけでも、顔を見せてくださると嬉しいものですね。',
      '今日も良い一日にできるといいですね。',
      '無理のない範囲で、今日も頑張っていきましょう。',
      'こうしてお話しできる時間も、私は好きですよ。',
      'さて、今日は何をしましょうか？',
      'ライブの準備は万全です。いつでも始められますよ。',
      '良い結果を目指すことも大切ですが、まずは楽しんでくださいね。',
      '昨日より少し上手くなれたなら、それだけでも十分な成果です。',
      'フルコンボ……狙ってみますか？',
      '集中できていますね。その調子です。',
      '少しくらいミスをしても構いません。次があります。',
      'ハイスコア更新、期待していますよ。',
      '難しい譜面ほど、成功したときの喜びも大きいものです。',
      '今日のあなたなら、良いライブができそうな気がします。',
      '私も応援しています。思い切っていきましょう。',
      '疲れているのなら、休むことも予定のうちに入れてください。',
      '頑張っていることは、ちゃんと伝わっていますよ。',
      '焦らなくても大丈夫です。一つずつ進めていきましょう。',
      'うまくいかない日があっても、それで全部が駄目になるわけではありません。',
      'あなたが楽しそうにしていると、私まで嬉しくなります。',
      '今日は少しゆっくりしてもよいのではありませんか？',
      'また来てくださったのですね。……ふふ、嬉しいです。',
      '今日も自分のペースで進めていきましょう。',
      '結果だけでなく、楽しめたかどうかも大切ですよ。',
      '積み重ねた分だけ、少しずつ上達していきます。',
      '私はここにいますから、焦らずいきましょう。',
      'もう一度挑戦するのですね。応援しています。'
    ],
    morning:[
      'おはようございます。今日は早いのですね。',
      '朝から来てくださったのですね。良い一日にしましょう。',
      'まだ少し眠そうですね。無理はしないでください。',
      '朝のうちにひとつ終わらせると、気持ちが軽くなりますよ。'
    ],
    daytime:[
      'こんにちは。ひと息つきに来たのですか？',
      '午後もまだあります。慌てず進めていきましょう。',
      '少し休憩してから、また頑張るのも良いと思います。'
    ],
    evening:[
      '今日も一日お疲れさまでした。ここからは少し楽しみましょう。',
      '夕方は疲れが出る頃です。無理は禁物ですよ。',
      '今日の締めに、一本ライブをしていきますか？'
    ],
    night:[
      'こんな時間までお疲れさまです。あまり夜更かしはしないでくださいね。',
      'もう遅い時間ですね。終わったらゆっくり休んでください。',
      '夜は集中しやすいですが、休む時間も忘れないでくださいね。',
      'もう少しだけ、でしたらお付き合いします。'
    ],
    rare:[
      '私に会いに来てくださった……ということでよろしいですか？',
      'あなたと過ごす時間なら、私は嫌いではありませんよ。',
      'もう少しここにいても構いません。私もお付き合いします。',
      '今日はあなたに会えてよかったです。',
      '……こういうことを言うのは少し恥ずかしいのですが、また来てくださいね。'
    ],
    rapidTap:[
      '何度も私をタップしていますね。何かご用でしょうか？',
      'そんなに見つめられると……少し困ってしまいます。',
      'もう一度ですか？　仕方ありませんね。',
      'ふふ……そんなに急がなくても、私はここにいますよ。'
    ],
    fullCombo:[
      'フルコンボ、お見事です。最後まで集中を切らしませんでしたね。',
      '見事なフルコンボでした。努力の成果が出ていますね。',
      '全てつながりましたね。私まで嬉しくなってしまいました。'
    ],
    newRecord:[
      'ハイスコア更新です。前の自分を越えられましたね。',
      '新記録、おめでとうございます。次はどこまで伸ばせるでしょうか。',
      '記録更新ですね。積み重ねはきちんと結果に表れています。'
    ],
    sRank:[
      'Sランクです。とても良いライブでした。',
      '素晴らしい結果ですね。胸を張ってよいと思います。'
    ],
    retry:[
      'もう一度挑戦するのですね。今度はさらに良い結果を狙えそうです。',
      '悔しさが残っているのですね。では、もう一度いきましょう。'
    ]
  };

  const DIALOGUES={default:SHIORIKO,shioriko:SHIORIKO,'shioriko-icon':SHIORIKO,'shioriko-lolita':SHIORIKO};

  function getHomeCharacterId(){
    return homeCard?.dataset.characterId || localStorage.getItem(HOME_CHARACTER_KEY) || DEFAULT_HOME_CHARACTER;
  }
  function getDialogueSet(){
    const id=getHomeCharacterId();
    if(DIALOGUES[id]) return DIALOGUES[id];
    const c=(window.CHARACTER_LIBRARY||[]).find(x=>x.id===id);
    const base=String(c?.name||'').replace(/【[^】]+】$/u,'');
    if(base==='三船栞子') return SHIORIKO;
    return SHIORIKO;
  }
  function pick(pool){
    if(!pool?.length) return '';
    let choices=pool.filter(x=>x!==lastDialogue);
    if(!choices.length) choices=pool;
    return choices[Math.floor(Math.random()*choices.length)];
  }
  function getTimePool(set){
    const h=new Date().getHours();
    if(h>=5&&h<11) return set.morning;
    if(h>=11&&h<17) return set.daytime;
    if(h>=17&&h<22) return set.evening;
    return set.night;
  }
  function ensureBubble(){
    if(!homeCard) return null;
    let bubble=document.getElementById('homeDialogue');
    if(!bubble){
      bubble=document.createElement('div');
      bubble.id='homeDialogue';
      bubble.className='home-dialogue';
      bubble.setAttribute('role','button');
      bubble.setAttribute('tabindex','0');
      bubble.setAttribute('aria-live','polite');
      bubble.innerHTML='<span class="home-dialogue-name"></span><span class="home-dialogue-text"></span>';
      homeCard.appendChild(bubble);
    }
    return bubble;
  }
  function showLine(kind='normal'){
    const set=getDialogueSet();
    let pool=set[kind]||set.normal;
    if(kind==='normal'){
      const r=Math.random();
      if(r<.08) pool=set.rare;
      else if(r<.35) pool=getTimePool(set);
    }
    const text=pick(pool)||pick(set.normal);
    if(!text) return;
    lastDialogue=text;
    const bubble=ensureBubble();
    if(!bubble) return;
    bubble.querySelector('.home-dialogue-name').textContent=set.name;
    bubble.querySelector('.home-dialogue-text').textContent=text;
  }
  function handleHomeTap(e){
    if(e?.target?.closest('.home-dialogue')) e.preventDefault();
    const now=Date.now();
    tapTimes=tapTimes.filter(t=>now-t<4500);
    tapTimes.push(now);
    if(tapTimes.length>=5){ tapTimes=[]; showLine('rapidTap'); }
    else showLine('normal');
  }

  if(homeCard){
    homeCard.dataset.characterId=getHomeCharacterId();
    homeCard.addEventListener('click',handleHomeTap);
    homeCard.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();handleHomeTap(e);} });
  }

  window.setLoveFesHomeCharacter=function(id,imageSrc){
    if(!id) return;
    localStorage.setItem(HOME_CHARACTER_KEY,id);
    if(homeCard) homeCard.dataset.characterId=id;
    if(imageSrc&&homeImage) homeImage.src=imageSrc;
    lastDialogue='';
    showLine('normal');
  };
  window.showLoveFesHomeDialogue=function(kind){showLine(kind||'normal');};

  function getRecords(){
    try{return JSON.parse(localStorage.getItem(RECORDS_KEY)||'{}')||{};}catch(_){return {};}
  }
  function saveRecords(records){try{localStorage.setItem(RECORDS_KEY,JSON.stringify(records));}catch(_){}}
  function songKey(){
    const title=String(chart?.title||chartName?.textContent||songName?.textContent||'unknown').replace(/（.*?）/g,'').trim();
    return title||'unknown';
  }
  const RANK_VALUE={S:5,A:4,B:3,C:2,D:1};
  function calcRank(currentScore,totalNotes){
    const max=Math.max(1,totalNotes*1000);
    const rate=currentScore/max;
    if(rate>=.95) return 'S';
    if(rate>=.85) return 'A';
    if(rate>=.70) return 'B';
    if(rate>=.50) return 'C';
    return 'D';
  }
  function ensureResultHighlight(){
    if(!resultPanelEl) return null;
    let box=document.getElementById('resultHighlight');
    if(box) return box;
    box=document.createElement('div');
    box.id='resultHighlight';
    box.className='result-highlight';
    box.innerHTML='<div id="resultRank" class="result-rank">-</div><div class="result-summary"><span id="resultFullCombo" class="result-badge" hidden>FULL COMBO!</span><span id="resultNewRecord" class="result-record" hidden>NEW RECORD!</span><span id="resultHighScore" class="result-highscore">HIGH SCORE 0</span><span id="resultSong" class="result-song"></span></div>';
    const grid=resultPanelEl.querySelector('.result-grid');
    resultPanelEl.insertBefore(box,grid||resultPanelEl.firstChild?.nextSibling||null);
    return box;
  }
  function decorateResult(){
    const total=Array.isArray(chart?.notes)?chart.notes.length:(counts.perfect+counts.great+counts.good+counts.miss);
    const fullCombo=total>0&&counts.miss===0&&maxCombo===total;
    const rank=calcRank(score,total);
    const key=songKey();
    const records=getRecords();
    const prev=records[key]||{bestScore:0,bestRank:'D',fullCombo:false,maxCombo:0};
    const newRecord=score>Number(prev.bestScore||0);
    const bestScore=Math.max(Number(prev.bestScore||0),score);
    const bestRank=(RANK_VALUE[rank]||0)>(RANK_VALUE[prev.bestRank]||0)?rank:prev.bestRank;
    records[key]={bestScore,bestRank,fullCombo:!!prev.fullCombo||fullCombo,maxCombo:Math.max(Number(prev.maxCombo||0),maxCombo),updatedAt:Date.now()};
    saveRecords(records);
    ensureResultHighlight();
    const rankEl=document.getElementById('resultRank');
    const fcEl=document.getElementById('resultFullCombo');
    const nrEl=document.getElementById('resultNewRecord');
    const hsEl=document.getElementById('resultHighScore');
    const songEl=document.getElementById('resultSong');
    if(rankEl) rankEl.textContent=rank;
    if(fcEl) fcEl.hidden=!fullCombo;
    if(nrEl) nrEl.hidden=!newRecord;
    if(hsEl) hsEl.textContent=`HIGH SCORE ${bestScore.toLocaleString()}`;
    if(songEl) songEl.textContent=key;
    if(fullCombo) pendingHomeReaction='fullCombo';
    else if(newRecord) pendingHomeReaction='newRecord';
    else if(rank==='S') pendingHomeReaction='sRank';
  }

  if(typeof finishGame==='function'){
    const originalFinishGame=finishGame;
    finishGame=function(){
      const wasPlaying=playing;
      originalFinishGame();
      if(wasPlaying) decorateResult();
    };
  }

  document.getElementById('retryBtn')?.addEventListener('click',()=>{pendingHomeReaction='retry';});
  document.getElementById('resultHomeBtn')?.addEventListener('click',()=>{
    const kind=pendingHomeReaction;
    pendingHomeReaction=null;
    setTimeout(()=>showLine(kind||'normal'),0);
  });

  ensureResultHighlight();
  showLine('normal');
})();
