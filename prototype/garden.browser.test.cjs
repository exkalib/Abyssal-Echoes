// Run against a local prototype server. Uses a fresh browser context, never a player's profile.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const width of [360,390,768])for(const level of [1,2,3]){
      const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
      page.on('pageerror',error=>{
        // Quark injects a host bridge into new pages even in headless mode.
        // Ignore only its missing bridge; all game-script exceptions still fail.
        if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;
        errors.push(error.stack);
      });
      await page.goto(process.env.GARDEN_TEST_URL||'http://127.0.0.1:4187/');
      await page.evaluate(level=>{
        prepareLocalGame();state=freshState();state.tutorial.complete=true;
        Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});
        state.meta.built.garden=true;state.meta.buildLevels.garden=level;
        state.meta.careers.life=[{id:'noviceGrower',level:1,xp:0}];
        Object.keys(ITEMS).forEach(id=>state.inv[id]=100);
        state.gardenPlots=[null,{crop:'blackwood',readyAt:state.time+6},{crop:'glow',readyAt:state.time-1},{crop:'crystal',readyAt:state.time+16}];
        state.campBuilding='garden';state.campView='building';state.tab='act';render();
        document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
      },level);
      assert.equal(await page.locator('.garden-bed').count(),level+1);
      assert.equal(await page.locator('.garden-bed.ready').count(),level>1?1:0);
      for(let index=0;index<[3,5,6][level-1];index++){
        await page.locator('.garden-crop').nth(index).click();
        await page.locator('.garden-detail img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
        const result=await page.evaluate(()=>({
          title:document.querySelector('.garden-detail .station-result b').textContent,
          selected:document.querySelector('.garden-crop.selected>b').textContent,
          images:[...document.querySelectorAll('.garden-detail .item-art')].map(img=>({id:img.dataset.item,width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,loaded:img.naturalWidth>0})),
          cropImages:[...document.querySelectorAll('.garden-crop-image')].map(img=>({width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,loaded:img.complete&&img.naturalWidth>0})),
          symbols:[...document.querySelectorAll('.garden-workbench use,.garden-detail use')].map(use=>!!document.querySelector(use.getAttribute('href'))),
          overflow:document.documentElement.scrollWidth>innerWidth,
        }));
        assert.equal(result.title,result.selected);
        assert.ok(result.images.every(img=>img.loaded&&img.width>0&&img.width<=36&&img.height<=36),JSON.stringify(result.images));
        assert.ok(result.cropImages.every(img=>img.loaded&&img.width>0&&img.width<=64&&img.height<=64),JSON.stringify(result.cropImages));
        assert.ok(result.symbols.every(Boolean),'all crop and skill symbols must exist');
        assert.equal(result.overflow,false);
      }
      await page.locator('.garden-bed-skill').nth(1).click();
      assert.match(await page.locator('.garden-bed-main').nth(1).innerText(),/剩余 4 小时/);
      if(level>1){await page.locator('.garden-bed-main').nth(2).click();
      assert.match(await page.locator('.garden-bed-main').nth(2).innerText(),/空培养槽/);}
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('Garden browser regression: six crops, three levels, three widths, growth skill and harvest passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
