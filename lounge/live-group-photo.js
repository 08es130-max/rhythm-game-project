// Three-member live portrait: special illustration takes precedence over generated collage.
(() => {
 'use strict';
 const specialsBase='./live-group/special/';
 let active=null,serial=0;
 const keyOf=ids=>[...ids].sort().join('-');
 const loadImage=src=>new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;
 });
 function bounds(img){
  const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const data=ctx.getImageData(0,0,c.width,c.height).data;
  let left=c.width,right=-1,top=c.height,bottom=-1;
  for(let y=0;y<c.height;y+=2)for(let x=0;x<c.width;x+=2){
   if(data[(y*c.width+x)*4+3]>70){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
  }
  return right<0?{x:0,y:0,w:c.width,h:c.height}:{x:left,y:top,w:right-left+2,h:bottom-top+2};
 }
 async function show(members,frames){
  hide();const ticket=++serial;
  const ids=members.map(a=>a.id),key=keyOf(ids);
  const panel=document.createElement('div');panel.className='lounge-group-photo';
  panel.setAttribute('aria-label',ids.join('・')+'のライブ集合写真');
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=350;
  panel.appendChild(canvas);document.body.appendChild(panel);active=panel;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const grad=ctx.createLinearGradient(0,0,900,350);grad.addColorStop(0,'#26396d');grad.addColorStop(.55,'#6d5aa5');grad.addColorStop(1,'#bb75b5');
  ctx.fillStyle=grad;ctx.fillRect(0,0,900,350);
  ctx.fillStyle='rgba(255,255,255,.13)';
  for(let i=0;i<16;i++){ctx.beginPath();ctx.arc((i*137+55)%900,(i*73+25)%350,8+i%4*6,0,Math.PI*2);ctx.fill()}
  const special=await loadImage(specialsBase+key+'.png').catch(()=>null);
  if(ticket!==serial||active!==panel)return;
  if(special){ctx.clearRect(0,0,900,350);ctx.drawImage(special,0,0,900,350);return}
  const images=await Promise.all(frames.map(f=>loadImage(f.frames[f.sequence[0]]).catch(()=>null)));
  if(ticket!==serial||active!==panel)return;
  // One shared canvas, with overlapping figures rather than three separate image cards.
  const positions=[{x:35,y:25,w:315,h:310},{x:295,y:0,w:315,h:335},{x:560,y:25,w:305,h:310}];
  for(const i of [0,2,1]){
   const img=images[i];if(!img)continue;
   const b=bounds(img),p=positions[i],scale=Math.min(p.w/b.w,p.h/b.h);
   const w=b.w*scale,h=b.h*scale;
   ctx.drawImage(img,b.x,b.y,b.w,b.h,p.x+(p.w-w)/2,p.y+p.h-h,w,h);
  }
  ctx.fillStyle='rgba(20,25,60,.52)';ctx.fillRect(0,310,900,40);
  ctx.font='bold 19px system-ui';ctx.fillStyle='#fff';ctx.textAlign='center';
  ctx.fillText('SPECIAL LIVE',450,337);
 }
 function hide(){serial++;if(active){active.remove();active=null}}
 window.LOUNGE_GROUP_PHOTO={show,hide};
})();
