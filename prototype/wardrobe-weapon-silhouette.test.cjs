// Optional Sharp check: actual opaque weapon silhouette, not its rectangular
// transparent padding. It catches tips clipped only with a particular glove.
const assert=require('node:assert/strict');
const sharp=require(process.env.SHARP_MODULE||'sharp');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {WEAPON_POSE_IDS}=require('./wardrobe-weapon-poses.js');
const {wearableSpecification,wearableTransformPoint}=require('./wardrobe.js');
const gloves=Object.keys(require('./wardrobe-weapon-art.js').low);
const {profiles}=require('./wardrobe-weapon-effects.js');
(async()=>{
 let cases=0,emitters=0;
 for(const id of Object.values(WEAPON_POSE_IDS).flat()){
  const {data,info}=await sharp(require('node:path').join(__dirname,WEARABLE_GRIPS[id].source)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const points=[];
  for(let y=0;y<info.height;y+=4)for(let x=0;x<info.width;x+=4)if(data[(y*info.width+x)*4+3]>180)points.push([x/info.width,y/info.height]);
  const profile=profiles[id];
  if(profile)for(const [x,y]of profile.traces.flatMap(t=>t.points).concat(profile.cores.map(c=>c.slice(0,2)))){
   const alpha=data[(Math.round(y*info.height)*info.width+Math.round(x*info.width))*4+3];
   assert.ok(alpha>=25,id+' emitter floats outside native weapon at '+[x,y]);emitters++;
  }
  for(const sex of ['male','female'])for(const glove of gloves){
   const spec=wearableSpecification(sex,{weapon:id,...(glove==='bare'?{}:{hands:glove})}).find(s=>s.slot==='weapon');
   const box=[Infinity,Infinity,-Infinity,-Infinity];
   for(const p of points){const q=wearableTransformPoint(spec,p);box[0]=Math.min(box[0],q[0]);box[1]=Math.min(box[1],q[1]);box[2]=Math.max(box[2],q[0]);box[3]=Math.max(box[3],q[1]);}
   assert.ok(box[0]>=1&&box[1]>=1&&box[2]<=99&&box[3]<=99,id+'/'+sex+'/'+glove+' silhouette clips the portrait: '+JSON.stringify(box));cases++;
  }
 }
 console.log('Actual weapon pixels: '+cases+' weapon/sex/glove silhouettes stay inside the portrait; '+emitters+' light anchors stay on the native source. This is not a gesture-quality approval.');
})().catch(error=>{console.error(error);process.exitCode=1;});
