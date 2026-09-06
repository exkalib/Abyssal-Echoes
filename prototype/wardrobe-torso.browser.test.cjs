// Shoulder/neck evidence from real equip operations. No live player profile.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {renderContactSheets}=require('./wardrobe-atlas-sheets.cjs');
const out=path.resolve(process.env.WARDROBE_TORSO_OUTPUT||'output/wardrobe-torso-review');
const oldPath=process.env.WARDROBE_TORSO_BEFORE||path.join(__dirname,'../output/wardrobe-fit-final/report.json');
const old=JSON.parse(fs.readFileSync(oldPath,'utf8')).results.filter(r=>r.id==='body_general_5');
assert.equal(old.length,2,'comparison needs both actual previous equip snapshots');
(async()=>{
 fs.mkdirSync(path.join(out,'images'),{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const records=[],errors=[];
 try{
  const page=await browser.newPage({viewport:{width:780,height:980}});page.setDefaultTimeout(15000);
  page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
  for(const sex of ['male','female']){
   const alpha=await page.evaluate(async sex=>{
    const img=new Image();img.src='assets/wearables-v2/body_general_5-worn-'+sex+'.webp';await img.decode();
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    const a=(x,y)=>ctx.getImageData(x,y,1,1).data[3];
    return {size:[canvas.width,canvas.height],outside:a(0,0),neck:a(512,sex==='male'?350:210),chest:a(512,600)};
   },sex);
   assert.deepEqual(alpha.size,[1024,1536]);assert.equal(alpha.outside,0);assert.equal(alpha.neck,0,'neck opening must be truly transparent, not a black mannequin cavity');assert.ok(alpha.chest>240);
  }
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='body';state.player.equip={};state.meta.careers.main=null;state.meta.careers.life=[];
   for(const [id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});
  const layers=()=>page.evaluate(()=>[...document.querySelectorAll('.doll-art-host [data-wear-key]')].map(n=>({key:n.dataset.wearKey,slot:n.dataset.slot,item:n.dataset.item,src:n.getAttribute('src'),transform:n.style.transform,clip:n.style.clipPath,z:n.style.zIndex,pose:n.dataset.pose})).sort((a,b)=>a.key.localeCompare(b.key)));
  const capture=async(name,snapshot)=>{
   await page.evaluate(async snapshot=>{
    document.querySelector('#torso-qa-stage')?.remove();
    const stage=document.createElement('div');stage.id='torso-qa-stage';stage.style.cssText='position:fixed;z-index:30000;left:0;top:0;width:720px;height:650px;background:#12232d;overflow:hidden;pointer-events:none';
    let rig=document.querySelector('.doll-art-host .doll-wearable').cloneNode(true);
    if(snapshot){
     rig.replaceChildren();
     for(const s of snapshot){const n=document.createElement('img');n.src=s.src;n.dataset.wearKey=s.key;n.style.zIndex=s.z??({base:1,uniform:2,body:6}[s.slot]);n.style.transform=s.slot==='base'?'none':'translate('+s.x+'%,'+s.y+'%) rotate('+(s.rotation||0)+'deg) scale('+s.sx+','+s.sy+')';n.style.transformOrigin=s.origin||'50% 0%';n.style.clipPath=s.clip||'none';rig.append(n);}
    }
    rig.style.cssText='position:absolute;width:1000px;max-width:none;aspect-ratio:2/3;left:-140px;top:-170px;transform:none;overflow:visible';stage.append(rig);document.body.append(stage);await Promise.all([...rig.querySelectorAll('img')].map(n=>n.decode()));
   },snapshot||null);
   const file='images/'+name+'.png';await page.locator('#torso-qa-stage').screenshot({path:path.join(out,file),animations:'disabled'});
   await page.locator('#torso-qa-stage').evaluate(n=>n.remove());return file;
  };
  for(const sex of ['male','female'])for(const career of ['','bulwark','vanguard','infiltrator'])for(const mixed of [false,true]){
   await page.evaluate(({sex,career,mixed})=>{
    for(const slot of Object.keys(P().equip))if(P().equip[slot])unequip(slot,()=>{});
    state.playerAppearance=sex;state.meta.careers.main=career?{id:career,level:5,xp:0}:null;
    if(mixed)for(const [slot,id]of Object.entries({weapon:'blade',offhand:'riotShield',head:'helmet',hands:'hands_specialist_5',legs:'legs_general_5',feet:'feet_general_5',back:'back_specialist_5',implant:'neuralFilter',module:'module_general_5'}))if(!equip(slot,id,()=>{}))throw Error('Cannot equip '+id);
    refreshBagPanel();
   },{sex,career,mixed});await ready();
   const previous=await layers();
   await page.evaluate(()=>{window.torsoBase=document.querySelector('.doll-art-host [data-wear-key="base"]');});
   assert.equal(await page.evaluate(()=>equip('body','body_general_5',refreshBagPanel)),true);await ready();
   assert.equal(await page.evaluate(()=>torsoBase===document.querySelector('.doll-art-host [data-wear-key="base"]')),true,'base identity node is retained');
   const current=await layers(),body=current.find(n=>n.slot==='body'),identity=current.find(n=>n.key==='body-identity');
   assert.equal(identity.src,'assets/wearables-v1/base-'+sex+'.webp');assert.ok(Number(identity.z)<Number(body.z)&&Number(identity.z)>2,'original throat is above uniform and behind the front collar');
   assert.deepEqual(current.filter(n=>['base','uniform'].includes(n.slot)),previous.filter(n=>['base','uniform'].includes(n.slot)),'no rectangular replacement of original clothing');
   assert.ok(!body.clip||body.clip==='none','armor uses native curved edges, not a rectangular crop');assert.match(body.src,new RegExp('worn-'+sex));
   const unaffected=rows=>rows.filter(n=>!['base','uniform','body','anatomy'].includes(n.slot));
   assert.deepEqual(unaffected(current),unaffected(previous),'head/hand/weapon/lower-body equipment is unchanged');
   const name=sex+'-'+(career||'base')+(mixed?'-mixed':'-single'),image=await capture(name);
   let beforeImage;
   if(!career&&!mixed)beforeImage=await capture(sex+'-before',old.find(r=>r.sex===sex).specification);
   await page.evaluate(()=>{state.tab='char';state.charView='overview';render();});await ready();assert.deepEqual(await layers(),current,'character and backpack share worn torso and identity occlusion');
   await page.evaluate(()=>{state.tab='bag';render();});await ready();
   assert.equal(await page.evaluate(()=>{unequip('body',refreshBagPanel);return state.inv.body_general_5;}),2);await ready();assert.deepEqual(await layers(),previous,'unwear restores exact prior uniform, body masks and other gear');
   records.push({sex,career:career||'base',mixed,image,beforeImage,checks:'real equip + correct gender source + original jaw depth + unchanged other gear + identical pages + exact unequip restore',visualReview:'pending-eye-review'});
  }
  for(const width of [360,390,520]){
   await page.setViewportSize({width,height:844});
   await page.evaluate(()=>{equip('body','body_general_5',refreshBagPanel);});await ready();
   await page.screenshot({path:path.join(out,'images',width+'-bag.png'),animations:'disabled'});
   await page.evaluate(()=>{state.tab='char';state.charView='overview';render();});await ready();
   await page.screenshot({path:path.join(out,'images',width+'-character.png'),animations:'disabled'});
   const g=await page.locator('.doll-art-host .doll-wearable').boundingBox();assert.ok(Math.abs(g.width/g.height-2/3)<.002);
   await page.evaluate(()=>{state.tab='bag';render();});await ready();
  }
  assert.deepEqual(errors,[]);
  const runtimeHashes=Object.fromEntries(['wardrobe.js','wardrobe-fit.js',...['male','female'].map(sex=>'assets/wearables-v2/body_general_5-worn-'+sex+'.webp')].map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join(__dirname,file))).digest('hex')]));
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({scope:'body_general_5 only; other chest items remain under review',capturedAt:new Date().toISOString(),oldPath,runtimeHashes,records},null,2));
  const pair=sex=>{const r=records.find(r=>r.sex===sex&&r.career==='base'&&!r.mixed);return '<section class="sheet" id="'+sex+'-comparison"><h2>'+(sex==='male'?'男性':'女性')+' · 肩膀与领口</h2><div class="pair"><figure><figcaption>修改前：旧实装快照重放</figcaption><img src="'+r.beforeImage+'"></figure><figure><figcaption>修改后：正式装备操作</figcaption><img src="'+r.image+'"></figure></div></section>';};
  const combinations=records.filter(r=>r.career!=='base'||r.mixed).map(r=>'<figure><figcaption>'+r.sex+' · '+r.career+' · '+(r.mixed?'混搭':'单穿')+'</figcaption><a href="'+r.image+'"><img loading="lazy" src="'+r.image+'"></a></figure>').join('');
  fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>星际远征甲 · 肩颈穿着态修正</title><style>body{margin:0;background:#0b151e;color:#dcebf0;font:15px/1.7 system-ui}main{max-width:1480px;margin:auto;padding:20px}h1{font-size:25px}.sheet{width:100%;margin:24px 0}.pair{display:grid;grid-template-columns:1fr 1fr}figure{margin:0}figcaption{padding:12px;background:#182b37}img{display:block;width:100%;height:auto}a{color:#65d1e3}.combos{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.scroll{overflow:auto}@media(max-width:650px){.pair,.combos{grid-template-columns:1fr}main{padding:12px}}</style><main><h1>星际远征甲 · 肩颈穿着态修正</h1><p>只核验本件胸甲。肩甲包住肩峰和上臂，前颈露在后领前，前领环在颈根前；原脸、手部与下身仍独立穿戴。自动检查不代替目视复核，见 <a href="report.json">本轮记录</a>。未覆盖的其他胸甲不沿用旧通过结论。</p><div class="scroll">'+pair('male')+pair('female')+'</div><h2>职业制服与混搭近景</h2><div class="combos">'+combinations+'</div></main></html>');
  await page.close();await renderContactSheets(browser,path.join(out,'index.html'),path.join(out,'comparisons'),{width:1480,height:850});
  console.log('16 real torso equip contexts, cross-page equality, unchanged gear, exact unwear restore and 3 phone widths passed. Eye review required: '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
