// Live introduction cut-in. Existing transparent live costumes remain untouched.
(() => {
 'use strict';
 const base='./live-group/special/';
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
  const backdrop=document.createElement('div');backdrop.className='lounge-cutin-backdrop';panel.appendChild(backdrop);
  const trio=document.createElement('div');trio.className='lounge-cutin-trio';panel.appendChild(trio);
  members.forEach((member,i)=>{
   const slot=document.createElement('div');slot.className='lounge-cutin-member member-'+i;
   const img=document.createElement('img');img.alt=member.id;img.draggable=false;
   img.src=frames[i].frames[frames[i].sequence[0]];
   slot.appendChild(img);trio.appendChild(slot);
  });
  const heading=document.createElement('div');heading.className='lounge-cutin-group';
  heading.textContent=group.name;panel.appendChild(heading);
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
