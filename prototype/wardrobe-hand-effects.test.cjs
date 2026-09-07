const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {profiles,plan,markup}=require('./wardrobe-hand-effects.js');
const {wearableSpecification,wearableTransformPoint}=require('./wardrobe.js');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {WEAPON_POSE_KINDS}=require('./wardrobe-weapon-poses.js');
const poseArt=require('./wardrobe-weapon-art.js');
const project=(art,p)=>{const w=Math.min(1,1.5*art.width/art.height),h=Math.min(1,art.height/(1.5*art.width));return [((1-w)/2+p[0]*w)*100,((1-h)/2+p[1]*h)*100];};
let combinations=0;
for(const sex of ['male','female'])for(const hands of Object.keys(profiles))for(const weapon of [null,...Object.keys(WEAPON_POSE_KINDS)]){
 const specs=wearableSpecification(sex,{hands,weapon}),effects=plan(specs);
 assert.equal(effects.length,hands==='phaseGrip'||!weapon?2:WEAPON_POSE_KINDS[weapon]==='longgun'?4:3,hands+'/'+weapon+' every occupied/relaxed side and cuff');
 const keys=new Set();
 for(const effect of effects){
  const {spec}=effect;assert.equal(effect.item,hands);assert.equal(keys.has(spec.key),false);keys.add(spec.key);
  assert.ok(fs.existsSync(path.join(__dirname,spec.src)),spec.src);
  for(const p of spec.handFx){const at=wearableTransformPoint(spec,p);assert.ok(at.every(Number.isFinite)&&at[0]>0&&at[0]<100&&at[1]>15&&at[1]<65,'source-anchored light remains on the actual arm');}
  const svg=markup(effect,p=>project(spec.art,p));assert.ok(svg.includes('hand-fx-core'));assert.ok(!/NaN|Infinity/.test(svg));assert.ok((svg.match(/class="hand-fx-particle"/g)||[]).length<=2);
 }
 if(hands==='phaseGrip'&&weapon){assert.ok(specs.filter(s=>s.slot==='hands').every(s=>!s.pose||s.pose==='relaxed'));assert.ok(specs.find(s=>s.key==='hands-0').z>=20,'bracer must not disappear behind the moved sleeve');}
 combinations++;
}
for(const hands of ['workGloves','servoGauntlet','hands_general_1','hands_general_2'])assert.deepEqual(plan(wearableSpecification('male',{hands,weapon:'rifle'})),[],'early unpowered equipment stays plain');
for(const id of Object.keys(profiles)){
 assert.ok(WEARABLE_FIT_V2[id].male.every(p=>p.file.startsWith('../hands-v12/')),'relaxed appearance cannot fall back to the old palette');
 if(id!=='phaseGrip')for(const family of ['low','primary','support'])assert.ok(poseArt[family][id].handFx.length,'all grips carry authored lights');
}
const entry=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');assert.ok(entry.indexOf('wardrobe-hand-effects.js')<entry.indexOf('<script src="wardrobe.js'));
for(const file of ['../android/app/build.gradle','../deploy/prepare_netlify_release.sh','../deploy/publish_android_update.sh','wardrobe-preview.html'])assert.ok(fs.readFileSync(path.join(__dirname,file),'utf8').includes('wardrobe-hand-effects.js'),file+' packages the renderer');
assert.ok(fs.readFileSync(path.join(__dirname,'../deploy/publish_android_update.sh'),'utf8').includes('weapon-poses-v11 hands-v12'));
assert.ok(!/requestAnimationFrame|setInterval|fetch\(/.test(fs.readFileSync(path.join(__dirname,'wardrobe-hand-effects.js'),'utf8')),'no per-frame JS or network work');
console.log('Suit-matched hand effects: '+combinations+' sex/glove/weapon combinations, both hands/cuffs, unpowered early tiers, bounded particles and packaging passed.');
