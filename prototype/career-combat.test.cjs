const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

class Element {
  constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};this.dataset={};}
  appendChild(node){this.children.push(node);return node;}
  append(...nodes){this.children.push(...nodes);}
  addEventListener(){} removeEventListener(){} setAttribute(){} remove(){}
  querySelector(){return null;} querySelectorAll(){return [];}
}
const sandbox={console,Math:Object.create(Math),JSON,crypto:webcrypto,TextEncoder,TextDecoder,atob,btoa,
  document:{body:new Element(),getElementById:()=>new Element(),createElement:()=>new Element(),querySelector:()=>null,querySelectorAll:()=>[]},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}},addEventListener(){},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1};
vm.createContext(sandbox);
const source=fs.readFileSync(__dirname+'/game.js','utf8').replace(/\ninitLaunchGate\(\);\s*$/,'');
vm.runInContext(source+`\nrender=()=>{};log=()=>{};this.api={reset:()=>state=freshState(),getState:()=>state,ITEMS,SKILLS,JOBS,careerRecord,chooseJob,chooseNoviceJob,ensureCareerSkills,migrateCareerLoadout,mainCareerTrack,careerCombatProfile,careerEquipmentStatus,combatCareerState,gainCombatCharge,skillEquipmentStatus,skillUseStatus,skillUnlocked,skillLevelEffectText,skillResourceLabel,attackResource,equipSkill,startCombat,startBeacon,playerAttack,useSkill,approach,enemyTurn,performAttack,totalAtk,totalDef,statCritDmg,shieldMax,npcLocation};`,sandbox);
const a=sandbox.api;
function fresh(id='bulwark',level=5){const s=a.reset();s.meta.careers.main={id,level,xp:0};s.tutorial.complete=true;s.player.stamina=100;s.player.hp=10000;s.player.equip.weapon=id==='vanguard'?'pistol':'knife';if(id==='bulwark')s.player.equip.offhand='riotShield';s.inv.ammo=100;a.ensureCareerSkills();sandbox.Math.random=()=>.5;return s;}
function fight(s,extra={}){a.startCombat('guardian',{hp:100000,maxHp:100000,def:10,atk:5,range:1,distNow:1,spd:1,armorSegments:0,barrierEvery:0,regenPct:0,...extra});return s.combat;}
function slot(k){a.equipSkill(k,0);}

