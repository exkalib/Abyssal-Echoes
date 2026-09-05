const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

class Element {
  constructor(){this.children=[];this.style={setProperty(){}};this.dataset={};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};this.innerHTML='';}
  appendChild(child){this.children.push(child);return child;}
  append(...children){this.children.push(...children);}
  setAttribute(){} addEventListener(){} removeEventListener(){} remove(){} focus(){} select(){}
  querySelector(){return null;} querySelectorAll(){return [];}
}
const nodes=new Map(),storage=new Map();
const sandbox={console,Math,JSON,crypto:webcrypto,TextEncoder,TextDecoder,atob,btoa,addEventListener(){},setTimeout(){},clearTimeout(){},requestAnimationFrame(){},
  localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},
  document:{body:new Element(),createElement:()=>new Element(),createElementNS:()=>new Element(),querySelector:()=>null,querySelectorAll:()=>[],getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);}}};
vm.createContext(sandbox);
const source=fs.readFileSync(path.join(__dirname,'game.js'),'utf8').replace(/\ninitLaunchGate\(\);\s*$/,'');
vm.runInContext(source+`\nthis.api={EQUIPMENT_EXPANSION,ITEMS,RECIPES,TECHS,TECH_FOR_RECIPE,TECH_FOR_BUILD,CAMP_BUILDINGS,SMELT,LOCATIONS,MATERIAL_SOURCES,EQUIPMENT_PROGRESSION_PATHS,equipmentProgression,hasRecipeTech,normalizeEquipment,migrateEquipmentCompatibility,equipmentEquipStatus,freshState,setState:s=>state=s,getState:()=>state,craft,equip,unequip,settlementSellTerms,settlementBuyPrice,SETTLEMENT_SHOP,resourceSiteOf,routeObstacle,routeObstacleTool,crossRouteObstacle,restoreCheckpoint,skillEquipmentStatus,careerEquipmentStatus,shieldMax};log=()=>{};advanceTime=n=>state.time+=n;gainCareerXp=()=>{};render=()=>{};`,sandbox);
const a=sandbox.api,added=['riotShield','citadelShield','plasmaSaber','phaseBlade','voidBlade','fieldGreaves','phaseGreaves','gravityBoots'];
const expectedTech={riotShield:'power_1',fieldGreaves:'power_1',plasmaSaber:'arms_6',phaseBlade:'arms_8',voidBlade:'arms_9',citadelShield:'power_10',phaseGreaves:'power_7',gravityBoots:'power_6'};
const expectedCost={riotShield:{ingot:2,cloth:2,scrap:3},fieldGreaves:{ingot:2,cloth:3},plasmaSaber:{titanium:2,fusionCell:2,ecomp:3},phaseBlade:{nanites:2,quantumCore:2,phaseCrystal:3},voidBlade:{starAlloy:3,fusionCell:2,quantumCore:1},citadelShield:{starAlloy:3,livingComposite:2,superconductor:3},phaseGreaves:{carbonComposite:3,nanites:2,phaseCrystal:2},gravityBoots:{titanium:2,superconductor:2,fusionCell:1}};
const expectedStats={riotShield:{def:4,shield:20,guardPct:6},fieldGreaves:{def:4,dodge:3},plasmaSaber:{atk:245,powerPct:85,staminaCost:3,pen:22,critDmg:40},phaseBlade:{atk:510,powerPct:115,staminaCost:3,crit:18,pen:40},voidBlade:{atk:790,powerPct:140,staminaCost:4,pen:58,critDmg:60},citadelShield:{def:26,shield:360,guardPct:30},phaseGreaves:{def:18,dodge:12,move:3},gravityBoots:{def:8,move:6,dodge:12}};
const reset=()=>{const state=a.freshState();a.setState(state);return state;};

