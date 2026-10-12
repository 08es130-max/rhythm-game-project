// Live introduction cut-in. Existing transparent live costumes remain untouched.
(() => {
 'use strict';
 const base='./live-group/special/';
 const colors={ayumu:'#ed7d95',kasumi:'#f8df54',shizuku:'#91c7df',karin:'#34569c',ai:'#f5a337',kanata:'#a78ac7',setsuna:'#df273e',emma:'#80c36a',rina:'#a6a8ae',shioriko:'#38a68e',mia:'#b4b8c2',lanzhu:'#ef9bc5'};
 let active=null,token=0;
 const keyOf=ids=>[...ids].sort().join('-');
 const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
 const hash=s=>[...s].reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,7);
 const namesCute=['Blooming Hearts','Sugar Prism','Twinkle Palette','Dreamy Bouquet','Pastel Harmony','Petit Étoile','Lovely Chime','Rainbow Macaron'];
 const namesCool=['Stellar Pulse','Luminous Edge','Nova Resonance','Crystal Beat','Midnight Aurora','Radiant Axis','Vivid Voltage','Celestial Code'];
 function groupName(ids){
  const key=keyOf(ids),n=hash(key),cool=['setsuna','karin','mia','lanzhu','shioriko'].filter(id=>ids.includes(id)).length>=2;
  const list=cool?namesCool:namesCute;
  return {name:list[n%list.length],cool};
 }
 function show(members,frames){
  hide();const ticket=++token;
  const ids=members.map(a=>a.id),key=keyOf(ids),group=groupName(ids);
  const panel=document.createElement('section');
  panel.className='lounge-group-cutin '+(group.cool?'is-cool':'is-cute');
  panel.setAttribute('aria-label',group.name+' ライブ開始');
  const backdrop=document.createElement('div');backdrop.className='lounge-cutin-backdrop';ids.forEach((id,i)=>backdrop.style.setProperty('--color'+i,colors[id]||'#9583c5'));panel.appendChild(backdrop);
  const trio=document.createElement('div');trio.className='lounge-cutin-trio';panel.appendChild(trio);
  members.forEach((member,i)=>{
   const slot=document.createElement('div');slot.className='lounge-cutin-member member-'+i;
   const img=document.createElement('img');img.alt=member.id;img.draggable=false;
   img.src=frames[i].frames[frames[i].sequence[0]];
   slot.appendChild(img);trio.appendChild(slot);
  });
  const effects=document.createElement('div');effects.className='lounge-cutin-effects';effects.setAttribute('aria-hidden','true');
  const symbols=['✦','♪','✧','♡','✿','♫','✦','❀','✧','♪','♡','✦','♫','✿','✧','♡','♪','✦'];
  symbols.forEach((symbol,i)=>{const el=document.createElement('span');el.className='lounge-cutin-spark';el.textContent=symbol;
   el.style.setProperty('--x',((i*37+11)%94+3)+'%');el.style.setProperty('--y',((i*29+17)%74+18)+'%');
   el.style.setProperty('--delay',(i%7*.13)+'s');el.style.setProperty('--size',(14+i%5*6)+'px');effects.appendChild(el)});
  panel.appendChild(effects);
  const heading=document.createElement('div');heading.className='lounge-cutin-group';
  heading.textContent=group.name;
  const ornament=document.createElement('div');ornament.className='lounge-cutin-ornament';ornament.setAttribute('aria-hidden','true');ornament.textContent=group.cool?'✦  ◆  ✦':'✿  ♡  ✿';
  heading.appendChild(ornament);panel.appendChild(heading);
  document.body.appendChild(panel);active=panel;
  // A dedicated trio illustration can replace the automatic montage without changing timing.
  loadImage(base+key+'.png').then(img=>{
   if(ticket!==token||active!==panel)return;
   trio.classList.add('has-special');
   trio.replaceChildren(img);img.alt=ids.join('・');img.className='lounge-cutin-special';
  }).catch(()=>{});
 }
 function hide(){token++;active?.remove();active=null}
 window.LOUNGE_GROUP_PHOTO={show,hide,groupName};
})();
