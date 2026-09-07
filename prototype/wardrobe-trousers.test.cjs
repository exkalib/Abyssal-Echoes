// Normal admission uses Node only. --pixels decodes every original source via
// the existing SHARP_MODULE convention; it never rewrites artwork.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {simulation}=require('./combat-balance.cjs');
const {wearableSpecification}=require('./wardrobe.js');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {ITEMS}=simulation().a;
const ids=Object.entries(ITEMS).filter(([,item])=>item.type==='equip'&&item.slot==='legs').map(([id])=>id);
function sourcePixels(art,[x,y]){
 const scale=Math.min(512/art.width,768/art.height);
 return [(512-art.width*scale)/2+x*art.width*scale,(768-art.height*scale)/2+y*art.height*scale];
}
function projected(spec,point){
 const [x,y]=sourcePixels(spec.art,point),[a,b,c,d]=spec.matrix;
 return [a*x+c*y+spec.x*5.12,b*x+d*y+spec.y*7.68];
}
function polygon(spec){
 assert.match(spec.clip,/^polygon\(/,spec.key+' needs a real explicit clip');
 return spec.clip.slice(8,-1).split(',').map(pair=>pair.trim().split(/\s+/).map(Number.parseFloat));
}
function inside(poly,[x,y]){
 let result=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const [a,b]=poly[i],[c,d]=poly[j];
  if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)result=!result;
 }
 return result;
}
const normalized=(art,p)=>[p[0]/art.width,p[1]/art.height];
const plane=(art,p)=>sourcePixels(art,normalized(art,p)).map((v,i)=>v/(i?7.68:5.12));
function rimY(rim,x){
 for(let i=1;i<rim.length;i++)if(x>=rim[i-1][0]&&x<=rim[i][0]){
  const [a,b]=rim[i-1],[c,d]=rim[i];return b+(d-b)*(x-a)/(c-a);
 }
 throw Error('Waist point is outside the annotated front opening');
}
function landmarks(art){
 return {waist:art.waist,waistLeft:[(art.waist[0]+art.rim[0][0])/2,art.waist[1]+2],
  waistRight:[(art.waist[0]+art.rim.at(-1)[0])/2,art.waist[1]+2],crotch:art.crotch,
  leftKnee:art.knees[0],rightKnee:art.knees[1],leftAnkle:art.ankles[0],rightAnkle:art.ankles[1]};
}
function sourceContract(){
 assert.equal(ids.length,11,'all real trousers must be admitted');
 for(const id of ids){
  const art=WEARABLE_FIT_V2[id]?.trousers;assert.ok(art,id+' needs ONE complete trouser image, not the old two tubes');
  for(const [name,p]of Object.entries(landmarks(art)))assert.ok(p.length===2&&p.every((n,i)=>Number.isFinite(n)&&n>0&&n<(i?art.height:art.width)),id+' actual '+name+' source coordinates');
  assert.ok(art.rim.length>=5&&art.rim.every((p,i)=>!i||p[0]>art.rim[i-1][0]),id+' front waistband contour needs ordered independent samples');
  assert.ok(art.waist[1]>=rimY(art.rim,art.waist[0])-1,id+' waist anchor must not be in the rear lining');
  assert.ok(art.waist[1]<art.crotch[1]&&art.crotch[1]<art.kneeBand[0]&&art.kneeBand[0]<Math.min(...art.knees.map(p=>p[1]))&&art.kneeBand[1]>Math.max(...art.knees.map(p=>p[1]))&&art.kneeBand[1]<Math.min(...art.ankles.map(p=>p[1])),id+' real waist/crotch/knee/ankle ordering');
  assert.ok(art.knees[0][0]<art.knees[1][0]&&art.ankles[0][0]<art.ankles[1][0],id+' left and right legs are not swapped');
  for(const sex of ['male','female']){
   const parts=wearableSpecification(sex,{legs:id}).filter(s=>s.slot==='legs');
   assert.ok(parts.length>=2,id+' front clothing and rear lining are mounted');
   assert.equal(new Set(parts.map(s=>s.src)).size,1,id+' may not assemble a separate waist patch and greave sources');
   const src=fs.readFileSync(path.join(__dirname,parts[0].src));
   assert.equal(src.toString('ascii',0,4),'RIFF');assert.equal(src.toString('ascii',8,12),'WEBP');
   assert.ok((src.toString('ascii',12,16)==='VP8X'&&(src[20]&16))||src.includes(Buffer.from('ALPH'))||(src.toString('ascii',12,16)==='VP8L'&&(src[24]&16)),id+' encoded source must actually carry alpha; RGB is not admitted');
   const fronts=parts.filter(s=>s.z>1),rear=parts.filter(s=>s.z<1);
   assert.ok(fronts.length&&rear.length,id+' has both depth roles');
   for(const p of Object.values(landmarks(art)).slice(0,3))assert.ok(fronts.some(s=>inside(polygon(s),plane(art,[p[0],p[1]+1]))),id+' '+sex+' front waist anchor was clipped into rear lining');
   for(let sample=1;sample<art.rim.length-1;sample++){
    const [x,y]=art.rim[sample],above=plane(art,[x,y-2]),below=plane(art,[x,y+2]);
    assert.ok(!fronts.some(s=>inside(polygon(s),above))&&rear.some(s=>inside(polygon(s),above)),id+' rear waistband is never drawn over the abdomen');
    assert.ok(fronts.some(s=>inside(polygon(s),below)),id+' real front waistband survives its depth split');
   }
  }
 }
 console.log('Complete trousers: all 11 sources, anatomical markers, front-waist preservation, source ownership and encoded alpha passed.');
}
async function pixelContract(){
 const sharp=require(process.env.SHARP_MODULE||'sharp'),{inspectRgba}=require('./wardrobe-alpha-audit.cjs');
 const records=[];
 for(const id of ids){
  const art=WEARABLE_FIT_V2[id].trousers,file=path.join(__dirname,'assets/wearables-v1',art.file+'.webp');
  const metadata=await sharp(file).metadata(),{data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(metadata.hasAlpha,true,id+' source has true alpha');assert.equal(info.width,art.width);assert.equal(info.height,art.height);
  const alpha=inspectRgba(data,info.width,info.height);assert.equal(alpha.passed,true,id+' '+alpha.failures.join('; '));
  const points=Object.entries(landmarks(art)),pixel=([x,y])=>Math.floor(y)*info.width+Math.floor(x),targets=points.map(([,p])=>pixel(p));
  targets.forEach((p,i)=>assert.ok(data[p*4+3]>=180,id+' '+points[i][0]+' is on actual opaque cloth/armor, not a guessed empty coordinate'));
  const seen=new Uint8Array(info.width*info.height),queue=new Uint32Array(seen.length);let head=0,tail=1;queue[0]=targets[0];seen[targets[0]]=1;
  while(head<tail){const p=queue[head++],x=p%info.width,y=Math.floor(p/info.width);
   for(const q of [x?p-1:-1,x+1<info.width?p+1:-1,y?p-info.width:-1,y+1<info.height?p+info.width:-1])if(q>=0&&!seen[q]&&data[q*4+3]>=180){seen[q]=1;queue[tail++]=q;}
  }
  targets.forEach((p,i)=>assert.ok(seen[p],id+' '+points[i][0]+' must connect through opaque cloth to the waist; disconnected tubes fail'));
  let edgePixels=0,magentaEdgePixels=0;
  for(let y=1;y<info.height-1;y++)for(let x=1;x<info.width-1;x++){
   const p=y*info.width+x,q=p*4;if(data[q+3]<32)continue;
   if([p-1,p+1,p-info.width,p+info.width].some(i=>data[i*4+3]<32)){
    edgePixels++;if(data[q]>150&&data[q+2]>150&&data[q+1]<90&&Math.min(data[q],data[q+2])-data[q+1]>65)magentaEdgePixels++;
   }
  }
  assert.equal(magentaEdgePixels,0,id+' has visible saturated magenta on its alpha edge');
  records.push({id,transparent:alpha.transparent,connectedPixels:tail,edgePixels,magentaEdgePixels});
 }
 console.log('Decoded RGBA: '+records.length+' complete sources have true empty background, connected waist/crotch/both legs and no saturated magenta alpha edges.');
 return records;
}
module.exports={ids,sourcePixels,projected,polygon,inside,normalized,plane,rimY,landmarks,sourceContract,pixelContract};
if(require.main===module){sourceContract();if(process.argv.includes('--pixels'))pixelContract().then(records=>console.log(JSON.stringify(records))).catch(error=>{console.error(error);process.exitCode=1;});else console.log('Pixel decode is not implied: run with --pixels and SHARP_MODULE for the full RGBA admission check.');}
