// Visual evidence, not an automatic claim that equipment fits the body.
// Uses a fresh browser profile, equips EVERY real item through production code,
// and captures browser-rendered portraits. No player profile is opened or edited.
//
// PLAYWRIGHT_MODULE=/path/to/playwright BROWSER_EXECUTABLE=/path/to/browser \
//   node prototype/wardrobe-fit-audit.browser.cjs --output /absolute/output/path
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {renderContactSheets}=require('./wardrobe-atlas-sheets.cjs');
const {createHash}=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {assertWearableFitContacts}=require('./wardrobe-fit-contract.cjs');
const args=process.argv.slice(2),arg=name=>args[args.indexOf(name)+1];
const output=args.includes('--output')?path.resolve(arg('--output')):fs.mkdtempSync(path.join(os.tmpdir(),'wardrobe-fit-audit-'));
const title=args.includes('--title')?arg('--title'):'装备逐件穿戴 · 人工验收图册';
const career=args.includes('--career')?arg('--career'):'';
const handwear=args.includes('--handwear')?arg('--handwear'):'';
const fixedWeapon=args.includes('--weapon')?arg('--weapon'):'';
assert.ok(['','bulwark','vanguard','infiltrator'].includes(career),'--career must be one of the three main careers');
const requestedItems=args.includes('--items')?arg('--items').split(',').filter(Boolean):null;
const requestedSlots=args.includes('--slots')?arg('--slots').split(',').filter(Boolean):null;
const selectedScope=Boolean(requestedItems||requestedSlots);
const strictContacts=args.includes('--require-contacts');
const captureHandDetails=args.includes('--hand-details');
const detailScale=args.includes('--detail-scale')?Number(arg('--detail-scale')):5;
assert.ok(Number.isFinite(detailScale)&&detailScale>=1&&detailScale<=10,'--detail-scale must be between 1 and 10');
const slotNames={weapon:'主武器',offhand:'副手',head:'头部',body:'躯干',hands:'手部',legs:'腿部',feet:'足部',back:'背部',implant:'植入体',module:'模块'};
const slotOrder=Object.keys(slotNames),esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function write(file,value){fs.writeFileSync(path.join(output,file),value);}
function handDetailGroups(records){
 const groups=[];
 for(const slot of slotOrder){
  const rows=records.filter(row=>row.slot===slot&&row.handDetail).sort((a,b)=>a.id.localeCompare(b.id)||['male','female'].indexOf(a.sex)-['male','female'].indexOf(b.sex));
  for(let index=0;index<rows.length;index+=6)groups.push({id:'grip'+slot+'-'+String(index/6+1).padStart(2,'0'),slot,rows:rows.slice(index,index+6)});
 }
 return groups;
}
function gallery(items,records){
 const sections=[];
 for(const slot of slotOrder){
  const group=items.filter(item=>item.slot===slot);
  for(let start=0;start<group.length;start+=6){
   const id=slot+'-'+String(start/6+1).padStart(2,'0');
   const cards=group.slice(start,start+6).map(item=>{return `<article><header><b>${esc(item.name)}</b><code>${esc(item.id)}</code></header><div class="pair">${['male','female'].map(sex=>{
    const row=records.find(record=>record.id===item.id&&record.sex===sex);
    return `<figure><img src="${esc(row.image)}" alt="${esc(item.name)} ${sex==='male'?'男':'女'}"><figcaption>${sex==='male'?'男性':'女性'} · ${row.contactAudit?'接触点数据已记录':'缺少可测接触点'}</figcaption></figure>`;
   }).join('')}</div><p>人工检查：${slot==='weapon'?'握柄接触、手指遮挡、持械方向':slot==='offhand'?'握持或腕带衔接、盾面遮挡':slot==='module'?'固定卡槽或明确悬浮布局':'对应部位、边缘接缝、原服装露出'}<span>结论：待人工复核</span></p></article>`;
   }).join('');
   sections.push(`<section class="sheet" id="${id}"><h2>${esc(slotNames[slot])} · ${start+1}–${Math.min(start+6,group.length)} / ${group.length}</h2><div class="cards">${cards}</div></section>`);
  }
 }
 for(const group of handDetailGroups(records))sections.push('<section class="sheet hand-details" id="'+group.id+'"><h2>'+esc(slotNames[group.slot])+' · 实装握持近景</h2><div class="cards">'+group.rows.map(row=>'<article><header><b>'+esc(row.name)+' · '+(row.sex==='male'?'男':'女')+'</b><code>'+esc(row.id)+'</code></header><img src="'+row.handDetail+'"><p>五指关系、包握/护圈外食指、腕口与物件方向<span>结论：待人工复核</span></p></article>').join('')+'</div></section>');
 return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
 *{box-sizing:border-box}body{margin:0;background:#091018;color:#d8e8ed;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main>header{max-width:1160px;margin:auto;padding:24px}h1{font-size:23px;margin:0 0 10px}h2{font-size:17px;margin:0 0 14px}p{line-height:1.6}a{color:#58cee3}.sheet{width:1160px;padding:20px;margin:0 auto 24px;background:#101c26}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}article{background:#09121b;border:1px solid #2b414b;min-width:0}article header{height:58px;padding:10px 12px}b,code{display:block}b{font-size:14px}code{font-size:10px;color:#8cabb8;line-height:1.8}.pair{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#273b48}figure{margin:0;background:#0e1b25}figure img{width:100%;display:block}figcaption{font-size:10px;padding:5px 7px;background:#0b151e;color:#90b3bd}article p{font-size:10px;min-height:45px;margin:0;padding:7px 10px;color:#aec2cc}article p span{display:block;color:#efc087}@media(max-width:1160px){.sheet{margin-left:0}}
 .hand-details article>img{display:block;width:100%}</style></head><body><main><header><h1>${esc(title)}</h1><p>每张图由真实游戏调用装备操作后，以相同比例放大角色舞台截取。${items.length} 件 × 男女 = ${records.length} 项${selectedScope?'（选定子集，不是全量验收）':''}。成功加载、装备数量守恒不代表合身；本图册初始人工结论一律待复核。</p><p>职业：${esc(career||'初始服装')}；手套：${esc(handwear||'裸手')}。每次切换一件待验收装备，固定的手套不卸下；其他组合需另行验收。<a href="report.json">机器记录</a> · <a href="review.json">逐项人工验收清单</a></p></header>${sections.join('')}</main></body></html>`;
}
(async()=>{
 fs.mkdirSync(output,{recursive:true});fs.mkdirSync(path.join(output,'portraits'),{recursive:true});fs.mkdirSync(path.join(output,'sheets'),{recursive:true});
 const records=[],errors=[],browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({viewport:{width:780,height:980},deviceScaleFactor:1});page.setDefaultTimeout(20000);
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  const url=process.env.RPG_TEST_URL||'http://127.0.0.1:4187/';await page.goto(url);
  const runtimeSources=await page.evaluate(()=>Promise.all(['wardrobe.js','wardrobe-hands.js','wardrobe-sword-hands.js','wardrobe-trigger-hands.js','wardrobe-grips.js','wardrobe-fit.js'].map(async file=>[file,await fetch(new URL(file,location.href)).then(r=>r.text())])));
  const runtimeHashes=Object.fromEntries(runtimeSources.map(([file,text])=>[file,createHash('sha256').update(text).digest('hex')])),runtimeHash=runtimeHashes['wardrobe.js'];
  let items=await page.evaluate(({career,handwear,fixedWeapon})=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='weapon';state.player.equip={};state.meta.careers.main=career?{id:career,level:5,xp:0}:null;state.meta.careers.life=[];
   for(const [id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   if(handwear){if(ITEMS[handwear]?.slot!=='hands'||!equip('hands',handwear,()=>{}))throw Error('Invalid audit handwear '+handwear);}
   if(fixedWeapon){if(ITEMS[fixedWeapon]?.slot!=='weapon'||!equip('weapon',fixedWeapon,()=>{}))throw Error('Invalid fixed weapon '+fixedWeapon);}
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
   const stage=document.createElement('div');stage.id='fit-qa-stage';stage.style.cssText='position:fixed;z-index:20000;left:0;top:0;width:420px;height:600px;background:radial-gradient(ellipse at 50% 38%,#203642 0,#0d1922 72%);display:grid;place-items:center;overflow:hidden;pointer-events:none';document.body.append(stage);
   return Object.entries(ITEMS).filter(([,item])=>item.type==='equip').map(([id,item])=>({id,name:item.name,slot:item.slot}));
  },{career,handwear,fixedWeapon});
  assert.equal(items.length,124,'audit must include the complete current equipment catalog');
  const catalogCount=items.length;
  if(requestedItems){assert.equal(new Set(requestedItems).size,requestedItems.length,'requested items cannot repeat');for(const id of requestedItems)assert.ok(items.some(item=>item.id===id),'unknown requested equipment '+id);items=items.filter(item=>requestedItems.includes(item.id));}
  if(requestedSlots){for(const slot of requestedSlots)assert.ok(slotOrder.includes(slot),'unknown requested slot '+slot);items=items.filter(item=>requestedSlots.includes(item.slot));}
  assert.ok(items.length,'selected audit scope cannot be empty');
  if(fixedWeapon)assert.ok(items.every(item=>item.slot!=='weapon'),'fixed weapon is for testing other equipment with a posed arm');
  items.sort((a,b)=>slotOrder.indexOf(a.slot)-slotOrder.indexOf(b.slot)||a.id.localeCompare(b.id));
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});
  for(const sex of ['male','female']){
   await page.evaluate(sex=>{state.playerAppearance=sex;refreshBagPanel();},sex);await ready();
   for(const item of items){
    const result=await page.evaluate(({id,slot})=>{const before=state.inv[id];state.bagSel=slot;state.bagItemSelected=id;const ok=equip(slot,id,refreshBagPanel);return {ok,before,after:state.inv[id],equipped:P().equip[slot]};},item);
    assert.equal(result.ok,true,item.id+' real equip succeeds');assert.equal(result.equipped,item.id);assert.equal(result.after,result.before-1);await ready();
    const audit=await page.evaluate(async({id,slot,sex,career})=>{
     const live=document.querySelector('.doll-art-host .doll-wearable');
     const itemNodes=[...live.querySelectorAll('[data-item="'+id+'"]')];
     const decoded=itemNodes.length>0&&itemNodes.every(node=>node.tagName!=='IMG'||node.complete&&node.naturalWidth>0);
     const clone=live.cloneNode(true);clone.style.cssText='position:relative;width:360px;max-width:none;aspect-ratio:2/3;left:0;top:0;transform:none;overflow:visible';
     document.querySelector('#fit-qa-stage').replaceChildren(clone);await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
     const outer=clone.getBoundingClientRect(),rect=node=>{const r=node.getBoundingClientRect();return {x:(r.x-outer.x)/outer.width,y:(r.y-outer.y)/outer.height,width:r.width/outer.width,height:r.height/outer.height};};
     const nodes=[...clone.querySelectorAll('[data-item="'+id+'"]')].map(node=>({key:node.dataset.wearKey,slot:node.dataset.slot,integratedGrip:node.dataset.integratedGrip==='true',occupiedHilt:node.dataset.occupiedHilt==='true',tag:node.tagName,source:node.getAttribute('src'),pose:node.dataset.pose,handItem:node.dataset.handItem,rect:rect(node),transform:getComputedStyle(node).transform,zIndex:getComputedStyle(node).zIndex,clip:getComputedStyle(node).clipPath}));
     const contactAudit=typeof wearableFitAudit==='function'?wearableFitAudit(sex,P().equip,career):null;
     return {decoded,nodes,contactAudit,specification:wearableSpecification(sex,P().equip,career),handwear:P().equip.hands||'bare'};
    },{...item,sex,career});
    assert.equal(audit.decoded,true,item.id+' all wearable art decodes');
    if(strictContacts)assertWearableFitContacts(audit.contactAudit,{...item,sex},audit.nodes);
    const image='portraits/'+item.id+'-'+sex+'.png';await page.locator('#fit-qa-stage').screenshot({path:path.join(output,image),animations:'disabled'});
    let handDetail;
    if(captureHandDetails&&audit.specification.some(spec=>spec.slot==='grip'||spec.integratedGrip)){
     await page.evaluate(async({id,detailScale,fixedWeapon})=>{
      const hand=wearableSpecification(state.playerAppearance,P().equip,careerRecord('main')?.id).find(spec=>(spec.slot==='grip'||spec.integratedGrip)&&(spec.item===id||spec.item===fixedWeapon)),center=wearableTransformPoint(hand,hand.gripPoint);
      if(fixedWeapon)center[1]-=6;
      const stage=document.createElement('div');stage.id='fit-hand-detail';stage.style.cssText='position:fixed;z-index:21000;left:0;top:0;width:600px;height:440px;background:#12232d;overflow:hidden;pointer-events:none';
      const width=360*detailScale,clone=document.querySelector('.doll-art-host .doll-wearable').cloneNode(true);clone.style.cssText='position:absolute;width:'+width+'px;max-width:none;aspect-ratio:2/3;left:'+(300-center[0]*width/100)+'px;top:'+(240-center[1]*width*1.5/100)+'px;transform:none;overflow:visible';stage.append(clone);document.body.append(stage);await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
     },{id:item.id,detailScale,fixedWeapon});
     handDetail='portraits/'+item.id+'-'+sex+'-hand.png';await page.locator('#fit-hand-detail').screenshot({path:path.join(output,handDetail),animations:'disabled'});await page.locator('#fit-hand-detail').evaluate(node=>node.remove());
    }
    records.push({...item,sex,image,handDetail,checks:{realEquip:true,quantityConserved:true,artDecoded:true,visualFit:'pending-human-review'},...audit});
    const after=await page.evaluate(({id,slot})=>{unequip(slot,refreshBagPanel);return {count:state.inv[id],equipped:P().equip[slot]};},item);
    assert.equal(after.count,2,item.id+' unequip restores exact item count');assert.ok(!after.equipped);await ready();
   }
   console.log(`${sex}: ${items.length} real equip → screenshot → unequip cycles captured.`);
  }
  assert.deepEqual(errors,[]);
  for(const group of handDetailGroups(records))group.rows.forEach((row,index)=>{row.handDetailSheet='sheets/'+group.id+'.png';row.handDetailInSheet=index+1;});
  write('report.json',JSON.stringify({title,capturedAt:new Date().toISOString(),url,runtimeHash,runtimeHashes,career,handwear:handwear||'bare',catalogCount,scope:selectedScope?'selected-items':'full-catalog',items:items.length,records:records.length,automaticChecks:'equip, unequip, conservation, decoded art; contact/occlusion geometry only when --require-contacts is used',visualFit:'pending-human-review',results:records},null,2));
  write('review.json',JSON.stringify(records.map(({id,name,slot,sex,image})=>({id,name,slot,sex,image,status:'pending',notes:'',reviewedBy:'',reviewedAt:''})),null,2));
  write('index.html',gallery(items,records));
  await page.close();await renderContactSheets(browser,path.join(output,'index.html'),path.join(output,'sheets'),{width:1160,height:1040});
  console.log(`Saved ${records.length} portrait captures and grouped browser screenshots to ${output}`);
  console.log('Visual fit remains PENDING until every record is personally reviewed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
