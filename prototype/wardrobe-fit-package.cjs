// Packages already captured browser screenshots plus an EXPLICIT human review.
// This does not create a visual pass from an image-load or geometry test.
// node prototype/wardrobe-fit-package.cjs /tmp/full-audit /path/human-review.json /path/output
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const [sourceArg,reviewArg,destinationArg,gestureArg,gestureReviewArg]=process.argv.slice(2);
assert.ok(sourceArg&&reviewArg&&destinationArg,'usage: source-audit human-review.json destination');
assert.equal(Boolean(gestureArg),Boolean(gestureReviewArg),'gesture capture and its explicit Codex visual review must be supplied together');
const source=path.resolve(sourceArg),destination=path.resolve(destinationArg);
assert.notEqual(source,destination,'retain the original evidence separately');
const report=JSON.parse(fs.readFileSync(path.join(source,'report.json'),'utf8'));
const review=JSON.parse(fs.readFileSync(path.resolve(reviewArg),'utf8'));
assert.equal(report.scope,'full-catalog','a selected subset cannot be packaged as final full-catalog review');
assert.equal(report.items,124);assert.equal(report.records,248);assert.equal(report.results.length,248);
assert.equal(review.runtimeHash,report.runtimeHash,'human review must identify this exact renderer capture');
if(report.runtimeHashes)assert.deepEqual(review.runtimeHashes,report.runtimeHashes,'human review must also identify the hand, grip and body calibration versions');
assert.ok(review.reviewedBy&&review.reviewedAt,'human reviewer and review time must be recorded');
const verdicts=new Map(),groups=review.groups;
assert.ok(Array.isArray(groups)&&groups.length,'explicitly list visually reviewed item groups');
for(const group of groups){
 assert.ok(Array.isArray(group.items)&&group.items.length&&Array.isArray(group.sexes)&&group.sexes.length,'review groups must list their exact items and sexes');
 assert.ok(['pass','needs-fix'].includes(group.status)&&group.notes,'every reviewed group needs a real conclusion and notes');
 for(const id of group.items)for(const sex of group.sexes){const key=id+'-'+sex;assert.ok(!verdicts.has(key),'duplicate human verdict '+key);verdicts.set(key,{id,sex,status:group.status,notes:group.notes});}
}
const expected=new Set(report.results.map(row=>row.id+'-'+row.sex));
assert.equal(verdicts.size,expected.size,'every captured item and sex needs an explicit human verdict');
for(const key of verdicts.keys())assert.ok(expected.has(key),'uncaptured human verdict '+key);
if(fs.existsSync(destination))assert.equal(fs.readdirSync(destination).length,0,'destination must be empty; do not overwrite an earlier audit');
fs.mkdirSync(path.join(destination,'sheets'),{recursive:true});
const sheets=fs.readdirSync(path.join(source,'sheets')).filter(name=>/^[a-z]+-\d+\.png$/.test(name)).sort();
for(const sheet of sheets)fs.copyFileSync(path.join(source,'sheets',sheet),path.join(destination,'sheets',sheet));
const itemsBySlot=new Map();for(const row of report.results){if(!itemsBySlot.has(row.slot))itemsBySlot.set(row.slot,[]);const list=itemsBySlot.get(row.slot);if(!list.includes(row.id))list.push(row.id);}
const results=report.results.map(row=>{const index=itemsBySlot.get(row.slot).indexOf(row.id),sheet=row.slot+'-'+String(Math.floor(index/6)+1).padStart(2,'0')+'.png';assert.ok(sheets.includes(sheet),'missing browser evidence '+sheet);if(row.handDetailSheet)assert.ok(sheets.includes(path.basename(row.handDetailSheet)),'missing native hand closeup '+row.handDetailSheet);return {...row,image:'sheets/'+sheet,itemInSheet:index%6+1,originalPortrait:row.image,handDetail:row.handDetailSheet,originalHandDetail:row.handDetail,visualReview:verdicts.get(row.id+'-'+row.sex)};});
const unresolved=results.filter(row=>row.visualReview.status==='needs-fix');
const packaged={...report,originalEvidenceDirectory:source,packaging:'native browser contact sheets; large individual captures retained in original evidence directory',visualFit:unresolved.length?'needs-fix':'reviewed-pass',humanReview:{reviewedBy:review.reviewedBy,reviewedAt:review.reviewedAt,findings:review.findings||[],scope:review.scope||'single items, both sexes; combination checks recorded separately'},results};
fs.writeFileSync(path.join(destination,'report.json'),JSON.stringify(packaged,null,2));
fs.copyFileSync(path.resolve(reviewArg),path.join(destination,'human-review.json'));
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const status=unresolved.length?'仍有 '+unresolved.length+' 项待修':'248 项单件穿戴已逐图复核';
const rows=results.map(row=>'<tr><td>'+esc(row.id)+'</td><td>'+esc(row.name)+'</td><td>'+(row.sex==='male'?'男':'女')+'</td><td>'+esc(row.visualReview.status)+'</td><td>'+esc(row.visualReview.notes)+'</td><td><a href="'+esc(row.image)+'">第 '+row.itemInSheet+' 件</a></td></tr>').join('');
const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>装备装配最终验收</title><style>body{margin:0;padding:24px;background:#0b151e;color:#dcebf0;font:14px/1.7 system-ui,sans-serif}main{max-width:1160px;margin:auto}h1{font-size:25px}h2{font-size:18px}a{color:#64d3e8}section{margin:24px 0}section img{display:block;width:100%;height:auto;border:1px solid #294551}table{border-collapse:collapse;width:100%;font-size:12px}td,th{border:1px solid #294551;padding:8px;text-align:left}td:first-child{overflow-wrap:anywhere}.scroll{overflow:auto}small{color:#9eb8c6}</style><main><h1>装备装配最终验收</h1><p>'+esc(status)+'。原始截图由独立浏览器实际穿脱后截取；加载、数量守恒与接触点自动检测不代替人工视觉判断。</p><p><a href="report.json">逐项机器与人工记录</a> · <a href="human-review.json">人工复核原始记录</a></p><h2>本轮发现并处理的问题</h2><ul>'+(review.findings||[]).map(note=>'<li>'+esc(note)+'</li>').join('')+'</ul><p><small>分组图中“待人工复核”是捕获当时的水印；后续逐项复核结论见本页与报告，保留原图不篡改证据。</small></p>'+sheets.map(sheet=>'<section><h2>'+esc(sheet.slice(0,-4))+'</h2><img loading="lazy" src="sheets/'+sheet+'" alt="'+esc(sheet)+'"></section>').join('')+'<h2>逐项人工结论</h2><div class="scroll"><table><thead><tr><th>ID</th><th>装备</th><th>性别</th><th>结论</th><th>检查记录</th><th>证据</th></tr></thead><tbody>'+rows+'</tbody></table></div></main></html>';
let finalHtml=html.replace('<p>','<p>复核者：'+esc(review.reviewedBy)+'。这是 Codex 逐图目视复核，不代表用户或外部真人已验收。</p><p>');
if(gestureArg){
 const gestureSource=path.resolve(gestureArg),gesture=JSON.parse(fs.readFileSync(path.join(gestureSource,'report.json'),'utf8')),gestureReview=JSON.parse(fs.readFileSync(path.resolve(gestureReviewArg),'utf8'));
 assert.equal(gesture.scope,'all-hand-types');assert.equal(gesture.records.length,198);assert.equal(gesture.records.filter(row=>row.handDetail).length,132);assert.equal(gesture.blockedCombinations.length,44);
 assert.deepEqual(gesture.runtimeHashes,report.runtimeHashes,'single-item and gesture captures must use identical locked metadata');assert.deepEqual(gestureReview.runtimeHashes,gesture.runtimeHashes);
 assert.ok(gestureReview.reviewedBy&&gestureReview.reviewedAt);const handVerdicts=new Map();
 for(const group of gestureReview.groups){
  assert.ok(['pass','needs-fix'].includes(group.status)&&group.notes);
  for(const hand of group.hands)for(const sex of group.sexes){const key=hand+'-'+sex;assert.ok(!handVerdicts.has(key),'duplicate gesture review '+key);handVerdicts.set(key,{status:group.status,notes:group.notes});}
 }
 assert.equal(handVerdicts.size,22,'eleven hand types × both sexes need explicit visual conclusions');
 const gestureDestination=path.join(destination,'gestures');fs.mkdirSync(path.join(gestureDestination,'sheets'),{recursive:true});
 const gestureSheets=fs.readdirSync(path.join(gestureSource,'sheets')).filter(name=>name.endsWith('.png')).sort();assert.equal(gestureSheets.length,44);
 for(const sheet of gestureSheets)fs.copyFileSync(path.join(gestureSource,'sheets',sheet),path.join(gestureDestination,'sheets',sheet));
 const gestureRecords=gesture.records.map(row=>{const visualReview=handVerdicts.get(row.hand+'-'+row.sex);assert.ok(visualReview,'missing visual review '+row.hand+' '+row.sex);return {...row,image:'sheets/'+row.hand+'-'+(row.shield?'paired':'single')+'.png',handDetail:row.handDetail?'sheets/'+row.hand+'-'+row.sex+'-hand-details.png':undefined,originalPortrait:row.image,originalHandDetail:row.handDetail,visualReview};});
 const gestureStatus=gestureRecords.some(row=>row.visualReview.status==='needs-fix')?'needs-fix':'reviewed-pass';
 fs.writeFileSync(path.join(gestureDestination,'report.json'),JSON.stringify({...gesture,originalEvidenceDirectory:gestureSource,records:gestureRecords,visualFit:gestureStatus,visualReview:gestureReview},null,2));
 fs.copyFileSync(path.resolve(gestureReviewArg),path.join(gestureDestination,'visual-review.json'));
 const gestureHtml='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>手型与持物组合复核</title><style>body{margin:0;padding:24px;background:#0b151e;color:#dcebf0;font:14px/1.7 system-ui}main{max-width:1320px;margin:auto}a{color:#64d3e8}img{display:block;width:100%;margin-bottom:24px}h1{font-size:24px}h2{font-size:17px}</style><main><h1>198 姿势与 132 实装手部近景</h1><p>复核者：'+esc(gestureReview.reviewedBy)+'。本记录为 Codex 逐图目视复核，不代表用户或外部真人已验收。结果：'+esc(gestureStatus)+'。</p><p>裸手、9种完整手套与相位腕环，男女分别检查6种单件持物与3种合法配盾组合；44个双手武器配盾尝试应被正式规则拒绝，未绕过限制强装。</p><p><a href="../index.html">返回124件装备图册</a> · <a href="report.json">198项逐项记录</a> · <a href="visual-review.json">逐图复核说明</a></p><p>原生截图中的待复核水印是捕获时状态，未修改原图；后续Codex视觉结论见记录。原始大图在报告记载的独立临时证据目录。</p>'+gestureSheets.map(sheet=>'<h2>'+esc(sheet.slice(0,-4))+'</h2><img loading="lazy" src="sheets/'+sheet+'">').join('')+'</main></html>';
 fs.writeFileSync(path.join(gestureDestination,'index.html'),gestureHtml);
 finalHtml=finalHtml.replace('<h2>本轮发现并处理的问题</h2>','<p><a href="gestures/index.html">11种手部 · 198姿势 + 132实装近景与逐项记录</a></p><h2>本轮发现并处理的问题</h2>');
}
fs.writeFileSync(path.join(destination,'index.html'),finalHtml);
console.log('Packaged '+sheets.length+' unmodified browser contact sheets and '+results.length+' explicit human verdicts: '+destination);