{
  const s=fresh();a.migrateCareerLoadout();assert.equal(s.inv.riotShield,1);a.migrateCareerLoadout();assert.equal(s.inv.riotShield,1,'旧档新手盾只能补发一次');
  s.skillSlots=[null,null,null];a.migrateCareerLoadout();assert.equal(s.skillSlots.filter(Boolean).length,0,'再次启动不得覆盖玩家主动留空的技能槽');
  s.meta.careers.main={id:'noviceGuard',level:3,xp:17};s.skills.shieldBash.prof=42;s.skillSlots=['shieldBash',null,null];s.flags.job_bulwark_qualified=true;
  a.chooseJob('bulwark');assert.equal(s.meta.careers.main.level,3);assert.equal(s.meta.careers.main.xp,17);assert.equal(s.skills.shieldBash.prof,42);assert.equal(s.skillSlots[0],'shieldBash');assert.ok(s.skillSlots.includes('kineticBrace'));assert.equal(s.inv.riotShield,1);
  s.flags.job_vanguard_qualified=true;s.inv.reclassCore=1;a.chooseJob('vanguard');assert.equal(s.meta.careers.main.id,'vanguard');assert.ok(!s.skillSlots.includes('shieldBash'));assert.ok(!s.skillSlots.includes('kineticBrace'));assert.equal(s.inv.reclassCore,0);
}
{
  const s=a.reset();s.tutorial.complete=true;s.player.location=a.npcLocation('老乔');a.chooseNoviceJob('noviceGuard');assert.equal(a.mainCareerTrack(),'bulwark');assert.equal(s.inv.riotShield,1);assert.ok(s.skillSlots.includes('shieldBash'));a.chooseNoviceJob('noviceGuard');assert.equal(s.inv.riotShield,1,'重复导师交互不可重复领盾');
}
for(const id of ['noviceGuard','noviceScout','noviceStriker']){
  const s=a.reset();s.player.location='camp';a.chooseNoviceJob(id);assert.equal(a.careerRecord('main'),null,'序章未结束不能跳过教学选主职');
  s.tutorial.complete=true;s.player.location='outer';a.chooseNoviceJob(id);assert.equal(a.careerRecord('main'),null,'不在导师现场不能远程入门');
  s.player.location=a.npcLocation('老乔');let refreshed=0;a.chooseNoviceJob(id,()=>refreshed++);assert.equal(a.careerRecord('main').id,id,'三个基础路线都必须能在地表教学阶段学习，无需救出中期 NPC');assert.equal(refreshed,1);
}
{
  const s=fresh();s.checkpoint={inv:{},meta:JSON.parse(JSON.stringify(s.meta))};a.migrateCareerLoadout();assert.equal(s.checkpoint.inv.riotShield,1);assert.equal(s.checkpoint.meta.careerStarterKits.bulwark,true);s.inv=JSON.parse(JSON.stringify(s.checkpoint.inv));s.meta=JSON.parse(JSON.stringify(s.checkpoint.meta));a.migrateCareerLoadout();assert.equal(s.inv.riotShield,1,'检查点恢复领取状态后不能重复补发新手盾');
}
{
  const s=fresh();s.player.equip.weapon='pistol';s.player.equip.offhand=null;const c=fight(s);slot('shieldBash');const stamina=s.player.stamina,ammo=s.inv.ammo,enemy=c.hp;
  assert.equal(a.skillUseStatus('shieldBash').ok,false);assert.match(a.skillUseStatus('shieldBash').text,/实体盾/);a.useSkill('shieldBash');assert.equal(s.player.stamina,stamina);assert.equal(s.inv.ammo,ammo);assert.equal(c.hp,enemy);
  s.player.equip.offhand='riotShield';assert.equal(a.skillUseStatus('shieldBash').ok,true);a.useSkill('shieldBash');assert.equal(s.player.stamina,stamina-3);assert.equal(s.inv.ammo,ammo,'手枪配盾释放盾技只能扣体力');
  c.distNow=8;slot('kineticBrace');assert.equal(a.skillUseStatus('kineticBrace').ok,true,'架盾不需要进入武器射程');const hp=c.hp;a.useSkill('kineticBrace');assert.equal(c.hp,hp,'防御架势不应隐式射击');assert.ok(c.roleCharge>=2);assert.equal(s.inv.ammo,ammo);
}
{
  const s=fresh('vanguard',1),c=fight(s,{empTurns:20});a.playerAttack();assert.equal(c.roleCharge,1);a.playerAttack();a.playerAttack();a.playerAttack();assert.equal(c.roleCharge,3,'充能最多三格');
  c.roleCharge=0;sandbox.Math.random=()=>1;a.playerAttack();assert.equal(c.roleCharge,0,'攻击落空不能充能');
  s.player.equip.weapon='knife';sandbox.Math.random=()=>.5;a.playerAttack();assert.equal(c.roleCharge,0,'游骑不能用刃器蓄锁定');
  s.player.equip.weapon='pistol';s.meta.careers.main.level=3;slot('tacticalScan');c.def=100;a.useSkill('tacticalScan');assert.equal(c.roleCharge,2,'Lv3 被动使有效扫描积攒两格');c.roleCharge=0;c.def=0;a.useSkill('tacticalScan');assert.equal(c.roleCharge,0,'扫描已无防御的目标不得免费充能');
}
{
  const s=fresh('infiltrator'),c=fight(s,{distNow:5,empTurns:20});a.approach();assert.equal(c.roleCharge,1);c.distNow=1;const turns=c.playerTurns,stamina=s.player.stamina;a.approach();assert.equal(c.playerTurns,turns);assert.equal(s.player.stamina,stamina);assert.equal(c.roleCharge,1,'无效接近不消费也不充能');
  slot('heavyBlow');a.useSkill('heavyBlow');assert.equal(c.roleCharge,3,'Lv3 重击被动命中积攒两格');
  c.roleCharge=0;c.empTurns=0;c.distNow=1;sandbox.Math.random=()=>0;a.enemyTurn();assert.equal(c.roleCharge,1,'有效闪避积攒相位');
}
{
  const s=fresh(),c=fight(s,{atk:80});c.roleCharge=0;s.player.shield=a.shieldMax();a.enemyTurn();assert.equal(c.roleCharge,1,'持实体盾有效吸收伤害积攒动能');
  c.roleCharge=0;s.player.equip.offhand=null;s.player.shield=100;a.enemyTurn();assert.equal(c.roleCharge,0,'只有能量护盾而无盾牌不可积攒动能');
}
{
  const s=fresh(),c=fight(s,{empTurns:20});slot('shieldBash');a.useSkill('shieldBash');assert.equal(c.roleCharge,1,'有效盾击也积攒动能，不能只靠被打或反复空架盾');
  c.roleCharge=0;sandbox.Math.random=()=>1;a.useSkill('shieldBash');assert.equal(c.roleCharge,0,'盾击落空不蓄动能');
  const damage=[];for(const shield of ['riotShield','citadelShield']){s.player.equip.offhand=shield;const next=fight(s,{empTurns:20});slot('kineticReprisal');next.roleCharge=3;sandbox.Math.random=()=>.5;const hp=next.hp;a.useSkill('kineticReprisal');damage.push(hp-next.hp);}assert.ok(damage[1]>damage[0]*1.5,'高阶盾必须显著强化盾反，不能被主手攻击力分支吞掉盾甲收益');
}
for(const [id,key] of [['bulwark','kineticReprisal'],['vanguard','overloadVolley'],['infiltrator','riftExecution']]){
  const s=fresh(id,4);assert.equal(a.skillUnlocked(key),false);s.meta.careers.main.level=5;a.ensureCareerSkills();assert.equal(a.skillUnlocked(key),true);
  const c=fight(s,{empTurns:20});slot(key);c.roleCharge=2;const ammo=s.inv.ammo,stamina=s.player.stamina,hp=c.hp;a.useSkill(key);assert.equal(s.inv.ammo,ammo);assert.equal(s.player.stamina,stamina);assert.equal(c.hp,hp);assert.equal(c.roleCharge,2);
  c.roleCharge=3;a.useSkill(key);assert.equal(c.roleCharge,0);assert.ok(c.hp<hp);if(id==='vanguard'){assert.equal(s.inv.ammo,ammo-3);assert.equal(c.distNow,3);}if(id==='bulwark')assert.equal(c.interruptTurns,0,'盾反命中应让敌人立即失去一次行动');
}
{
  const damages=[];for(const def of [0,100000]){const s=fresh('infiltrator'),c=fight(s,{def,empTurns:20});slot('phaseStrike');const hp=c.hp;a.useSkill('phaseStrike');damages.push(hp-c.hp);}assert.equal(damages[0],damages[1],'完全穿甲必须忽略全部护甲，不能残留 5%');
}
{
  const s=fresh(),c=fight(s,{atk:10,empTurns:1});slot('kineticReprisal');c.roleCharge=3;sandbox.Math.random=()=>1;a.useSkill('kineticReprisal');assert.equal(c.interruptTurns||0,0,'盾反落空不可打断');assert.equal(c.roleCharge,0,'终结技落空仍须消耗已承诺的充能');
  assert.match(a.skillResourceLabel(a.SKILLS.kineticReprisal),/体力 4.*动能 3/);assert.match(a.skillLevelEffectText('kineticBrace'),/恢复.*护盾/);assert.doesNotMatch(a.skillLevelEffectText('kineticBrace'),/倍伤害/);
  const symbols=fs.readFileSync(__dirname+'/index.html','utf8');['kinetic-reprisal','overload-volley','rift-execution'].forEach(id=>assert.ok(symbols.includes('id="icon-skill-'+id+'"'),'新终结技必须有独立图标：'+id));
}
{
  const s=fresh('vanguard'),c=fight(s);c.roleCharge=3;fight(s);assert.equal(s.combat.roleCharge,0);delete s.combat.roleCharge;assert.equal(a.combatCareerState().charge,0);s.combat.roleCharge='bad';a.migrateCareerLoadout();assert.equal(s.combat.roleCharge,0,'旧战斗充能字段必须规范为有限数字');
  s.combat=null;s.inv.signalCell=2;a.startBeacon(1);assert.ok(s.combat.beacon);assert.equal(s.combat.roleCharge,0,'信标战斗也必须从零充能开始');
}
for(const id of ['vanguard','infiltrator']){
  const s=fresh(id),c=fight(s,{barrier:10000,empTurns:20}),hp=c.hp;
  for(let i=0;i<3;i++)a.playerAttack();assert.equal(c.hp,hp);assert.ok(c.barrier<10000);assert.equal(c.roleCharge,3,'有效命中并削减敌人屏障必须积攒职业充能：'+id);
  c.roleCharge=0;const barrier=c.barrier;sandbox.Math.random=()=>1;a.playerAttack();assert.equal(c.barrier,barrier);assert.equal(c.roleCharge,0,'对屏障攻击落空也不得积攒充能');
  if(id==='infiltrator'){sandbox.Math.random=()=>.5;slot('heavyBlow');a.useSkill('heavyBlow');assert.equal(c.roleCharge,2,'刃器重击削减屏障也必须触发 Lv3 充能被动');}
}
{
  const s=fresh('bulwark');s.player.shield=0;s.inv.signalCell=0;a.startBeacon(1);assert.equal(s.combat,null);assert.equal(s.player.shield,0,'信标不足时不能免费补充护盾');
  s.inv.signalCell=2;const stamina=s.player.stamina,cap=a.shieldMax();a.startBeacon(1);assert.equal(s.player.shield,cap,'成功进入信标必须与普通战斗一样补满护盾');assert.equal(s.inv.signalCell,1);assert.equal(s.player.stamina,stamina,'信标护盾初始化不能增加体力消耗');
}
{
  const s=fresh('vanguard');s.player.equip.weapon='vacuumCarbine';s.inv.weaponCell=100;const c=fight(s,{empTurns:20});slot('pulseBurst');a.useSkill('pulseBurst');assert.equal(s.inv.weaponCell,96);assert.match(a.SKILLS.pulseBurst.desc,/2 次射击所需弹药/);assert.match(a.skillResourceLabel(a.SKILLS.pulseBurst),/×4/);
  c.roleCharge=3;slot('overloadVolley');a.useSkill('overloadVolley');assert.equal(s.inv.weaponCell,90);assert.match(a.SKILLS.overloadVolley.desc,/3 次射击所需弹药/);assert.match(a.skillResourceLabel(a.SKILLS.overloadVolley),/×6/);
}
console.log('Career combat regression tests passed.');
