// Admit production assets, not draft files. Pixel checks never substitute for
// the whole-suit human review recorded in docs/wardrobe-fit-qa.md.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const pixels=process.argv.includes('--pixels');
const sharp=pixels?require(process.env.SHARP_MODULE||'sharp'):null;
const {inspectRgba}=require('./wardrobe-alpha-audit.cjs'),{WEARABLE_FIT_V2:fit}=require('./wardrobe-fit.js');
const {wearableSpecification,wearableTransformPoint}=require('./wardrobe.js'),{wardrobeEffectsPlan,WARDROBE_FX_BUDGET}=require('./wardrobe-fx.js');
const {simulation}=require('./combat-balance.cjs'),{ITEMS,EQUIPMENT_SERIES_PATHS}=simulation().a;
const families=['body','legs','feet','back'],files=new Map(),hashes=new Set();
(async()=>{
 for(const family of families)for(const branch of ['specialist','general']){
  const ids=EQUIPMENT_SERIES_PATHS[family+'_'+branch].items.slice(-5);
  for(const [index,id]of ids.entries())for(const sex of ['male','female']){
   const specs=wearableSpecification(sex,{[family]:id}),parts=specs.filter(s=>s.slot===family&&s.art);
   assert.ok(parts.length,id+' mounted parts');
   for(const part of parts){
    const modern=part.src.includes('/wearables-v12/');assert.equal(modern,index>=2,id+' has a deliberate tier transition');
    if(!modern)continue;
    files.set(part.src,part.art);
    if(family==='body'||family==='back')assert.ok(Math.abs(part.sx-part.sy)<1e-5,id+' cannot stretch the new garment/wing');
   }
   if(index<2)continue;
   const effects=wardrobeEffectsPlan({equipment:{[family]:id},specs});assert.ok(effects.length,id+' source-anchored energy');
   for(const e of effects){
    const part=specs.find(s=>s.key===e.specKey),p=wearableTransformPoint(part,e.sourcePoint);
    p.forEach((v,k)=>assert.ok(Math.abs(v-e.point[k])<1e-7,id+' marker follows actual '+sex+' image transform'));
    if(family==='back')assert.equal(e.z,0,'wings and their energy remain behind the body');
   }
  }
 }
 assert.equal(files.size,30,'12 independent male/female chest plates + 6 full pants + 6 paired boots + 6 wings');
 for(const[src,art]of files){
  const file=path.join(__dirname,src),buffer=fs.readFileSync(file),digest=createHash('sha256').update(buffer).digest('hex');
  assert.ok(!hashes.has(digest),src+' must not reuse another garment');hashes.add(digest);
  if(!pixels)continue;
  const {data,info}=await sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual([info.width,info.height],[art.width,art.height],src+' measured dimensions');
  const report=inspectRgba(data,info.width,info.height);assert.ok(report.passed,src+': '+report.failures.join('; '));
  let polluted=0;
  for(let i=0;i<data.length;i+=4)if(data[i+3]>220&&data[i]>190&&data[i+1]<65&&data[i+2]>190)polluted++;
  assert.ok(polluted<20,src+' cannot retain opaque magenta key pixels');
  if(art.neckSample){const[x,y]=art.neckSample;assert.equal(data[(Math.floor(y*info.height)*info.width+Math.floor(x*info.width))*4+3],0,src+' has an actual empty neck opening');}
 }
 for(const sex of ['male','female'])for(const branch of ['specialist','general'])for(let stage=3;stage<=5;stage++){
  const equipment=Object.fromEntries(Object.entries(EQUIPMENT_SERIES_PATHS).filter(([k])=>k.endsWith('_'+branch)&&!/^blade_|^firearm_/.test(k)).map(([,route])=>{const id=route.items.slice(-5)[stage-1];return[ITEMS[id].slot,id];}));
  const specs=wearableSpecification(sex,equipment);
  for(const quality of ['high','low','off'])assert.ok(wardrobeEffectsPlan({equipment,specs,quality}).reduce((sum,e)=>sum+e.count,0)<=WARDROBE_FX_BUDGET[quality]);
 }
 console.log('Style v12: 30 distinct assets'+(pixels?', decoded RGBA/neck/size checks':' (pixel admission requires --pixels)')+', 24 later items on both bodies, deliberate early/late progression, source-anchored effects and full-suit budgets passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
