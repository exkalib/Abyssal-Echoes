// Production equip/unequip and cross-page pose regression in a fresh profile.
// Geometry and DOM assertions are not visual approval; native screenshots stay pending.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {renderContactSheets}=require('./wardrobe-atlas-sheets.cjs');
const {createHash}=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {WEARABLE_HOLD_HANDS}=require('./wardrobe-hands.js');
const {WEARABLE_SWORD_HANDS}=require('./wardrobe-sword-hands.js');
const {WEARABLE_TRIGGER_HANDS}=require('./wardrobe-trigger-hands.js');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {assertWearableFitContacts}=require('./wardrobe-fit-contract.cjs');
const args=process.argv.slice(2),arg=name=>args[args.indexOf(name)+1];
const allHands=[...Object.keys(WEARABLE_HOLD_HANDS),'phaseGrip'];
const hands=args.includes('--hands')?arg('--hands').split(','):allHands;
const output=args.includes('--output')?path.resolve(arg('--output')):fs.mkdtempSync(path.join(os.tmpdir(),'wardrobe-gestures-'));
const cases=[['knife','sword'],['blade','sword'],['pistol','trigger'],['rifle','trigger'],['gravLance','shaft'],['riotShield','shield']];
assert.equal(allHands.length,11,'bare + nine full gloves + phase wrist rings');
assert.equal(new Set(hands).size,hands.length);assert.ok(hands.length);
for(const hand of hands){
 assert.ok(allHands.includes(hand),'unknown hand '+hand);
 const id=hand==='phaseGrip'?'bare':hand;
 for(const [type,catalog] of [['sword',WEARABLE_SWORD_HANDS],['trigger',WEARABLE_TRIGGER_HANDS],['shield',WEARABLE_HOLD_HANDS]]){
  assert.ok(catalog[id],hand+' has no ready '+type+' artwork; do not silently test the old fist fallback');
  assert.ok(fs.existsSync(path.join(__dirname,'assets/wearables-v1',catalog[id].file+'.webp')),hand+' missing '+type+' source');
 }
 assert.equal(new Set([WEARABLE_SWORD_HANDS[id].file,WEARABLE_TRIGGER_HANDS[id].file,WEARABLE_HOLD_HANDS[id].file]).size,3,hand+' must use three genuinely distinct sources, not relabel one fist');
 const hashes=[WEARABLE_SWORD_HANDS[id],WEARABLE_TRIGGER_HANDS[id],WEARABLE_HOLD_HANDS[id]].map(art=>createHash('sha256').update(fs.readFileSync(path.join(__dirname,'assets/wearables-v1',art.file+'.webp'))).digest('hex'));
 assert.equal(new Set(hashes).size,3,hand+' cannot copy the same fist bytes to three filenames');
}
(async()=>{
 fs.mkdirSync(path.join(output,'portraits'),{recursive:true});fs.mkdirSync(path.join(output,'sheets'),{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],records=[],blockedCombinations=[];page.setDefaultTimeout(20000);
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
  const runtimeSources=await page.evaluate(()=>Promise.all(['wardrobe.js','wardrobe-hands.js','wardrobe-sword-hands.js','wardrobe-trigger-hands.js','wardrobe-grips.js','wardrobe-fit.js'].map(async file=>[file,await fetch(file).then(r=>r.text())])));
  const runtimeHashes=Object.fromEntries(runtimeSources.map(([file,text])=>[file,createHash('sha256').update(text).digest('hex')]));
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='weapon';state.player.equip={};state.meta.careers.main=null;state.meta.careers.life=[];
   for(const[id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const compatibleWeapons=await page.evaluate(ids=>ids.filter(id=>ITEMS[id].weaponHands!==2),cases.slice(0,-1).map(([id])=>id));
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});
  const layers=()=>page.evaluate(()=>[...document.querySelectorAll('.doll-art-host [data-wear-key]')].map(node=>({key:node.dataset.wearKey,item:node.dataset.item,slot:node.dataset.slot,integratedGrip:node.dataset.integratedGrip==='true',occupiedHilt:node.dataset.occupiedHilt==='true',source:node.getAttribute('src'),transform:node.style.transform,origin:node.style.transformOrigin,clip:node.style.clipPath,zIndex:node.style.zIndex,pose:node.dataset.pose,handItem:node.dataset.handItem,mount:node.dataset.mount})).sort((a,b)=>a.key.localeCompare(b.key)));
  const mutate=async(slot,id)=>{
   const refs=await page.evaluateHandle(()=>({panel:document.querySelector('#panel'),host:document.querySelector('.doll-art-host'),rig:document.querySelector('.doll-art-host .doll-wearable'),layers:new Map([...document.querySelectorAll('.doll-art-host [data-wear-key]')].map(node=>[node.dataset.wearKey,node]))}));
   const before=await layers();
   const done=await page.evaluate(({slot,id})=>{const refresh=state.tab==='bag'?refreshBagPanel:refreshCharPanel;return id?equip(slot,id,refresh):(unequip(slot,refresh),true);},{slot,id});
   assert.equal(done,true,(id||slot)+' mutation succeeds');await ready();
   assert.equal(await page.evaluate(refs=>refs.panel===document.querySelector('#panel')&&refs.host===document.querySelector('.doll-art-host')&&refs.rig===document.querySelector('.doll-art-host .doll-wearable')&&[...document.querySelectorAll('.doll-art-host [data-wear-key]')].every(node=>!refs.layers.has(node.dataset.wearKey)||refs.layers.get(node.dataset.wearKey)===node),refs),true,'surviving layers and the entire portrait stay mounted during '+slot+' mutation');
   await refs.dispose();const after=await layers();
   // The opposite hand/object cannot change when only one held slot changes.
   if(slot==='weapon'||slot==='offhand'){
    const other=slot==='weapon'?['offhand','grip-right']:['weapon','grip-left'];
    for(const old of before.filter(node=>node.slot===other[0]||node.key===other[1]))assert.deepEqual(after.find(node=>node.key===old.key),old,'changing '+slot+' leaves the other hand untouched');
   }
   return after;
  };
  const comparePages=async()=>{
   const bag=await layers();await page.locator('#tabbar [data-tab="char"]').click();await ready();
   assert.deepEqual(await layers(),bag,'character and backpack use identical source, transform, pose and occlusion');
   await page.locator('#tabbar [data-tab="bag"]').click();await ready();assert.deepEqual(await layers(),bag);
  };
  const checkPose=async(hand,sex,items)=>{
   const mounted=await layers(),held=mounted.filter(node=>node.slot==='grip'||node.integratedGrip);assert.equal(held.length,items.length);
   for(const [id,pose] of items){
    const node=held.find(node=>node.item===id),glove=hand==='phaseGrip'?'bare':hand;
    assert.ok(node,id+' has a hand');assert.equal(node.item,id);assert.equal(node.pose,pose,id+' selects its real gesture');assert.equal(node.handItem,glove,hand+' never falls back to another glove');
    if(pose!=='shield')assert.ok(!/50%/.test(node.clip),'full-frame '+pose+' hand cannot inherit paired-fist half clipping');
    const catalog=pose==='trigger'?WEARABLE_TRIGGER_HANDS:pose==='shield'?WEARABLE_HOLD_HANDS:WEARABLE_SWORD_HANDS;
    const art=catalog[glove].weapons?.[id]||catalog[glove];
    assert.equal(node.source,'assets/wearables-v1/'+art.file+'.webp',hand+' uses the dedicated '+pose+' art');
    if(pose==='sword'||pose==='shaft'){
     const alignment=await page.evaluate(id=>{
      const specs=wearableSpecification(state.playerAppearance,P().equip),hand=specs.find(s=>s.item===id&&(s.slot==='grip'||s.integratedGrip)),object=specs.find(s=>s.item===id&&s.slot==='weapon');
      const origin=wearableTransformPoint(hand,hand.gripPoint),a=wearableTransformPoint(hand,hand.handleAxis),b=wearableTransformPoint(object,object.art.handleAxis);
      const x=[a[0]-origin[0],1.5*(a[1]-origin[1])],y=[b[0]-origin[0],1.5*(b[1]-origin[1])];
      return (x[0]*y[0]+x[1]*y[1])/(Math.hypot(...x)*Math.hypot(...y));
     },id);
     assert.ok(alignment>.999999,id+' hilt follows the actual closed-finger axis, not a fixed rotation');
    }
   }
   assert.equal(mounted.filter(node=>node.slot==='hands').length,hand==='bare'?0:hand==='phaseGrip'?2:2-items.length,'only replaced relaxed palms disappear; wrist-only rings remain');
   const audit=await page.evaluate(()=>wearableFitAudit(state.playerAppearance,P().equip,careerRecord('main')?.id));
   for(const [id,pose]of items){
    assertWearableFitContacts(audit,{id,sex,slot:pose==='shield'?'offhand':'weapon'},mounted.filter(node=>node.item===id));
    if(pose==='trigger'){
     const contacts=audit.contacts.filter(contact=>contact.item===id&&contact.kind==='grip');
     assert.equal(contacts.length,2,id+' requires independent palm/handle and index/frame contacts');
     assert.ok(contacts.some(contact=>contact.anatomy==='index-outside-guard'));
    }
   }
   assert.equal(await page.locator('.doll-art-host img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),true);
   return mounted;
  };
  const capture=async(hand,sex,id,pose,shield)=>{
   const items=[[id,pose],...(shield?[['riotShield','shield']]:[])],nodes=await checkPose(hand,sex,items),name=hand+'-'+sex+'-'+id+(shield?'-shield':'');
   await page.evaluate(async()=>{
    const stage=document.createElement('div');stage.id='gesture-qa-stage';stage.style.cssText='position:fixed;z-index:20000;left:0;top:0;width:420px;height:600px;background:radial-gradient(ellipse at 50% 38%,#203642 0,#0d1922 72%);display:grid;place-items:center;overflow:hidden;pointer-events:none';
    const clone=document.querySelector('.doll-art-host .doll-wearable').cloneNode(true);clone.style.cssText='position:relative;width:360px;max-width:none;aspect-ratio:2/3;left:0;top:0;transform:none;overflow:visible';stage.append(clone);document.body.append(stage);await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
   });
   await page.locator('#gesture-qa-stage').screenshot({path:path.join(output,'portraits',name+'.png'),animations:'disabled'});await page.locator('#gesture-qa-stage').evaluate(node=>node.remove());
   let handDetail;
   if(!shield){
    // Whole-body thumbnails cannot prove finger anatomy. Capture the actual
    // mounted hand/object at 5× rig scale, without painting or editing any image.
    await page.evaluate(async id=>{
     const hand=wearableSpecification(state.playerAppearance,P().equip,careerRecord('main')?.id).find(spec=>(spec.slot==='grip'||spec.integratedGrip)&&spec.item===id),center=wearableTransformPoint(hand,hand.gripPoint);
     const stage=document.createElement('div');stage.id='gesture-hand-detail';stage.style.cssText='position:fixed;z-index:20000;left:0;top:0;width:600px;height:440px;background:#12232d;overflow:hidden;pointer-events:none';
     const clone=document.querySelector('.doll-art-host .doll-wearable').cloneNode(true);clone.style.cssText='position:absolute;width:1800px;max-width:none;aspect-ratio:2/3;left:'+(300-center[0]*18)+'px;top:'+(240-center[1]*27)+'px;transform:none;overflow:visible';stage.append(clone);document.body.append(stage);await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
    },id);
    handDetail='portraits/'+name+'-hand.png';await page.locator('#gesture-hand-detail').screenshot({path:path.join(output,handDetail),animations:'disabled'});await page.locator('#gesture-hand-detail').evaluate(node=>node.remove());
   }
   await comparePages();records.push({hand,sex,item:id,pose,shield,nodes,image:'portraits/'+name+'.png',handDetail,functional:'passed',visualFit:'pending-human-review'});
  };
  for(const hand of hands)for(const sex of ['male','female']){
   await page.evaluate(sex=>{for(const slot of Object.keys(P().equip))if(P().equip[slot])unequip(slot,()=>{});state.playerAppearance=sex;refreshBagPanel();},sex);await ready();
   if(hand!=='bare')await mutate('hands',hand);
   const relaxed=await layers();
   for(const [id,pose]of cases.slice(0,-1)){
    await mutate('weapon',id);await capture(hand,sex,id,pose,false);
    if(compatibleWeapons.includes(id)){
     await mutate('offhand','riotShield');await capture(hand,sex,id,pose,true);
     await mutate('offhand',null);await checkPose(hand,sex,[[id,pose]]);
    }else{
     const before=await layers();
     const blocked=await page.evaluate(()=>{const host=document.querySelector('.doll-art-host'),request=host._dollRequest,snapshot=JSON.stringify([P().equip,state.inv]),nodes=[...host.querySelectorAll('[data-wear-key]')];const result=equip('offhand','riotShield',refreshBagPanel);return {result,unchanged:snapshot===JSON.stringify([P().equip,state.inv])&&request===host._dollRequest&&nodes.every(node=>node===host.querySelector('[data-wear-key="'+node.dataset.wearKey+'"]'))};});
     assert.deepEqual(blocked,{result:false,unchanged:true},'two-handed '+id+' rejects a shield without changing inventory, gesture or DOM');assert.deepEqual(await layers(),before);
     blockedCombinations.push({hand,sex,weapon:id,offhand:'riotShield',result:'correctly-rejected-two-handed-conflict'});
    }
   }
   await mutate('weapon',null);assert.deepEqual(await layers(),relaxed,'unloading weapons restores both original relaxed hands, base clipping and cuffs');
   await mutate('offhand','riotShield');await capture(hand,sex,'riotShield','shield',false);
   await mutate('offhand',null);assert.deepEqual(await layers(),relaxed,'unloading shield restores its original hand independently');
   // Mutations must also be stable while the character page owns the portrait.
   await page.locator('#tabbar [data-tab="char"]').click();await ready();await mutate('weapon','knife');await checkPose(hand,sex,[['knife','sword']]);
   await mutate('weapon','pistol');await checkPose(hand,sex,[['pistol','trigger']]);
   const character=await layers();await page.locator('#tabbar [data-tab="bag"]').click();await ready();assert.deepEqual(await layers(),character);
   await mutate('weapon',null);assert.deepEqual(await layers(),relaxed);
   console.log(hand+' '+sex+': six single items + '+compatibleWeapons.length+' legal shield combinations captured; incompatible pairs rejected unchanged; typed hand transitions, restoration, stable DOM and both pages checked.');
  }
  assert.deepEqual(errors,[]);assert.equal(records.length,hands.length*2*(6+compatibleWeapons.length));assert.equal(blockedCombinations.length,hands.length*2*(5-compatibleWeapons.length));
  const report={runtimeHashes,scope:hands.length===allHands.length?'all-hand-types':'selected-hand-types',hands,records,blockedCombinations,automatic:'pose routing, dedicated sources, no half-frame clip, two-point firearm geometry, stable DOM, hand restoration, two-handed conflict rejection and page equality only',visualFit:'pending-human-review'};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  const sections=hands.flatMap(hand=>[false,true].map(shield=>'<section class="sheet" id="'+hand+'-'+(shield?'paired':'single')+'"><h2>'+hand+' · '+(shield?'武器＋盾牌':'单件持物')+'</h2><div class="grid">'+records.filter(row=>row.hand===hand&&row.shield===shield).map(row=>'<article><p>'+row.item+' · '+row.sex+' · '+row.pose+'</p><img src="'+row.image+'"><small>待人工检查手指包握、扳机接触、腕口与物件方向</small></article>').join('')+'</div></section>'));
  const details=hands.flatMap(hand=>['male','female'].map(sex=>'<section class="sheet detail" id="'+hand+'-'+sex+'-hand-details"><h2>'+hand+' · '+sex+' · 实装手部近景</h2><div class="grid">'+records.filter(row=>row.hand===hand&&row.sex===sex&&row.handDetail).map(row=>'<article><p>'+row.item+' · '+row.pose+'</p><img src="'+row.handDetail+'"><small>逐指核对：拇指＋四指、包握方向、扳机接触；遮挡不可见不等于缺指</small></article>').join('')+'</div></section>'));
  fs.writeFileSync(path.join(output,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>按武器切换手势 · 真实穿戴验收</title><style>body{margin:0;background:#0b151e;color:#dcebf0;font:14px sans-serif}h1,p{margin:16px}h2{font-size:18px}.sheet{box-sizing:border-box;width:1320px;padding:16px}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.detail .grid{grid-template-columns:repeat(3,1fr)}article{border:1px solid #314854;background:#0d1922}article img{width:100%;display:block}article p{margin:7px;font-size:11px}small{display:block;margin:6px;font-size:10px;color:#e4c285}</style><h1>按武器自动切换手势</h1><p>功能通过不代表真实握持通过。单件与组合分开截取；全部 '+records.length+' 项人工结论均为待复核。圆柄刀剑与长杆共用包握掌形，杆身单独定向；枪械与盾背各有独立原画。全身图不能替代手指解剖检查，另附实装近景。</p>'+sections.join('')+details.join('')+'</html>');
  await page.close();await renderContactSheets(browser,path.join(output,'index.html'),path.join(output,'sheets'));
  console.log('Functional checks passed; manual visual review is still required. '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
