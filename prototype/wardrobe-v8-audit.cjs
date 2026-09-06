// Bounded visual capture matrix. Fresh test profiles only, no real save access.
// Does NOT grant visual acceptance; review the produced full-body and hand views.
const {spawn}=require('node:child_process');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {WEARABLE_SWORD_HANDS}=require('./wardrobe-sword-hands.js');
const melee=Object.entries(WEARABLE_GRIPS).filter(([,art])=>['blade','bar','staff'].includes(art.kind)).map(([id])=>id).join(',');
const jobs=[
  ...[...Object.keys(WEARABLE_SWORD_HANDS).filter(id=>id!=='bare'),'phaseGrip'].map(hand=>({name:hand,args:['--items',melee,'--handwear',hand,'--hand-details','--detail-scale','8'],output:'output/wardrobe-v8-melee-'+hand})),
  ...['base','bulwark','vanguard','infiltrator'].map(career=>({name:'clothes-'+career,args:['--slots','body,hands','--weapon','blade','--hand-details','--detail-scale','3',...(career==='base'?[]:['--career',career])],output:'output/wardrobe-v8-clothes-'+career}))
];
async function run(job){
 await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['prototype/wardrobe-fit-audit.browser.cjs',...job.args,'--require-contacts','--output',job.output],{stdio:['ignore','pipe','pipe'],env:process.env});
  let output='';child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{output+=chunk;});
  child.on('error',reject);child.on('exit',code=>{if(code!==0)reject(Error(job.name+' failed\n'+output));else{console.log(job.name+': capture/functional checks passed; visual review pending. '+job.output);resolve();}});
 });
}
async function worker(){while(jobs.length)await run(jobs.shift());}
Promise.all([worker(),worker()]).catch(error=>{console.error(error);process.exitCode=1;});
