const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {WEARABLE_ART,wearableSpecification,wearableFitAudit,wearableTransformPoint}=require('./wardrobe.js');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {WEARABLE_HOLD_HANDS}=require('./wardrobe-hands.js');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {weaponPoseKind,weaponPoseRig}=require('./wardrobe-weapon-poses.js');
const poseArt=require('./wardrobe-weapon-art.js');
const {assertWearableFitContacts}=require('./wardrobe-fit-contract.cjs');
const near=(a,b,label)=>assert.ok(Math.hypot(a[0]-b[0],(a[1]-b[1])*1.5)<1e-7,label);
function alphaHeader(file){
 const b=fs.readFileSync(path.join(__dirname,file)),chunk=b.toString('ascii',12,16);
 assert.equal(b.toString('ascii',0,4),'RIFF',file+' WebP');
 assert.ok(chunk==='VP8X'?b[20]&16:chunk==='VP8L'&&(b.readUInt32LE(21)&0x10000000),file+' transparent format');
 // Full decoded alpha and edge inspection are separate browser/asset QA gates.
}
function similarity(spec,label){
 if(spec.matrix){const [a,b,c,d]=spec.matrix;assert.ok(Math.abs(a*c+b*d)<1e-8,label+' no shear');assert.ok(Math.abs(Math.hypot(a,b)-Math.hypot(c,d))<1e-8,label+' isotropic');}
 else assert.ok(Math.abs(spec.sx-spec.sy)<1e-8,label+' isotropic');
}
const gloveIds=Object.keys(WEARABLE_HOLD_HANDS);
for(const glove of gloveIds)for(const family of ['low','primary','support']){
 const art=poseArt[family][glove];assert.ok(art,glove+' needs '+family+' artwork, no bare-hand fallback');
 alphaHeader('assets/wearables-v1/'+art.file+'.webp');
 for(const point of [art.wrist,art.forearm,art.grip,art.axis])assert.ok(point.length===2&&point.every(Number.isFinite),'authored source anchors');
}
assert.equal(wearableSpecification('male',{body:'knife'}).length,1,'invalid slot does not crash');
assert.equal(wearableSpecification('female',{weapon:'helmet'}).length,1,'invalid slot does not show unrelated art');
for(const [id,art]of Object.entries(WEARABLE_GRIPS)){
 const slot=WEARABLE_ART[id].slot,kind=weaponPoseKind(id),two=kind==='longgun';
 alphaHeader(art.source);
 for(const sex of ['male','female'])for(const glove of gloveIds){
  const equipment={[slot]:id,...(glove==='bare'?{}:{hands:glove})},specs=wearableSpecification(sex,equipment);
  const main=specs.find(s=>s.key===(slot==='weapon'?'grip-left':'grip-right')),object=specs.find(s=>s.slot===slot);
  assert.equal(main.handItem,glove,'equipped glove never falls back to bare fingers');
  assert.equal(object.src,art.source,'each weapon retains its own item-specific art');
  if(slot==='weapon')similarity(main,id+' hand');
  similarity(object,id+' object');
  near(wearableTransformPoint(main,main.gripPoint),wearableTransformPoint(object,object.art.grip),id+' actual palm contact');
  if(slot==='weapon'){
   assert.equal(object.fit,'pose-v11',id+'/'+glove+' is wired into the new runtime, not an old fallback');
   assert.match(main.src,/\/(weapon-poses-v11|hands-v12)\//,'native-alpha gesture assets are mounted');
   const rig=weaponPoseRig(sex,id),wrist=main.contact.anchor;
   near(wrist,rig.arms.left.wrist,id+' main wrist');
   assert.equal(main.pose,['sidearm','longgun'].includes(kind)?'trigger':kind,'weapon-family gesture');
   assert.ok(specs.some(s=>s.key==='forearm-left-base'),'main sleeve follows its wrist');
   if(kind==='sidearm')assert.ok(wrist[1]<rig.arms.left.elbow[1],'pistol is raised');
   else if(!two)assert.ok(wrist[1]>rig.arms.left.elbow[1],'tool and blades are held low');
   if(two){
    const support=specs.find(s=>s.key==='grip-right');
    assert.equal(support.pose,'support');assert.equal(support.handItem,glove);
    assert.notEqual(support.src,main.src,'support is not a mirrored trigger hand');
    assert.ok(specs.some(s=>s.key==='forearm-right-base'),'supporting sleeve follows offhand');
    near(wearableTransformPoint(support,support.gripPoint),support.gripContact.anchor,'actual fore-end contact');
   }else{
    assert.ok(!specs.some(s=>s.key==='forearm-right-base'),'empty arm does not change');
    const a=wearableTransformPoint(main,main.handleAxis),b=wearableTransformPoint(object,object.art.handleAxis||object.art.grip);
    if(!['sidearm'].includes(kind)){
     const p=wearableTransformPoint(main,main.gripPoint),q=wearableTransformPoint(object,object.art.grip);
     const x=[a[0]-p[0],(a[1]-p[1])*1.5],y=[b[0]-q[0],(b[1]-q[1])*1.5];
     assert.ok((x[0]*y[0]+x[1]*y[1])/(Math.hypot(...x)*Math.hypot(...y))>.99999,'hilt follows the occupied grip');
    }
   }
   if(glove!=='bare'){
    const cuffs=specs.filter(s=>s.slot==='cuff');assert.equal(cuffs.length,two?2:1);
    assert.ok(cuffs.every(s=>s.item===glove&&s.clip.startsWith('polygon(')));
    assert.equal(specs.filter(s=>s.slot==='hands').length,two?0:1,'no duplicate relaxed palms');
   }
   const bareObject=wearableSpecification(sex,{weapon:id}).find(s=>s.slot==='weapon');
   assert.ok(Math.abs(Math.hypot(...object.matrix.slice(0,2))-Math.hypot(...bareObject.matrix.slice(0,2)))<1e-9,'glove/finger size cannot rescale the weapon');
  }else assert.equal(main.pose,'shield');
  assert.equal(new Set(specs.map(s=>s.key)).size,specs.length,'unique part keys');
  assertWearableFitContacts(wearableFitAudit(sex,equipment),{id,sex,slot},specs.map(s=>({key:s.key,slot:s.slot,occupiedHilt:s.occupiedHilt,zIndex:s.z??1})));
 }
}
for(const sex of ['male','female']){
 assert.equal(wearableSpecification(sex,{}).length,1,'unwear restores the exact original body');
 const cuffs=wearableSpecification(sex,{weapon:'rifle',hands:'phaseGrip'});
 assert.equal(cuffs.filter(s=>s.slot==='hands').length,2,'wrist-only devices remain on both posed arms');
 assert.ok(cuffs.filter(s=>s.slot==='grip').every(s=>s.handItem==='bare'),'wrist devices do not become gloves');
 for(const career of ['bulwark','vanguard','infiltrator']){
  const layers=wearableSpecification(sex,{feet:'gravityBoots'},career),hem=WEARABLE_FIT_V2.gravityBoots.baseCutY[sex];
  assert.ok(layers.find(s=>s.slot==='uniform').clip.includes('100% '+hem+'%'),'career clothes respect boots');
 }
}
console.log('34 held items × 10 hand materials × 2 sexes: native gesture coverage, two-hand support, hilt alignment, fixed weapon sizes, cuffs and unwear restoration passed. Visual quality is checked separately.');
