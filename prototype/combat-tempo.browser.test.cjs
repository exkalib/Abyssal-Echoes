// Disposable browser contexts with synthetic saves; never opens the player's file tab.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const out='output/combat-tempo';fs.mkdirSync(out,{recursive:true});
 try{for(const [width,height] of [[360,640],[390,844],[412,915],[520,844]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&e.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!String(e.stack).includes('http'))return;errors.push(e.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.sound=false;state.music=false;
   Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});state.tab='char';state.charView='skills';state.skillView='active';state.inv.masteryManual=1;state.skills.heavy={prof:10};state.skillSlots=['heavy',null,null];P().equip.weapon='knife';render();
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
  });
  await page.locator('[data-collection="mastery"]').tap();
  await page.locator('[data-skill="mastery:rangeMastery"]').tap();
  assert.match(await page.locator('.skill-study-sheet').innerText(),/射程精通/);
  // Verify the actual study action and stat formula, not a fake label.
  await page.evaluate(()=>{useMasteryManual('rangeMastery',1);});
  assert.equal(await page.evaluate(()=>atkRange()),2);
  await page.evaluate(()=>{
   state.masteries.rangeMastery=50;state.masteries.speedMastery=90;
   startCombat('beast',{hp:1e6,maxHp:1e6,atk:1,def:1,distNow:30,spd:10});
  });
  assert.match(await page.locator('.battle-tempo').innerText(),/速度 100 : 10[\s\S]*10 次/);
  assert.equal(await page.locator('.battle-strike').isEnabled(),true,'近战武器可以攻击远处目标');
  await page.locator('.battle-screen').evaluate(node=>Promise.all(node.getAnimations({subtree:true}).filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished)));
  const issue=await page.evaluate(()=>{
   const panel=document.querySelector('#panel'),problems=[];
   if(panel.scrollHeight>panel.clientHeight+1||document.documentElement.scrollWidth>innerWidth+1)problems.push('outer overflow');
   for(const b of document.querySelectorAll('.battle-primary-controls button')){const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(r.bottom>innerHeight||r.height<44||!b.contains(hit))problems.push('action unreachable');}
   return problems;
  });
  await page.screenshot({path:out+'/'+width+'-battle.png',animations:'disabled'});assert.deepEqual(issue,[]);
  // Skill and normal attack share one action clock; the first nine actions give no enemy turn.
  await page.evaluate(()=>useSkill('heavy'));
  assert.equal(await page.evaluate(()=>state.combat.playerTurns),1);
  for(let i=0;i<8;i++)await page.locator('.battle-strike').tap();
  assert.equal(await page.evaluate(()=>state.combat.enemyTurns||0),0);
  assert.match(await page.locator('.battle-tempo').innerText(),/1 次/);
  await page.locator('.battle-strike').tap();
  assert.equal(await page.evaluate(()=>state.combat.enemyTurns),1);
  assert.equal(await page.evaluate(()=>state.combat.playerTurns),10);
  assert.deepEqual(errors,[]);await ctx.close();
 }
 console.log('Combat mobile: mastery entry, long-range melee/skill, ten consecutive real actions and reachable buttons passed at four sizes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
