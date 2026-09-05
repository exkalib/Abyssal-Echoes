// Disposable browser contexts only: no player profile, save import, or cloud writes.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
      const page=await browser.newPage({viewport}),errors=[];
      page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
      await page.goto(process.env.MOBILE_UI_TEST_URL||'http://127.0.0.1:4187/');
      await page.evaluate(()=>{
        prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};
        Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});
        state.sound=false;state.music=false;state.player.location='camp';state.tab='act';
        for(const building of CAMP_BUILDINGS){state.meta.built[building.id]=true;state.meta.buildLevels[building.id]=1;}
        state.skills.pierce={prof:10};state.skills.heavy={prof:10};state.skillSlots=['pierce',null,null];
        render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');
        const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');
      });
      const verifyPage=async label=>{
        await page.waitForFunction(()=>!document.querySelector('#panel .is-touching,#tabbar .is-touching'));
        await page.waitForTimeout(180); // Let the intentional pressed scale return to its resting touch target.
        const issues=await page.evaluate(()=>{
          const result=[],panel=document.querySelector('#panel');
          if(panel.scrollWidth>panel.clientWidth+1)result.push('panel horizontal overflow');
          if(document.documentElement.scrollWidth>innerWidth+1)result.push('document horizontal overflow');
          if(document.documentElement.scrollHeight>innerHeight+1)result.push('document vertical overflow');
          for(const node of document.querySelectorAll('#panel button,#panel summary,#tabbar button')){
            const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
            if(!rect.width||!rect.height||style.visibility==='hidden'||node.closest('[hidden]'))continue;
            if(rect.width<43.5||rect.height<43.5)result.push(node.className+' '+node.textContent.trim().slice(0,28)+' target '+Math.round(rect.width)+'×'+Math.round(rect.height));
          }
          return result;
        });
        assert.deepEqual(issues,[],label+' '+viewport.width+'×'+viewport.height);
      };

      assert.equal(await page.locator('.camp-facility-filters button').count(),4);
      await page.evaluate(()=>{window.mobileRefs={layout:document.querySelector('.camp-layout'),cards:[...document.querySelectorAll('.camp-facility')],dock:document.querySelector('.camp-home-dock')};});
      for(const group of ['craft','support','special','all']){
        await page.locator('.camp-facility-filters button[data-filter="'+group+'"]').click();
        const filtering=await page.evaluate(group=>{
          const cards=[...document.querySelectorAll('.camp-facility')];
          return {stable:window.mobileRefs.layout===document.querySelector('.camp-layout')&&window.mobileRefs.dock===document.querySelector('.camp-home-dock')&&cards.every((card,index)=>card===window.mobileRefs.cards[index]),visibility:cards.filter(card=>(getComputedStyle(card).display!=='none')!==(group==='all'||card.dataset.group===group)).map(card=>({group:card.dataset.group,hidden:card.hidden,display:getComputedStyle(card).display}))};
        },group);
        assert.equal(filtering.stable,true,'facility filtering must retain its layout, dock and cards');
        assert.deepEqual(filtering.visibility,[],'facility filtering must hide irrelevant groups');
      }
      await verifyPage('camp filters');
      assert.equal(await page.locator('.camp-depart').isVisible(),true);
      const campScroll=await page.locator('.camp-home-scroll').evaluate(node=>{node.scrollTop=180;return node.scrollTop;});
      await page.locator('.camp-depart').click();
      assert.equal(await page.locator('#panel').getAttribute('data-view'),'camp-map');
      await page.getByRole('button',{name:'关闭地图',exact:true}).click();
      assert.equal(await page.locator('#panel').getAttribute('data-view'),'camp');
      assert.equal(await page.locator('.camp-facility-filters button.active').getAttribute('data-filter'),'all');
      await page.waitForFunction(expected=>document.querySelector('.camp-home-scroll').scrollTop===expected,campScroll);

      const expectedViews={char:'character',career:'careers',skill:'skills',bag:'bag',task:'tasks'};
      const specialClasses={char:'character-page',career:'careers-page',skill:'skills-page',bag:null,task:'tasks-console'};
      for(const [tab,view] of Object.entries(expectedViews)){
        await page.locator('#tabbar button[data-tab="'+tab+'"]').click();
        assert.equal(await page.locator('#panel').getAttribute('data-view'),view,'bottom tab opens '+view);
        assert.equal(await page.locator('#tabbar button:visible').count(),5,'all five main tabs stay visible');
        assert.equal(await page.locator('#tabbar button.active').getAttribute('data-tab'),tab);
        const classes=await page.locator('#panel').getAttribute('class');
        for(const [owner,cls] of Object.entries(specialClasses))if(cls)assert.equal(classes.split(/\s+/).includes(cls),owner===tab,'page class '+cls+' must not leak into '+view);
        if(tab==='char'){
          assert.equal(await page.locator('.char-profile-stats .ui-stat-chip').count(),6);
          assert.equal(await page.locator('.stat-fold').getAttribute('open'),null);
          assert.equal(await page.locator('.gene-entry').isVisible(),true);
          await page.locator('.stat-fold>summary').click();
          assert.equal(await page.locator('.char-advanced-stats .ui-stat-chip:visible').count(),8,'advanced stats remain accessible');
          await page.locator('.stat-fold>summary').click();
          await page.locator('.echo-fold>summary').click();
          assert.equal(await page.locator('.echo-fold').evaluate(node=>node.open),true);
          await page.locator('.echo-fold>summary').click();
        }
        await verifyPage(view);
      }
      // Tapping the active tab returns to the scene and clears the previous page's skin.
      await page.locator('#tabbar button[data-tab="task"]').click();
      assert.equal(await page.locator('#panel').getAttribute('data-view'),'camp');
      assert.equal(await page.locator('#panel').evaluate(node=>['character-page','careers-page','skills-page','tasks-console'].some(cls=>node.classList.contains(cls))),false);

      await page.locator('#tabbar button[data-tab="char"]').click();
      await page.locator('.gene-entry').click();
      assert.equal(await page.locator('#panel').getAttribute('data-view'),'genes');
      assert.equal(await page.locator('#panel').evaluate(node=>node.classList.contains('character-page')),false,'character layout must not leak into gene canvas');
      await page.getByRole('button',{name:'返回角色',exact:true}).click();
      assert.equal(await page.locator('#panel').getAttribute('data-view'),'character');
      await verifyPage('character returned from gene tree');
      await page.locator('#tabbar button[data-tab="bag"]').click();
      await page.locator('summary.loadout-head').click();
      assert.equal(await page.locator('.loadout-console').evaluate(node=>node.open),false,'wardrobe can collapse without leaving inventory');
      await page.locator('.bag-category-tabs button').filter({hasText:'材料'}).click();
      const vaultFit=await page.locator('.inventory-vault').evaluate(node=>({height:node.clientHeight,body:node.parentElement.clientHeight,scrollMax:getComputedStyle(node.querySelector('.inventory-scroll')).maxHeight}));
      assert.equal(vaultFit.scrollMax,'none','stored items should use all remaining height, not a tiny fixed window');
      assert.ok(vaultFit.height>=vaultFit.body-8,'inventory background fills the remaining pane');
      await page.evaluate(()=>{state.tab='act';state.player.location='outer';state.meta.careers.main={id:'bulwark',level:5,xp:0};ensureCareerSkills();state.skillSlots=['shieldBash','kineticBrace','pierce'];startCombat('warbot');render();document.querySelector('.battle-screen').classList.remove('is-opening');});
      await verifyPage('combat');
      const battle=await page.evaluate(()=>{
        const rect=s=>document.querySelector(s).getBoundingClientRect(),feed=document.querySelector('.battle-event-feed');
        return {dockBottom:rect('.battle-command-dock').bottom,operatorTop:rect('.battle-operator-hud').top,feedBottom:getComputedStyle(feed).display==='none'?0:feed.getBoundingClientRect().bottom,
          readable:[...document.querySelectorAll('.battle-skill .battle-action-copy b')].every(node=>getComputedStyle(node).textOverflow!=='ellipsis'&&node.clientWidth>=45)};
      });
      assert.ok(battle.dockBottom<=viewport.height+1,'battle actions stay inside the phone');
      assert.ok(battle.feedBottom<=battle.operatorTop,'combat record must not overlap the player HUD');
      assert.equal(battle.readable,true,'disabled skill names stay readable, not squeezed into the old code column');
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('Mobile UI: three phone sizes, stable camp filtering, map return, character disclosures and five-tab isolation passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
