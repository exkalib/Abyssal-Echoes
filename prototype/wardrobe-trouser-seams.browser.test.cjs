// CSS clip antialiasing is not covered by contact-point geometry. Render the
// real mounted trouser nodes on a transparent plane and inspect actual pixels.
// Interior opaque source fabric must remain opaque through each fitted seam.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const sharp=require(process.env.SHARP_MODULE||'sharp');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const ids=Object.keys(WEARABLE_FIT_V2).filter(id=>WEARABLE_FIT_V2[id].trousers);
const careers=['','bulwark','vanguard','infiltrator'];
const out=process.env.TROUSER_SEAM_OUTPUT&&path.resolve(process.env.TROUSER_SEAM_OUTPUT);
if(out)fs.mkdirSync(out,{recursive:true});
async function run(){
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const failures=[],records=[];
 try{
  const page=await browser.newPage();
  await page.addInitScript(()=>{for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{get(){throw Error('No player storage in trouser seam regression');}});});
  await page.goto(new URL('wardrobe-preview.html',process.env.RPG_TEST_URL||'http://127.0.0.1:4191/').href);
  await page.waitForFunction(()=>typeof updateWearablePortrait==='function');
  await page.evaluate(()=>{document.body.replaceChildren(Object.assign(document.createElement('div'),{id:'seam-stage'}));document.body.className='';});
  await page.addStyleTag({content:'html,body{margin:0!important;padding:0!important;background:transparent!important;min-height:0!important}#seam-stage{position:absolute!important;left:0!important;top:0!important;max-width:none!important;min-width:0!important;margin:0!important;transform:none!important;background:transparent!important;overflow:visible!important;border:0!important;box-shadow:none!important}#seam-stage:before,#seam-stage:after{display:none!important}'});
  const selected=process.env.TROUSER_SEAM_IDS?process.env.TROUSER_SEAM_IDS.split(','):ids;
  const widths=process.env.TROUSER_SEAM_WIDTHS?process.env.TROUSER_SEAM_WIDTHS.split(',').map(Number):[240,360,512];
  for(const id of selected){
   const art=WEARABLE_FIT_V2[id].trousers,file=path.join(__dirname,'assets/wearables-v1',art.file+'.webp');
   const {data:source,info:src}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const sourceScale=Math.min(512/src.width,768/src.height),ox=(512-src.width*sourceScale)/2,oy=(768-src.height*sourceScale)/2;
   for(const sex of ['male','female'])for(const career of careers)for(const width of widths){
    await page.setViewportSize({width,height:width*1.5});
    const bands=await page.evaluate(async({id,sex,career,width})=>{
     const host=document.getElementById('seam-stage');host.style.width=width+'px';host.style.height=width*1.5+'px';
     await updateWearablePortrait(host,sex,{legs:id},career);
     // Remove only unrelated layers AFTER the real renderer has mounted them;
     // leave every actual trouser source, clip, matrix, style and ordering intact.
     for(const node of [...host.children])if(node.dataset.slot!=='legs')node.remove();
     await new Promise(resolve=>requestAnimationFrame(resolve));
     await Promise.all([...host.querySelectorAll('img')].map(img=>img.decode()));
     return wearableSpecification(sex,{legs:id},career).filter(s=>s.slot==='legs'&&s.z>1);
    },{id,sex,career,width});
    const png=await page.screenshot({omitBackground:true,animations:'disabled'});
    const {data:pixels,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let checked=0,minAlpha=255,bad=0;const examples=[];
    for(let seam=0;seam<3;seam++){
     const before=bands[seam],after=bands[seam+1],sourceY=[art.crotch[1],...art.kneeBand][seam];
     const seamY=((oy+sourceY*sourceScale)*before.sy+before.y*7.68)*width/512;
     for(let y=Math.max(0,Math.floor(seamY)-1);y<=Math.min(info.height-1,Math.ceil(seamY)+1);y++)for(let x=0;x<info.width;x++){
      const band=y+.5<seamY?before:after;
      const px=((x+.5)*512/width-band.x*5.12)/band.sx,py=((y+.5)*512/width-band.y*7.68)/band.sy;
      const rx=(px-ox)/sourceScale,ry=(py-oy)/sourceScale;
      // Reject silhouette / transparent material samples using the ORIGINAL
      // alpha footprint, not pixels of the possibly broken rendered result.
      const radius=Math.ceil(1.5/(sourceScale*width/512*Math.min(band.sx,band.sy)))+1;
      let opaque=rx-radius>=0&&ry-radius>=0&&rx+radius<src.width&&ry+radius<src.height;
      for(let yy=Math.floor(ry-radius);opaque&&yy<=Math.ceil(ry+radius);yy++)for(let xx=Math.floor(rx-radius);xx<=Math.ceil(rx+radius);xx++)if(source[(yy*src.width+xx)*4+3]!==255){opaque=false;break;}
      if(!opaque)continue;
      const alpha=pixels[(y*info.width+x)*4+3];checked++;minAlpha=Math.min(minAlpha,alpha);
      if(alpha<253){bad++;if(examples.length<4)examples.push({seam,x,y,alpha});}
     }
    }
    assert.ok(checked>=80,id+' each actual render must expose enough interior seam pixels to test');
    const record={id,sex,career,width,checked,minAlpha,bad,examples};records.push(record);
    if(bad){failures.push(record);if(out)await fs.promises.writeFile(path.join(out,[id,sex,career||'default',width].join('-')+'.png'),png);}
   }
  }
  if(out)await fs.promises.writeFile(path.join(out,'report.json'),JSON.stringify({records,failures},null,2)+'\n');
  assert.deepEqual(failures,[],'opaque original cloth must not become a dark transparent horizontal seam when CSS fitting bands meet');
  console.log('Real CSS trouser seam pixels: '+records.length+' renders, '+records.reduce((n,r)=>n+r.checked,0)+' independently opaque source samples stay opaque across pelvis/thigh/knee/shin joins.');
 }finally{await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
