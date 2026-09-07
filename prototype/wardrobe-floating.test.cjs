const assert=require('node:assert/strict');
const fs=require('node:fs');
const {WEARABLE_FIT_V2:fits}=require('./wardrobe-fit.js');
const {wearableSpecification,wearableTransformPoint}=require('./wardrobe.js');
const {wardrobeEffectsPlan,WARDROBE_FX_STAGE}=require('./wardrobe-fx.js');
const entries=Object.entries(fits).filter(([,fit])=>['implant','module'].includes(fit.slot));
assert.equal(entries.filter(([,fit])=>fit.slot==='implant').length,11);
assert.equal(entries.filter(([,fit])=>fit.slot==='module').length,17);
for(const [id,fit]of entries)for(const sex of ['male','female']){
  const equipment={[fit.slot]:id},specs=wearableSpecification(sex,equipment),parts=specs.filter(s=>s.item===id);
  assert.equal(fit.mount,undefined,id+' must not retain an interface frame');
  assert.equal(specs.some(s=>s.mount||s.slot==='mount'),false);
  assert.equal(parts.length,1,id+' is one separate object');
  const spec=parts[0],art=spec.art,[x,y,w,h]=art.bounds;
  assert.equal(art.floating,true);
  const a=wearableTransformPoint(spec,[x,y]),b=wearableTransformPoint(spec,[x+w,y+h]);
  assert.ok(Math.abs((a[0]+b[0])/2-(fit.slot==='implant'?23:77))<1e-8,id+' correct side');
  assert.ok(Math.abs((a[1]+b[1])/2-8.5)<1e-8,id+' aligned with the head');
  assert.ok(a[1]>=3.75-1e-8&&b[1]<=13.25+1e-8,id+' above shoulder and torso');
  assert.ok(fit.slot==='implant'?b[0]<=32+1e-8:a[0]>=68-1e-8,id+' outside face and helmet');
  assert.ok(Math.abs((b[0]-a[0])/((b[1]-a[1])*1.5)-art.width*w/(art.height*h))<1e-8,id+' native aspect ratio');
  const fx=wardrobeEffectsPlan({equipment,specs});
  assert.equal(fx.length,WARDROBE_FX_STAGE[id].stage>=3?1:0,id+' keeps its stage-specific light');
  for(const effect of fx){assert.ok(effect.point[1]<14);assert.ok(fit.slot==='implant'?effect.point[0]<34:effect.point[0]>66);}
  assert.deepEqual(wardrobeEffectsPlan({equipment,specs,quality:'off'}),[]);
}
// The new upper-side exception must not admit a light on the face or allow
// ordinary torso emitters to float into the head region.
const equipment={module:'module_general_5'},specs=wearableSpecification('male',equipment),moduleSpec=specs.find(s=>s.slot==='module');
moduleSpec.x-=27;
assert.deepEqual(wardrobeEffectsPlan({equipment,specs}),[],'floating effect cannot cover central face');
const bodyEquipment={body:'nanoSuit'},bodySpecs=wearableSpecification('female',bodyEquipment),body=bodySpecs.find(s=>s.slot==='body');
const normal=wardrobeEffectsPlan({equipment:bodyEquipment,specs:bodySpecs}).find(e=>e.slot==='body');
body.y+=8.5-normal.point[1];
assert.deepEqual(wardrobeEffectsPlan({equipment:bodyEquipment,specs:bodySpecs}),[],'other body effects retain their head exclusion');
assert.doesNotMatch(fs.readFileSync(require.resolve('./wardrobe.js'),'utf8'),/wearable-dock|fit\.mount/);
assert.doesNotMatch(fs.readFileSync(require.resolve('./ui-system.css'),'utf8'),/\.wearable-dock/);
console.log('Floating accessories: 28 items × 2 identities, left/right head layout, original aspect, no frames, powered light and central face protection passed.');
