// Isolated touch contexts only. No user save, cloud, publishing, or APK installation.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const shots=process.env.THUMB_UI_ARTIFACT_DIR;
 if(shots)fs.mkdirSync(shots,{recursive:true});
 try{for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);
  await page.route('**/*',route=>/^http:\/\/127\.0\.0\.1:4187\//.test(route.request().url())?route.continue():route.abort());
  page.on('pageerror',e=>{if(e.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!String(e.stack).includes('http'))return;errors.push(String(e.stack));});
  await page.goto(process.env.THUMB_UI_TEST_URL||'http://127.0.0.1:4187/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.sound=false;state.music=false;
   Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true,builderUnlocked:true,guideDeparted:true});
   state.player.location='camp';state.tab='act';state.meta.echo=1000;
   for(const b of CAMP_BUILDINGS){state.meta.built[b.id]=true;state.meta.buildLevels[b.id]=1;}
   render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
  });
  const hit=async selector=>{
   const result=await page.locator(selector).first().evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {inside:r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1,size:r.width>=43.5&&r.height>=43.5,hit:node===hit||node.contains(hit),y:r.y};});
   assert.equal(result.inside,true,selector+' entirely in screen');assert.equal(result.hit,true,selector+' actual touch hit');assert.equal(result.size,true,selector+' 44px target');return result;
  };
  const noOverflow=async()=>assert.deepEqual(await page.evaluate(()=>{const p=document.querySelector('#panel');return [document.documentElement.scrollWidth<=innerWidth+1,document.documentElement.scrollHeight<=innerHeight+1,p.scrollWidth<=p.clientWidth+1];}),[true,true,true]);
  await noOverflow();assert.ok((await hit('.camp-build-action')).y>viewport.height*.6);await hit('.camp-depart');
  const capture=async name=>{if(shots)await page.screenshot({path:shots+'/'+viewport.width+'-'+name+'.png'});};
  await capture('camp');
  await page.locator('.camp-build-action').tap();assert.equal(await page.evaluate(()=>abyssHandleBack()),true);assert.equal(await page.locator('.camp-depart').count(),1);
  await page.locator('.camp-depart').tap();assert.equal(await page.evaluate(()=>state.mapOpen),true);assert.equal(await page.evaluate(()=>abyssHandleBack()),true);assert.equal(await page.evaluate(()=>state.mapOpen),false);
  await page.locator('#tabbar [data-tab="char"]').tap();await hit('.gene-entry');await hit('.echo-entry');await hit('.stats-entry');await capture('character');
  await page.evaluate(()=>{window.charStage=document.querySelector('.char-rpg-stage');});
  await page.locator('.echo-entry').tap();await page.waitForTimeout(250);await hit('.char-sheet-back');await noOverflow();
  await page.evaluate(()=>{window.echoRefs={button:document.querySelector('.char-echo-upgrade'),body:document.querySelector('.thumb-sheet-body'),footer:document.querySelector('.thumb-sheet-footer')};});
  const initial=await page.evaluate(()=>({level:state.meta.echoUp[echoRefs.button.dataset.echo],balance:state.meta.echo,cost:echoUpgradeCost(echoRefs.button.dataset.echo),id:echoRefs.button.dataset.echo}));
  await page.locator('.char-echo-upgrade').first().tap();await page.locator('.char-echo-upgrade').first().tap();
  const after=await page.evaluate(()=>({level:state.meta.echoUp[echoRefs.button.dataset.echo],same:echoRefs.button===document.querySelector('.char-echo-upgrade')&&echoRefs.body===document.querySelector('.thumb-sheet-body')&&echoRefs.footer===document.querySelector('.thumb-sheet-footer'),source:charStage===document.querySelector('.char-rpg-stage'),stored:JSON.parse(localStorage.getItem(SAVE_KEY)).meta.echo}));
  assert.equal(after.level,initial.level+2,'continuous upgrades');assert.equal(after.same,true,'upgrade keeps action and sheet nodes');assert.equal(after.source,true,'source character stage stays mounted');
  await capture('echo');assert.equal(await page.evaluate(()=>abyssHandleBack()),true);assert.equal(await page.locator('.thumb-sheet').count(),0);
  await page.locator('.stats-entry').tap();assert.equal(await page.locator('.char-advanced-stats .ui-stat-chip').count(),14);await page.locator('.char-sheet-back').tap();
  await page.locator('.gene-entry').tap();assert.equal(await page.evaluate(()=>abyssHandleBack()),true);assert.equal(await page.locator('#panel').getAttribute('data-view'),'character');
  assert.equal(await page.evaluate(()=>abyssHandleBack()),true);assert.equal(await page.locator('#panel').getAttribute('data-view'),'camp');
  await page.locator('#tabbar [data-tab="career"]').tap();assert.ok((await hit('.career-view-tabs button')).y>viewport.height*.65);await noOverflow();await capture('career');
  console.log(viewport.width+' camp, character, upgrade and back paths passed');
  for(const tab of ['skill','bag','task','char']){
   await page.locator('#tabbar [data-tab="'+tab+'"]').tap();await noOverflow();
   if(tab!=='skill')assert.equal(await page.locator('#panel').evaluate(n=>n.classList.contains('thumb-skills-page')),false);
  }
  // Moving a touch inside a button cancels its pressed state and any synthetic click.
  await page.evaluate(()=>{
   window.testClicks=0;window.vibrations=0;Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{vibrations++;return true;}});
   const b=document.querySelector('.stats-entry');b.addEventListener('click',()=>testClicks++);const r=b.getBoundingClientRect();
   b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:81,pointerType:'touch',clientX:r.x+20,clientY:r.y+20}));
   b.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:81,pointerType:'touch',clientX:r.x+20,clientY:r.y-20}));
   window.pressCancelled=!b.classList.contains('is-touching');
   b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:81,pointerType:'touch',clientX:r.x+20,clientY:r.y-20}));
   b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));
  });
  assert.deepEqual(await page.evaluate(()=>[pressCancelled,testClicks,vibrations]),[true,0,0],'drag is not a tap and gives no haptic');
  await page.locator('.stats-entry').tap();assert.equal(await page.locator('.char-stats-body').count(),1,'next intentional tap still works');await page.locator('.char-sheet-back').tap();
  assert.deepEqual(errors,[],viewport.width+' runtime errors');console.log('Thumb controls, geometry, upgrade continuity and back paths '+viewport.width+' passed');await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
