// Isolated art preview only: rejected combinations must not touch either portrait.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  await page.goto(new URL('wardrobe-preview.html',process.env.RPG_TEST_URL||'http://127.0.0.1:4187/').href);
  await page.evaluate(async()=>{
   await refresh();window.previewRenders=[];const update=updateWearablePortrait;
   updateWearablePortrait=(...args)=>{const pending=update(...args);window.previewRenders.push(pending);return pending;};
  });
  const settle=()=>page.evaluate(()=>Promise.all(window.previewRenders));
  const choose=async(slot,item)=>{await page.locator('[data-wear-slot="'+slot+'"]').selectOption(item);await settle();};
  const remember=()=>page.evaluate(()=>{
   window.rejectedChoiceSnapshot={outfit:JSON.stringify(outfit),renders:window.previewRenders.length,portraits:['male','female'].map(sex=>{
    const host=document.getElementById(sex);return {host,html:host.innerHTML,nodes:[...host.querySelectorAll('[data-wear-key]')]};
   })};
  });
  const assertRejected=async(label)=>{
   await settle();
   const result=await page.evaluate(()=>{
    const before=window.rejectedChoiceSnapshot;
    return {sameOutfit:JSON.stringify(outfit)===before.outfit,noRender:window.previewRenders.length===before.renders,
     samePortraits:before.portraits.every(({host,html,nodes})=>host.innerHTML===html&&nodes.length===host.querySelectorAll('[data-wear-key]').length&&nodes.every((node,index)=>node===host.querySelectorAll('[data-wear-key]')[index])),
     selectorsRestored:[...document.querySelectorAll('[data-wear-slot]')].every(select=>select.value===(outfit[select.dataset.wearSlot]||'')),
     shieldButtonConsistent:document.getElementById('shield').getAttribute('aria-pressed')===String(outfit.offhand==='riotShield'),
     status:document.getElementById('fitting-status').textContent};
   });
   for(const key of ['sameOutfit','noRender','samePortraits','selectorsRestored','shieldButtonConsistent'])assert.equal(result[key],true,label+': '+key);
   assert.match(result.status,/双手持握.*当前穿戴未改变/,label+': explains the unchanged choice inline');
  };
  await choose('body','vest');await choose('feet','boots');await choose('hands','workGloves');
  const shields=await page.locator('[data-wear-slot="offhand"] option').evaluateAll(options=>options.map(option=>option.value).filter(Boolean));
  assert.ok(shields.includes('riotShield')&&shields.includes('phaseShield'));
  const weapons=['rifle','plasmaRifle','swarmRifle','vacuumCarbine','gravLance'];
  for(const weapon of weapons){
   await choose('offhand','');await choose('weapon',weapon);await remember();
   for(const shield of shields){await choose('offhand',shield);await assertRejected(weapon+' rejects '+shield);}
   await page.locator('#shield').tap();await assertRejected(weapon+' rejects shield shortcut');
  }
  await choose('weapon','pistol');
  for(const shield of shields){
   await choose('offhand',shield);await remember();
   for(const weapon of weapons){await choose('weapon',weapon);await assertRejected(shield+' rejects '+weapon);}
  }
  for(const weapon of ['blade','knife','pistol']){
   await choose('weapon',weapon);await choose('offhand','riotShield');
   assert.deepEqual(await page.evaluate(()=>({weapon:outfit.weapon,offhand:outfit.offhand,status:document.getElementById('fitting-status').textContent})),{weapon,offhand:'riotShield',status:''});
   for(const sex of ['male','female']){
    assert.ok(await page.locator('#'+sex+' [data-item="'+weapon+'"]').count(),sex+' mounts '+weapon);
    assert.ok(await page.locator('#'+sex+' [data-item="riotShield"]').count(),sex+' mounts compatible shield');
   }
  }
  await page.locator('#shield').tap();await settle();
  await choose('weapon','rifle');
  assert.deepEqual(await page.evaluate(()=>({weapon:outfit.weapon,offhand:outfit.offhand,status:document.getElementById('fitting-status').textContent})),{weapon:'rifle',offhand:null,status:''},'explicitly removing shield permits the requested two-handed weapon');
  assert.deepEqual(errors,[]);
  console.log('Preview compatibility: five two-handed weapons × '+shields.length+' shields, both selection directions and shield shortcut rejected without rendering/replacing either portrait; single-handed combinations and explicit unequip remain usable.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
