// Deterministic runtime smoke tests with real Three.js + GLTFLoader and an in-memory test GLB.
// npm install --no-save three@0.180.0 playwright
// THREE_PACKAGE=/path/to/three PLAYWRIGHT_MODULE=/path/to/playwright node tests/shioriko-3d.cjs
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),vendor=path.resolve(process.env.THREE_PACKAGE||path.join(path.dirname(require.resolve('three')),'..'));
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.glb':'model/gltf-binary'};
let mode='missing',fixture;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),name=url.pathname;
 if(name.endsWith('/shioriko-live-v1.glb')){
  if(mode==='missing'){res.writeHead(404).end();return;}
  const send=()=>res.end(mode==='invalid'?Buffer.from('not a GLB'):fixture);
  if(mode==='delayed')setTimeout(send,800);else send();return;
 }
 if(name==='/fixture.html'){
  res.setHeader('Content-Type','text/html');res.end(`<script type="importmap">{"imports":{"three":"/vendor/build/three.module.js"}}</script><main class="app-shell"><section id="homeScreen" class="app-screen"><div class="home-menu"></div></section><section id="liveScreen" class="app-screen" hidden></section></main><script src="interaction-room-v0844.js"></script><script src="shioriko-model-loader-v0852.js"></script>`);return;
 }
 const base=name.startsWith('/vendor/')?vendor:root;
 const file=path.resolve(base,'.'+(name.startsWith('/vendor/')?name.slice(7):(name==='/'?'/index.html':name)));
 if(!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,b)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(name==='/'?Buffer.from(b.toString().replace('<head>','<head><script type="importmap">{"imports":{"three":"/vendor/build/three.module.js"}}</script>')):b);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:3});
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')console.log(m.text());});page.on('request',r=>requests.push(r.url()));
 await page.addInitScript(()=>{const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);window.pendingFrames=new Set();window.requestAnimationFrame=fn=>{let id=request(t=>{pendingFrames.delete(id);fn(t);});pendingFrames.add(id);return id;};window.cancelAnimationFrame=id=>{pendingFrames.delete(id);cancel(id);};});
 await page.route('https://esm.sh/**',route=>route.fulfill({contentType:'text/javascript',body:route.request().url().includes('GLTFLoader')?`export {GLTFLoader} from '${origin}/vendor/examples/jsm/loaders/GLTFLoader.js';`:`export * from '${origin}/vendor/build/three.module.js';`}));
 const origin=`http://127.0.0.1:${server.address().port}`;
 await page.goto(origin+'/fixture.html');await page.waitForTimeout(150);
 assert(!requests.some(u=>/esm.sh|model.json|shioriko-3d-v0851/.test(u)),'no 3D asset requests on home');
 // Test-only triangle with morphs and named clips; never written to shipping assets.
 fixture=Buffer.from(await page.evaluate(async()=>{
  const T=await import('/vendor/build/three.module.js'),{GLTFExporter}=await import('/vendor/examples/jsm/exporters/GLTFExporter.js');
  const group=new T.Group();group.name='AuthoredRoot';group.position.y=.15;
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([-.3,0,0,.3,0,0,0,1.6,0],3));geometry.computeVertexNormals();
  const expressions=['Smile','Happy','Blink_L','Blink_R','Serious','Surprised','Blush','Mouth_A','Mouth_I','Mouth_U','Mouth_E','Mouth_O'];
  geometry.morphAttributes.position=expressions.map((name,i)=>{const a=geometry.attributes.position.clone();a.setX(2,.01*(i+1));return a;});
  const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:0xee8899,side:T.DoubleSide}));mesh.name='Face';mesh.morphTargetDictionary=Object.fromEntries(expressions.map((n,i)=>[n,i]));group.add(mesh);
  const animations=['Idle','Wave','Look','Dance_01'].map(n=>new T.AnimationClip(n,.12,[new T.NumberKeyframeTrack('Face.position[x]',[0,.12],[0,.01])]));
  return Array.from(new Uint8Array(await new GLTFExporter().parseAsync(group,{binary:true,animations})));
 }));
 async function open(expected){await page.locator('#homeInteractionBtn').click();await page.waitForFunction(mode=>window.__shiorikoProduction3D.mode===mode,expected);}
 async function close(strict=true){await page.locator('#interactionHomeBtn').click();await page.waitForFunction(()=>!window.__shiorikoProduction3D.rendering);assert.equal(await page.locator('canvas').count(),0);if(strict)assert.equal(await page.evaluate(()=>pendingFrames.size),0);}
 await open('fallback');assert(await page.evaluate(()=>__shiorikoProduction3D.renderer.getPixelRatio()<=1.5));
 const fps=await page.evaluate(async()=>{const r=__shiorikoProduction3D.renderer;let count=0;const render=r.render.bind(r);r.render=(...a)=>{count++;return render(...a);};await new Promise(r=>setTimeout(r,650));return count;});assert(fps>0&&fps<=21,`30fps limit: ${fps}`);
 await page.evaluate(()=>window.disposedRenderer=__shiorikoProduction3D.renderer);await close();assert.equal(await page.evaluate(()=>disposedRenderer.info.memory.geometries),0);mode='invalid';await open('fallback');await close();
 mode='production';await open('production');
 assert(await page.evaluate(()=>{const api=__shiorikoProduction3D,face=api.model.getObjectByName('Face');api.mixer.addEventListener('loop',e=>window.lastLoop=e.action.getClip().name);api.setExpression('Blink',2);const d=face.morphTargetDictionary,w=face.morphTargetInfluences;if(w[d.Blink_L]!==1||w[d.Blink_R]!==1)return false;api.setExpression('Smile',.5);if(w[d.Blink_L]!==0||w[d.Smile]!==.5)return false;if(api.setExpression('Missing'))return false;api.setExpression('Neutral');return w.every(v=>v===0)&&api.playClip('Wave',false)&&!api.playClip('Missing');}));
 await page.waitForTimeout(450);assert(await page.evaluate(()=>window.lastLoop==='Idle'));
 for(const [id,sign] of [['interactionTopViewBtn',1],['interactionBottomViewBtn',-1]]){await page.locator('#'+id).click();await page.waitForTimeout(900);assert(await page.evaluate(sign=>{const c=__shiorikoProduction3D.camera;return sign*(c.position.y-.832)>2.9&&Math.abs(c.position.z)<.12;},sign));}
 await page.locator('#interactionFrontViewBtn').click();await page.waitForTimeout(900);

 // Real pointer drag: verify unbounded vertical/horizontal orbit without camera inversion NaNs.
 const rect=await page.locator('canvas').boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+130,rect.y+rect.height/2+170);await page.mouse.up();
 await page.waitForTimeout(300);assert(await page.evaluate(()=>__shiorikoProduction3D.camera.position.toArray().every(Number.isFinite)));
 const hidden=()=>page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
 await hidden();assert.equal(await page.evaluate(()=>pendingFrames.size),0);assert.equal(await page.locator('canvas').count(),0);
 await page.evaluate(()=>{delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>__shiorikoProduction3D.mode==='production');await close();
 mode='delayed';await page.locator('#homeInteractionBtn').click();await page.waitForTimeout(100);await close();await page.waitForTimeout(1000);assert.equal(await page.locator('canvas').count(),0);
 mode='production';for(let i=0;i<3;i++){await open('production');assert.equal(await page.locator('#interactionTopViewBtn').count(),1);await close();}
 assert.deepEqual(errors,[]);
 // Full app smoke: same shipped entry point and normal navigation; no rhythm code edits.
 const requestStart=requests.length;mode='missing';await page.goto(origin+'/');
 await page.waitForFunction(()=>window.__shiorikoProduction3D);await page.waitForTimeout(300);
 assert(!requests.slice(requestStart).some(u=>/esm.sh|model.json|shioriko-3d-v0851/.test(u)));
 const before=await page.evaluate(()=>localStorage.getItem('rhythmGame.noteSpeed'));
 await open('fallback');if(process.env.SCREENSHOT)await page.screenshot({path:process.env.SCREENSHOT});await close(false);await page.locator('#homeLiveBtn').click();
 assert.equal(await page.locator('#interaction3dCanvas').count(),0);
 assert.equal(await page.evaluate(()=>__shiorikoProduction3D.rendering),false);
 assert.equal(await page.evaluate(()=>localStorage.getItem('rhythmGame.noteSpeed')),before);
 assert.deepEqual(errors,[]);console.log('PASS: lazy load, missing/corrupt fallback, real GLB, morphs, mixer/Idle, pole camera, 30fps/DPR, visibility, abort, repeated disposal.');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

