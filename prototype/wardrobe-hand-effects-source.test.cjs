// Decode original alpha and check semantic visibility; never modifies art.
const assert=require('node:assert/strict'),path=require('node:path');
const sharp=require(process.env.SHARP_MODULE||'sharp');
const {wearableSpecification}=require('./wardrobe.js'),{profiles,plan}=require('./wardrobe-hand-effects.js');
const {WEAPON_POSE_KINDS}=require('./wardrobe-weapon-poses.js');
const project=(art,p)=>{const w=Math.min(1,1.5*art.width/art.height),h=Math.min(1,art.height/(1.5*art.width));return [((1-w)/2+p[0]*w)*100,((1-h)/2+p[1]*h)*100];};
function inside(point,polygon){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if(((a[1]>point[1])!==(b[1]>point[1]))&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
(async()=>{
 const cache=new Map(),checked=new Set();let anchors=0;
 for(const sex of ['male','female'])for(const hands of Object.keys(profiles))for(const weapon of [null,...Object.keys(WEAPON_POSE_KINDS)])for(const {spec}of plan(wearableSpecification(sex,{hands,weapon}))){
  if(!cache.has(spec.src))cache.set(spec.src,await sharp(path.join(__dirname,spec.src)).ensureAlpha().raw().toBuffer({resolveWithObject:true}));
  const {data,info}=cache.get(spec.src);
  for(const p of spec.handFx){
   const x=Math.round(p[0]*(info.width-1)),y=Math.round(p[1]*(info.height-1)),alpha=data[(y*info.width+x)*4+3];
   assert.ok(alpha>25,spec.src+' emitter on transparent empty space '+p+' alpha='+alpha);
   if(spec.clip?.startsWith('polygon(')){
    const polygon=spec.clip.slice(8,-1).split(',').map(pair=>pair.trim().split(/\s+/).map(parseFloat));
    assert.ok(inside(project(spec.art,p),polygon),sex+'/'+hands+'/'+weapon+'/'+spec.key+' emitter is clipped off '+p);
   }
   const key=spec.src+'|'+p;if(!checked.has(key)){checked.add(key);anchors++;}
  }
 }
 console.log('Hand light source audit: '+anchors+' distinct anchors are on nontransparent source pixels and remain inside every actual pose/cuff clipping region.');
})().catch(e=>{console.error(e);process.exitCode=1;});
