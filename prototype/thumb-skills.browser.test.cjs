// Disposable mobile contexts only. This test never opens the player's profile or cloud save.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(process.env.SKILLS_QA_OUTPUT||'output/mobile-skills-v2');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:520,height:844}]){
   const context=await browser.newContext({viewport,hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
   await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
   await page.evaluate(()=>{
    prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.sound=false;state.music=false;
    Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});state.meta.careers.main={id:'bulwark',level:5,xp:7};state.meta.careers.life=[{id:'noviceCollector',level:2,xp:3}];
    state.skills.pierce={prof:10};state.skills.heavy={prof:10};ensureCareerSkills();state.skillSlots=['shieldBash','kineticBrace',null];state.masteries.gatherMastery=2;state.inv.masteryManual=150;state.inv.heavyBook=2;
    state.skillCatalogue=false;state.skillView='active';state.tab='char';state.charView='skills';render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
    window.skillRefs={panel:document.querySelector('#panel'),hero:document.querySelector('.skill-console-head'),list:document.querySelector('.skill-browser[data-skill-view="active"] .skill-library-grid'),inspector:document.querySelector('.skill-inspector'),heavy:document.querySelector('.skill-library-card[data-skill="heavy"]')};
    window.skillRenderCount=0;const originalRender=render;render=function(){window.skillRenderCount++;return originalRender.apply(this,arguments);};
    window.skillToasts=[];const originalQueue=queueStandaloneFeedback;queueStandaloneFeedback=function(message){window.skillToasts.push(message);return originalQueue.apply(this,arguments);};
   });
   async function verify(label){
    await page.waitForTimeout(180);
    const issues=await page.evaluate(()=>{
     const result=[],panel=document.querySelector('#panel'),inspector=document.querySelector('.skill-inspector'),body=document.querySelector('.skill-inspector-body'),footer=document.querySelector('.skill-action-dock'),r=footer.getBoundingClientRect();
     if(panel.scrollHeight>panel.clientHeight+1)result.push('whole page scrolls '+panel.scrollHeight+'/'+panel.clientHeight);
     if(panel.scrollWidth>panel.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1)result.push('horizontal overflow');
     if(r.bottom>innerHeight-40||r.top<innerHeight*.5)result.push('actions not in thumb zone '+r.top+'–'+r.bottom);
     if(document.querySelectorAll('.thumb-sheet-backdrop,.skill-thumb-sheet,[role="dialog"]').length)result.push('selection opened a modal');
     for(const node of panel.querySelectorAll('button,input,summary')){
      const rect=node.getBoundingClientRect();if(!rect.width||!rect.height||node.closest('[hidden]'))continue;
      if(rect.width<43.5||rect.height<43.5)result.push(node.className+' touch '+rect.width+'×'+rect.height);
     }
     const comparison=document.querySelector('.skill-effect-comparison');
     if(comparison&&body.scrollTop===0&&comparison.getBoundingClientRect().bottom>body.getBoundingClientRect().bottom+1&&comparison.getBoundingClientRect().height<80)result.push('normal current/next benefit not visible before scrolling');
     const detail=document.querySelector('.skill-detail-panel'),use=document.querySelector('.skill-detail-use');
     if(use&&body.scrollTop===0&&['heavy','quickScavenge'].includes(detail.dataset.skill)){
      const text=use.getBoundingClientRect(),visible=body.getBoundingClientRect();
      if(text.top<visible.top||text.bottom>visible.bottom-2)result.push('actual use-condition text is clipped or flush to the inspector edge: '+text.top+'–'+text.bottom+' in '+visible.top+'–'+visible.bottom);
     }
     for(const button of panel.querySelectorAll('.skill-book-action,.skill-mastery-confirm')){
      const rect=button.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(button);const text=range.getBoundingClientRect(),style=getComputedStyle(button);
      if(rect.height<47.5||style.textAlign!=='center'||Math.abs(text.left+text.width/2-rect.left-rect.width/2)>1.5||Math.abs(text.top+text.height/2-rect.top-rect.height/2)>1.5)result.push(button.className+' primary label is not centered in a 48px target');
      if(text.left<rect.left+7||text.right>rect.right-7||text.top<rect.top+5||text.bottom>rect.bottom-5)result.push(button.className+' primary label has insufficient inner spacing');
     }
     return result;
    });if(issues.length)await page.screenshot({path:path.join(out,viewport.width+'-failure.png')});assert.deepEqual(issues,[],label+' '+viewport.width+'×'+viewport.height);
   }
   assert.equal(await page.locator('.skill-assign-slot').count(),3,'one bottom set of three combat slots');
   assert.equal(await page.locator('.skill-library-card.locked:visible').count(),0,'default shows only learned skills');
   assert.equal(await page.locator('.skill-library-card[data-skill="reactiveArmor"]').evaluate(n=>n.closest('.skill-browser').dataset.skillView),'auto','passives separated from active equip list');
   await page.locator('.skill-library-card[data-skill="heavy"]').tap();
   await verify('selected active');await page.screenshot({path:path.join(out,viewport.width+'-active.png'),animations:'disabled'});
   assert.match(await page.locator('.skill-current').innerText(),/1.85/);assert.match(await page.locator('.skill-next').innerText(),/研读后 Lv3.*1.95/s,'book preview matches its actual +20 proficiency, not just one level');
   await page.evaluate(()=>{window.detailRefs={root:document.querySelector('.skill-detail-panel'),effect:document.querySelector('.rpg-skill-effect'),book:document.querySelector('.skill-book-action'),assign:[...document.querySelectorAll('.skill-assign-slot')],top:document.querySelector('.skill-book-action').getBoundingClientRect().top};});
   await page.locator('.skill-assign-slot[data-slot="2"]').tap();assert.deepEqual(await page.evaluate(()=>[state.skillSlots[2],state.inv.heavyBook]),['heavy',2],'one tap equips without spending');
   assert.match(await page.locator('.skill-detail-level').innerText(),/已装配.*3/);
   await page.locator('.skill-assign-slot[data-slot="2"]').tap();assert.equal(await page.evaluate(()=>state.skillSlots[2]),null);
   await page.locator('.skill-assign-slot[data-slot="1"]').tap();assert.equal(await page.evaluate(()=>state.skillSlots[1]),'heavy');
   await page.locator('.skill-book-action').tap();assert.deepEqual(await page.evaluate(()=>[skillLv('heavy'),state.inv.heavyBook]),[3,1]);
   await page.locator('.skill-book-action').tap();assert.equal(await page.locator('.skill-book-action').isDisabled(),true);
   assert.equal(await page.evaluate(()=>window.detailRefs.root===document.querySelector('.skill-detail-panel')&&window.detailRefs.effect===document.querySelector('.rpg-skill-effect')&&window.detailRefs.book===document.querySelector('.skill-book-action')&&window.detailRefs.assign.every((n,i)=>n===document.querySelectorAll('.skill-assign-slot')[i])&&Math.abs(window.detailRefs.top-document.querySelector('.skill-book-action').getBoundingClientRect().top)<1),true,'equip/upgrade/depletion keep action nodes and coordinates');
   await verify('depleted books');
   await page.locator('.skill-library-card[data-skill="heavy"]').tap();assert.equal(await page.evaluate(()=>window.detailRefs.root===document.querySelector('.skill-detail-panel')),true,'repeat selection is a no-op');
   await page.locator('.skill-category-tabs button').nth(1).tap();await page.locator('.skill-library-card[data-skill="reactiveArmor"]').tap();assert.equal(await page.locator('.skill-assign-slot').count(),0);assert.match(await page.locator('.skill-detail-level').innerText(),/自动生效/);
   await page.locator('.skill-library-card[data-skill="quickScavenge"]').tap();assert.match(await page.locator('.skill-detail-use').innerText(),/资源点.*采集时自动/);await verify('automatic life ability');await page.screenshot({path:path.join(out,viewport.width+'-auto.png'),animations:'disabled'});
   await page.locator('.skill-category-tabs button').nth(2).tap();await page.locator('.skill-library-card[data-skill="mastery:gatherMastery"]').tap();
   await page.waitForTimeout(50);assert.match(await page.locator('.skill-library-count').innerText(),/^12 项/);if(viewport.height===640)assert.match(await page.locator('.skill-library-count').innerText(),/上滑查看更多/,'short-screen mastery catalogue explicitly exposes the hidden rows');
   assert.equal(await page.locator('.skill-library-card[data-skill="mastery:attackMastery"]').isVisible(),true,'zero-level masteries are available to study without catalogue detour');
   await page.evaluate(()=>{window.masteryRefs={input:document.querySelector('.skill-mastery-quantity'),confirm:document.querySelector('.skill-mastery-confirm'),top:document.querySelector('.skill-mastery-confirm').getBoundingClientRect().top};});
   await page.locator('.skill-mastery-controls button').last().tap();assert.equal(await page.locator('.skill-mastery-quantity').inputValue(),'101');assert.equal(await page.evaluate(()=>state.inv.masteryManual),150);assert.match(await page.locator('.skill-next').innerText(),/Lv103.*超限/s);
   await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[masteryLv('gatherMastery'),state.inv.masteryManual]),[103,49]);await verify('mastery beyond 100');await page.screenshot({path:path.join(out,viewport.width+'-mastery.png'),animations:'disabled'});
   await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[masteryLv('gatherMastery'),state.inv.masteryManual]),[152,0]);assert.equal(await page.locator('.skill-mastery-confirm').isDisabled(),true);
   assert.equal(await page.evaluate(()=>window.masteryRefs.input===document.querySelector('.skill-mastery-quantity')&&window.masteryRefs.confirm===document.querySelector('.skill-mastery-confirm')&&Math.abs(window.masteryRefs.top-document.querySelector('.skill-mastery-confirm').getBoundingClientRect().top)<1),true,'manual depletion preserves the button position');
   await verify('no manual');assert.match(await page.locator('.skill-mastery-guide').innerText(),/老乔/);
   await page.locator('.skill-category-tabs button').nth(0).tap();await page.locator('.skill-catalogue-toggle').tap();assert.ok(await page.locator('.skill-library-card.locked:visible').count()>0);
   await page.evaluate(()=>{const node=document.querySelector('.skill-browser[data-skill-view="active"]');node.scrollTop=80;window.skillScroll=node.scrollTop;});
   await page.locator('.skill-category-tabs button').nth(1).tap();await page.locator('.skill-category-tabs button').nth(0).tap();assert.equal(await page.evaluate(()=>document.querySelector('.skill-browser[data-skill-view="active"]').scrollTop),await page.evaluate(()=>window.skillScroll));
   await page.locator('.skill-browser:visible .skill-library-card.locked').first().tap();assert.equal(await page.locator('.skill-assign-slot:enabled').count(),0);assert.match(await page.locator('.skill-detail-use').innerText(),/学会后/);
   await page.locator('.skill-growth-guide summary').tap();await page.evaluate(()=>{document.querySelector('.skill-inspector-body').scrollTop=10000;});await verify('expanded rules remain internal');
   assert.equal(await page.evaluate(()=>window.skillRefs.hero===document.querySelector('.skill-console-head')&&window.skillRefs.list===document.querySelector('.skill-browser[data-skill-view="active"] .skill-library-grid')&&window.skillRefs.inspector===document.querySelector('.skill-inspector')&&window.skillRenderCount===0),true);
   await page.evaluate(()=>{state.inv.masteryManual=2;state.masteries.attackMastery=7;state.skillSelected='mastery:attackMastery';state.tab='bag';state.bagView='consumable';render();});
   await page.locator('.item[data-item="masteryManual"]').tap();await page.locator('.bag-quick-action').tap();
   assert.deepEqual(await page.evaluate(()=>[state.tab,state.charView,state.skillView,state.inv.masteryManual,masteryLv('attackMastery')]),['char','skills','mastery',2,7],'bag quick mastery entry selects the unified page without spending');
   assert.equal(await page.locator('.skill-detail-panel').getAttribute('data-skill'),'mastery:attackMastery','valid mastery selection survives the bag handoff');
   await verify('bag quick mastery entry');await page.locator('[data-tab="bag"]').tap();
   assert.deepEqual(await page.evaluate(()=>[state.inv.masteryManual,masteryLv('attackMastery')]),[2,7],'leaving the mastery page does not consume a book');
   await page.locator('.item[data-item="masteryManual"]').tap();await page.locator('.bag-selection-info').tap();await page.locator('.bag-item-use').tap();
   assert.equal(await page.locator('.skill-detail-panel').getAttribute('data-skill'),'mastery:attackMastery');assert.equal(await page.locator('.bag-thumb-sheet,.mastery-book-sheet,.site-sheet-backdrop').count(),0,'full item detail closes before opening the unified mastery page');
   assert.deepEqual(await page.evaluate(()=>[state.inv.masteryManual,masteryLv('attackMastery')]),[2,7],'full-detail entry also does not spend');
   await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[state.inv.masteryManual,masteryLv('attackMastery')]),[1,8]);assert.match(await page.locator('.skill-mastery-confirm').innerText(),/Lv8 → Lv9/);
   await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[state.inv.masteryManual,masteryLv('attackMastery')]),[0,9]);assert.equal(await page.locator('.skill-mastery-confirm').isDisabled(),true);assert.match(await page.locator('.skill-mastery-confirm').innerText(),/缺少精通训练手册/);assert.match(await page.locator('.skill-current').innerText(),/Lv9/);await verify('bag mastery handoff depleted');
   assert.deepEqual(await page.evaluate(()=>window.skillToasts),[],'visible equip and upgrade changes never queue blocking toasts');assert.deepEqual(errors,[]);await context.close();
  }
  console.log('Mobile skills: 4 widths; persistent selection and actions, active/automatic separation, current/next rewards, explicit unlimited mastery study, missing costs, stable DOM, internal scrolling passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
