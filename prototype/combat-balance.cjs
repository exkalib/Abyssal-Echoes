// Deterministic real-combat simulation. Only presentation and terminal victory/death
// side effects are replaced; attacks, resources, shields, AI and skill rules are real.
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
class NodeStub{
 constructor(){this.children=[];this.dataset={};this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};}
 appendChild(n){this.children.push(n);return n;} append(...n){this.children.push(...n);} setAttribute(){} addEventListener(){} removeEventListener(){} remove(){} querySelector(){return null;} querySelectorAll(){return [];}
}
function simulation(){
 const math=Object.create(Math),sandbox={console,Math:math,JSON,crypto:webcrypto,TextEncoder,TextDecoder,atob,btoa,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,addEventListener(){},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{body:new NodeStub(),getElementById:()=>new NodeStub(),createElement:()=>new NodeStub(),querySelector:()=>null,querySelectorAll:()=>[]}};
 vm.createContext(sandbox);
 const source=fs.readFileSync(__dirname+'/game.js','utf8').replace(/\ninitLaunchGate\(\);\s*$/,'');
 vm.runInContext(source+`\nrender=()=>{};log=()=>{};winCombat=()=>{state.combat.result='win';};die=()=>{state.combat.result='loss';};exhaustionDeath=()=>{state.combat.result='loss';};this.api={EQUIPMENT_SERIES,EQUIPMENT_EXPANSION,EQUIPMENT_CORE_STATS,EQUIPMENT_SERIES_PATHS,BEACON_EQUIPMENT,SETTLEMENT_SHOP,settlementBuyPrice,settlementSellTerms,equipmentProgression,equipmentRecycleYield,clampEquipmentResources,statTags,bagEquipmentComparison,targetEquipmentDamagePct,eqSum,statCrit,statCritDmg,statHit,statDodge,statPen,statLS,baseSpd,moveRange,ITEMS,ENEMIES,COMBAT_ERAS,TECHS,TECH_FOR_RECIPE,RECIPES,GENE_NODES,SKILLS,geneGateChecks,reset:()=>state=freshState(),startCombat,playerAttack,useSkill,approach,catchBreath,combatItem,ensureCareerSkills,skillUseStatus,skillUnlocked,shieldMax,maxHp,maxStamina,totalAtk,totalDef,atkRange,attackResource,careerEquipmentStatus,combatCareerState};`,sandbox);
 return {a:sandbox.api,seed(value){let n=value>>>0;math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};}};
}
const STAGES=[
 {era:1,level:5,bossLevel:8,careerLevel:1,mastery:0,genes:[],common:{head:'helmet',body:'vest',hands:'workGloves',legs:'fieldGreaves',feet:'boots'},weapons:['knife','pistol','knife'],shield:'riotShield'},
 {era:2,level:12,careerLevel:3,mastery:3,novice:['infiltrator'],genes:['g1_core'],common:{head:'scope',body:'power',hands:'servoGauntlet',legs:'fieldGreaves',feet:'magboots',back:'capacitorPack',implant:'lsChip',module:'critCore'},weapons:['eblade','rifle','eblade'],shield:'eshieldUnit'},
 {era:3,level:18,careerLevel:5,mastery:5,genes:['g1_core','g2_muscle'],common:{head:'scope',body:'nanoSuit',hands:'nanoWeaveGloves',legs:'miningHarness',feet:'gravityBoots',back:'gravRig',implant:'lsChip',module:'penMod'},weapons:['plasmaSaber','plasmaRifle','plasmaSaber'],shield:'eshieldUnit'},
 {era:4,level:24,careerLevel:6,mastery:8,genes:['g1_core','g2_muscle','g2_neural'],common:{head:'quantumVisor',body:'starShell',hands:'phaseGrip',legs:'phaseGreaves',feet:'gravityBoots',back:'gravRig',implant:'neuralMesh',module:'echoMemory'},weapons:['phaseBlade','swarmRifle','phaseBlade'],shield:'phaseShield'},
 {era:5,level:30,careerLevel:8,mastery:12,genes:['g1_core','g2_muscle','g2_neural','g2_adapt'],common:{head:'quantumVisor',body:'starShell',hands:'phaseGrip',legs:'phaseGreaves',feet:'gravityBoots',back:'gravRig',implant:'neuralMesh',module:'echoMemory'},weapons:['voidBlade','vacuumCarbine','voidBlade'],shield:'phaseShield'},
 {era:6,level:36,careerLevel:9,mastery:16,genes:['g1_core','g2_muscle','g2_neural','g2_adapt'],common:{head:'quantumVisor',body:'exoShell',hands:'phaseGrip',legs:'phaseGreaves',feet:'gravityBoots',back:'gravRig',implant:'neuralMesh',module:'echoMemory'},weapons:['voidBlade','vacuumCarbine','voidBlade'],shield:'citadelShield'},
 {era:7,level:42,careerLevel:10,mastery:20,genes:['g1_core','g2_muscle','g2_neural','g2_adapt'],common:{head:'quantumVisor',body:'exoShell',hands:'phaseGrip',legs:'phaseGreaves',feet:'gravityBoots',back:'gravRig',implant:'neuralMesh',module:'echoMemory'},weapons:['voidBlade','vacuumCarbine','voidBlade'],shield:'citadelShield'},
];
const ROLES=['bulwark','vanguard','infiltrator'];
const LOADOUTS={bulwark:['shieldBash','kineticBrace','kineticReprisal'],vanguard:['tacticalScan','pulseBurst','overloadVolley'],infiltrator:['heavyBlow','phaseStrike','riftExecution']};
function configure(a,stage,role,{training=true}={}){
 const state=a.reset();state.tutorial.complete=true;state.player.level=stage.level;state.meta.careers.main={id:stage.era===1||stage.novice?.includes(role)?{bulwark:'noviceGuard',vanguard:'noviceScout',infiltrator:'noviceStriker'}[role]:role,level:stage.careerLevel,xp:0};
 state.player.equip={...state.player.equip,...stage.common,weapon:stage.weapons[ROLES.indexOf(role)],offhand:role==='bulwark'?stage.shield:null};
 // Apply prerequisite closure for this loadout, not every tech in the database.
 function unlock(id){if(!id||state.meta.techs[id])return;for(const req of a.TECHS[id].req||[])unlock(req);state.meta.techs[id]=1;}
 for(const id of Object.values(state.player.equip))unlock(a.TECH_FOR_RECIPE[id]);
 if(stage.era>=3){state.kills=20;state.quests.sample='done';}
 for(const id of stage.genes)state.meta.geneNodes[id]=true;
 for(const id of ['attackMastery','defenseMastery','staminaMastery','shieldMastery'])state.masteries[id]=stage.mastery;
 state.inv.ammo=40;state.inv.weaponCell=48;state.inv.medkit=2;state.inv.potion=2;if(stage.era>=2)state.inv.bioSuit=1;
 a.ensureCareerSkills();state.skillSlots=LOADOUTS[role].filter(a.skillUnlocked);while(state.skillSlots.length<3)state.skillSlots.push(null);
 if(training)for(const id of state.skillSlots.filter(Boolean))state.skills[id].prof=Math.max(10,Math.min(50,stage.careerLevel*5));
 state.player.hp=a.maxHp();state.player.stamina=a.maxStamina();return state;
}
function chooseAction(a,s,role,rotation=true){
 const c=s.combat,can=k=>s.skillSlots.includes(k)&&a.skillUseStatus(k).ok;
 if(s.player.hp<a.maxHp()*.25&&s.inv.medkit>0)return 'item:medkit';
 if(s.player.stamina<6){if(s.inv.potion>0)return 'item:potion';return 'rest';}
 if(rotation){
  const finisher=LOADOUTS[role][2];if(can(finisher))return finisher;
  if(role==='bulwark'){
   if(c.distNow>1)return 'approach';
   if(can('kineticBrace')&&(s.player.shield<a.shieldMax()*.7||(s.skillSlots.includes(finisher)&&c.roleCharge<=1)))return 'kineticBrace';
   if(can('shieldBash')&&c.hp>a.totalAtk()*1.1)return 'shieldBash';
  }
  if(role==='vanguard'){
   if(can('tacticalScan')&&c.def>Math.max(10,a.totalAtk()*.2)&&c.hp>a.totalAtk()*2)return 'tacticalScan';
   if(can('pulseBurst')&&c.hp>a.totalAtk()*1.7&&c.roleCharge>=3&&s.meta.careers.main.level<5)return 'pulseBurst';
  }
  if(role==='infiltrator'){
   if(c.distNow>1&&can('phaseStrike'))return 'phaseStrike';
   if(can('heavyBlow')&&c.hp>a.totalAtk()*1.4)return 'heavyBlow';
  }
 }
 if(c.distNow>a.atkRange())return 'approach';
 return 'attack';
}
function runFight(sim,stage,role,enemy,seed,options={}){
 const {rotation=true,training=true}=options;
 stage={...stage,level:sim.a.ENEMIES[enemy].boss?stage.bossLevel||stage.level:stage.level};
 const {a}=sim;sim.seed(seed);const s=configure(a,stage,role,{training}),hp=s.player.hp,stamina=s.player.stamina,ammo=s.inv.ammo,cell=s.inv.weaponCell;
 a.startCombat(enemy);const c=s.combat,actions={},initial={hp,stamina,atk:a.totalAtk(),def:a.totalDef(),shield:a.shieldMax()},ledger={minHp:hp};
 // Observe every real state write: a healed finishing blow must not erase damage
 // taken earlier, and a potion must not disguise stamina spent during the fight.
 for(const key of ['hp','shield','stamina']){let value=s.player[key];ledger[key+'Spent']=0;ledger[key+'Restored']=0;Object.defineProperty(s.player,key,{enumerable:true,configurable:true,get:()=>value,set(next){ledger[key+(next<value?'Spent':'Restored')]+=Math.abs(next-value);value=next;if(key==='hp')ledger.minHp=Math.min(ledger.minHp,next);}});}
 for(let n=0;n<200&&!c.result;n++){
  const action=chooseAction(a,s,role,rotation),before=c.playerTurns;
  if(action==='attack')a.playerAttack();else if(action==='approach')a.approach();else if(action==='rest')a.catchBreath();else if(action.startsWith('item:'))a.combatItem(action.slice(5));else a.useSkill(action);
  actions[action]=(actions[action]||0)+1;
  if(c.playerTurns===before&&!c.result&&!action.startsWith('item:')){c.result='stalled';break;}
 }
 return {era:stage.era,role,enemy,result:c.result||'timeout',turns:c.playerTurns,hpLost:hp-s.player.hp,hpLeft:s.player.hp,hpPct:Math.round(s.player.hp/hp*100),minHpPct:Math.round(Math.max(0,ledger.minHp)/hp*100),damageTaken:ledger.hpSpent,shieldAbsorbed:ledger.shieldSpent,healing:ledger.hpRestored,stamina:Math.round(ledger.staminaSpent),staminaRestored:Math.round(ledger.staminaRestored),ammo:ammo-s.inv.ammo,cells:cell-s.inv.weaponCell,medkits:2-s.inv.medkit,potions:2-s.inv.potion,enemyRemaining:Math.max(0,Math.round(c.hp)),initial,actions};
}
function runMatrix(seeds=24){
 const sim=simulation(),rows=[];
 for(const stage of STAGES)for(const role of ROLES)for(const [enemy,definition] of Object.entries(sim.a.ENEMIES).filter(([,e])=>e.era===stage.era)){
  const fights=Array.from({length:seeds},(_,n)=>runFight(sim,stage,role,enemy,(8121+Math.imul(n,0x9e3779b9))>>>0));
  const avg=k=>Math.round(fights.reduce((sum,f)=>sum+f[k],0)/seeds*10)/10;
  rows.push({era:stage.era,role,enemy,boss:!!definition.boss,wins:fights.filter(f=>f.result==='win').length,seeds,turns:avg('turns'),maxTurns:Math.max(...fights.map(f=>f.turns)),stalled:fights.filter(f=>!['win','loss'].includes(f.result)).length,minHpPct:avg('minHpPct'),damageTaken:avg('damageTaken'),shieldAbsorbed:avg('shieldAbsorbed'),healing:avg('healing'),stamina:avg('stamina'),ammo:avg('ammo'),cells:avg('cells'),maxAmmo:Math.max(...fights.map(f=>f.ammo)),maxCells:Math.max(...fights.map(f=>f.cells)),medkits:avg('medkits'),potions:avg('potions'),sample:fights[0]});
 }
 return rows;
}
function equipmentVariantStage(a,stage,branch){
 // A material family may unlock across several world eras. Do not lend the
 // lunar benchmark alien composites; it still uses tier-four armor.
 const tier=[0,1,2,3,4,4,5,5][stage.era],common={};
 const pick=(family,n=tier)=>a.EQUIPMENT_SERIES_PATHS[family+'_'+branch].items.slice(-5)[n-1];
 for(const [family,row] of Object.entries(a.EQUIPMENT_SERIES))if(!['blade','firearm','shield'].includes(family))common[row.slot]=pick(family);
 const weaponTier=stage.era===5?5:tier;
 return {...stage,common,weapons:[pick('blade',weaponTier),pick('firearm',weaponTier),pick('blade',weaponTier)],shield:pick('shield')};
}
module.exports={simulation,configure,chooseAction,runFight,runMatrix,equipmentVariantStage,STAGES,ROLES,LOADOUTS};
if(require.main===module){const rows=runMatrix();if(process.argv.includes('--json'))console.log(JSON.stringify(rows,null,2));else console.table(rows.map(({sample,...row})=>row));}
