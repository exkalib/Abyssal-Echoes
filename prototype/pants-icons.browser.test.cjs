// Synthetic fresh states in isolated browser contexts; never load a player's save.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {WEARABLE_FIT_V2}=require('./wardrobe-fit.js');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.PANTS_ICON_OUTPUT;

(async()=>{
 if(output)fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
   const page=await browser.newPage({viewport,isMobile:true,hasTouch:true}),errors=[];page.setDefaultTimeout(15000);
   page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
   await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
   const ids=await page.evaluate(()=>{
    prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.flags.braceletUnlocked=true;state.sound=false;state.music=false;
    state.tab='bag';state.bagView='equipment';state.bagSel='legs';state.player.equip={legs:'legs_general_2'};
    const ids=Object.keys(ITEMS).filter(id=>ITEMS[id].slot==='legs');for(const id of ids)state.inv[id]=2;
    document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');render();return ids;
   });
   const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();assert.equal(ids.length,11);
   const baseURI=await page.evaluate(()=>document.baseURI),sources=Object.fromEntries(ids.map(id=>{
    const art=WEARABLE_FIT_V2[id]?.trousers;assert.ok(art,id+' requires the actual complete-trouser fitting');
    assert.ok(fs.existsSync(path.resolve(__dirname,'assets/wearables-v1',art.file+'.webp')),id+' source exists');
    return [id,{url:new URL('assets/wearables-v1/'+art.file+'.webp',baseURI).href,width:art.width,height:art.height}];
   }));
   assert.equal(new Set(Object.values(sources).map(art=>art.url)).size,11,'each pair uses its own complete original, not a repeated icon');
   const noOverflow=async()=>assert.equal(await page.evaluate(()=>{const panel=document.querySelector('#panel');return document.documentElement.scrollWidth<=innerWidth+1&&panel.scrollWidth<=panel.clientWidth+1;}),true,'pants must not widen the page');
   const checkIcon=async(locator,id,maxSize)=>{
    await locator.evaluate(image=>image.decode());
    const icon=await locator.evaluate(image=>{const r=image.getBoundingClientRect(),p=image.parentElement.getBoundingClientRect();return {src:image.src,fit:getComputedStyle(image).objectFit,width:r.width,height:r.height,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,contained:r.left>=p.left-1&&r.right<=p.right+1&&r.top>=p.top-1&&r.bottom<=p.bottom+1};});
    const actualURL=new URL(icon.src);actualURL.search='';actualURL.hash='';
    assert.equal(actualURL.href,sources[id].url,id+' icon must use the same current full source as fit.trousers');
    assert.equal(icon.naturalWidth,sources[id].width,id+' actual source width');assert.equal(icon.naturalHeight,sources[id].height,id+' actual source height');
    assert.ok(icon.naturalHeight>icon.naturalWidth,'source is full waist-to-ankle trousers, not an icon alias');assert.equal(icon.fit,'contain');assert.equal(icon.contained,true);assert.ok(icon.width>0&&icon.width<=maxSize&&icon.height>0&&icon.height<=maxSize);
   };
   for(const id of ids)await checkIcon(page.locator('.rpg-gear-grid [data-item="'+id+'"] img.item-art'),id,40);
   await checkIcon(page.locator('.slotchip img.item-art[data-item="legs_general_2"]'),'legs_general_2',29);await noOverflow();
   if(output)await page.screenshot({path:path.join(output,'pants-icons-bag-'+viewport.width+'.png'),animations:'disabled'});
   for(const id of ids){
    await page.locator('.rpg-gear-grid button[data-item="'+id+'"]').tap();
    await checkIcon(page.locator('.bag-thumb-sheet .rpg-equipment-icon img.item-art'),id,72);
    await noOverflow();
    if(output&&id==='legs_general_2')await page.screenshot({path:path.join(output,'pants-icons-detail-'+viewport.width+'.png'),animations:'disabled'});
    await page.locator('.bag-detail-back').tap();
   }
   // The actual equip action updates the slot icon, then the real character entry
   // must use the same assembled pants as the backpack portrait.
   await page.locator('.rpg-gear-grid button[data-item="legs_general_5"]').tap();await page.locator('.rpg-equipment-action').tap();await ready();await page.locator('.bag-detail-back').tap();
   assert.equal(await page.evaluate(()=>P().equip.legs),'legs_general_5');await checkIcon(page.locator('.slotchip img.item-art[data-item="legs_general_5"]'),'legs_general_5',29);
   const portrait=()=>page.locator('.doll-art-host [data-slot="legs"]').evaluateAll(nodes=>nodes.map(node=>({key:node.dataset.wearKey,item:node.dataset.item,source:node.getAttribute('src'),transform:node.style.transform,clip:node.style.clipPath,z:node.style.zIndex})).sort((a,b)=>a.key.localeCompare(b.key)));
   const bag=await portrait();assert.ok(bag.length>0);
   for(const layer of bag){assert.equal(layer.item,'legs_general_5');const src=new URL(layer.source,baseURI);src.search='';src.hash='';assert.equal(src.href,sources.legs_general_5.url,'equipped portrait and every inventory/detail/slot icon share the same complete source');}
   await page.locator('#tabbar [data-tab="char"]').tap();await ready();assert.deepEqual(await portrait(),bag,'character and backpack must use identical pants layers');await noOverflow();
   if(output)await page.screenshot({path:path.join(output,'pants-icons-character-'+viewport.width+'.png'),animations:'disabled'});
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Pants icons: all 11 real assets in inventory/detail, bounded contain sizes, equip slot refresh and shared character/backpack layers passed at 360/390/412px.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
