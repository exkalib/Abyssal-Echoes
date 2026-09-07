// Actual game + fresh save only. Screenshots are evidence, not visual approval.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {profiles}=require('./wardrobe-weapon-effects.js');
const output=process.env.WARDROBE_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'weapon-fx-'));
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{if(e.message.includes('getTopURL')&&(process.env.BROWSER_EXECUTABLE||'').includes('Quark.app'))return;errors.push(e.stack)});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='weapon';state.player.equip={};
   for(const[id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');
   document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();
  for(const sex of ['male','female'])for(const weapon of Object.keys(profiles)){
   await page.evaluate(({sex,weapon})=>{state.playerAppearance=sex;equip('weapon',weapon,refreshBagPanel);refreshBagPanel();},{sex,weapon});await ready();
   const result=await page.evaluate(()=>{
    const host=document.querySelector('.wearable-portrait'),svg=host.querySelector('.wearable-weapon-fx'),layer=host.querySelector('[data-wear-key="weapon-0"]');
    const spec=wearableSpecification(state.playerAppearance,P().equip,state.meta.careers.main?.id).find(s=>s.slot==='weapon');
    const profile=WEARABLE_WEAPON_EFFECTS.profiles[spec.item],point=profile.traces[0].points[0],source=wearableSourcePoint(spec.art,point);
    const dot=svg.createSVGPoint();dot.x=source[0];dot.y=source[1]*1.5;const actual=dot.matrixTransform(svg.getScreenCTM());
    const target=wearableTransformPoint(spec,point),box=host.getBoundingClientRect();
    return {item:svg.dataset.fxItem,transform:svg.style.transform===layer.style.transform,origin:svg.style.transformOrigin===layer.style.transformOrigin,
     distance:Math.hypot(actual.x-box.left-target[0]*box.width/100,actual.y-box.top-target[1]*box.height/100),
     handsAbove:[...host.querySelectorAll('[data-wear-key="grip-left"],[data-wear-key="grip-right"]')].every(n=>+getComputedStyle(n).zIndex>+getComputedStyle(svg).zIndex),
     particles:svg.querySelectorAll('.weapon-fx-particle').length,pointer:getComputedStyle(svg).pointerEvents,
     animations:svg.getAnimations({subtree:true}).filter(a=>a.playState==='running').length,
     overflow:document.documentElement.scrollWidth>innerWidth+1};
   });
   assert.equal(result.item,weapon);assert.ok(result.transform&&result.origin&&result.handsAbove);
   assert.ok(result.distance<.15,'emitter sits on actual source through mirrored/rotated weapon CSS: '+weapon+' '+JSON.stringify(result));
   assert.equal(result.particles,profiles[weapon].particles);assert.equal(result.pointer,'none');assert.ok(result.animations>0);assert.equal(result.overflow,false);
   // Both an actual phone screen and an enlarged, unchanged production layer.
   await page.screenshot({path:path.join(output,sex+'-'+weapon+'-phone.png')});
   await page.evaluate(async()=>{
    const stage=document.createElement('div');stage.id='weapon-inspection';stage.style.cssText='position:fixed;z-index:20000;inset:0 auto auto 0;width:420px;height:640px;background:#0b151e;display:grid;place-items:center;pointer-events:none';
    const clone=document.querySelector('.wearable-portrait').cloneNode(true);clone.style.cssText='position:relative;width:400px;height:600px;left:0;top:0;transform:none;max-width:none';stage.appendChild(clone);document.body.appendChild(stage);
    await Promise.all([...clone.querySelectorAll('img')].map(img=>img.decode()));
   });
   await page.locator('#weapon-inspection').screenshot({path:path.join(output,sex+'-'+weapon+'-portrait.png')});
   await page.locator('#weapon-inspection').evaluate(n=>n.remove());
  }
  await page.evaluate(()=>{window.previousFx=document.querySelector('.wearable-weapon-fx');window.previousFxParticle=window.previousFx.querySelector('.weapon-fx-particle');window.previousFxAnimation=window.previousFxParticle.getAnimations()[0];window.previousFxTime=window.previousFxAnimation.currentTime;refreshBagPanel();});await ready();
  assert.equal(await page.evaluate(()=>window.previousFx===document.querySelector('.wearable-weapon-fx')&&window.previousFxParticle===window.previousFx.querySelector('.weapon-fx-particle')&&window.previousFxAnimation===window.previousFxParticle.getAnimations()[0]&&window.previousFxAnimation.currentTime>=window.previousFxTime),true,'a bag refresh does not restart the effect');
  await page.evaluate(()=>equip('hands','hands_general_5',refreshBagPanel));await ready();
  assert.equal(await page.evaluate(()=>window.previousFx===document.querySelector('.wearable-weapon-fx')&&window.previousFx.style.transform===document.querySelector('[data-wear-key="weapon-0"]').style.transform),true,'new glove repositions, not respawns, the effect');
  for(const quality of ['low','off']){
   await page.evaluate(quality=>document.querySelector('.wearable-portrait').dataset.fxQuality=quality,quality);
   if(quality==='off')assert.equal(await page.locator('.wearable-weapon-fx').isVisible(),false);
   else assert.equal(await page.locator('.weapon-fx-sparks').isVisible(),false);
   assert.equal(await page.locator('.wearable-weapon-fx').evaluate(svg=>svg.getAnimations({subtree:true}).length),0,'quality control eliminates animation work');
  }
  await page.evaluate(()=>delete document.querySelector('.wearable-portrait').dataset.fxQuality);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.weapon-fx-sparks').isVisible(),false);
  await page.waitForFunction(()=>{const svg=document.querySelector('.wearable-weapon-fx');getComputedStyle(svg.querySelector('.weapon-fx-emission'));return svg.getAnimations({subtree:true}).length===0;});
  assert.equal(await page.locator('.wearable-weapon-fx').evaluate(svg=>svg.getAnimations({subtree:true}).length),0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const width of [360,390,520]){
   await page.setViewportSize({width,height:844});
   await page.evaluate(()=>{state.tab='char';render()});await ready();
   assert.equal(await page.locator('.wearable-weapon-fx').count(),1);
   await page.screenshot({path:path.join(output,'female-gravity-character-'+width+'.png')});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
  await page.evaluate(()=>{state.tab='bag';render();equip('weapon','knife',refreshBagPanel)});await ready();assert.equal(await page.locator('.wearable-weapon-fx').count(),0);
  await page.evaluate(()=>{equip('weapon','eblade',refreshBagPanel)});await ready();assert.equal(await page.locator('.wearable-weapon-fx').count(),1);
  await page.evaluate(()=>unequip('weapon',refreshBagPanel));await ready();assert.equal(await page.locator('.wearable-weapon-fx').count(),0);
  assert.deepEqual(errors,[]);
  console.log('Weapon FX: 14 items × 2 sexes, actual screen-space emission, front fingers, stable timelines, glove refits, removal, low/off/reduced-motion and 360/390/520px character pages passed. '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
