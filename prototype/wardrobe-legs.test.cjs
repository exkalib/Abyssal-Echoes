// Whole-trouser fit regression: test physical geometry, not a fixed number of
// old leg-tube sprites. Source admission and actual RGBA checks are separate.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {simulation}=require('./combat-balance.cjs');
const {wearableSpecification}=require('./wardrobe.js');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {ids,sourcePixels,projected,polygon,inside,normalized,plane}=require('./wardrobe-trousers.test.cjs');
const {ITEMS}=simulation().a;
const sexes=['male','female'],careers=['','bulwark','vanguard','infiltrator'];
const near=(a,b,label,tolerance=.02)=>assert.ok(Math.abs(a-b)<=tolerance,label+': '+a+' versus '+b);
const pointNear=(a,b,label)=>a.forEach((n,i)=>near(n,b[i],label+' axis '+i));
const front=specs=>specs.filter(s=>s.slot==='legs'&&s.z>1);
const at=(parts,art,p)=>parts.filter(s=>inside(polygon(s),plane(art,p)));
const world=(spec,p)=>projected(spec,normalized(spec.art,p));
function planeWorld(spec,[x,y]){
 const [a,b,c,d]=spec.matrix;return [a*x*5.12+c*y*7.68+spec.x*5.12,b*x*5.12+d*y*7.68+spec.y*7.68];
}
// Independent nonzero winding test, including compound polygons joined with
// doubled zero-area bridges. Do not flatten these back into a bounding box.
function clipVisible(spec,x,y){
 if(!spec.clip||spec.clip==='none')return x>=0&&x<=100&&y>=0&&y<=100;
 const points=polygon(spec);let winding=0;
 for(let i=0;i<points.length;i++){
  const [a,b]=points[i],[c,d]=points[(i+1)%points.length],cross=(c-a)*(y-b)-(x-a)*(d-b);
  if(b<=y&&d>y&&cross>0)winding++;
  else if(b>y&&d<=y&&cross<0)winding--;
 }
 return winding!==0;
}
// These belt rectangles are independently identified in the original uniform
// images, in 512×768 source pixels. They are not taken from runtime cut values.
const oldBelts={bulwark:{male:[195,307,313,329],female:[196,280,310,299]},vanguard:{male:[190,308,319,336],female:[196,298,315,322]},infiltrator:{male:[196,317,312,333],female:[198,301,311,316]}};
function assertOriginalReplacement(before,during,sex,career,feet,label){
 const other=during.filter(s=>s.slot!=='legs');assert.equal(other.length,before.length,label+' no extra identity or clothing layers');
 for(const previous of before){
  const current=other.find(s=>s.key===previous.key);assert.ok(current,label+' original layer retained');
  if(!['base','uniform'].includes(previous.slot)){assert.deepEqual(current,previous,label+' other equipment, face and posed forearms cannot change');continue;}
  const omitClip=({clip,...rest})=>rest;
  assert.deepEqual(omitClip(current),omitClip(previous),label+' source, key, item, transform, depth and identity remain exact; only lower-body clip may differ');
  for(let y=1.17;y<100;y+=2)for(let x=1.31;x<100;x+=2){
   const protectedArea=y<33||(y<57&&(x<30.5||x>69.5))||(!feet&&previous.slot==='base'&&y>90);
   if(protectedArea)assert.equal(clipVisible(current,x,y),clipVisible(previous,x,y),label+' clipping changed face/shoulder/hand/original-foot area '+x+','+y);
   if(y>59&&y<86&&x>10&&x<90)assert.equal(clipVisible(current,x,y),false,label+' original trousers remain visible around new pants');
  }
  if(previous.slot==='base')for(let y=50.3;y<86;y+=4)for(let x=35.2;x<65;x+=4)assert.equal(clipVisible(current,x,y),false,label+' old base pants/skin cannot remain under the equipment sides');
  const belt=previous.slot==='uniform'&&oldBelts[career]?.[sex];
  if(belt)for(let y=belt[1]+.4;y<belt[3];y+=3)for(let x=belt[0]+.3;x<belt[2];x+=3)assert.equal(clipVisible(current,x/5.12,y/7.68),false,label+' original high career belt must not show above the new waistband');
 }
}
let seams=0,states=0;
for(const id of ids)for(const sex of sexes){
 const art=WEARABLE_FIT_V2[id]?.trousers;assert.ok(art,id+' is complete waist-to-ankle artwork');
 const specs=wearableSpecification(sex,{legs:id}),parts=specs.filter(s=>s.slot==='legs'),bands=front(specs),rear=parts.filter(s=>s.z<1);
 assert.ok(bands.length&&rear.length,id+' both front clothing and rear lining exist');
 assert.equal(new Set(parts.map(s=>s.src)).size,1,id+' every fitting band uses the SAME complete source');
 for(const part of parts){
  assert.ok(Number.isInteger(part.z)&&part.z!==1,id+' rear < original body < front are integer depth roles');
  assert.ok(part.matrix.length===4&&part.matrix.every(Number.isFinite)&&part.matrix[0]>0&&part.matrix[3]>0,id+' nonmirrored finite source transform');
  assert.ok(part.matrix[0]*part.matrix[3]-part.matrix[1]*part.matrix[2]>0,id+' cannot mirror the two legs');
  assert.ok(!part.rotation,id+' matrix cannot receive a second rotation');
  assert.equal(part.art,art,id+' all bands use the whole original art, not half-image bounds');
 }
 for(let side=0;side<2;side++){
  const knee=at(bands,art,art.knees[side]);assert.equal(knee.length,1,id+' one visible solid knee');
  const piece=knee[0],[a,b,c,d]=piece.matrix;
  near(a,d,id+' knee remains equal-scale',1e-9);near(b,0,id+' knee cannot shear',1e-9);near(c,0,id+' knee cannot shear',1e-9);
  near(piece.sx,piece.sy,id+' advertised knee scaling matches actual matrix',1e-9);
  const actual=world(piece,art.knees[side]);
  near(actual[0],(side?(sex==='female'?62.2:62.5):(sex==='female'?37.8:37.5))*5.12,id+' actual body knee X');
  near(actual[1],(sex==='female'?68.8:70.4)*7.68,id+' actual body knee Y');
  const shin=at(bands,art,art.ankles[side]);assert.equal(shin.length,1,id+' native ankle is fully present without shoes');
  const ankle=world(shin[0],art.ankles[side]);
  near(ankle[1],(sex==='female'?88.4:88.9)*7.68,id+' full ankle reaches the default boot cuff');
  assert.ok(side?ankle[0]>60*5.12&&ankle[0]<69*5.12:ankle[0]>31*5.12&&ankle[0]<40*5.12,id+' ankle stays on its own anatomical side');
 }
 // Every source-space boundary must coincide across the WHOLE edge, including
 // clip membership. A matching contact label alone cannot satisfy this.
 for(const y of [art.crotch[1],...art.kneeBand])for(let sample=0;sample<=10;sample++){
  const p=[art.width*(.01+.98*sample/10),y],touching=at(bands,art,p);
  assert.equal(touching.length,2,id+' full seam point is covered by both adjacent clips');
  pointNear(world(touching[0],p),world(touching[1],p),id+' '+sex+' source seam '+y+'/'+sample);seams++;
 }
 for(const career of careers)for(const weapon of ['', 'blade','rifle','gravLance']){
  const equipment={weapon,hands:'workGloves',module:'module_general_5'},snapshot=JSON.stringify(equipment);
  const before=wearableSpecification(sex,equipment,career,['biologist']);
  const during=wearableSpecification(sex,{...equipment,legs:id},career,['biologist']);
  assertOriginalReplacement(before,during,sex,career,null,id+' '+sex+' '+career+' '+weapon);
  for(const p of [...art.knees,...art.ankles]){
   const original=at(bands,art,p),current=at(front(during),art,p);
   assert.equal(current.length,1);assert.deepEqual(current[0],original[0],id+' career may tuck the pelvis only, never shift rigid knees or shorten shins');
  }
  assert.deepEqual(wearableSpecification(sex,equipment,career,['biologist']),before,id+' exact unequip restore');
  assert.equal(JSON.stringify(equipment),snapshot,id+' no game equipment mutation');states++;
 }
 // A chest may tuck the flexible waist but must never move either knee/shin or
 // replace/repaint the independent chest, shoulders, collar and original face.
 for(const body of ['vest','starShell','body_general_5']){
  const chest=wearableSpecification(sex,{body}),both=wearableSpecification(sex,{body,legs:id});
  assertOriginalReplacement(chest,both,sex,'',null,id+' '+body+' original chest/neck/shoulder protection');
  for(const p of [...art.knees,...art.ankles]){
   const a=at(bands,art,p),b=at(front(both),art,p);assert.equal(a.length,1);assert.equal(b.length,1);
   assert.deepEqual(a[0],b[0],id+' chest may tuck waist only, not refit knees or ankles');
  }
 }
}
console.log('Whole-leg fitting: '+ids.length+' items × 2 bodies; '+seams+' full-width seam samples, rigid knees, native ankles and '+states+' unrelated outfit states passed.');
const feetIds=Object.entries(ITEMS).filter(([,item])=>item.type==='equip'&&item.slot==='feet').map(([id])=>id);
function cssWorld(spec,[x,y]){
 const p=[x*5.12,y*7.68],o=spec.pivotPoint.map((v,i)=>v*(i?7.68:5.12));
 const angle=(spec.rotation||0)*Math.PI/180,dx=(p[0]-o[0])*spec.sx,dy=(p[1]-o[1])*spec.sy;
 return [spec.x*5.12+o[0]+dx*Math.cos(angle)-dy*Math.sin(angle),spec.y*7.68+o[1]+dx*Math.sin(angle)+dy*Math.cos(angle)];
}
for(const id of ids)for(const sex of sexes)for(const feet of feetIds){
 const art=WEARABLE_FIT_V2[id].trousers,baseline=wearableSpecification(sex,{legs:id}),worn=wearableSpecification(sex,{legs:id,feet});
 const original=front(baseline),current=front(worn);
 const shin=original.find(s=>inside(polygon(s),plane(art,art.ankles[0]))),changed=current.find(s=>s.key===shin.key);
 assert.ok(changed,id+' actual shin band remains mounted');
 for(const piece of baseline.filter(s=>s.slot==='legs')){
  const after=worn.find(s=>s.key===piece.key);assert.ok(after);
  const omitClip=({clip,...rest})=>rest;
  assert.deepEqual(omitClip(after),omitClip(piece),id+' '+feet+' footwear cannot shorten, translate or distort any trouser segment');
  if(piece!==shin)assert.equal(after.clip,piece.clip,id+' shoes cannot cut pelvis/thigh/knee');
 }
 const actualEdge=polygon(changed).slice(3,-1).map(p=>planeWorld(changed,p));
 for(const boot of worn.filter(s=>s.slot==='feet'&&s.z>1)){
  const lip=polygon(boot).slice(0,-2).map(p=>cssWorld(boot,p));
  for(const p of lip){
   const target=[p[0],p[1]+.35*7.68];
   assert.ok(actualEdge.some(q=>Math.hypot(q[0]-target[0],q[1]-target[1])<.02),id+' '+feet+' pants hem must follow EVERY real curved front-cuff sample, not a flat/shallow cut');
  }
 }
 assert.deepEqual(wearableSpecification(sex,{legs:id}),baseline,id+' removing '+feet+' restores exact unclipped full length');
}
console.log('Trouser/boot contacts: '+ids.length*sexes.length*feetIds.length+' combinations follow actual front-cuff curves without compressing shins; unwear restores full pants.');