for(const id of added){
  const item=a.ITEMS[id],info=a.equipmentProgression(id),recipe=a.RECIPES[id];
  assert.equal(item.type,'equip',id+' 必须是可穿戴装备');
  assert.ok(item.grade,id+' 必须登记装备代际');
  assert.equal(recipe.out,id);assert.equal(info.recipeId,id);
  assert.deepEqual(JSON.parse(JSON.stringify(recipe.cost)),expectedCost[id],id+' 配方必须对应已确定的准确材料表');
  for(const [stat,value] of Object.entries(expectedStats[id]))assert.equal(item[stat],value,id+' 数值必须对应装备表：'+stat);
  assert.equal(a.TECH_FOR_RECIPE[id],expectedTech[id],id+' 必须由预定科技解锁');
  assert.equal(Object.values(a.TECHS).filter(t=>(t.un||[]).includes(id)).length,1,id+' 不得被多个科技重复覆盖解锁归属');
  assert.ok(a.CAMP_BUILDINGS.some(f=>f.id===info.facilityId),id+' 必须存在实际制作设施');
  for(const material of info.materials){
    assert.equal(a.ITEMS[material.id].type,'mat');assert.ok(Number.isInteger(material.count)&&material.count>0);
    assert.ok(a.MATERIAL_SOURCES[material.id],material.id+' 必须给出材料来源');
    assert.ok(Object.values(a.LOCATIONS).some(loc=>Object.hasOwn(loc.loot||{},material.id))||Object.values(a.RECIPES).some(r=>r.out===material.id)||a.SMELT.some(r=>r.out===material.id),material.id+' 必须可通过探索或现有工艺获得');
  }
  const state=reset();state.meta.built[info.facilityId]=true;state.meta.buildLevels[info.facilityId]=info.facilityLevel;Object.assign(state.inv,recipe.cost);
  const before=JSON.stringify(state.inv);
  assert.equal(a.craft(recipe,1,()=>{}),false,id+' 未研究时不能绕过列表调用制作');
  assert.equal(JSON.stringify(state.inv),before,id+' 失败不得扣材料或增加成品');
  state.meta.techs[expectedTech[id]]=true;
  assert.equal(a.hasRecipeTech(id),true,id+' 已研究科技的旧档自动获得新配方');
  assert.equal(a.craft(recipe,1,()=>{}),true,id+' 解锁后必须能按准确材料制作');
  assert.equal(state.inv[id],1);for(const [material,count] of Object.entries(recipe.cost))assert.equal(state.inv[material],0,id+' 扣料必须与配方一致 '+count);
  a.equip(item.slot,id,()=>{});assert.equal(state.player.equip[item.slot],id);assert.equal(state.inv[id],0);
  a.unequip(item.slot,()=>{});assert.equal(state.player.equip[item.slot],null);assert.equal(state.inv[id],1,id+' 穿脱必须数量守恒');
}

for(const [id,row] of Object.entries(a.EQUIPMENT_EXPANSION)){
 const info=a.equipmentProgression(id),recipe=a.RECIPES[id],state=reset();Object.assign(state.inv,recipe.cost);
 state.meta.built[info.facilityId]=true;state.meta.buildLevels[info.facilityId]=info.facilityLevel;
 const snapshot=()=>JSON.stringify({inv:state.inv,time:state.time,equip:state.player.equip});let before=snapshot();
 assert.equal(a.craft(recipe,1,()=>{}),false,id+' rejects an unresearched recipe');assert.equal(snapshot(),before);
 state.meta.techs[row.technologyId]=true;state.meta.damaged[info.facilityId]=true;before=snapshot();
 assert.equal(a.craft(recipe,1,()=>{}),false,id+' rejects a damaged station');assert.equal(snapshot(),before);delete state.meta.damaged[info.facilityId];
 if(info.facilityLevel>1){state.meta.buildLevels[info.facilityId]=info.facilityLevel-1;before=snapshot();assert.equal(a.craft(recipe,1,()=>{}),false,id+' rejects an underleveled station');assert.equal(snapshot(),before);state.meta.buildLevels[info.facilityId]=info.facilityLevel;}
 assert.equal(a.craft(recipe,1,()=>{}),true,id+' has a real craftable recipe');assert.equal(state.inv[id],1);
 for(const material of Object.keys(recipe.cost))assert.equal(state.inv[material],0,id+' exact material debit');
 a.equip(a.ITEMS[id].slot,id,()=>{});assert.equal(state.player.equip[a.ITEMS[id].slot],id);assert.equal(state.inv[id],0);
 a.unequip(a.ITEMS[id].slot,()=>{});assert.equal(state.inv[id],1,id+' equip/unequip conserves the item');
 for(const material of info.materials)assert.ok(a.MATERIAL_SOURCES[material.id]&&(Object.values(a.LOCATIONS).some(loc=>Object.hasOwn(loc.loot||{},material.id))||Object.values(a.RECIPES).some(r=>r.out===material.id)||a.SMELT.some(r=>r.out===material.id)),id+' reachable material '+material.id);
}

for(const [id,item] of Object.entries(a.ITEMS))if(item.slot==='weapon'){
  assert.ok(['blade','firearm','tool'].includes(item.weaponFamily),id+' 必须声明武器家族');
  assert.ok([1,2].includes(item.weaponHands),id+' 必须声明单手或双手');
}
for(const id of ['riotShield','eshieldUnit','phaseShield','citadelShield'])assert.equal(a.ITEMS[id].equipmentRole,'shield',id+' 必须是真实盾装备');
for(const id of ['plasmaSaber','phaseBlade','voidBlade'])assert.equal(a.ITEMS[id].weaponFamily,'blade');
assert.equal(a.ITEMS.crowbar.weaponFamily,'tool');
assert.equal(a.equipmentProgression('scrap'),null);
assert.equal(a.equipmentProgression('riotShield').nextIds[0],'eshieldUnit');
assert.equal(a.equipmentProgression('voidBlade').facilityLevel,4);
assert.equal(a.equipmentProgression('citadelShield').facilityLevel,4);

