// Ver.0.7.3: render falling notes on a single canvas while keeping DOM targets/touch input unchanged.
(function(){
  const VERSION='0.7.3';
  let canvas=null;
  let ctx=null;
  let sprite=null;
  let geom=null;
  let geomDirty=true;
  let noteRef=null;
  let firstLiveIndex=0;

  function buildSprite(){
    if(sprite)return sprite;
    const s=document.createElement('canvas');
    s.width=96;s.height=96;
    const c=s.getContext('2d');
    const cx=48,cy=48,r=31;
    const g=c.createRadialGradient(38,34,3,cx,cy,r);
    g.addColorStop(0,'#ffffff');
    g.addColorStop(.22,'#ffffff');
    g.addColorStop(.24,'#dbeafe');
    g.addColorStop(.44,'#dbeafe');
    g.addColorStop(.46,'#60a5fa');
    g.addColorStop(.68,'#60a5fa');
    g.addColorStop(.70,'#1d4ed8');
    g.addColorStop(1,'#1d4ed8');
    c.shadowColor='rgba(96,165,250,.75)';
    c.shadowBlur=10;
    c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fillStyle=g;c.fill();
    c.shadowBlur=0;
    c.lineWidth=3;c.strokeStyle='#bfdbfe';c.stroke();
    c.beginPath();c.arc(cx,cy,18,0,Math.PI*2);c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.72)';c.stroke();
    sprite=s;
    return sprite;
  }

  function ensureCanvas(){
    if(canvas)return;
    canvas=document.createElement('canvas');
    canvas.id='noteCanvasV073';
    canvas.setAttribute('aria-hidden','true');
    Object.assign(canvas.style,{
      position:'absolute',inset:'0',zIndex:'3',pointerEvents:'none',width:'100%',height:'100%'
    });
    game.appendChild(canvas);
    ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    buildSprite();
  }

  function syncCanvasAndGeometry(){
    ensureCanvas();
    const w=Math.max(1,game.clientWidth);
    const h=Math.max(1,game.clientHeight);
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const spawn={x:w*.5,y:h*.075};
    const centerX=w*.5,centerY=h*.20,radiusX=w*.33,radiusY=h*.70;
    const targetPoints=Array.from({length:9},(_,i)=>{
      const angle=Math.PI+(Math.PI*i/8);
      return {x:centerX+Math.cos(angle)*radiusX,y:centerY-Math.sin(angle)*radiusY};
    });
    geom={w,h,spawn,targetPoints};
    geomDirty=false;
  }

  function clearCanvas(){
    if(!ctx||!geom)return;
    ctx.clearRect(0,0,geom.w,geom.h);
  }

  function resetCursorIfNeeded(){
    if(noteRef!==activeNotes){noteRef=activeNotes;firstLiveIndex=0;}
  }

  function advanceOldNotes(now){
    while(firstLiveIndex<activeNotes.length){
      const n=activeNotes[firstLiveIndex];
      if(n.finished||n.hit){firstLiveIndex++;continue;}
      const dt=n.timeMs-now;
      if(!n.missRegistered&&dt<-MISS_WINDOW)registerMiss(n);
      if(dt<-TRAIL_MS){n.finished=true;firstLiveIndex++;continue;}
      break;
    }
  }

  function drawNote(x,y,scale,missed){
    const img=buildSprite();
    const size=62*scale;
    ctx.globalAlpha=missed?.76:1;
    ctx.drawImage(img,x-size/2,y-size/2,size,size);
    ctx.globalAlpha=1;
  }

  function canvasLoop(){
    if(!playing)return;
    if(geomDirty||!geom)syncCanvasAndGeometry();
    resetCursorIfNeeded();
    const now=currentMs();
    const leadMs=1600/Number(speed.value);
    const {spawn,targetPoints,w,h}=geom;
    ctx.clearRect(0,0,w,h);
    advanceOldNotes(now);

    for(let i=firstLiveIndex;i<activeNotes.length;i++){
      const n=activeNotes[i];
      if(n.finished||n.hit)continue;
      const dt=n.timeMs-now;
      if(dt>leadMs)break;
      if(!n.missRegistered&&dt<-MISS_WINDOW)registerMiss(n);
      if(dt<-TRAIL_MS){n.finished=true;continue;}
      const progress=getNoteProgress(dt,leadMs);
      const p=targetPoints[n.lane];
      const x=spawn.x+(p.x-spawn.x)*progress;
      const y=spawn.y+(p.y-spawn.y)*progress;
      const scale=progress<=1?.45+.55*progress:1;
      drawNote(x,y,scale,n.missRegistered);
    }

    if(isSilentMode()&&now>=silentDurationMs){clearCanvas();finishGame();return;}
    rafId=requestAnimationFrame(canvasLoop);
  }

  // Keep the proven DOM targets, hitLane(), pause button and sound handling intact.
  // Only replace the falling-note renderer. No document-level touch interception.
  try{loop=canvasLoop;}catch(_){window.loop=canvasLoop;}

  const oldFinish=finishGame;
  try{
    finishGame=function(){clearCanvas();return oldFinish.apply(this,arguments);};
  }catch(_){}
  const oldStop=stopGame;
  try{
    stopGame=function(){clearCanvas();return oldStop.apply(this,arguments);};
  }catch(_){}

  window.addEventListener('resize',()=>{geomDirty=true;},{passive:true});
  window.addEventListener('orientationchange',()=>{geomDirty=true;},{passive:true});
  document.getElementById('startBtn')?.addEventListener('click',()=>{geomDirty=true;firstLiveIndex=0;});
  document.getElementById('retryBtn')?.addEventListener('click',()=>{geomDirty=true;firstLiveIndex=0;});

  const style=document.createElement('style');
  style.id='canvas-note-style-v073';
  style.textContent=`body.playing-mode #notesLayer{display:none!important}#noteCanvasV073{display:none}body.playing-mode #noteCanvasV073{display:block}`;
  document.head.appendChild(style);

  function syncVersion(){
    document.querySelectorAll('.home-version,.version-badge').forEach(el=>{const t=`Ver. ${VERSION}`;if(el.textContent!==t)el.textContent=t;});
    const head=document.querySelector('#updateBanner .update-head span:last-child');
    if(head)head.textContent=`Ver.${VERSION} アップデート`;
    const text=document.querySelector('#updateBanner .update-text');
    if(text)text.textContent='落下ノーツの描画をCanvas化し、iPhoneでのカクつきを大幅に軽減するよう改善しました。';
  }
  syncVersion();
})();
