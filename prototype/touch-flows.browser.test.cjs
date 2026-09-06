// Disposable touch contexts and synthetic saves only. External requests are blocked.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TOUCH_FLOW_URL||'http://127.0.0.1:4187/';
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
      const context=await browser.newContext({viewport,hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];
      await context.route('**/*',route=>{const url=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(url.hostname)||['data:','blob:'].includes(url.protocol)?route.continue():route.abort();});
      page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
      await page.goto(base);
      await page.evaluate(()=>{
        prepareLocalGame();window.resetTouchFixture=()=>{resetStoryScenes();state=freshState();state.tutorial={version:1,step:'done',complete:true};Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});state.sound=false;state.music=false;state.vibration=false;state.tab='act';state.player.location='camp';};resetTouchFixture();render();
        document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
      });
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='gather'){
        await page.evaluate(()=>{
          resetTouchFixture();state.quests.first_exit='done';state.player.location='outer';state.resourceSites.outer=true;state.resourcePools.outer={charges:5,updatedAt:state.time};state.fieldEncounter.cooldown=50;state.inv.plasmaCutter=1;render();
        });
        await page.locator('.field-map-marker[data-marker-id="resource:outer"]').tap();
        await page.evaluate(()=>{window.flowRefs={map:document.querySelector('.field-map-viewport'),drawer:document.querySelector('.field-map-drawer'),action:document.querySelector('.field-map-drawer-action'),dock:document.querySelector('.field-explore-button'),before:state.inv.scrap||0};});
        const gatherAction=page.locator('.field-map-drawer-action');
        for(let index=0;index<2;index++){
          await gatherAction.tap();
          assert.equal(await page.evaluate(()=>flowRefs.map===document.querySelector('.field-map-viewport')&&flowRefs.drawer===document.querySelector('.field-map-drawer')&&flowRefs.action===document.querySelector('.field-map-drawer-action')&&flowRefs.dock===document.querySelector('.field-explore-button')),true,'repeat gathering must preserve map, drawer and both action buttons');
        }
        assert.equal(await page.locator('.field-map-drawer').evaluate(node=>node.classList.contains('is-open')),true);
        assert.equal(await page.evaluate(()=>state.inv.scrap>flowRefs.before),true);
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).inv.scrap===state.inv.scrap),true,'gather result is saved immediately');
        await page.locator('.field-map-drawer-close').tap();
        assert.equal(await page.locator('.field-map-drawer.is-open').count(),0);
      }
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='production'){
        await page.evaluate(()=>{
          resetTouchFixture();state.meta.built.smelt=true;state.meta.buildLevels.smelt=1;state.meta.techs[TECH_FOR_SMELT[SMELT[0].id]]=true;state.inv.scrap=1000;state.inv.wood=1000;state.inv.coal=1000;openCampBuilding('smelt');
          window.flowRefs={screen:document.querySelector('.facility-operation-screen'),products:document.querySelector('.station-product-grid'),detail:document.querySelector('.station-recipe-detail'),input:document.querySelector('.station-quantity'),confirm:document.querySelector('.station-confirm'),out:SMELT[0].out};
        });
        await page.locator('.station-confirm').tap();
        assert.equal(await page.evaluate(()=>flowRefs.screen===document.querySelector('.facility-operation-screen')&&flowRefs.products===document.querySelector('.station-product-grid')&&flowRefs.detail===document.querySelector('.station-recipe-detail')&&flowRefs.input===document.querySelector('.station-quantity')&&flowRefs.confirm===document.querySelector('.station-confirm')),true,'production must update inventory without replacing any workbench controls');
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).inv[flowRefs.out]===state.inv[flowRefs.out]),true,'production result is saved immediately');
        await page.locator('.station-step').filter({hasText:/^\+1$/}).tap();
        assert.equal(await page.locator('.station-quantity').inputValue(),'2','make two items without opening a numeric keyboard');
        await page.locator('.station-quantity').fill('');
        assert.equal(await page.locator('.station-quantity').inputValue(),'','editing a quantity must allow an empty intermediate input');
        await page.locator('.station-quantity').fill('3');
        await page.locator('.station-confirm').tap();
        assert.equal(await page.locator('.station-quantity').inputValue(),'3');
      }
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='recycle'){
        await page.evaluate(()=>{resetTouchFixture();state.meta.built.recycler=true;state.meta.buildLevels.recycler=1;state.inv.knife=5;openCampBuilding('recycler');});
        await page.locator('.station-product').filter({hasText:'拆解：铁刀'}).tap();
        await page.locator('.station-quantity').fill('2');await page.locator('.station-confirm').tap();
        assert.equal(await page.locator('.station-quantity').getAttribute('max'),'3','recycle upper bound reflects remaining idle equipment after a batch');
        await page.locator('.station-step').filter({hasText:/^\+10$/}).tap();
        assert.equal(await page.locator('.station-quantity').inputValue(),'3');
        await page.locator('.station-confirm').tap();
        assert.equal(await page.evaluate(()=>state.inv.knife),0);
        assert.equal(await page.locator('.station-confirm').isDisabled(),true,'exhausted equipment cannot be dismantled again');
      }
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='npc'){
        await page.evaluate(()=>{resetTouchFixture();state.player.location=npcLocation('林薇');state.flags[fieldNpcDiscoveryFlag('林薇',P().location)]=true;queueNpcFirstContact('林薇',P().location);render();});
        for(let beat=0;beat<8&&await page.locator('.story-cutscene-next').count();beat++){await page.locator('.story-cutscene-next').tap();await page.waitForTimeout(220);}
        assert.equal(await page.locator('#panel').getAttribute('data-view'),'npc','walking up after first contact must open the NPC conversation, not silently dismiss');
        await page.locator('.npc-terminal .ui-workspace__exit').tap();
        assert.equal(await page.locator('#panel').getAttribute('data-view'),'explore');
        assert.equal(await page.locator('.field-map-marker[data-marker-id="npc:林薇"]').count(),1,'contact portrait remains on the source map after leaving dialogue');
      }
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='ship'){
        const name=await page.evaluate(()=>{resetTouchFixture();Object.keys(TECHS).forEach(id=>state.meta.techs[id]=1);Object.keys(ITEMS).forEach(id=>state.inv[id]=1000);CAMP_BUILDINGS.forEach(b=>{state.meta.built[b.id]=true;state.meta.buildLevels[b.id]=(b.upgrades||[]).length+1;});SHIP_COMPONENTS.forEach(id=>state.inv[id]=1);state.inv.navComputer=0;openCampBuilding('starDock');return ITEMS.navComputer.name;});
        await page.locator('.station-product').filter({has:page.getByText(name,{exact:true})}).tap();
        assert.equal(await page.locator('.facility-main-action').isDisabled(),true);
        await page.locator('.station-confirm').tap();
        assert.equal(await page.locator('.station-confirm').isDisabled(),true,'unique component becomes completed immediately after making it');
        assert.equal(await page.locator('.facility-main-action').isDisabled(),false,'making the final component immediately enables assembly without reopening the dock');
      }
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='facilities'){
        for(const facility of ['watch','droneBay']){
          await page.evaluate(facility=>{resetTouchFixture();Object.keys(TECHS).forEach(id=>state.meta.techs[id]=1);Object.keys(ITEMS).forEach(id=>state.inv[id]=1000);state.meta.built[facility]=true;state.meta.buildLevels[facility]=1;openCampBuilding(facility);window.flowRefs={products:document.querySelector('.station-product-grid'),detail:document.querySelector('.station-recipe-detail'),confirm:document.querySelector('.station-confirm')};},facility);
          for(let index=0;index<2;index++)await page.locator('.station-confirm').tap();
          assert.equal(await page.evaluate(()=>flowRefs.products===document.querySelector('.station-product-grid')&&flowRefs.detail===document.querySelector('.station-recipe-detail')&&flowRefs.confirm===document.querySelector('.station-confirm')),true,facility+' keeps the same build/upgrade controls under the thumb');
          assert.equal(await page.evaluate(facility=>facility==='watch'?state.defenses[0].level:state.droneFleet.scout,facility),2,'second tap performs a second '+facility+' action');
          assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).time===state.time),true);
        }
        await page.evaluate(()=>{resetTouchFixture();Object.keys(ITEMS).forEach(id=>state.inv[id]=100);state.meta.built.garden=true;state.meta.buildLevels.garden=1;openCampBuilding('garden');window.flowRefs={shell:document.querySelector('.garden-workbench'),other:document.querySelector('.garden-bed[data-slot="1"]'),detail:document.querySelector('.garden-detail')};});
        await page.locator('.garden-bed[data-slot="0"] .garden-bed-main').tap();
        assert.equal(await page.evaluate(()=>flowRefs.shell===document.querySelector('.garden-workbench')&&flowRefs.other===document.querySelector('.garden-bed[data-slot="1"]')&&flowRefs.detail===document.querySelector('.garden-detail')),true,'planting only updates its bed, not other slots or the recipe');
      }
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='swipe'){
        await page.evaluate(()=>{resetTouchFixture();Object.keys(TECHS).forEach(id=>state.meta.techs[id]=1);Object.keys(ITEMS).forEach(id=>state.inv[id]=1000);state.meta.built.work=true;state.meta.buildLevels.work=3;openCampBuilding('work');window.flowRefs={selection:STATION_UI.work.id,inventory:JSON.stringify(state.inv),top:document.querySelector('.recipe-station-top')};});
        const swipe=await page.evaluate(()=>{const top=flowRefs.top,r=top.getBoundingClientRect();top.scrollTop=100;const button=[...top.querySelectorAll('.station-product')].find(node=>{const b=node.getBoundingClientRect();return !node.classList.contains('selected')&&b.top>r.top+10&&b.bottom<r.bottom-10;});if(!button)return null;const b=button.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,toY:r.top+10,start:top.scrollTop};});
        assert.ok(swipe,'fixture must expose an unselected recipe to start a real finger swipe');
        const client=await context.newCDPSession(page);
        await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:swipe.x,y:swipe.y,radiusX:4,radiusY:4}]});
        for(let step=1;step<=8;step++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:swipe.x,y:swipe.y+(swipe.toY-swipe.y)*step/8,radiusX:4,radiusY:4}]});await page.waitForTimeout(16);}
        await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(180);
        assert.equal(await page.evaluate(()=>STATION_UI.work.id===flowRefs.selection&&JSON.stringify(state.inv)===flowRefs.inventory),true,'a swipe starting on a recipe must not select it or spend materials');
        assert.equal(await page.evaluate(start=>flowRefs.top.scrollTop>start,swipe.start),true,'the same finger swipe scrolls the recipe pane');
        await client.detach();
      }
      if(!process.env.TOUCH_FLOW_CASE||process.env.TOUCH_FLOW_CASE==='back'){
        for(const source of ['camp','facility']){
          const result=await page.evaluate(source=>{
            resetTouchFixture();if(source==='facility'){state.meta.built.smelt=true;state.meta.buildLevels.smelt=1;openCampBuilding('smelt');}else render();
            queueStoryScene({system:true,title:'返回优先级测试',lines:['返回不应退出游戏或操作剧情下方的页面。'],action:'继续'});flushStoryScenes();
            const scene=document.querySelector('.story-cutscene'),view=panelView(),building=state.campBuilding,handled=handleGameBack();
            return {handled,sameScene:scene===document.querySelector('.story-cutscene'),sameView:view===panelView(),sameBuilding:building===state.campBuilding};
          },source);
          assert.deepEqual(result,{handled:true,sameScene:true,sameView:true,sameBuilding:true},'native Back over story must be consumed without navigating the underlying '+source);
        }
        await page.evaluate(()=>resetStoryScenes());
      }
      assert.deepEqual(errors,[]);await context.close();console.log('Touch flow regression passed at '+viewport.width+'×'+viewport.height);
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