// Optional real-DOM check: independent isolated browser, never the player's tab.
// RPG_TEST_URL=http://127.0.0.1:4191/ node prototype/wardrobe-legs.test.cjs --browser
if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:900,height:1000}});
  await page.goto(new URL('wardrobe-preview.html',process.env.RPG_TEST_URL||'http://127.0.0.1:4191/').href);
  const failures=await page.evaluate(async({ids,careers,oldBelts})=>{
   const failures=[];
   const originalLoad=loadWearableSource;
   loadWearableSource=src=>originalLoad(src).catch(error=>{throw Error('Runtime preload failed for '+src+': '+error.message);});
   const decode=async host=>{
    // The renderer predecodes its cache, then changes mounted img requests.
    // Wait for the actual presentation frame before examining reused nodes;
    // do not retry or swallow any corrupt-resource/decode error.
    await new Promise(resolve=>requestAnimationFrame(resolve));
    await Promise.all([...host.querySelectorAll('img')].map(image=>image.decode().catch(error=>{throw Error(image.dataset.wearKey+' failed to decode '+image.getAttribute('src')+' (current '+image.currentSrc+', complete '+image.complete+', width '+image.naturalWidth+'): '+error.message);})));
   };
   const stableHtml=node=>{const copy=node.cloneNode();if(['base','uniform'].includes(copy.dataset.slot))copy.style.clipPath='';return copy.outerHTML;};
   function raster(node){
    const c=document.createElement('canvas');c.width=512;c.height=768;const ctx=c.getContext('2d',{willReadFrequently:true}),clip=getComputedStyle(node).clipPath;
    if(clip!=='none'){
     if(!clip.startsWith('polygon('))throw Error('Unexpected actual portrait clip '+clip);
     const p=new Path2D(),points=clip.slice(8,-1).split(',').map(s=>s.trim().split(/\s+/).map(parseFloat));
     points.forEach(([x,y],i)=>{if(i)p.lineTo(x*5.12,y*7.68);else p.moveTo(x*5.12,y*7.68);});p.closePath();ctx.clip(p);
    }
    // Only original base/uniform layers use this raster path. They retain the
    // exact source and full body frame; their unchanged CSS is checked above.
    ctx.drawImage(node,0,0,512,768);return ctx.getImageData(0,0,512,768).data;
   }
   for(const sex of ['male','female'])for(const career of careers)for(const equipment of [{},{weapon:'blade',hands:'workGloves'}]){
    const host=document.getElementById(sex);
    await updateWearablePortrait(host,sex,equipment,career);
    await decode(host);
    const fixed=[...host.children].map(node=>({node,html:node.outerHTML,stable:stableHtml(node),pixels:['base','uniform'].includes(node.dataset.slot)?raster(node):null}));
    for(const id of ids){
     await updateWearablePortrait(host,sex,{...equipment,legs:id},career);
     await decode(host);
     const specs=wearableSpecification(sex,{...equipment,legs:id},career);
     const base=host.querySelector('[data-wear-key="base"]'),baseZ=Number(getComputedStyle(base).zIndex);
     for(const node of host.querySelectorAll('[data-slot="legs"]')){
      const spec=specs.find(s=>s.key===node.dataset.wearKey),style=getComputedStyle(node),z=Number(style.zIndex);
      if(!Number.isInteger(z)||(node.dataset.wearKey.endsWith('-rear')?z>=baseZ:z<=baseZ))failures.push(id+' '+sex+' invalid effective z-index '+style.zIndex);
      if(!node.complete||!node.naturalWidth)failures.push(id+' undecoded source');
      const matrix=new DOMMatrix(style.transform);
      for(const [actual,expected] of [[matrix.a,spec.matrix[0]],[matrix.b,spec.matrix[1]],[matrix.c,spec.matrix[2]],[matrix.d,spec.matrix[3]]])if(Math.abs(actual-expected)>.00001)failures.push(id+' CSS matrix differs from specification');
     }
     for(const previous of fixed){
      const {node,stable,pixels}=previous;
      if(!node.isConnected||node.parentElement!==host||stableHtml(node)!==stable){failures.push(id+' '+sex+' equip altered source, transform, identity or hand DOM');continue;}
      if(!pixels)continue;
      const after=raster(node),slot=node.dataset.slot,belt=slot==='uniform'&&oldBelts[career]?.[sex];let invalid='';
      for(let y=0;y<768&&!invalid;y++)for(let x=0;x<512;x++){
       const nx=(x+.5)/5.12,ny=(y+.5)/7.68,p=(y*512+x)*4;
       const protectedArea=ny<33||(ny<57&&(nx<30.5||nx>69.5))||(slot==='base'&&ny>90);
       if(protectedArea&&[0,1,2,3].some(ch=>Math.abs(after[p+ch]-pixels[p+ch])>2)){invalid='changed actual face/shoulder/hand/original-foot pixels '+x+','+y;break;}
       if((ny>59&&ny<86&&nx>10&&nx<90)||(belt&&x>belt[0]&&x<belt[2]&&y>belt[1]&&y<belt[3]))if(after[p+3]>2){invalid='left old trouser/high-belt pixels '+x+','+y;break;}
      }
      if(invalid)failures.push(id+' '+sex+' '+career+' '+slot+' '+invalid);
     }
     await updateWearablePortrait(host,sex,equipment,career);
     if(host.querySelector('[data-slot="legs"]')||!fixed.every(({node,html})=>node.parentElement===host&&node.outerHTML===html))failures.push(id+' '+sex+' unequip left stale layers or changed the original body/hand');
    }
   }
   return failures;
  },{ids,careers,oldBelts});
  assert.deepEqual(failures,[]);console.log('Leg real DOM: all 176 bare/held equip-unwear cycles preserve sources, transforms, face/shoulder/hand/foot pixels and nodes; remove original trousers/high belts; restore exact original clips on unwear.');
  if(process.argv.includes('--capture')){
   const output=path.resolve('output/wardrobe-legs-v11-details');fs.mkdirSync(output,{recursive:true});
   await page.evaluate(()=>{const stage=document.createElement('div');stage.id='leg-review-detail';stage.style.cssText='position:fixed;left:0;top:0;width:720px;height:680px;background:#142530;z-index:20000;overflow:hidden';document.body.append(stage);});
   const captureSexes=process.argv.includes('--capture-female')?['female']:sexes;
   for(const career of careers.filter(Boolean))for(const sex of captureSexes)for(const id of ids){
    await page.evaluate(async({career,sex,id})=>{
     const host=document.getElementById(sex);await updateWearablePortrait(host,sex,{legs:id},career);
     const clone=host.cloneNode(true);clone.removeAttribute('id');clone.style.cssText='position:absolute;width:720px;height:1080px;max-width:none;aspect-ratio:2/3;left:0;top:-400px;transform:none;margin:0;overflow:visible';
     document.getElementById('leg-review-detail').replaceChildren(clone);
     await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
    },{career,sex,id});
    await page.locator('#leg-review-detail').screenshot({path:path.join(output,career+'-'+id+'-'+sex+'.png'),animations:'disabled'});
   }
   console.log('Captured '+3*captureSexes.length*ids.length+' current-runtime lower-body closeups in '+output);
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
