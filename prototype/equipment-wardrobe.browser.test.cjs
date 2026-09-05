// Real game in a fresh browser context. Never touches a player's profile/save.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.setDefaultTimeout(10000);
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='module';state.player.equip={};state.playerAppearance='male';
   for(const [id,item] of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   state.meta.careers.main={id:'bulwark',level:5,xp:0};state.meta.careers.life=[{id:'noviceCollector',level:1,xp:0},{id:'fabricator',level:1,xp:0},{id:'noviceGrower',level:1,xp:0}];
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();
  assert.equal(await page.locator('.doll-wearable [data-slot="life"]').count(),3);
  const ids=await page.evaluate(()=>Object.keys(ITEMS).filter(id=>ITEMS[id].type==='equip'));assert.equal(ids.length,124);
  for(const sex of ['male','female']){
   await page.evaluate(sex=>{state.playerAppearance=sex;refreshBagPanel();},sex);await ready();
   await page.evaluate(()=>window.fixedWardrobe={base:document.querySelector('[data-wear-key="base"]'),rig:document.querySelector('.doll-wearable'),grid:document.querySelector('.rpg-gear-grid')});
   for(const id of ids){
    const result=await page.evaluate(id=>{const item=ITEMS[id],total=()=>Object.values(P().equip).filter(value=>value===id).length+(state.inv[id]||0);window.beforeWearTotal=total();const ok=equip(item.slot,id,refreshBagPanel);return {ok,total:total(),before:window.beforeWearTotal};},id);
    assert.equal(result.ok,true,id+' equips');assert.equal(result.total,result.before,id+' conserved on equip');await ready();
    assert.equal(await page.evaluate(({id,sex})=>{const host=document.querySelector('.doll-wearable'),nodes=[...host.querySelectorAll('[data-item="'+id+'"]')];return nodes.length>0&&nodes.every(n=>n.complete&&n.naturalWidth>0)&&host.querySelector('[data-wear-key="base"]')===window.fixedWardrobe.base&&host.dataset.gender===sex&&document.querySelector('.rpg-gear-grid')===window.fixedWardrobe.grid;},{id,sex}),true,id+' uses decoded fitted layers and retains identity/list');
    const count=await page.evaluate(id=>{unequip(ITEMS[id].slot,refreshBagPanel);return state.inv[id];},id);assert.equal(count,2,id+' conserved after unequip');await ready();
   }
  }
  // Real user clicks: a full-spectrum item has thirteen values in one detail.
  for(const width of [360,390,520,768]){
   await page.setViewportSize({width,height:844});await page.locator('.slotchip[data-slot="module"]').click();
   await page.locator('.rpg-gear-grid button[data-item="module_general_5"]').click();assert.equal(await page.locator('.rpg-stat-line').count(),13);
   assert.equal(await page.locator('.rpg-stat-group').count(),3);assert.equal(await page.locator('.rpg-equipment-detail').count(),1);
   assert.equal(await page.evaluate(()=>{const panel=document.querySelector('#panel');return panel.scrollWidth>panel.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1;}),false,'no horizontal overflow '+width);
   if(width===390)await page.locator('.rpg-equipment-comparison summary').click();
   const action=page.locator('.rpg-equipment-action');await action.scrollIntoViewIfNeeded();
   await page.evaluate(()=>{window.wearScroll={panel:document.querySelector('#panel'),top:document.querySelector('#panel').scrollTop,grid:document.querySelector('.rpg-gear-grid'),detail:document.querySelector('.rpg-equipment-detail'),action:document.querySelector('.rpg-equipment-action'),comparison:document.querySelector('.rpg-equipment-comparison'),open:document.querySelector('.rpg-equipment-comparison').open};});
   await action.click();await ready();assert.equal(await page.evaluate(()=>window.wearScroll.panel===document.querySelector('#panel')&&window.wearScroll.grid===document.querySelector('.rpg-gear-grid')&&window.wearScroll.detail===document.querySelector('.rpg-equipment-detail')&&window.wearScroll.action===document.querySelector('.rpg-equipment-action')&&window.wearScroll.comparison.open===window.wearScroll.open&&Math.abs(window.wearScroll.top-document.querySelector('#panel').scrollTop)<2),true,'wear retains the detail, action, open comparison and scroll '+width);
   await page.locator('.rpg-equipment-action').click();await ready();
  }
  // Decode failure retains the old equipment display; explicit retry loads the
  // current selection. Routing disables HTTP caching in this isolated context.
  const broken='**/equipment-art-v3/feet_general_4.webp';await page.route(broken,route=>route.abort());
  await page.evaluate(()=>{state.bagSel='feet';state.bagItemSelected='boots';equip('feet','boots',refreshBagPanel);});await ready();
  await page.evaluate(()=>{window.oldFeet=[...document.querySelectorAll('.doll-wearable [data-slot="feet"]')];wearableImageCache.delete(WEARABLE_ROOT+'../equipment-art-v3/feet_general_4.webp');state.bagItemSelected='feet_general_4';equip('feet','feet_general_4',refreshBagPanel);});
  await page.waitForSelector('.doll-art-host[data-art-state="error"]');
  assert.equal(await page.evaluate(()=>window.oldFeet.every(n=>n.isConnected&&n.dataset.item==='boots')),true,'network failure retains old mounted art');
  assert.equal(await page.locator('.doll-art-retry').isVisible(),true);await page.unroute(broken);await page.locator('.doll-art-retry').click();await ready();
  assert.equal(await page.locator('.doll-wearable [data-item="feet_general_4"]').count(),2);assert.equal(await page.locator('.doll-art-retry').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('Production wardrobe: 124 items × 2 identities, conserved wear/unwear, three life badges, 13-stat detail, four widths, stable scroll and failed-image retry passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
