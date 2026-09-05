// Isolated shop fixtures only: no player profile, real save, or external service.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const [width,height] of [[360,640],[390,844],[412,915]]){
      const page=await browser.newPage({viewport:{width,height}}),errors=[];
      page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
      await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
      await page.evaluate(()=>{
        prepareLocalGame();state=freshState();state.tutorial={complete:true,step:'done',version:1};state.flags.braceletUnlocked=true;state.player.location='setHub';state.inv.crystal=1000;state.settlementShopOpen=true;state.tab='act';
        document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');render();
        window.shopRefs=Object.fromEntries(['.settlement-shop-screen','.recipe-station-top','.station-product-grid','.shop-trade-detail','.station-detail-body','.station-confirm','.station-quantity','.shop-route-fold','.shop-item-notes'].map(selector=>[selector,document.querySelector(selector)]));
      });
      const stable=async()=>assert.equal(await page.evaluate(()=>Object.entries(window.shopRefs).every(([selector,node])=>node===document.querySelector(selector))),true,'shop frame, catalog, detail, quantity and action stay mounted');
      const fits=async()=>assert.equal(await page.evaluate(()=>{const panel=document.querySelector('#panel');return panel.scrollWidth>panel.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1;}),false,'shop remains within mobile viewport '+width);
      assert.equal(await page.locator('.shop-trade-detail').count(),1);
      assert.equal(await page.locator('.shop-route-fold').evaluate(node=>node.open),false,'secondary route info starts folded');
      assert.match(await page.locator('.shop-rate-copy').innerText(),/本次共支付 晶体×1，获得 布料×3/);
      await page.evaluate(()=>{window.shopMutations=0;window.shopObserver=new MutationObserver(list=>window.shopMutations+=list.length);window.shopObserver.observe(document.querySelector('.settlement-shop-screen'),{subtree:true,childList:true,attributes:true,characterData:true});});
      await page.locator('.shop-product[data-item="cloth"]').evaluate(button=>button.onclick());
      assert.equal(await page.evaluate(()=>{shopObserver.disconnect();return shopMutations;}),0,'reselecting current product is a no-op');
      await page.locator('.shop-route-fold summary').click();
      await page.locator('.station-quantity').fill('2');
      await page.locator('.shop-item-notes summary').click();
      await page.evaluate(()=>window.shopScroll=document.querySelector('.station-detail-body').scrollTop);
      await page.locator('.station-confirm').click();
      assert.deepEqual(await page.evaluate(()=>[state.inv.crystal,state.inv.cloth,document.querySelector('.station-quantity').value]),[998,6,'2']);
      assert.equal(await page.locator('#action-feedback.is-visible').count(),0,'successful inline trade does not cover confirmation with a toast');
      assert.equal(await page.locator('.shop-route-fold').evaluate(node=>node.open),true);
      assert.equal(await page.locator('.shop-item-notes').evaluate(node=>node.open),true);
      assert.equal(await page.evaluate(()=>Math.abs(document.querySelector('.station-detail-body').scrollTop-shopScroll)<2),true,'successful trade preserves detail scroll');await stable();await fits();
      await page.locator('.shop-product[data-item="ecomp"]').click();
      assert.match(await page.locator('.station-result').innerText(),/电子元件/);assert.equal(await page.locator('.station-quantity').inputValue(),'1');await stable();
      await page.locator('.shop-mode-tabs button').nth(1).click();assert.match(await page.locator('.station-confirm').innerText(),/确认出售/);await stable();
      await page.locator('.shop-category-tabs [data-category="equipment"]').click();
      assert.equal(await page.locator('.shop-product:not(.category-equipment):visible').count(),0);
      await page.locator('.shop-product[data-item="knife"]').click();await page.locator('.shop-mode-tabs button').first().click();
      assert.match(await page.locator('.shop-equipment-profile').innerText(),/攻\+20/);assert.equal(await page.locator('.station-quantity-controls').isVisible(),false,'single-purchase gear has fixed quantity');
      await page.locator('.station-confirm').click();assert.equal(await page.evaluate(()=>state.inv.knife),1);assert.equal(await page.locator('.station-confirm').isDisabled(),true);assert.match(await page.locator('.station-status').innerText(),/已经持有/);await stable();
      // Simulate a future catalog with a category that has no unlocked stock.
      await page.evaluate(()=>{window.emptyCategoryRows=Object.entries(SETTLEMENT_SHOP).filter(([,row])=>row.category==='special');emptyCategoryRows.forEach(([id])=>delete SETTLEMENT_SHOP[id]);});
      await page.locator('.shop-category-tabs [data-category="special"]').click();
      assert.equal(await page.locator('.shop-product:visible').count(),0);assert.equal(await page.locator('.shop-empty').isVisible(),true);assert.equal(await page.locator('.station-confirm').isDisabled(),true);assert.equal(await page.locator('.station-confirm').innerText(),'暂无商品');await stable();await fits();
      await page.evaluate(()=>{emptyCategoryRows.forEach(([id,row])=>SETTLEMENT_SHOP[id]=row);document.querySelector('#panel')._refreshSettlementShop();});
      assert.ok(await page.locator('.shop-product:visible').count()>0);assert.equal(await page.locator('.shop-empty').isVisible(),false);await stable();await fits();
      assert.deepEqual(errors,[]);
      if(process.env.SHOP_SCREENSHOT_DIR)await page.screenshot({path:process.env.SHOP_SCREENSHOT_DIR+'/shop-'+width+'.png'});
      await page.close();
    }
    console.log('Shop mobile regression: three viewports, stable nodes/scroll, trade accounting, one-item limits, categories and empty stock passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
