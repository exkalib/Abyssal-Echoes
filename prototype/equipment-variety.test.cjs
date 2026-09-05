const assert=require('node:assert/strict');
const {simulation}=require('./combat-balance.cjs');
const sim=simulation(),a=sim.a;
const {EQUIPMENT_SERIES:families,EQUIPMENT_EXPANSION:added,EQUIPMENT_CORE_STATS:core,EQUIPMENT_SERIES_PATHS:paths}=a;
assert.equal(Object.keys(added).length,77);
assert.equal(Object.values(a.ITEMS).filter(x=>x.type==='equip').length,124);
for(const [family,row] of Object.entries(families)){
 const specialist=paths[family+'_specialist'].items.slice(-5),general=paths[family+'_general'].items.slice(-5);
 assert.equal(specialist.length,5);assert.equal(general.length,5);
 for(let stage=0;stage<5;stage++){
  const s=a.ITEMS[specialist[stage]],g=a.ITEMS[general[stage]],focus=row.focus[stage];
  assert.equal(s.slot,row.slot);assert.equal(g.slot,row.slot);
  assert.ok(s[focus]>g[focus],family+' stage '+stage+' specialist must retain a measurable peak advantage in '+focus);
  assert.ok(core.some(k=>(g[k]||0)>(s[k]||0)),family+' generalist must gain an actual alternative attribute');
  if(stage>0)for(const stat of core)if(a.ITEMS[general[stage-1]][stat])assert.ok(g[stat]>=a.ITEMS[general[stage-1]][stat],general[stage]+' cannot lose '+stat+' on its next stage');
 }
}
const modules=paths.module_general.items.map(id=>a.ITEMS[id]);
assert.deepEqual(Array.from(modules,x=>core.filter(k=>x[k]>0).length),[2,4,7,10,13,13]);
for(const item of modules.slice(-2))for(const stat of core)assert.ok(item[stat]>0,'late full-spectrum module missing '+stat);
for(const [id,row] of Object.entries(added)){
 const item=a.ITEMS[id],recipe=a.RECIPES[id];
 assert.equal(recipe.out,id);assert.equal(a.TECH_FOR_RECIPE[id],row.technologyId);
 assert.equal(Object.values(a.TECHS).filter(t=>(t.un||[]).includes(id)).length,1);
 for(const [material,n] of Object.entries(recipe.cost)){assert.equal(a.ITEMS[material]?.type,'mat');assert.ok(Number.isInteger(n)&&n>0);}
 if(row.family==='firearm'){assert.equal(item.weaponHands,1);assert.equal(item.weaponFamily,'firearm');assert.ok(a.ITEMS[item.ammo]);}
 if(row.family==='shield')assert.equal(item.equipmentRole,'shield');
}
// Real stat calculations, not just displayed JSON values.
{
 const state=a.reset();state.player.equip={};const base={hp:a.maxHp(),st:a.maxStamina(),atk:a.totalAtk(),def:a.totalDef(),shield:a.shieldMax()};
 state.player.equip.module='module_general_5';
 assert.equal(a.maxStamina()-base.st,a.ITEMS.module_general_5.stMax);
 assert.equal(a.maxHp()-base.hp,a.ITEMS.module_general_5.hp);
 assert.equal(a.totalAtk()-base.atk,a.ITEMS.module_general_5.atk);
 assert.equal(a.totalDef()-base.def,a.ITEMS.module_general_5.def);
  assert.equal(a.shieldMax()-base.shield,a.ITEMS.module_general_5.shield);
  for(const key of core)assert.equal(a.eqSum(key),a.ITEMS.module_general_5[key]);
  assert.equal(a.statCrit(),10);assert.equal(a.statCritDmg(),184);assert.equal(a.statHit(),100);assert.equal(a.statDodge(),8);assert.equal(a.statPen(),14);assert.equal(a.statLS(),4);assert.equal(a.baseSpd(),15);assert.equal(a.moveRange(),5);
  assert.match(a.statTags(a.ITEMS.module_general_5),/综合型.*体力上限\+27/);
  assert.match(a.bagEquipmentComparison(a.ITEMS.module_general_5,null),/体力上限/);
  state.player.hp=a.maxHp();state.player.stamina=a.maxStamina();state.player.shield=a.shieldMax();
  state.player.equip.module=null;a.clampEquipmentResources();
  assert.equal(state.player.hp,base.hp);assert.equal(state.player.stamina,base.st);assert.equal(state.player.shield,base.shield);
  state.player.equip.module='module_general_5';a.clampEquipmentResources();assert.equal(state.player.stamina,base.st,'re-equipping must not refill stamina for free');
  state.player.equip.module='module_specialist_5';assert.equal(a.targetEquipmentDamagePct({boss:true}),10,'module target bonuses must apply outside the weapon slot');
}
for(const [id,row] of Object.entries(added)){
 assert.ok(a.BEACON_EQUIPMENT.some(pool=>pool.items.includes(id)),id+' missing beacon acquisition');
 assert.equal(a.equipmentProgression(id).materials.length,Object.keys(row.recipe.cost).length);
 const state=a.reset();state.meta.buildLevels.recycler=100;state.masteries={recycleMastery:10000};
 const output=a.equipmentRecycleYield(id);assert.ok(Object.keys(output).length,id+' must remain recyclable');
 for(const [mat,n] of Object.entries(output))assert.ok(n<=Math.floor((row.recipe.cost[mat]||0)/2),id+' recycling cannot create materials beyond its input');
 if(row.stage<=2){assert.ok(a.SETTLEMENT_SHOP[id]);for(const discount of [1,.9,.8]){const stock=a.SETTLEMENT_SHOP[id],sell=a.settlementSellTerms(stock,discount),buy=a.settlementBuyPrice(stock,discount);assert.ok(sell.crystal<=buy*sell.amount);if(discount===.8)assert.equal(sell.crystal,buy*sell.amount);}}
}
console.log('Equipment variety: 77 additions, 11 paired five-stage routes, full-spectrum modules, real stats and technology ownership passed.');
