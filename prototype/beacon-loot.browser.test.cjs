// Isolated, disposable browser profiles only. Never reads a player's saved game.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const [width,height] of [[320,568],[360,640],[390,844],[412,915],[520,844]])for(const floor of [1,80,357]){
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true}),errors=[];
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
      await sheet.evaluate(node=>Promise.all([...node.getAnimations(),...node.parentElement.getAnimations()].map(animation=>animation.finished)));
      await sheet.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
      const layout=await sheet.evaluate(node=>({
        overflow:node.scrollWidth>node.clientWidth+1,
        outerScroll:node.scrollHeight>node.clientHeight+1,
        columns:getComputedStyle(node.querySelector('.beacon-reward-grid')).gridTemplateColumns.split(' ').length,
        vertical:[...node.querySelectorAll('.beacon-reward-grid>div')].every(card=>card.querySelector('b').getBoundingClientRect().top>=card.querySelector('img,svg').getBoundingClientRect().bottom),
        names:[...node.querySelectorAll('.beacon-reward-grid b')].map(b=>({wrap:getComputedStyle(b).whiteSpace,overflow:b.scrollWidth>b.clientWidth+1})),
        images:[...node.querySelectorAll('img')].every(img=>img.naturalWidth>0&&img.getBoundingClientRect().width<=36),
      }));
      assert.equal(layout.overflow,false);assert.ok(layout.images);assert.ok(layout.names.every(b=>b.wrap==='normal'&&!b.overflow));
      assert.equal(layout.outerScroll,false,'弹层本身不能滚动');assert.equal(layout.columns,4,'手机使用四列紧凑物品格');assert.ok(layout.vertical,'图标在上、名称在下');
      const button=sheet.getByRole('button',{name:'收下全部奖励',exact:true});
      const before=await button.boundingBox();
      assert.ok(before.height>=44&&before.y>=0&&before.y+before.height<=height,'按钮无需滚动即可完整显示');
      assert.ok(await button.evaluate(node=>{const r=node.getBoundingClientRect();return node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'按钮可直接点击且没有遮挡');
      const scrolled=await sheet.locator('.beacon-reward-grid').evaluate(grid=>{grid.scrollTop=grid.scrollHeight;return grid.scrollTop;});
      if(floor>=80)assert.ok(scrolled>0,'大量奖励只在物品格区域内部滚动');
      const after=await button.boundingBox();assert.ok(Math.abs(before.y-after.y)<1,'滚动奖励时按钮位置固定');
      await sheet.locator('.beacon-reward-grid').evaluate(grid=>{grid.scrollTop=0;});
      if(process.env.BEACON_SCREENSHOT_DIR&&width===360&&floor===80)await page.screenshot({path:process.env.BEACON_SCREENSHOT_DIR+'/beacon-reward.png'});
      if(process.env.BEACON_SCREENSHOT_DIR&&floor===357)await page.screenshot({path:process.env.BEACON_SCREENSHOT_DIR+'/beacon-'+width+'-357.png'});
      await sheet.getByRole('button',{name:'收下全部奖励',exact:true}).click();
      assert.equal(await page.evaluate(()=>JSON.stringify(state.inv)),reward.inv,'收下按钮仅关闭面板，不能二次发奖');
      assert.equal(await page.locator('.beacon-reward-sheet').count(),0);assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log('Beacon browser: 1/80/357 floors at 320/360/390/412/520 px, four-column icon tiles, internal scrolling, visible fixed button and reward settlement passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
