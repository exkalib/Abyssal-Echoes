// Isolated profile and generated save only. Native picker callbacks are mocked.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const url=process.env.RPG_TEST_URL||'http://127.0.0.1:4195/';
 await page.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(url)?r.abort():r.continue());
 await page.goto(url);
 await page.evaluate(async()=>{prepareLocalGame();state=freshState();document.querySelector('#launch-screen')?.remove();document.body.classList.remove('launch-pending');document.querySelector('#app').inert=false;document.querySelector('#app').removeAttribute('aria-hidden');window.testBackup=await createLocalBackup('backup-test-password');showLocalExportResult(testBackup);});
 const save=page.getByRole('button',{name:'保存备份文件',exact:true});
 const downloadPromise=page.waitForEvent('download');await save.click();const download=await downloadPromise;
 assert.match(download.suggestedFilename(),/\.encrypted\.json$/);
 assert.match(await page.locator('.save-transfer-result').innerText(),/无法确认/);
 await page.evaluate(()=>{window.AbyssApp={};});await save.click();
 assert.match(await page.locator('.save-transfer-result').innerText(),/新版 APK/);
 for(const status of ['cancel','error','saved']){
  await page.evaluate(status=>{window.AbyssApp={backupFile:(id,action,text)=>{if(action!=='save'||text!==testBackup)throw Error('Wrong backup');setTimeout(()=>onAbyssBackupResult(id,status,status==='saved'?'已保存到所选位置：test.json':status==='error'?'存储空间不足':'已取消'),20);}};},status);
  await save.click();await page.waitForFunction(()=>!document.querySelector('.save-transfer-actions .primary').disabled);
  assert.match(await page.locator('.save-transfer-result').innerText(),status==='saved'?/已保存/:status==='error'?/空间不足/:/已取消/);
 }
 await page.evaluate(()=>{window.AbyssApp={backupFile:(id,action)=>{if(action!=='open')throw Error('Wrong action');setTimeout(()=>onAbyssBackupResult(id,'loaded',testBackup),20);}};openLocalImport('');});
 await page.locator('.backup-file-control').click();await page.waitForFunction(()=>document.querySelector('.backup-import-card textarea').value.length>100);
 await page.getByLabel('备份密码',{exact:true}).fill('backup-test-password');
 await page.getByRole('button',{name:'解密并校验',exact:true}).click();
 await page.getByRole('button',{name:'确认覆盖本机存档',exact:true}).waitFor();
 assert.match(await page.locator('.save-transfer-result').innerText(),/备份有效/);
 // Do not click overwrite: verification must not install or reload any save.
 assert.equal(await page.evaluate(()=>backupFileRequests.size),0);
 console.log('Backup files: browser download, old shell, native save/cancel/error/retry and import/decrypt preview passed (native callbacks mocked).');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
