const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {simulation}=require('./combat-balance.cjs');
const {WEARABLE_ART,WEARABLE_ROOT,WEARABLE_ORDER,wearableSpecification}=require('./wardrobe.js');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {ITEMS}=simulation().a,owners=new Map(),hashes=new Map();
for(const [id,art] of Object.entries(WEARABLE_ART)){
 assert.equal(ITEMS[id]?.type,'equip',id+' must be real equipment');
 assert.equal(art.slot,ITEMS[id].slot,id+' slot must match gameplay');
 assert.ok(WEARABLE_ORDER.includes(art.slot));
 for(const sex of ['male','female']){
  assert.ok(art[sex]?.length,id+' needs '+sex+' fitting');
  const specs=wearableSpecification(sex,{[art.slot]:id});
  const fit=WEARABLE_FIT_V2[id],grip=WEARABLE_GRIPS[id];
  assert.ok(fit||grip,id+' has a calibrated body fit or a measured handle');
  if(grip){
   assert.equal(specs.filter(s=>s.slot===art.slot).length,1,'one held item, not an integrated replacement');
   assert.equal(specs.filter(s=>s.key==='grip-left'||s.key==='grip-right').length,ITEMS[id].weaponHands===2?2:1,'actual occupied hand count');
  }else assert.equal(specs.length,fit.trousers?6:1+fit[sex].length*(fit.joints?4:fit.slot==='feet'?2:1)+(fit.wornTorso?1:0));
  assert.equal(new Set(specs.map(s=>s.key)).size,specs.length);
  for(const spec of specs.filter(s=>s.src))assert.ok(fs.existsSync(path.join(__dirname,spec.src)),spec.src);
  for(const [file,x,y,sx,sy] of art[sex]){
   const filename=path.join(__dirname,WEARABLE_ROOT,file+'.webp');assert.ok(fs.existsSync(filename),filename);
   assert.ok([x,y,sx,sy].every(Number.isFinite)&&sx>0&&sy>0,id+' valid anchors');
   assert.ok(!owners.has(file)||owners.get(file)===id,id+' cannot reuse another item wear art');owners.set(file,id);
   const hash=createHash('sha256').update(fs.readFileSync(filename)).digest('hex');assert.ok(!hashes.has(hash)||hashes.get(hash)===id,id+' cannot duplicate another item image');hashes.set(hash,id);
  }
 }
}
for(const sex of ['male','female']){
 const worn=wearableSpecification(sex,{body:'body_general_5'},'bulwark');
 const bare=wearableSpecification(sex,{},'bulwark');
 assert.equal(worn[0].clip,bare[0].clip,'native armor contours preserve original sleeves and trousers');
 assert.deepEqual(worn.find(s=>s.slot==='uniform'),bare.find(s=>s.slot==='uniform'),'no rectangular career garment replacement');
 const body=worn.find(s=>s.slot==='body'),identity=worn.find(s=>s.key==='body-identity');
 assert.ok(Math.abs(body.sx-body.sy)<.00001,'worn torso retains its authored body proportions');
 assert.equal(identity.src,worn[0].src,'face and jaw remain the original character');
 assert.equal(identity.z,3);assert.ok(identity.clip.includes('81.4%'),'original throat is between uniform and front collar');
 assert.ok(!body.clip&&body.src===WEARABLE_ROOT+WEARABLE_FIT_V2.body_general_5[sex][0].file+'.webp','each sex uses its authored whole contour and neck-opening transparency');
 assert.equal(wearableSpecification(sex,{}).length,1);
 for(const hands of ['workGloves','servoGauntlet','nanoWeaveGloves'])assert.ok(wearableSpecification(sex,{hands})[0].clip.includes('polygon'),'gloves replace bare hands at runtime');
 assert.equal(wearableSpecification(sex,{hands:'phaseGrip'})[0].clip,undefined,'wrist cuffs keep bare hands');
 assert.equal(wearableSpecification(sex,{}).at(0).clip,undefined,'unwear restores bare hands');
}
const missing=Object.entries(ITEMS).filter(([id,item])=>item.type==='equip'&&!WEARABLE_ART[id]).map(([id])=>id);
const torsoIds=Object.entries(ITEMS).filter(([,item])=>item.type==='equip'&&item.slot==='body').map(([id])=>id);
assert.equal(torsoIds.length,11,'all torso items are included, not one example');
const torsoHashes=new Set();
for(const id of torsoIds)for(const sex of ['male','female']){
 const fit=WEARABLE_FIT_V2[id];assert.equal(fit.wornTorso,true,id+' needs an authored worn contour');
 const resting=wearableSpecification(sex,{body:id}).find(s=>s.slot==='body');
 const digest=createHash('sha256').update(fs.readFileSync(path.join(__dirname,resting.src))).digest('hex');
 assert.ok(!torsoHashes.has(digest),id+' '+sex+' needs its own fit art, not a duplicated sprite');torsoHashes.add(digest);
 assert.ok(Math.abs(resting.sx-resting.sy)<.00001,'no nonuniform stretching of worn armor');
 for(const career of ['','bulwark','vanguard','infiltrator'])for(const weapon of ['','blade','rifle','gravLance']){
  const before=wearableSpecification(sex,{weapon},career),after=wearableSpecification(sex,{weapon,body:id},career);
  assert.deepEqual(after.find(s=>s.slot==='body'),resting,id+' must keep its whole torso contour across poses and careers');
  assert.ok(!after.some(s=>s.key.startsWith('forearm-body')),'waist pouches cannot become lower-arm parts');
  assert.deepEqual(after.filter(s=>!['body','anatomy'].includes(s.slot)),before,'armor leaves all other clothing and grip transforms intact');
  assert.equal(after.find(s=>s.key==='body-identity').src,before.find(s=>s.key==='base').src,'retain original neck and face');
 }
}
assert.deepEqual(missing,[],'every equipment item must have verified male/female wear art');
const gradle=fs.readFileSync(path.join(__dirname,'../android/app/build.gradle'),'utf8'),prepare=fs.readFileSync(path.join(__dirname,'../deploy/prepare_netlify_release.sh'),'utf8'),publish=fs.readFileSync(path.join(__dirname,'../deploy/publish_android_update.sh'),'utf8');
assert.match(gradle,/include[^\n]*"wardrobe\.js"/,'APK must include the wardrobe runtime');
assert.match(prepare,/prototype\/wardrobe\.js/);assert.match(prepare,/zip[^\n]*wardrobe\.js/,'full hot update must include the wardrobe runtime');
assert.match(publish,/bundle_files=\([^\n]*wardrobe\.js/);assert.match(publish,/mv '\$web_dir\/wardrobe\.js\.new' '\$web_dir\/wardrobe\.js'/,'web publication must install wardrobe before its entry point');
assert.equal((publish.match(/for art_dir in garden-crops-v1 item-art-v2 equipment-art-v3 wearables-v1 wearables-v2/g)||[]).length,2,'lean bundle and web sync must both include new art');
for(const file of ['wardrobe-fit.js','wardrobe-grips.js','wardrobe-hands.js','wardrobe-trigger-hands.js','wardrobe-sword-hands.js','wardrobe-weapon-poses.js','wardrobe-weapon-art.js','wardrobe-weapon-effects.js']){
 assert.ok(gradle.includes('"'+file+'"'),file+' must ship in APK');
 assert.ok(prepare.includes('prototype/'+file)&&prepare.split('\n').some(line=>line.includes('zip -q')&&line.includes(file)),file+' must ship in full updates');
 assert.ok(publish.split('\n').some(line=>line.startsWith('bundle_files=')&&line.includes(file)),file+' must ship in lean updates');
 assert.ok(publish.split('\n').some(line=>line.startsWith('ssh ')&&line.includes(file)&&line.includes('mv ')),file+' must install before the entry point');
}
for(const sex of ['male','female'])for(const career of ['bulwark','vanguard','infiltrator','noviceGuard','noviceScout','noviceStriker']){
 const specs=wearableSpecification(sex,{feet:'feet_general_5',module:'module_general_5'},career,['noviceCollector','fabricator',{id:'noviceGrower'}]);
 assert.equal(specs[0].src,WEARABLE_ROOT+'base-'+sex+'.webp','main career must never replace the face');
 assert.equal(specs.filter(s=>s.slot==='uniform').length,1);
 assert.deepEqual(specs.filter(s=>s.slot==='life').map(s=>s.item),['salvager','fabricator','biologist']);
 assert.equal(new Set(specs.map(s=>s.key)).size,specs.length);
 for(const spec of specs.filter(s=>s.src))assert.ok(fs.existsSync(path.join(__dirname,spec.src)),spec.src);
 assert.ok(specs[0].clip,'wearing boots hides default boot edges');
}
assert.equal(wearableSpecification('male',{},'', ['salvager','noviceCollector']).filter(s=>s.slot==='life').length,1,'one badge per discipline');
console.log('Wardrobe manifest: '+Object.keys(WEARABLE_ART).length+' fitted items; both identities, six main-career mappings and concurrent life badges passed.');
