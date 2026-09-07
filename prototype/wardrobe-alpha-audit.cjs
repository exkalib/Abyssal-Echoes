// Read-only asset admission check. Decode pixels in memory; never rewrite art.
// SHARP_MODULE may point to an already-installed Sharp module, like PLAYWRIGHT_MODULE.
const path=require('node:path');
const ALPHA_RANGES=[[0,0],[1,63],[64,127],[128,223],[224,249],[250,254],[255,255]];
const groupedHistogram=histogram=>Object.fromEntries(ALPHA_RANGES.map(([min,max])=>[min===max?String(min):min+'-'+max,histogram.slice(min,max+1).reduce((total,count)=>total+count,0)]));

function inspectRgba(data,width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||data.length!==width*height*4)throw Error('Expected a complete 8-bit RGBA pixel buffer');
 let transparent=0,opaque=0,semitransparent=0,cornerPixels=0,transparentCornerPixels=0;
 const histogram=Array(256).fill(0),centerHistogram=Array(256).fill(0);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const alpha=data[(y*width+x)*4+3];
  histogram[alpha]++;
  if(x>=width*.3&&x<width*.7&&y>=height*.3&&y<height*.7)centerHistogram[alpha]++;
  if(alpha===0)transparent++;else if(alpha===255)opaque++;else semitransparent++;
  // Same 3% corner samples and acceptance thresholds as wardrobe.browser.test.cjs.
  if((x<width*.03||x>width*.97)&&(y<height*.03||y>height*.97)){
   cornerPixels++;if(alpha===0)transparentCornerPixels++;
  }
 }
 const pixels=width*height,transparentRatio=transparent/pixels,transparentCornerRatio=transparentCornerPixels/cornerPixels;
 const failures=[];
 if(transparent===0)failures.push('No fully transparent pixels; an alpha channel alone is insufficient');
 if(transparentRatio<=.05)failures.push('Fully transparent pixel ratio must exceed 5%');
 if(transparentCornerRatio<=.95)failures.push('Transparent corner ratio must exceed 95%');
 if(transparent===pixels)failures.push('The image is empty: every pixel is fully transparent');
 return {width,height,pixels,transparent,opaque,semitransparent,cornerPixels,transparentCornerPixels,transparentRatio,transparentCornerRatio,
  alphaHistogram:groupedHistogram(histogram),
  // A repeatable geometric sample, not an inferred hand/body mask or proof of visual quality.
  center40PercentBox:{normalizedBounds:[.3,.3,.4,.4],alphaHistogram:groupedHistogram(centerHistogram)},
  passed:failures.length===0,failures};
}

async function auditImage(input){
 const sharp=require(process.env.SHARP_MODULE||'sharp');
 const metadata=await sharp(input).metadata();
 const {data,info}=await sharp(input).toColourspace('srgb').ensureAlpha().raw({depth:'uchar'}).toBuffer({resolveWithObject:true});
 const report=inspectRgba(data,info.width,info.height);
 if(!metadata.hasAlpha){report.failures.unshift('Source image has no alpha channel');report.passed=false;}
 return {file:typeof input==='string'?path.resolve(input):'<memory>',format:metadata.format,sourceChannels:metadata.channels,sourceHasAlpha:!!metadata.hasAlpha,...report};
}

async function main(files){
 if(!files.length||files.some(file=>file.startsWith('-')))throw Error('Usage: node prototype/wardrobe-alpha-audit.cjs <image-file> [image-file ...]');
 const reports=[];
 for(const file of files){
  try{reports.push(await auditImage(file));}
  catch(error){reports.push({file:path.resolve(file),passed:false,failures:[error.message]});}
 }
 console.log(JSON.stringify(reports,null,2));
 if(reports.some(report=>!report.passed))process.exitCode=1;
}

if(require.main===module)main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={inspectRgba,auditImage};
