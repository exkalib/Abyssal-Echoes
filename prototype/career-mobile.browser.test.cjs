// Isolated synthetic saves; never touches the player's browser profile.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.CAREER_TEST_URL||'http://127.0.0.1:4196/';
const output=process.env.CAREER_ARTIFACT_DIR||'output/career-identity-v1';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 fs.mkdirSync(output,{recursive:true});
 try{for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:520,height:844}]){
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage(),errors=[];
  await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(url).origin?route.continue():route.abort());
  page.on('pageerror',error=>{if(error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!String(error.stack).includes('http'))return;errors.push(String(error.stack));});
  await page.goto(url);await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.sound=false;state.music=false;state.tab='char';state.charView='careers';state.flags.braceletUnlocked=true;state.flags.mapUnlocked=true;
   render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
  });
  const layout=async()=>{
   assert.deepEqual(await page.evaluate(()=>{const p=document.querySelector('#panel');return [document.documentElement.scrollWidth<=innerWidth+1,document.documentElement.scrollHeight<=innerHeight+1,p.scrollWidth<=p.clientWidth+1,p.scrollHeight<=p.clientHeight+1];}),[true,true,true,true]);
   assert.equal(await page.locator('.career-view-tabs,.rpg-route-selectors,.career-route-action').count(),0,'no discipline page, route catalogue or remote learning');
   assert.equal(await page.locator('.career-identity').count(),1);
   const controls=await page.locator('.career-specialty,.career-profile-actions button').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.width>=43.5&&r.height>=43.5&&r.bottom<=document.querySelector('#tabbar').getBoundingClientRect().top+1&&(hit===n||n.contains(hit));}));
   assert.ok(controls.every(Boolean),'all three specialty slots and bottom actions are visible, reachable and >=44px');
   assert.equal(await page.locator('.career-specialty').count(),3);
   const stats=await page.locator('.career-identity-stats').evaluate(n=>({client:n.clientHeight,scroll:n.scrollHeight,stage:n.parentElement.clientHeight,caption:document.querySelector('.career-identity-caption').clientHeight,footer:document.querySelector('.career-profile-footer').clientHeight,career:document.querySelector('.career-identity').dataset.career}));
   assert.ok(stats.scroll<=stats.client+1,'all current career bonuses fit next to the portrait: '+JSON.stringify(stats));
   assert.equal(await page.locator('.career-identity-caption').evaluate(n=>n.scrollHeight<=n.clientHeight+1),true,'normal introduction and level visible without scrolling');
  };
  const shot=async name=>{await page.locator('.career-identity-art').evaluate(img=>img.decode());await page.screenshot({path:path.join(output,viewport.width+'-'+name+'.png'),animations:'disabled'});};
  await layout();assert.equal(await page.locator('.career-specialty:disabled').count(),3);assert.match(await page.locator('.career-identity').innerText(),/幸存者/);
  await shot('unassigned');await page.locator('.career-profile-details').tap();assert.match(await page.locator('.career-dossier').innerText(),/老乔/);await page.locator('.career-dossier-back').tap();
  // Real learning remains in the NPC panel and still enforces mentor location.
  await page.evaluate(()=>{P().location='outer';chooseNoviceJob('noviceGuard',()=>{});});
  assert.equal(await page.evaluate(()=>careerRecord('main')),null);
  await page.evaluate(()=>{P().location=npcLocation('老乔');const box=document.querySelector('#panel');box.innerHTML='';renderCareerMentorAction(box,'老乔');});
  await page.locator('.npc-career-card').filter({hasText:'见习盾卫'}).getByRole('button',{name:'开始训练'}).tap();
  await page.evaluate(()=>{state.tab='char';state.charView='careers';state.careerMainSelected='vanguard';render();});
  assert.deepEqual(await page.evaluate(()=>[careerRecord('main').id,state.inv.riotShield,skillUnlocked('shieldBash')]),['noviceGuard',1,true]);
  await page.waitForTimeout(100);await page.locator('#action-feedback').waitFor({state:'hidden'});
  assert.equal(await page.locator('.career-identity').getAttribute('data-career'),'noviceGuard','stale route preview cannot override actual identity');
  assert.match(await page.locator('.career-identity-stats').innerText(),/生命\s*\+5/);
  assert.doesNotMatch(await page.locator('.career-identity').innerText(),/脉冲游骑|裂隙猎手/);await layout();await shot('novice');
  await page.evaluate(()=>{setCareerRecord('main',{id:'bulwark',level:5,xp:7});P().equip.offhand='riotShield';setCareerRecord('life',{id:'noviceCollector',level:3,xp:4});ensureCareerSkills();refreshCareerPanel();});
  await shot('current');await layout();assert.equal(await page.locator('.career-specialty:disabled').count(),2);assert.equal(await page.locator('.career-specialty.learned').count(),1);
  const actual=await page.locator('.career-identity-stats .career-stat').allTextContents();
  assert.deepEqual(actual,['防御+12 +35%','生命+112 +25%','护盾+60','受到伤害−8%']);
  assert.match(await page.locator('.career-profile-progress').innerText(),/Lv 5/);await shot('current');
  // Locked specialty is inert even to a programmatic click.
  await page.locator('.career-specialty[data-career="fabricator"]').evaluate(n=>n.click());assert.equal(await page.locator('.career-profile-sheet').count(),0);
  const before=await page.evaluate(()=>JSON.stringify([state.meta.careers,state.inv]));
  await page.locator('.career-specialty.learned').tap();assert.match(await page.locator('.career-dossier').innerText(),/入门拾荒者/);assert.doesNotMatch(await page.locator('.career-dossier').innerText(),/制造技师|生态培育师/);
  assert.equal(await page.locator('#panel').evaluate(n=>n.inert),true);await page.locator('.career-dossier').evaluate(n=>n.parentElement.scrollTop=9999);await shot('specialty-details');
  await page.locator('.career-dossier-back').tap();assert.equal(await page.locator('#panel').evaluate(n=>n.inert),false);assert.equal(await page.evaluate(()=>JSON.stringify([state.meta.careers,state.inv])),before);
  await page.locator('.career-profile-details').tap();assert.match(await page.locator('.career-dossier').innerText(),/舰盾卫士/);await page.keyboard.press('Escape');await layout();
  await page.evaluate(()=>{setCareerRecord('life',{id:'noviceApprentice',level:2,xp:3});setCareerRecord('life',{id:'biologist',level:4,xp:9});refreshCareerPanel();});
  assert.equal(await page.locator('.career-specialty.learned').count(),3);
  for(const id of ['salvager','fabricator','biologist']){await page.locator('.career-specialty[data-career="'+id+'"]').tap();assert.equal(await page.locator('.career-dossier').count(),1);await page.locator('.career-dossier-back').tap();}
  for(const sex of ['male','female'])for(const id of ['vanguard','bulwark','infiltrator']){
   await page.evaluate(({sex,id})=>{state.playerAppearance=sex;setCareerRecord('main',{id,level:5,xp:7});refreshCareerPanel();},{sex,id});
   assert.match(await page.locator('.career-identity-art').getAttribute('src'),new RegExp(id+'-'+sex));await shot(sex+'-'+id);await layout();
  }
  await page.locator('.career-profile-skills').tap();assert.deepEqual(await page.evaluate(()=>[state.tab,state.charView,state.skillView]),['char','skills','active']);
  // Moving ritual execution to its world location must not strand the special career.
  await page.evaluate(()=>{setCareerRecord('main',{id:'bulwark',level:3,xp:0});state.flags.job_infiltrator_qualified=true;P().location='signal';P().equip.implant='neuralFilter';state.inv.biocore=6;state.inv.crystal=6;state.inv.core=2;state.inv.reclassCore=0;state.tab='act';state.screen='play';render();});
  assert.equal(await page.locator('#panel.field-console .career-ritual-prompt').count(),1,'qualified ritual is reachable in the actual world screen');
  assert.equal(await page.locator('#panel').evaluate(p=>p.scrollHeight<=p.clientHeight+1),true,'ritual entry must not push the world controls off screen');
  await page.locator('.career-ritual-prompt').tap();assert.equal(await page.locator('.career-ritual-confirm').isDisabled(),true);await page.locator('.career-dossier-back').tap();
  await page.evaluate(()=>{state.inv.reclassCore=1;});await page.locator('.career-ritual-prompt').tap();await page.locator('.career-ritual-confirm').tap();
  assert.deepEqual(await page.evaluate(()=>[careerRecord('main').id,state.inv.reclassCore,state.inv.biocore,state.inv.crystal,state.inv.core]),['infiltrator',0,0,0,0]);
  assert.deepEqual(errors,[]);await context.close();console.log(viewport.width+'px: current identity, actual stats, locked/learned specialty dialogs, NPC training, ritual costs, 6 portraits and reachable controls passed.');
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
