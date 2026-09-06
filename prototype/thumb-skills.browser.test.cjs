// Disposable touch contexts only. No real player profile or cloud operations.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915}]){
      const context=await browser.newContext({viewport,hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];
      page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
      await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
      if(process.env.THUMB_SKILLS_CSS)await page.addStyleTag({path:process.env.THUMB_SKILLS_CSS});
      await page.evaluate(()=>{
        prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.sound=false;state.music=false;
        Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});state.meta.careers.main={id:'bulwark',level:5,xp:7};state.meta.careers.life=[{id:'noviceCollector',level:2,xp:3}];
        state.skills.pierce={prof:10};state.skills.heavy={prof:10};ensureCareerSkills();state.skillSlots=['shieldBash','kineticBrace',null];state.masteries.gatherMastery=2;state.inv.masteryManual=150;state.inv.heavyBook=2;
        state.skillCatalogue=false;state.skillView='active';state.tab='char';state.charView='skills';render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
        window.skillRefs={panel:document.querySelector('#panel'),hero:document.querySelector('.skill-console-head'),list:document.querySelector('.skill-browser[data-skill-view="active"] .skill-library-grid'),slots:document.querySelector('.skill-loadout-strip'),heavy:document.querySelector('[data-skill="heavy"]')};window.skillRenderCount=0;const originalRender=render;render=function(){window.skillRenderCount++;return originalRender.apply(this,arguments);};
      });
      const verify=async label=>{
        await page.waitForTimeout(180);
        const issues=await page.evaluate(()=>{
          const result=[],panel=document.querySelector('#panel'),scope=document.querySelector('.skill-thumb-sheet')||panel;
          if(panel.scrollHeight>panel.clientHeight+1)result.push('whole skill page scrolls');
          if(panel.scrollWidth>panel.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1)result.push('horizontal overflow');
          const scopeRect=scope.getBoundingClientRect();if(scopeRect.left<0||scopeRect.right>innerWidth+1||scopeRect.bottom>innerHeight+1)result.push('sheet outside viewport');
          for(const node of scope.querySelectorAll('button,input,summary')){
            const rect=node.getBoundingClientRect();if(!rect.width||!rect.height||node.closest('[hidden]'))continue;
            if(rect.width<43.5||rect.height<43.5)result.push(node.className+' touch '+rect.width+'×'+rect.height);
          }
          const footer=document.querySelector('.skill-thumb-sheet .thumb-sheet-footer'),dock=document.querySelector('.skill-thumb-dock'),target=footer||dock,rect=target.getBoundingClientRect();
          if(rect.bottom>innerHeight+1||rect.top<innerHeight*.5)result.push('actions outside thumb zone '+rect.top+'–'+rect.bottom);
          return result;
        });assert.deepEqual(issues,[],label+' '+viewport.width+'×'+viewport.height);
      };
      assert.equal(await page.locator('.skill-detail-panel').count(),0,'no long inline detail before selection');
      assert.equal(await page.locator('.skill-loadout-slot').count(),3);await verify('initial');
      assert.equal(await page.evaluate(()=>{const view=document.querySelector('.skill-browser[data-skill-view="active"]'),grid=view.querySelector('.skill-library-grid');return grid.getBoundingClientRect().height>view.clientHeight||Math.abs(view.getBoundingClientRect().bottom-grid.getBoundingClientRect().bottom)<=16;}),true,'few learned skills sit near the bottom hand zone');
      await page.locator('.skill-library-card[data-skill="heavy"]').tap();
      assert.equal(await page.locator('.skill-thumb-sheet').count(),1);assert.equal(await page.locator('.skill-assignment-slots button').count(),3);await verify('active sheet');
      await page.evaluate(()=>{window.skillSheetRefs={root:document.querySelector('.skill-thumb-sheet'),effect:document.querySelector('.rpg-skill-effect'),assign:[...document.querySelectorAll('.skill-assign-slot')],book:document.querySelector('.skill-book-action'),actionTop:document.querySelector('.skill-assignment-slots').getBoundingClientRect().top};});
      await page.locator('.skill-assign-slot[data-slot="2"]').tap();
      assert.deepEqual(await page.evaluate(()=>[state.skillSlots[2],state.inv.heavyBook]),['heavy',2],'one tap assigns, never consumes a book');
      assert.equal(await page.evaluate(()=>window.skillRefs.heavy===document.querySelector('.skill-library-card[data-skill="heavy"]')&&window.skillRefs.slots===document.querySelector('.skill-loadout-strip')&&window.skillSheetRefs.assign.every((node,index)=>node===document.querySelectorAll('.skill-assign-slot')[index])),true,'assignment preserves source and action nodes');
      await page.locator('.skill-assign-slot[data-slot="2"]').tap();assert.equal(await page.evaluate(()=>state.skillSlots[2]),null,'equipped slot clearly unloads');
      await page.locator('.skill-assign-slot[data-slot="1"]').tap();assert.equal(await page.evaluate(()=>state.skillSlots[1]),'heavy','slot replacement needs no top-page detour');
      await page.locator('.skill-book-action').tap();
      assert.deepEqual(await page.evaluate(()=>[skillLv('heavy'),state.inv.heavyBook]),[3,1]);
      assert.equal(await page.evaluate(()=>window.skillSheetRefs.effect===document.querySelector('.rpg-skill-effect')&&window.skillSheetRefs.book===document.querySelector('.skill-book-action')),true,'upgrade feedback is in place');await verify('assigned and upgraded');
      await page.locator('.skill-book-action').tap();assert.equal(await page.locator('.skill-book-action').isDisabled(),true,'exhausted books leave a disabled control, not a moving target');
      assert.equal(await page.evaluate(()=>Math.abs(window.skillSheetRefs.actionTop-document.querySelector('.skill-assignment-slots').getBoundingClientRect().top)<1),true,'assignment and book depletion do not shift slot controls');
      await page.locator('.skill-sheet-close').tap();assert.equal(await page.locator('.skill-thumb-sheet').count(),0);
      await page.locator('.skill-library-card[data-skill="heavy"]').tap();assert.equal(await page.locator('.skill-thumb-sheet').count(),1,'same selected skill can reopen');
      await page.keyboard.press('Escape');await page.locator('.skill-loadout-slot').nth(1).tap();assert.equal(await page.locator('.skill-detail-panel').getAttribute('data-skill'),'heavy','loadout opens its current skill');await page.locator('.skill-sheet-close').tap();
      await page.locator('.skill-library-card[data-skill="reactiveArmor"]').tap();assert.equal(await page.locator('.skill-assign-slot').count(),0,'passives do not offer fake equip');assert.match(await page.locator('.skill-auto-status').innerText(),/自动生效/);await page.locator('.skill-sheet-close').tap();
      await page.locator('.skill-category-tabs button').nth(1).tap();await page.locator('.skill-library-card[data-skill="quickScavenge"]').tap();assert.equal(await page.locator('.skill-assign-slot').count(),0);assert.match(await page.locator('.skill-detail-use').innerText(),/资源点.*采集时自动/);await verify('life sheet');await page.locator('.skill-sheet-close').tap();
      await page.locator('.skill-category-tabs button').nth(2).tap();await page.locator('.skill-library-card[data-skill="mastery:gatherMastery"]').tap();
      await page.evaluate(()=>{window.masteryRefs={input:document.querySelector('.skill-mastery-quantity'),confirm:document.querySelector('.skill-mastery-confirm')};});
      await page.locator('.skill-mastery-controls button').last().tap();assert.equal(await page.locator('.skill-mastery-quantity').inputValue(),'101');assert.equal(await page.evaluate(()=>state.inv.masteryManual),150,'quantity changes never spend');
      await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[masteryLv('gatherMastery'),state.inv.masteryManual]),[103,49]);
      assert.equal(await page.evaluate(()=>window.masteryRefs.input===document.querySelector('.skill-mastery-quantity')&&window.masteryRefs.confirm===document.querySelector('.skill-mastery-confirm')),true);assert.match(await page.locator('.rpg-skill-effect').innerText(),/超限|额外|回收/);await verify('mastery upgrade');
      await page.locator('.skill-mastery-confirm').tap();assert.deepEqual(await page.evaluate(()=>[masteryLv('gatherMastery'),state.inv.masteryManual]),[152,0]);assert.equal(await page.locator('.skill-mastery-confirm').isDisabled(),true);assert.equal(await page.locator('.skill-mastery-quantity').isDisabled(),true,'exhausted manuals disable the existing controls');await page.locator('.skill-sheet-close').tap();
      await page.locator('.skill-category-tabs button').nth(0).tap();await page.locator('.skill-catalogue-toggle').tap();assert.ok(await page.locator('.skill-browser:visible .skill-library-card.locked:visible').count()>0);
      const allReachable=await page.evaluate(()=>{const view=document.querySelector('.skill-browser[data-skill-view="active"]'),cards=[...view.querySelectorAll('.skill-library-card')];view.scrollTop=0;const top=cards[0].getBoundingClientRect().top>=view.getBoundingClientRect().top-1;view.scrollTop=view.scrollHeight;const bottom=cards.at(-1).getBoundingClientRect().bottom<=view.getBoundingClientRect().bottom+1;return top&&bottom;});assert.equal(allReachable,true,'full catalogue reaches both first and last rows without clipping');
      await page.evaluate(()=>{const node=document.querySelector('.skill-browser[data-skill-view="active"]');node.scrollTop=150;window.skillScroll=node.scrollTop;});
      await page.locator('.skill-category-tabs button').nth(1).tap();await page.locator('.skill-category-tabs button').nth(0).tap();assert.equal(await page.evaluate(()=>document.querySelector('.skill-browser[data-skill-view="active"]').scrollTop),await page.evaluate(()=>window.skillScroll),'category switching preserves library scroll');
      await page.locator('.skill-browser:visible .skill-library-card.locked').first().tap();assert.equal(await page.locator('.skill-assign-slot:enabled').count(),0,'locked skill cannot be assigned');await page.locator('.skill-sheet-close').tap();
      assert.equal(await page.evaluate(()=>window.skillRefs.hero===document.querySelector('.skill-console-head')&&window.skillRefs.list===document.querySelector('.skill-browser[data-skill-view="active"] .skill-library-grid')&&window.skillRenderCount===0),true,'all touch interactions avoid global render');assert.deepEqual(errors,[]);
      if(viewport.width===390){await page.locator('.skill-catalogue-toggle').tap();await page.screenshot({path:'/tmp/abyss-thumb-skills-390.png',animations:'disabled'});await page.locator('.skill-library-card[data-skill="heavy"]').tap();await page.screenshot({path:'/tmp/abyss-thumb-skill-sheet-390.png',animations:'disabled'});}
      assert.equal(await page.evaluate(()=>{state.charView='overview';render();return document.querySelector('#panel').classList.contains('thumb-skills-page');}),false,'leaving skills removes its fixed-layout class');
      await context.close();
    }
    console.log('Thumb skill UI: three phone sizes, direct equip/unload, automatic life/passives, explicit manual upgrade, stable nodes and preserved scroll passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
