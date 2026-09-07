// Read-only package contract. Never builds, signs, uploads, or runs deploy scripts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const scripts=['wardrobe-fit.js','wardrobe-grips.js','wardrobe-hands.js','wardrobe-trigger-hands.js','wardrobe-sword-hands.js','wardrobe-weapon-poses.js','wardrobe-weapon-art.js','wardrobe-weapon-effects.js','wardrobe-hand-effects.js','wardrobe-fx.js','wardrobe.js'];
const styles=['style.css','ui-system.css','story-scenes.css','wardrobe-fx.css'];
const payload=['index.html',...styles,...scripts,'game.js'];
const artDirs=['garden-crops-v1','item-art-v2','equipment-art-v3','wearables-v1','wearables-v2','wearables-v12','weapon-poses-v11','hands-v12'];
const gradle=read('android/app/build.gradle'),prepare=read('deploy/prepare_netlify_release.sh'),publish=read('deploy/publish_android_update.sh');
const errors=[],check=(condition,message)=>{if(!condition)errors.push(message);};
for(const file of payload)check(fs.existsSync(path.join(__dirname,file)),'missing real runtime file: '+file);
for(const directory of artDirs){const absolute=path.join(__dirname,'assets',directory);check(fs.existsSync(absolute)&&fs.statSync(absolute).isDirectory(),'missing real asset directory: '+directory);}
for(const entry of ['index.html','wardrobe-preview.html']){
 const html=read('prototype/'+entry),loadedScripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(m=>m[1].split('?')[0]);
 const loadedStyles=[...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/g)].map(m=>m[1].split('?')[0]);
 for(const file of scripts)check(loadedScripts.includes(file),entry+' does not load '+file);
 for(const file of entry==='index.html'?styles:['ui-system.css','wardrobe-fx.css'])check(loadedStyles.includes(file),entry+' does not load '+file);
 check(loadedScripts.indexOf('wardrobe-fx.js')>=0&&loadedScripts.indexOf('wardrobe-fx.js')<loadedScripts.indexOf('wardrobe.js'),entry+' must load shared FX before its wardrobe hook');
}
const androidIncludes=new Set([...gradle.matchAll(/"([^"\n]+\.(?:js|css|html))"/g)].map(m=>m[1]));
for(const file of payload)check(androidIncludes.has(file),'Android bundled-web manifest omits '+file);
check(gradle.includes('"assets/**"'),'Android must recursively include new wearable assets');
const prepareCopy=new Set([...prepare.matchAll(/\$root_dir\/prototype\/([^"\n]+\.(?:js|css|html))/g)].map(m=>m[1]));
const prepareZip=prepare.match(/\(cd "\$payload_dir" && zip[^\n]+\)/)?.[0]||'';
for(const file of payload){check(prepareCopy.has(file),'prepare copy omits '+file);check(prepareZip.split(/\s+/).includes(file),'prepare zip omits '+file);}
check(prepare.includes('cp -R "$root_dir/prototype/assets/." "$payload_dir/assets/"'),'prepare payload must recursively include wearables-v12 and prior assets');
const publishCopy=publish.split('\n').find(line=>line.startsWith('cp "$root_dir/prototype/index.html"'))||'';
const bundleFiles=(publish.match(/bundle_files=\(([^)]+)\)/)?.[1]||'').split(/\s+/);
const uploadFiles=(publish.match(/for file in ([^;\n]+); do\n\s+scp/)?.[1]||'').split(/\s+/);
const installedDependencies=(publish.match(/"for file in ([^;\n]+); do chmod/)?.[1]||'').split(/\s+/);
for(const file of payload){
 check(publishCopy.includes('$root_dir/prototype/'+file+'"'),'publish payload copy omits '+file);check(bundleFiles.includes(file),'publish ZIP list omits '+file);check(uploadFiles.includes(file),'web .new upload list omits '+file);
 check(installedDependencies.includes(file)||publish.includes("mv '$web_dir/"+file+".new' '$web_dir/"+file+"'"),'server final install/mv omits '+file);
}
check(publish.includes("mv '$web_dir/wardrobe-fx.css.new' '$web_dir/wardrobe-fx.css'"),'FX CSS must be installed, not stranded as .new');
check(uploadFiles.at(-1)==='index.html','entry point uploads last after resources');
check(publish.includes('cp -R "$root_dir/prototype/assets" "$payload_dir/assets"'),'full updates include all new art');
const leanLists=[...publish.matchAll(/for art_dir in ([^;\n]+); do/g)].map(m=>m[1].split(/\s+/));
check(leanLists.length===2,'both lean ZIP and lean web sync must have asset manifests');
for(const files of leanLists)for(const directory of artDirs)check(files.includes(directory),'lean assets omit '+directory);
const legacyFiles=(publish.match(/legacy_shell_assets=\(([\s\S]*?)\)/)?.[1]||'').trim().split(/\s+/);
for(const file of ['loadout-male-v2.png','loadout-female-v2.png','building-art-v1/garden-v2.png',...['bulwark','vanguard','infiltrator'].flatMap(job=>['male','female'].map(sex=>'career-portraits-v1/'+job+'-'+sex+'.png')),...['arsenalWarden','echoLeviathan','riftMatriarch'].map(id=>'enemy-portraits-v1/'+id+'.png')])check(legacyFiles.includes(file)&&fs.existsSync(path.join(__dirname,'assets',file)),'old shell direct update misses '+file);
check((publish.match(/for art_file in "\$\{legacy_shell_assets\[@\]\}"/g)||[]).length===2,'legacy additions must be present in both ZIP and web sync');
for(const [name,source]of [['prepare',prepare],['publish',publish]]){
 const guard=source.indexOf('bash "$root_dir/deploy/check_update_bundle.sh" "$work_dir/$bundle"');
 check(guard>0&&guard<source.indexOf('openssl dgst'),name+' must reject oversized ZIP and expanded payload before signing/upload');
}
assert.deepEqual(errors,[],'v12 runtime and packaging entry points must be complete');
console.log('Wardrobe v12 package: index + preview scripts/styles, Android assets, prepare copy/ZIP, full/lean payload, lean web art and final JS/CSS install manifests passed (read-only).');
