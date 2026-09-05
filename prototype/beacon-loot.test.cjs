// Run with game.test.js: use its full game/DOM fixture, not a copy of loot logic.
const assert=require('node:assert/strict');
module.exports=({a,reset,sandbox,FakeElement,hasClass})=>{
  const seed=value=>{let n=value>>>0;sandbox.Math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};};
  const ids=b=>[...b.materials,...b.supplies,...b.special];
  const plain=value=>JSON.parse(JSON.stringify(value));
  reset();
  const catalog=a.beaconFloorSpec(80),registered=a.BEACON_LOOT_TIERS.flatMap(ids);
  assert.deepEqual([catalog.materials.length,catalog.supplies.length,catalog.special.length],[43,17,9]);
  assert.equal(new Set(registered).size,registered.length,'每种物资只在一个层级注册，避免重复权重');
  const eligible=Object.keys(a.ITEMS).filter(id=>!['equip','book','masteryBook'].includes(a.ITEMS[id].type)&&!a.BEACON_STORY_ITEMS.has(id));
  assert.deepEqual([...registered].sort(),eligible.sort(),'物品表新增普通物资时必须同步分配信标层级，不得漏掉');
  for(const [type,pool] of [['mat',catalog.materials],['use',catalog.supplies],['key',catalog.special]]){
    for(const id of pool){assert.equal(a.ITEMS[id].type,type,id);assert.ok(!a.BEACON_STORY_ITEMS.has(id),id);}
  }
  const storyKeys=['arkBand','builderGun','fieldMap','maintenanceKey','civilPass','sporeSeal','signalCipher','accessCard','manualOverride','lifeArchive','navBlackBox','reactorSeal','echoCoupler','commandSeal','shipFrame','fusionDrive','inertialHull','arkHabitat','navComputer','orbitalLance','gateKey'];
  for(const id of [...storyKeys,...Object.values(a.ENDINGS).map(row=>row.item).filter(Boolean)])assert.ok(a.BEACON_STORY_ITEMS.has(id),`剧情/结局物品 ${id} 必须排除`);
  for(const row of a.BEACON_EQUIPMENT)for(const id of row.items)assert.ok(!a.BEACON_STORY_ITEMS.has(id),`装备池也不能混入结局专属 ${id}`);

  // Pure preview: scrolling or reopening must not alter RNG, inventory or story.
  let randomCalls=0;sandbox.Math.random=()=>{randomCalls++;return .5;};
  const before=JSON.stringify(a.getState());
  for(let floor=1;floor<=100;floor++){
    const b=a.beaconFloorSpec(floor),html=a.beaconLootPreview(b);
    assert.ok(ids(a.beaconFloorSpec(Math.max(1,floor-1))).every(id=>ids(b).includes(id)),'物资池必须累积扩充');
    assert.ok(ids(b).every(id=>a.BEACON_LOOT_FLOOR[id]<=floor),'不得提前出高层物资');
    assert.match(html,/剧情道具、任务凭证和结局收藏不参与掉落/);
    for(const id of a.BEACON_STORY_ITEMS)assert.ok(!html.includes(a.ITEMS[id].name),`预览不得展示 ${id}`);
    assert.equal(b.cells,1);assert.equal(b.cost,0);
  }
  assert.equal(randomCalls,0);assert.equal(JSON.stringify(a.getState()),before);
  for(const input of [NaN,Infinity,-1,0,'bad'])assert.equal(a.beaconFloorSpec(input).floor,1);

  // 4,000 repeatable rolls cover every ordinary item, both skill books, all tiers.
  const reached=new Set();seed(536114);
  for(let floor=1;floor<=100;floor++)for(let run=0;run<40;run++){
    const b=a.beaconFloorSpec(floor),loot=a.beaconRollLoot(b),keys=Object.keys(loot);
    const mats=keys.filter(id=>a.ITEMS[id].type==='mat'),supplies=keys.filter(id=>a.ITEMS[id].type==='use');
    assert.equal(mats.length,Object.keys(b.drops).length+Math.min(b.materialRolls,b.materials.length-Object.keys(b.drops).length));
    assert.equal(supplies.length,b.supplyRolls);
    const latest=b.latestMaterials.filter(id=>!Object.hasOwn(b.drops,id));
    assert.ok(latest.filter(id=>keys.includes(id)).length>=Math.min(2,latest.length),'必须至少给两种本层新材料（不足时全给）');
    if(floor%10===0)assert.equal(keys.filter(id=>a.ITEMS[id].type==='book').length,1,'每十层技能书保底');
    for(const [id,n] of Object.entries(loot)){
      assert.ok(a.ITEMS[id]&&!a.BEACON_STORY_ITEMS.has(id),id);
      assert.ok(Number.isInteger(n)&&n>0,`${id}: ${n}`);
      if(a.ITEMS[id].type!=='book')assert.ok(ids(b).includes(id),id);
      reached.add(id);
    }
  }
  assert.ok([...registered,...catalog.skillBooks].every(id=>reached.has(id)),'所有普通物资和两种技能书必须实际抽得到');
  const owned=reset();for(const id of catalog.special)owned.inv[id]=1;
  sandbox.Math.random=()=>0;
  assert.equal(Object.keys(a.beaconRollLoot(catalog)).some(id=>a.ITEMS[id].type==='key'),false,'已持有的工具组件不再重复发放');

  // Credit a legacy in-progress beacon once; item gains must not grant plot flags.
  const s=reset();s.quests={first_exit:'done',patrol:'active',finale_harris:'locked'};s.flags={mapUnlocked:true};
  s.meta.endingItems=['starchart'];s.meta.endingsDone=['sail'];
  const plot=JSON.stringify({quests:s.quests,flags:s.flags,meta:s.meta,discovered:s.discovered});
  const inv=plain(s.inv);sandbox.Math.random=()=>0;
  const reward=a.winBeacon({floor:80,drops:{scrap:2,commandSeal:1,gateKey:1},equipment:['sever']});
  assert.ok(reward.items.some(row=>row.id==='xenoBiomass'),'旧版进行中战斗仍结算新版物资');
  assert.ok(reward.equipment&&a.ITEMS[reward.equipment].type==='equip');
  assert.equal(reward.manuals,8);assert.ok(reward.items.some(row=>a.ITEMS[row.id].type==='book'));
  assert.equal(new Set(reward.items.map(row=>row.id)).size,reward.items.length,'结算合并相同物品，不能重复卡片');
  for(const row of reward.items)assert.equal(s.inv[row.id]-(inv[row.id]||0),row.amount,`实际入包数量 ${row.id}`);
  for(const id of a.BEACON_STORY_ITEMS)assert.equal(s.inv[id],inv[id],`不得写入剧情物品 ${id}`);
  assert.equal(JSON.stringify({quests:s.quests,flags:s.flags,meta:s.meta,discovered:s.discovered}),plot,'结算不能完成剧情、改任务/结局状态或揭开地图');
  const credited=JSON.stringify(s.inv);a.renderSiteSheet(new FakeElement());a.renderSiteSheet(new FakeElement());a.closeSiteSheet();
  assert.equal(JSON.stringify(s.inv),credited,'展示及关闭奖励不得重复结算');

  const awards=mult=>{const s=reset();s.meta.mult.collect=mult;seed(9182);return a.winBeacon({floor:80}).items;};
  const base=awards(1),boosted=awards(3);
  assert.deepEqual(plain(base.map(row=>row.id)),plain(boosted.map(row=>row.id)));
  base.forEach((row,i)=>assert.equal(boosted[i].amount,row.amount*(a.ITEMS[row.id].type==='mat'?3:1),'采集倍率只作用于材料'));
  const upgraded=reset();upgraded.meta.built.beacon=true;upgraded.meta.buildLevels.beacon=2;
  assert.ok(Math.abs(a.beaconSkillBookChance(a.beaconFloorSpec(1))-.253)<1e-9,'升级描述承诺的技能书掉率 +5% 必须实际生效');
  upgraded.meta.buildLevels.beacon=100;
  assert.equal(a.beaconEquipmentChance(catalog),1);assert.equal(a.beaconSkillBookChance(catalog),1);

  // The catalogue survives selecting a different floor, including its open state.
  const ui=reset();ui.meta.built.beacon=true;ui.beaconMaxFloor=80;ui.inv.signalCell=5;
  const box=new FakeElement();a.renderBuilding(box,'beacon');const nodes=[];
  (function walk(node){nodes.push(node);(node.children||[]).filter(child=>child&&typeof child==='object').forEach(walk);})(box);
  const details=nodes.find(node=>hasClass(node,'beacon-loot-catalog')),scroller=nodes.find(node=>hasClass(node,'beacon-floor-scroll'));
  assert.match(details.innerHTML,/43 种材料 \/ 17 种补给 \/ 9 种稀有道具/);details.open=true;
  scroller.scrollTop=92;scroller.onscroll();assert.equal(details.dataset.floor,'78');assert.equal(details.open,true);
  assert.match(details.innerHTML,/37 种材料/);
  reset();console.log('Beacon loot: 69 ordinary items, 4,000 rolls, story exclusion, guarantees and legacy settlements passed.');
};
