// Exercise the production bag, not a separate mock renderer. Fresh context only.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {WEAPON_POSE_IDS}=require('./wardrobe-weapon-poses.js');
const art=require('./wardrobe-weapon-art.js');
const {profiles:effects}=require('./wardrobe-weapon-effects.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{if(e.message.includes('getTopURL')&&(process.env.BROWSER_EXECUTABLE||'').includes('Quark.app'))return;errors.push(e.stack)});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='weapon';state.player.equip={};
   for(const [id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');
   document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();
  const weapons=Object.values(WEAPON_POSE_IDS).flat(),gloves=Object.keys(art.low);
  let cases=0;
  for(const sex of ['male','female']){
   await page.evaluate(sex=>{state.playerAppearance=sex;refreshBagPanel();},sex);await ready();
   await page.evaluate(()=>{window.weaponBase=document.querySelector('[data-wear-key="base"]');window.weaponGrid=document.querySelector('.rpg-gear-grid')});
   for(const glove of gloves){
    await page.evaluate(glove=>{if(P().equip.hands)unequip('hands',refreshBagPanel);if(glove!=='bare')equip('hands',glove,refreshBagPanel);},glove);await ready();
    for(const weapon of weapons){
     const result=await page.evaluate(id=>{const count=(state.inv[id]||0)+(P().equip.weapon===id?1:0);const ok=equip('weapon',id,refreshBagPanel);return {ok,count,after:(state.inv[id]||0)+(P().equip.weapon===id?1:0)};},weapon);
     assert.equal(result.ok,true);assert.equal(result.count,result.after,'inventory conserved');await ready();
     const two=WEAPON_POSE_IDS.longgun.includes(weapon);
     const state=await page.evaluate(({weapon,glove})=>{
      const host=document.querySelector('.doll-wearable'),specs=wearableSpecification(state.playerAppearance,P().equip,state.meta.careers.main?.id);
      return {identity:host.querySelector('[data-wear-key="base"]')===window.weaponBase,list:document.querySelector('.rpg-gear-grid')===window.weaponGrid,
       decoded:[...host.querySelectorAll('img')].every(n=>n.complete&&n.naturalWidth>0),newWeapon:specs.find(s=>s.slot==='weapon')?.fit,
       hands:[...host.querySelectorAll('[data-wear-key="grip-left"],[data-wear-key="grip-right"]')].map(n=>({pose:n.dataset.pose,glove:n.dataset.handItem,src:n.getAttribute('src')})),
       rightArm:!!host.querySelector('[data-wear-key="forearm-right-base"]'),fx:host.querySelector('.wearable-weapon-fx')?.dataset.fxItem||null,
       fxAligned:!host.querySelector('.wearable-weapon-fx')||host.querySelector('.wearable-weapon-fx').style.transform===host.querySelector('[data-wear-key="weapon-0"]').style.transform,
       overflow:document.documentElement.scrollWidth>innerWidth+1};
     },{weapon,glove});
     assert.ok(state.identity&&state.list&&state.decoded,sex+'/'+glove+'/'+weapon+' stable decoded production layers');
     assert.equal(state.newWeapon,'pose-v11');assert.equal(state.hands.length,two?2:1);assert.equal(state.rightArm,two);
     assert.ok(state.hands.every(h=>h.glove===glove&&/\/(weapon-poses-v11|hands-v12)\//.test(h.src)),'no old gesture/bare fallback');
     assert.equal(state.overflow,false,'mobile viewport stays fixed');
     assert.equal(state.fx,effects[weapon]?weapon:null);assert.ok(state.fxAligned,'light follows actual weapon matrix');
     if(two)assert.equal(state.hands[1].pose,'support');
     await page.evaluate(()=>unequip('weapon',refreshBagPanel));await ready();
     assert.equal(await page.locator('[data-wear-key="grip-left"],[data-wear-key="grip-right"],[data-wear-key="grip-support-rear"],[data-wear-key="forearm-left-base"],[data-wear-key="forearm-right-base"]').count(),0,'unwear removes all posed parts');
     assert.equal(await page.locator('.wearable-weapon-fx').count(),0,'unwear leaves no floating weapon light');
     cases++;
    }
   }
   console.log(sex+': '+cases+' production weapon/glove wear-unwear cases');
  }
  // Every career sleeve and wardrobe page uses the same source/transform list.
  for(const sex of ['male','female'])for(const career of ['bulwark','vanguard','infiltrator'])for(const weapon of ['crowbar','knife','blade','pistol','rifle']){
   await page.evaluate(({sex,career,weapon})=>{state.playerAppearance=sex;state.meta.careers.main={id:career,level:5,xp:0};state.tab='bag';render();equip('weapon',weapon,refreshBagPanel);refreshBagPanel();},{sex,career,weapon});await ready();
   // A stable keyed node can precede a newly added lower-z layer. Compare the
   // actual source/placement/stack level, not incidental DOM insertion order.
   const snap=()=>page.evaluate(()=>[...document.querySelectorAll('.wearable-portrait [data-wear-key]')].map(n=>[n.dataset.wearKey,n.getAttribute('src'),n.style.transform,n.style.clipPath,n.style.zIndex]).sort((a,b)=>a[0].localeCompare(b[0])));
   const bag=await snap();await page.evaluate(()=>{state.tab='char';render()});await ready();
   assert.deepEqual(await snap(),bag,'character and bag share the same posed portrait');
  }
  assert.deepEqual(errors,[]);console.log('Weapon runtime: '+cases+' real wear/unwear cases + 30 career/page comparisons; stable identity, inventory, mobile layout and complete native-art coverage passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
