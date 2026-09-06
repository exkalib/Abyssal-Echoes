// Isolated-profile real equip QA for firearm-specific hands. No live player save is used.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {WEARABLE_TRIGGER_HANDS}=require('./wardrobe-trigger-hands.js');
const out=process.env.WARDROBE_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'wardrobe-trigger-hands-'));
(async()=>{
 fs.mkdirSync(path.join(out,'portraits'),{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const records=[],errors=[];
 try{
  const page=await browser.newPage({viewport:{width:780,height:980}});page.setDefaultTimeout(20000);
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='weapon';state.player.equip={};state.meta.careers.main=null;state.meta.careers.life=[];
   for(const[id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
   const stage=document.createElement('div');stage.id='trigger-qa-stage';stage.style.cssText='position:fixed;z-index:20000;left:0;top:0;width:420px;height:600px;background:radial-gradient(ellipse at 50% 38%,#203642 0,#0d1922 72%);display:grid;place-items:center;overflow:hidden;pointer-events:none';document.body.append(stage);
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});
  for(const sex of ['male','female'])for(const glove of Object.keys(WEARABLE_TRIGGER_HANDS)){
   await page.evaluate(({sex,glove})=>{
    for(const slot of Object.keys(P().equip))if(P().equip[slot])unequip(slot,()=>{});
    state.playerAppearance=sex;if(glove!=='bare')equip('hands',glove,()=>{});refreshBagPanel();
   },{sex,glove});await ready();
   for(const gun of ['pistol','rifle']){
    assert.equal(await page.evaluate(gun=>equip('weapon',gun,refreshBagPanel),gun),true);await ready();
    const audit=await page.evaluate(async({sex,glove,gun})=>{
     const host=document.querySelector('.doll-art-host'),hand=host.querySelector('[data-wear-key="grip-left"]');
     const clone=host.querySelector('.doll-wearable').cloneNode(true);clone.style.cssText='position:relative;width:360px;max-width:none;aspect-ratio:2/3;left:0;top:0;transform:none;overflow:visible';
     document.querySelector('#trigger-qa-stage').replaceChildren(clone);await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
     return {pose:hand.dataset.pose,glove:hand.dataset.handItem,source:hand.getAttribute('src'),clip:getComputedStyle(hand).clipPath,contacts:wearableFitAudit(sex,P().equip).contacts};
    },{sex,glove,gun});
    assert.equal(audit.pose,'trigger');assert.equal(audit.glove,glove);assert.equal(audit.source,'assets/wearables-v1/'+WEARABLE_TRIGGER_HANDS[glove].file+'.webp');assert.ok(!/50%/.test(audit.clip),'single hand cannot inherit paired-fist half clipping');
    const contacts=audit.contacts.filter(c=>c.item===gun&&c.kind==='grip');assert.equal(contacts.length,2,'palm and resting index need two contacts');
    assert.ok(contacts.some(c=>c.anatomy==='index-outside-guard'),'index rests on frame, not in the guard');
    for(const c of contacts)assert.ok(Math.hypot(c.actual[0]-c.anchor[0],1.5*(c.actual[1]-c.anchor[1]))<.01,'contact residual');
    const image='portraits/'+glove+'-'+gun+'-'+sex+'.png';await page.locator('#trigger-qa-stage').screenshot({path:path.join(out,image),animations:'disabled'});
    records.push({sex,glove,gun,image,audit,visualFit:'pending-personal-review'});
    // Switching to a blade must change pose while keeping the same equipped handwear.
    await page.evaluate(()=>equip('weapon','knife',refreshBagPanel));await ready();
    const switched=await page.evaluate(()=>{const n=document.querySelector('.doll-art-host [data-wear-key="grip-left"],.doll-art-host [data-integrated-grip="true"]');return {pose:n.dataset.pose,glove:n.dataset.handItem};});
    assert.notEqual(switched.pose,'trigger');assert.equal(switched.glove,glove);
    await page.evaluate(()=>unequip('weapon',refreshBagPanel));await ready();
    assert.equal(await page.locator('.doll-art-host [data-wear-key="grip-left"]').count(),0,'unequip restores non-held hand');
   }
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({records,checks:'real equip + firearm/blade pose switch + two contact points + handwear identity + unequip restore; visual review separate'},null,2));
  const cards=Object.keys(WEARABLE_TRIGGER_HANDS).map(glove=>'<section class="sheet"><h2>'+glove+'</h2><div>'+records.filter(r=>r.glove===glove).map(r=>'<figure><figcaption>'+r.gun+' · '+r.sex+'</figcaption><img src="'+r.image+'"></figure>').join('')+'</div></section>').join('');
  fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html><meta charset="utf-8"><style>body{margin:0;background:#0b151e;color:#dcebf0;font:14px sans-serif}.sheet{width:1680px;padding:16px}.sheet>div{display:flex}figure{margin:0;width:420px}img{width:100%;display:block}h2,figcaption{padding:8px}</style>'+cards+'</html>');
  const atlas=await browser.newPage({viewport:{width:1720,height:740}});await atlas.goto(pathToFileURL(path.join(out,'index.html')).href);await atlas.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
  for(const sheet of await atlas.locator('.sheet').all())await sheet.screenshot({path:path.join(out,'sheet-'+await sheet.locator('h2').innerText()+'.png')});
  console.log(records.length+' real firearm equip screenshots; pose switching and 2-point contacts passed. Visual pending: '+out);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
