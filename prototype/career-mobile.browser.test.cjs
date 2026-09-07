// Fresh browser contexts and fixture state only. Never reads the player's save.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.CAREER_TEST_URL||'http://127.0.0.1:4196/';
const output=process.env.CAREER_ARTIFACT_DIR;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 if(output)fs.mkdirSync(output,{recursive:true});
 try{for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:520,height:844}]){
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage(),errors=[];
  await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(url).origin?route.continue():route.abort());
  page.on('pageerror',error=>{if(error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!String(error.stack).includes('http'))return;errors.push(String(error.stack));});
  await page.goto(url);await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.sound=false;state.music=false;state.tab='char';state.charView='careers';state.flags.braceletUnlocked=true;state.flags.mapUnlocked=true;
   render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
  });
  const checkLayout=async()=>{
   assert.deepEqual(await page.evaluate(()=>{const panel=document.querySelector('#panel');return [document.documentElement.scrollWidth<=innerWidth+1,document.documentElement.scrollHeight<=innerHeight+1,panel.scrollWidth<=panel.clientWidth+1,panel.scrollHeight<=panel.clientHeight+1];}),[true,true,true,true],'only career inspection may scroll');
   for(const selector of ['.career-view-tabs button','.rpg-route-selector','.career-route-action']){
    const checks=await page.locator(selector).evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {inside:r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1,size:r.width>=43.5&&r.height>=43.5,hit:hit===node||node.contains(hit)};}));
    for(const result of checks)assert.deepEqual(result,{inside:true,size:true,hit:true},selector+' '+JSON.stringify(await page.locator(selector).first().boundingBox()));
   }
   const bounds=await page.evaluate(()=>({tabs:document.querySelector('.career-view-tabs').getBoundingClientRect().bottom,action:document.querySelector('.career-route-action').getBoundingClientRect().top,nav:document.querySelector('#tabbar').getBoundingClientRect().top}));
   assert.ok(bounds.tabs<viewport.height*.35,'discipline selection directly below HUD');assert.ok(bounds.action>viewport.height*.6&&bounds.action<bounds.nav,'fixed action in thumb reach');
   const tooSmall=await page.locator('#panel').evaluate(node=>[...node.querySelectorAll('*')].filter(n=>n.getBoundingClientRect().height&&[...n.childNodes].some(c=>c.nodeType===3&&c.textContent.trim())&&parseFloat(getComputedStyle(n).fontSize)<10).map(n=>n.className));assert.deepEqual(tooSmall,[]);
  };
  const shot=async name=>{await page.locator('.career-route-art').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode()));if(images.some(img=>!img.naturalWidth))throw Error('职业立绘未解码');});if(output)await page.screenshot({path:path.join(output,viewport.width+'-'+name+'.png'),animations:'disabled'});};
  await checkLayout();assert.equal(await page.locator('.career-view-tabs button').count(),2);assert.equal(await page.locator('.rpg-route-selector').count(),3);assert.equal(await page.locator('.career-path-card').count(),1);await shot('unassigned');
  // Selecting a route is a preview, not a learning or spending action.
  await page.evaluate(()=>{window.careerRefs={app:document.querySelector('#app'),tabs:document.querySelector('.career-view-tabs'),list:document.querySelector('.rpg-route-selectors'),action:document.querySelector('.career-route-action'),inv:JSON.stringify(state.inv)};});
  await page.locator('[data-career="bulwark"].rpg-route-selector').tap();
  assert.deepEqual(await page.evaluate(()=>[careerRecord('main'),JSON.stringify(state.inv)===window.careerRefs.inv,window.careerRefs.list===document.querySelector('.rpg-route-selectors'),window.careerRefs.action===document.querySelector('.career-route-action')]),[null,true,true,true]);
  // Mentor location gates entry, then the same action learns the real novice and grants the real shield.
  await page.evaluate(()=>{P().location='outer';refreshCareerPanel();});assert.equal(await page.locator('.career-route-action').isDisabled(),true);assert.match(await page.locator('.rpg-route-next').innerText(),/老乔/);
  await page.evaluate(()=>{P().location=npcLocation('老乔');refreshCareerPanel();});assert.equal(await page.locator('.career-route-action').isEnabled(),true);await page.locator('.career-route-action').tap();
  assert.deepEqual(await page.evaluate(()=>[careerRecord('main').id,state.inv.riotShield,skillUnlocked('shieldBash'),window.careerRefs.list===document.querySelector('.rpg-route-selectors'),window.careerRefs.action===document.querySelector('.career-route-action'),window.careerRefs.tabs===document.querySelector('.career-view-tabs')]),['noviceGuard',1,true,true,true,true]);
  await page.waitForTimeout(180);assert.equal(await page.locator('#action-feedback.is-visible').count(),0,'职业名称与发放装备已原位反馈，不再弹通知遮挡按钮');
  assert.equal(await page.locator('.career-route-action').isDisabled(),true);assert.match(await page.locator('.rpg-route-next').innerText(),/小唐|林薇/);await checkLayout();await shot('novice');
  // Qualification and route-exclusive reclass costs are unchanged.
  await page.evaluate(()=>{state.flags.job_bulwark_qualified=true;refreshCareerPanel();});await page.locator('.career-route-action').tap();assert.equal(await page.evaluate(()=>careerRecord('main').id),'bulwark');await shot('main');
  await page.locator('[data-career="vanguard"].rpg-route-selector').tap();await page.evaluate(()=>{state.flags.job_vanguard_qualified=true;delete state.inv.reclassCore;refreshCareerPanel();});assert.equal(await page.locator('.career-route-action').isDisabled(),true);assert.match(await page.locator('.rpg-route-next').innerText(),/重构核心/);
  await page.evaluate(()=>{state.inv.reclassCore=1;refreshCareerPanel();});await page.locator('.career-route-action').tap();assert.deepEqual(await page.evaluate(()=>[careerRecord('main').id,state.inv.reclassCore]),['vanguard',0]);
  // Life specialties are independent; lack of materials cannot be bypassed by preview clicks.
  await page.locator('[data-career-view="life"]').tap();await page.locator('[data-career="fabricator"].rpg-route-selector').tap();
  await page.evaluate(()=>{P().location=npcLocation('阿珍');state.inv.scrap=5;state.inv.ecomp=2;refreshCareerPanel();});assert.equal(await page.locator('.career-route-action').isDisabled(),true);assert.match(await page.locator('.rpg-route-next').innerText(),/材料不足/);
  await page.evaluate(()=>{state.inv.scrap=6;refreshCareerPanel();});await page.locator('.career-route-action').tap();assert.deepEqual(await page.evaluate(()=>[careerRecord('life','fabricator').id,state.inv.scrap,state.inv.ecomp,careerRecord('main').id]),['noviceApprentice',0,0,'vanguard']);
  await page.evaluate(()=>{setCareerRecord('life',{id:'noviceCollector',level:3,xp:4});setCareerRecord('life',{id:'noviceGrower',level:2,xp:3});state.flags.job_fabricator_qualified=true;refreshCareerPanel();});assert.equal(await page.locator('.career-route-action').isDisabled(),true);assert.match(await page.locator('.rpg-route-next').innerText(),/Lv3/);
  await page.evaluate(()=>{careerRecord('life','fabricator').level=3;refreshCareerPanel();});await page.locator('.career-route-action').tap();assert.deepEqual(await page.evaluate(()=>[careerRecords('life').length,careerRecord('life','fabricator').id,careerRecord('main').id]),[3,'fabricator','vanguard']);
  assert.equal(await page.locator('.rpg-route-selector.learned').count(),3);assert.equal(await page.locator('.career-route-art').count(),0,'life skills never replace identity with a profession body');await checkLayout();await shot('life');
  assert.equal(await page.locator('.career-abilities').evaluate(node=>node.open),true);await page.evaluate(()=>{document.querySelector('.career-inspection').scrollTop=9999;});await checkLayout();assert.equal(await page.evaluate(()=>document.querySelector('#panel').scrollTop),0);await shot('life-details');
  await page.locator('.career-route-action').tap();assert.deepEqual(await page.evaluate(()=>[state.tab,state.charView,state.skillView,state.skillCatalogue]),['char','skills','auto',false]);
  for(const sex of ['male','female'])for(const id of ['vanguard','bulwark','infiltrator']){
   await page.evaluate(({sex,id})=>{state.tab='char';state.charView='careers';state.careerView='main';state.careerMainSelected=id;state.playerAppearance=sex;setCareerRecord('main',{id,level:5,xp:7});render();},{sex,id});
   await page.locator('.career-route-art').evaluate(img=>img.decode());assert.match(await page.locator('.career-route-art').getAttribute('src'),new RegExp(id+'-'+sex));await checkLayout();await shot(sex+'-'+id);
  }
  assert.deepEqual(errors,[]);await context.close();console.log(viewport.width+'px: career preview, mentor/material qualification, real promotion, reclass, parallel life, fixed controls and both portraits passed.');
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
