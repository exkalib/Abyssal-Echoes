// Disposable browser contexts: isolated local saves, no cloud requests.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try{
    for(const viewport of [{width:360,height:640},{width:390,height:844}]){
      const page=await browser.newPage({viewport}),errors=[],externalRequests=[];
      page.setDefaultTimeout(10000);
      page.on('pageerror',error=>{if((process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&error.message==="Cannot read properties of undefined (reading 'getTopURL')"&&!error.stack.includes('http'))return;errors.push(error.stack);});
      await page.route('**/*',route=>{
        const url=route.request().url();
        if(/^https?:/.test(url)&&(!url.startsWith('http://127.0.0.1:4187/')||url.includes('/.netlify/functions/'))){const browserTelemetry=(process.env.BROWSER_EXECUTABLE||'').includes('/Quark.app/')&&/^https:\/\/(?:px\.effirst\.com|g\.alicdn\.com)\//.test(url);if(!browserTelemetry)externalRequests.push(url);return route.abort();}
        return route.continue();
      });
      await page.goto('http://127.0.0.1:4187/');
      await page.evaluate(()=>{
        prepareLocalGame();state=freshState();state.tutorial={version:1,step:'done',complete:true};
        Object.assign(state.flags,{mapUnlocked:true,braceletUnlocked:true});
        state.sound=false;state.music=false;state.vibration=false;state.soundVolume=.5;
        state.playerAppearance='male';state.meta.playerAppearance='male';state.player.location='camp';
        state.quests={first_fire:'active',spore:'active'};state.tab='task';
        taskBoardView='active';taskFocusId=null;
        render();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');
        const app=document.querySelector('#app');app.inert=false;app.removeAttribute('aria-hidden');
      });
      const verify=async label=>{
        const issues=await page.evaluate(()=>{
          const result=[],panel=document.querySelector('#panel');
          if(panel.scrollWidth>panel.clientWidth+1)result.push('panel horizontal overflow');
          if(panel.scrollHeight>panel.clientHeight+1)result.push('page scrolled instead of its content');
          if(document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1)result.push('document overflow');
          for(const node of document.querySelectorAll('#panel button,#panel summary,#panel input,#tabbar button')){
            const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
            if(!rect.width||!rect.height||style.visibility==='hidden'||node.closest('[hidden]'))continue;
            const collapsed=[...document.querySelectorAll('#panel details:not([open])')].find(parent=>parent.contains(node)&&parent.querySelector('summary')!==node);
            if(collapsed)continue;
            if(node.offsetWidth<44||node.offsetHeight<44)result.push(node.className+' '+node.textContent.trim().slice(0,28)+' target '+node.offsetWidth+'×'+node.offsetHeight);
          }
          return result;
        });
        assert.deepEqual(issues,[],label+' '+viewport.width+'×'+viewport.height);
      };
      const shot=async name=>{if(process.env.UI_QA_DIR)await page.screenshot({path:process.env.UI_QA_DIR+'/'+name+'-'+viewport.width+'.png'});};
      await verify('tasks');await shot('tasks');
      assert.equal(await page.locator('.task-focus-details').evaluate(node=>node.open),false);
      assert.equal(await page.locator('.task-queue-disclosure').evaluate(node=>node.open),false);
      await page.locator('.task-focus-details>summary').click();
      assert.equal(await page.locator('.task-focus-meta').isVisible(),true);
      await verify('task reward details');
      await page.locator('.task-focus-details>summary').click();
      await page.locator('.task-queue-disclosure>summary').click();
      await page.evaluate(()=>window.taskRefs={nav:document.querySelector('.task-board-nav'),body:document.querySelector('.task-board-body'),focus:document.querySelector('.task-focus'),rows:[...document.querySelectorAll('.task-queue-card')]});
      await page.locator('.task-queue-card[data-task-id="spore"]').click();
      assert.equal(await page.locator('.task-focus').getAttribute('data-task-id'),'spore');
      assert.equal(await page.evaluate(()=>window.taskRefs.nav===document.querySelector('.task-board-nav')&&window.taskRefs.body===document.querySelector('.task-board-body')&&window.taskRefs.focus===document.querySelector('.task-focus')&&window.taskRefs.rows.every((row,index)=>row===document.querySelectorAll('.task-queue-card')[index])),true,'tracking retains the task structure and rows');
      await page.locator('.task-queue-card[data-task-id="spore"]').click();
      assert.equal(await page.locator('.task-queue-card[data-task-id="spore"]').getAttribute('aria-pressed'),'true');
      for(const view of ['main','archive','active']){
        await page.locator('[data-task-view="'+view+'"]').click();
        assert.equal(await page.evaluate(()=>window.taskRefs.nav===document.querySelector('.task-board-nav')&&window.taskRefs.body===document.querySelector('.task-board-body')),true,'task tabs keep their mounted navigation and scroll body');
        await verify('task '+view);
      }

      await page.locator('#set-btn').click();await verify('settings');await shot('settings');
      assert.equal(await page.locator('.settings-volume input').evaluateAll(inputs=>inputs.every(input=>input.offsetWidth>=120)),true,'volume tracks need enough width for touch adjustment');
      await page.evaluate(()=>window.settingsRefs={dashboard:document.querySelector('.settings-dashboard'),media:document.querySelector('.settings-media'),sound:document.querySelector('.settings-switch[data-label="游戏音效"]'),volume:document.querySelector('.settings-volume input'),appearance:document.querySelector('.settings-appearance-options')});
      await page.locator('.settings-switch[data-label="游戏音效"]').click();
      assert.equal(await page.evaluate(()=>state.sound),true);
      await page.locator('.settings-volume input').first().evaluate(input=>{input.value='65';input.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.locator('.settings-switch[data-label="游戏音效"]').click();
      for(const appearance of ['female','male','female']){
        await page.locator('[data-appearance="'+appearance+'"]').click();
        assert.equal(await page.evaluate(()=>state.playerAppearance),appearance);
      }
      assert.deepEqual(await page.evaluate(()=>({sound:state.sound,volume:state.soundVolume,appearance:state.playerAppearance,stored:JSON.parse(localStorage.getItem('abyss_echo_v2')).playerAppearance})),{sound:false,volume:.65,appearance:'female',stored:'female'});
      assert.equal(await page.evaluate(()=>window.settingsRefs.dashboard===document.querySelector('.settings-dashboard')&&window.settingsRefs.media===document.querySelector('.settings-media')&&window.settingsRefs.sound===document.querySelector('.settings-switch[data-label="游戏音效"]')&&window.settingsRefs.volume===document.querySelector('.settings-volume input')&&window.settingsRefs.appearance===document.querySelector('.settings-appearance-options')),true,'settings controls retain their nodes');
      await page.locator('.settings-version>summary').click();
      assert.equal(await page.locator('#check-update-btn').isVisible(),true);
      await verify('settings update details');
      await page.locator('.settings-version>summary').click();
      await page.locator('.settings-danger>summary').click();
      await page.locator('.settings-reset').click();
      assert.equal(await page.getByRole('button',{name:'确认清空并重看序章',exact:true}).count(),1);
      await page.getByRole('button',{name:'取消',exact:true}).click();
      assert.equal(await page.evaluate(()=>state.playerAppearance),'female','cancelling restart must retain progress');
      await page.locator('.settings-storage-entry').click();await verify('cloud save overview');await shot('cloud-save');
      assert.equal(await page.locator('.cloud-save-card').count(),1);assert.equal(await page.locator('.local-backup-card').count(),1);
      await page.locator('#cloud-code-input').fill('2345-6789-ABCD-EFGH-JKLM-NPQR');
      await page.getByRole('button',{name:'导出备份',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'加密并生成备份',exact:true}).count(),1);
      await page.getByRole('button',{name:'取消',exact:true}).click();
      assert.equal(await page.locator('#cloud-code-input').inputValue(),'2345-6789-ABCD-EFGH-JKLM-NPQR','closing backup must preserve transfer input');
      await page.evaluate(()=>{cloudBinding={code:'2345-6789-ABCD-EFGH-JKLM-NPQR',revision:2,updatedAt:1788500000,dirty:false};render();});
      assert.equal(await page.locator('.cloud-more').evaluate(node=>node.open),false);
      await page.locator('.cloud-more>summary').click();await verify('cloud history disclosure');
      await page.evaluate(()=>{cloudUi.history=[{revision:2,savedAt:1788500000},{revision:1,savedAt:1788400000}];cloudUi.preview={revision:2,save:JSON.parse(JSON.stringify(state))};render();});
      await verify('cloud history and preview');await shot('cloud-preview');
      await page.getByRole('button',{name:'返回设置',exact:true}).click();
      assert.equal(await page.evaluate(()=>state.playerAppearance),'female');
      assert.equal(await page.locator('.settings-volume input').first().inputValue(),'65');
      assert.deepEqual(externalRequests,[],'settings/cloud overview never connects by itself');
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('Tasks/settings: two phone sizes, compact disclosures, stable task navigation and tracking, in-place audio/appearance, persisted preferences, safe reset cancellation and offline cloud overview passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
