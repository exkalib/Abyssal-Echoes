const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {simulation}=require('./combat-balance.cjs');
const {WEARABLE_ART,WEARABLE_ROOT,WEARABLE_ORDER,wearableSpecification}=require('./wardrobe.js');
const {ITEMS}=simulation().a,owners=new Map(),hashes=new Map();
for(const [id,art] of Object.entries(WEARABLE_ART)){
 assert.equal(ITEMS[id]?.type,'equip',id+' must be real equipment');
 assert.equal(art.slot,ITEMS[id].slot,id+' slot must match gameplay');
 assert.ok(WEARABLE_ORDER.includes(art.slot));
 for(const sex of ['male','female']){
  assert.ok(art[sex]?.length,id+' needs '+sex+' fitting');
  const specs=wearableSpecification(sex,{[art.slot]:id});
  assert.equal(specs.length,1+art[sex].length);assert.equal(new Set(specs.map(s=>s.key)).size,specs.length);
  for(const [file,x,y,sx,sy] of art[sex]){
   const filename=path.join(__dirname,WEARABLE_ROOT,file+'.webp');assert.ok(fs.existsSync(filename),filename);
   assert.ok([x,y,sx,sy].every(Number.isFinite)&&sx>0&&sy>0,id+' valid anchors');
   assert.ok(!owners.has(file)||owners.get(file)===id,id+' cannot reuse another item wear art');owners.set(file,id);
   const hash=createHash('sha256').update(fs.readFileSync(filename)).digest('hex');assert.ok(!hashes.has(hash)||hashes.get(hash)===id,id+' cannot duplicate another item image');hashes.set(hash,id);
  }
 }
}
for(const sex of ['male','female']){
 assert.equal(wearableSpecification(sex,{}).length,1);
 for(const hands of ['workGloves','servoGauntlet','nanoWeaveGloves'])assert.ok(wearableSpecification(sex,{hands})[0].clip.includes('polygon'),'gloves replace bare hands at runtime');
 assert.equal(wearableSpecification(sex,{hands:'phaseGrip'})[0].clip,undefined,'wrist cuffs keep bare hands');
 assert.equal(wearableSpecification(sex,{}).at(0).clip,undefined,'unwear restores bare hands');
}
const missing=Object.entries(ITEMS).filter(([id,item])=>item.type==='equip'&&!WEARABLE_ART[id]).map(([id])=>id);
assert.deepEqual(missing,[],'every equipment item must have verified male/female wear art');
const gradle=fs.readFileSync(path.join(__dirname,'../android/app/build.gradle'),'utf8'),prepare=fs.readFileSync(path.join(__dirname,'../deploy/prepare_netlify_release.sh'),'utf8'),publish=fs.readFileSync(path.join(__dirname,'../deploy/publish_android_update.sh'),'utf8');
assert.match(gradle,/include[^\n]*"wardrobe\.js"/,'APK must include the wardrobe runtime');
assert.match(prepare,/prototype\/wardrobe\.js/);assert.match(prepare,/zip[^\n]*wardrobe\.js/,'full hot update must include the wardrobe runtime');
assert.match(publish,/bundle_files=\([^\n]*wardrobe\.js/);assert.match(publish,/mv '\$web_dir\/wardrobe\.js\.new' '\$web_dir\/wardrobe\.js'/,'web publication must install wardrobe before its entry point');
assert.equal((publish.match(/for art_dir in garden-crops-v1 item-art-v2 equipment-art-v3 wearables-v1/g)||[]).length,2,'lean bundle and web sync must both include new art');
for(const sex of ['male','female'])for(const career of ['bulwark','vanguard','infiltrator','noviceGuard','noviceScout','noviceStriker']){
 const specs=wearableSpecification(sex,{feet:'feet_general_5',module:'module_general_5'},career,['noviceCollector','fabricator',{id:'noviceGrower'}]);
 assert.equal(specs[0].src,WEARABLE_ROOT+'base-'+sex+'.webp','main career must never replace the face');
 assert.equal(specs.filter(s=>s.slot==='uniform').length,1);
 assert.deepEqual(specs.filter(s=>s.slot==='life').map(s=>s.item),['salvager','fabricator','biologist']);
 assert.equal(new Set(specs.map(s=>s.key)).size,specs.length);
 for(const spec of specs)assert.ok(fs.existsSync(path.join(__dirname,spec.src)),spec.src);
 assert.ok(specs[0].clip,'wearing boots hides default boot edges');
}
assert.equal(wearableSpecification('male',{},'', ['salvager','noviceCollector']).filter(s=>s.slot==='life').length,1,'one badge per discipline');
console.log('Wardrobe manifest: '+Object.keys(WEARABLE_ART).length+' fitted items; both identities, six main-career mappings and concurrent life badges passed.');
