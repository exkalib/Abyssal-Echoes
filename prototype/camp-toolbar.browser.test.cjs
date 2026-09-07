const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
 for(const width of [360,390,1292]){
  const page=await browser.newPage({viewport:{width,height:874}});
  const url=process.env.RPG_TEST_URL||'http://127.0.0.1:4195/';
  await page.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(url)?r.abort():r.continue());
  await page.goto(url);
  await page.evaluate(()=>{prepareLocalGame();state=freshState();state.tutorial={version:1,complete:true,step:'done'};state.tab='act';state.player.location='camp';state.flags.mapUnlocked=true;CAMP_BUILDINGS.forEach(b=>state.meta.built[b.id]=true);document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');renderPanelTop();});
  const result=await page.evaluate(()=>{const bar=document.querySelector('.camp-facility-toolbar'),s=getComputedStyle(bar),before=bar.getBoundingClientRect().top,scroll=document.querySelector('.camp-home-scroll');scroll.scrollTop=200;return {background:s.backgroundColor,image:s.backgroundImage,stable:bar.getBoundingClientRect().top===before,scroll:scroll.scrollTop,centers:[...document.querySelectorAll('.camp-facility-filters>button')].map(b=>{const range=document.createRange();range.selectNodeContents(b);const t=range.getBoundingClientRect(),r=b.getBoundingClientRect();return {x:Math.abs((t.left+t.right-r.left-r.right)/2),y:Math.abs((t.top+t.bottom-r.top-r.bottom)/2)};})};});
  assert.equal(result.background,'rgba(0, 0, 0, 0)');assert.equal(result.image,'none');assert.ok(result.stable&&result.scroll>0);assert.equal(result.centers.length,4);for(const c of result.centers)assert.ok(c.x<1&&c.y<2,JSON.stringify(c));
  await page.getByRole('button',{name:'制造',exact:true}).click();assert.equal(await page.locator('[data-filter="craft"]').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'全部',exact:true}).click();
  await page.screenshot({path:'output/camp-toolbar-'+width+'.png'});await page.close();
 }
 console.log('Camp toolbar: transparent background, centered label bounds, fixed heading while list scrolls and working filters at 360/390/1292 passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
