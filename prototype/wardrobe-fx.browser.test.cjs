// Isolated real game context with synthetic progress; no player's profile/save.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.WARDROBE_FX_OUTPUT;
(async()=>{
 if(output)fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
   const page=await browser.newPage({viewport}),errors=[];page.setDefaultTimeout(15000);
   page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
   await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
   // Injection also permits running before the integration hook is committed.
   if(!await page.evaluate(()=>typeof syncWardrobeEffects==='function'))await page.addScriptTag({path:path.join(__dirname,'wardrobe-fx.js')});
   await page.addStyleTag({path:path.join(__dirname,'wardrobe-fx.css')});
   await page.evaluate(()=>{
    prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.flags.braceletUnlocked=true;state.sound=false;state.music=false;
    state.tab='bag';state.bagView='equipment';state.bagSel='body';state.playerAppearance='male';
    state.player.equip={body:'body_general_5',legs:'legs_general_5',feet:'feet_general_5',back:'back_general_5',module:'module_general_5',head:'head_general_5',hands:'hands_general_5',implant:'implant_general_5',offhand:'citadelShield',weapon:'voidBlade'};
    document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');render();
   });
   const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();
   await page.evaluate(()=>{
    window.fxRig=document.querySelector('.doll-wearable');window.fxEquip={...P().equip};window.fxSpecs=wearableSpecification(state.playerAppearance,fxEquip,careerRecord('main')?.id);
    window.fxLayers=[...fxRig.querySelectorAll('[data-wear-key]')].map(node=>({node,html:node.outerHTML}));
    syncWardrobeEffects(fxRig,{gender:state.playerAppearance,equipment:fxEquip,specs:fxSpecs});
   });
   await page.waitForSelector('[data-wear-fx]');
   const stable=()=>page.evaluate(()=>fxLayers.every(({node,html})=>node.isConnected&&node.outerHTML===html));
   assert.equal(await stable(),true,'sync cannot mutate existing art nodes/styles');
   const count=await page.locator('.wardrobe-fx').count();assert.ok(count>=11&&count<=16);
   assert.ok(await page.locator('.wardrobe-fx .fx-mote,.wardrobe-fx .fx-wing-particle').count()<=40,'high quality respects the shared live-particle budget');
   assert.ok(await page.locator('.wardrobe-fx *').count()<=96,'effect DOM also has a hard visual/complexity ceiling');
   assert.equal(await page.locator('[data-wear-fx][data-wear-key]').count(),0);
   assert.equal(await page.locator('[data-fx-kind="wing"]').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).zIndex==='0')),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   // Read two live CSS frames, not two screenshots of a static color filter.
   const frame=()=>page.locator('.wardrobe-fx').evaluateAll(ns=>ns.flatMap(n=>[...n.querySelectorAll('.fx-source,.fx-mote,.fx-wing-trace,.fx-wing-particle')].map(x=>({kind:n.dataset.fxKind,opacity:getComputedStyle(x).opacity,transform:getComputedStyle(x).transform,dash:getComputedStyle(x).strokeDashoffset}))));
   // Always composite real frames, including runs without an output directory;
   // headless Chromium may defer painting when only computed styles are read.
   await page.screenshot(output?{path:path.join(output,'fx-'+viewport.width+'-frame-a.png')}:{});const first=await frame();
   await page.waitForTimeout(420);const second=await frame();assert.notDeepEqual(second,first,'time must change actual animation properties');
   for(const kind of ['core','leg','thrust','orbit','wing','sensor','chip','shield'])assert.notDeepEqual(second.filter(x=>x.kind===kind),first.filter(x=>x.kind===kind),kind+' has real live motion');
   assert.equal(await page.locator('.wardrobe-fx[data-fx-kind="hand"]').count(),0,'shared renderer never duplicates hand/cuff/grip effects');
   await page.screenshot(output?{path:path.join(output,'fx-'+viewport.width+'-frame-b.png')}:{});
   // Repeated state reconciliation reuses effects and never accumulates nodes.
   await page.evaluate(()=>{window.fxNodes=[...fxRig.querySelectorAll('[data-wear-fx]')];for(let i=0;i<30;i++)syncWardrobeEffects(fxRig,{equipment:fxEquip,specs:fxSpecs});});
   assert.equal(await page.locator('.wardrobe-fx').count(),count);assert.equal(await page.evaluate(()=>fxNodes.every(n=>n.isConnected)),true);assert.equal(await stable(),true);
   await page.evaluate(()=>fxRig.dataset.fxQuality='low');await page.waitForFunction(()=>[...fxRig.querySelectorAll('[data-wear-fx]')].every(n=>n.dataset.fxQuality==='low'));
   assert.equal(await page.locator('.wardrobe-fx .fx-mote').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).display==='none')),true);
   await page.evaluate(()=>fxRig.dataset.fxQuality='off');await page.waitForFunction(()=>!fxRig.querySelector('[data-wear-fx]'));assert.equal(await stable(),true);
   await page.evaluate(()=>fxRig.dataset.fxQuality='high');await page.waitForSelector('[data-wear-fx]');
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>[...document.querySelectorAll('.fx-wing-trace')].every(n=>getComputedStyle(n).opacity==='0.3'));
   const reducedA=await frame();await page.waitForTimeout(180);assert.deepEqual(await frame(),reducedA,'reduced motion freezes every effect');
   assert.equal(await page.locator('.wardrobe-fx').evaluateAll(ns=>ns.flatMap(n=>n.getAnimations({subtree:true})).length),0,'reduced motion must stop, not only hide, animations');
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.evaluate(()=>fxRig.hidden=true);await page.waitForFunction(()=>!fxRig.querySelector('[data-wear-fx]'));
   await page.evaluate(()=>fxRig.hidden=false);await page.waitForSelector('[data-wear-fx]');assert.equal(await page.locator('.wardrobe-fx').count(),count);
   await page.evaluate(()=>{window.fxHostTransform=fxRig.style.transform;fxRig.style.transform='translateX(200vw)';});await page.waitForFunction(()=>!fxRig.querySelector('[data-wear-fx]'));
   await page.evaluate(()=>fxRig.style.transform=fxHostTransform);await page.waitForSelector('[data-wear-fx]');assert.equal(await page.locator('.wardrobe-fx').count(),count,'re-entering the viewport restores one bounded effect set');
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('.wardrobe-fx').count(),0,'page visibility event clears dormant effects');
   await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForSelector('[data-wear-fx]');
   await page.evaluate(()=>syncWardrobeEffects(fxRig,{equipment:{},specs:fxSpecs}));assert.equal(await page.locator('.wardrobe-fx').count(),0,'unequipped items leave no emitters');assert.equal(await stable(),true);
   await page.evaluate(()=>{syncWardrobeEffects(fxRig,{equipment:fxEquip,specs:fxSpecs});fxRig.remove();});await page.waitForFunction(()=>!fxRig.querySelector('[data-wear-fx]'));
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Wardrobe FX browser: 360/390/412px real eight-class animation frames, immutable art, stable reuse, bounded nodes, quality switching, reduced motion, hide/resume and detach/unequip cleanup passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
