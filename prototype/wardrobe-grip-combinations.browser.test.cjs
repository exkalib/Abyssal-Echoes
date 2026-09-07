// Full production equip flow in an isolated profile. Validates typed/relaxed
// hand replacement and produces browser screenshots for manual seam inspection.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {assertWearableFitContacts}=require('./wardrobe-fit-contract.cjs');
const output=process.env.WARDROBE_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'wardrobe-grip-combinations-'));
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const viewport={width:390,height:Number(process.env.WARDROBE_QA_HEIGHT)||844};
  const page=await browser.newPage({viewport}),errors=[],shots=[];page.setDefaultTimeout(15000);
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='weapon';state.player.equip={};state.meta.careers.main=null;state.meta.careers.life=[];
   for(const[id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});
  const equipItem=async id=>{assert.equal(await page.evaluate(id=>equip(ITEMS[id].slot,id,refreshBagPanel),id),true,id+' equips');await ready();};
  const hands=()=>page.evaluate(()=>({closed:[...document.querySelectorAll('.doll-art-host [data-slot="grip"]')].map(node=>({pose:node.dataset.pose,glove:node.dataset.handItem})),relaxed:document.querySelectorAll('.doll-art-host [data-slot="hands"][data-pose="relaxed"]').length}));
  for(const career of ['','bulwark','vanguard','infiltrator'])for(const sex of ['male','female']){
   await page.evaluate(({career,sex})=>{for(const slot of Object.keys(P().equip))if(P().equip[slot])unequip(slot,()=>{});state.meta.careers.main=career?{id:career,level:5,xp:0}:null;state.playerAppearance=sex;refreshBagPanel();},{career,sex});await ready();
   await equipItem('workGloves');assert.equal((await hands()).relaxed,2,'unarmed keeps both relaxed glove hands');
   await equipItem('knife');assert.deepEqual(await hands(),{closed:[{pose:'shortblade',glove:'workGloves'}],relaxed:1},'shortblade grip replaces exactly one relaxed hand');
   await equipItem('riotShield');assert.deepEqual(await hands(),{closed:[{pose:'shortblade',glove:'workGloves'},{pose:'shield',glove:'workGloves'}],relaxed:0},'knife and shield use their distinct poses with no old open palms');
   const geometry=await page.evaluate(()=>({audit:wearableFitAudit(state.playerAppearance,P().equip,careerRecord('main')?.id),nodes:[...document.querySelectorAll('.doll-art-host [data-wear-key]')].map(node=>({key:node.dataset.wearKey,item:node.dataset.item,slot:node.dataset.slot,occupiedHilt:node.dataset.occupiedHilt==='true',zIndex:getComputedStyle(node).zIndex}))}));
   for(const [id,slot]of [['knife','weapon'],['riotShield','offhand']])assertWearableFitContacts(geometry.audit,{id,slot,sex},geometry.nodes.filter(node=>node.item===id));
   for(const dressed of [false,true]){
    if(dressed)for(const id of ['body_general_1','gravityBoots','module_general_5'])await equipItem(id);
    const name=(career||'base')+'-'+sex+(dressed?'-equipped':'-grips');
    // First capture actual mobile layout without an inspection overlay.
    await page.locator('.doll-art-host').screenshot({path:path.join(output,name+'-game.png'),animations:'disabled'});
    await page.screenshot({path:path.join(output,name+'-screen.png'),animations:'disabled'});
    const scene=await page.evaluate(()=>{const rig=document.querySelector('.doll-art-host .doll-wearable').getBoundingClientRect(),stage=document.querySelector('.doll-art-host').getBoundingClientRect();return {width:rig.width,height:rig.height,stageHeight:stage.height};});
    assert.ok(Math.abs(scene.width/scene.height-2/3)<.002,'portrait plane must stay 2:3 at '+viewport.height+'px: '+JSON.stringify(scene));
    assert.ok(scene.height<=scene.stageHeight+.5,'portrait plane must fit inside its mobile stage');
    await page.evaluate(async()=>{
     const stage=document.createElement('div');stage.id='grip-qa-stage';stage.style.cssText='position:fixed;z-index:20000;left:0;top:0;width:420px;height:600px;background:radial-gradient(ellipse at 50% 38%,#203642 0,#0d1922 72%);display:grid;place-items:center;overflow:hidden;pointer-events:none';
     const clone=document.querySelector('.doll-art-host .doll-wearable').cloneNode(true);clone.style.cssText='position:relative;width:360px;max-width:none;aspect-ratio:2/3;left:0;top:0;transform:none;overflow:visible';stage.append(clone);document.body.append(stage);await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
    });
    await page.locator('#grip-qa-stage').screenshot({path:path.join(output,name+'.png'),animations:'disabled'});await page.locator('#grip-qa-stage').evaluate(node=>node.remove());
    shots.push({name,career:career||'base',sex,dressed,image:name+'.png',gameImage:name+'-game.png',geometry:'passed',visualFit:'pending-human-review'});
   }
   await page.evaluate(()=>unequip('weapon',refreshBagPanel));await ready();assert.equal((await hands()).relaxed,1,'unwearing weapon restores only its hand');
   await page.evaluate(()=>unequip('offhand',refreshBagPanel));await ready();assert.equal((await hands()).relaxed,2,'unwearing both restores the relaxed pair');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({shots,automatic:'closed-hand replacement, contact points and layer order only',visualFit:'pending-human-review'},null,2));
  const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>握持与服装组合复验</title><style>body{margin:0;background:#0b151e;color:#dcebf0;font:14px sans-serif}h1,p{margin:20px}.sheet{padding:16px;width:1260px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{border:1px solid #314854;background:#0d1922}.card img{width:100%;display:block}.card p{margin:10px;font-size:12px}</style><h1>刀 + 作业手套 + 防暴盾 · 男女与全部职业</h1><p>几何和替换机制已自动验证；人工视觉结论仍待复核。每组也保留真实390px游戏截图。</p>'+Array.from({length:Math.ceil(shots.length/6)},(_,page)=>'<section class="sheet" id="sheet-'+page+'">'+shots.slice(page*6,page*6+6).map(shot=>'<article class="card"><p>'+shot.name+'</p><img src="'+shot.image+'"><p>视觉待人工复核</p></article>').join('')+'</section>').join('')+'</html>';
  fs.writeFileSync(path.join(output,'index.html'),html);const atlas=await browser.newPage({viewport:{width:1292,height:980}});await atlas.goto(pathToFileURL(path.join(output,'index.html')).href);await atlas.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  for(const sheet of await atlas.locator('.sheet').all())await sheet.screenshot({path:path.join(output,await sheet.getAttribute('id')+'.png')});
  console.log('Grip combinations: 2 sexes × 4 base/career uniforms × 2 outfits captured; no duplicate palms, exact hand restoration, physical grip/shield occlusion passed. Visual review is still required. '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
