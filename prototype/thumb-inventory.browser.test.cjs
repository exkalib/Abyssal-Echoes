// Fresh isolated contexts only. Does not load a real player profile or cloud save.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
   const page=await browser.newPage({viewport,isMobile:true,hasTouch:true}),errors=[];page.setDefaultTimeout(10000);
   page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
   await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
   await page.evaluate(()=>{
    prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;state.sound=false;state.music=false;
    state.tab='bag';state.bagView='equipment';state.bagSel='module';state.player.equip={};state.playerAppearance='male';
    for(const [id,item] of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
    Object.assign(state.inv,{medkit:2,masteryManual:3,scrap:48,emp:2,serum:2});state.player.hp=10;
    document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');render();
   });
   const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();
   assert.equal(await page.locator('.rpg-equipment-detail').count(),0,'details must not occupy the main inventory');
   const geometry=await page.evaluate(()=>{
    const panel=document.querySelector('#panel'),body=document.querySelector('.rpg-bag-body'),tabs=document.querySelector('.bag-category-tabs'),vault=document.querySelector('.inventory-scroll'),slots=[...document.querySelectorAll('.slotchip')].map(node=>node.getBoundingClientRect());
    return {outerOverflow:panel.scrollHeight>panel.clientHeight+1||body.scrollHeight>body.clientHeight+1,horizontal:document.documentElement.scrollWidth>innerWidth+1||panel.scrollWidth>panel.clientWidth+1,slotTargets:slots.every(rect=>rect.width>=44&&rect.height>=44),vaultHeight:vault.clientHeight,tabsBottom:tabs.getBoundingClientRect().bottom};
   });
   assert.equal(geometry.outerOverflow,false,'only inventory tray scrolls '+JSON.stringify(viewport));assert.equal(geometry.horizontal,false);assert.equal(geometry.slotTargets,true);assert.ok(geometry.vaultHeight>=84,'short phone still has one full inventory row');assert.ok(geometry.tabsBottom<viewport.height);
   const pickerRect=await page.locator('.bag-slot-picker').boundingBox();assert.ok(pickerRect.y>=viewport.height*.65,'slot switching must remain in the lower thumb zone');
   if(process.env.THUMB_SCREENSHOT_DIR)await page.screenshot({path:require('node:path').join(process.env.THUMB_SCREENSHOT_DIR,'bag-'+viewport.width+'.png')});
   const candidate=page.locator('.rpg-gear-grid button[data-item="module_general_5"]');await candidate.scrollIntoViewIfNeeded();
   await page.evaluate(()=>{window.thumbBagRefs={panel:document.querySelector('#panel'),doll:document.querySelector('.doll'),art:document.querySelector('.doll-art-host'),grid:document.querySelector('.rpg-gear-grid'),scroll:document.querySelector('.inventory-scroll'),scrollTop:document.querySelector('.inventory-scroll').scrollTop,candidate:document.querySelector('.rpg-gear-grid button[data-item="module_general_5"]')};});
   await candidate.tap();assert.equal(await page.locator('.bag-thumb-sheet').count(),1);assert.equal(await page.locator('.rpg-stat-line').count(),13);assert.equal(await page.locator('.rpg-stat-group').count(),3);
   assert.equal(await page.locator('#panel').evaluate(node=>node.inert),true,'source page cannot receive accidental touches');
   const action=page.locator('.rpg-equipment-action'),back=page.locator('.bag-detail-back');
   await page.waitForTimeout(300); // Verify the settled modal, not a fortunate frame during its opening transform.
   for(const control of [action,back]){const rect=await control.boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=viewport.width+1,'actions must be fully inside horizontal viewport');assert.ok(rect.y>=viewport.height*.6&&rect.y+rect.height<=viewport.height+1,'actions stay in lower thumb zone');assert.ok(rect.height>=44);assert.equal(await control.evaluate(node=>{const r=node.getBoundingClientRect();return node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,'action center must receive the touch, not a covering layer');}
   if(process.env.THUMB_SCREENSHOT_DIR)await page.screenshot({path:require('node:path').join(process.env.THUMB_SCREENSHOT_DIR,'equipment-drawer-'+viewport.width+'.png')});
   await page.locator('.rpg-equipment-comparison summary').tap();
   await page.evaluate(()=>{window.thumbDetailRefs={detail:document.querySelector('.rpg-equipment-detail'),action:document.querySelector('.rpg-equipment-action'),comparison:document.querySelector('.rpg-equipment-comparison'),scroll:document.querySelector('.thumb-sheet-body')};});
   await action.tap();await ready();assert.deepEqual(await page.evaluate(()=>[P().equip.module,state.inv.module_general_5]),['module_general_5',1]);
   assert.equal(await page.evaluate(()=>window.thumbDetailRefs.detail===document.querySelector('.rpg-equipment-detail')&&window.thumbDetailRefs.action===document.querySelector('.rpg-equipment-action')&&window.thumbDetailRefs.comparison===document.querySelector('.rpg-equipment-comparison')&&window.thumbDetailRefs.comparison.open),true,'wear retains detail, button and expanded comparison');
   await back.tap();assert.equal(await page.locator('.bag-thumb-sheet').count(),0);assert.equal(await page.locator('#panel').evaluate(node=>node.inert),false);
   assert.equal(await page.evaluate(()=>window.thumbBagRefs.panel===document.querySelector('#panel')&&window.thumbBagRefs.doll===document.querySelector('.doll')&&window.thumbBagRefs.art===document.querySelector('.doll-art-host')&&window.thumbBagRefs.grid===document.querySelector('.rpg-gear-grid')&&window.thumbBagRefs.scroll===document.querySelector('.inventory-scroll')&&Math.abs(window.thumbBagRefs.scrollTop-document.querySelector('.inventory-scroll').scrollTop)<2),true,'closing retains source and its scroll');
   await candidate.tap();assert.match(await action.innerText(),/卸下/,'same selected item reopens');await action.tap();await ready();await back.tap();assert.equal(await page.evaluate(()=>state.inv.module_general_5),2);
   // The slot picker is in the lower tray, so changing distant body slots does not require reaching to the top.
   await page.locator('.bag-slot-picker').tap();await page.locator('.bag-slot-choice').filter({hasText:'头部'}).tap();assert.equal(await page.evaluate(()=>state.bagSel),'head');
   assert.equal(await page.evaluate(()=>window.thumbBagRefs.grid===document.querySelector('.rpg-gear-grid')&&window.thumbBagRefs.doll===document.querySelector('.doll')),true,'slot selection filters stable nodes');
   await page.evaluate(()=>{P().equip.offhand='eshieldUnit';refreshBagPanel();});
   await page.locator('.bag-slot-picker').tap();await page.locator('.bag-slot-choice').filter({hasText:'主武器'}).tap();await page.locator('.rpg-gear-grid button[data-item="rifle"]').tap();assert.equal(await action.isDisabled(),true);assert.match(await page.locator('.rpg-equipment-conflict').innerText(),/双手|副手/);await back.tap();
   await page.locator('.bag-category-tabs button').filter({hasText:'材料'}).tap();await page.locator('.inventory-scroll button[data-item="scrap"]').tap();assert.match(await page.locator('.bag-item-source').innerText(),/获取地点/);await back.tap();
   await page.locator('.bag-category-tabs button').filter({hasText:'消耗品'}).tap();await page.locator('.inventory-scroll button[data-item="medkit"]').tap();
   await page.evaluate(()=>{window.thumbItemRefs={body:document.querySelector('.rpg-bag-body'),grid:document.querySelector('.inventory-scroll .itemgrid'),sheet:document.querySelector('.bag-thumb-sheet'),button:document.querySelector('.bag-item-use')};});
   await page.locator('.bag-item-use').tap();assert.equal(await page.evaluate(()=>state.inv.medkit),1);assert.match(await page.locator('.bag-item-held').innerText(),/1 件/);await page.locator('.bag-item-use').tap();assert.equal(await page.evaluate(()=>state.inv.medkit),0);assert.equal(await page.locator('.bag-item-use').isDisabled(),true);
   assert.equal(await page.evaluate(()=>window.thumbItemRefs.body===document.querySelector('.rpg-bag-body')&&window.thumbItemRefs.grid===document.querySelector('.inventory-scroll .itemgrid')&&window.thumbItemRefs.sheet===document.querySelector('.bag-thumb-sheet')&&window.thumbItemRefs.button===document.querySelector('.bag-item-use')),true,'continuous use only changes counts, keeps tray and drawer');await back.tap();
   await page.evaluate(()=>{state.inv.medkit=1;P().hp=maxHp();refreshBagPanel();});await page.locator('.inventory-scroll button[data-item="medkit"]').tap();assert.equal(await page.locator('.bag-item-use').isDisabled(),true);assert.match(await page.locator('.bag-item-use').innerText(),/生命已满/);await back.tap();
   await page.locator('.inventory-scroll button[data-item="emp"]').tap();assert.equal(await page.locator('.bag-item-use').isDisabled(),true);await back.tap();
   await page.locator('.inventory-scroll button[data-item="masteryManual"]').tap();await page.locator('.bag-item-use').tap();assert.equal(await page.locator('.bag-thumb-sheet').count(),0);assert.equal(await page.locator('.mastery-book-sheet').count(),1);assert.equal(await page.locator('#panel').evaluate(node=>node.inert),false,'mastery workflow is not left inert after the inventory drawer');
   await page.evaluate(()=>closeSiteSheet());assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Thumb inventory: 3 touch viewports, stable drawer wear/unwear, repeat open, low slot selector, compatibility, material sources, continuous use and no-waste guards passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
