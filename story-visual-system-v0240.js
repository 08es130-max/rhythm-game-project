// Ver.0.8.240: reusable visual-novel image layer system for story backgrounds, sprites and event CGs.
(function(){
  'use strict';

  const state={background:undefined,left:undefined,right:undefined,cg:undefined};
  const registry={
    backgrounds:Object.create(null),
    characters:Object.create(null),
    cgs:Object.create(null)
  };

  function ensureUI(){
    const reader=document.getElementById('storyReader');
    if(!reader)return null;
    let stage=document.getElementById('storyVisualStage');
    if(stage)return stage;

    stage=document.createElement('div');
    stage.id='storyVisualStage';
    stage.className='story-visual-stage';
    stage.setAttribute('aria-hidden','true');
    stage.innerHTML=`
      <div class="story-visual-bg-wrap"><img id="storyVisualBg" class="story-visual-bg" alt=""></div>
      <div class="story-visual-sprite-wrap story-visual-sprite-left-wrap"><img id="storyVisualLeft" class="story-visual-sprite story-visual-left" alt=""></div>
      <div class="story-visual-sprite-wrap story-visual-sprite-right-wrap"><img id="storyVisualRight" class="story-visual-sprite story-visual-right" alt=""></div>
      <div id="storyVisualCgWrap" class="story-visual-cg-wrap"><img id="storyVisualCg" class="story-visual-cg" alt=""></div>
    `;
    reader.prepend(stage);

    if(!document.getElementById('storyVisualSystemStyle')){
      const style=document.createElement('style');
      style.id='storyVisualSystemStyle';
      style.textContent=`
        .story-reader{isolation:isolate!important}
        .story-reader>.story-visual-stage{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:transparent}
        .story-reader>.story-backdrop-title{z-index:1}
        .story-reader>.story-click-area{z-index:4}
        .story-reader>.story-message-wrap{z-index:6}
        .story-visual-bg-wrap{position:absolute;inset:0;background:linear-gradient(145deg,#10233e,#0d1729 48%,#09111f)}
        .story-visual-bg{width:100%;height:100%;object-fit:cover;display:none;opacity:0;transition:opacity .22s ease}
        .story-visual-bg.is-visible{display:block;opacity:1}
        .story-visual-sprite-wrap{position:absolute;inset:0;display:flex;align-items:flex-end;pointer-events:none}
        .story-visual-sprite-left-wrap{justify-content:flex-start;padding-left:max(2.5vw,env(safe-area-inset-left))}
        .story-visual-sprite-right-wrap{justify-content:flex-end;padding-right:max(2.5vw,env(safe-area-inset-right))}
        .story-visual-sprite{display:none;max-height:92%;max-width:43%;object-fit:contain;object-position:center bottom;opacity:0;filter:drop-shadow(0 12px 24px rgba(0,0,0,.38));transition:opacity .16s ease,transform .16s ease}
        .story-visual-left{transform:translateX(-2%)}
        .story-visual-right{transform:translateX(2%)}
        .story-visual-sprite.is-visible{display:block;opacity:1;transform:translateX(0)}
        .story-visual-cg-wrap{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#050914;z-index:3}
        .story-visual-cg-wrap.is-visible{display:flex}
        .story-visual-cg{width:100%;height:100%;object-fit:cover;display:block}
        .story-visual-cg-wrap.is-visible~.story-visual-sprite-wrap{display:none!important}
        .story-reader.has-story-visual .story-scene{opacity:0}
        @media (orientation:landscape) and (pointer:coarse){
          .story-visual-sprite{max-height:94%;max-width:41%}
          .story-visual-sprite-left-wrap{padding-left:max(4vw,env(safe-area-inset-left))}
          .story-visual-sprite-right-wrap{padding-right:max(4vw,env(safe-area-inset-right))}
        }
      `;
      document.head.appendChild(style);
    }
    return stage;
  }

  function isUrlLike(v){
    return typeof v==='string' && (/^(?:https?:|data:|blob:|\/|\.\/|\.\.\/)/.test(v) || /\.(?:png|jpe?g|webp|gif|avif|svg)(?:[?#].*)?$/i.test(v));
  }
  function resolveBackground(value){
    if(value==null)return null;
    if(typeof value==='object') value=value.src??value.key??value.id;
    if(!value)return null;
    return registry.backgrounds[value]||value;
  }
  function resolveCG(value){
    if(value==null)return null;
    if(typeof value==='object') value=value.src??value.key??value.id;
    if(!value)return null;
    return registry.cgs[value]||value;
  }
  function normalizeSlot(value,line,side){
    if(value==null)return null;
    if(typeof value==='string'){
      if(isUrlLike(value))return {src:value,key:null,expression:null};
      const expr=line?.[side+'Expression']??line?.[side+'Expr']??'default';
      return {key:value,expression:expr,src:null};
    }
    if(typeof value==='object'){
      return {
        key:value.character??value.char??value.c??value.key??value.id??null,
        expression:value.expression??value.expr??value.e??'default',
        src:value.src??value.url??null,
        alt:value.alt??''
      };
    }
    return null;
  }
  function resolveCharacter(slot){
    if(!slot)return null;
    if(slot.src)return slot.src;
    if(!slot.key)return null;
    const char=registry.characters[slot.key];
    if(!char)return null;
    if(typeof char==='string')return char;
    return char[slot.expression]||char.default||char.normal||Object.values(char)[0]||null;
  }
  function setImage(img,url){
    if(!img)return;
    if(!url){
      img.classList.remove('is-visible');
      img.removeAttribute('src');
      return;
    }
    if(img.getAttribute('src')!==url)img.src=url;
    img.classList.add('is-visible');
  }

  function applyState(){
    const reader=document.getElementById('storyReader');
    if(!ensureUI()||!reader)return;
    const bg=document.getElementById('storyVisualBg');
    const left=document.getElementById('storyVisualLeft');
    const right=document.getElementById('storyVisualRight');
    const cg=document.getElementById('storyVisualCg');
    const cgWrap=document.getElementById('storyVisualCgWrap');

    const bgUrl=resolveBackground(state.background);
    const leftUrl=resolveCharacter(state.left);
    const rightUrl=resolveCharacter(state.right);
    const cgUrl=resolveCG(state.cg);

    setImage(bg,bgUrl);
    setImage(left,leftUrl);
    setImage(right,rightUrl);
    setImage(cg,cgUrl);
    cgWrap?.classList.toggle('is-visible',!!cgUrl);
    reader.classList.toggle('has-story-visual',!!(bgUrl||leftUrl||rightUrl||cgUrl));
  }

  function renderLine(line){
    ensureUI();
    if(!line||typeof line!=='object')return;

    if(Object.prototype.hasOwnProperty.call(line,'bg'))state.background=line.bg;
    else if(Object.prototype.hasOwnProperty.call(line,'background'))state.background=line.background;

    if(Object.prototype.hasOwnProperty.call(line,'left'))state.left=normalizeSlot(line.left,line,'left');
    else if(Object.prototype.hasOwnProperty.call(line,'l'))state.left=normalizeSlot(line.l,line,'left');

    if(Object.prototype.hasOwnProperty.call(line,'right'))state.right=normalizeSlot(line.right,line,'right');
    else if(Object.prototype.hasOwnProperty.call(line,'r'))state.right=normalizeSlot(line.r,line,'right');

    if(Object.prototype.hasOwnProperty.call(line,'cg'))state.cg=line.cg;
    else if(Object.prototype.hasOwnProperty.call(line,'eventCG'))state.cg=line.eventCG;

    applyState();
  }

  function reset(){
    state.background=undefined;state.left=undefined;state.right=undefined;state.cg=undefined;
    const reader=document.getElementById('storyReader');
    reader?.classList.remove('has-story-visual');
    ['storyVisualBg','storyVisualLeft','storyVisualRight','storyVisualCg'].forEach(id=>setImage(document.getElementById(id),null));
    document.getElementById('storyVisualCgWrap')?.classList.remove('is-visible');
  }

  function registerBackground(key,url){if(key&&url)registry.backgrounds[key]=url;return api;}
  function registerCG(key,url){if(key&&url)registry.cgs[key]=url;return api;}
  function registerCharacter(character,expression,url){
    if(!character||!url)return api;
    if(!registry.characters[character]||typeof registry.characters[character]==='string')registry.characters[character]=Object.create(null);
    registry.characters[character][expression||'default']=url;
    return api;
  }
  function registerCharacterSet(character,map){
    if(character&&map&&typeof map==='object')registry.characters[character]={...(registry.characters[character]||{}),...map};
    return api;
  }

  const api={
    version:'0.8.240',
    registry,state,
    ensureUI,renderLine,reset,
    registerBackground,registerCG,registerCharacter,registerCharacterSet
  };
  window.LOVEFES_STORY_VISUALS=api;
  ensureUI();
})();