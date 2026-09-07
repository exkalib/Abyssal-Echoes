/* Weapon pose skeletons, not a visual-fit approval. Coordinates are percentages
 * of the existing 2:3 portrait: X spans 100 physical units, Y spans 150.
 * Screen-left is the survivor's right/main hand. No torso/shoulder transform is
 * emitted. Elbows stay fixed; authored hand/weapon/sleeve art must supply depth,
 * finger overlap and foreshortening. Wrist targets below are tuning baselines.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.WEARABLE_WEAPON_POSES=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const WEAPON_POSE_IDS=Object.freeze({
    tool:Object.freeze(['crowbar']),
    shortblade:Object.freeze(['knife','phaseBlade']),
    longblade:Object.freeze(['blade','eblade','sever','plasmaSaber','voidBlade',
      'blade_general_1','blade_general_2','blade_general_3','blade_general_4','blade_general_5']),
    sidearm:Object.freeze(['pistol','firearm_general_1','firearm_general_2','firearm_general_3','firearm_general_4','firearm_general_5']),
    longgun:Object.freeze(['rifle','plasmaRifle','swarmRifle','vacuumCarbine','gravLance'])
  });
  const WEAPON_POSE_KINDS=Object.freeze(Object.fromEntries(Object.entries(WEAPON_POSE_IDS).flatMap(([kind,ids])=>ids.map(id=>[id,kind]))));
  const ARM_ANCHORS={
    male:{left:{elbow:[30,33.2],wrist:[26.1,46]},right:{elbow:[70,33.2],wrist:[73.9,46]}},
    female:{left:{elbow:[32,32.3],wrist:[26.5,44]},right:{elbow:[68,32.3],wrist:[73.5,44]}}
  };
  // Rifle support is a separate hand at the fore-end, not a mirrored trigger
  // hand. These targets do not determine the weapon's size from finger spacing.
  const WRIST_TARGETS={
    male:{tool:{left:[25,45.8]},shortblade:{left:[24.7,45.6]},longblade:{left:[30.4,45.8]},
      sidearm:{left:[23.5,22.5]},longgun:{left:[41.8,37.3],right:[61.5,44.9]}},
    female:{tool:{left:[25.2,43.8]},shortblade:{left:[25.1,43.6]},longblade:{left:[30.7,43.8]},
      sidearm:{left:[24.2,21.4]},longgun:{left:[41.4,35.9],right:[61.8,43.3]}}
  };
  function weaponPoseKind(id){return Object.prototype.hasOwnProperty.call(WEAPON_POSE_KINDS,id)?WEAPON_POSE_KINDS[id]:null;}
  function point(value){return Array.isArray(value)&&value.length===2&&value.every(Number.isFinite);}
  function armTransform(fromElbow,fromWrist,toElbow,toWrist){
    if(![fromElbow,fromWrist,toElbow,toWrist].every(point))throw new TypeError('Arm anchors must be finite [x, y] points');
    const a=[fromWrist[0]-fromElbow[0],(fromWrist[1]-fromElbow[1])*1.5];
    const b=[toWrist[0]-toElbow[0],(toWrist[1]-toElbow[1])*1.5];
    const fromLength=Math.hypot(...a),toLength=Math.hypot(...b);
    if(fromLength<1e-8||toLength<1e-8)throw new RangeError('Arm segments must have positive length');
    const scale=toLength/fromLength,r=Math.atan2(b[1],b[0])-Math.atan2(a[1],a[0]);
    const c=Math.cos(r)*scale,s=Math.sin(r)*scale,matrix=[c,s,-s,c];
    // x/y and matrix match wearableTransformPoint's existing portrait-plane
    // convention. CSS matrix acts on physical pixels; translate uses percents.
    return {matrix,x:toElbow[0]-c*fromElbow[0]+s*fromElbow[1]*1.5,
      y:toElbow[1]-s*fromElbow[0]/1.5-c*fromElbow[1],rotation:r*180/Math.PI,scale};
  }
  function transformPosePoint(transform,p){
    const [a,b,c,d]=transform.matrix;
    return [transform.x+a*p[0]+c*p[1]*1.5,transform.y+b*p[0]/1.5+d*p[1]];
  }
  function forearmTransform(gender,side,targetWrist){
    const sex=gender==='female'?'female':'male',arm=ARM_ANCHORS[sex][side];
    if(!arm)throw new RangeError('Arm side must be left or right');
    return armTransform(arm.elbow,arm.wrist,arm.elbow,targetWrist||arm.wrist);
  }
  function weaponPoseRig(gender,id){
    const kind=weaponPoseKind(id);if(!kind)return null;
    const sex=gender==='female'?'female':'male',targets=WRIST_TARGETS[sex][kind],arms={},hands=[];
    for(const side of ['left','right']){
      const source=ARM_ANCHORS[sex][side],wrist=(targets[side]||source.wrist).slice();
      const role=side==='left'?'main':kind==='longgun'?'support':'relaxed';
      arms[side]={side,role,occupied:role!=='relaxed',elbow:source.elbow.slice(),wrist,
        sourceElbow:source.elbow.slice(),sourceWrist:source.wrist.slice(),
        transform:forearmTransform(sex,side,wrist)};
      if(role!=='relaxed')hands.push({side,role,wrist:wrist.slice()});
    }
    return {id,kind,gender:sex,twoHanded:kind==='longgun',arms,hands};
  }
  return Object.freeze({WEAPON_POSE_IDS,WEAPON_POSE_KINDS,weaponPoseKind,weaponPoseRig,
    armTransform,forearmTransform,transformPosePoint});
});
