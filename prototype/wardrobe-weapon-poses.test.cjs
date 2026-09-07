const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const poses=require('./wardrobe-weapon-poses.js');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {WEAPON_POSE_IDS,WEAPON_POSE_KINDS,weaponPoseKind,weaponPoseRig,armTransform,forearmTransform,transformPosePoint}=poses;
const near=(a,b,label)=>assert.ok(Math.hypot(a[0]-b[0],1.5*(a[1]-b[1]))<1e-8,label);
const expected=Object.entries(WEARABLE_GRIPS).filter(([,art])=>!art.kind.startsWith('shield')).map(([id])=>id).sort();
assert.equal(expected.length,24);
assert.deepEqual(Object.keys(WEAPON_POSE_KINDS).sort(),expected,'every runtime main weapon has an explicit pose');
const classified=Object.values(WEAPON_POSE_IDS).flat();
assert.equal(new Set(classified).size,24,'no weapon belongs to two poses');
assert.equal(weaponPoseKind('gravLance'),'longgun','energy-ammo inertia weapon needs two-hand support, not a sword grip');
assert.equal(weaponPoseKind('phaseBlade'),'shortblade');
assert.equal(weaponPoseKind('crowbar'),'tool');
for(const id of ['riotShield','unknown','toString',null,undefined]){
  assert.equal(weaponPoseKind(id),null);assert.equal(weaponPoseRig('male',id),null);
}
for(const sex of ['male','female'])for(const id of expected){
  const rig=weaponPoseRig(sex,id);
  assert.equal(rig.id,id);assert.equal(rig.gender,sex);
  assert.equal(rig.twoHanded,WEAPON_POSE_IDS.longgun.includes(id));
  assert.deepEqual(rig.hands.map(hand=>[hand.side,hand.role]),rig.twoHanded?[['left','main'],['right','support']]:[['left','main']]);
  for(const side of ['left','right']){
    const arm=rig.arms[side],t=arm.transform,[a,b,c,d]=t.matrix;
    assert.deepEqual(arm.elbow,arm.sourceElbow,'shoulder/body pose and original elbow remain fixed');
    near(transformPosePoint(t,arm.sourceElbow),arm.elbow,id+' '+sex+' elbow');
    near(transformPosePoint(t,arm.sourceWrist),arm.wrist,id+' '+sex+' wrist');
    assert.ok(Number.isFinite(t.rotation)&&t.scale>0);
    assert.ok(a*d-b*c>0,'never mirror an arm or swap the handedness');
    assert.ok(Math.abs(Math.hypot(a,b)-Math.hypot(c,d))<1e-10,'isotropic arm scaling only');
    assert.ok(Math.abs(a*c+b*d)<1e-10,'no shear posing');
    if(side==='right'&&!rig.twoHanded){
      assert.equal(arm.role,'relaxed');assert.equal(arm.occupied,false);assert.equal(t.scale,1);assert.equal(t.rotation,0);
      assert.deepEqual(arm.wrist,arm.sourceWrist,'single-hand weapon leaves the empty arm unchanged');
      near(transformPosePoint(t,[81,55]),[81,55],'unoccupied side uses identity transform');
    }
  }
  if(rig.kind==='sidearm')assert.ok(rig.arms.left.wrist[1]<rig.arms.left.elbow[1],'sidearm forearm bends up independently of low-held blades');
  if(rig.twoHanded){
    assert.notDeepEqual(rig.arms.right.wrist,rig.arms.right.sourceWrist,'support forearm is actually posed');
    assert.ok(rig.arms.right.wrist[0]>rig.arms.left.wrist[0],'support and main hand remain independently placed');
  }
  const baseline=weaponPoseRig(sex,id);rig.arms.left.wrist[0]=999;rig.hands[0].wrist[0]=999;
  assert.deepEqual(weaponPoseRig(sex,id),baseline,'consumers cannot mutate the source skeleton');
}
// General elbow-to-elbow mapping uses physical 100x150 coordinates. Here a
// 15-unit horizontal segment becomes a 15-unit vertical segment, without scale.
const quarterTurn=armTransform([10,20],[25,20],[40,50],[40,60]);
assert.ok(Math.abs(quarterTurn.scale-1)<1e-10);assert.ok(Math.abs(quarterTurn.rotation-90)<1e-10);
near(transformPosePoint(quarterTurn,[10,20]),[40,50],'translated elbow');
near(transformPosePoint(quarterTurn,[25,20]),[40,60],'rotated wrist');
assert.throws(()=>armTransform([0,0],[0,0],[0,0],[1,1]),RangeError);
assert.throws(()=>armTransform([0,0],[1,1],[0,0],[NaN,1]),TypeError);
assert.throws(()=>forearmTransform('male','centre'),RangeError);
assert.deepEqual(weaponPoseRig('unknown','knife'),weaponPoseRig('male','knife'),'gender fallback matches the current portrait renderer');
const browser={};vm.createContext(browser);vm.runInContext(fs.readFileSync(require.resolve('./wardrobe-weapon-poses.js'),'utf8'),browser);
assert.equal(browser.WEARABLE_WEAPON_POSES.weaponPoseKind('rifle'),'longgun','UMD browser export loads without CommonJS');
console.log('Weapon pose skeleton: all 24 IDs, both sexes, two-hand support, fixed elbows, isotropic non-mirrored transforms and browser/CommonJS exports passed. Artwork and on-body fit remain separate visual checks.');
