const test=require('node:test'),assert=require('node:assert/strict');
const {inspectRgba,auditImage}=require('./wardrobe-alpha-audit.cjs');

test('real transparent pixels, antialiased edges and opaque pixels are counted separately',()=>{
 const data=Buffer.alloc(100*100*4);
 data[(50*100+50)*4+3]=255;data[(50*100+51)*4+3]=128;
 const report=inspectRgba(data,100,100);
 assert.equal(report.transparent,9998);assert.equal(report.opaque,1);assert.equal(report.semitransparent,1);
 assert.equal(report.transparentCornerRatio,1);assert.equal(report.passed,true);
 assert.equal(report.alphaHistogram['128-223'],1);assert.equal(report.center40PercentBox.alphaHistogram['255'],1);
});

test('an opaque RGBA checkerboard is rejected despite having four channels',()=>{
 const data=Buffer.alloc(100*100*4,255);
 for(let y=0;y<100;y++)for(let x=0;x<100;x++){
  const gray=(Math.floor(x/10)+Math.floor(y/10))%2?180:230,index=(y*100+x)*4;
  data[index]=data[index+1]=data[index+2]=gray;
 }
 // Deliberately fake-alpha RGBA, in memory only. The ordinary test suite has
 // no image-codec dependency; actual PNG/WebP admission is run separately.
 const report=inspectRgba(data,100,100);
 assert.equal(report.transparent,0);assert.equal(report.opaque,10000);
 assert.equal(report.passed,false);
});

test('empty images and opaque corner margins fail admission',()=>{
 assert.equal(inspectRgba(Buffer.alloc(100*100*4),100,100).passed,false);
 const data=Buffer.alloc(100*100*4);for(let x=0;x<100;x++)data[x*4+3]=255;
 const report=inspectRgba(data,100,100);
 assert.ok(report.transparentRatio>.05);assert.ok(report.transparentCornerRatio<=.95);assert.equal(report.passed,false);
});

test('actual native-transparent generation passes pixel admission',{skip:!process.env.WARDROBE_ALPHA_VALID},async()=>{
 const report=await auditImage(process.env.WARDROBE_ALPHA_VALID);
 assert.equal(report.sourceHasAlpha,true);assert.equal(report.passed,true,JSON.stringify(report));
});

test('actual RGB background generation fails pixel admission',{skip:!process.env.WARDROBE_ALPHA_REJECTED},async()=>{
 const report=await auditImage(process.env.WARDROBE_ALPHA_REJECTED);
 assert.equal(report.sourceHasAlpha,false);assert.equal(report.transparent,0);assert.equal(report.passed,false);
});
