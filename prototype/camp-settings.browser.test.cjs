// Disposable contexts only: synthetic progress, no player profile or cloud writes.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.MOBILE_UI_TEST_URL||'http://127.0.0.1:4187/';

(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const viewport of [{width:360,height:640},{width:390,height:844},{width:1292,height:874}]){
      const page=await browser.newPage({viewport,hasTouch:viewport.width<600}),errors=[];
      page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
      await page.route('**/*',route=>/^https?:/.test(route.request().url())&&!route.request().url().startsWith(url)?route.abort():route.continue());
      await page.goto(url);
      await page.evaluate(()=>{
        prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};
        Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});state.sound=false;state.music=false;state.player.location='camp';state.tab='act';
        for(const building of CAMP_BUILDINGS){state.meta.built[building.id]=true;state.meta.buildLevels[building.id]=1;}
        render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');
        const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');
      });
      const shot=async name=>{if(process.env.UI_QA_DIR)await page.screenshot({path:process.env.UI_QA_DIR+'/'+name+'-'+viewport.width+'.png'});};
      const verify=async label=>{
        const issues=await page.evaluate(()=>{
          const panel=document.querySelector('#panel'),result=[];
          if(panel.scrollWidth>panel.clientWidth+1||panel.scrollHeight>panel.clientHeight+1)result.push('outer panel overflow');
          if(document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1)result.push('document overflow');
          for(const node of panel.querySelectorAll('button,input,summary')){
            if(!node.checkVisibility()||node.closest('[hidden]'))continue;
            if(node.offsetWidth<44||node.offsetHeight<44)result.push(node.className+' target '+node.offsetWidth+'×'+node.offsetHeight);
          }
          return result;
        });
        assert.deepEqual(issues,[],label+' '+viewport.width+'×'+viewport.height);
      };
      assert.ok(await page.locator('.camp-hero').evaluate(node=>node.offsetHeight<=64),'camp title is a compact location strip');
      assert.equal(await page.locator('.camp-facility-toolbar .camp-facility-filters').count(),1);
      await shot('camp-after');
      const positions=await page.evaluate(()=>{window.campRefs={toolbar:document.querySelector('.camp-facility-toolbar'),layout:document.querySelector('.camp-layout'),cards:[...document.querySelectorAll('.camp-facility')]};return {top:window.campRefs.toolbar.getBoundingClientRect().top,bottom:window.campRefs.toolbar.getBoundingClientRect().bottom};});
      await page.locator('.camp-home-scroll').evaluate(node=>node.scrollTop=node.scrollHeight);
      assert.deepEqual(await page.locator('.camp-facility-toolbar').evaluate(node=>({top:node.getBoundingClientRect().top,bottom:node.getBoundingClientRect().bottom})),positions,'the facility title and filters do not scroll away');
      assert.equal(await page.evaluate(()=>{const toolbar=document.querySelector('.camp-facility-toolbar'),rect=toolbar.getBoundingClientRect();return toolbar.contains(document.elementFromPoint(rect.x+rect.width/2,rect.bottom-2));}),true,'scrolled facility art cannot paint through the fixed tools');
      await shot('camp-scrolled');
      for(const filter of ['craft','support','special','all']){
        await page.locator('.camp-facility-filters [data-filter="'+filter+'"]').click();
        assert.equal(await page.evaluate(()=>window.campRefs.toolbar===document.querySelector('.camp-facility-toolbar')&&window.campRefs.layout===document.querySelector('.camp-layout')&&window.campRefs.cards.every((node,index)=>node===document.querySelectorAll('.camp-facility')[index])),true,'filtering keeps the same mounted cards and toolbar');
      }
      assert.equal(await page.locator('.camp-facility').evaluateAll(cards=>cards.every(card=>{const rect=card.getBoundingClientRect(),label=card.querySelector('.cf-copy b').getBoundingClientRect();return label.bottom<=rect.bottom&&label.left>=rect.left&&label.right<=rect.right;})),true,'every facility label remains inside its card');
      await verify('camp');
      await page.locator('#set-btn').click();await verify('settings');await shot('settings-after');
      assert.equal(await page.locator('.settings-volume input').evaluateAll(inputs=>inputs.every(input=>input.offsetWidth>=120)),true,'volume sliders have usable tracks on the narrow phone');
      const exit=await page.locator('.settings-exitbar').boundingBox();
      await page.locator('.settings-version>summary').click();
      await page.locator('.settings-dashboard').evaluate(node=>node.scrollTop=node.scrollHeight);
      assert.deepEqual(await page.locator('.settings-exitbar').boundingBox(),exit,'return remains fixed when settings details scroll');
      await verify('settings details');await shot('settings-details');
      await page.locator('.settings-dashboard').evaluate(node=>node.scrollTop=0);
      await page.evaluate(()=>window.settingsRefs={dashboard:document.querySelector('.settings-dashboard'),sound:document.querySelector('.settings-switch'),volume:document.querySelector('.settings-volume input'),appearance:document.querySelector('.settings-appearance-options')});
      await page.locator('.settings-switch[data-label="游戏音效"]').click();
      await page.locator('.settings-volume input').first().evaluate(input=>{input.value='65';input.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.locator('[data-appearance="female"]').click();
      assert.equal(await page.evaluate(()=>window.settingsRefs.dashboard===document.querySelector('.settings-dashboard')&&window.settingsRefs.sound===document.querySelector('.settings-switch')&&window.settingsRefs.volume===document.querySelector('.settings-volume input')&&window.settingsRefs.appearance===document.querySelector('.settings-appearance-options')),true,'settings do not rebuild on changes');
      assert.deepEqual(await page.evaluate(()=>({sound:state.sound,volume:state.soundVolume,appearance:state.playerAppearance})),{sound:true,volume:.65,appearance:'female'});
      await page.getByRole('button',{name:'关闭设置并返回游戏',exact:true}).click();
      assert.equal(await page.locator('#panel').getAttribute('data-view'),'camp');
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('Camp/settings: three sizes including real touch media; compact title, fixed facilities/tools, clipped scrolling, mounted filters/settings, usable volume tracks, and fixed return passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
