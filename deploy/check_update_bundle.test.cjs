const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),helper=path.join(__dirname,'check_update_bundle.sh');
const native=fs.readFileSync(path.join(root,'android/app/src/main/java/com/exkalib/abyssalecho/BundleUpdater.java'),'utf8');
assert.match(native,/MAX_BUNDLE_BYTES = 160L \* 1024L \* 1024L/);
assert.match(fs.readFileSync(helper,'utf8'),/limit_bytes="\$\{2:-167772160\}"/,'publisher bound must agree with installed shell 11');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'abyss-update-limit-'));
try{
 const run=(file,limit)=>spawnSync('bash',[helper,path.join(dir,file),String(limit)],{encoding:'utf8'});
 fs.writeFileSync(path.join(dir,'valid.txt'),'valid payload');
 assert.equal(spawnSync('zip',['-q','valid.zip','valid.txt'],{cwd:dir}).status,0);
 assert.equal(run('valid.zip',1024).status,0,'valid package remains accepted');
 fs.writeFileSync(path.join(dir,'large.txt'),Buffer.alloc(4096,65));
 assert.equal(spawnSync('zip',['-q','-9','inflated.zip','large.txt'],{cwd:dir}).status,0);
 assert.ok(fs.statSync(path.join(dir,'inflated.zip')).size<1024);
 assert.notEqual(run('inflated.zip',1024).status,0,'small download must still reject oversized expanded bytes');
 assert.equal(spawnSync('zip',['-q','-0','stored.zip','large.txt'],{cwd:dir}).status,0);
 assert.notEqual(run('stored.zip',1024).status,0,'oversized download is rejected');
 assert.notEqual(run('missing.zip',1024).status,0);
 fs.writeFileSync(path.join(dir,'invalid.zip'),'not a ZIP');
 assert.notEqual(run('invalid.zip',1024).status,0);
 console.log('Release capacity gate: valid ZIP accepted; oversized download, inflated payload, invalid and missing ZIP rejected before upload.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
