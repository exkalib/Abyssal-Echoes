// Synthetic progress in fresh contexts only. Never reads a player's browser/save.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.WARDROBE_FLOATING_OUTPUT||path.join(__dirname,'../output/floating-slots');
const viewports=[{width:360,height:640},{width:390,height:844},{width:412,height:915}];

(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 let views=0,mutations=0;
 try{
  for(const viewport of viewports){
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
   page.setDefaultTimeout(15000);
   page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message.includes('getTopURL')&&!error.stack.includes('http'))return;errors.push(error.stack);});
   await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4196/');
   await page.evaluate(()=>{
    prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;
    state.sound=false;state.music=false;state.tab='bag';state.bagView='equipment';state.bagSel='weapon';state.charView='overview';state.bagPortraitHidden=false;
    state.player.equip={weapon:'pistol',head:'head_general_5',body:'body_general_5',hands:'hands_general_5',implant:'implant_general_5',module:'module_general_5'};
    for(const[id,item]of Object.entries(ITEMS))if(item.type==='equip')state.inv[id]=2;
    document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');
    document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
   });
   const ready=()=>page.waitForSelector('.doll-art-host[data-art-state="ready"]');await ready();
   const geometry=()=>page.evaluate(()=>{
    const host=document.querySelector('.doll-wearable'),rect=host.getBoundingClientRect(),panel=document.querySelector('#panel');
    const specs=wearableSpecification(state.playerAppearance,P().equip,careerRecord('main')?.id);
    const parts=specs.filter(s=>['implant','module'].includes(s.slot)).map(spec=>{
     const img=host.querySelector('[data-wear-key="'+spec.key+'"]'),style=getComputedStyle(img),matrix=new DOMMatrix(style.transform);
     const origin=style.transformOrigin.split(' ').map(parseFloat),width=img.clientWidth,height=img.clientHeight;
     const scale=Math.min(width/img.naturalWidth,height/img.naturalHeight),drawW=img.naturalWidth*scale,drawH=img.naturalHeight*scale;
     const b=spec.art.bounds,corners=[[b[0],b[1]],[b[0]+b[2],b[1]],[b[0]+b[2],b[1]+b[3]],[b[0],b[1]+b[3]]];
     const points=corners.map(([x,y])=>{
      const p=new DOMPoint((width-drawW)/2+x*drawW-origin[0],(height-drawH)/2+y*drawH-origin[1]).matrixTransform(matrix);
      return [(p.x+origin[0])/rect.width*100,(p.y+origin[1])/rect.height*100];
     });
     const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
     return {slot:spec.slot,item:spec.item,loaded:img.complete&&img.naturalWidth>0,floating:spec.art.floating===true,
      left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys),pointer:style.pointerEvents,
      expected:corners.map(p=>wearableTransformPoint(spec,p)),actual:points};
    });
    return {parts,mounts:host.querySelectorAll('.wearable-dock,[data-slot="mount"]').length,
     horizontal:panel.scrollWidth>panel.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1,
     rigRatio:rect.width/rect.height};
   });
   function assertGeometry(result,label){
    assert.equal(result.mounts,0,'no dock frames '+label);assert.equal(result.horizontal,false,'no horizontal overflow '+label);
    assert.ok(Math.abs(result.rigRatio-2/3)<.002,'unchanged character proportions '+label);
    assert.equal(result.parts.length,2,'one floating image per equipped slot '+label);
    for(const p of result.parts){
     assert.ok(p.loaded&&p.floating,'decoded floating art '+label+' '+p.slot);
     assert.ok(Math.abs((p.left+p.right)/2-(p.slot==='implant'?23:77))<.08,'left implant / right module '+JSON.stringify(p));
     assert.ok(Math.abs((p.top+p.bottom)/2-8.5)<.08,'head-level alignment '+JSON.stringify(p));
     assert.ok(p.right-p.left<=18.08&&p.bottom-p.top<=9.58,'bounded original aspect art '+JSON.stringify(p));
     assert.ok(p.top>=0&&p.bottom<=18&&p.left>=0&&p.right<=100,'within head-side scene '+JSON.stringify(p));
     assert.ok(p.right<38||p.left>62,'central face exclusion '+JSON.stringify(p));
     assert.equal(p.pointer,'none','visual art cannot intercept equipment selection');
     p.actual.forEach((point,i)=>point.forEach((n,j)=>assert.ok(Math.abs(n-p.expected[i][j])<.08,'real CSS and calibrated source must agree')));
    }
   }
   for(const sex of ['male','female']){
    for(const tab of ['bag','char']){
     await page.evaluate(({sex,tab})=>{state.playerAppearance=sex;state.tab=tab;state.charView='overview';render();},{sex,tab});await ready();
     assertGeometry(await geometry(),viewport.width+' '+sex+' '+tab);
     for(const [slot,kind]of [['implant','chip'],['module','orbit']]){
      const node=page.locator('.doll-wearable [data-fx-kind="'+kind+'"]');await node.waitFor();
      assert.match(await node.getAttribute('data-wear-fx'),new RegExp('^'+slot+'_general_5:'));
      assert.equal(await node.evaluate(n=>getComputedStyle(n).pointerEvents),'none');
     }
     await page.screenshot({path:path.join(output,viewport.width+'-'+sex+'-'+tab+'.png')});views++;
    }
   }
   await page.evaluate(()=>{state.tab='bag';state.bagSel='weapon';render();});await ready();
   const change=async(slot,id)=>{
    const target=page.locator('.slotchip[data-slot="'+slot+'"]');
    const before=await target.boundingBox();assert.ok(before.width>=44&&before.height>=44,'original equipment target stays touch-sized');
    await target.tap();assert.equal(await page.evaluate(()=>state.bagSel),slot,'original slot button selects '+slot);
    const after=await target.boundingBox();assert.ok(Math.abs(after.x-before.x)<.5&&Math.abs(after.y-before.y)<.5,'no displaced selection target');
    const beforeSelection=await page.evaluate(()=>JSON.stringify(P().equip));
    const item=page.locator('.rpg-gear-grid button[data-item="'+id+'"]');await item.scrollIntoViewIfNeeded();await item.tap();
    assert.equal(await page.locator('.bag-thumb-sheet').count(),0,'selection does not require opening a drawer');
    assert.equal(await page.evaluate(()=>JSON.stringify(P().equip)),beforeSelection,'selection cannot accidentally wear/unwear');
    const total=await page.evaluate(id=>(state.inv[id]||0)+Object.values(P().equip).filter(x=>x===id).length,id);
    await page.locator('.bag-quick-action').tap();await ready();
    assert.equal(await page.evaluate(id=>(state.inv[id]||0)+Object.values(P().equip).filter(x=>x===id).length,id),total,'actual wear/unwear conserves '+id);
    assert.equal(await page.locator('.bag-thumb-sheet').count(),0,'quick action leaves the next equipment directly reachable');mutations++;
   };
   for(const slot of ['implant','module']){
    const high=slot+'_general_5',replacement=slot+'_specialist_5',early=slot==='implant'?'lsChip':'starterAssaultModule';
    await change(slot,high);assert.equal(await page.evaluate(slot=>P().equip[slot],slot),null);
    assert.equal(await page.locator('.doll-wearable img[data-slot="'+slot+'"],.doll-wearable [data-wear-fx^="'+high+':"]').count(),0,'unwear clears image and effect');
    await change(slot,early);assert.equal(await page.evaluate(slot=>P().equip[slot],slot),early);
    assert.equal(await page.locator('.doll-wearable [data-wear-fx^="'+early+':"]').count(),0,'early devices stay non-powered');
    await change(slot,replacement);assert.equal(await page.evaluate(slot=>P().equip[slot],slot),replacement);
    assert.equal(await page.locator('.doll-wearable img[data-slot="'+slot+'"]').count(),1,'replacement cannot accumulate old images');
    assert.equal(await page.locator('.doll-wearable img[data-item="'+early+'"]').count(),0);
    await page.locator('.doll-wearable [data-wear-fx^="'+replacement+':"]').waitFor();
    await change(slot,replacement);assert.equal(await page.locator('.doll-wearable img[data-slot="'+slot+'"],.doll-wearable [data-wear-fx^="'+replacement+':"]').count(),0);
   }
   // Deliberately overlap decode work; latest selection must win without a new
   // rig/base/list or stale effects from superseded requests.
   await page.evaluate(()=>{
    window.floatingRefs={rig:document.querySelector('.doll-wearable'),base:document.querySelector('[data-wear-key="base"]'),grid:document.querySelector('.rpg-gear-grid')};
    for(let i=0;i<12;i++)for(const slot of ['implant','module'])equip(slot,slot+'_general_'+(i%2?5:4),refreshBagPanel);
   });await ready();
   assertGeometry(await geometry(),viewport.width+' rapid replacement');
   assert.equal(await page.evaluate(()=>floatingRefs.rig===document.querySelector('.doll-wearable')&&floatingRefs.base===document.querySelector('[data-wear-key="base"]')&&floatingRefs.grid===document.querySelector('.rpg-gear-grid')),true,'rapid changes retain the existing scene');
   assert.equal(await page.locator('.doll-wearable [data-wear-fx^="implant_general_4:"],.doll-wearable [data-wear-fx^="module_general_4:"]').count(),0,'superseded emitters cannot survive');
   await page.evaluate(()=>{
    window.floatingStable=[...document.querySelectorAll('.doll-wearable img[data-slot="implant"],.doll-wearable img[data-slot="module"],.doll-wearable [data-fx-kind="chip"],.doll-wearable [data-fx-kind="orbit"]')].map(node=>({node,animations:node.getAnimations({subtree:true})}));
    for(let i=0;i<20;i++)refreshBagPanel();
   });await ready();
   assert.equal(await page.evaluate(()=>floatingStable.every(({node,animations})=>node.isConnected&&animations.every(a=>node.getAnimations({subtree:true}).includes(a)))),true,'unchanged refresh preserves nodes and running timelines');
   assert.deepEqual(errors,[]);await context.close();
  }
  console.log('Floating implant/module: '+views+' phone/identity/page views, '+mutations+' real UI wear/unwear/replacements, frame removal, head-side geometry, source transforms, local FX cleanup and stable rapid refresh passed. '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
