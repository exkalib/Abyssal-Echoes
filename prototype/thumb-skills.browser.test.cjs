// Disposable contexts and synthetic saves only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(process.env.SKILLS_QA_OUTPUT||'output/skills-attunement-v1');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:520,height:844}]){
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{if(e.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!String(e.stack).includes('http'))return;errors.push(e.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.sound=false;state.music=false;Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});
   state.meta.careers.main={id:'bulwark',level:5,xp:7};state.meta.careers.life=[{id:'noviceCollector',level:2,xp:3}];state.skills.pierce={prof:10};state.skills.heavy={prof:10};ensureCareerSkills();
   state.skillSlots=['shieldBash','kineticBrace',null];state.masteries.gatherMastery=2;state.inv.masteryManual=150;state.inv.heavyBook=2;P().equip.offhand='riotShield';
   state.skillCatalogue=false;state.skillView='active';state.tab='char';state.charView='skills';render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
   window.skillRefs={stage:document.querySelector('.skill-projection'),library:document.querySelector('.skill-library-grid')};window.skillToasts=[];const q=queueStandaloneFeedback;queueStandaloneFeedback=function(e){window.skillToasts.push(e);return q.apply(this,arguments);};
  });
  const shot=async name=>page.screenshot({path:path.join(out,viewport.width+'-'+name+'.png'),animations:'disabled'});
  const layout=async()=>{
   await page.waitForTimeout(100);
   const issues=await page.evaluate(()=>{
    const p=document.querySelector('#panel'),out=[],dock=document.querySelector('.skill-game-actions'),projection=document.querySelector('.skill-projection'),visible=document.querySelector('.skill-projection-readout');
    if(p.scrollHeight>p.clientHeight+1||p.scrollWidth>p.clientWidth+1||document.documentElement.scrollHeight>innerHeight+1)out.push('outer scroll');
    if(dock.getBoundingClientRect().bottom>document.querySelector('#tabbar').getBoundingClientRect().top+1)out.push('dock overlaps nav');
    if(projection.clientHeight<125)out.push('projection compressed '+projection.clientHeight);
    for(const n of p.querySelectorAll('button')){const r=n.getBoundingClientRect();if(!r.width||!r.height||n.closest('[hidden]'))continue;if(r.width<43.5||r.height<43.5)out.push(n.className+' undersized '+r.width+'x'+r.height);}
    for(const n of p.querySelectorAll('.skill-game-actions button')){const r=n.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(hit!==n&&!n.contains(hit))out.push('footer not reachable');}
    if(document.querySelector('#panel input,#panel .skill-effect-comparison,#panel .skill-inspector'))out.push('training form is still on the game screen');
    return out;
   });if(issues.length)await shot('failure');assert.deepEqual(issues,[]);
  };
  const study=()=>page.locator('.skill-study-entry').tap(),back=()=>page.locator('.skill-study-back').tap();
  assert.equal(await page.locator('.skill-assign-slot').count(),3);assert.equal(await page.locator('.skill-library-card.locked:visible').count(),0);
  await page.locator('.skill-library-card[data-skill="heavy"]').tap();await layout();await shot('active');
  assert.equal(await page.locator('[role="dialog"]').count(),0);assert.match(await page.locator('.skill-projection-effect').innerText(),/1.85/);
  await page.evaluate(()=>{window.sig=document.querySelector('.skill-projection-emblem');window.slotNodes=[...document.querySelectorAll('.skill-assign-slot')];});
  await page.locator('.skill-assign-slot[data-slot="2"]').tap();assert.deepEqual(await page.evaluate(()=>[state.skillSlots[2],state.inv.heavyBook]),['heavy',2]);assert.match(await page.locator('.skill-projection-status').innerText(),/已装配.*3/);
  assert.equal(await page.evaluate(()=>window.sig===document.querySelector('.skill-projection-emblem')),true,'equip does not replay projection');
  await page.locator('.skill-assign-slot[data-slot="2"]').tap();assert.equal(await page.evaluate(()=>state.skillSlots[2]),null);
  await page.locator('.skill-assign-slot[data-slot="1"]').tap();assert.equal(await page.evaluate(()=>state.skillSlots[1]),'heavy');assert.ok(await page.locator('.skill-assign-slot[data-slot="1"] use').getAttribute('href'));
  await study();assert.equal(await page.locator('.skill-study-sheet .skill-assign-slot').count(),0,'study does not duplicate equip controls');assert.equal(await page.locator('#panel').evaluate(n=>n.inert),true);
  assert.match(await page.locator('.skill-next').innerText(),/研读后 Lv3.*1.95/s);
  await page.evaluate(()=>{window.studyBook=document.querySelector('.skill-book-action');});await page.locator('.skill-book-action').tap();
  assert.deepEqual(await page.evaluate(()=>[skillLv('heavy'),state.inv.heavyBook]),[3,1]);await page.locator('.skill-book-action').tap();assert.equal(await page.locator('.skill-book-action').isDisabled(),true);
  assert.equal(await page.evaluate(()=>window.studyBook===document.querySelector('.skill-book-action')),true);await shot('study');await back();await layout();
  assert.match(await page.locator('.skill-projection-effect').innerText(),/2.05/);assert.equal(await page.evaluate(()=>window.sig===document.querySelector('.skill-projection-emblem')&&window.slotNodes.every((n,i)=>n===document.querySelectorAll('.skill-assign-slot')[i])),true);
  await page.locator('.skill-library-card[data-skill="heavy"]').tap();assert.equal(await page.evaluate(()=>window.sig===document.querySelector('.skill-projection-emblem')),true,'repeated selection must not replay effects');
  assert.equal(await page.locator('.skill-category-tabs,.skill-thumb-dock').count(),0,'no category tabs, including hidden ones');assert.equal(await page.locator('#panel .skill-browser').count(),1,'only one actual combat library exists');
  await page.evaluate(()=>{window.combatSelection=state.skillSelected;window.combatScroll=document.querySelector('#panel .skill-browser').scrollTop;});
  await page.locator('[data-collection="auto"]').tap();assert.equal(await page.locator('.skill-collection-sheet').count(),1);assert.equal(await page.locator('#panel').evaluate(n=>n.inert),true);await shot('auto');
  await page.locator('.skill-collection-sheet .skill-library-card[data-skill="quickScavenge"]').tap();assert.equal(await page.locator('.skill-study-sheet .skill-assign-slot').count(),0);assert.match(await page.locator('.skill-detail-use').innerText(),/资源点/);assert.match(await page.locator('.skill-auto-status').innerText(),/不占战斗技能栏/);
  await back();assert.equal(await page.locator('.skill-collection-sheet').count(),1);await page.locator('.skill-collection-back').tap();await layout();
  assert.equal(await page.evaluate(()=>state.skillSelected===window.combatSelection&&document.querySelector('#panel .skill-browser').scrollTop===window.combatScroll),true);
  await page.locator('[data-collection="mastery"]').tap();assert.equal(await page.locator('.skill-collection-sheet .skill-library-card').count(),13);await shot('mastery');
  await page.locator('.skill-collection-sheet .skill-library-card[data-skill="mastery:gatherMastery"]').tap();
  await page.locator('.skill-mastery-controls button').last().tap();assert.equal(await page.locator('.skill-mastery-quantity').inputValue(),'101');assert.equal(await page.evaluate(()=>state.inv.masteryManual),150);
  assert.match(await page.locator('.skill-next').innerText(),/Lv103.*超限/s);await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[masteryLv('gatherMastery'),state.inv.masteryManual]),[103,49]);
  await page.evaluate(()=>{window.masteryButton=document.querySelector('.skill-mastery-confirm');window.masteryTop=window.masteryButton.getBoundingClientRect().top;});await page.locator('.skill-mastery-confirm').tap();
  assert.deepEqual(await page.evaluate(()=>[masteryLv('gatherMastery'),state.inv.masteryManual]),[152,0]);assert.equal(await page.locator('.skill-mastery-confirm').isDisabled(),true);
  assert.equal(await page.evaluate(()=>window.masteryButton===document.querySelector('.skill-mastery-confirm')&&Math.abs(window.masteryTop-window.masteryButton.getBoundingClientRect().top)<1),true);
  await shot('mastery-study');await back();assert.match(await page.locator('.skill-collection-sheet [data-skill="mastery:gatherMastery"]').innerText(),/Lv152/);await page.locator('.skill-collection-back').tap();await layout();
  assert.equal(await page.evaluate(()=>state.skillSelected===window.combatSelection&&state.skillView==='active'),true,'mastery selection never replaces the current combat skill');
  await page.locator('.skill-catalogue-toggle').tap();await page.locator('#panel .skill-library-card.locked:visible').first().tap();
  assert.equal(await page.locator('.skill-assign-slot:enabled').count(),0);await study();assert.equal(await page.locator('.skill-study-sheet .skill-book-action:enabled').count(),0);await page.keyboard.press('Escape');await layout();
  assert.equal(await page.evaluate(()=>window.skillRefs.stage===document.querySelector('.skill-projection')&&window.skillRefs.library===document.querySelector('.skill-library-grid')),true,'collection overlays retain the combat scene and library');
  await page.evaluate(()=>{state.inv.masteryManual=2;state.masteries.attackMastery=7;state.skillSelected='mastery:attackMastery';state.tab='bag';state.bagView='consumable';render();});
  await page.locator('.item[data-item="masteryManual"]').tap();await page.locator('.bag-quick-action').tap();await page.locator('.skill-study-sheet').waitFor();assert.equal(await page.locator('.skill-detail-panel').getAttribute('data-skill'),'mastery:attackMastery');assert.equal(await page.evaluate(()=>state.inv.masteryManual),2);
  await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[masteryLv('attackMastery'),state.inv.masteryManual]),[8,1]);await back();assert.match(await page.locator('.skill-collection-sheet [data-skill="mastery:attackMastery"]').innerText(),/Lv8/);await page.locator('.skill-collection-back').tap();
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.skill-projection-emblem').evaluate(n=>getComputedStyle(n).animationName),'none');
  assert.deepEqual(await page.evaluate(()=>window.skillToasts),[]);assert.deepEqual(errors,[]);await context.close();console.log(viewport.width+'px: projection, 3 glyph slots, learned library, inert study sheet, exact book/mastery costs, no replay, reduced motion, bag entry and internal scrolling passed.');
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
