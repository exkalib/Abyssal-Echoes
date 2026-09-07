// All torso armor, through real equip/unequip. Runs in an isolated profile only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {renderContactSheets}=require('./wardrobe-atlas-sheets.cjs');
const out=path.resolve(process.env.WARDROBE_ARMOR_OUTPUT||'output/wardrobe-armor-review-v9');
const smoke=process.env.WARDROBE_ARMOR_SMOKE==='1';
const ids=Object.keys(WEARABLE_FIT_V2).filter(id=>WEARABLE_FIT_V2[id].slot==='body');
const source=(id,sex)=>'assets/wearables-v1/'+WEARABLE_FIT_V2[id][sex][0].file+'.webp';
assert.equal(ids.length,11);for(const id of ids)assert.equal(WEARABLE_FIT_V2[id].wornTorso,true,id+' must use worn art');
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<.02,label+': '+a+' versus '+b);
const clipPoints=clip=>{assert.match(clip,/^polygon\(/);return clip.slice(8,-1).split(',').map(p=>p.trim().split(/\s+/).map(parseFloat));};
// The lower-body replacement is a compound polygon joined by doubled edges.
// Use nonzero winding, not a bounding box or an even/odd approximation.
function visible(points,x,y){
 if(!points)return true;
 let winding=0;
 for(let i=0;i<points.length;i++){
  const [a,b]=points[i],[c,d]=points[(i+1)%points.length],cross=(c-a)*(y-b)-(x-a)*(d-b);
  if(b<=y&&d>y&&cross>0)winding++;else if(b>y&&d<=y&&cross<0)winding--;
 }
 return winding!==0;
}
function matrix(row){
 const m=row.transform.match(/^translate\(([-\d.e+]+)%,\s*([-\d.e+]+)%\) matrix\(([^)]+)\)$/);
 assert.ok(m,row.key+' complete pants retain their explicit source matrix');
 const v=m[3].split(',').map(Number);assert.equal(v.length,6);assert.ok(v.every(Number.isFinite));
 return {x:Number(m[1])*5.12,y:Number(m[2])*7.68,a:v[0],b:v[1],c:v[2],d:v[3],e:v[4],f:v[5]};
}
function world(row,p){const m=matrix(row);return [m.a*p[0]+m.c*p[1]+m.x,m.b*p[0]+m.d*p[1]+m.y];}
function assertOtherEquipment(previous,current,mixed){
 const unrelated=rows=>rows.filter(n=>!['body','anatomy'].includes(n.slot));
 const before=unrelated(previous),after=unrelated(current);assert.equal(after.length,before.length,'no extra unrelated equipment/identity/hand layers');
 for(const old of before){
  const now=after.find(n=>n.key===old.key);assert.ok(now,old.key+' remains mounted');
  if(mixed&&['legs-trousers-0','legs-trousers-rear'].includes(old.key)){
   const omit=({transform,clip,...rest})=>rest;assert.deepEqual(omit(now),omit(old),old.key+' only waist fitting may vary; item/source/pose/depth cannot change');
   const a=matrix(old),b=matrix(now);
   for(const name of ['x','a','b','c','e','f'])assert.equal(b[name],a[name],old.key+' cannot shift sideways, change width, rotate or shear');
   assert.equal(b.b,0);assert.equal(b.c,0);assert.ok(b.d>0&&b.d/a.d>.65&&b.d/a.d<1.35,'waist adjustment remains local and nonmirrored');
   const art=WEARABLE_FIT_V2[old.item].trousers,scale=Math.min(512/art.width,768/art.height),crotchY=(768-art.height*scale)/2+art.crotch[1]*scale;
   for(const x of [0,128,256,384,512])world(now,[x,crotchY]).forEach((v,i)=>near(v,world(old,[x,crotchY])[i],old.key+' entire crotch join stays fixed'));
   if(old.key.endsWith('-rear'))assert.equal(now.clip,old.clip,'rear/front source waist contour is unchanged');
   else{
    const p=clipPoints(old.clip),q=clipPoints(now.clip);assert.deepEqual(q.slice(0,-2),p.slice(0,-2),'the authored front waist rim is not recut to hide a fit problem');
    for(let i=1;i<=2;i++)world(now,q.at(-i).map((n,k)=>n*(k?7.68:5.12))).forEach((v,k)=>near(v,world(old,p.at(-i).map((n,j)=>n*(j?7.68:5.12)))[k],'outgoing pelvis clip still meets the same thigh boundary'));
   }
  }else if(mixed&&['base','uniform'].includes(old.slot)){
   const omitClip=({clip,...rest})=>rest;assert.deepEqual(omitClip(now),omitClip(old),'original '+old.slot+' identity/source/pose/transform cannot change');
   const oldClip=old.clip==='none'?null:clipPoints(old.clip),newClip=now.clip==='none'?null:clipPoints(now.clip);
   for(let y=.19;y<100;y+=.5)for(let x=.23;x<100;x+=.5){
    // Only the central waist can be trimmed to the newly tucked pants. This
    // protects face, shoulders, posed hands, old-pants removal and original feet.
    if(y<33||y>55||x<31||x>69)assert.equal(visible(newClip,x,y),visible(oldClip,x,y),old.slot+' clip changed outside the necessary central waist at '+x+','+y);
   }
  }else assert.deepEqual(now,old,old.key+' lower pants/knees/ankles, other equipment and sleeve pose remain exact');
 }
}
(async()=>{
 fs.mkdirSync(path.join(out,'images'),{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const records=[],errors=[],alpha=[];
 try{
  const page=await browser.newPage({viewport:{width:780,height:980}});page.setDefaultTimeout(20000);
  page.on('pageerror',e=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&e.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!e.stack.includes('http'))return;errors.push(e.stack);});
  await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
  // Inspect the actual decoded alpha; an image of a checkerboard is not alpha.
  for(const id of ids)for(const sex of ['male','female']){
   const piece={...WEARABLE_FIT_V2[id][sex][0],src:source(id,sex)};
   const sample=await page.evaluate(async({id,sex,piece})=>{
    const img=new Image();img.src=piece.src;await img.decode();
    const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    const a=(x,y)=>ctx.getImageData(Math.floor(x*c.width),Math.floor(y*c.height),1,1).data[3];
    const neck=piece.neckSample||(sex==='male'?[.5,350/1536]:[.5,210/1536]);
    return {id,sex,size:[c.width,c.height],outside:a(0,0),neck:a(...neck),chest:a(.5,piece.bounds[1]+piece.bounds[3]*.6)};
   },{id,sex,piece});
   assert.deepEqual(sample.size,[piece.width,piece.height]);assert.equal(sample.outside,0,id+' outer alpha');assert.equal(sample.neck,0,id+' neck alpha');assert.ok(sample.chest>240,id+' solid garment');alpha.push(sample);
  }
  await page.evaluate(()=>{
   prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
   state.tab='bag';state.bagView='equipment';state.bagSel='body';state.player.equip={};state.meta.careers.main=null;state.meta.careers.life=[];
   for(const [id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
   document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
  });
  const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]',{state:'attached'});
  const layers=()=>page.evaluate(()=>[...document.querySelectorAll('.doll-art-host [data-wear-key]')].map(n=>({key:n.dataset.wearKey,slot:n.dataset.slot,item:n.dataset.item,src:n.getAttribute('src'),transform:n.style.transform,clip:n.style.clipPath,z:n.style.zIndex,pose:n.dataset.pose})).sort((a,b)=>a.key.localeCompare(b.key)));
  const capture=async(name,full=false)=>{
   await page.evaluate(async full=>{
    const stage=document.createElement('div');stage.id='armor-qa-stage';stage.style.cssText='position:fixed;z-index:30000;left:0;top:0;width:'+(full?440:600)+'px;height:'+(full?690:620)+'px;background:#12232d;overflow:hidden;pointer-events:none';
    const rig=document.querySelector('.doll-art-host .doll-wearable').cloneNode(true);
    rig.style.cssText=full?'position:absolute;width:440px;max-width:none;aspect-ratio:2/3;left:0;top:10px;transform:none;overflow:visible':'position:absolute;width:1000px;max-width:none;aspect-ratio:2/3;left:-200px;top:-130px;transform:none;overflow:visible';
    stage.append(rig);document.body.append(stage);await Promise.all([...rig.querySelectorAll('img')].map(n=>n.decode()));
   },full);
   const file='images/'+name+(full?'-full':'')+'.png';await page.locator('#armor-qa-stage').screenshot({path:path.join(out,file),animations:'disabled'});await page.locator('#armor-qa-stage').evaluate(n=>n.remove());return file;
  };
  const careers=smoke?['']:['','bulwark','vanguard','infiltrator'],mixes=smoke?[false]:[false,true];
  for(const id of ids)for(const sex of ['male','female'])for(const career of careers)for(const mixed of mixes){
   await page.evaluate(({sex,career,mixed})=>{
    for(const slot of Object.keys(P().equip))if(P().equip[slot])unequip(slot,()=>{});
    state.playerAppearance=sex;state.meta.careers.main=career?{id:career,level:5,xp:0}:null;
    if(mixed)for(const [slot,id]of Object.entries({weapon:'blade',offhand:'riotShield',hands:'hands_specialist_5',legs:'legs_general_5',feet:'feet_general_5',back:'back_specialist_5',implant:'neuralFilter',module:'module_general_5'}))if(!equip(slot,id,()=>{}))throw Error('Cannot equip '+id);
    refreshBagPanel();
   },{sex,career,mixed});await ready();
   const previous=await layers();await page.evaluate(()=>{window.armorBase=document.querySelector('.doll-art-host [data-wear-key="base"]');});
   assert.equal(await page.evaluate(id=>equip('body',id,refreshBagPanel),id),true);await ready();
   assert.equal(await page.evaluate(()=>armorBase===document.querySelector('.doll-art-host [data-wear-key="base"]')),true,'retain identity node');
   const current=await layers(),body=current.find(n=>n.slot==='body'),identity=current.find(n=>n.key==='body-identity');
   assert.equal(body.src,source(id,sex));assert.equal(body.clip,'none','native contour must remain whole when holding a sword');
   assert.ok(!current.some(n=>n.key.startsWith('forearm-body')),'do not rotate armor waist as a sleeve');
   assert.equal(identity.src,'assets/wearables-v1/base-'+sex+'.webp');assert.ok(Number(identity.z)<Number(body.z)&&Number(identity.z)>2);
   assertOtherEquipment(previous,current,mixed);
   const name=id+'-'+sex+'-'+(career||'base')+(mixed?'-mixed':'-single'),image=await capture(name),fullImage=(!career||mixed)?await capture(name,true):undefined;
   await page.evaluate(()=>{state.tab='char';state.charView='overview';render();});await ready();assert.deepEqual(await layers(),current,'character/backpack equality');
   await page.evaluate(()=>{state.tab='bag';render();});await ready();
   assert.equal(await page.evaluate(id=>{unequip('body',refreshBagPanel);return state.inv[id];},id),2);await ready();assert.deepEqual(await layers(),previous,'exact unequip restore');
   records.push({id,name:await page.evaluate(id=>ITEMS[id].name,id),sex,career:career||'base',mixed,image,fullImage,visualReview:'pending-human-review',checks:'real equip / native alpha / intact torso / shared pages / exact unwear'});
  }
  if(!smoke)for(const width of [360,390,520]){
   await page.setViewportSize({width,height:844});await page.evaluate(()=>{equip('body','power',refreshBagPanel);});await ready();
   for(const tab of ['bag','char']){await page.evaluate(tab=>{state.tab=tab;state.charView='overview';render();},tab);await ready();await page.screenshot({path:path.join(out,'images',width+'-'+tab+'.png'),animations:'disabled'});const box=await page.locator('.doll-art-host .doll-wearable').boundingBox();assert.ok(Math.abs(box.width/box.height-2/3)<.002);}
  }
  assert.deepEqual(errors,[]);
  const files=['wardrobe.js','wardrobe-fit.js',...ids.flatMap(id=>['male','female'].map(sex=>source(id,sex)))];
  const hashes=Object.fromEntries(files.map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join(__dirname,file))).digest('hex')]));
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({scope:'all 11 torso armor, both bodies',capturedAt:new Date().toISOString(),smoke,alpha,hashes,records},null,2));
  const figures=rs=>rs.map(r=>'<figure><figcaption>'+r.name+' · '+r.sex+' · '+r.career+' · '+(r.mixed?'持剑混搭':'单穿')+'</figcaption><a href="'+r.image+'"><img src="'+r.image+'"></a>'+(r.fullImage?'<a href="'+r.fullImage+'">查看全身</a>':'')+'</figure>').join('');
  const sheets=ids.map(id=>'<section class="sheet" id="'+id+'"><h2>'+records.find(r=>r.id===id).name+' · 肩颈与腰线</h2><div class="pair">'+figures(records.filter(r=>r.id===id&&r.career==='base'&&!r.mixed))+'</div></section>').join('');
  const combinations=smoke?'':ids.flatMap(id=>['bulwark','vanguard','infiltrator'].map(career=>'<section class="sheet" id="'+id+'-'+career+'"><h2>'+records.find(r=>r.id===id).name+' · '+career+'</h2><div class="four">'+figures(records.filter(r=>r.id===id&&r.career===career))+'</div></section>')).join('');
  fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>全部胸甲 · v9 穿着检查</title><style>body{margin:0;background:#0b151e;color:#dcebf0;font:15px/1.7 system-ui}main{max-width:1320px;margin:auto;padding:20px}.sheet{padding:16px;box-sizing:border-box;margin:20px 0;background:#0d202c}.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}.four{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}figure{margin:0}figcaption{padding:10px;background:#203744}img{width:100%;height:auto;display:block}a{color:#71dfe6}h2{font-size:19px}@media(max-width:650px){.four{grid-template-columns:1fr 1fr}main{padding:8px}}</style><main><h1>全部 11 件胸甲 · 男女逐件实装检查</h1><p>通过游戏装备、卸下操作获取，不使用玩家存档。原脸与脖颈保留，衣甲使用原生透明轮廓；持剑时躯干不随前臂旋转。自动检查不代替目视检查。</p><p><a href="../wardrobe-v8-runtime-review/index.html">实时试穿（无需存档）</a> · <a href="report.json">'+records.length+' 组操作记录</a> · <a href="../../prototype/wardrobe-armor-v9-prompts.json">内置 imagegen 原画与提示记录</a></p>'+sheets+combinations+'</main></html>');
  await page.close();await renderContactSheets(browser,path.join(out,'index.html'),path.join(out,'sheets'),{width:1320,height:1000});
  console.log(records.length+' all-armor contexts passed; native alpha, actual equip/unwear, intact torso and page equality. Eye-review images: '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
