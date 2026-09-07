// Fresh browser storage only: real equip handlers, both production portraits.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.WARDROBE_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'hand-fx-'));
const suits={nanoWeaveGloves:'nanoSuit',phaseGrip:'starShell',hands_specialist_5:'exoShell',hands_general_3:'body_general_3',hands_general_4:'body_general_4',hands_general_5:'body_general_5'};
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{if(e.message.includes('getTopURL')&&(process.env.BROWSER_EXECUTABLE||'').includes('Quark.app'))return;errors.push(e.stack)});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='hands';state.player.equip={};
   for(const[id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=3;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();let count=0;
  for(const sex of ['male','female'])for(const[hands,body]of Object.entries(suits))for(const weapon of [null,'blade','pistol','rifle','gravLance']){
   await page.evaluate(({sex,hands,body,weapon})=>{
    state.tab='bag';state.playerAppearance=sex;render();equip('hands',hands,refreshBagPanel);equip('body',body,refreshBagPanel);
    if(weapon)equip('weapon',weapon,refreshBagPanel);else unequip('weapon',refreshBagPanel);refreshBagPanel();
   },{sex,hands,body,weapon});await ready();
   let previous;
   for(const tab of ['bag','char']){
    if(tab==='char'){await page.evaluate(()=>{state.tab='char';render()});await ready();}
    const result=await page.evaluate(()=>{
     const host=document.querySelector('.wearable-portrait'),specs=wearableSpecification(state.playerAppearance,P().equip,state.meta.careers.main?.id),plan=WEARABLE_HAND_EFFECTS.plan(specs),box=host.getBoundingClientRect();
     return {effects:plan.map(({spec,item})=>{
      const svg=host.querySelector('[data-hand-fx="'+spec.key+'"]'),layer=host.querySelector('[data-wear-key="'+spec.key+'"]');
      const source=wearableSourcePoint(spec.art,spec.handFx[0]),dot=svg.createSVGPoint();dot.x=source[0];dot.y=source[1]*1.5;
      const screen=dot.matrixTransform(svg.getScreenCTM()),p=wearableTransformPoint(spec,spec.handFx[0]);
      return {key:spec.key,item,src:layer.getAttribute('src'),transform:svg.style.transform===layer.style.transform,clip:svg.style.clipPath===layer.style.clipPath,z:svg.style.zIndex===layer.style.zIndex,
       distance:Math.hypot(screen.x-box.left-p[0]*box.width/100,screen.y-box.top-p[1]*box.height/100),particles:svg.querySelectorAll('.hand-fx-particle').length,animations:svg.getAnimations({subtree:true}).filter(a=>a.playState==='running').length,pointer:getComputedStyle(svg).pointerEvents};
     }).sort((a,b)=>a.key.localeCompare(b.key)),
     duplicate:host.querySelectorAll('.wardrobe-fx[data-fx-kind="hand"]').length,
     signature:[...host.querySelectorAll('[data-wear-key]')].map(n=>[n.dataset.wearKey,n.getAttribute('src'),n.style.transform,n.style.clipPath]).sort((a,b)=>a[0].localeCompare(b[0])),
     icon:itemArtSrc(P().equip.hands),overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    assert.equal(result.duplicate,0,'armor effects cannot duplicate hand effects');assert.equal(result.overflow,false);
    assert.equal(result.effects.length,hands==='phaseGrip'||!weapon?2:['rifle','gravLance'].includes(weapon)?4:3);
    assert.equal(result.icon,'assets/hands-v12/relaxed-'+hands+'.webp?v=12');
    for(const effect of result.effects){assert.equal(effect.item,hands);assert.ok(effect.transform&&effect.clip&&effect.z);assert.ok(effect.distance<.2,JSON.stringify(effect));assert.ok(effect.particles<=2&&effect.animations>0);assert.equal(effect.pointer,'none');}
    if(previous)assert.deepEqual(result.signature,previous,'bag and character display exactly the same fitted materials');previous=result.signature;count++;
    if(tab==='bag'){
     await page.screenshot({path:path.join(output,sex+'-'+hands+'-'+(weapon||'relaxed')+'-phone.png')});
     await page.evaluate(async()=>{const stage=document.createElement('div');stage.id='hand-inspection';stage.style.cssText='position:fixed;z-index:20000;inset:0 auto auto 0;width:420px;height:640px;background:#0b151e;display:grid;place-items:center;pointer-events:none';const clone=document.querySelector('.wearable-portrait').cloneNode(true);clone.style.cssText='position:relative;width:400px;height:600px;left:0;top:0;transform:none;max-width:none';stage.appendChild(clone);document.body.appendChild(stage);await Promise.all([...clone.querySelectorAll('img')].map(i=>i.decode()));});
     await page.locator('#hand-inspection').screenshot({path:path.join(output,sex+'-'+hands+'-'+(weapon||'relaxed')+'-portrait.png')});await page.locator('#hand-inspection').evaluate(n=>n.remove());
    }
   }
  }
  await page.evaluate(()=>{state.tab='bag';render()});await ready();
  await page.evaluate(()=>{window.handNode=document.querySelector('[data-hand-fx="grip-left"]');window.handAnimation=handNode.querySelector('.hand-fx-emitter').getAnimations()[0];window.handTime=handAnimation.currentTime;refreshBagPanel()});await ready();
  assert.equal(await page.evaluate(()=>handNode===document.querySelector('[data-hand-fx="grip-left"]')&&handAnimation===handNode.querySelector('.hand-fx-emitter').getAnimations()[0]&&handAnimation.currentTime>=handTime),true,'refresh keeps the actual motion timeline');
  for(const quality of ['low','off']){
   await page.evaluate(quality=>document.querySelector('.wearable-portrait').dataset.fxQuality=quality,quality);
   assert.equal(await page.locator('.wearable-hand-fx').evaluateAll(nodes=>nodes.reduce((n,s)=>n+s.getAnimations({subtree:true}).length,0)),0,'low/off consume no animation work');
   if(quality==='off')assert.equal(await page.locator('.wearable-hand-fx').first().isVisible(),false);
  }
  await page.evaluate(()=>delete document.querySelector('.wearable-portrait').dataset.fxQuality);await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>matchMedia('(prefers-reduced-motion:reduce)').matches&&[...document.querySelectorAll('.wearable-hand-fx')].every(svg=>{getComputedStyle(svg.querySelector('.hand-fx-emitter'));return svg.getAnimations({subtree:true}).length===0;}));
  assert.equal(await page.locator('.wearable-hand-fx').evaluateAll(nodes=>nodes.reduce((n,s)=>n+s.getAnimations({subtree:true}).length,0)),0);await page.emulateMedia({reducedMotion:'no-preference'});
  for(const width of [360,520]){await page.setViewportSize({width,height:844});await page.evaluate(()=>{state.tab='char';render()});await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:path.join(output,'character-'+width+'.png')});}
  await page.evaluate(()=>{state.tab='bag';render();unequip('hands',refreshBagPanel)});await ready();assert.equal(await page.locator('.wearable-hand-fx').count(),0,'unwear clears every hand emitter');
  assert.deepEqual(errors,[]);console.log('Hand FX: '+count+' real bag/character combinations with matched armor, source-space light anchors, stable timelines, low/off/reduced motion, mobile widths and unwear passed. '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
