// Render one native contact sheet at a time. Hundreds of full-size PNGs decoded
// together can exhaust the browser's image budget despite valid source files.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
async function renderContactSheets(browser,indexPath,output,viewport={width:1320,height:1000}){
 const html=fs.readFileSync(indexPath,'utf8'),style=html.match(/<style>[\s\S]*?<\/style>/)?.[0]||'';
 const sheets=[...html.matchAll(/<section class="sheet[^\"]*"[^>]*>[\s\S]*?<\/section>/g)].map(match=>match[0]);
 assert.ok(sheets.length,'the generated atlas must contain contact sheets');fs.mkdirSync(output,{recursive:true});
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'wardrobe-sheet-capture-')),preview=path.join(temporary,'preview.html');
 try{
  for(const markup of sheets){
   const id=markup.match(/\bid="([^\"]+)"/)[1];assert.match(id,/^[a-zA-Z0-9_-]+$/);
   fs.writeFileSync(preview,'<!doctype html><html><meta charset="utf-8"><base href="'+pathToFileURL(indexPath).href+'">'+style+'<body>'+markup+'</body></html>');
   const page=await browser.newPage({viewport,deviceScaleFactor:1});
   try{
    await page.goto(pathToFileURL(preview).href);await page.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await page.locator('.sheet').screenshot({path:path.join(output,id+'.png'),animations:'disabled'});
   }finally{await page.close();}
  }
 }finally{if(fs.existsSync(preview))fs.unlinkSync(preview);fs.rmdirSync(temporary);}
 return sheets.length;
}
module.exports={renderContactSheets};
if(require.main===module)(async()=>{
 const [indexArg,outputArg,widthArg,heightArg]=process.argv.slice(2);assert.ok(indexArg&&outputArg,'usage: index.html sheets-directory [width] [height]');
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{const count=await renderContactSheets(browser,path.resolve(indexArg),path.resolve(outputArg),{width:Number(widthArg)||1320,height:Number(heightArg)||1000});console.log('Rendered '+count+' native sheets with a fresh page and bounded image set per sheet.');}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
