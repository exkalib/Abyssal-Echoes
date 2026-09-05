// Isolated UI fixtures: never opens the player's profile or imports a real save.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const width of [360,390,520,768]){
      const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
      page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
      await page.goto(process.env.RPG_TEST_URL||'http://127.0.0.1:4187/');
      await page.evaluate(()=>{
        prepareLocalGame();state=freshState();state.tutorial.complete=true;state.tutorial.step='done';
        Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});state.meta.careers.main={id:'bulwark',level:5,xp:7};state.meta.careers.life=[{id:'noviceCollector',level:2,xp:3},{id:'noviceApprentice',level:1,xp:4},{id:'noviceGrower',level:1,xp:5}];
        state.skills.pierce={prof:10};state.skills.heavy={prof:10};ensureCareerSkills();state.skillSlots=['shieldBash','kineticBrace',null];state.skillCatalogue=false;state.skillView='active';state.tab='char';state.charView='skills';render();
        document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');
      });
      const noOverflow=async()=>{
        assert.equal(await page.evaluate(()=>{const panel=document.querySelector('#panel');return panel.scrollWidth>panel.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1;}),false,'panel must fit actual game width '+width);
        const scale=await page.evaluate(()=>[...document.querySelectorAll('#panel *')].filter(node=>{const rect=node.getBoundingClientRect();return rect.width>0&&rect.height>0;}).flatMap(node=>{const rect=node.getBoundingClientRect(),text=[...node.childNodes].some(child=>child.nodeType===3&&child.textContent.trim()),size=parseFloat(getComputedStyle(node).fontSize),label=node.tagName+'.'+node.className+' '+node.textContent.trim().slice(0,45);return text&&size<10?[label+' text '+size]:node.matches('button,summary')&&(rect.height<43.5||rect.width<43.5)?[label+' touch '+rect.width+'×'+rect.height]:[];}));
        assert.deepEqual(scale,[],'readable text >=10px and touch targets >=44px');
      };
      assert.equal(await page.locator('.skill-loadout-slot').count(),3);
      assert.equal(await page.locator('.skill-library-card.locked').count(),0,'learned is the default');
      await page.evaluate(()=>{window.rpgRefs={hero:document.querySelector('.skill-console-head'),list:document.querySelector('.skill-library-grid'),slots:document.querySelector('.skill-loadout-strip')};});
      await page.locator('.skill-library-card[data-skill="heavy"]').click();
      assert.equal(await page.evaluate(()=>window.rpgRefs.hero===document.querySelector('.skill-console-head')&&window.rpgRefs.list===document.querySelector('.skill-library-grid')&&window.rpgRefs.slots===document.querySelector('.skill-loadout-strip')),true,'skill selection preserves mounted controls');
      assert.equal(await page.locator('.skill-detail-panel').count(),1);await noOverflow();
      await page.locator('.rpg-text-button').click();assert.ok(await page.locator('.skill-library-card.locked').count()>0,'explicit catalogue retains locked unlock paths');await noOverflow();
      await page.locator('.skill-category-tabs button').nth(1).click();assert.match(await page.locator('.skill-detail-panel').innerText(),/现场|生活|副职业|自动/);await noOverflow();
      await page.locator('.skill-category-tabs button').nth(2).click();await noOverflow();
      await page.evaluate(()=>{state.charView='careers';state.careerView='current';render();});
      assert.equal(await page.locator('.career-dossier.main').count(),1);assert.equal(await page.locator('.career-dossier.life').count(),3);await noOverflow();
      await page.locator('.career-view-tabs button').nth(1).click();
      assert.equal(await page.locator('.rpg-route-selector').count(),3);assert.equal(await page.locator('.career-path-card').count(),1);
      await page.evaluate(()=>{window.rpgRouteList=document.querySelector('.rpg-route-selectors');});
      for(let index=0;index<3;index++){await page.locator('.rpg-route-selector').nth(index).click();assert.equal(await page.locator('.career-path-card').count(),1);assert.equal(await page.evaluate(()=>window.rpgRouteList===document.querySelector('.rpg-route-selectors')),true);await noOverflow();}
      await page.locator('.career-view-tabs button').nth(2).click();await noOverflow();
      await page.evaluate(()=>{state.tab='bag';state.bagView='equipment';state.bagSel='feet';state.bagItemSelected='boots';state.player.equip.feet='boots';state.inv.boots=0;state.inv.magboots=2;state.inv.helmet=1;state.inv.knife=1;render();});
      assert.equal(await page.locator('.rpg-gear-grid .item:visible').count(),2,'shoe slot only shows shoes');
      await page.evaluate(()=>{window.rpgBagRefs={doll:document.querySelector('.doll'),art:document.querySelector('.doll-art-host'),grid:document.querySelector('.rpg-gear-grid'),scroll:document.querySelector('.inventory-scroll'),boots:document.querySelector('.item[data-item="boots"]')};});
      await page.locator('.item[data-item="magboots"]').click();
      assert.equal(await page.locator('.rpg-equipment-detail').count(),1);assert.match(await page.locator('.rpg-equipment-detail').innerText(),/待穿戴/);
      assert.equal(await page.evaluate(()=>window.rpgBagRefs.doll===document.querySelector('.doll')&&window.rpgBagRefs.art===document.querySelector('.doll-art-host')&&window.rpgBagRefs.grid===document.querySelector('.rpg-gear-grid')&&window.rpgBagRefs.scroll===document.querySelector('.inventory-scroll')),true);
      await page.locator('.rpg-equipment-action').click();assert.deepEqual(await page.evaluate(()=>[state.player.equip.feet,state.inv.boots,state.inv.magboots]),['magboots',1,1]);
      assert.equal(await page.evaluate(()=>window.rpgBagRefs.grid===document.querySelector('.rpg-gear-grid')&&window.rpgBagRefs.boots===document.querySelector('.item[data-item="boots"]')),true,'wear preserves candidate list nodes');
      await page.locator('.slotchip[data-slot="head"]').click();assert.equal(await page.locator('.rpg-gear-grid .item:visible').count(),1);
      await page.locator('.slotchip[data-slot="feet"]').click();assert.equal(await page.evaluate(()=>window.rpgBagRefs.grid===document.querySelector('.rpg-gear-grid')&&window.rpgBagRefs.boots===document.querySelector('.item[data-item="boots"]')),true,'slot changes filter retained candidates');await noOverflow();
      await page.evaluate(()=>{state.player.equip.offhand='eshieldUnit';state.inv.rifle=1;state.bagSel='weapon';state.bagItemSelected='rifle';refreshBagPanel();});
      assert.equal(await page.locator('.rpg-equipment-action').isDisabled(),true,'two-hand weapon cannot be equipped over a shield');assert.match(await page.locator('.rpg-equipment-conflict').innerText(),/双手|卸下副手/);await noOverflow();
      for(let index=1;index<4;index++){await page.locator('.bag-category-tabs button').nth(index).click();await noOverflow();}
      await page.evaluate(()=>{state=freshState();state.tutorial.complete=true;state.tutorial.step='done';state.flags.braceletUnlocked=true;state.tab='char';state.charView='careers';state.careerView='main';render();});
      assert.equal(await page.locator('.rpg-route-selector').count(),3,'unassigned players can inspect all three directions');
      assert.match(await page.locator('.rpg-route-next').innerText(),/下一步/);await noOverflow();
      await page.evaluate(()=>{state.charView='skills';state.skillCatalogue=false;state.skillView='active';render();});
      assert.equal(await page.locator('.skill-library-card').count(),0);assert.match(await page.locator('.skill-detail-panel').innerText(),/这类能力还未学会/);
      await page.locator('.skill-loadout-slot').nth(2).click();await noOverflow();
      await page.evaluate(()=>{state.charView='careers';state.careerView='main';state.player.location=npcLocation('老乔');render();window.trainingApp=document.querySelector('#app');});
      await page.locator('.rpg-route-selector[data-career="bulwark"]').click();await page.getByRole('button',{name:'学习 见习盾卫',exact:true}).click();
      assert.deepEqual(await page.evaluate(()=>[state.meta.careers.main.id,state.inv.riotShield,skillUnlocked('shieldBash'),window.trainingApp===document.querySelector('#app')]),['noviceGuard',1,true,true],'early route learning grants its usable kit without replacing the app');await noOverflow();
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('RPG panel regression: four widths, learned/catalogue, one route detail, stable bag nodes and wear quantities passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