// 标注为采集地点的来源必须真的在资源点 yield 内，而不只是普通探索小概率 loot。
const gatheredSources={scrap:['outer','cargoYard'],wood:['blackwood','outer'],stone:['ridge','floodChannel'],cloth:['floodChannel','layer2'],copperScrap:['ridge','oldMine'],coal:['coalRift','oldMine'],steel:['layer5'],ecomp:['cargoYard','relayTower'],ration:['layer2'],biocore:['layer4','fungal'],crystal:['layer3','fungal'],core:['layer5','layer7'],silica:['silicaField'],titaniumOre:['titaniumMine'],deuterium:['cryoVault'],phaseCrystal:['phaseGrove'],helium3:['regolithSea'],iridiumOre:['iridiumCrater'],xenoBiomass:['xenoShore','livingCanopy'],voidCrystal:['blackGlassPlain']};
for(const [material,locations] of Object.entries(gatheredSources))for(const location of locations){
  assert.ok(a.resourceSiteOf(location).yield.includes(material),material+' 在 '+location+' 必须真的可定向采集');
  assert.ok(a.MATERIAL_SOURCES[material].includes(a.LOCATIONS[location].name),material+' 提示必须对应真实地点名称');
}
for(const id of ['plasmaSaber','phaseBlade','voidBlade'])for(const edge of [['outer','blackwood'],['cargoYard','blackwood']]){
  const state=reset(),obstacle=a.routeObstacle(...edge);state.inv[id]=1;
  assert.equal(a.routeObstacleTool(obstacle),id,id+' 在背包中必须能清理荆棘');
  state.inv[id]=0;state.player.equip.weapon=id;assert.equal(a.routeObstacleTool(obstacle),id,id+' 穿戴后必须仍可清理荆棘');
  const beforeHp=state.player.hp;
  vm.runInContext('this.originalMove=move;move=()=>{};',sandbox);
  a.crossRouteObstacle(...edge,true);
  vm.runInContext('move=this.originalMove;',sandbox);
  assert.equal(state.flags.blackwoodThornsCleared,true);assert.equal(state.player.hp,beforeHp,id+' 清障不应仍扣强行穿越伤害');assert.equal(state.player.equip.weapon,id);
}

