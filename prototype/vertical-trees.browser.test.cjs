// Disposable browser state only; never accesses the player's browser profile.
const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.RPG_TEST_URL||'http://127.0.0.1:4195/';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
 for(const width of [360,390,1292]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.setDefaultTimeout(10000);
  page.on('pageerror',e=>{if(e.message.includes('getTopURL')&&!e.stack?.includes('http'))return;errors.push(e.message);});
  await page.route('**/*',route=>/^https?:/.test(route.request().url())&&!route.request().url().startsWith(url)?route.abort():route.continue());
  await page.goto(url);await page.evaluate(()=>{prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};state.flags.mapUnlocked=true;state.sound=state.music=false;state.meta.built.research=true;state.player.location='camp';document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');});
  for(const kind of ['tech','gene']){
   await page.evaluate(kind=>{state.tab=kind==='tech'?'act':'char';state.charView=kind==='gene'?'genes':'overview';state.campBuilding=kind==='tech'?'research':null;state[kind+'Zoom']=null;state[kind+'Sel']=null;renderPanelTop();},kind);
   await page.waitForFunction(()=>{const vp=document.querySelector('.treevp'),cv=document.querySelector('.treecanvas');return vp&&cv&&Math.abs(vp.clientWidth-cv.getBoundingClientRect().width)<1;}).catch(async e=>{console.log(await page.evaluate(()=>({view:panelView(),panel:document.querySelector('#panel')?.innerHTML.slice(0,1000),zoom:state.techZoom})));throw e;});
   const geometry=await page.evaluate(kind=>{const L=kind==='tech'?treeLayout():GENE_TREE,items=kind==='tech'?Object.entries(TECHS).map(([id,v])=>({id,...v})):GENE_NODES;return {count:items.length,width:L.W,height:L.H,down:items.every(v=>(v.req||[]).every(r=>L.pos[v.id].y>L.pos[r].y+72)),noOverlap:items.every((v,i)=>items.slice(i+1).every(w=>{const a=L.pos[v.id],b=L.pos[w.id],cw=kind==='tech'?LAY.cardW:L.cardW;return a.x+cw<=b.x||b.x+cw<=a.x||a.y+72<=b.y||b.y+72<=a.y;})),paths:[...document.querySelectorAll('path.tedge')].every(p=>/^M[^HV]+ V/.test(p.getAttribute('d'))||/^M[^HV]+V/.test(p.getAttribute('d'))),top:document.querySelector('.tree-stage').getBoundingClientRect().top-document.querySelector('.treevp').getBoundingClientRect().top};},kind);
   assert.ok(geometry.down&&geometry.noOverlap&&geometry.paths,JSON.stringify({kind,width,geometry}));assert.equal(geometry.top,64);assert.ok(geometry.height>geometry.width);
   await page.evaluate(kind=>{window.treeRefs={vp:document.querySelector('.treevp'),canvas:document.querySelector('.treecanvas')};const z=state[kind+'Zoom'];if(kind==='tech')treeSetZoom(z*1.5);else geneTreeSetZoom(z*1.5);state[kind+'PanY']=-80;(kind==='tech'?treeApply:geneTreeApply)();window.treeBefore={z:state[kind+'Zoom'],x:state[kind+'PanX'],y:state[kind+'PanY']};const node=document.querySelector(kind==='tech'?'[data-tid]':'[data-gid]');node.click();},kind);
   assert.equal(await page.evaluate(kind=>treeRefs.vp===document.querySelector('.treevp')&&treeRefs.canvas===document.querySelector('.treecanvas')&&state[kind+'Zoom']===treeBefore.z&&state[kind+'PanX']===treeBefore.x&&state[kind+'PanY']===treeBefore.y,kind),true,'selection preserves zoom/pan and canvas');
   await page.getByRole('button',{name:kind==='tech'?'按整行宽度铺满科技树':'按整行宽度铺满基因树',exact:true}).click();
   await page.waitForFunction(()=>Math.abs(document.querySelector('.treevp').clientWidth-document.querySelector('.treecanvas').getBoundingClientRect().width)<1);
   await page.evaluate(kind=>{state[kind+'Sel']=null;(kind==='tech'?refreshTechSelection:refreshGeneSelection)();},kind);
   await page.screenshot({path:path.resolve('output/vertical-'+kind+'-'+width+'.png')});
   await page.setViewportSize({width:width+36,height:844});await page.waitForFunction(()=>Math.abs(document.querySelector('.treevp').clientWidth-document.querySelector('.treecanvas').getBoundingClientRect().width)<1);await page.setViewportSize({width,height:844});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Vertical trees: both graphs, all dependencies/card bounds, width-fit at 360/390/1292, downward lines, stable selection, reset and responsive resizing passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
