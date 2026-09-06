// Isolated art fixture; no game bootstrap, storage reads, or player profiles.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:850,height:1000}}),errors=[];
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  await page.goto(new URL('wardrobe-preview.html',process.env.RPG_TEST_URL||'http://127.0.0.1:4187/').href);
  await page.evaluate(()=>refresh());
  for(const career of ['bulwark','vanguard','infiltrator','']){
   await page.locator('#fitting-career').selectOption(career);await page.evaluate(()=>refresh());
   for(const sex of ['male','female'])assert.equal(await page.locator('#'+sex+' [data-wear-key="uniform"]').count(),career?1:0,'career selector mounts only one uniform');
  }
  const alpha=await page.evaluate(async()=>{
   const files=new Set(['base-male','base-female']);Object.values(WEARABLE_ART).forEach(art=>['male','female'].forEach(sex=>art[sex].forEach(([file])=>files.add(file))));
   Object.values(WEARABLE_FIT_V2).forEach(art=>['male','female'].forEach(sex=>art[sex].forEach(piece=>files.add(piece.file))));
   WEARABLE_UNIFORMS.forEach(job=>['male','female'].forEach(sex=>files.add('uniform-'+job+'-'+sex)));
   ['salvager','fabricator','biologist'].forEach(job=>files.add('life-'+job));
   Object.values(WEARABLE_GRIPS).forEach(art=>files.add('../'+art.source.slice('assets/'.length,-'.webp'.length)));
   for(const catalog of [WEARABLE_HOLD_HANDS,WEARABLE_SWORD_HANDS,WEARABLE_TRIGGER_HANDS])Object.values(catalog).forEach(art=>files.add(art.file));
   // Bound decoding memory: hundreds of full-size alpha canvases in Promise.all
   // can exhaust the renderer even though the game mounts only a few layers.
   const results=[];
   for(const file of files){
    const image=new Image();image.src=WEARABLE_ROOT+file+'.webp';
    await image.decode().catch(error=>{throw new Error(file+': '+error.message);});
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);
    let empty=0,corners=0,emptyCorners=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
     const transparent=data[(y*canvas.width+x)*4+3]===0;if(transparent)empty++;
     if((x<canvas.width*.03||x>canvas.width*.97)&&(y<canvas.height*.03||y>canvas.height*.97)){corners++;if(transparent)emptyCorners++;}
    }
    results.push({file,empty:empty/(data.length/4),corners:emptyCorners/corners,width:canvas.width,height:canvas.height});
    canvas.width=0;canvas.height=0;image.src='';
   }
   return results;
  });
  // A broad backpack legitimately fills >80% of its canvas. Verify transparent
  // margins as well as substantial empty pixels, not an arbitrary 20% silhouette.
  for(const art of alpha)assert.ok(art.empty>.05&&art.corners>.95,art.file+' requires genuine alpha and clean corner margins, never a painted background');
  const supported=await page.evaluate(()=>Object.entries(WEARABLE_ART).map(([id,art])=>({id,slot:art.slot})));
  for(const {id,slot} of supported){
   await page.evaluate(async({id,slot})=>{window.wearRefs=['male','female'].map(sex=>document.getElementById(sex).querySelector('[data-wear-key="base"]'));await Promise.all(['male','female'].map(sex=>updateWearablePortrait(document.getElementById(sex),sex,{[slot]:id})));},{id,slot});
   assert.ok(await page.evaluate(({id,slot})=>['male','female'].every((sex,i)=>{const host=document.getElementById(sex);return host.querySelector('[data-wear-key="base"]')===window.wearRefs[i]&&[...host.querySelectorAll('[data-slot="'+slot+'"]')].every(n=>n.dataset.item===id&&n.complete&&n.naturalWidth>0);}),{id,slot}),id+' keeps the base and mounts decoded wear art');
  }
  await page.evaluate(()=>refresh());
  await page.locator('#vest').click();await page.locator('#shield').click();await page.evaluate(()=>refresh());
  await page.evaluate(()=>window.fixedRefs=['male','female'].map(sex=>{const host=document.getElementById(sex);return {sex,base:host.querySelector('[data-slot="base"]'),body:host.querySelector('[data-slot="body"]'),shield:host.querySelector('[data-slot="offhand"]')};}));
  for(const feet of ['boots','magboots','gravityBoots','']){
   await page.locator('[data-feet="'+feet+'"]').click();await page.evaluate(()=>refresh());
   assert.equal(await page.evaluate(()=>window.fixedRefs.every(ref=>{const host=document.getElementById(ref.sex);return ref.base===host.querySelector('[data-slot="base"]')&&ref.body===host.querySelector('[data-slot="body"]')&&ref.shield===host.querySelector('[data-slot="offhand"]');})),true,'shoe selection cannot replace the face, chest or shield');
   for(const sex of ['male','female'])assert.equal(await page.locator('#'+sex+' [data-slot="feet"]').count(),await page.evaluate(({feet,sex})=>feet?WEARABLE_FIT_V2[feet][sex].length:0,{feet,sex}));
  }
  const rapid=await page.evaluate(async()=>{const host=document.getElementById('male');const results=await Promise.all([updateWearablePortrait(host,'male',{feet:'boots'}),updateWearablePortrait(host,'male',{feet:'magboots'}),updateWearablePortrait(host,'male',{feet:'gravityBoots'})]);return {results,items:[...host.querySelectorAll('[data-slot="feet"]')].map(n=>n.dataset.item)};});
  assert.deepEqual(rapid.results,[false,false,true]);assert.deepEqual(rapid.items,['gravityBoots','gravityBoots']);
  for(const width of [360,390,520,850]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>refresh());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.ok(await page.locator('nav button').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44)));}
  assert.deepEqual(errors,[]);console.log('Wardrobe sample: '+alpha.length+' real-alpha images, both bodies, retained layers, latest-choice wins and four widths passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