// 旧装备仍按原 ID 归槽；唯一例外是新规则不兼容的副手退回自己的背包。
{
  const inventory={knife:2,boots:1},player={equip:{weapon:'rifle',armor:'power',shield:'eshieldUnit',boots:'boots',head:'scope'}};
  const returned=a.normalizeEquipment(player,inventory);
  assert.equal(player.equip.weapon,'rifle');assert.equal(player.equip.body,'power');assert.equal(player.equip.offhand,null);assert.equal(player.equip.feet,'boots');assert.equal(player.equip.head,'scope');
  assert.equal(returned[0],'eshieldUnit');assert.equal(inventory.eshieldUnit,1);assert.equal(inventory.knife,2);assert.equal(inventory.boots,1);
  a.normalizeEquipment(player,inventory);assert.equal(inventory.eshieldUnit,1,'重复迁移不得复制盾');
}
// 新穿戴明确阻止冲突：不偷偷换掉另一槽、不扣数量、不推进时间或修改生命状态。
for(const weapon of ['rifle','plasmaRifle','gravLance','swarmRifle','vacuumCarbine'])for(const shield of ['riotShield','eshieldUnit','phaseShield','citadelShield']){
  let state=reset();state.player.equip.offhand=shield;state.inv[weapon]=1;state.player.shield=12;
  const before=JSON.stringify({equip:state.player.equip,inv:state.inv,time:state.time,shield:state.player.shield}),status=a.equipmentEquipStatus(weapon);
  assert.equal(status.ok,false);assert.equal(status.conflictSlot,'offhand');assert.match(status.text,/先卸下副手/);
  assert.equal(a.equip('weapon',weapon,()=>{}),false);assert.equal(JSON.stringify({equip:state.player.equip,inv:state.inv,time:state.time,shield:state.player.shield}),before);
  state=reset();state.player.equip.weapon=weapon;state.inv[shield]=1;
  const reverse=JSON.stringify(state),shieldStatus=a.equipmentEquipStatus(shield);assert.equal(shieldStatus.ok,false);assert.equal(shieldStatus.conflictSlot,'weapon');
  assert.equal(a.equip('offhand',shield,()=>{}),false);assert.equal(JSON.stringify(state),reverse);
  // 陈旧的战斗状态也不能绕过装备动作直接使用盾技。
  state.player.equip.offhand=shield;assert.equal(a.careerEquipmentStatus('bulwark').ok,false);assert.equal(a.skillEquipmentStatus('shieldBash').ok,false);assert.equal(a.skillEquipmentStatus('kineticBrace').ok,false);
}
for(const weapon of ['pistol','crowbar','knife','blade','eblade','sever','plasmaSaber','phaseBlade','voidBlade']){
  const state=reset();state.player.equip.weapon=weapon;state.inv.riotShield=1;
  assert.equal(a.ITEMS[weapon].weaponHands,1);assert.equal(a.equipmentEquipStatus('riotShield').ok,true);assert.equal(a.equip('offhand','riotShield',()=>{}),true);assert.equal(a.careerEquipmentStatus('bulwark').ok,true);assert.equal(a.skillEquipmentStatus('shieldBash').ok,true);
}
{
  const state=reset();state.player.equip.weapon='rifle';state.player.equip.offhand='eshieldUnit';state.player.shield=45;state.inv.eshieldUnit=2;
  state.checkpoint=JSON.parse(JSON.stringify(state));delete state.checkpoint.checkpoint;
  const migrated=a.migrateEquipmentCompatibility();assert.equal(migrated.returned[0],'eshieldUnit');assert.equal(migrated.checkpointReturned[0],'eshieldUnit');assert.match(migrated.text,/已完整退回背包/);
  assert.equal(state.inv.eshieldUnit,3);assert.equal(state.checkpoint.inv.eshieldUnit,3);assert.equal(state.player.equip.offhand,null);assert.equal(state.checkpoint.player.equip.offhand,null);assert.equal(state.player.shield,a.shieldMax());
  assert.equal(a.migrateEquipmentCompatibility().returned.length,0);assert.equal(state.inv.eshieldUnit,3);assert.equal(state.checkpoint.inv.eshieldUnit,3);
  for(let times=0;times<3;times++){a.restoreCheckpoint();assert.equal(a.getState().inv.eshieldUnit,3,'连续复活不能重新发放迁移盾');assert.equal(a.getState().player.equip.offhand,null);assert.ok(a.getState().player.shield<=a.shieldMax());}
}
// 配方参数也不能由旧 UI 临时伪造；缺蓝图、设施损坏、等级不足均不扣料。
{
  const state=reset(),recipe=a.RECIPES.voidBlade;state.meta.built.gravityAnchor=true;state.meta.buildLevels.gravityAnchor=3;state.meta.techs.arms_9=true;Object.assign(state.inv,recipe.cost);
  const before=JSON.stringify(state.inv);assert.equal(a.craft(recipe,1,()=>{}),false);assert.equal(JSON.stringify(state.inv),before);
  state.meta.buildLevels.gravityAnchor=4;state.meta.damaged.gravityAnchor=true;assert.equal(a.craft(recipe,1,()=>{}),false);assert.equal(JSON.stringify(state.inv),before);
  assert.equal(a.craft({...recipe,cost:{}},1,()=>{}),false);assert.equal(JSON.stringify(state.inv),before);
  const blueprint=a.RECIPES.miningHarness;state.meta.built.work=true;state.meta.buildLevels.work=1;Object.assign(state.inv,blueprint.cost);
  assert.equal(a.craft(blueprint,1,()=>{}),false);state.flags.bp_miningHarness=true;assert.equal(a.craft(blueprint,1,()=>{}),true);
}
// 全部货架、所有声望档与批量继续遵守回售不高于购入；最高声望平价。
for(const [id,row] of Object.entries(a.SETTLEMENT_SHOP))for(const discount of [1,.9,.8])for(const count of [1,10,100]){
  const price=a.settlementBuyPrice(row,discount),terms=a.settlementSellTerms(row,discount);if(!terms)continue;
  assert.ok(terms.crystal*row.buy.amount*count<=price*terms.amount*count,id+' 声望折扣不得制造套利');
  if(discount===.8)assert.equal(terms.crystal*row.buy.amount,price*terms.amount,id+' 最高声望应买卖平价');
}

// 科技图仍然无环，所有新增材料工艺均有可到达的解锁路径。
const seen=new Set(),visiting=new Set();
function visit(id){assert.ok(a.TECHS[id],id+' 科技前置必须存在');if(seen.has(id))return;assert.ok(!visiting.has(id),id+' 科技不得循环依赖');visiting.add(id);for(const req of a.TECHS[id].req||[])visit(req);visiting.delete(id);seen.add(id);}
for(const id of Object.keys(a.TECHS))visit(id);
console.log('Equipment progression: 85 new recipes, exact costs, reachable materials, mutation guards, wear conservation, legacy saves and shop anti-arbitrage passed.');
