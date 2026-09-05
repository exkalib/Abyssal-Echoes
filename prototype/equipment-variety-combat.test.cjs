const assert=require('node:assert/strict');
const {simulation,equipmentVariantStage,configure,runFight,STAGES,ROLES}=require('./combat-balance.cjs');
const sim=simulation(),summary=[];
for(const branch of ['specialist','general'])for(const baseline of STAGES){
 const stage=equipmentVariantStage(sim.a,baseline,branch);
 for(const role of ROLES){
  const state=configure(sim.a,stage,role);assert.equal(sim.a.careerEquipmentStatus().ok,true);
  for(const id of Object.values(state.player.equip).filter(Boolean))assert.ok(sim.a.ITEMS[id]);
  for(const [enemy,definition] of Object.entries(sim.a.ENEMIES).filter(([,e])=>e.era===stage.era)){
   const fights=Array.from({length:16},(_,i)=>runFight(sim,stage,role,enemy,(39133+Math.imul(i,0x9e3779b9))>>>0));
   const label=branch+' / '+role+' / '+enemy;
   assert.ok(fights.every(f=>['win','loss'].includes(f.result)),label+' must never deadlock');
   assert.ok(fights.filter(f=>f.result==='win').length>=16*(definition.boss?.875:1),label+' prepared loadout survival');
   assert.ok(fights.every(f=>f.turns<=(definition.boss?42:14)),label+' reasonable encounter length');
   assert.ok(fights.every(f=>f.ammo<=40&&f.cells<=48),label+' finite standard supply');
   if(definition.boss)summary.push({branch,role,enemy,wins:fights.filter(f=>f.result==='win').length,turns:Math.round(fights.reduce((n,f)=>n+f.turns,0)/16*10)/10,minHpPct:Math.round(fights.reduce((n,f)=>n+f.minHpPct,0)/16)});
  }
 }
}
console.table(summary);
console.log('Equipment variants: 2 builds × 3 careers × 25 enemies × 16 seeds = 2,400 real fights passed.');
