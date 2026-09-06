// Character page and backpack must render the exact same physical loadout.
// Fresh contexts only; never loads a real user's browser profile or save.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.CHARACTER_WARDROBE_OUTPUT;
const occupiedSample=process.env.CHARACTER_WARDROBE_SAMPLE==='blade';
(async()=>{
 if(output)fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:520,height:844}]){
   const page=await browser.newPage({viewport}),errors=[];page.setDefaultTimeout(15000);
   page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
   await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
   await page.evaluate(occupiedSample=>{
    prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.flags.braceletUnlocked=true;state.meta.echo=10000;
    state.tab='char';state.charView='overview';state.player.equip={weapon:'knife',offhand:'riotShield',head:'helmet',body:'body_general_1',hands:'workGloves',legs:'fieldGreaves',feet:'gravityBoots',back:'capacitorPack',implant:'neuralFilter',module:'module_general_5'};
    if(occupiedSample){state.player.equip.weapon='blade';delete state.player.equip.hands;}
    state.meta.careers.life=[{id:'salvager',level:2,xp:0},{id:'fabricator',level:2,xp:0},{id:'biologist',level:2,xp:0}];state.inv.magboots=2;state.inv.gravityBoots=2;
    document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
   },occupiedSample);
   const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});
   const portrait=()=>page.evaluate(()=>[...document.querySelectorAll('.doll-art-host [data-wear-key]')].map(node=>({key:node.dataset.wearKey,item:node.dataset.item,slot:node.dataset.slot,source:node.getAttribute('src'),transform:node.style.transform,origin:node.style.transformOrigin,clip:node.style.clipPath,z:node.style.zIndex,pose:node.dataset.pose,handItem:node.dataset.handItem,mount:node.dataset.mount})).sort((a,b)=>a.key.localeCompare(b.key)));
   for(const career of ['','bulwark','vanguard','infiltrator'])for(const sex of ['male','female']){
    await page.evaluate(({career,sex})=>{state.tab='char';state.charView='overview';state.playerAppearance=sex;state.meta.careers.main=career?{id:career,level:5,xp:0}:null;render();},{career,sex});await ready();
    assert.equal(await page.locator('img.char-rpg-portrait').count(),0,'character must not use a separate career splash image');
    assert.equal(await page.locator('.char-rpg-portrait .doll-wearable').count(),1);assert.equal(await page.locator('.char-rpg-portrait [data-slot="life"]').count(),3);
    assert.equal(await page.locator('.char-rpg-portrait .doll-wearable').getAttribute('data-gender'),sex);
    if(occupiedSample){
     assert.equal(await page.locator('.char-rpg-portrait [data-occupied-hilt="true"]').count(),1);
     assert.equal(await page.locator('.char-rpg-portrait [data-wear-key="grip-left"]').count(),1,'exactly one authored occupied grip, not the old empty fist');
     assert.equal(await page.locator('.char-rpg-portrait [data-wear-key="forearm-base"]').count(),1,'posed forearm accompanies the neutral wrist');
    }
    const geometry=await page.evaluate(()=>{const r=document.querySelector('.char-rpg-portrait .doll-wearable').getBoundingClientRect(),a=document.querySelector('.char-rpg-portrait').getBoundingClientRect(),h=document.querySelector('.char-rpg-identity').getBoundingClientRect(),s=document.querySelector('.char-rpg-readout').getBoundingClientRect(),p=document.querySelector('#panel');return {ratio:r.width/r.height,visible:r.height>80,contained:r.top>=a.top-1&&r.bottom<=a.bottom+1,uncovered:a.top>=h.bottom-1&&a.bottom<=s.top+1,noOverflow:p.scrollWidth<=p.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1};});
    assert.ok(Math.abs(geometry.ratio-2/3)<.002,'character portrait stays on the shared 2:3 rig');assert.equal(geometry.visible,true);assert.equal(geometry.contained,true,'whole figure stays inside its stage');assert.equal(geometry.uncovered,true,'identity and stats cannot cover equipped figure');assert.equal(geometry.noOverflow,true);
    const character=await portrait();
    if(output)await page.screenshot({path:path.join(output,viewport.width+'-'+(career||'base')+'-'+sex+'-character.png'),animations:'disabled'});
    await page.locator('#tabbar [data-tab="bag"]').click();await ready();
    assert.deepEqual(await portrait(),character,'character and backpack share every source, contact transform, pose, mount and layer order: '+career+' '+sex+' '+viewport.width);
    if(output)await page.screenshot({path:path.join(output,viewport.width+'-'+(career||'base')+'-'+sex+'-bag.png'),animations:'disabled'});
   }
   await page.locator('#tabbar [data-tab="char"]').click();await ready();
   await page.evaluate(()=>{window.characterRefs={stage:document.querySelector('.char-rpg-stage'),host:document.querySelector('.char-rpg-portrait'),rig:document.querySelector('.char-rpg-portrait .doll-wearable'),base:document.querySelector('.char-rpg-portrait [data-wear-key="base"]'),dock:document.querySelector('.char-thumb-dock')};});
   const stable=()=>page.evaluate(()=>characterRefs.stage===document.querySelector('.char-rpg-stage')&&characterRefs.host===document.querySelector('.char-rpg-portrait')&&characterRefs.rig===document.querySelector('.char-rpg-portrait .doll-wearable')&&characterRefs.base===document.querySelector('.char-rpg-portrait [data-wear-key="base"]')&&characterRefs.dock===document.querySelector('.char-thumb-dock'));
   assert.equal(await page.evaluate(()=>equip('feet','magboots',refreshCharPanel)),true);await ready();assert.equal(await stable(),true,'updating equipment retains character stage, base and controls');
   assert.equal(await page.locator('.char-rpg-portrait [data-item="magboots"]').count(),2);
   await page.evaluate(()=>{setPlayerAppearance('male',null,true);refreshCharPanel();});await ready();assert.equal(await stable(),true,'appearance changes update in place');
   assert.equal(await page.locator('.char-rpg-portrait .doll-wearable').getAttribute('data-gender'),'male');assert.match(await page.locator('.char-rpg-identity>span').innerText(),/男性/);
   const requests=await page.locator('.char-rpg-portrait').evaluate(node=>node._dollRequest);
   await page.locator('.echo-entry').click();await page.locator('.char-echo-upgrade').first().click();await page.locator('.char-sheet-back').click();
   assert.equal(await stable(),true,'echo upgrades leave the portrait mounted');assert.equal(await page.locator('.char-rpg-portrait').evaluate(node=>node._dollRequest),requests,'stat-only actions cannot reload portrait art');
   const character=await portrait();await page.locator('#tabbar [data-tab="bag"]').click();await ready();assert.deepEqual(await portrait(),character,'in-place character changes are reflected by the backpack');
   assert.deepEqual(errors,[]);console.log(viewport.width+'px: two sexes × four base/career uniforms identical across both pages; stable mutation and unobscured 2:3 stage passed.');await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
