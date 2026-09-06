const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {WEARABLE_ART,wearableSpecification,wearableFitAudit,wearableTransformPoint}=require('./wardrobe.js');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {WEARABLE_HOLD_HANDS}=require('./wardrobe-hands.js');
const {WEARABLE_SWORD_HANDS}=require('./wardrobe-sword-hands.js');
const {WEARABLE_TRIGGER_HANDS}=require('./wardrobe-trigger-hands.js');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {assertWearableFitContacts}=require('./wardrobe-fit-contract.cjs');
assert.equal(wearableSpecification('male',{body:'knife'}).length,1,'invalid slot must not crash the portrait');
assert.equal(wearableSpecification('female',{weapon:'helmet'}).length,1,'invalid slot must not display unrelated equipment');
function assertAlpha(file){
 const data=fs.readFileSync(path.join(__dirname,file));
 assert.equal(data.toString('ascii',0,4),'RIFF',file+' is a WebP');
 assert.equal(data.toString('ascii',12,16),'VP8X',file+' carries extended alpha metadata');
 assert.ok(data[20]&16,file+' retains generated transparency');
}
for(const [id,art]of Object.entries(WEARABLE_GRIPS)){
 assert.equal(art.status,'ready',id+' cannot ship a holster or pending redraw');
 assert.equal(WEARABLE_ART[id].slot,['shield-handle','shield-brace'].includes(art.kind)?'offhand':'weapon',id+' has the correct held-item role');
 assertAlpha(art.source);
 for(const sex of ['male','female'])for(const hand of Object.keys(WEARABLE_HOLD_HANDS)){
  const equipment={[WEARABLE_ART[id].slot]:id,...(hand==='bare'?{}:{hands:hand})};
  const specs=wearableSpecification(sex,equipment);
  const fingers=specs.find(s=>s.slot==='grip'||s.integratedGrip),object=specs.find(s=>s.item===id&&s.slot===WEARABLE_ART[id].slot);
  assert.equal(fingers.handItem,hand,'equipped glove cannot fall back to bare fingers');
  const expectedPose=WEARABLE_ART[id].slot==='offhand'?'shield':['sidearm','longgun'].includes(art.kind)?'trigger':['staff','bar'].includes(art.kind)?'shaft':'sword';
  assert.equal(fingers.pose,expectedPose,id+' selects a weapon-specific grip');assert.ok(Math.abs(object.sx-object.sy)<1e-9,id+' cannot distort when held');
  const grip=wearableTransformPoint(fingers,fingers.gripPoint),handle=wearableTransformPoint(object,object.art.grip);
  assert.ok(Math.hypot(grip[0]-handle[0],grip[1]-handle[1])<1e-7,id+' meets the chosen fist, not a fixed arm offset');
  if(expectedPose==='trigger'){
   assert.ok(fingers.indexRest&&art.indexRest,id+' requires an actual upper index/frame rest, not the old lower trigger hook');
   assert.ok(fingers.indexRest[0]<fingers.gripPoint[0]&&fingers.indexRest[1]<fingers.gripPoint[1],'source index is above the three curled grip fingers');
   const fingertip=wearableTransformPoint(fingers,fingers.indexRest),frame=wearableTransformPoint(object,art.indexRest);
   assert.ok(Math.hypot(fingertip[0]-frame[0],fingertip[1]-frame[1])<1e-7,id+' frame must meet the independent resting index finger');
   assert.notDeepEqual(art.indexRest,art.trigger,'resting portraits must not put a lower finger in the trigger guard');
  }else if(expectedPose!=='shield'){
   assert.ok(fingers.handleAxis&&art.handleAxis,id+' needs a measured hilt axis through the fingers');
   const a=wearableTransformPoint(fingers,fingers.handleAxis),b=wearableTransformPoint(object,object.art.handleAxis);
   const x=[a[0]-grip[0],1.5*(a[1]-grip[1])],y=[b[0]-handle[0],1.5*(b[1]-handle[1])];
   assert.ok((x[0]*y[0]+x[1]*y[1])/(Math.hypot(...x)*Math.hypot(...y))>.999999,id+' handle must follow the authored finger cylinder');
  }
  if(hand!=='bare'&&expectedPose!=='shield'){
   const cuff=specs.filter(s=>s.slot==='cuff');
   assert.equal(cuff.length,1,'retain only the equipped arm cuff on the held side');
   assert.equal(cuff[0].item,hand);assert.equal(cuff[0].key,'cuff-left');assert.ok(cuff[0].clip.startsWith('polygon('));
   assert.equal(specs.filter(s=>s.slot==='hands').length,1,'opposite relaxed glove remains, held open palm is removed');
  }
  const nodes=specs.map(s=>({key:s.key,slot:s.slot,integratedGrip:s.integratedGrip,occupiedHilt:s.occupiedHilt,zIndex:s.z??1}));
  assertWearableFitContacts(wearableFitAudit(sex,equipment),{id,sex,slot:WEARABLE_ART[id].slot},nodes);
 }
}
for(const [id,fit]of Object.entries(WEARABLE_FIT_V2))if(fit.coversHands){
 assert.ok(WEARABLE_HOLD_HANDS[id],id+' needs its own closed-hand art');
}
for(const [id,art]of Object.entries(WEARABLE_HOLD_HANDS)){
 assertAlpha('assets/wearables-v1/'+art.file+'.webp');
 for(const sex of ['male','female']){
  assert.ok(art.fit[sex].size.every(n=>Number.isFinite(n)&&n>0),id+' has an independently calibrated '+sex+' fit');
  for(const side of ['left','right'])assert.ok(Number.isFinite(art.fit[sex].rotation[side]));
 }
 for(const catalog of [WEARABLE_SWORD_HANDS,WEARABLE_TRIGGER_HANDS]){
  const pose=catalog[id];assert.ok(pose,id+' needs a distinct sword and trigger-pull pose');
  assert.notEqual(pose.file,art.file,id+' cannot label the old generic fist as another gesture');
  assertAlpha('assets/wearables-v1/'+pose.file+'.webp');
 }
}
for(const sex of ['male','female']){
 for(const [id,art]of Object.entries(WEARABLE_GRIPS).filter(([,art])=>['blade','staff','bar'].includes(art.kind)))for(const glove of Object.keys(WEARABLE_SWORD_HANDS)){
  const sample=wearableSpecification(sex,{weapon:id,...(glove==='bare'?{}:{hands:glove})});
  const hand=sample.find(s=>s.slot==='grip'),weapon=sample.find(s=>s.slot==='weapon'),forearm=sample.find(s=>s.key==='forearm-base');
  assert.equal(hand.occupiedHilt,true,id+'/'+glove+' uses the new authored occupied hilt');
  assert.ok(hand.src.includes('grip-sword-v8-'+glove+'.webp'),'every glove has its own v8 artwork');
  assert.equal(sample.some(s=>s.integratedGrip),false,'never replace another weapon with the single blade sample');
  assert.equal(sample.filter(s=>s.slot==='grip').length,1,'one physically occupied grip only');
  assert.equal(weapon.src,art.source,'each item retains its own blade/guard/pommel');
  assert.ok(forearm&&forearm.rotation<0,'move the forearm with the new wrist');
  assert.equal(sample[0].src,'assets/wearables-v1/base-'+sex+'.webp','preserve original character identity');
  assert.ok(hand.contact.anchor[0]>29&&hand.contact.anchor[0]<34,'neutral grip is inward of the original hanging wrist');
  assert.ok(Math.abs(hand.sx-hand.sy)<1e-9,'no hand distortion');
  assert.equal(weapon.contact.occlusion,'occupied-hilt');
  assert.equal(weapon.contact.anatomy,'palm-handle-fingers');
  const a=WEARABLE_SWORD_HANDS[glove];
  const hem=a.wristCutContour[2][1];
  assert.ok(hem>a.grip[1]&&hem<1,'trim surplus hilt, not the whole authored fingers');
 }
 assert.ok(WEARABLE_GRIPS.blade.length>46,'keep a full-size long sword without enlarging the fist');
 const cuff=wearableSpecification(sex,{hands:'phaseGrip',weapon:'knife'});
 assert.equal(cuff.filter(s=>s.slot==='hands').length,2,'wrist-only cuffs stay mounted when fingers close');
 assert.equal(cuff.find(s=>s.slot==='grip').handItem,'bare');
 for(const career of ['bulwark','vanguard','infiltrator']){
  const layers=wearableSpecification(sex,{feet:'gravityBoots'},career),hem=WEARABLE_FIT_V2.gravityBoots.baseCutY[sex];
  assert.ok(layers.find(s=>s.slot==='uniform').clip.includes('100% '+hem+'%'),'career clothes stop before the equipped boot');
 }
}
console.log('All held items × all glove variants × both sexes: hilt axis, outside-guard index, retained cuffs, real alpha and proportional objects passed. Visual quality is checked separately in browser screenshots.');
