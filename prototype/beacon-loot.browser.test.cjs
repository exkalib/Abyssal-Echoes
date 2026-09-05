// Isolated, disposable browser profiles only. Never reads a player's saved game.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const width of [360,390,520])for(const floor of [1,80]){
      const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
      page.on('pageerror',error=>{
        if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;
        errors.push(error.stack);
      });
      await page.goto(process.env.BEACON_TEST_URL||'http://127.0.0.1:4187/');
      await page.evaluate(floor=>{
        prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';
        Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});
        state.meta.built.beacon=true;state.meta.buildLevels.beacon=2;state.beaconMaxFloor=floor;state.inv.signalCell=10;
        state.campBuilding='beacon';state.campView='building';state.tab='act';render();
        document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');
        document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
      },floor);
      const catalog=page.locator('.beacon-loot-catalog');
      assert.equal(await catalog.getAttribute('open'),null,'默认折叠图鉴，主要挑战按钮先可见');
      await catalog.locator('summary').click();
      await catalog.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
      const preview=await page.evaluate(()=>({
        floor:state.beaconSelectedFloor,inv:JSON.stringify(state.inv),
        images:[...document.querySelectorAll('.beacon-loot-items img')].map(img=>({size:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,loaded:img.naturalWidth>0})),
        overflow:[document.documentElement,...document.querySelectorAll('.beacon-inline-picker,.beacon-loot-catalog,.beacon-loot-items')].some(node=>node.scrollWidth>node.clientWidth+1),
        text:document.querySelector('.beacon-loot-catalog').textContent,
      }));
      assert.equal(preview.floor,floor);assert.equal(preview.overflow,false);
      assert.ok(preview.images.length>15&&preview.images.every(img=>img.loaded&&img.size===24&&img.height===24),JSON.stringify(preview.images));
      assert.match(preview.text,/剧情道具、任务凭证和结局收藏不参与掉落/);
      if(floor===80){
        await page.evaluate(()=>{globalThis.beaconCatalogNode=document.querySelector('.beacon-loot-catalog');document.querySelector('.beacon-floor-scroll').scrollTop=92;});
        await page.waitForFunction(()=>state.beaconSelectedFloor===78);
        assert.ok(await page.evaluate(()=>document.querySelector('.beacon-loot-catalog')===beaconCatalogNode&&beaconCatalogNode.open),'切层保留图鉴 DOM 和展开状态');
        await page.evaluate(()=>document.querySelector('.beacon-floor-scroll').scrollTop=0);
        await page.waitForFunction(()=>state.beaconSelectedFloor===80);
      }
      assert.equal(await page.evaluate(()=>JSON.stringify(state.inv)),preview.inv,'展开或切层不得扣资源或重抽物品');
      if(process.env.BEACON_SCREENSHOT_DIR&&width===360&&floor===80){
        await catalog.locator('summary').scrollIntoViewIfNeeded();
        await page.screenshot({path:process.env.BEACON_SCREENSHOT_DIR+'/beacon-preview.png'});
      }
      await catalog.locator('summary').click();
      await page.locator('.beacon-challenge').click();
      const cost=await page.evaluate(()=>({cells:state.inv.signalCell,stamina:state.player.stamina}));
      assert.equal(cost.cells,9);
      const reward=await page.evaluate(()=>{
        const plotInv=Object.fromEntries([...BEACON_STORY_ITEMS].map(id=>[id,state.inv[id]||0]));
        state.combat.hp=0;winCombat();
        return {items:state.siteSheet.reward.items,inv:JSON.stringify(state.inv),plotPreserved:[...BEACON_STORY_ITEMS].every(id=>(state.inv[id]||0)===plotInv[id])};
      });
      assert.ok(reward.plotPreserved);assert.ok(reward.items.length>=(floor===80?22:8));
      const sheet=page.locator('.beacon-reward-sheet');
      await sheet.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
      const layout=await sheet.evaluate(node=>({
        overflow:node.scrollWidth>node.clientWidth+1,
        names:[...node.querySelectorAll('.beacon-reward-grid b')].map(b=>({wrap:getComputedStyle(b).whiteSpace,overflow:b.scrollWidth>b.clientWidth+1})),
        images:[...node.querySelectorAll('img')].every(img=>img.naturalWidth>0&&img.getBoundingClientRect().width<=36),
      }));
      assert.equal(layout.overflow,false);assert.ok(layout.images);assert.ok(layout.names.every(b=>b.wrap==='normal'&&!b.overflow));
      if(process.env.BEACON_SCREENSHOT_DIR&&width===360&&floor===80)await page.screenshot({path:process.env.BEACON_SCREENSHOT_DIR+'/beacon-reward.png'});
      await sheet.getByRole('button',{name:'收下全部奖励',exact:true}).click();
      assert.equal(await page.evaluate(()=>JSON.stringify(state.inv)),reward.inv,'收下按钮仅关闭面板，不能二次发奖');
      assert.equal(await page.locator('.beacon-reward-sheet').count(),0);assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log('Beacon browser: 1/80 floors at 360/390/520 px, artwork sizes, stable catalogue and reward settlement passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
