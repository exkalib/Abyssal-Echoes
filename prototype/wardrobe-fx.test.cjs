const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const fx=require('./wardrobe-fx.js'),rig=require('./wardrobe.js');
const source=fs.readFileSync(require.resolve('./game.js'),'utf8');
const items=vm.runInNewContext(source.slice(0,source.indexOf('function equipmentEquipStatus'))+';ITEMS');
const slots=['body','legs','feet','back','module','head','implant','offhand'];
const grades={salvage:0,forged:1,alloy:2,field:3,quantum:4,stellar:5};
let checks=0;
for(const[id,item]of Object.entries(items)){
 if(!slots.includes(item.slot))continue;
 const stage=item.equipmentStage??grades[item.grade];assert.deepEqual(fx.WARDROBE_FX_STAGE[id],{slot:item.slot,stage},id+' stage must match actual equipment data');
 for(const sex of ['male','female']){
  const equipment={[item.slot]:id},specs=rig.wearableSpecification(sex,equipment),before=JSON.stringify(specs);
  const plan=fx.wardrobeEffectsPlan({equipment,specs});assert.equal(JSON.stringify(specs),before,'FX planning is read-only');
  assert.equal(plan.length>0,stage>=3,id+' single-item effects follow its stage, not a full-suit gate');
  for(const effect of plan){
   assert.equal(effect.item,id);assert.equal(effect.stage,stage);assert.ok(effect.count>0&&effect.count<=4);
   const spec=specs.find(s=>s.key===effect.specKey),actual=rig.wearableTransformPoint(spec,effect.sourcePoint);
   actual.forEach((n,i)=>assert.ok(Math.abs(n-effect.point[i])<1e-8,id+' source marker must follow the real '+sex+' transform'));
   if(effect.kind==='wing'||effect.kind==='back-vent')assert.equal(effect.z,0,'back energy remains behind the person');
  }
  checks++;
 }
}
for(const sex of ['male','female']){
 const quantum={body:'body_general_4',legs:'legs_general_4',feet:'feet_general_4',back:'back_general_4'};
 const plan=fx.wardrobeEffectsPlan({equipment:quantum,specs:rig.wearableSpecification(sex,quantum)});
 assert.deepEqual([...new Set(plan.map(e=>e.slot))].sort(),Object.keys(quantum).sort());
 assert.ok(plan.every(e=>e.tone==='anomaly'),'quantum general suit knee lights must match its authored violet core, boots and wings');
}
const equipment={body:'body_general_5',legs:'legs_general_5',feet:'feet_general_5',back:'back_general_5',module:'module_general_5',head:'head_general_5',hands:'hands_general_5',implant:'implant_general_5',offhand:'citadelShield',weapon:'voidBlade'};
const specs=rig.wearableSpecification('female',equipment,'bulwark');
for(const quality of ['high','low','off']){
 const plan=fx.wardrobeEffectsPlan({equipment,specs,quality});
 assert.ok(plan.reduce((n,e)=>n+e.count,0)<=fx.WARDROBE_FX_BUDGET[quality]);
 assert.equal(plan.some(e=>['weapon','hands','cuff','grip'].includes(e.slot)),false,'separate weapon/hand renderers cannot be doubled');
 if(quality!=='off')assert.deepEqual([...new Set(plan.map(e=>e.slot))].sort(),slots.slice().sort(),'budget retains every equipped equipment class');else assert.equal(plan.length,0);
}
const body=specs.find(s=>s.slot==='body'),custom=[.43,.44];body.fxAnchors={core:custom};
assert.deepEqual(fx.wardrobeEffectsPlan({equipment,specs}).find(e=>e.kind==='core').sourcePoint,custom,'authored item-specific emission markers override bounds defaults');
assert.deepEqual(fx.wardrobeEffectsPlan({equipment:{body:'unknown'},specs}),[],'unknown art cannot borrow unrelated effects');
assert.deepEqual(fx.wardrobeEffectsPlan({equipment:{hands:'hands_general_5',weapon:'voidBlade'},specs}),[],'hands/cuff/grip and weapon effects belong exclusively to their dedicated renderers');
const js=fs.readFileSync(require.resolve('./wardrobe-fx.js'),'utf8'),css=fs.readFileSync(require.resolve('./wardrobe-fx.css'),'utf8');
assert.doesNotMatch(js,/requestAnimationFrame|setInterval|setTimeout|innerHTML/,'time belongs to CSS, no polling or resetting the portrait DOM');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/animation:none!important/);assert.match(css,/pointer-events:none/);
console.log('Wardrobe FX: '+checks+' single-item/sex plans, actual source transforms, eight classes, stage gates, bounded budgets, source override and separate weapon/hand ownership passed.');
