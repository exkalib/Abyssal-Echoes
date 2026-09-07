// Fresh isolated contexts only. Does not load a real player profile or cloud save.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.THUMB_SCREENSHOT_DIR||path.join(__dirname,'../output/mobile-review-v2/bag');
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:520,height:844}]){
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.setDefaultTimeout(15000);
   page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message.includes('getTopURL')&&!error.stack.includes('http'))return;errors.push(error.stack);});
   await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
   await page.evaluate(()=>{
    prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;state.sound=false;state.music=false;
    state.tab='bag';state.bagView='equipment';state.bagSel='module';state.bagEquipFilter='all';delete state.bagPortraitHidden;state.player.equip={};state.playerAppearance='male';
    for(const[id,item]of Object.entries(ITEMS))if(['equip','mat','use','book','masteryBook'].includes(item.type))state.inv[id]=2;
    Object.assign(state.inv,{medkit:2,masteryManual:3,scrap:48,emp:2,serum:2});state.player.hp=10;
    document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');render();
   });
   const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});await ready();
   const quick=page.locator('.bag-quick-action'),info=page.locator('.bag-selection-info');
   const screenshot=name=>page.screenshot({path:path.join(output,name+'-'+viewport.width+'.png')});
   const dockLayout=async(expected)=>{
    const g=await page.evaluate(async()=>{
     const dock=document.querySelector('.bag-selection-dock'),art=dock.querySelector('.bag-selection-art'),img=art.querySelector('.item-art'),button=dock.querySelector('.bag-quick-action');
     if(img)await img.decode();const d=dock.getBoundingClientRect(),a=art.getBoundingClientRect(),i=img?.getBoundingClientRect(),b=button.getBoundingClientRect();
     const range=document.createRange();range.selectNodeContents(button);const t=range.getBoundingClientRect(),style=getComputedStyle(button);
     return {text:button.textContent.trim(),iconInset:i?i.left-d.left:null,innerInsets:i?[i.left-a.left,a.right-i.right,i.top-a.top,a.bottom-i.bottom]:[],
      centerError:Math.abs((t.left+t.right)/2-(b.left+b.right)/2),button:[b.x,b.y,b.width,b.height],dock:[d.x,d.y,d.width,d.height],clip:style.clipPath,
      tone:[style.backgroundImage,style.backgroundColor,style.borderColor,style.color]};
    });
    assert.equal(g.text,expected,'quick-action state is explicit');
    assert.ok(g.iconInset>=16,'selected item artwork has room from the dock left edge '+JSON.stringify(g));
    assert.equal(g.innerInsets.length,4);assert.ok(g.innerInsets.every(n=>n>=5),'artwork has padding on all four sides of its own frame '+JSON.stringify(g));
    assert.ok(g.centerError<=1,'actual text, not only text-align, is horizontally centered '+JSON.stringify(g));
    assert.equal(g.clip,'none','quick action has no large diagonal corner cut');return g;
   };
   const layout=async()=>{
    const g=await page.evaluate(()=>{
     const panel=document.querySelector('#panel'),body=document.querySelector('.rpg-bag-body'),tabs=document.querySelector('.bag-category-tabs'),vault=document.querySelector('.inventory-scroll'),dock=document.querySelector('.bag-selection-dock');
     return {outer:panel.scrollHeight>panel.clientHeight+1||body.scrollHeight>body.clientHeight+1,horizontal:document.documentElement.scrollWidth>innerWidth+1||panel.scrollWidth>panel.clientWidth+1,
      tabsAbove:tabs.getBoundingClientRect().bottom<=body.getBoundingClientRect().top+1,vault:vault.clientHeight,dockBottom:dock.getBoundingClientRect().bottom,menuTop:document.querySelector('#tabbar').getBoundingClientRect().top};
    });
    assert.equal(g.outer,false,'only inventory tray scrolls '+JSON.stringify(viewport));assert.equal(g.horizontal,false);assert.equal(g.tabsAbove,true,'categories remain at the top');
    assert.ok(g.vault>=76,'small phone has one full inventory row '+JSON.stringify(g));assert.ok(g.dockBottom<=g.menuTop+1,'quick action remains above the game menu');
   };
   const hit=async(control,label)=>{
    const rect=await control.boundingBox();assert.ok(rect&&rect.width>=44&&rect.height>=44,label+' retains a 44px touch target');
    assert.ok(rect.x>=0&&rect.x+rect.width<=viewport.width+1&&rect.y>=0&&rect.y+rect.height<=viewport.height+1,label+' remains fully on screen');
    assert.equal(await control.evaluate(node=>{const r=node.getBoundingClientRect();return node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,label+' receives the center touch');
   };
   const select=async(id)=>{
    const before=await page.evaluate(()=>JSON.stringify([P().equip,state.inv]));
    const card=page.locator('.inventory-scroll button[data-item="'+id+'"]');await card.scrollIntoViewIfNeeded();await hit(card,'item '+id);await card.tap();
    assert.equal(await page.locator('.bag-thumb-sheet').count(),0,'selection does not open a modal');
    assert.equal(await page.evaluate(()=>JSON.stringify([P().equip,state.inv])),before,'selection never wears, removes or uses an item');
    assert.equal(await card.getAttribute('aria-pressed'),'true');return card;
   };
   const chooseFilter=async(label)=>{
    await page.locator('.bag-slot-picker').tap();
    await page.locator('.bag-slot-choice').filter({has:page.locator('b',{hasText:new RegExp('^'+label+'$')})}).tap();
    assert.equal(await page.locator('.bag-thumb-sheet').count(),0);
   };
   const remember=()=>page.evaluate(()=>{
    window.thumbBagRefs={panel:document.querySelector('#panel'),body:document.querySelector('.rpg-bag-body'),doll:document.querySelector('.doll'),art:document.querySelector('.doll-art-host'),grid:document.querySelector('.inventory-scroll .itemgrid'),scroll:document.querySelector('.inventory-scroll'),top:document.querySelector('.inventory-scroll').scrollTop,dock:document.querySelector('.bag-selection-dock'),action:document.querySelector('.bag-quick-action')};
   });
   const stable=()=>page.evaluate(()=>{
    const r=thumbBagRefs;return r.panel===document.querySelector('#panel')&&r.body===document.querySelector('.rpg-bag-body')&&r.doll===document.querySelector('.doll')&&r.art===document.querySelector('.doll-art-host')&&r.grid===document.querySelector('.inventory-scroll .itemgrid')&&r.scroll===document.querySelector('.inventory-scroll')&&r.dock===document.querySelector('.bag-selection-dock')&&r.action===document.querySelector('.bag-quick-action')&&Math.abs(r.top-r.scroll.scrollTop)<2;
   });
   assert.equal(await page.locator('#panel.bag-review-page').count(),1);await layout();
   assert.equal(await page.locator('.rpg-equipment-detail').count(),0);assert.match(await page.locator('.bag-slot-picker').innerText(),/全部装备/);
   assert.ok(await page.locator('.rpg-gear-grid .item:visible').count()>100,'default filter includes every equipment family');
   for(const button of [quick,info,page.locator('.bag-slot-picker'),page.locator('.bag-look-toggle')])await hit(button,'main bag control');
   assert.equal(await page.evaluate(()=>state.bagPortraitHidden),true,'missing preference defaults to a larger item tray');
   assert.equal(await page.locator('.ui-bag-stage').isVisible(),false);assert.match(await page.locator('.bag-look-toggle').innerText(),/查看穿戴/);
   await dockLayout('穿戴');
   await screenshot('equipment-default');await screenshot('equipment-all');
   // Two taps equip, with the next candidate still directly reachable.
   await select('module_general_5');await remember();const wearLayout=await dockLayout('穿戴');await quick.tap();await ready();
   assert.deepEqual(await page.evaluate(()=>[P().equip.module,state.inv.module_general_5]),['module_general_5',1]);
   if(!await stable()){
    await screenshot('quick-equip-stability-failure');
    assert.fail('quick equip changed source scene/scroll: '+JSON.stringify(await page.evaluate(before=>({before,after:{top:document.querySelector('.inventory-scroll').scrollTop,rememberedTop:thumbBagRefs.top,dock:document.querySelector('.bag-selection-dock').getBoundingClientRect().toJSON(),button:document.querySelector('.bag-quick-action').getBoundingClientRect().toJSON(),sameGrid:thumbBagRefs.grid===document.querySelector('.rpg-gear-grid'),sameDoll:thumbBagRefs.doll===document.querySelector('.doll'),sameAction:thumbBagRefs.action===document.querySelector('.bag-quick-action')}}),wearLayout)));
   }
   assert.equal(await page.locator('.bag-thumb-sheet').count(),0);assert.match(await quick.innerText(),/卸下/);
   const unwearLayout=await dockLayout('卸下');
   for(const key of ['button','dock'])unwearLayout[key].forEach((n,i)=>assert.ok(Math.abs(n-wearLayout[key][i])<=1,'wear/unwear does not move or resize the '+key+' '+JSON.stringify({wearLayout,unwearLayout})));
   assert.notDeepEqual(unwearLayout.tone,wearLayout.tone,'equipping is emphasized while unequipping has a quieter visual state');
   await select('module_general_4');await remember();await quick.tap();await ready();
   assert.deepEqual(await page.evaluate(()=>[P().equip.module,state.inv.module_general_4,state.inv.module_general_5]),['module_general_4',1,2]);assert.equal(await stable(),true,'replace without close/back');
   await select('module_general_5');await quick.tap();await ready();await screenshot('equipment-selected');
   assert.equal(await page.locator('.ui-bag-stage').isVisible(),false,'selection/equip/replacement cannot automatically expand the portrait');
   await page.locator('.bag-look-toggle').tap();assert.equal(await page.evaluate(()=>state.bagPortraitHidden),false,'explicit expansion is a real saved preference');
   assert.equal(await page.locator('.ui-bag-stage').isVisible(),true);await layout();await dockLayout('卸下');
   for(const button of await page.locator('.slotchip').all())await hit(button,'portrait slot');
   await page.locator('.inventory-scroll').evaluate(n=>n.scrollTop=0);
   const firstRow=await page.locator('.rpg-gear-grid .item:not([hidden])').first().boundingBox(),tray=await page.locator('.inventory-scroll').boundingBox();
   assert.ok(firstRow.y>=tray.y-.5&&firstRow.y+firstRow.height<=tray.y+tray.height+.5,'expanded portrait leaves one genuinely complete item row, including grid spacing '+JSON.stringify({firstRow,tray}));
   await screenshot('equipment-expanded');
   // All thirteen stats remain available through the explicit information control.
   await remember();await info.tap();assert.equal(await page.locator('.bag-thumb-sheet').count(),1);
   assert.equal(await page.locator('.rpg-stat-line').count(),13);assert.equal(await page.locator('.rpg-stat-group').count(),3);
   assert.equal(await page.locator('#panel').evaluate(n=>n.inert),true);
   const action=page.locator('.rpg-equipment-action'),back=page.locator('.bag-detail-back');
   await page.waitForTimeout(300);for(const control of [action,back])await hit(control,'detail footer');await screenshot('equipment-details');
   await page.locator('.rpg-equipment-comparison summary').tap();
   await page.evaluate(()=>window.thumbDetailRefs={detail:document.querySelector('.rpg-equipment-detail'),action:document.querySelector('.rpg-equipment-action'),comparison:document.querySelector('.rpg-equipment-comparison')});
   await action.tap();await ready();assert.equal(await page.evaluate(()=>P().equip.module),null);assert.equal(await page.evaluate(()=>state.inv.module_general_5),2);
   assert.equal(await page.evaluate(()=>thumbDetailRefs.detail===document.querySelector('.rpg-equipment-detail')&&thumbDetailRefs.action===document.querySelector('.rpg-equipment-action')&&thumbDetailRefs.comparison===document.querySelector('.rpg-equipment-comparison')&&thumbDetailRefs.comparison.open),true,'details stable on unwear');
   await action.tap();await ready();await back.tap();assert.equal(await page.locator('#panel').evaluate(n=>n.inert),false);assert.equal(await stable(),true,'return retains source list and scroll');
   const prior=await page.locator('.inventory-scroll').evaluate(n=>n.clientHeight);await remember();await page.locator('.bag-look-toggle').tap();
   assert.equal(await page.locator('.ui-bag-stage').isVisible(),false);assert.ok(await page.locator('.inventory-scroll').evaluate(n=>n.clientHeight)>prior+80,'portrait collapse adds meaningful item area');
   assert.equal(await page.evaluate(()=>thumbBagRefs.art===document.querySelector('.doll-art-host')&&thumbBagRefs.grid===document.querySelector('.rpg-gear-grid')),true,'collapse retains art/list nodes');
   await layout();await dockLayout('卸下');await screenshot('equipment-collapsed');await page.locator('.bag-look-toggle').tap();assert.equal(await page.locator('.ui-bag-stage').isVisible(),true);await layout();
   // Filters and categories remember their own scroll positions and selections.
   await select('module_general_5');const allTop=await page.locator('.inventory-scroll').evaluate(n=>n.scrollTop);assert.ok(allTop>0);
   await chooseFilter('头部');assert.equal(await page.evaluate(()=>state.bagEquipFilter),'head');
   assert.equal(await page.locator('.rpg-gear-grid .item:not([hidden])').evaluateAll(ns=>ns.every(n=>ITEMS[n.dataset.item].slot==='head')),true);
   await chooseFilter('全部装备');assert.equal(await page.locator('.inventory-scroll').evaluate(n=>n.scrollTop),allTop);assert.equal(await page.evaluate(()=>state.bagItemSelected),'module_general_5');
   await page.locator('.bag-category-tabs button').filter({hasText:'材料'}).tap();await select('scrap');await quick.tap();assert.match(await page.locator('.bag-item-source').innerText(),/获取地点/);await back.tap();
   await page.locator('.bag-category-tabs button').filter({hasText:'装备'}).tap();await ready();assert.equal(await page.locator('.inventory-scroll').evaluate(n=>n.scrollTop),allTop);assert.equal(await page.evaluate(()=>state.bagItemSelected),'module_general_5');
   assert.equal(await page.locator('.ui-bag-stage').isVisible(),true,'explicit expansion survives changing categories');
   await page.evaluate(()=>{P().equip.offhand='eshieldUnit';refreshBagPanel();});await ready();await select('rifle');
   assert.equal(await quick.isDisabled(),true);assert.match(await page.locator('.bag-selection-copy').innerText(),/双手|副手/);
   await info.tap();assert.equal(await action.isDisabled(),true);assert.match(await page.locator('.rpg-equipment-conflict').innerText(),/双手|副手/);await back.tap();
   await page.locator('.bag-category-tabs button').filter({hasText:'消耗品'}).tap();await layout();await select('medkit');await remember();
   await quick.tap();assert.equal(await page.evaluate(()=>state.inv.medkit),1);assert.match(await page.locator('.bag-selection-copy').innerText(),/持有 1 件/);assert.equal(await stable(),true);
   await quick.tap();assert.equal(await page.evaluate(()=>state.inv.medkit),0);assert.equal(await quick.isDisabled(),true);assert.match(await quick.innerText(),/已用完/);assert.equal(await stable(),true,'continuous use keeps selection/list/dock/scroll');
   assert.equal(await page.locator('.bag-thumb-sheet').count(),0);await screenshot('consumable-exhausted');
   await page.evaluate(()=>{state.inv.medkit=1;P().hp=maxHp();refreshBagPanel();});await select('medkit');assert.equal(await quick.isDisabled(),true);assert.match(await quick.innerText(),/生命已满/);
   await info.tap();assert.equal(await page.locator('.bag-item-use').isDisabled(),true);await back.tap();
   await select('emp');assert.equal(await quick.isDisabled(),true);await select('serum');assert.equal(await quick.isDisabled(),true);
   await select('masteryManual');const consumableTop=await page.locator('.inventory-scroll').evaluate(n=>n.scrollTop);
   await page.locator('.bag-category-tabs button').filter({hasText:'材料'}).tap();await page.locator('.bag-category-tabs button').filter({hasText:'消耗品'}).tap();
   assert.equal(await page.locator('.inventory-scroll').evaluate(n=>n.scrollTop),consumableTop);assert.equal(await page.locator('.rpg-bag-body').getAttribute('data-selected-item'),'masteryManual');
   const manualsBefore=await page.evaluate(()=>state.inv.masteryManual);await quick.tap();
   assert.deepEqual(await page.evaluate(()=>[state.tab,state.charView,state.skillView]),['char','skills','active']);
   await page.locator('.skill-study-sheet').waitFor();assert.equal(await page.locator('.skill-projection').count(),1);assert.equal(await page.locator('.skill-mastery-study').count(),1);
   assert.equal(await page.locator('.bag-thumb-sheet,.mastery-book-sheet').count(),0);assert.equal(await page.locator('#panel').evaluate(n=>n.inert),true,'only the explicit study overlay locks its background');
   assert.equal(await page.evaluate(()=>state.inv.masteryManual),manualsBefore,'opening the mastery page never spends a manual');
   await page.locator('.skill-study-back').tap();await page.locator('.skill-collection-back').tap();assert.equal(await page.locator('#panel').evaluate(n=>n.inert),false);
   await page.locator('#tabbar [data-tab="bag"]').tap();assert.equal(await page.evaluate(()=>state.inv.masteryManual),manualsBefore,'returning to the backpack does not spend a manual');
   await page.locator('.bag-category-tabs button').filter({hasText:'装备'}).tap();await ready();
   const reopen=async()=>{await page.locator('#tabbar [data-tab="char"]').tap();await page.locator('#tabbar [data-tab="bag"]').tap();await ready();};
   const restart=async()=>{
    await page.reload();await page.evaluate(()=>{
     // Boot loads only this isolated context's persisted synthetic save. Do not
     // replace it with freshState: this is the actual restart persistence check.
     prepareLocalGame();state.tab='bag';state.bagView='equipment';document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');render();
    });await ready();
   };
   await reopen();assert.equal(await page.locator('.ui-bag-stage').isVisible(),true,'explicit expansion survives closing/reopening the backpack');
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).bagPortraitHidden),false,'expanded preference is actually serialized');
   await restart();assert.equal(await page.evaluate(()=>state.bagPortraitHidden),false);assert.equal(await page.locator('.ui-bag-stage').isVisible(),true,'explicit expansion survives game restart');
   await page.locator('.bag-look-toggle').tap();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).bagPortraitHidden),true);
   await page.locator('.bag-category-tabs button').filter({hasText:'材料'}).tap();await page.locator('.bag-category-tabs button').filter({hasText:'装备'}).tap();await ready();
   assert.equal(await page.locator('.ui-bag-stage').isVisible(),false,'explicit collapse survives category switches');
   await reopen();assert.equal(await page.locator('.ui-bag-stage').isVisible(),false);await restart();
   assert.equal(await page.evaluate(()=>state.bagPortraitHidden),true);assert.equal(await page.locator('.ui-bag-stage').isVisible(),false,'explicit collapse survives reopening and restart');
   await layout();assert.deepEqual(errors,[]);await context.close();
  }
  console.log('Thumb inventory V2: 4 touch viewports, real dock/icon insets, centered stable wear/unwear states, select/quick-action, uninterrupted replacement, explicit 13-stat details, conserved wear/unwear, stable tray/portrait, persistent collapsible preview, filter/category memory, compatibility, sources and no-waste use passed. '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
