const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeElement {
  constructor(){
    this.children=[]; this.style={setProperty(k,v){this[k]=v;}}; this.dataset={}; this.attributes={}; this.textContent=''; this.innerHTML='';
    this.classList={add(){},remove(){},toggle(){return false;},contains(){return false;}};
  }
  appendChild(child){ this.children.push(child); return child; }
  append(...children){ children.forEach(child=>this.appendChild(child)); }
  insertBefore(child,before){ const index=this.children.indexOf(before);if(index<0)this.children.push(child);else this.children.splice(index,0,child);return child; }
  addEventListener(){}
  removeEventListener(){}
  setPointerCapture(){}
  hasPointerCapture(){return false;}
  getBoundingClientRect(){return {left:0,top:0,width:this.clientWidth,height:this.clientHeight,right:this.clientWidth,bottom:this.clientHeight};}
  focus(){}
  select(){}
  click(){ if(this.onclick)this.onclick({target:this}); }
  remove(){}
  querySelector(){ return null; }
  querySelectorAll(){ return []; }
  setAttribute(k,v){ this.attributes[k]=v; }
  get childElementCount(){ return this.children.length; }
  get offsetWidth(){ return 400; }
  get offsetHeight(){ return 400; }
  get clientWidth(){ return 400; }
  get clientHeight(){ return 400; }
}

const nodes = new Map();
const document = {
  body:new FakeElement(),
  getElementById(id){ if(!nodes.has(id))nodes.set(id,new FakeElement()); return nodes.get(id); },
  createElement(){ return new FakeElement(); },
  createElementNS(){ return new FakeElement(); },
  querySelector(){ return null; },
  querySelectorAll(){ return []; },
};
const storage = new Map();
const sandbox = {
  console, document, confirm:()=>true, addEventListener(){}, requestAnimationFrame:fn=>fn(), setTimeout:fn=>fn(),
  localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},
  Math:Object.create(Math), JSON, crypto:webcrypto, TextEncoder, TextDecoder, atob, btoa,
};
vm.createContext(sandbox);
let source=fs.readFileSync(__dirname+'/game.js','utf8').replace(/\ninitLaunchGate\(\);\s*$/,'');
source += `\n;this.api={freshState,setState:s=>state=s,getState:()=>state,P,M,totalAtk,totalDef,statPen,damageReductionRate,locExtraCost,areaActionCost,fieldMealActive,foodBuffActive,payAreaAction,movementHealthCost,payMovementCost,materialSnapshot,beginExpedition,finishExpedition,exhaustionDeath,startCombat,enemyCombatProfile,recordCombatTurn,settleCombatTime,winCombat,playerAttack,enemyTurn,orbitalStrike,attackResource,attackResourceText,approach,catchBreath,useSkill,equipSkill,unequipSkill,skillUnlocked,passiveBonus,renderFieldGatherSkills,activeFieldGatherSkill,fieldGatherSkillApplicable,fieldGatherSkillStatus,performFieldGatherSkill,quickScavengeApplicable,quickScavengeStatus,performQuickScavenge,fieldRepairStatus,performFieldRepair,sporeBoostStatus,performSporeBoost,updateCheckpoint,restoreCheckpoint,research,researchStationReady,unlockGene,unlockGeneNode,geneTier,geneBonus,geneRule,chooseJob,chooseNoviceJob,noviceJobStatus,jobRequirementStatus,jobBonus,gainCareerXp,careerRecord,careerRecords,currentCareer,normalizeLifeCareerRecords,doReincarnate,chooseEnding,gatherAvailable,gatherArea,gatherLimit,resourceSiteOf,resourceSiteDiscovered,resourceRecoveryRemaining,resourceWorkStatus,locationActionStatus,exploreAttempts,performLocationAction,locationActionRemaining,currentDay,rest,fmtTime,activateAvailableQuests,questSearchCount,startBeacon,flee,settleEcho,feedbackSpec,musicSceneId,render,normalizePanelNavigationState,panelView,renderRegionMap,renderLocalMap,renderWorldMap,renderCharPanel,renderSkillPanel,renderBagPanel,renderNpcPanel,renderCareerMentorAction,talkAreaNpc,careerSummary,renderBuilding,renderTechPanel,renderSettlementShop,renderSpaceRoutes,explore,move,travelTo,staminaToCamp,travelRoute,buyEchoUpgrade,repairFacility,resolveRaid,hasBuildingTech,buildFacility,buildingLevel,upgradeFacility,buildDefense,upgradeDefense,defenseBuilt,cookFood,eatMeal,eatFishMeal,useItem,harvestGarden,dispatchDrone,recycleMaterial,damageRandomFacility,mapEdgePath,mapNodeState,tutorialActive,finishWakeAnimation,grantTutorialBracelet,grantTutorialBuilder,grantTutorialMap,completeTutorial,grantTutorialCollector,normalizeEquipment,normalizeMeta,mergePersistentSpaceMeta,metaFlag,setMetaFlag,grantTechRecord,syncQuestProgress,shipReady,assembleStarship,spaceFlightStatus,launchSpaceRoute,emergencySpaceReturn,outpostBuildStatus,buildOutpostPart,outpostReady,locationRevealed,repairLegacyDiscoveryFog,locationGate,entryNeedsConfirm,routeKey,routeKnown,discoverRoute,repairKnownRoutes,routeObstacle,routeNeedsConfirm,crossRouteObstacle,operationStatus,performFieldOperation,regionForLocation,regionUnlocked,regionDiscovery,verticalMapLayout,treeLayout,treePortOffset,treeEdgeRoute,techHeightFitZoom,techReady,techFacilitiesReady,discoverTechRecord,migrateTechTree,setCampName,settlementTrade,settlementTradeQuote,settlementShopProgress,settlementShopCatalog,settlementShopUnlocked,settlementExplorationCount,settlementBuyPrice,settlementSellTerms,settlementSellReward,settlementRecover,acceptCommission,turnInCommission,settlementDiscount,environmentProtected,SLOTS,EQUIP_ICON,EQUIPMENT_GRADES,QUESTS,TECHS,TECH_RECORDS,BRANCHES,MATS,MATERIAL_SOURCES,LOCATIONS,MAP_LINKS,GUIDED_MAP_ROUTES,MAP_CANVAS,WORLD_POS,WORLD_MAP_CANVAS,WORLD_REGION_POS,WORLD_REGIONS,WORLD_REGION_LINKS,LOCAL_MAPS,DISCOVERY_MILESTONES,ENTRY_REQUIREMENTS,ROUTE_OBSTACLES,FIELD_OPERATIONS,LOCATION_ACTIONS,SETTLEMENT_SHOP,SETTLEMENT_SHOP_TIERS,SETTLEMENT_SHOP_CATEGORIES,SETTLEMENT_COMMISSIONS,npcLocation,npcsAt,ITEMS,ENEMIES,RECIPES,COOKING_RECIPES,CAMP_BUILDINGS,OUTPOST_BUILDINGS:(typeof OUTPOST_BUILDINGS==='undefined'?[]:OUTPOST_BUILDINGS),SPACE_ROUTES:(typeof SPACE_ROUTES==='undefined'?[]:SPACE_ROUTES),SMELT,RECYCLE,BEACON,DEF_TYPES,SKILLS,GENE_NODES,GENE_TREE,JOBS,NOVICE_JOBS};`;
source += `\n;Object.assign(this.api,{costText,recipeMaterialText,renderConstruction,renderSiteSheet,craft,smelt,batchQuantity,scaledCost,craftStationPresentation,skillLv,skillProgressText,careerSkillYieldMult,careerSkillCost,skillLevelEffectText,normalizeCloudCode,validGameSave,createLocalBackup,parseLocalBackup,cloudSaveSummary,fieldActionPresentation,fieldDirective,flavor,taskQuestTarget,taskReadyNow,taskPriorityQuest,taskProgressText,taskRewardText,taskNextStep,renderTaskPanel,nativeShellVersion,legacyNativeUpgradeRequired});`;
source += `\n;Object.assign(this.api,{EXPLORATION_PACING,NPC_FIELD_DISCOVERIES,NPC_FIELD_RELOCATIONS,explorationPacingRange,scheduledDiscoveryNeed,milestoneNeed,neighborRouteNeed,areaEventNeed,npcDiscoveryNeed,resourceDiscoveryNeed,applyResourceDiscovery,applyDiscoveryMilestones,applyKnownNeighborRoutes,applyNpcDiscoveries,fieldEncounterChance,rollFieldEncounter,recordFieldSafeAction});`;
source += `\n;Object.assign(this.api,{NPC_NAMES,NPC_PROFILE,STORY_SCENE_ASSETS,STORY_SCENE_LOCATIONS,NPC_FIRST_CONTACT,storySceneKey,storySceneSrc,storyNpcFromGiver,storyLocationForQuest,queueStoryScene,queueNpcFirstContact,queueQuestStoryScene,flushStoryScenes,resetStoryScenes});`;
source += `\n;Object.assign(this.api,{ENDINGS,CORE_COMPONENTS,FINALE_QUEST_IDS,FINALE_PRIMARY_IDS,FINALE_CALIBRATION_IDS,questState,questDone,finishQuest,finaleQuestContact,finaleQuestNeed,finaleTaskStatus,finaleCompletedCount,finaleCalibrationCount,coreRecoveredCount,coreInstalledCount,coreProtocolReady,progressNpcFinaleQuest,installCoreComponent,finalBossOverrides,startFinalCoreBattle,beginCoreTruth,renderCoreControl,renderEndingPanel,endingAvailability,endingDisplayName,completeFailureEnding,triggerWarden,die});`;
source += `\n;Object.assign(this.api,{FIELD_MAP_SLOT_COORDS,FIELD_FOG_RADII,fieldNpcMapped,assignFieldMarkerSlots,fieldMapMarkerCandidates,fieldMapMarkers,fieldFogRecord,fieldFogState,acknowledgeFieldFog,fieldFogSvgMarkup,renderFieldExpedition});`;
vm.runInContext(source,sandbox);
const a=sandbox.api;
const pendingTests=[];
function reset(){ sandbox.Math.random=Math.random; const s=a.freshState(); a.setState(s); return s; }
function hasClass(node,name){return String(node&&node.className||'').split(/\s+/).includes(name);}

{
  sandbox.AbyssApp={versionInfo:()=> '安卓 0.7.1 · 外壳 9 · 资源 1788416012'};
  assert.equal(a.nativeShellVersion(),9);assert.equal(a.legacyNativeUpgradeRequired(),true,'旧外壳必须进入桥接下载流程，不能继续触发原生闪退路径');
  sandbox.AbyssApp={versionInfo:()=> '安卓 0.7.4 · 外壳 10 · 资源 1788420415'};
  assert.equal(a.legacyNativeUpgradeRequired(),false,'具备应用内安装能力的新外壳不得被桥接页拦截');
  delete sandbox.AbyssApp;
}

pendingTests.push((async()=>{
  const s=reset();s.campName='跨端测试营地';s.inv.scrap=17;s.time=48;
  const code=a.normalizeCloudCode('2345 6789-abcd-efgh-jklm-npqr');assert.equal(code,'2345-6789-ABCD-EFGH-JKLM-NPQR','存档码必须忽略空格与横线并统一大写分组');assert.equal(a.normalizeCloudCode('IIII-OOOO-1111-0000-XXXX-YYYY'),null,'存档码必须排除易混淆字符并严格校验长度');
  const password='跨端测试密码2026',backup=await a.createLocalBackup(password),envelope=JSON.parse(backup);assert.equal(envelope.format,'abyss_echo_backup_v2');assert.equal(envelope.cipher,'AES-256-GCM');assert.equal(envelope.kdf,'PBKDF2-SHA256');assert.doesNotMatch(backup,/跨端测试营地|"save"/,'加密备份不得泄露营地名称或明文存档字段');
  const restored=await a.parseLocalBackup(backup,password);assert.equal(restored.campName,'跨端测试营地');assert.equal(restored.inv.scrap,17);assert.match(a.cloudSaveSummary(restored),/跨端测试营地 · 第3天/,'导入前必须能预览营地和进度摘要');
  const tampered=JSON.parse(backup);tampered.data=(tampered.data[0]==='A'?'B':'A')+tampered.data.slice(1);await assert.rejects(()=>a.parseLocalBackup(JSON.stringify(tampered),password),/密码错误，或备份文件已被修改/,'任意修改密文后必须拒绝恢复');
  await assert.rejects(()=>a.parseLocalBackup(backup,'这是一串错误的备份密码2026'),/密码错误，或备份文件已被修改/,'错误密码不得解密存档');
  await assert.rejects(()=>a.parseLocalBackup(JSON.stringify({format:'abyss_echo_backup_v1',save:s}),password),/旧版明文备份可被篡改/,'明文旧格式不得成为篡改绕过入口');
  await assert.rejects(()=>a.parseLocalBackup('{"hello":1}',password),/不是有效/,'无效 JSON 对象不得覆盖本地存档');
})());

{
  const s=reset(),byId=id=>a.QUESTS.find(q=>q.id===id);s.quests={first_fire:'active',spore:'active'};
  assert.equal(a.taskPriorityQuest([byId('spore'),byId('first_fire')]).id,'first_fire','没有就地可推进任务时必须默认突出主线');
  s.player.location='fungal';Object.assign(s.inv,{biocore:3,serum:1});
  assert.equal(a.taskReadyNow(byId('spore')),true);assert.equal(a.taskPriorityQuest([byId('first_fire'),byId('spore')]).id,'spore','当前位置可完成的任务必须优先于远处主线');
  assert.match(a.taskNextStep(byId('spore')),/材料齐备，现在可以交付/);assert.match(a.taskProgressText(byId('spore')),/生物样本 3\/3.*血清 1\/1/);assert.match(a.taskRewardText(byId('spore')),/血清 ×2.*菌幕通行胶囊 ×1/);
  const box=new FakeElement(),nodes=[];a.renderTaskPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const markup=nodes.map(n=>n.innerHTML||'').join(' ');
  assert.equal(nodes.filter(n=>hasClass(n,'task-focus')).length,1,'当前行动页必须只有一个首要任务');assert.equal(nodes.filter(n=>hasClass(n,'task-queue-card')).length,1,'其余进行中任务必须进入独立待办队列');assert.match(markup,/PRIMARY OBJECTIVE[\s\S]*NEXT ACTION \/\/ 下一步[\s\S]*完成回报/,'首要任务必须集中展示目标、下一步和回报');assert.doesNotMatch(markup,/KILLS|DAMAGE|SALVAGE|ECHO YIELD/,'任务首页不得继续混入远征战斗统计');
}

{
  const s=reset();Object.assign(s.inv,{scrap:3,knife:1,medkit:1,pierceBook:1,accessCard:1});
  const renderView=view=>{s.bagView=view;const box=new FakeElement(),nodes=[];a.renderBagPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);return nodes;};
  let view=renderView('material'),markup=view.map(n=>n.innerHTML||'').join(' ');assert.equal(view.filter(n=>hasClass(n,'bag-category-tabs')).length,1);assert.equal(view.filter(n=>hasClass(n,'bag-category-tabs'))[0].children.length,4,'背包必须提供材料、装备、消耗品、特殊道具四个分类');assert.equal(view.some(n=>n.className==='loadout-console'),false,'材料页不得继续被装备纸娃娃占据首屏');assert.match(markup,/废铁 3/);assert.doesNotMatch(markup,/铁刀|急救包|破甲技能书|指挥权限卡/);
  view=renderView('equipment');markup=view.map(n=>n.innerHTML||'').join(' ');assert.equal(view.some(n=>n.className==='loadout-console'),true,'装备页必须保留已装备接口');assert.match(markup,/铁刀/);assert.doesNotMatch(markup,/急救包|破甲技能书|指挥权限卡/);
  s.player.equip.weapon='knife';s.inv.knife=0;view=renderView('equipment');const filledSlot=view.find(n=>String(n.className).includes('slotchip filled')),emptySlot=view.find(n=>n.className==='slotchip');assert.ok(filledSlot,'装备后人物身上的对应槽位必须进入已装备状态');assert.match(filledSlot.innerHTML,/data-item="knife"/,'已装备槽位必须显示与背包一致的物品实物图');assert.match(emptySlot.innerHTML,/ui-icon/,'未装备槽位仍应显示部位线框图标');
  view=renderView('consumable');markup=view.map(n=>n.innerHTML||'').join(' ');assert.equal(view.some(n=>n.className==='loadout-console'),false,'消耗品页不得显示装备接口');assert.match(markup,/急救包/);assert.match(markup,/破甲技能书/);assert.doesNotMatch(markup,/铁刀|指挥权限卡|废铁 3/);
  view=renderView('special');markup=view.map(n=>n.innerHTML||'').join(' ');assert.equal(view.some(n=>n.className==='loadout-console'),false,'特殊道具页不得显示装备接口');assert.match(markup,/指挥权限卡/);assert.doesNotMatch(markup,/急救包|破甲技能书|铁刀|废铁 3/);
}

{
  const s=reset();
  assert.equal(s.player.stamina,100,'新档初始体力必须为100');
  assert.equal(s.sound,true,'新档必须启用真实音效');assert.equal(s.music,true,'新档必须启用背景音乐');assert.equal(s.vibration,true,'新档必须默认启用且允许关闭触觉反馈');
  assert.equal(s.soundVolume,.65);assert.equal(s.musicVolume,.30);
  s.player.stamina=0;a.rest();
  assert.equal(s.player.stamina,100,'休息必须恢复到新的100点基础体力上限');
}
{
  const s=reset();assert.equal(a.musicSceneId(),'camp');s.player.location='setHub';assert.equal(a.musicSceneId(),'settlement');s.player.location='outer';assert.equal(a.musicSceneId(),'surface');s.player.location='layer2';assert.equal(a.musicSceneId(),'ark');s.player.location='fungal';assert.equal(a.musicSceneId(),'depth');s.player.location='orbitalGraveyard';assert.equal(a.musicSceneId(),'space');a.startCombat('scrapDrone');assert.equal(a.musicSceneId(),'combat','战斗开始后必须立即切换战斗音乐');
}

{
  const s=reset();Object.assign(s.inv,{scrap:7,wood:1,ingot:0,steel:0});
  const cost=a.costText({scrap:4,wood:2});
  assert.match(cost,/废铁 现有 7 \/ 需 4/,'材料成本必须同时显示当前持有量与需求量');
  assert.match(cost,/木材 现有 1 \/ 需 2/,'每一种材料都必须分别显示库存');
  assert.match(a.recipeMaterialText(a.RECIPES.fusionDrive),/需要 能源核心 Lv6[\s\S]*聚变燃料芯 现有 0 \/ 需 6/,'设施等级不足时也不能隐藏制造材料库存');
  Object.keys(a.TECHS).forEach(id=>s.meta.techs[id]=1);
  const construction=new FakeElement();a.renderConstruction(construction);const constructionHtml=[];(function walk(node){if(node.innerHTML)constructionHtml.push(node.innerHTML);(node.children||[]).forEach(walk);})(construction);
  assert.match(constructionHtml.join(' '),/废铁 现有 7 \/ 需 4/,'建筑管理中的建造成本必须显示已有数量');
  s.meta.built.work=true;s.meta.buildLevels.work=1;const workshop=new FakeElement(),workshopNodes=[];a.renderBuilding(workshop,'work');const workshopHtml=[];(function walk(node){workshopNodes.push(node);if(node.innerHTML)workshopHtml.push(node.innerHTML);(node.children||[]).forEach(walk);})(workshop);
  assert.match(workshopHtml.join(' '),/data-item="wood"[\s\S]*木材[\s\S]*现有 1 \/ 需 2/,'制造配方必须用材料图标显示已有数量');
  assert.ok(workshopNodes.some(n=>n.className==='facility-upgrade-trigger'),'设施升级必须收进右上角入口');assert.doesNotMatch(workshopHtml.join(' '),/精密工坊/,'升级详情不得常驻占用设施页面');
  s.meta.techs.make_4=0;s.tutorial.complete=true;s.siteSheet={kind:'facilityUpgrade',id:'work'};document.body.children=[];a.renderSiteSheet(new FakeElement());const upgradeNodes=[],upgradeHtml=[];(function walk(node){upgradeNodes.push(node);if(node.innerHTML)upgradeHtml.push(node.innerHTML);(node.children||[]).forEach(walk);})(document.body);
  assert.match(upgradeHtml.join(' '),/精密工坊[\s\S]*data-item="ingot"[\s\S]*铁锭[\s\S]*现有 0 \/ 需 4/,'升级弹层必须用材料图标显示已有数量');
  assert.match(upgradeHtml.join(' '),/高温冶炼[\s\S]*未解锁/,'科技未解锁时升级弹层仍须展示科技与材料详情');assert.equal(upgradeNodes.find(n=>n.className==='site-sheet-primary').disabled,true,'条件不足时弹层确认升级必须禁用');
  assert.match(a.outpostBuildStatus(a.OUTPOST_BUILDINGS[0]).text,/现有 0 \/ 需 4/,'前哨尚未满足环境条件时也必须显示建造材料库存');
}

{
  const s=reset();s.meta.built.smelt=true;s.meta.buildLevels.smelt=1;s.meta.techs.make_1=1;
  const furnace=new FakeElement(),nodes=[];a.renderBuilding(furnace,'smelt');const html=[];(function walk(node){nodes.push(node);if(node.innerHTML)html.push(node.innerHTML);(node.children||[]).forEach(walk);})(furnace);
  assert.match(html.join(' '),/木材炼铁/,'熔炉必须显示科技已经解锁的配方');
  assert.doesNotMatch(html.join(' '),/冶炼铜锭|高温炼钢|真空冶炼钛合金|星舰级铱合金/,'熔炉不得提前显示科技尚未解锁的配方');
  assert.match(html.join(' '),/data-item="ingot"[\s\S]*data-item="scrap"/,'熔炼成品与所需材料必须使用现有物品图标');
  const splitScreen=nodes.find(n=>hasClass(n,'recipe-station-screen')),splitTop=nodes.find(n=>hasClass(n,'recipe-station-top')),splitBottom=nodes.find(n=>hasClass(n,'recipe-station-bottom'));
  assert.ok(splitScreen&&splitTop&&splitBottom,'生产设施必须拆分成上方配方选择区与下方固定操作区');
  const operationScreen=nodes.find(n=>hasClass(n,'facility-operation-screen'));assert.ok(hasClass(operationScreen.children.at(-1),'facility-operation-closebar'),'建筑操作关闭按钮必须固定在全屏容器最底部');
  assert.equal(nodes.some(n=>String(n.className).includes('facility-back')),false,'建筑操作页不得继续在顶部占用返回按钮空间');
  assert.equal(nodes.some(n=>hasClass(n,'station-equipment-profile')),false,'材料精炼配方不应展示装备属性');
  assert.ok(nodes.some(n=>n.className==='station-detail-body'),'下半屏材料内容必须拥有独立滚动容器');
  assert.deepEqual(nodes.filter(n=>n.className==='station-step').map(n=>n.innerHTML),['-100','-10','+10','+100'],'批量控制必须提供正负10与100');
  assert.equal(nodes.find(n=>n.className==='station-quantity').value,1,'操作台生产数量必须默认为1');
  assert.equal(nodes.some(n=>n.className==='station-status'),false,'操作台底部不得重复显示材料充足与本次批数');
  assert.equal(nodes.find(n=>String(n.className).includes('station-confirm')).textContent,'确认熔炼 · 1 批');
  assert.equal(a.craftStationPresentation({st:'work'}).confirm,'确认制造');assert.equal(a.craftStationPresentation({st:'chem'}).confirm,'确认合成');assert.equal(a.craftStationPresentation({st:'elec'}).confirm,'确认装配','不同建筑必须使用符合工艺语义的确认动作');
}
{
  const s=reset();Object.keys(a.TECHS).forEach(id=>s.meta.techs[id]=1);s.meta.built.armor=true;s.meta.buildLevels.armor=1;
  const armor=new FakeElement(),nodes=[];a.renderBuilding(armor,'armor');(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(armor);
  const profile=nodes.find(n=>hasClass(n,'station-equipment-profile'));assert.ok(profile,'装备制造配方选中后必须展示装备属性');
  assert.match(profile.innerHTML,/装备属性[\s\S]*残骸级[\s\S]*防\+4[\s\S]*生命\+20/,'装备配方属性必须复用背包装备的完整数值口径');
}
{
  const s=reset();Object.keys(a.TECHS).forEach(id=>s.meta.techs[id]=1);Object.keys(a.ITEMS).forEach(id=>s.inv[id]=99);s.meta.built.starDock=true;s.meta.buildLevels.starDock=2;
  const dock=new FakeElement(),nodes=[];a.renderBuilding(dock,'starDock');(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(dock);
  assert.equal(nodes.filter(n=>n.className==='station-product-grid').length,2,'星舰船坞必须在上半屏同时保留舰体组件与轨道装备两组选择');
  assert.equal(nodes.filter(n=>String(n.className).includes('station-detail-workbench')).length,1,'多配方组只能共用一张下半屏操作卡，不能互相叠加');
  s.meta.built.droneBay=true;s.meta.buildLevels.droneBay=1;const drone=new FakeElement(),droneNodes=[];a.renderBuilding(drone,'droneBay');(function walk(node){droneNodes.push(node);(node.children||[]).forEach(walk);})(drone);
  assert.ok(droneNodes.some(n=>hasClass(n,'recipe-station-screen'))&&droneNodes.some(n=>String(n.className).includes('station-detail-workbench')),'无人机装配配方也必须使用同一上下分屏');
}

{
  const s=reset();s.meta.techs.auto_5=1;s.meta.built.watch=true;s.meta.buildLevels.watch=1;Object.assign(s.inv,{wood:99,stone:99,scrap:99,ingot:99});
  a.buildDefense('wall');const afterFirst={wood:s.inv.wood,stone:s.inv.stone,scrap:s.inv.scrap,time:s.time};a.buildDefense('wall');
  assert.equal(s.defenses.filter(d=>d.key==='wall').length,1,'同一种防御工事只能建造一次');assert.deepEqual({wood:s.inv.wood,stone:s.inv.stone,scrap:s.inv.scrap,time:s.time},afterFirst,'重复建造请求不得再次扣材料或消耗时间');
  const watch=new FakeElement(),nodes=[];a.renderBuilding(watch,'watch');(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(watch);const rows=nodes.filter(n=>n.className==='operation-row'),wallRows=rows.filter(n=>n.children[0].innerHTML.includes('简易围墙'));
  assert.equal(wallRows.length,1,'已建工事在哨戒塔中只能保留一条操作记录');assert.equal(wallRows[0].children[1].innerHTML,'升级','建成后只能显示升级操作');assert.ok(rows.some(n=>n.children[0].innerHTML.includes('建造 绊索地雷')),'其他尚未建造的工事仍应允许建造');
}

{
  const s=reset();s.meta.built.work=true;s.meta.buildLevels.work=1;s.meta.techs.arms_3=1;Object.assign(s.inv,{ingot:10,copperScrap:10});
  assert.equal(a.craft(a.RECIPES.ammo,10),true);assert.equal(s.inv.ingot,0);assert.equal(s.inv.copperScrap,0);assert.equal(s.inv.ammo,100,'批量制造必须按配方单批产量累计成品');assert.equal(s.time,10,'批量制造必须按批次累计用时');
}

{
  const s=reset();s.meta.built.smelt=true;s.meta.buildLevels.smelt=1;s.meta.techs.make_1=1;Object.assign(s.inv,{scrap:30,wood:20});
  assert.equal(a.smelt(a.SMELT.find(x=>x.id==='ironWood'),10),true);assert.equal(s.inv.scrap,0);assert.equal(s.inv.wood,0);assert.equal(s.inv.ingot,10,'批量熔炼必须按批次累计产出');assert.equal(s.time,10);
}

{
  const s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=1;Object.assign(s.inv,{ration:10,mutantMeat:10});
  assert.equal(a.cookFood('nutriStew',false,10),true);assert.equal(s.inv.nutriStew,10,'厨房也必须兑现操作台批量数量');assert.equal(s.time,10);
}

{
  const s=reset();s.meta.built.recycler=true;s.meta.buildLevels.recycler=1;Object.assign(s.inv,{wood:30,stone:30});
  assert.equal(a.recycleMaterial('rubble',10),true);assert.equal(s.inv.wood,0);assert.equal(s.inv.stone,0);assert.equal(s.inv.scrap,20,'回收中心也必须兑现操作台批量数量');assert.equal(s.time,10);
}

{
  const result=a.feedbackSpec([{text:'扫描到废弃容器。',cls:'story'},{text:'获得：废铁×2',cls:'good'},{text:'返程体力偏低。',cls:'warn'}]);
  assert.equal(result.tone,'is-warning','一次操作含警告时反馈色必须升级为警告态');
  assert.deepEqual(Array.from(result.lines,x=>x.text),['返程体力偏低。'],'轻提示只保留最高优先级的一条结果，不能用多行通知覆盖操作区');
  assert.ok(result.duration<=1800,'非剧情轻提示必须在 1.8 秒内消失');
  const compact=a.feedbackSpec([{text:'环境噪声。',cls:'dim'},{text:'没有取得新情报。',cls:'dim'},{text:'重复',cls:'dim'},{text:'重复',cls:'dim'}]);
  assert.equal(compact.lines.length,1,'普通轻提示也只能保留最后一条去重结果');
}

{
  const s=reset();s.player.location='outer';
  const investigate=a.fieldActionPresentation('outer',{mode:'investigate',desc:''},a.resourceSiteOf('outer'));
  assert.match(investigate.eyebrow,/推进地图与任务/,'探索主行动必须先说明它会推进什么');assert.match(investigate.desc,/发现路线、任务线索与现场机关/,'探索主行动必须明确可能产出');
  const first=a.fieldDirective('outer');assert.match(first.title,/任务信号|现场基准/);assert.match(first.text,/深入勘察/,'第一次抵达必须直接给出推荐行动');
  assert.match(a.flavor('outer'),/风|黑木|碎岩/,'地表空结果也必须保留现场感，而不是通用失败句');
}

{
  const css=fs.readFileSync(__dirname+'/style.css','utf8');
  const uiCss=fs.readFileSync(__dirname+'/ui-system.css','utf8');
  assert.match(css,/\*\s*\{[^}]*user-select:\s*none/s,'整个游戏界面必须禁用文字选择，避免拖动时误选文本');
  assert.match(css,/\.item \.iicon\s*\{[^}]*width:32px[^}]*height:32px/s,'背包实物图必须保持紧凑，不能重新撑大物品格');
  const html=fs.readFileSync(__dirname+'/index.html','utf8');
  assert.match(html,/ui-system\.css\?v=[^"']+/,'全局设计系统必须在页面样式之后加载');
  assert.ok(html.indexOf('style.css')<html.indexOf('ui-system.css'),'统一设计系统必须在页面基础样式之后覆盖加载');
  assert.doesNotMatch(source,/紧急撤离|emergencyEvacuate/,'探索界面和逻辑中不得保留紧急撤离');
  assert.match(html,/data-ui="abyss-frame"/,'应用必须显式启用 ABYSS FRAME 主题');
  assert.match(html,/id="icon-close"[\s\S]*id="icon-weapon"/,'系统控制与十槽装备必须使用同一套 SVG 图标精灵');
  assert.match(uiCss,/--ui-energy:\s*#39d3eb/,'设计系统必须提供统一能源色令牌');
  assert.match(uiCss,/\.ui-button--primary/,'设计系统必须提供可复用的主按钮组件');
  assert.match(uiCss,/#panel button\.slotchip:active\s*\{[^}]*transform:translate\(-50%,-50%\)/,'装备部位按下态必须保留绝对定位居中偏移，不能被全局按钮缩放覆盖');
  assert.match(uiCss,/--hud-status-h:[^;]+;[\s\S]*--hud-tabs-h:/,'所有页面必须共用底部 HUD 尺寸令牌');
  assert.match(uiCss,/\.tedge-rail[\s\S]*\.tedge\.next\.hi/,'树连线必须有交叉隔离底轨和独立的焦点状态层级');
  assert.match(uiCss,/\.tport\.next\.hi\s*\{[^}]*stroke:var\(--ui-warning\)/,'待研究焦点线与目标接口必须保持同一琥珀色');
  assert.match(uiCss,/prefers-reduced-motion:reduce/,'设计系统必须支持减少动态效果');
  assert.match(css,/\.recipe-station-screen\{[^}]*grid-template-rows:minmax\(0,43fr\) minmax\(0,57fr\)/,'全屏生产页必须优先给配方详情保留57%的内容高度');
  assert.match(css,/#app\.facility-fullpage #metabar,#app\.facility-fullpage #tabbar\{display:none\}/,'建筑操作全屏时必须收起上下两组常驻 HUD');
  assert.match(css,/#app\.npc-fullpage #metabar,#app\.npc-fullpage #tabbar\{display:none\}/,'NPC 交互必须独占整屏并收起常驻 HUD');
  assert.match(css,/\.npc-terminal\{[^}]*height:100%[^}]*grid-template-rows:[^}]*minmax\(0,1fr\)[^}]*overflow:hidden/s,'NPC 终端必须锁定为一屏并预留固定底部操作区');
  assert.match(css,/\.npc-content-scroll\{[^}]*min-height:0[^}]*overflow-y:auto/,'NPC 页只能让中间内容区内部滚动');
  assert.match(css,/\.npc-portrait\{[^}]*object-fit:contain/,'NPC 全身立绘必须完整显示，不能再裁成半身');
  assert.match(css,/\.facility-operation-screen\{[^}]*grid-template-rows:minmax\(0,1fr\) auto/,'全屏建筑操作必须把关闭区固定在内容区下方');
  assert.match(css,/\.recipe-station-top\{[^}]*overflow-y:auto/,'上半屏必须可以独立滚动选择配方');
  assert.match(css,/\.recipe-station-bottom\{[^}]*overflow:hidden/,'下半屏必须固定，不能跟随配方列表滚走');
  assert.match(css,/\.station-detail-workbench \.station-detail-body\{[^}]*overflow-y:auto/,'材料较多时只能滚动下半屏内容，确认按钮仍固定');
  assert.match(css,/#panel \.station-detail-workbench \.station-step\{[^}]*height:26px!important[^}]*min-height:26px!important/,'四个批量按钮必须统一压低至26px');
  assert.match(css,/#panel \.station-detail-workbench \.station-quantity[^}]*height:26px!important[^}]*min-height:26px!important[^}]*padding:0 3px!important/,'数量输入框必须覆盖全局44px表单高度并与加减按钮齐平');
  assert.match(css,/\.local-backup-card small,\.local-backup-card b,\.local-backup-card em\{display:block\}/,'手机设置页的本地备份标签、标题与说明必须分层显示，不能横向重叠');
  assert.match(css,/#panel\[data-view="settings"\]\.settings-home\{[^}]*display:flex[^}]*overflow:hidden/,'设置概览必须锁定在一屏，不能继续依赖整页滚动');
  assert.match(css,/\.settings-dashboard\{[^}]*grid-template-rows:auto minmax\(0,1fr\) auto auto/,'设置概览必须把声音区域压缩到剩余空间并固定存档与底部操作');
  assert.match(source,/LOCAL_BACKUP_FORMAT='abyss_echo_backup_v2'[\s\S]*PBKDF2[\s\S]*AES-GCM/,'本地备份必须使用密码派生密钥与带认证加密');
  assert.match(source,/function renderSetPanel\(box\)\{[\s\S]{0,220}settingsView==='cloud'[\s\S]*settings-home/,'设置页必须将低频迁移详情收进二级页并保留紧凑概览');
  assert.match(html,/style\.css\?v=[^"']*cloudmanual1[\s\S]*game\.js\?v=[^"']*cloudmanual1/,'手动迁移脚本与样式必须同时更新缓存版本，避免 Safari 混用旧资源');
  assert.match(html,/style\.css\?v=[^"']*securebackup2settingsfit2[\s\S]*game\.js\?v=[^"']*securebackup2settingsfit2/,'加密备份与设置布局必须同步刷新缓存版本');
  assert.match(html,/id="action-feedback"[^>]*aria-live="polite"[^>]*aria-atomic="true"/,'操作反馈必须位于持久且可访问的实时提示层');
  assert.match(source,/function installInteractionFeedback\(\)[\s\S]*navigator\.vibrate\(8\)/,'手机按钮必须统一提供轻触震动反馈');
  assert.match(source,/function renderMapFab\(\)[\s\S]{0,420}state\.campBuilding/,'设施操作页必须收起地图快捷键，避免遮挡固定确认按钮');
  assert.match(source,/state&&state\.vibration!==false[\s\S]*navigator\.vibrate\(8\)/,'轻触震动必须受独立设置开关控制');
  assert.match(source,/globalThis\.AudioContext\|\|globalThis\.webkitAudioContext[\s\S]*function playSfx\(kind\)/,'音效开关必须连接真实 WebAudio 输出');
  assert.match(source,/const MUSIC_THEMES=\{[\s\S]*camp:\{[\s\S]*settlement:\{[\s\S]*surface:\{[\s\S]*ark:\{[\s\S]*depth:\{[\s\S]*space:\{[\s\S]*combat:\{/,'背景音乐必须覆盖营地、聚居地、荒野、舰内、地下、星际与战斗场景');
  assert.match(source,/function scheduleAmbientBar\(\)[\s\S]*theme\.notes\.forEach[\s\S]*root\*ratio/,'背景音乐必须生成手机扬声器可听见的旋律声部');
  assert.match(source,/pointerdown[^\n]*const audioReady=unlockAudio\(\),b=buttonFrom\(e\)/,'首次触摸任意位置都必须尝试启动背景音乐，不能只响应按钮');
  assert.match(source,/function stopAudioVoices\(voices\)[\s\S]*voice\.osc\.stop\(\)[\s\S]*stopAudioVoices\(audioRuntime\.musicVoices\)/,'关闭音乐时必须停止已排程声部，不能重新漏出尾音');
  assert.match(source,/document\.hidden\)[\s\S]*audioRuntime\.ctx\.suspend\(\)/,'应用进入后台时必须暂停音频上下文');
  assert.match(source,/settingsVolume\('musicVolume'[\s\S]*settingsToggle\('vibration'/,'设置页必须提供震动开关和真实音量控制');
  assert.match(source,/pressedPointers=new Map\(\)[\s\S]*pressedPointers\.get\(e\.pointerId\)/,'滑出按钮后也必须按 pointerId 清理原始按压态');
  assert.match(source,/function flushFeedbackBatch\(batch\)[\s\S]*state&&state\.combat[\s\S]*dismissActionFeedback\(true\)/,'战斗中必须使用战斗反馈区并彻底清除旧提示');
  assert.match(source,/function upgradeFacility\(id\)[\s\S]{0,700}state\.siteSheet=null[\s\S]{0,200}toast:false/,'设施升级后必须关闭弹层、回到原设施并禁止冗余浮层通知');
  assert.match(source,/function upgradeMastery\(k\)[\s\S]{0,500}markInlineChange\('mastery',k\)[\s\S]{0,150}toast:false/,'精通升级必须用原卡片高亮反馈，不能弹出遮挡按钮的通知');
  assert.match(uiCss,/button\.is-touching[\s\S]*scale\(\.97\)/,'按钮按下态必须比原有轻微缩放更明显');
  assert.match(uiCss,/\.action-feedback\.is-visible\s*\{[^}]*opacity:1/,'文字反馈必须提供明确的出现状态');
  assert.match(uiCss,/\.action-feedback\[hidden\]\s*\{[^}]*display:none!important/,'无内容时反馈容器不得露出空框');
  assert.match(uiCss,/\.action-feedback\s*\{[^}]*top:calc\([^}]*bottom:auto[^}]*pointer-events:none/s,'轻提示必须固定在顶部且完全不拦截页面操作');
  assert.match(uiCss,/#feedback-messages p:last-child\s*\{[^}]*white-space:nowrap/,'轻提示只显示一行摘要，完整剧情留在现场记录');
  assert.match(uiCss,/\.settings-switch\.on[\s\S]*settings-volume input\[type="range"\]/,'声音设置必须使用统一开关与可触摸音量滑块组件');
  const manifest=fs.readFileSync(path.join(__dirname,'..','android','app','src','main','AndroidManifest.xml'),'utf8');
  assert.match(manifest,/android\.permission\.VIBRATE/,'安卓外壳必须声明震动权限才能提供真实触觉反馈');
  assert.match(manifest,/android\.permission\.ACCESS_NETWORK_STATE/,'安卓外壳必须读取当前网络类型才能保护移动流量');
  assert.match(manifest,/android\.permission\.REQUEST_INSTALL_PACKAGES/,'安卓外壳必须声明安装更新包权限');
  assert.match(manifest,/UpdateFileProvider[\s\S]*grantUriPermissions="true"/,'安卓外壳必须通过受控内容地址交给系统安装器读取 APK');
  assert.match(manifest,/android:icon="@mipmap\/ic_launcher"/,'安卓应用必须使用自适应科幻场景图标');
  assert.match(manifest,/android:roundIcon="@mipmap\/ic_launcher_round"/,'安卓应用必须提供圆形桌面图标');
  const adaptiveIcon=fs.readFileSync(path.join(__dirname,'..','android','app','src','main','res','mipmap-anydpi-v26','ic_launcher.xml'),'utf8');
  assert.match(adaptiveIcon,/ic_launcher_art_v2/,'自适应图标必须使用幸存者与坠毁方舟主视觉');
  assert.ok(fs.existsSync(path.join(__dirname,'..','android','app','src','main','res','drawable-nodpi','ic_launcher_art_v2.png')),'应用图标主视觉文件必须存在');
  const androidBuild=fs.readFileSync(path.join(__dirname,'..','android','app','build.gradle'),'utf8');
  assert.match(androidBuild,/versionCode 14/,'当前发布 APK 必须提升安装版本');
  assert.match(androidBuild,/versionName "0\.7\.4"/,'当前发布 APK 必须展示新的应用版本');
  assert.match(androidBuild,/SHELL_VERSION", "10"/,'自动安装能力必须提升外壳协议版本');
  assert.match(androidBuild,/BUNDLED_BUILD", "1788420415L"/,'最新 APK 必须内置本次完整资源版本');
  assert.match(androidBuild,/UPDATE_BASE_URL[^\n]*http:\/\/59\.110\.144\.30:9091\/app-update\//,'APK 更新资源必须固定走 59 测试服务器');
  assert.match(androidBuild,/CLOUD_SAVE_URL[^\n]*http:\/\/59\.110\.144\.30:9091\/api\/cloud-save/,'APK 云存档必须固定走 59 私人服务器');
  assert.match(androidBuild,/CLOUD_SAVE_URL/,'安卓外壳必须提供独立云存档接口地址');
  const networkSecurity=fs.readFileSync(path.join(__dirname,'..','android','app','src','main','res','xml','network_security_config.xml'),'utf8');assert.match(networkSecurity,/base-config cleartextTrafficPermitted="false"[\s\S]*domain-config cleartextTrafficPermitted="true"[\s\S]*59\.110\.144\.30/,'明文网络只能为 59 私人服务器单独放行');
  const cloudClient=fs.readFileSync(path.join(__dirname,'..','android','app','src','main','java','com','exkalib','abyssalecho','CloudSaveClient.java'),'utf8');
  assert.match(cloudClient,/setRequestMethod\("POST"\)[\s\S]*setFixedLengthStreamingMode/,'APK 必须通过原生 POST 桥接云存档，不能依赖 WebView 混合内容请求');
  const mainActivity=fs.readFileSync(path.join(__dirname,'..','android','app','src','main','java','com','exkalib','abyssalecho','MainActivity.java'),'utf8');assert.match(mainActivity,/@JavascriptInterface[\s\S]{0,120}cloudRequest\(/,'APK 必须把云存档请求桥接给网页资源');assert.match(mainActivity,/handleMainPageReady\(\)[\s\S]{0,420}checkForUpdates\(true\)/,'开屏资源加载完后必须自动检查更新');assert.match(mainActivity,/TRANSPORT_WIFI/,'启动更新必须识别 Wi-Fi 网络');assert.match(mainActivity,/setTitle\("当前不是 Wi-Fi 网络"\)[\s\S]{0,520}setNegativeButton\("退出游戏"[\s\S]{0,180}finishAndRemoveTask/,'非 Wi-Fi 更新必须确认，拒绝后退出游戏');assert.match(mainActivity,/setCancelable\(false\)/,'移动网络更新确认不得通过返回键绕过');assert.match(mainActivity,/onError\(String message\)[\s\S]{0,700}releaseLaunchGate\("offline"/,'普通更新节点不可用时必须允许本地离线游玩');assert.match(mainActivity,/downloadNativeUpdate\(update, listener\)/,'原生更新必须先在应用内下载安装包');assert.match(mainActivity,/UpdateFileProvider\.contentUri[\s\S]{0,420}FLAG_GRANT_READ_URI_PERMISSION[\s\S]{0,260}startActivity\(install\)[\s\S]{0,120}finishAndRemoveTask/,'只有系统安装界面成功拉起后才能关闭旧版应用');assert.match(mainActivity,/showNativeUpdateFallback[\s\S]{0,850}手动下载/,'自动下载或安装失败时必须保留手动下载入口');assert.doesNotMatch(mainActivity,/startActivity\(new Intent\(Intent\.ACTION_VIEW, Uri\.parse\(apkUrl\)\)\);\s*finishAndRemoveTask/,'打开下载地址后不得立刻闪退');
  const bundleUpdater=fs.readFileSync(path.join(__dirname,'..','android','app','src','main','java','com','exkalib','abyssalecho','BundleUpdater.java'),'utf8');assert.match(bundleUpdater,/onUpdateAvailable\(UpdateInfo update\)[\s\S]*downloadAndInstall\(UpdateInfo update/,'更新器必须先报告发现更新，再由网络策略决定是否下载');assert.match(bundleUpdater,/listener\.onProgress\(progress\)/,'资源下载必须把真实百分比回传开屏');assert.match(bundleUpdater,/apkUrl\.startsWith\(BuildConfig\.UPDATE_BASE_URL\)/,'安卓外壳更新不得跳转到签名清单之外的下载源');assert.match(bundleUpdater,/apkSha256[\s\S]{0,500}apkSize/,'原生安装包必须使用签名清单中的哈希与大小校验');assert.match(bundleUpdater,/downloadNativeUpdate[\s\S]{0,900}安装包校验失败/,'原生安装包必须下载后校验再交给系统安装');assert.match(bundleUpdater,/activeRoot\(\)[\s\S]{0,180}build <= BuildConfig\.BUNDLED_BUILD/,'安装新 APK 后必须忽略设备里遗留的旧下载资源');
  const localClient=fs.readFileSync(path.join(__dirname,'..','android','app','src','main','java','com','exkalib','abyssalecho','LocalContentWebViewClient.java'),'utf8');assert.match(localClient,/onPageFinished[\s\S]{0,180}pageReadyListener\.onMainPageReady/,'原生层必须等待开屏脚本加载完成后再启动更新检查');
  const cloudStore=fs.readFileSync(path.join(__dirname,'..','netlify','lib','blob-cloud-save.mjs'),'utf8');assert.match(cloudStore,/getWithMetadata[\s\S]*consistency: "strong"[\s\S]*onlyIfMatch/,'备用 Netlify 迁移实现必须保留强一致 Blob 与 ETag 条件写入');assert.match(cloudStore,/archiveFor\(next, record\)/,'备用实现的当前版与上一版必须原子替换');assert.doesNotMatch(cloudStore,/previousBlobKey|rememberPrevious/,'备用实现不得分两次写入当前版和上一版');
  const cloudFunction=fs.readFileSync(path.join(__dirname,'..','netlify','functions','cloud-save.mjs'),'utf8');assert.match(cloudFunction,/getStore[\s\S]*BlobCloudSaveStore/,'以后迁回 Netlify 时仍应使用按请求读写的 Blobs');assert.doesNotMatch(cloudFunction,/@netlify\/database|PostgresCloudSaveStore/,'备用实现不得重新连接常驻计费数据库');assert.match(cloudFunction,/59\.110\.144\.30:9091/,'备用迁移实现必须允许 59 网页源');assert.match(cloudFunction,/Access-Control-Allow-Origin[\s\S]*request\.method === "OPTIONS"/,'备用迁移实现必须正确处理受限跨域预检');assert.match(cloudFunction,/path: "\/api\/cloud-save"[\s\S]*aggregateBy: \["ip", "domain"\][\s\S]*windowLimit: 8/,'备用迁移实现必须保留平台限流');
  const cloudDataMigration=fs.readFileSync(path.join(__dirname,'..','netlify','functions','migrate-cloud-saves-to-blobs.mjs'),'utf8');assert.match(cloudDataMigration,/CLOUD_MIGRATION_TOKEN[\s\S]*timingSafeEqual[\s\S]*MARKER_KEY[\s\S]*alreadyMigrated/,'旧数据库迁移必须使用长令牌并在成功后永久自锁');assert.match(cloudDataMigration,/previousByCode[\s\S]*currentBlobKey[\s\S]*current: record,[\s\S]*previous/,'现有云存档及其上一版本必须一次性迁入同一个 Blob');
  const netlifyConfig=fs.readFileSync(path.join(__dirname,'..','netlify.toml'),'utf8');assert.doesNotMatch(netlifyConfig,/\.netlify\/functions\/cloud-save|59\.110\.144\.30/,'备用迁移接口不得暴露绕过限流的默认 Function 路径');assert.match(netlifyConfig,/publish = "netlify\/public"[\s\S]*ignore = "[^"]*git diff --quiet[^\n]*netlify/,'普通游戏提交必须继续跳过 Netlify 构建');
  const staticServer=fs.readFileSync(path.join(__dirname,'..','deploy','serve_static.py'),'utf8');assert.match(staticServer,/SAVE_API = "\/api\/cloud-save"[\s\S]*HISTORY_LIMIT = 2[\s\S]*WRITE_COOLDOWN_SECONDS = 30/,'59 必须直接提供仅保留当前与上一版的手动云存档接口');assert.match(staticServer,/class CloudSaveStore[\s\S]*BEGIN IMMEDIATE[\s\S]*_prune_history/,'59 云存档写入必须用 SQLite 事务和版本历史保护');assert.match(staticServer,/RATE_LIMIT_REQUESTS = 8[\s\S]*class RequestLimiter[\s\S]*rate_limited/,'59 云存档必须提供每 IP 请求限流');assert.match(staticServer,/ABYSS_SAVE_DB[^\n]*\/var\/lib\/abyss-echo\/saves\.sqlite3/,'59 云存档必须写入独立持久化目录');
  const updatePublisher=fs.readFileSync(path.join(__dirname,'..','deploy','publish_android_update.sh'),'utf8');assert.match(updatePublisher,/sqlite3 \/var\/lib\/abyss-echo\/saves\.sqlite3[\s\S]*saves-before-\$build\.sqlite3/,'每次发布前必须在线备份现有 SQLite 云存档');assert.match(updatePublisher,/scp "\$apk_source"[^\n]*Abyssal-Echoes\.apk\.new[\s\S]*mv[^\n]*Abyssal-Echoes\.apk\.new[^\n]*Abyssal-Echoes\.apk/,'更新清单切换前必须原子同步与其配套的新 APK');assert.match(updatePublisher,/apkSha256[\s\S]*apkSize/,'签名更新清单必须包含 APK 哈希和大小');assert.match(updatePublisher,/bundle_mode[\s\S]*lean/,'旧外壳迁移时必须能发布小于其限制的精简桥接资源包');assert.match(updatePublisher,/min_shell="\$\{3:-1\}"/,'普通资源发布默认必须兼容全部已发行外壳，原生升级只能显式触发');
  assert.match(source,/REQUIRED_NATIVE_SHELL=10[\s\S]*legacyNativeUpgradeRequired[\s\S]*requestLegacyNativeUpgrade/,'旧外壳必须先加载桥接资源，再打开新版 APK 下载而不是直接退出');
  assert.match(source,/CLOUD_ENDPOINT='\/api\/cloud-save'/,'59 网页版必须同源调用私人服务器云存档接口');
  assert.match(source,/CLOUD_COOLDOWN_SECONDS=\{read:10,write:30\}[\s\S]*function cloudCooldownRemaining[\s\S]*function beginCloudCooldown/,'云存档客户端必须提供读取 10 秒和写入 30 秒冷却');
  assert.match(source,/function cloudRequest\(body\)\{[\s\S]{0,260}cloudCooldownRemaining\(action\)[\s\S]{0,260}beginCloudCooldown\(action\)/,'所有云端请求必须在网络调用前统一执行冷却检查');
  assert.match(source,/TAB_LEASE_KEY[\s\S]*showTabLeaseOverlay[\s\S]*接管当前标签页/,'同一浏览器多标签必须采用单写入租约并提供明确接管入口');
  assert.match(source,/tabLeasePreserved=true[\s\S]{0,120}location\.reload\(\)/,'接管标签页重载期间不得释放租约让旧标签抢回写权限');
  assert.doesNotMatch(source,/else if\(!tabLeaseOwner\)claimTabLease/,'等待中的旧标签不得在活跃页重载时自动抢回写权限');
  assert.match(source,/installSaveAndReload[\s\S]{0,500}tabLeasePreserved=true;globalThis\.location\.reload/,'载入云档或本地备份时必须持续持有当前写入租约');
  assert.match(source,/installSaveAndReload\(save,binding\)[\s\S]{0,180}state=save;[\s\S]{0,180}localStorage\.setItem/,'载入云档时必须先替换内存状态，避免重载前的收尾渲染把旧档写回');
  assert.match(source,/function uploadCloudSave\(\)[\s\S]{0,900}baseRevision:bindingAtStart\.revision[\s\S]{0,900}error\.status===409/,'手动上传必须携带基础版本并显式处理云端冲突');
  assert.match(source,/function save\(\)[\s\S]{0,360}localStorage\.setItem[\s\S]{0,180}markCloudArchiveOutdated/,'正常游玩只能写本地存档并标记迁移副本过期，不能上传服务器');
  assert.doesNotMatch(source,/setupCloudSync|cloudPollTimer|cloudSyncTimer|addEventListener\('online',[^\n]*cloud/,'单机模式不得保留启动、联网恢复或定时云同步');
  assert.match(source,/MANUAL TRANSFER[\s\S]{0,500}不会自动访问服务器/,'设置页必须明确说明只有手动迁移操作才联网');
  assert.match(source,/启动时已自动检查；也可以在这里再次手动检查/,'设置页必须准确说明启动检查和手动复查的关系');
  assert.match(source,/function prepareLocalGame\(\)\{if\(gameBooted\)return;gameBooted=true;boot\(\);\}/,'更新检查完成前不得载入本地存档');
  assert.match(source,/if\(ready\)\{prepareLocalGame\(\);[\s\S]{0,180}ui\.button\.hidden=false/,'本地存档载入后才能显示进入游戏按钮');
  assert.match(source,/function enterGameFromLaunch\(\)[\s\S]{0,420}removeAttribute\('inert'\)[\s\S]{0,260}is-exiting/,'进入按钮必须解除游戏锁定并播放退场动画');
  assert.match(source,/createLocalBackup[\s\S]*parseLocalBackup[\s\S]*LOCAL_ROLLBACK_KEY/,'设置页必须提供可移植备份并在覆盖前保存本地回滚副本');
  assert.match(source,/loadout-console/,'背包必须使用科幻装备终端容器');
  assert.match(source,/inventory-vault/,'背包物品必须使用独立物品仓容器');
  assert.match(source,/inventory-scroll/,'物品仓内容必须拥有独立滚动层，不能推动整页与底部菜单');
  assert.match(source,/openSiteSheet\(['"]item['"],id\)/,'紧凑物品格必须先打开详情弹层，不能直接装备或消耗');
  assert.match(source,/detailIcon=itemUiIcon\(ref\.id\)[\s\S]{0,1600}item-detail-emblem/,'物品详情主视觉必须复用物品仓的科幻实物图，不能放大 Emoji');
  assert.match(source,/mchip',itemUiIcon\(id\)/,'材料分类必须继续使用统一物品实物图');
  assert.match(source,/iicon">'\+itemUiIcon\(id\)/,'装备和特殊道具分类必须继续使用统一物品实物图');
  const itemIds=vm.runInContext('Object.keys(ITEMS)',sandbox);
  assert.equal(itemIds.length,130,'当前130个物品必须全部进入科幻实物图系统');
  const aliases=vm.runInContext('ITEM_ART_ALIAS',sandbox);itemIds.forEach(id=>{const asset=path.join(__dirname,'assets','item-art-v1',(aliases[id]||id)+'.webp');assert.ok(fs.existsSync(asset),id+' 缺少科幻实物图');assert.ok(fs.statSync(asset).size>1000,id+' 的科幻实物图文件异常');});
  assert.match(source,/function itemUiIcon\(id\)\{const art=ITEM_ART_ALIAS\[id\]\|\|id;return '<img class="item-art" data-item="'\+id\+'" src="assets\/item-art-v1\/'\+art\+'\.webp\?v=2"/,'物品图必须统一从独立 WebP 实物资源加载，并允许终章组件复用六种不同的既有设备图');
  assert.match(css,/\.item-detail-emblem \.item-art\{[^}]*width:58px[^}]*object-fit:contain/,'详情页必须以完整比例展示实物图');
  const buildingIds=vm.runInContext('[...CAMP_BUILDINGS,...OUTPOST_BUILDINGS].map(x=>x.id)',sandbox);
  assert.equal(buildingIds.length,26,'营地与行星前哨的26座建筑必须全部进入独立实物图系统');
  buildingIds.forEach(id=>{const asset=path.join(__dirname,'assets','building-art-v1',id+(id==='research'?'.png':'.webp'));assert.ok(fs.existsSync(asset),id+' 缺少科幻建筑图');assert.ok(fs.statSync(asset).size>1000,id+' 的科幻建筑图文件异常');});
  assert.match(source,/const BUILDING_ART_EXT=\{research:'png'\}[\s\S]{0,180}function buildingUiIcon\(id\)/,'建筑图必须统一从版本化实物资源加载，并允许科技台使用透明 PNG');
  const enemyIds=vm.runInContext('Object.keys(ENEMIES)',sandbox);
  assert.equal(enemyIds.length,22,'当前22个正式敌人必须全部进入独立立绘系统');
  enemyIds.forEach(id=>{const asset=path.join(__dirname,'assets','enemy-portraits-v1',id+'.png');assert.ok(fs.existsSync(asset),id+' 缺少全身怪物立绘');assert.ok(fs.statSync(asset).size>100000,id+' 的怪物立绘文件异常');});
  assert.match(source,/function enemyPortraitSrc\(id\)\{return ENEMY_PORTRAIT_ROOT\+enemyPortraitId\(id\)\+'\.png\?v=1';\}/,'怪物立绘必须统一从版本化资源目录加载');
  assert.equal(vm.runInContext('ENEMIES.cleaner.mech',sandbox),true,'清洁机器人立绘与战斗类型必须一致标记为机械单位');
  assert.match(css,/\.camp-layout\s*\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/,'营地设施必须使用每行四个的手机宫格');
  assert.match(css,/\.cf-icon[^}]*width:62px[^}]*height:62px[\s\S]{0,500}\.cf-copy small,\.cf-copy em\{display:none\}/,'设施宫格必须使用上图标、下名称的紧凑结构');
  assert.doesNotMatch(source,/item-detail-facts/,'物品详情不得使用重复、笨重的三栏参数表');
  assert.match(source,/item-detail-titlebar[\s\S]{0,1200}物品说明[\s\S]{0,1200}装备属性/,'物品详情必须按标题、说明和装备属性建立清晰层级');
  assert.match(css,/\.item-detail-sheet \.site-sheet-close\{[^}]*border-left:1px solid[^}]*border-radius:0[^}]*background:transparent/s,'物品详情关闭按钮必须并入标题栏，不能继续使用悬浮圆形按钮');
  assert.match(css,/\.itemgrid\s*\{[^}]*repeat\(5,minmax\(0,1fr\)\)/,'手机物品仓应使用五列紧凑物品格');
  assert.match(source,/panelOpen && !\[['"]char['"],['"]bag['"],['"]task['"],['"]set['"]\]\.includes\(state\.tab\)/,'自带模块标题的整页入口不应重复渲染旧标题与关闭栏');
  assert.match(html,/viewport-fit=cover/,'顶栏必须启用手机安全区');
  assert.match(html,/id="launch-screen"[\s\S]*id="launch-title">深渊回响[\s\S]*id="launch-status"[\s\S]*id="launch-enter"/,'启动页必须提供品牌、更新状态与进入游戏按钮');
  assert.match(html,/id="app" inert aria-hidden="true"/,'完成版本检查并点击进入前，游戏主体必须保持锁定');
  assert.match(html,/style\.css\?v=[^"']*launch2[\s\S]*game\.js\?v=[^"']*launch2/,'开屏脚本与样式必须同时刷新缓存版本');
  const launchArt=path.join(__dirname,'assets','launch-crash-ark.jpg');assert.ok(fs.existsSync(launchArt)&&fs.statSync(launchArt).size>100000,'坠舰开屏必须使用项目内的高清独立背景图');
  assert.match(css,/\.launch-art\{[^}]*launch-crash-ark\.jpg/,'开屏必须加载坠舰背景图');
  assert.match(css,/\.launch-console\{[^}]*border:0[^}]*background:none[^}]*box-shadow:none[^}]*backdrop-filter:none/,'启动入口必须融入背景，不能保留独立 HUD 面板');
  assert.match(css,/\.launch-enter\{[^}]*width:min\(82%,292px\)[^}]*min-height:44px[^}]*border:0!important[^}]*clip-path:none[^}]*box-shadow:none!important/,'进入游戏必须使用无框窄入口，同时保留手机点击面积');
  assert.match(css,/@keyframes launch-art-breathe[\s\S]*@keyframes launch-haze-a[\s\S]*@keyframes launch-signal-pulse/,'开屏必须具有镜头、雾层与轻量信号动效');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[^}]*\.launch-art/,'开屏动效必须遵循系统减少动态效果设置');
  assert.match(html,/<header id="metabar">[\s\S]*id="statusbar"[\s\S]*class="hud-wing hud-left"[\s\S]*id="time"[\s\S]*class="hud-wing hud-right"[\s\S]*id="set-btn"/,'顶部 HUD 必须使用完整双栏状态翼，并以设置按钮替换轮回位置');
  assert.match(html,/class="hud-meta"[\s\S]{0,100}id="time"[\s\S]{0,100}id="pt-label">轮回1/,'日期与轮回信息必须合并在左上角元信息块内');
  assert.doesNotMatch(html,/<footer id="statusbar">/,'底部状态栏必须从页面结构中移除');
  assert.match(source,/\$\('pt-label'\)\.textContent='轮回'\+state\.meta\.playthrough/,'顶部必须动态显示当前轮回数');
  assert.doesNotMatch(html,/id="(?:loc-label|echo-label|frag-label)"/,'顶栏不得继续堆放地点、回响和碎片');
  assert.doesNotMatch(html,/id="log-peek"/,'底部不得再显示统一的查看记录入口');
  assert.match(html,/class="gauge sp"[\s\S]*id="stamina"[\s\S]*href="#icon-energy"/,'体力图标必须位于体力条最右侧并使用统一线性图标');
  assert.equal((html.match(/class="ti"/g)||[]).length,3,'底部只保留角色、背包、任务三个统一入口');
  assert.doesNotMatch(html,/data-tab="tech"/,'科技不得继续作为随时可见的底栏入口');
  assert.doesNotMatch(html,/👤|🎒|🔬|📋|❤|⚡/,'底部 HUD 不得混用系统 Emoji');
  assert.match(html,/class="gear-svg"/,'设置按钮必须使用中心稳定的矢量齿轮，不能依赖字体字形');
  assert.equal((html.match(/<rect x="10\.5" y="1" width="3" height="5"/g)||[]).length,8,'设置图标必须是完整八齿轮');
  assert.match(css,/@keyframes\s+gear-idle/,'移动端设置齿轮必须具有不依赖 hover 的待机动画');
  assert.match(css,/animation:gear-idle\s+6s/,'完整齿轮的待机动画周期应为6秒');
  assert.match(css,/#panel\[data-view="bag"\][^{]*\{[^}]*padding-bottom:var\(--ui-2\)[\s\S]*?\.loadout-console\{[^}]*margin-bottom:var\(--ui-2\)/,'物品仓上下间距必须共用同一个设计系统间距令牌');
  assert.match(css,/90%,100%\s*\{\s*transform:rotate\(1080deg\)/,'齿轮每次启动应连续旋转三圈');
  const js=fs.readFileSync(__dirname+'/game.js','utf8');
  assert.match(js,/function checkAppUpdate\(\)/,'设置页必须提供主动检查更新入口');
  assert.match(js,/bridge\.checkForUpdates\(\)/,'主动更新按钮必须调用安卓原生更新器');
  assert.match(js,/id=\"update-status\"/,'设置页必须显示更新过程和结果');
  assert.match(js,/确认清空并重看序章/,'重置进度必须使用页面内二次确认，避免内嵌浏览器吞掉系统确认框');
  assert.doesNotMatch(js,/function hardReset\(\)\{[^}]*confirm\(/s,'重置进度不得继续依赖原生 confirm 弹窗');
  const campHome=js.slice(js.indexOf('function renderCampHome'),js.indexOf('function renderConstruction'));
  const campHero=js.slice(js.indexOf('function renderCampHero'),js.indexOf('function renderCampContacts'));
  assert.doesNotMatch(campHome,/camp-mapbar-top|renderWorldMap/,'营地主页不得再内联展开地图');
  assert.match(campHero,/camp-hero-build[\s\S]*uiIcon\('build-control'\)\+'<span>建筑管理<\/span>'[\s\S]*state\.campView='construct'/,'建筑管理必须使用专属蓝图图标和上图下文入口');
  assert.doesNotMatch(campHero,/防线管理|has-defense-actions|camp-hero-defense/,'营地卡片不得额外显示防线管理按钮，防线只从哨戒塔进入');
  assert.match(css,/\.camp-hero-build\{[^}]*width:72px[^}]*height:52px[^}]*flex-direction:column/,'建筑管理入口必须使用紧凑的上图下文布局');
  assert.match(html,/<symbol id="icon-build-control"[\s\S]{0,300}M3 21h18/,'建筑管理必须提供独立的科幻建筑蓝图图标');
  assert.match(campHero,/campDefenseStats\(\)[\s\S]*OFFENSE[\s\S]*guard\.attack[\s\S]*ARMOR[\s\S]*guard\.defense[\s\S]*SHIELD[\s\S]*guard\.shield/,'营地概览只能展示真实的攻击、防御与护盾总值');
  assert.doesNotMatch(campHero,/FACILITIES|RAID CYCLE|夜袭未触发|已建设施/,'营地概览不得继续展示无决策意义的设施数和夜袭占位信息');
  assert.match(js,/wall:\s*\{ name:'简易围墙'[\s\S]*reinforcedWall:\{ name:'复合强化墙'[\s\S]*shieldNode:\s*\{ name:'局部护盾节点'[\s\S]*energyDome:\s*\{ name:'营地能量穹顶'/,'营地防御工事必须覆盖前期墙体、强化墙与后期能量护盾');
  assert.match(js,/function campDefenseStats\(\)[\s\S]{0,260}s\.attack\+=defAtk\(d\);s\.defense\+=defArmor\(d\);s\.shield\+=defShield\(d\)/,'营地防御统计必须分别汇总攻击、防御与护盾');
  assert.match(js,/function resolveRaid\(tutorial\)[\s\S]{0,420}guard=campDefenseStats\(\)[\s\S]*攻击 '[\s\S]*防御 '[\s\S]*护盾 '/,'夜袭结算必须读取并报告三类防线属性');
  assert.match(js,/state\.campView==='map'[\s\S]{0,160}renderWorldMap\(box\)/,'营地地图必须进入独立子页面');
  assert.match(js,/function verticalMapLayout\(canvas,positions,extra\)[\s\S]{0,360}pos\[id\]=\[x,y\]/,'世界与局部地图必须交换坐标轴改为纵向走向');
  assert.match(js,/function minZoom\(\)\{return Math\.max\(stage\.clientWidth\/canvas\.width,stage\.clientHeight\/canvas\.height\);\}/,'地图最小缩放必须由底图覆盖视窗所需比例动态决定');
  assert.match(js,/view\.x=w<=sw\?\(sw-w\)\/2:Math\.min\(0,Math\.max\(sw-w,view\.x\)\)/,'地图横向拖动必须锁定在底图边缘内');
  assert.match(js,/view\.y=h<=sh\?\(sh-h\)\/2:Math\.min\(0,Math\.max\(sh-h,view\.y\)\)/,'地图纵向拖动必须锁定在底图边缘内');
  assert.match(js,/map-close','关闭地图'/,'独立地图页必须使用明确的关闭地图按钮');
  assert.match(css,/#app\.map-fullpage #panel \.map-close\{[^}]*position:absolute[^}]*right:12px[^}]*top:50%[^}]*transform:translateY\(-50%\)/,'关闭地图必须在底部详情栏内垂直居中');
  assert.match(css,/#app\.map-fullpage #panel \.map-close:active\{[^}]*transform:translateY\(-50%\)/,'关闭地图按下时不得丢失垂直居中定位');
  assert.match(css,/#app\.map-fullpage #panel \.map-close\.is-touching\{[^}]*transform:translateY\(-50%\)!important/,'关闭地图的统一触控反馈不得覆盖垂直居中定位');
  assert.match(css,/#map-fab\{[^}]*animation:map-fab-reveal \.14s ease-out \.18s both/,'关闭地图后入口应延迟原位淡入，不能形成按钮位移错觉');
  assert.match(js,/panelScroll:panel\?panel\.scrollTop:0/,'打开地图前必须记录原场景滚动位置');
  assert.match(js,/panel\.scrollTop=restoreScroll/,'关闭地图后必须恢复原场景滚动位置');
  assert.match(js,/bottom=el\('div','map-bottom'\);bottom\.append\(detail,close\)/,'关闭地图必须与地点详情放在同一个底部操作栏内');
  assert.match(css,/#panel \.map-go,#app\.map-fullpage #panel \.map-close \{[^}]*clip-path:polygon/,'查看与关闭地图按钮必须复用同一套科幻切角结构');
  assert.match(css,/#panel \.map-go,#app\.map-fullpage #panel \.map-close \{[^}]*font-size:15px[^}]*line-height:1\.5/,'查看与关闭地图按钮必须使用相同字号与行高以确保实际高度一致');
  assert.match(css,/#app\.map-fullpage \.map-detail\{padding-right:104px\}/,'地图详情操作区必须为右下角关闭按钮预留空间');
  assert.match(js,/selected===P\(\)\.location\?'查看地点':'前往'/,'地点选择必须按当前位置显示查看或前往');
  assert.match(css,/#app\.map-fullpage #tabbar\{display:none\}/,'独立地图页必须隐藏底部主菜单');
  assert.match(fs.readFileSync(__dirname+'/ui-system.css','utf8'),/#metabar #statusbar\{[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/,'系统已将顶栏放到摄像头下方，不应再重复预留中间空列');
  assert.match(fs.readFileSync(__dirname+'/ui-system.css','utf8'),/#metabar \.hud-left\{grid-column:1;justify-content:flex-end\}[\s\S]*#metabar \.hud-right\{grid-column:2;justify-content:flex-start\}/,'生命与能量状态条必须以中线为基准镜像对齐');
  assert.match(fs.readFileSync(__dirname+'/ui-system.css','utf8'),/#metabar \.hud-meta\{[^}]*position:absolute[^}]*left:0[^}]*text-align:left/,'日期与轮回必须固定在原左上位置并左对齐');
  assert.match(fs.readFileSync(__dirname+'/ui-system.css','utf8'),/#metabar \.emblem\{[^}]*position:absolute[^}]*right:0/,'设置按钮必须固定在原右上位置');
  assert.match(fs.readFileSync(__dirname+'/ui-system.css','utf8'),/#metabar \.emblem\{[^}]*width:24px[^}]*height:24px[\s\S]*#metabar \.emblem::after\{[^}]*inset:-4px/,'设置按钮视觉应缩小并保留足够触控热区');
  assert.doesNotMatch(html,/camera-safe/,'顶部状态栏不得残留重复的摄像头留白节点');
  assert.match(html,/<span class="g-label">生命<\/span>/,'生命状态必须使用中文标签');
  assert.match(html,/<span class="g-label">能量<\/span>/,'能量状态必须使用中文标签');
  assert.match(fs.readFileSync(__dirname+'/ui-system.css','utf8'),/#metabar #statusbar\{[^}]*padding:env\(safe-area-inset-top,0px\)/,'沉浸式手机顶栏不得额外强制添加顶部留白');
  assert.match(fs.readFileSync(__dirname+'/ui-system.css','utf8'),/#metabar \.gauge\{[^}]*width:96px/,'顶部生命与体力条必须使用缩短后的紧凑宽度');
  assert.match(css,/#app\.map-fullpage #panel \.worldmap-wrap\{[^}]*margin:0[^}]*border:0[^}]*border-radius:0[^}]*box-shadow:none/,'独立地图页不得保留外层卡片边框');
  const terrainIds=['world','camp','surface','settlement','ark','depth','orbit','ashMoon','verdant','silent'];
  terrainIds.forEach(id=>{const asset=path.join(__dirname,'assets','map-terrain-v1',id+'.webp');assert.ok(fs.existsSync(asset),id+' 缺少地图地形底图');assert.ok(fs.statSync(asset).size>10000,id+' 的地图地形底图文件异常');});
  const mapRenderSource=js.slice(js.indexOf('function renderRegionMap'),js.indexOf('function renderWorldMap'));
  const regionMapSource=js.slice(js.indexOf('function renderRegionMap'),js.indexOf('function renderLocalMap'));
  assert.doesNotMatch(mapRenderSource,/appendMapLines\(/,'世界与局部地图不得继续绘制莫名其妙的节点连线');
  assert.match(regionMapSource,/n\.onclick=\(\)=>openRegion\(id\)/,'世界地图区域节点必须直接进入局部地图');
  assert.match(regionMapSource,/function openRegion\(id\)[\s\S]*state\.mapLevel='local';state\.mapRegion=id;state\.mapSelected=/,'世界地图点击后必须一次完成层级、区域和默认地点切换');
  assert.doesNotMatch(regionMapSource,/el\('button','map-go'/,'世界地图底部不得再要求点击第二次查看区域');
  assert.match(css,/\.terrain-world \.worldmap\{background-image:url\("assets\/map-terrain-v1\/world\.webp\?v=1"\)[\s\S]*\.terrain-silent \.worldmap\{background-image:url\("assets\/map-terrain-v1\/silent\.webp\?v=1"\)/,'全部世界与局部区域必须接入独立地形底图');
  assert.doesNotMatch(campHome,/renderObjectiveStrip/,'营地主页不应显示冗余的当前目标条');
  assert.doesNotMatch(js,/renderObjectiveStrip|currentObjectiveQuest|objective-strip/,'探索页不得残留已删除的当前目标条');
  assert.doesNotMatch(css,/objective-strip|obj-kicker|obj-main|obj-progress/,'已删除的当前目标条不得保留孤立样式');
  assert.doesNotMatch(campHome,/camp-construction|开始探索|move\('outer'\)/,'营地主页不得保留建筑管理横卡或一键开始探索');
  assert.doesNotMatch(campHome,/camp-depart-dock|camp-map-entry|区域地图/,'营地主页不得保留占据布局的地图入口卡片');
  assert.match(js,/function renderMapFab\(\)[\s\S]{0,500}map-fab ui-icon-button[\s\S]{0,220}uiIcon\('map'\)/,'行动页面必须使用统一的右下角地图图标入口');
  assert.match(js,/const world=P\(\)\.location==='camp'[\s\S]{0,260}world\?'打开世界地图':'打开局部地图'/,'地图悬浮入口必须根据当前场景区分世界与局部地图');
  assert.match(js,/function discoverLocation\(id,announce\)[\s\S]{0,520}if\(state\.flags&&state\.flags\.mapUnlocked\)state\.mapUnread=true/,'发现可前往地点后必须记录持续的地图未读状态');
  assert.match(js,/function openContextMap\(\)[\s\S]{0,420}state\.mapUnread=false;state\.mapOpen=true/,'只有真正打开地图时才清除发现提示');
  assert.match(js,/function snapshot\(\)[^\n]*mapUnread:!!state\.mapUnread/,'地图新发现状态必须进入检查点存档');
  assert.match(js,/function renderMapFab\(\)[\s\S]{0,900}has-unread[\s\S]*map-fab-dot[\s\S]*有新发现/,'地图悬浮入口必须用红点和无障碍文本提示新发现');
  assert.match(css,/#map-fab \.map-fab-dot\{[^}]*position:absolute[^}]*background:#f0525f/,'地图新发现红点必须清晰固定在按钮角落');
  assert.match(js,/if\(loc==='camp'\)[^}]*state\.mapLevel='world'[\s\S]{0,180}else\{state\.mapLevel='local';state\.mapRegion=regionForLocation\(loc\)/,'营地必须打开世界地图，其他场景必须打开当前区域局部地图');
  assert.match(css,/#map-fab\{[^}]*position:fixed[^}]*right:max\(18px,[^}]*bottom:calc\(82px \+ env\(safe-area-inset-bottom,0px\)\)[^}]*width:40px[^}]*height:40px/,'地图图标必须低调地贴近底部导航操作区');
  assert.match(css,/#app\.tutorial-hud #metabar \{ animation:hud-link-top \.65s ease both; \}[\s\S]*#app\.tutorial-hud #tabbar \{ animation:hud-link-bottom \.65s ease both; \}/,'手环接入后顶部 HUD 与底部导航必须按各自方向进入');
  assert.match(css,/@keyframes hud-link-top \{ from\{[^}]*translateY\(-6px\)/,'顶部状态翼必须从屏幕上方接入，适配新的顶部 HUD 布局');
  assert.doesNotMatch(css,/tutorial-hud #statusbar/,'顶部状态栏嵌套后不得重复执行引导接入动画');
  assert.match(html,/<symbol id="icon-map"[\s\S]{0,260}M8\.5 3v15\.5M15\.5 5\.5V21/,'地图入口必须使用清晰的折叠地图图标而非路线节点图标');
  assert.doesNotMatch(campHome,/b\.icon/,'营地主页设施卡不得继续显示风格不统一的 Emoji');
  assert.match(campHome,/FACILITY \/\/[\s\S]*cf-status/,'设施卡必须统一显示运行状态和等级读数');
  assert.match(css,/\.camp-layout\s*\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/s,'已建营地设施必须使用一行四个的手机宫格');
  assert.doesNotMatch(css,/camp-depart-dock|camp-map-entry|map-toggle|explore-tools/,'旧地图卡片和横条样式必须全部移除');
  assert.match(css,/#statusbar\s*\{[^}]*z-index:30/s,'状态栏必须显示在固定操作层上方');
  assert.doesNotMatch(css,/#59612a|#242818/,'区域地图入口不得脱离营地的冷蓝终端配色');
  assert.match(js,/const ACTION_ICON=\{investigate:'scan',gather:'salvage',hunt:'combat'\}/,'探索操作必须复用语义化 SVG 图标映射');
  assert.match(js,/box\.classList\.add\('field-console'\)/,'探索页必须启用统一的远征终端布局');
  assert.match(js,/field-map-head-copy[\s\S]{0,240}区域测绘[\s\S]{0,120}勘察/,'探索区域头部必须用紧凑读数显示当前地点、测绘率与勘察次数');
  assert.match(css,/\.region-actions\s*\{[^}]*grid-template-columns:1fr/s,'现场行动在浏览器与手机上都必须保持单列');
  assert.doesNotMatch(css,/\.region-actions\s*\{[^}]*grid-template-columns:repeat\(2/s,'现场行动不得因桌面浏览器宽度误切为两列');
  assert.doesNotMatch(js,/b\.innerHTML='<span>'\+nl\.icon/,'探索路线不得继续混用地点 Emoji 图标');
  assert.match(js,/mapLocations\.filter\(id=>layout\.pos\[id\]&&locationRevealed\(id\)\)/,'尚未发现的地图节点必须在创建按钮前被过滤，不得泄露地点名称');
  assert.match(js,/if\(state\.mapOpen\)\{box\.classList\.add\('map-mode'\);renderWorldMap\(box\);return;\}/,'手机展开地图时不得继续渲染下方行动长页面');
  assert.match(css,/#panel \.map-back\s*\{[^}]*height:27px[^}]*min-height:27px/s,'世界地图返回按钮必须与相邻地图工具等高');
  assert.match(css,/\.route-list \{ display:flex;gap:6px;overflow-x:auto;scroll-snap-type:x proximity/,'移动路线必须始终使用横向快捷条以缩短页面');
  assert.match(js,/function renderFieldExpedition\(box,id\)[\s\S]{0,520}returnRoute=travelRoute\(id,'camp'\)[\s\S]{0,900}field-return-tool/,'野外地图头部必须保留一键返营入口');
  assert.doesNotMatch(js,/点按目的地直接前往/,'野外场景不应再重复展示完整目的地列表');
  assert.match(css,/\.field-console:not\(\.map-mode\) \.scene-card\{padding:7px 9px 0\}/,'区域信息摘要必须直接适配应用的手机容器，不能依赖外层视口宽度');
  assert.match(css,/\.scene-metrics>span\{padding:5px 8px\}/,'手机端区域读数必须使用紧凑间距');
  assert.match(js,/function renderFieldExpedition\(box,id\)[\s\S]*field-map-viewport[\s\S]*field-explore-dock/,'探索页必须把返营、地点标记和底部主探索行动放在同一屏');
  assert.doesNotMatch(js,/fieldView==='routes'/,'探索页不得保留行动/路线双模式，避免移动后还要手动切回行动页');
  assert.match(js,/if\(state\.mapOpen\)\{box\.classList\.add\('map-mode'\);renderWorldMap\(box\);return;\}/,'地图必须独占探索页面');
  assert.doesNotMatch(css,/\.field-switch\{/,'双模式切换器已随合并视图移除，不得残留样式');
  assert.match(css,/#panel \.region-action\s*\{[^}]*grid-template-columns:40px minmax\(0,1fr\)[^}]*grid-template-rows:minmax\(62px,auto\) auto/s,'现场行动卡必须将叙事与行动代价分层展示');
  assert.match(css,/\.ra-status\{[^}]*grid-column:1\/-1[^}]*grid-template-columns:auto minmax\(0,1fr\)/s,'行动代价必须作为卡片底部状态带统一对齐');
  assert.doesNotMatch(js,/b\.innerHTML='[^\n]*presentation\.name[^\n]*chevron-right/,'现场行动状态带不得使用挤压长文字的冗余箭头');
  assert.match(js,/const EXPLORATION_PACING=\{[\s\S]*resource:\{wild:\[5,10\][\s\S]*route:\{wild:\[18,26\]/,'资源点与新路线必须使用不同量级的随机发现区间');
  assert.match(js,/function scheduledDiscoveryNeed\(kind,id,index,range\)\{return thresholdFor\('explore-v2:/,'每个地点的发现步数必须首次抽取后写入存档');
  assert.match(js,/function fieldEncounterChance\(base\)[\s\S]*Math\.pow\(\.48/,'连续遭遇必须以指数衰减后续战斗概率');
  assert.match(js,/function rollFieldEncounter\(base\)[\s\S]*t\.cooldown>0/,'一场战斗之后必须至少保留一个安全行动');
  assert.match(js,/发现路线、任务线索与现场机关，也可能遭遇敌人/,'勘察入口必须明确随机结果与特殊发现类别');
  assert.match(js,/function resourceActionVerb\(site,profile\)[\s\S]*翻找[\s\S]*拆取[\s\S]*开采/,'资源点行动必须按垃圾堆、残骸与矿脉生成不同现场动词');
  assert.match(css,/\.field-console:not\(\.map-mode\) \.scene-tags\{[^}]*flex-wrap:wrap[^}]*overflow:visible/,'手机场景资源标签必须换行完整显示');
  assert.doesNotMatch(js,/actionMeta=[^\n]*新线索 \+\(eventIndex\+1\)/,'勘察入口不得提前承诺下一次必出线索');
  assert.match(js,/\[0,1,2\]\.forEach\(i=>[\s\S]{0,500}未装配[\s\S]{0,1200}ACTIVE MODULES/,'战斗面板必须固定显示三个技能槽，空槽也不能整组消失');
  assert.match(css,/\.battle-skill-rail\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'三个战斗技能槽必须保持同一行的独立模块布局');
  assert.match(js,/const COMBAT_TURNS_PER_HOUR=4;[\s\S]*function settleCombatTime\(c\)[\s\S]*Math\.ceil\(turns\/COMBAT_TURNS_PER_HOUR\)[\s\S]*advanceTime\(hours\)/,'战斗必须按四回合一小时在结束时统一结算时间');
  const combatRuntime=js.slice(js.indexOf('function startCombat'),js.indexOf('/* ================= 死亡/轮回'));
  assert.doesNotMatch(combatRuntime,/advanceTime\(/,'战斗中的攻击、技能、道具与恢复不得逐次推动世界时间');
  assert.match(combatRuntime,/function winCombat\(\)\{ const c=state\.combat;settleCombatTime\(c\)/,'战斗胜利时必须结算累计回合耗时');
  assert.match(combatRuntime,/成功逃脱[\s\S]{0,120}settleCombatTime|settleCombatTime\(c\)[\s\S]{0,120}成功逃脱/,'成功逃跑时必须结算累计回合耗时');
  assert.match(js,/const SLOT_ICON=\{head:'helmet'[\s\S]*weapon:'weapon'\}/,'十个装备接口必须各自使用语义化 SVG 图标');
  assert.doesNotMatch(js,/training-target[^\n]*◎/,'训练设施不得退回字体符号图标');
  assert.match(js,/treeCardBox\(cv,'data-gid'/,'基因树连线必须读取实际卡片边界，不能继续写死端点高度');
  assert.match(js,/treeCardBox\(cv,'data-tid'/,'科技树连线必须读取实际卡片边界，不能继续写死端点高度');
  assert.match(js,/const TREE_ZOOM_MIN=\.14/,'大型文明科技图必须允许手机端缩放到完整视图');
}

{
  const L=a.treeLayout();
  const heightFit=a.techHeightFitZoom(844,L.H);assert.ok(heightFit>.8,'科技台首次进入应压紧七类分支并按总高度铺满手机屏幕，节点不得缩成微缩图');
  assert.equal(L.stages.length,12,'科技树必须展示十二个文明阶段（含远航篇9—12阶）');
  assert.deepEqual(Object.keys(L.pos).sort(),Object.keys(a.TECHS).sort(),'每项科技必须恰有一个画布坐标');
  assert.deepEqual([...new Set(Object.values(a.TECHS).map(t=>t.b))].sort(),[...a.BRANCHES].sort(),'科技分支与布局图例必须闭合');
  Object.entries(a.TECHS).forEach(([id,t])=>(t.req||[]).forEach(req=>{
    assert.ok(L.pos[id].x>L.pos[req].x+92,req+' → '+id+' 必须保持从左向右');
  }));
  const ids=Object.keys(a.TECHS);ids.forEach(id=>{const p=L.pos[id];assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),id+' 坐标必须有效');assert.ok(p.x>=0&&p.y>=0&&p.x+92<=L.W&&p.y+72<=L.H,id+' 必须完全位于科技画布内');assert.ok(L.labels[a.TECHS[id].b],a.TECHS[id].b+' 必须有分支标题');});
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const p=L.pos[ids[i]],q=L.pos[ids[j]];assert.ok(p.x+92<=q.x||q.x+92<=p.x||p.y+72<=q.y||q.y+72<=p.y,ids[i]+' 与 '+ids[j]+' 卡片不得重叠');}
  const long=a.treeEdgeRoute({a:{r:382,y:397,cx:341},c:{l:700,r:782,y:147,cx:741},outIndex:0,outCount:1,inIndex:0,inCount:1},1050,790);
  assert.match(long.d,/M383,397 H407 V272 H672 V147 H696/,'跳阶段依赖必须走两行节点之间的空走廊');
  const closeRows=a.treeEdgeRoute({a:{r:878,y:577,cx:837},c:{l:1140,r:1222,y:542,cx:1181},outIndex:0,outCount:1,inIndex:0,inCount:1,obstacles:[{l:965,r:1047,nt:532,nb:610}]},1260,790);
  assert.match(closeRows.d,/M879,577 H903 V522 H1112 V542 H1136/,'跨阶段且相邻行的依赖必须选择无节点的走廊');
  const splitA=a.treeEdgeRoute({a:{r:382,y:147,cx:341},c:{l:700,r:782,y:397,cx:741},outIndex:0,outCount:2,inIndex:0,inCount:1},1050,790);
  const splitB=a.treeEdgeRoute({a:{r:382,y:147,cx:341},c:{l:700,r:782,y:397,cx:741},outIndex:1,outCount:2,inIndex:0,inCount:1},1050,790);
  assert.notEqual(splitA.d.match(/ H([\d.]+) V/)[1],splitB.d.match(/ H([\d.]+) V/)[1],'同一列的跨层依赖必须分配不同竖槽，不能产生假汇流');
}

{
  assert.equal(a.SLOTS.length,10,'装备系统应提供十个长期槽位');
  const equipIds=Object.entries(a.ITEMS).filter(([,it])=>it.type==='equip').map(([id])=>id);
  equipIds.forEach(id=>assert.ok(a.EQUIP_ICON[id],id+' 必须显式配置物品专属图标，不能直接复用槽位图标'));
  assert.ok(new Set(equipIds.map(id=>a.EQUIP_ICON[id])).size>=16,'现有装备必须覆盖足够多的语义图形，不能看起来全是同一个图标');
  const legacy={equip:{weapon:'crowbar',legs:'boots',acc:'lsChip'}},inv={};a.normalizeEquipment(legacy,inv);
  assert.equal(legacy.equip.feet,'boots','旧存档腿部靴子必须迁移到足部');
  assert.equal(legacy.equip.implant,'lsChip','旧存档饰品必须按物品类型迁移到植入体');
  assert.equal(Object.hasOwn(legacy.equip,'acc'),false,'旧饰品槽不得继续隐藏计算属性');
}

{
  const s=reset(); assert.equal(a.totalAtk(),12,'初始攻击应让前期敌人至少需要两次攻击');
  s.inv.scrap=20;a.beginExpedition();s.player.location='outer';s.inv.scrap=30;s.player.stamina=0;assert.equal(a.exhaustionDeath(),false,'只耗尽体力不得触发死亡结算');
  assert.equal(s.player.location,'outer');assert.equal(s.inv.scrap,30);s.player.hp=0;a.exhaustionDeath();
  assert.equal(s.player.location,'camp');assert.equal(s.player.stamina,0,'生命耗尽后应以零体力回到营地');assert.equal(s.inv.scrap,26,'死亡只损失本次新增材料的35%');
}
{
  const s=reset(),box=new FakeElement();a.renderCharPanel(box);const classes=box.children.map(x=>x.className||'');
  const profile=box.children[0],growth=classes.indexOf('growth-nav character-quick-nav'),statMarkup=profile.innerHTML.match(/<div class="camp-metrics char-vitals char-profile-stats">([\s\S]*?)<\/div>$/);
  assert.equal(classes[0],'camp-hero char-console char-profile-card','角色页首屏应复用统一营地控制台组件');assert.ok(statMarkup,'完整详细属性必须放在幸存者档案卡片内部原四项属性的位置');assert.equal((statMarkup[1].match(/<span>/g)||[]).length,14,'幸存者档案必须一次展示全部十四项详细属性');assert.ok(growth>0,'成长入口必须排在完整幸存者档案之后');assert.equal(classes.includes('camp-section-head char-section-head char-stat-head'),false,'档案下方不得再单独渲染详细属性标题');assert.equal(classes.includes('statlist char-stats char-stats-overview'),false,'档案下方不得再单独渲染详细属性列表');assert.equal(classes.includes('char-fold stat-fold'),false,'详细属性不得继续藏在折叠区');assert.ok(classes.includes('camp-command-card char-command skill-entry'),'技能必须从角色总览进入独立页面');assert.equal(classes.filter(x=>x.startsWith('char-fold')).length,1,'角色总览只保留回响强化折叠模块');
  assert.equal(s.charView,'overview');
}
{
  const s=reset();s.meta.careers.life={id:'noviceApprentice',level:1,xp:0};const box=new FakeElement();a.renderCharPanel(box);const classes=box.children.map(x=>x.className||'');
  assert.equal(a.careerSummary('life'),'入门学徒 · Lv1');assert.ok(box.children[0].innerHTML.includes('char-profile-stats')&&classes.includes('growth-nav character-quick-nav')&&classes.includes('camp-command-card char-command skill-entry')&&classes.filter(x=>x.startsWith('char-fold')).length===1,'入门职业存档必须同时渲染档案内完整属性、成长入口与技能页面入口');
}
{
  const s=reset();s.skills.pierce.prof=10;s.skillView='active';const box=new FakeElement(),nodes=[];a.renderSkillPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);
  assert.ok(nodes.some(n=>hasClass(n,'skill-screen'))&&nodes.some(n=>hasClass(n,'skill-page-top'))&&nodes.some(n=>hasClass(n,'skill-page-bottom')),'技能页必须使用手机端上下分屏布局');
  assert.equal(nodes.filter(n=>String(n.className).startsWith('skill-loadout-slot')).length,3,'战斗技能栏必须始终显示三个槽位');assert.equal(nodes.filter(n=>String(n.className).includes('skill-category-tabs')).length,1,'技能页必须提供主动、自动与精通分类');
  const skillCard=nodes.find(n=>String(n.className).startsWith('skill-library-card')),skillDetail=nodes.find(n=>String(n.className).startsWith('skill-detail-panel'));assert.equal(nodes.filter(n=>String(n.className).startsWith('skill-library-card')).length,1,'技能列表只能展示已经学会的技能，不能提前显示未解锁技能');assert.match(skillCard.innerHTML,/LV 1[\s\S]*熟练度 0 \/ 10/,'主动技能卡必须直接显示当前等级与升级进度');assert.match(skillDetail.innerHTML,/技能进度[\s\S]*Lv1 · 熟练度 0 \/ 10/,'技能详情必须说明成功释放会累积的熟练度进度');
  const action=nodes.find(n=>String(n.className).includes('skill-detail-action'));assert.ok(action&&action.innerHTML.includes('装配到技能栏 01'),'选中主动技能后下半屏必须提供明确的目标槽位操作');action.onclick();assert.equal(s.skillSlots[0],'pierce','技能详情主操作必须把技能装配到当前选中槽');
}
{
  const s=reset();s.meta.careers.life={id:'salvager',level:3,xp:0};s.skills.salvageSense.prof=20;s.skills.fieldSorting.prof=10;s.skillView='auto';s.skillSelected='salvageSense';const box=new FakeElement(),nodes=[];a.renderSkillPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const markup=nodes.map(n=>n.innerHTML||'').join(' '),detail=nodes.find(n=>String(n.className).startsWith('skill-detail-panel'));
  assert.match(markup,/PASSIVE · LV 2[\s\S]*残骸直觉[\s\S]*熟练度 0 \/ 10/,'职业被动卡也必须显示技能等级与熟练度');assert.match(detail.innerHTML,/当前 Lv2：采集 \+15%[\s\S]*技能进度[\s\S]*Lv2 · 熟练度 0 \/ 10/,'职业被动详情必须展示升级后的当前实际效果');
}
{
  const s=reset();s.charView='careers';s.meta.careers.main={id:'vanguard',level:3,xp:12};s.meta.careers.life={id:'noviceCollector',level:2,xp:7};s.flags.job_vanguard_qualified=true;s.flags.job_salvager_qualified=true;const box=new FakeElement(),nodes=[];a.renderCharPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);
  assert.ok(nodes.some(n=>n.className==='career-loadout'),'职业页必须先展示已装备的主副职业，而不是直接堆转职清单');
  assert.equal(nodes.filter(n=>String(n.className).startsWith('career-dossier')).length,2,'主职业与副职业必须分别拥有职业档案卡');
  assert.ok(nodes.some(n=>(n.innerHTML||'').includes('career-ability-strip')),'当前职业必须展示按等级解锁的能力轨道');
  assert.equal(nodes.filter(n=>String(n.className).startsWith('career-track-section')).length,2,'战斗转职与生活转职必须拆成两条独立路线');
  assert.ok(nodes.some(n=>String(n.className).startsWith('career-path-card')),'职业路线必须保留 NPC 认证与转职操作入口');
}
{
  const s=reset();s.charView='careers';s.flags.job_vanguard_qualified=true;const box=new FakeElement(),nodes=[];a.renderCharPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const markup=nodes.map(n=>n.innerHTML||'').join(' ');
  assert.match(markup,/就任加成[\s\S]*攻击 \+30%[\s\S]*暴击 \+10%/,'正式战斗职业在就任前必须展示足够有吸引力的核心属性');
  assert.match(markup,/专属能力预览[\s\S]*脉冲连射[\s\S]*穿透 25% 护甲[\s\S]*战斗节律/,'职业选择页必须提前说明主动与被动能力，不能转职后才知道效果');
}
{
  const s=reset();s.charView='careers';const box=new FakeElement(),nodes=[];a.renderCharPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);
  assert.equal(nodes.some(n=>String(n.className).startsWith('career-loadout')),false,'没有就职时不得展示空职业槽');
  assert.equal(nodes.some(n=>String(n.className).startsWith('career-path-card')),false,'尚未发现的职业不得提前出现在职业页');
}
{
  const s=reset();s.charView='careers';s.meta.careers.life={id:'noviceCollector',level:1,xp:0};const box=new FakeElement(),nodes=[];a.renderCharPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const markup=nodes.map(n=>n.innerHTML||'').join(' ');
  assert.equal(nodes.filter(n=>String(n.className).startsWith('career-dossier')).length,1,'只就任一个职业时只显示当前职业档案');
  assert.match(markup,/快速搜刮/,'职业档案必须显示当前已学会的技能');
  assert.doesNotMatch(markup,/定向拆解|分层挖掘|方舟突击兵|装甲卫士|相位猎手/,'未学技能和未发现职业都不得在职业页剧透');
}
{
  const s=reset();s.meta.careers.life={id:'salvager',level:1,xp:49};const stamina=a.jobBonus('stMax'),gather=a.jobBonus('gatherPct'),recycle=a.jobBonus('recyclePct');a.gainCareerXp('life',1);
  assert.equal(a.careerRecord('life','salvager').level,2,'残骸勘探员获得足够职业经验后必须升级');assert.equal(a.jobBonus('stMax'),stamina+2,'残骸勘探员每级必须增加体力上限');assert.equal(a.jobBonus('gatherPct'),gather+2,'残骸勘探员每级必须增加采集属性');assert.equal(a.jobBonus('recyclePct'),recycle+2,'残骸勘探员每级必须增加拆解属性');
}
{
  const s=reset();s.masteries.craftMastery=2;s.npcTarget='阿珍';s.npcTab='teach';const box=new FakeElement(),nodes=[];a.renderNpcPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const masteryGrid=nodes.find(x=>x.className==='mastery-grid'),card=masteryGrid.children[0];
  assert.match(card.innerHTML,/当前[\s\S]*材料返还 \+20%[\s\S]*升级后[\s\S]*材料返还 \+30%/,'精通卡必须同时显示当前效果与升级后效果');assert.equal(card.children[0].innerHTML,'升级至 Lv3');
}
{
  const s=reset();s.tutorial.complete=true;s.player.location='camp';s.campView='npc';s.npcTarget='老乔';s.npcTab='talk';const box=new FakeElement(),nodes=[];a.renderNpcPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);
  const terminal=nodes.find(n=>hasClass(n,'npc-terminal')),content=nodes.find(n=>n.className==='npc-content-scroll'),exitbar=nodes.find(n=>hasClass(n,'npc-exitbar')),exit=nodes.find(n=>hasClass(n,'npc-exit'));
  assert.ok(terminal&&content&&exitbar&&exit,'NPC 页面必须由全屏终端、内部滚动区与固定告别区组成');assert.equal(terminal.children.at(-1),exitbar,'告别按钮必须始终处于整页最底部');assert.ok(content.children.some(n=>n.className==='npc-dialog'),'对话内容必须装入中间滚动区');assert.equal(nodes.some(n=>n.className==='npc-stage-back ui-icon-button'),false,'NPC 页顶部不得再保留重复关闭按钮');assert.match(exit.innerHTML,/我走了[\s\S]*再见，老乔/,'底部按钮必须使用符合对话语境的告别文案');assert.doesNotMatch(exit.innerHTML,/<svg|icon-close/,'已经写明“我走了”的告别按钮旁不得再重复放置叉号图标');
  assert.equal(a.panelView(),'npc','NPC 交互必须拥有独立全屏视图状态');
}
{
  const s=reset();s.tutorial.complete=true;a.resetStoryScenes();document.body.children=[];
  assert.equal(Object.keys(a.NPC_PROFILE).length,12,'十二名 NPC 都必须保留独立立绘档案');
  assert.equal(a.storySceneKey('layer3'),'engineering');assert.equal(a.storySceneKey('oldMine'),'mine');assert.equal(a.storySceneKey('layer6'),'archive');
  assert.match(a.storySceneSrc('layer3'),/story-scenes-v1\/engineering-reactor\.jpg/,'工程区剧情必须使用对应场景图');
  s.player.location='cargoYard';const ridgeQuest=a.QUESTS.find(q=>q.id==='ridgeCache');assert.equal(a.queueQuestStoryScene(ridgeQuest,'intro'),false,'货柜坟场激活远处 NPC 的任务时不得伪造现场初见');assert.equal(s.flags.storyNpcMet_林薇,undefined,'错误区域的剧情不能提前把 NPC 标记为已经见过');
  s.player.location='layer3';s.flags['fieldNpcFound_林薇_layer3']=true;
  assert.equal(a.queueNpcFirstContact('林薇','layer3'),true,'首次发现 NPC 必须排入一次性剧情过场');a.flushStoryScenes();
  const overlay=document.body.children.at(-1),sceneNodes=[];(function walk(node){sceneNodes.push(node);(node.children||[]).forEach(walk);})(overlay);
  const bg=sceneNodes.find(n=>n.className==='story-cutscene-bg'),portrait=sceneNodes.find(n=>n.className==='story-cutscene-portrait'),avatar=sceneNodes.find(n=>n.className==='story-cutscene-avatar'),dialog=sceneNodes.find(n=>n.className==='story-cutscene-dialog');
  assert.ok(hasClass(overlay,'story-cutscene')&&bg&&portrait&&avatar&&dialog,'剧情触发必须渲染独立全屏过场，而不是改写常驻 NPC 页面');
  assert.match(bg.src,/engineering-reactor\.jpg/);assert.match(portrait.src,/lin-wei\.png/);assert.ok(avatar.children.length===1,'过场对话必须同时显示对应 NPC 头像');
  assert.equal(a.queueNpcFirstContact('林薇','layer3'),false,'同一 NPC 的首次发现过场不得重复弹出');a.resetStoryScenes();
  assert.match(source,/applyNpcDiscoveries[\s\S]{0,1000}queueNpcFirstContact\(name,id\)/,'探索随机发现 NPC 时必须触发场景过场');
  assert.match(source,/finishQuest[\s\S]{0,1000}queueQuestStoryScene\(q,'complete'\)/,'任务完成推进剧情时必须触发对应 NPC 场景');
  assert.match(source,/wake-guide-figure[\s\S]{0,220}npcPortraitSrc\('老乔'\)/,'睁眼动画必须把老乔立绘加入背景');
  assert.match(source,/wakeTimer=setTimeout\(finishWakeAnimation,reduced\?320:6200\)/,'睁眼动画必须留出多次适应视野的时间，不能一闪而过');
  const storyCss=fs.readFileSync(__dirname+'/story-scenes.css','utf8');
  assert.match(storyCss,/wake-lid-top-long 5\.8s/);assert.match(storyCss,/16%\{transform:translateY\(-19%\)[\s\S]*31%\{transform:translateY\(-38%\)[\s\S]*48%\{transform:translateY\(-64%\)/,'睁眼动画必须包含至少三次逐渐变大的睁眼过程');
}
{
  const s=reset();s.inv.scrap=10;a.beginExpedition();s.player.location='outer';s.inv.scrap=20;s.player.stamina=1;
  assert.equal(a.payAreaAction(1),true,'行动刚好耗尽体力时仍应正常完成');assert.equal(s.player.location,'outer');assert.equal(s.player.stamina,0);assert.equal(s.inv.scrap,20,'体力归零本身不得触发远征掉落');
  assert.equal(a.payAreaAction(1),false,'非移动行动体力不足时应停止，而不是透支生命');assert.equal(s.player.location,'outer');assert.equal(s.player.hp,100);
}
{
  let s=reset();s.player.stamina=1;s.player.hp=100;a.move('outer');
  assert.equal(s.player.location,'outer','体力不足时仍应完成相邻移动');assert.equal(s.player.stamina,0);assert.equal(s.player.hp,90,'每缺少1点移动体力应扣10生命');assert.equal(s.runStats.deaths||0,0,'体力归零不得直接死亡');
  s=reset();s.player.stamina=2;s.player.hp=100;a.move('outer');assert.equal(s.player.location,'outer');assert.equal(s.player.stamina,0);assert.equal(s.player.hp,100,'刚好用完体力移动不得扣血或死亡');
  s=reset();s.player.stamina=1;s.player.hp=100;a.travelTo('outer');assert.equal(s.player.location,'outer','快速移动也应允许体力透支');assert.equal(s.player.stamina,0);assert.equal(s.player.hp,90,'快速移动不得重复扣除体力或生命');
  s=reset();s.player.location='outer';s.player.stamina=20;s.campView='map';s.mapOpen=true;a.travelTo('camp');assert.equal(s.player.location,'camp');assert.equal(s.mapOpen,false);assert.equal(s.campView,'home','一键返营必须直接进入营地主页，不能闪现或停留在地图页');assert.equal(s.mapReturn,null,'返营后不得遗留地图返回上下文');
  s=reset();s.inv.scrap=20;a.beginExpedition();s.player.location='outer';s.inv.scrap=30;s.player.stamina=0;s.player.hp=20;a.move('camp');
  assert.equal(s.player.location,'camp');assert.equal(s.player.hp,1,'透支移动扣完生命后才应死亡并在营地醒来');assert.equal(s.inv.scrap,26,'生命耗尽时才结算本次远征掉落');assert.equal(s.siteSheet.kind,'exhaustion');
}
{
  let s=reset();s.player.location='outer';s.player.stamina=0;a.startCombat('rat');a.catchBreath();
  assert.ok(s.player.stamina>0,'野外战斗零体力仍可喘息恢复');assert.equal(s.player.location,'outer','零体力的敌方回合不得触发力竭回营');
  s.player.stamina=0;s.player.hp=100;s.combat.distNow=2;sandbox.Math.random=()=>0;a.approach();assert.equal(s.player.stamina,0);assert.equal(s.player.hp,80,'战斗接近也应按缺少的体力透支生命');assert.equal(s.combat.distNow,1);
  s=reset();s.player.location='outer';s.player.stamina=0;s.player.hp=100;a.startCombat('rat');sandbox.Math.random=()=>0;a.flee();assert.equal(s.player.stamina,0,'逃跑不得产生负体力');assert.equal(s.player.hp,80,'逃跑体力不足时也应透支生命');assert.equal(s.player.location,'outer');assert.equal(s.combat,null,'透支生命后仍应正常判定逃跑');
}
{
  const s=reset();a.startCombat('rat');const c=s.combat,before=s.time;for(let i=0;i<5;i++)a.recordCombatTurn(c);
  assert.equal(s.time,before,'战斗中的每次行动只能累计回合，不能立刻推动世界时间');
  a.settleCombatTime(c);assert.equal(s.time,before+2,'五个战斗回合应在结束时统一折算为两小时');
  a.settleCombatTime(c);assert.equal(s.time,before+2,'同一场战斗的时间不得重复结算');
}
{
  const weapons=Object.values(a.ITEMS).filter(it=>it.slot==='weapon');
  weapons.forEach(w=>{assert.ok(['melee','ranged'].includes(w.weaponType),w.name+' 必须声明近战或远程属性');if(w.weaponType==='ranged'){assert.ok(a.ITEMS[w.ammo],w.name+' 必须声明有效弹药');assert.ok(w.ammoCost>0,w.name+' 必须声明每次射击的弹药量');}else assert.ok(w.staminaCost>0,w.name+' 必须声明每次攻击的体力消耗');});
  assert.equal(a.RECIPES.ammo.yield,10,'制式弹药配方必须成批生产');assert.equal(a.RECIPES.weaponCell.yield,8,'高阶武器能量匣必须成批生产');
}
{
  const s=reset();s.player.stamina=10;a.startCombat('rat');s.combat.distNow=1;sandbox.Math.random=()=>0;
  a.playerAttack();assert.equal(s.player.stamina,7,'撬棍普通攻击必须按武器属性消耗3体力');
}
{
  const s=reset();s.player.equip.weapon='pistol';s.inv.ammo=2;s.player.stamina=10;a.startCombat('rat');sandbox.Math.random=()=>0;
  a.playerAttack();assert.equal(s.player.stamina,10,'枪械普通攻击不得消耗体力');assert.equal(s.inv.ammo,1,'磁轨手枪每次攻击必须消耗1份制式弹药');
}
{
  const s=reset();s.player.equip.weapon='pistol';s.inv.ammo=0;s.player.stamina=10;a.startCombat('rat');const hp=s.combat.hp;
  a.playerAttack();assert.equal(s.combat.hp,hp,'没有弹药时枪械不得造成伤害');assert.equal(s.player.stamina,10,'枪械缺弹时也不得误扣体力');
}
{
  const s=reset();s.player.equip.weapon='pistol';s.inv.ammo=2;s.player.stamina=10;s.skills.pierce.prof=10;a.equipSkill('pierce',0);a.startCombat('rat');sandbox.Math.random=()=>0;
  a.useSkill('pierce');assert.equal(s.player.stamina,10,'射击技能必须沿用枪械弹药资源而非体力');assert.equal(s.inv.ammo,1,'破甲射击必须消耗当前枪械的一次弹药');
}
{
  const s=reset();s.player.stamina=10;s.skills.pierce.prof=10;a.equipSkill('pierce',0);a.startCombat('rat');s.combat.distNow=1;const hp=s.combat.hp;
  a.useSkill('pierce');assert.equal(s.combat.hp,hp,'射击技能不得由近战武器施放');assert.equal(s.player.stamina,10,'武器类型不匹配时不得扣除资源');
}
{
  const js=fs.readFileSync(__dirname+'/game.js','utf8'),css=fs.readFileSync(__dirname+'/style.css','utf8');
  const combat=js.slice(js.indexOf('function renderCombatPanel'),js.indexOf('/* ---------- 死亡 ---------- */'));
  assert.ok(combat.indexOf('battle-target-hud')<combat.indexOf('battle-range-core')&&combat.indexOf('battle-range-core')<combat.indexOf('battle-operator-hud')&&combat.indexOf('battle-operator-hud')<combat.indexOf('battle-command-dock'),'战斗页必须按目标锁定、战术准星、操作员仪表与指令坞建立独立层级');
  assert.match(combat,/battle-art[\s\S]{0,700}screen\.appendChild\(art\)/,'怪物完整立绘必须先作为整张战斗页的场景层挂载');
  assert.doesNotMatch(combat,/combatant|combat-readout|combat-deck|combat-action/,'全新战斗界面不得继续拼装旧敌我卡片和 ACTION DECK 组件');
  assert.match(css,/#app\.combat-active #metabar,#app\.combat-active #statusbar,#app\.combat-active #tabbar\s*\{\s*display:none/s,'战斗时必须隐藏无效的全局导航，把整屏留给战斗界面');
  assert.match(css,/#app\.combat-active #panel\s*\{[^}]*overflow:hidden/s,'战斗面板不得再允许整页纵向滚动');
  assert.match(css,/\.battle-screen\{[^}]*grid-template-rows:minmax\(0,1fr\) auto/s,'战斗页必须使用完整舞台加内容自适应指令坞，不能固定上下各半');
  assert.match(css,/\.battle-art\{[^}]*position:absolute[^}]*inset:0/s,'怪物场景层必须铺满整个战斗屏幕');
  assert.match(css,/\.battle-art img\{[^}]*width:100%[^}]*height:100%[^}]*object-fit:contain/s,'怪物全身必须使用 contain 完整展示，不能裁成半身');
  assert.match(css,/\.battle-range-core\{[^}]*position:absolute[^}]*width:132px/s,'距离必须使用独立战术准星而不是横向信息卡');
  assert.match(css,/\.battle-operator-hud\{[^}]*position:absolute[^}]*width:min\(86%,410px\)/s,'我方信息必须使用贴边操作员仪表而不是通用卡片');
  assert.match(css,/\.battle-primary-controls\{[^}]*grid-template-columns:minmax\(0,1\.55fr\) minmax\(112px,\.85fr\)/s,'主攻击与休整必须拥有明确的不对称操作层级');
  assert.match(css,/\.battle-tool-rail\{[^}]*display:flex[^}]*overflow-x:auto/s,'战术支持必须使用独立图标控制轨');
  assert.match(combat,/const primary=el\('div','battle-primary-controls'\)[\s\S]{0,800}label:'攻击'[\s\S]{0,800}label:'休整'/,'攻击和休整必须放在新的主操作核心');
  assert.ok(combat.lastIndexOf('dock.appendChild(primary)')>combat.indexOf("battle-tool-rail"),'主操作核心必须渲染在技能与战术支持之后');
}
{
  const s=reset(); s.player.location='layer4'; s.player.infected=true; s.player.hp=100;
  assert.equal(a.locExtraCost(),0,'污染只造成生命伤害，不重复增加体力消耗');
  a.payAreaAction(1); assert.equal(s.player.hp,95,'污染3点与感染2点均应生效');
}
{
  const s=reset(); s.meta.built.research=true;s.meta.buildLevels.research=1;s.inv.scrap=10; a.updateCheckpoint(); a.research('make_1');
  assert.equal(s.meta.techs.make_1,1); a.restoreCheckpoint();
  const restored=a.getState(); assert.equal(restored.meta.techs.make_1,undefined); assert.equal(restored.inv.scrap,10,'检查点必须同时回滚研究与材料');
}
{
  let s=reset(); s.inv.biocore=4; s.inv.crystal=2; a.unlockGene(); assert.equal(a.geneTier(),0,'未到10级不得提前开启基因锁');s.player.level=10;a.unlockGene();assert.equal(a.geneTier(),1);
  a.doReincarnate(); s=a.getState(); assert.equal(a.geneTier(),1,'基因强化必须跨周目保留');
}
{
  const s=reset(); a.chooseEnding('sever'); assert.equal(s.inv.sever,1,'结局装备必须进入背包');
}
{
  const s=reset(); s.player.location='outer'; sandbox.Math.random=()=>0;
  assert.equal(a.gatherAvailable('outer'),0,'未探索出资源点前不得直接显示采集');
  const need=a.resourceDiscoveryNeed('outer');assert.equal(need,5,'坠毁带入口的垃圾堆最早应在第5次勘察发现');
  a.applyResourceDiscovery('outer',need-1);assert.equal(a.resourceSiteDiscovered('outer'),false,'随机阈值到达前不得提前解锁资源点');
  a.applyResourceDiscovery('outer',need);assert.equal(a.resourceSiteDiscovered('outer'),true);assert.equal(a.LOCATIONS.outer.resourceSite.label,'垃圾堆');
  const before=s.inv.scrap;a.gatherArea('outer');assert.ok(s.inv.scrap-before>=2,'资源点产量必须高于普通探索的单份散落物资');
  a.gatherArea('outer');a.gatherArea('outer');assert.equal(a.gatherAvailable('outer'),0);
  s.time+=8;assert.equal(a.gatherAvailable('outer'),1,'资源点必须按游戏时间逐次恢复，而不是等到次日整批刷新');
}
{
  const s=reset(); a.rest(); assert.equal(a.fmtTime(),'第2天 08:00','休息应前往次日早晨');
}
{
  const s=reset(); s.time=16; a.rest(); assert.equal(a.fmtTime(),'第2天 08:00','午夜休息不得错误跳过当天早晨');
}
{
  const s=reset(); s.inv.scrap=10; a.rest(); a.rest(); a.rest();
  assert.equal(s.inv.scrap,10,'点燃熔炉前不得出现周期袭营');
  s.quests.firstRaid='active'; s.meta.built.smelt=true; sandbox.Math.random=()=>0; a.rest();
  assert.equal(s.flags.firstRaidSurvived,true,'第一次袭营必须在对应任务激活后结算');
  assert.equal(s.meta.damaged.smelt,undefined,'教学袭营不得直接摧毁玩家刚建好的唯一设施');
  const last=s.flags.lastRaidRest; a.rest(); a.rest(); assert.equal(s.flags.lastRaidRest,last,'周期袭营之间至少间隔3次休息');
  a.rest(); assert.ok(s.flags.lastRaidRest>last);
}
{
  const s=reset(); s.areaSearch.layer3=3; s.quests.seal='done'; a.activateAvailableQuests(false);
  assert.equal(a.questSearchCount({id:'faultAudit',target:'layer3'}),0,'新调查任务不得追溯旧调查次数');
}
{
  const s=reset(); s.inv.signalCell=1; s.player.stamina=20; a.startBeacon(0);
  assert.equal(s.inv.signalCell,0,'信标战必须消耗信标电池');
}
{
  const s=reset(); s.skills.heavy.prof=10; a.equipSkill('heavy',0); s.player.stamina=10; a.startCombat('rat'); s.combat.distNow=1; sandbox.Math.random=()=>0;
  a.useSkill('heavy'); assert.ok(s.combat===null||s.combat.hp<16,'技能必须能实际造成伤害');
}
{
  const s=reset(); s.skills.heavy.prof=10; s.player.stamina=10; a.startCombat('rat'); s.combat.distNow=1;
  a.useSkill('heavy'); assert.equal(s.combat.hp,16,'未装配的主动技能不得在战斗中使用');
  a.equipSkill('heavy',1); assert.equal(s.skillSlots[1],'heavy','主动技能应进入指定技能槽');
}
{
  const s=reset(); s.flags.job_vanguard_qualified=true; a.chooseJob('vanguard');
  assert.equal(s.meta.careers.main.id,'vanguard','主职业必须来自已取得的 NPC 资格');
  assert.equal(a.skillUnlocked('pulseBurst'),true,'职业主动技能应随转职解锁');
  assert.equal(s.skills.pulseBurst.prof,10,'职业主动技能解锁时必须从 Lv1 开始，而不是保留在零熟练度');s.player.equip.weapon='pistol';s.inv.ammo=10;a.equipSkill('pulseBurst',0);a.startCombat('scrapDrone');s.combat.distNow=1;sandbox.Math.random=()=>0;a.useSkill('pulseBurst');assert.equal(s.skills.pulseBurst.prof,11,'职业主动技能每次成功释放也必须增加熟练度');
  assert.equal(a.skillUnlocked('combatRhythm'),false,'高阶职业被动不应提前解锁');
  a.gainCareerXp('main',200); assert.ok(s.meta.careers.main.level>=3); assert.equal(a.skillUnlocked('combatRhythm'),true,'职业升级后被动应自动生效');
  assert.ok(a.passiveBonus('atkPct')>0,'被动技能必须自动提供属性，无需装备');
  s.flags.job_bulwark_qualified=true;a.chooseJob('bulwark');assert.equal(s.meta.careers.main.id,'vanguard','没有重构核心时不得覆盖已经选定的主战职业');assert.equal(a.careerRecords('main').length,1,'主战职业无论如何都只能保留一个');
  s.inv.reclassCore=1;a.chooseJob('bulwark');assert.equal(s.meta.careers.main.id,'bulwark','使用重构核心后应替换主战职业，而不是再增加一个');assert.equal(a.careerRecords('main').length,1,'主战转职后仍只能存在一个主战职业');
}
{
  let s=reset();s.meta.careers.main={id:'vanguard',level:1,xp:0};const baseAtk=a.totalAtk();
  assert.equal(a.jobBonus('atkPct'),30);assert.equal(a.jobBonus('crit'),10);assert.equal(a.jobBonus('hit'),10);assert.ok(baseAtk>=15,'方舟突击兵 Lv1 必须立即获得明显高于无职业状态的基础攻击');
  s.meta.careers.main.level=2;assert.equal(a.jobBonus('atk'),4);assert.equal(a.jobBonus('hp'),14);assert.equal(a.jobBonus('critDmg'),4,'突击兵升级必须继续增加攻击、生命与暴击伤害');
  s.meta.careers.main.level=3;assert.equal(a.jobBonus('atkPct'),45);assert.equal(a.jobBonus('crit'),18);assert.equal(a.jobBonus('critDmg'),38,'Lv3 战斗节律必须形成第二次输出跃升');

  s=reset();s.meta.careers.main={id:'bulwark',level:1,xp:0};assert.equal(a.jobBonus('defPct'),35);assert.equal(a.jobBonus('hpPct'),25);assert.equal(a.jobBonus('shield'),40);assert.equal(a.damageReductionRate(),.08,'装甲卫士 Lv1 必须拥有独立于防御数值的职业减伤');
  s.meta.careers.main.level=3;assert.equal(a.jobBonus('def'),6);assert.equal(a.jobBonus('hp'),56);assert.equal(a.jobBonus('shield'),90);assert.equal(a.damageReductionRate(),.18,'Lv3 反应装甲必须把职业减伤提高到 18%');

  s=reset();s.meta.careers.main={id:'infiltrator',level:1,xp:0};assert.equal(a.jobBonus('dodge'),12);assert.equal(a.jobBonus('pen'),25);assert.equal(a.jobBonus('crit'),12);assert.equal(a.jobBonus('critDmg'),40,'相位猎手 Lv1 必须直接获得高穿甲与高暴击收益');
  s.meta.careers.main.level=3;assert.equal(a.jobBonus('pen'),44);assert.equal(a.jobBonus('crit'),20);assert.equal(a.jobBonus('critDmg'),116,'Lv3 弱点演算必须形成高穿甲暴击流派');
  s.skills.phaseStrike.prof=10;s.player.equip.weapon='knife';s.player.stamina=20;a.equipSkill('phaseStrike',0);a.startCombat('guardian');s.combat.distNow=1;sandbox.Math.random=()=>.5;const hp=s.combat.hp;a.useSkill('phaseStrike');assert.ok(hp-s.combat.hp>=50,'相位突袭必须在普通暴击判定失败时仍强制暴击并完全穿甲');
}
{
  Object.entries(a.JOBS).forEach(([id,job])=>{const exclusive=Object.entries(a.SKILLS).filter(([,skill])=>skill.career===id);assert.ok(exclusive.length>=2,`正式职业 ${job.name} 必须至少拥有两项本职业专属技能`);(job.skills||[]).forEach(k=>assert.ok(a.SKILLS[k],`职业 ${job.name} 引用了不存在的技能 ${k}`));});
  Object.entries(a.NOVICE_JOBS).forEach(([id,job])=>assert.ok(Object.values(a.SKILLS).some(skill=>skill.career===id),`入门职业 ${job.name} 必须拥有自己的专属技能`));

  let s=reset();s.meta.careers.main={id:'vanguard',level:3,xp:0};s.skills.combatRhythm.prof=19;assert.equal(a.passiveBonus('atkPct'),15);a.gainCareerXp('main',1);assert.equal(s.skills.combatRhythm.prof,20);assert.equal(a.skillLv('combatRhythm'),2);assert.equal(a.passiveBonus('atkPct'),18,'职业被动升级后必须实际提高属性，而不是只改变等级文字');
  s.skills.combatRhythm.prof=99;a.gainCareerXp('main',1);a.gainCareerXp('main',1);assert.equal(s.skills.combatRhythm.prof,100);assert.equal(a.skillLv('combatRhythm'),10);assert.equal(a.skillProgressText('combatRhythm'),'MAX','职业技能达到 Lv10 后必须封顶，不能无限膨胀');

  s=reset();s.meta.careers.main={id:'noviceScout',level:1,xp:0};s.skills.tacticalScan.prof=10;s.player.equip.weapon='pistol';s.player.stamina=10;s.inv.ammo=10;a.equipSkill('tacticalScan',0);a.startCombat('guardian');s.combat.distNow=1;sandbox.Math.random=()=>.99;const def=s.combat.def;a.useSkill('tacticalScan');assert.equal(s.combat.def,Math.round(def*.7),'战术侦察 Lv1 必须实际永久削弱目标 30% 防御');assert.equal(s.player.stamina,8);assert.equal(s.inv.ammo,10,'战术侦察是职业扫描能力，即使装备枪械也只能消耗体力而不是子弹');assert.equal(s.skills.tacticalScan.prof,11);
}
{
  const s=reset(); s.player.level=18;s.kills=20;s.inv.biocore=20;s.inv.crystal=10;a.unlockGeneNode('g1_core');a.unlockGeneNode('g2_muscle');
  assert.equal(a.geneTier(),2);assert.ok(a.geneBonus('atkPct')>=230,'基因分支应从一阶50%指数增长到二阶百位百分比');
  a.unlockGeneNode('g4_breaker');assert.equal(a.geneTier(),2,'缺少前置时不得跳阶解锁规则节点');
}
{
  const ids=new Set(a.GENE_NODES.map(g=>g.id));assert.equal(Object.keys(a.GENE_TREE.pos).length,ids.size,'基因画布必须布局全部节点');
  a.GENE_NODES.forEach(g=>{assert.ok(a.GENE_TREE.pos[g.id],`基因节点 ${g.id} 缺少画布坐标`);(g.req||[]).forEach(r=>assert.ok(ids.has(r),`基因节点 ${g.id} 的前置 ${r} 不存在`));const p=a.GENE_TREE.pos[g.id];assert.ok(p.x>=0&&p.y>=0&&p.x+a.GENE_TREE.cardW<=a.GENE_TREE.W&&p.y+a.GENE_TREE.cardH<=a.GENE_TREE.H,`基因节点 ${g.id} 越出画布`);});
  const js=fs.readFileSync(__dirname+'/game.js','utf8'),css=fs.readFileSync(__dirname+'/style.css','utf8');assert.match(js,/treevp gene-vp/,'基因锁必须采用科技树式全屏画布');assert.match(js,/attachGeneTreeGestures/,'基因锁必须支持拖拽与缩放');assert.match(css,/\.gnode\.sel/,'基因节点必须提供选中态路径反馈');
}

{
  const ids=new Set(a.QUESTS.map(q=>q.id));
  assert.equal(ids.size,a.QUESTS.length,'任务 ID 不得重复');
  a.QUESTS.forEach(q=>(q.after||[]).forEach(id=>assert.ok(ids.has(id),`任务 ${q.id} 的前置 ${id} 不存在`)));
  const visiting=new Set(),done=new Set();
  function visit(id){
    if(done.has(id))return; assert.ok(!visiting.has(id),`任务前置存在循环：${id}`); visiting.add(id);
    (a.QUESTS.find(q=>q.id===id).after||[]).forEach(visit); visiting.delete(id); done.add(id);
  }
  a.QUESTS.forEach(q=>visit(q.id));
}
{
  const ids=new Set(Object.keys(a.TECHS)),visiting=new Set(),done=new Set();
  const buildIds=new Set([...a.CAMP_BUILDINGS,...a.OUTPOST_BUILDINGS].map(b=>b.id));
  function visit(id){
    if(done.has(id))return; assert.ok(ids.has(id),`科技 ${id} 不存在`); assert.ok(!visiting.has(id),`科技树存在循环：${id}`); visiting.add(id);
    (a.TECHS[id].req||[]).forEach(visit); visiting.delete(id); done.add(id);
  }
  ids.forEach(visit);
  Object.entries(a.TECHS).forEach(([id,t])=>{
    Object.keys(t.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`科技 ${id} 使用了未知材料 ${item}`));
    (t.un||[]).forEach(item=>assert.ok(a.RECIPES[item],`科技 ${id} 解锁了未知配方 ${item}`));
    (t.build||[]).forEach(fac=>assert.ok(buildIds.has(fac),`科技 ${id} 解锁了未知设施 ${fac}`));
    (t.smelt||[]).forEach(sm=>assert.ok(a.SMELT.some(x=>x.id===sm),`科技 ${id} 解锁了未知熔炼 ${sm}`));
  });
}
{
  assert.equal(Object.keys(a.TECHS).length,82,'核心篇与远航篇科技图应包含 82 个节点');
  assert.equal(a.BRANCHES.length,7,'科技图应包含七个相互穿插的研究领域');
  const matItems=Object.entries(a.ITEMS).filter(([,it])=>it.type==='mat').map(([id])=>id).sort();
  assert.deepEqual(Array.from(a.MATS).sort(),matItems,'所有材料必须进入统一材料清单');
  const fresh=a.freshState();a.MATS.forEach(id=>assert.ok(Number.isFinite(fresh.inv[id])&&fresh.inv[id]>=0,'新存档必须初始化材料 '+id));

  const buildingIds=new Set([...a.CAMP_BUILDINGS,...a.OUTPOST_BUILDINGS].map(b=>b.id));
  Object.entries(a.TECHS).forEach(([id,t])=>{
    (Array.isArray(t.fac)?t.fac:(t.fac?[t.fac]:[])).forEach(fac=>assert.ok(buildingIds.has(fac),`科技 ${id} 使用了未知研究设施 ${fac}`));
    (Array.isArray(t.rec)?t.rec:(t.rec?[t.rec]:[])).forEach(rec=>assert.ok(a.TECH_RECORDS[rec]&&a.LOCATIONS[a.TECH_RECORDS[rec].at],`科技 ${id} 使用了无效探索资料 ${rec}`));
  });
  const ownership={un:new Map(),build:new Map(),smelt:new Map(),def:new Map()};
  Object.entries(a.TECHS).forEach(([id,t])=>Object.keys(ownership).forEach(kind=>(t[kind]||[]).forEach(value=>{
    assert.ok(!ownership[kind].has(value),`${kind} ${value} 被多个科技重复解锁`);
    ownership[kind].set(value,id);
  })));
  Object.entries(a.RECIPES).forEach(([id,r])=>{assert.ok(a.ITEMS[r.out],`配方 ${id} 产出未知物品`);Object.keys(r.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`配方 ${id} 使用未知物品 ${item}`));const stations=a.CAMP_BUILDINGS.filter(b=>b.st===r.st);assert.equal(stations.length,1,`配方 ${id} 必须恰好对应一个工位`);});
  a.SMELT.forEach(s=>{assert.ok(a.ITEMS[s.out],`熔炼 ${s.id} 产出未知物品`);Object.keys(s.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`熔炼 ${s.id} 使用未知物品 ${item}`));});
  Object.entries(a.TECH_RECORDS).forEach(([id,r])=>assert.ok(a.LOCATIONS[r.at],`资料 ${id} 的地点不存在`));

  const mapRaw=new Set();Object.values(a.LOCATIONS).forEach(loc=>Object.keys(loc.loot||{}).forEach(id=>mapRaw.add(id)));Object.values(a.LOCATION_ACTIONS).forEach(action=>(action.outcomes||[]).forEach(outcome=>Object.keys(outcome.gain||{}).forEach(id=>mapRaw.add(id))));
  const producers={};a.SMELT.forEach(s=>(producers[s.out]??=[]).push({owner:ownership.smelt.get(s.id),cost:s.cost}));Object.entries(a.RECIPES).forEach(([id,r])=>(producers[r.out]??=[]).push({owner:ownership.un.get(id),cost:r.cost}));
  function obtainable(item,seen=new Set()){if(mapRaw.has(item)||['scrap','wood','stone'].includes(item))return true;if(seen.has(item))return false;const next=new Set(seen).add(item);return (producers[item]||[]).some(p=>Object.keys(p.cost||{}).every(k=>obtainable(k,next)));}
  a.MATS.forEach(item=>assert.ok(obtainable(item),`材料 ${item} 必须有地图或生产来源`));
  Object.entries(a.TECHS).forEach(([id,t])=>Object.keys(t.cost||{}).forEach(item=>assert.ok(obtainable(item),`科技 ${id} 需要不可获得的材料 ${item}`)));
  [...a.CAMP_BUILDINGS,...a.OUTPOST_BUILDINGS].forEach(b=>Object.keys(b.cost||{}).forEach(item=>assert.ok(obtainable(item),`建筑 ${b.id} 需要不可获得的材料 ${item}`)));

  function ancestors(id,out=new Set()){(a.TECHS[id].req||[]).forEach(req=>{if(!out.has(req)){out.add(req);ancestors(req,out);}});return out;}
  const selfLocks=[];
  Object.entries(a.TECHS).forEach(([id,t])=>{const before=ancestors(id);Object.keys(t.cost||{}).filter(item=>!mapRaw.has(item)).forEach(item=>{const ps=producers[item]||[];if(!ps.some(p=>!p.owner||before.has(p.owner)))selfLocks.push(`${id}:${item}`);});});
  assert.deepEqual(selfLocks,[],'科技成本必须全部由前置链生产，不能自锁');
}
{
  const expansionTechs=[
    'make_13','energy_10','power_9','surv_10','echo_8','auto_12','arms_9',
    'make_14','energy_11','auto_13',
    'surv_11','make_15','auto_14','power_10',
    'echo_9','energy_12','arms_10','echo_10',
  ];
  assert.equal(expansionTechs.length,18,'远航篇应追加 18 个科技节点');
  expansionTechs.forEach(id=>{const t=a.TECHS[id];assert.ok(t,`远航科技 ${id} 必须存在`);assert.ok(a.BRANCHES.includes(t.b),`远航科技 ${id} 必须沿用现有七分支`);assert.ok(t.era>=9&&t.era<=12,`远航科技 ${id} 必须位于第9至12文明阶段`);});
  assert.equal(a.BRANCHES.length,7,'远航篇不得为了星际科技额外拆出孤立分支');
  assert.ok(a.TECHS.make_13.req.includes('make_12')&&a.TECHS.make_13.req.includes('energy_9'),'船坞重构必须承接现有制造与能源终点');
  assert.ok(a.TECHS.auto_13.req.includes('make_14'),'行星据点必须显式依赖能够生产建造材料的星舰级冶金');
  assert.ok(a.TECHS.auto_14.req.includes('auto_13'),'自治物流必须建立在首个行星据点之后');
  assert.ok(!a.TECHS.auto_13.req.includes('auto_14'),'第一个外星据点不得反向依赖其后续物流升级');

  const newMaterials=['helium3','iridiumOre','xenoBiomass','voidCrystal','starAlloy','livingComposite','stellarFuel','warpCell'];
  const processed=['starAlloy','livingComposite','stellarFuel','warpCell'];
  assert.equal(a.MATS.length,43,'加入三类厨房食材后，现有材料总数应为43种');
  newMaterials.forEach(id=>{assert.ok(a.MATS.includes(id),`远航材料 ${id} 必须进入统一材料清单`);assert.equal(a.ITEMS[id]&&a.ITEMS[id].type,'mat',`远航材料 ${id} 必须注册为材料`);assert.ok(a.MATERIAL_SOURCES[id],`远航材料 ${id} 必须说明来源`);});
  processed.forEach(id=>{const recipe=a.RECIPES[id]||a.SMELT.find(s=>s.out===id);assert.ok(recipe,`加工材料 ${id} 必须有配方`);assert.equal(recipe.out,id,`加工配方 ${id} 必须产出同名材料`);assert.ok(Object.values(a.TECHS).some(t=>(t.un||[]).includes(id)||(t.smelt||[]).includes(recipe.id)),`加工材料 ${id} 必须由科技明确解锁`);});
  const rawSources={helium3:'regolithSea',iridiumOre:'iridiumCrater',xenoBiomass:'livingCanopy',voidCrystal:'blackGlassPlain'};
  Object.entries(rawSources).forEach(([item,locId])=>{const loc=a.LOCATIONS[locId];assert.ok(loc,`${item} 的产区 ${locId} 必须存在`);assert.ok((loc.resourceSite&&loc.resourceSite.yield||[]).includes(item),`${locId} 必须登记 ${item} 为据点产物`);assert.ok((loc.loot||{})[item]>0,`${locId} 的现场采集必须实际获得 ${item}`);});

  const regionLocations={
    orbit:['orbitalGraveyard','brokenRing','wardenRelay'],
    ashMoon:['regolithSea','iridiumCrater','massDriver'],
    verdant:['xenoShore','livingCanopy','seedCitadel'],
    silent:['blackGlassPlain','precursorVault','zeroGate'],
  };
  assert.equal(Object.keys(a.WORLD_REGIONS).length,9,'加入独立幸存者聚居地后应为九个大区域');
  assert.equal(Object.keys(a.LOCATIONS).length,49,'原有地点加聚居地六地点后应为49个地点');
  Object.entries(regionLocations).forEach(([rid,locations])=>{const region=a.WORLD_REGIONS[rid];assert.ok(region,`远航区域 ${rid} 必须存在`);assert.deepEqual(Array.from(region.locations).sort(),locations.slice().sort(),`${rid} 必须恰好包含三个设计地点`);assert.ok(a.LOCAL_MAPS[rid],`远航区域 ${rid} 必须有可缩放的局部地图`);});
  const earlyMap=reset();earlyMap.discovered.orbitalGraveyard=true;earlyMap.meta.spaceDiscovered.orbitalGraveyard=true;
  assert.equal(a.regionUnlocked('orbit'),false,'旧存档残留的远航发现记录不得让近地轨道在前期地图出现');
  earlyMap.meta.expansionUnlocked=true;
  assert.equal(a.regionUnlocked('orbit'),true,'进入远航篇后，已经发现的近地轨道才应显示在世界地图');

  const campBuildings=new Map(a.CAMP_BUILDINGS.map(b=>[b.id,b]));
  const outpostBuildings=new Map(a.OUTPOST_BUILDINGS.map(b=>[b.id,b]));
  assert.equal(campBuildings.get('starDock')&&campBuildings.get('starDock').st,'ship','星舰船坞必须是独立 ship 工位');
  assert.ok(campBuildings.has('navArray'),'营地必须能建造深空导航阵列');
  ['outpostCore','exoExtractor','planetShield'].forEach(id=>assert.ok(outpostBuildings.has(id),`外星据点组件 ${id} 必须存在`));
  assert.ok((a.TECHS.make_13.build||[]).includes('starDock'),'船坞重构必须解锁星舰船坞');
  assert.ok((a.TECHS.auto_12.build||[]).includes('navArray'),'深空导航智能必须解锁导航阵列');
  assert.ok((a.TECHS.auto_13.build||[]).includes('outpostCore')&&(a.TECHS.auto_13.build||[]).includes('planetShield'),'首个据点科技必须同时解锁核心与基础防卫，不能等待绿潮星材料');
  assert.ok((a.TECHS.auto_14.build||[]).includes('exoExtractor'),'自治物流必须解锁异星采集站');

  assert.equal(a.SPACE_ROUTES.length,5,'第一扩展篇应包含五段明确的星际航路');
  const routeTo=Object.fromEntries(a.SPACE_ROUTES.map(r=>[r.to,r]));
  ['orbitalGraveyard','regolithSea','xenoShore','blackGlassPlain','precursorVault'].forEach(to=>assert.ok(routeTo[to],`缺少通往 ${to} 的航路`));
  a.SPACE_ROUTES.forEach(route=>{assert.ok(route.from==='camp'||a.LOCATIONS[route.from],`航路起点 ${route.from} 不存在`);assert.ok(a.LOCATIONS[route.to],`航路终点 ${route.to} 不存在`);Object.keys(route.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`航路 ${route.from}→${route.to} 使用未知燃料 ${item}`));if(route.needTech)assert.ok(a.TECHS[route.needTech],`航路 ${route.from}→${route.to} 引用了未知科技 ${route.needTech}`);assert.equal(route.emergencyReturn,true,`航路 ${route.from}→${route.to} 必须声明失联返航兜底`);});
  assert.equal(routeTo.orbitalGraveyard.needFlag,'starshipReady','首次出航必须由星舰完成状态解锁');
  ['helium3','iridiumOre','xenoBiomass','voidCrystal','starAlloy','livingComposite','stellarFuel','warpCell'].forEach(item=>assert.ok(!(routeTo.regolithSea.cost||{})[item],`首次抵达赤烬卫星不得预先消耗当地或后续材料 ${item}`));
  assert.ok((routeTo.xenoShore.cost||{}).stellarFuel>0,'前往绿潮星必须消费赤烬卫星可生产的恒星燃料');
  assert.ok((routeTo.blackGlassPlain.cost||{}).stellarFuel>0,'前往静默星外层必须消费恒星燃料');
  assert.ok((routeTo.precursorVault.cost||{}).warpCell>0,'进入先驱档案库必须使用静默星外层材料制成的曲率航迹胞');
  ['orbitalGraveyard','regolithSea','xenoShore','blackGlassPlain'].forEach(to=>{const route=routeTo[to];Object.entries(route.cost||{}).forEach(([item,n])=>assert.ok((route.firstArrivalGrant||{})[item]>=n,`首次抵达 ${to} 必须预留 ${item} 的返航份额`));});

  const recordLocations={orbitalRelay:'wardenRelay',iridiumSample:'iridiumCrater',heliumArchive:'regolithSea',xenoGenome:'xenoShore',monolithCoordinates:'seedCitadel',gateLattice:'blackGlassPlain',gateGrammar:'precursorVault'};
  Object.entries(recordLocations).forEach(([record,at])=>assert.equal(a.TECH_RECORDS[record]&&a.TECH_RECORDS[record].at,at,`远航资料 ${record} 必须来自 ${at}`));
  const questIds=['exo_signal','exo_dock','exo_ship','exo_first_launch','exo_relay','exo_ash_landing','exo_mass_driver','exo_first_outpost','exo_verdant_landing','exo_genome','exo_seed_choice','exo_green_outpost','exo_silent_route','exo_vault','exo_gate_guardian','exo_frontier_choice'];
  const quests=new Map(a.QUESTS.map(q=>[q.id,q]));questIds.forEach(id=>assert.ok(quests.has(id),`远航任务 ${id} 必须存在`));
  const chain=[['exo_signal','core'],['exo_dock','exo_signal'],['exo_ship','exo_dock'],['exo_first_launch','exo_ship'],['exo_relay','exo_first_launch'],['exo_ash_landing','exo_relay'],['exo_mass_driver','exo_ash_landing'],['exo_first_outpost','exo_mass_driver'],['exo_verdant_landing','exo_first_outpost'],['exo_genome','exo_verdant_landing'],['exo_seed_choice','exo_genome'],['exo_green_outpost','exo_seed_choice'],['exo_silent_route','exo_green_outpost'],['exo_vault','exo_silent_route'],['exo_gate_guardian','exo_vault'],['exo_frontier_choice','exo_gate_guardian']];
  chain.forEach(([id,after])=>assert.ok((quests.get(id).after||[]).includes(after),`远航任务 ${id} 必须在 ${after} 之后`));
  assert.equal(quests.get('exo_ship').reward&&quests.get('exo_ship').reward.flag,'starshipReady','完成星舰装配任务必须写入可出航状态');
  assert.equal(quests.get('exo_first_outpost').targetFlag,'ashOutpostOperational','首个据点任务必须等待赤烬据点进入运行状态');
  assert.equal(quests.get('exo_green_outpost').targetFlag,'verdantOutpostOperational','绿潮星任务必须等待当地据点进入运行状态');
  const fresh=a.freshState();assert.ok(fresh.meta.outposts&&typeof fresh.meta.outposts==='object'&&!Array.isArray(fresh.meta.outposts),'新存档必须初始化外星据点状态');assert.equal(!!fresh.flags.starshipReady,false,'新存档不得提前拥有出航资格');
}
{
  const ids=new Set(Object.keys(a.LOCATIONS));
  a.MAP_LINKS.forEach(([from,to])=>{assert.ok(ids.has(from),`地图端点 ${from} 不存在`);assert.ok(ids.has(to),`地图端点 ${to} 不存在`);});
  const s=reset(); a.QUESTS.forEach(q=>s.quests[q.id]='done');
  Object.entries(a.LOCATIONS).forEach(([id,loc])=>{s.discovered[id]=true;if(loc.hiddenBy)s.flags[loc.hiddenBy]=true;});
  a.MAP_LINKS.forEach(([from,to])=>s.knownRoutes[a.routeKey(from,to)]=true);
  ['accessCard','plasmaCutter','maintenanceKey','civilPass','depthLamp','sporeSeal','signalCipher'].forEach(id=>s.inv[id]=1);
  const spaceLocations=new Set(['orbit','ashMoon','verdant','silent'].flatMap(rid=>a.WORLD_REGIONS[rid]?Array.from(a.WORLD_REGIONS[rid].locations):[]));
  Object.keys(a.LOCATIONS).filter(id=>!spaceLocations.has(id)).forEach(id=>assert.ok(Number.isFinite(a.staminaToCamp(id)),`${id} 没有可返回营地的路线`));
}
{
  Object.keys(a.WORLD_POS).forEach(id=>assert.ok(a.LOCATIONS[id],`兼容用全局坐标 ${id} 必须指向真实地点`));
  Object.entries(a.WORLD_REGIONS).forEach(([rid,region])=>{const local=a.LOCAL_MAPS[rid];assert.ok(local,`区域 ${rid} 必须有局部地图`);assert.deepEqual(Object.keys(local.pos).sort(),Array.from(new Set([...region.locations,...(local.externalLocations||[])])).sort(),`区域 ${rid} 的地点与局部坐标必须完全一致`);Object.entries(local.pos).forEach(([id,[x,y]])=>{assert.ok(x>=0&&y>=0&&x+local.canvas.nodeWidth<=local.canvas.width&&y+local.canvas.nodeHeight<=local.canvas.height,`${id} 越出局部地图`);});});
  const assertNoOverlap=(label,canvas,positions)=>{const layout=a.verticalMapLayout(canvas,positions),ids=Object.keys(layout.pos),gap=8;for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const one=layout.pos[ids[i]],two=layout.pos[ids[j]],separate=Math.abs(one[0]-two[0])>=layout.canvas.nodeWidth+gap||Math.abs(one[1]-two[1])>=layout.canvas.nodeHeight+gap;assert.ok(separate,`${label} 地图节点重叠或间距不足：${ids[i]} / ${ids[j]}`);}};
  assertNoOverlap('世界',a.WORLD_MAP_CANVAS,a.WORLD_REGION_POS);Object.entries(a.LOCAL_MAPS).forEach(([rid,map])=>assertNoOverlap(rid,map.canvas,map.pos));
  ['silica','titaniumOre','deuterium','phaseCrystal'].forEach(item=>assert.ok(Object.values(a.LOCATIONS).some(loc=>(loc.loot||{})[item]>0),`高级地图原料 ${item} 必须有明确产区`));
}
{
  const s=reset();s.tutorial.complete=true;s.flags.mapUnlocked=true;s.player.location='camp';s.discovered.silicaField=true;s.mapSelected='silicaField';assert.equal(a.locationRevealed('silicaField'),true);assert.equal(a.mapNodeState('silicaField'),'locked','离开相邻地点后，已经发现但科技不足的熔玻原仍应保持锁定高亮状态');
  const box=new FakeElement(),nodes=[];a.renderLocalMap(box,'surface');(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const silica=nodes.find(node=>node.dataset&&node.dataset.loc==='silicaField');
  assert.ok(silica&&silica.innerHTML.includes('熔玻原')&&silica.className==='mapnode locked','已发现但条件不足的地点必须继续显示真实名称和锁定状态，不能回退成灰色未知区域');assert.notEqual(silica.disabled,true,'已发现地点必须可以点开查看路线状态');const detail=nodes.find(node=>node.className==='map-detail'),condition=nodes.find(node=>node.className==='map-go');assert.match(detail.innerHTML,/需要科技【光学扫描】/);assert.equal(condition.textContent,'查看条件','无论地点是否相邻，锁定节点都必须直接提供查看条件入口');
  const css=fs.readFileSync(__dirname+'/style.css','utf8');assert.match(css,/\.mapnode\.known\s*\{[^}]*opacity:1/,'已标记且条件满足的远处地点必须持续点亮');assert.match(css,/\.mapnode\.locked\s*\{[^}]*opacity:1[^}]*\}[\s\S]*?\.mapnode\.locked::after\s*\{[^}]*content:'查看条件'/,'已标记但条件不足的地点必须持续高亮并标出查看条件');
}
{
  const s=reset();s.tutorial.complete=true;s.flags.mapUnlocked=true;s.player.location='camp';const gated=new Set(Object.keys(a.ENTRY_REQUIREMENTS));Object.entries(a.LOCATIONS).forEach(([id,loc])=>{if(loc.needTech||loc.needItem||loc.needFlag)gated.add(id);});['layer2','layer3','layer4','layer5','layer6','layer7','fungal','abyss','signal'].forEach(id=>gated.add(id));
  gated.forEach(id=>{s.discovered[id]=true;const loc=a.LOCATIONS[id];if(loc.hiddenBy)s.flags[loc.hiddenBy]=true;assert.equal(a.mapNodeState(id),'locked',`${loc.name} 已标记后即使离开相邻地点，也必须持续显示解锁条件`);});
}
{
  let s=reset();s.meta.records=[];a.discoverTechRecord('layer6');assert.ok(s.meta.records.includes('command')&&s.meta.records.includes('gravityMap'),'同一地点的多份技术资料必须一次全部取得');
  s=reset();Object.assign(s.meta.techs,{make_1:1,make_3:1,energy_1:1});Object.assign(s.inv,{copperIngot:4,ecomp:4,crystal:2});const before=JSON.stringify({copperIngot:s.inv.copperIngot,ecomp:s.inv.ecomp,crystal:s.inv.crystal});
  a.research('energy_2');assert.equal(s.meta.techs.energy_2,undefined,'研究设施未建时不得完成高阶研究');assert.equal(JSON.stringify({copperIngot:s.inv.copperIngot,ecomp:s.inv.ecomp,crystal:s.inv.crystal}),before,'设施缺失不得扣研究材料');
  s.meta.built.energyCore=true;a.research('energy_2');assert.equal(s.meta.techs.energy_2,undefined,'专用研究设施建成后，仍必须通过营地科技台操作');
  s.meta.built.research=true;s.meta.buildLevels.research=1;a.research('energy_2');assert.equal(s.meta.techs.energy_2,1,'科技台与专用研究设施都上线后应允许研究');assert.equal(s.time,4,'早期未来科技应使用声明的研究时长');
  s=reset();s.meta.techVersion=3;s.meta.techs={make_1:1,auto_7:1};a.migrateTechTree();assert.equal(s.meta.techVersion,5);assert.equal(s.meta.techs.make_1,1);assert.equal(s.meta.techs.auto_7,1);assert.equal(s.meta.legacyTechGates,true,'v3 存档应保留旧基因科技门槛豁免');const once=JSON.stringify(s.meta);a.migrateTechTree();assert.equal(JSON.stringify(s.meta),once,'v5 科技迁移必须幂等');
}
{
  const allRegionLocations=Object.values(a.WORLD_REGIONS).flatMap(r=>Array.from(r.locations));
  assert.equal(new Set(allRegionLocations).size,Object.keys(a.LOCATIONS).length,'每个具体地点必须且只能归属一个大区域');
  ['outer','joeCamp','cargoYard','blackwood','ridge','floodChannel','relayTower','coalRift','oldMine','silicaField','titaniumMine'].forEach(id=>assert.ok(a.WORLD_REGIONS.surface.locations.includes(id),id+' 必须留在坠毁带局部地图'));
  assert.ok(!Object.keys(a.WORLD_REGIONS).includes('blackwood'),'世界地图不得把黑木林当作大区域节点');
  const s=reset();assert.deepEqual(Object.keys(s.discovered).sort(),['camp','joeCamp','outer'],'引导地图开局只能登记营地、坠毁带入口与老乔营地');
  s.player.location='outer';s.player.stamina=80;sandbox.Math.random=()=>0;
  const resourceNeed=a.resourceDiscoveryNeed('outer'),routeNeeds=Array.from(a.DISCOVERY_MILESTONES.outer,(rule,index)=>a.milestoneNeed('outer',index,rule));
  assert.equal(resourceNeed,5,'入口垃圾堆应在5-10次勘察中的随机一步发现');assert.deepEqual(routeNeeds,[18,25,32],'同一地点的后续路口必须逐段拉开，不得连续点击全部解锁');
  a.applyResourceDiscovery('outer',resourceNeed-1);a.applyDiscoveryMilestones('outer',routeNeeds[0]-1);assert.equal(s.resourceSites.outer,undefined);assert.equal(s.discovered.cargoYard,undefined);
  a.applyResourceDiscovery('outer',resourceNeed);a.applyDiscoveryMilestones('outer',routeNeeds[0]);assert.equal(s.resourceSites.outer,true);assert.equal(s.discovered.cargoYard,true);
  a.applyDiscoveryMilestones('outer',routeNeeds[1]);assert.equal(s.discovered.blackwood,true);a.applyDiscoveryMilestones('outer',routeNeeds[2]);
  assert.equal(s.discovered.ridge,true);assert.equal(s.discovered.layer2,undefined,'入口的多个出口只能通向同一区域的相邻场景');
  assert.equal(a.locationGate('blackwood').ok,true,'荆棘不是硬锁，没有刀也能冒险穿过');
  assert.equal(a.routeNeedsConfirm('outer','blackwood'),true,'黑木林入口必须显示可重复路障');
  const hp=s.player.hp;a.crossRouteObstacle('outer','blackwood',false);assert.equal(s.player.location,'blackwood');assert.equal(s.player.hp,hp-8,'没有刀强行穿越必须扣血');
  a.crossRouteObstacle('blackwood','outer',false);assert.equal(s.player.hp,hp-16,'未清障时每次经过都必须再次扣血');
  s.inv.knife=1;a.crossRouteObstacle('outer','blackwood',true);assert.equal(s.flags.blackwoodThornsCleared,true,'持有刀具后应永久清除荆棘');
  const safeHp=s.player.hp;a.move('outer');assert.equal(s.player.hp,safeHp,'永久清障后再次经过不得扣血');
  s.player.location='cargoYard';s.visited.cargoYard=true;s.areaSearch.cargoYard=1;s.inv.scrap=Math.max(2,s.inv.scrap||0);s.inv.ecomp=Math.max(1,s.inv.ecomp||0);
  assert.equal(a.operationStatus('repairCutter').ok,true,'入口事件与货柜事件应提供修复切割器所需材料');
  a.performFieldOperation('repairCutter');assert.equal(s.inv.plasmaCutter,1,'工业切割器仍用于矿井和其他重型清障');
}
{
  let s=reset();s.player.location='floodChannel';s.player.stamina=50;s.discovered.floodChannel=true;sandbox.Math.random=()=>0;
  const mineNeed=a.milestoneNeed('floodChannel',1,a.DISCOVERY_MILESTONES.floodChannel[1]);a.applyDiscoveryMilestones('floodChannel',mineNeed-1);assert.equal(s.flags.mineEntrance,undefined);a.applyDiscoveryMilestones('floodChannel',mineNeed);
  assert.equal(s.flags.mineEntrance,true,'排水渠机关必须能开启旧矿井的第二入口');
  assert.equal(a.locationRevealed('oldMine'),true,'特殊机关触发后隐藏地点必须真正显示在地图上');
  assert.ok(a.MAP_LINKS.some(([x,y])=>new Set([x,y]).has('floodChannel')&&new Set([x,y]).has('oldMine')),'旧矿井必须具有不止一条发现路线');
  s=reset();s.player.location='layer4';s.player.stamina=50;s.discovered.layer4=true;sandbox.Math.random=()=>0;
  const nurseryNeed=a.milestoneNeed('layer4',1,a.DISCOVERY_MILESTONES.layer4[1]);a.applyDiscoveryMilestones('layer4',nurseryNeed-1);assert.equal(s.flags.nurseryFound,undefined);a.applyDiscoveryMilestones('layer4',nurseryNeed);
  assert.equal(s.flags.nurseryFound,true);assert.equal(a.locationRevealed('nursery'),true,'实验室机关必须开启隐藏培养室');
}
{
  const s=reset();
  Object.entries(a.ENTRY_REQUIREMENTS).forEach(([loc,req])=>{assert.ok(a.LOCATIONS[loc],`入口条件地点 ${loc} 不存在`);assert.ok(a.ITEMS[req.item],`入口条件 ${loc} 使用未知道具 ${req.item}`);});
  Object.entries(a.FIELD_OPERATIONS).forEach(([id,op])=>{assert.ok(a.LOCATIONS[op.at],`现场操作 ${id} 地点不存在`);assert.ok(a.ITEMS[op.grant],`现场操作 ${id} 产出未知道具`);Object.keys(op.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`现场操作 ${id} 使用未知材料 ${item}`));});
  ['oldMine','relayTower','layer2','freightHub','coolingGallery','titaniumMine','cryoVault','sealedCabin','underworks','sporeTunnel','ruinVestibule','livingCanopy'].forEach(id=>assert.ok(a.ENTRY_REQUIREMENTS[id],`${a.LOCATIONS[id].name} 必须通过统一入口弹层说明所需道具及来源`));
  ['floodChannel','relayTower','layer3','layer4','nursery','abyss','phaseGrove'].forEach(id=>assert.ok((a.DISCOVERY_MILESTONES[id]||[]).length,`${a.LOCATIONS[id].name} 必须能继续探索出新路线或特殊地点`));
  const resourceSites=Object.entries(a.LOCATIONS).filter(([,loc])=>loc.resourceSite);
  assert.ok(resourceSites.length>=5,'三层地图都应包含可供后续自动建筑接管的资源据点候选');
  resourceSites.forEach(([id,loc])=>{assert.equal(a.gatherLimit(id),['mine','lunar'].includes(loc.profile)?4:3,`${loc.name} 必须具有可恢复的资源容量`);loc.resourceSite.yield.forEach(item=>assert.ok(loc.loot[item]>0,`${loc.name} 必须实际产出标注资源 ${item}`));});
  const css=fs.readFileSync(__dirname+'/style.css','utf8'),js=fs.readFileSync(__dirname+'/game.js','utf8');
  assert.match(css,/\.site-sheet-backdrop\s*\{[^}]*position:fixed[^}]*max-width:520px/s,'入口与现场操作必须使用手机宽度内的底部弹层');
  assert.match(js,/if\(opId\)markers\.push\(\{id:'operation:'[\s\S]{0,520}scheduledDiscoveryNeed\('map-operation'[\s\S]*renderFieldMarkerDrawer/,'现场操作必须按随机阈值出现在地图上，并通过地点详情弹层执行');
}
{
  let s=reset();s.player.location='relayTower';s.areaSearch.relayTower=1;s.inv.ecomp=2;
  assert.equal(a.operationStatus('restoreTower').ok,true);a.performFieldOperation('restoreTower');
  assert.equal(s.inv.civilPass,1);assert.equal(s.discovered.layer2,true,'恢复断波塔应取得生活区门禁并现场标出方舟入口');
  s=reset();s.tutorial={version:1,step:'done',complete:true};s.player.location='oldMine';s.areaSearch.oldMine=1;s.flags.minerFreed=true;s.inv.copperScrap=2;s.inv.ecomp=1;
  a.performFieldOperation('assembleLamp');assert.equal(s.inv.depthLamp,1,'救出矿工后应能组装深层探照灯');assert.equal(s.flags.bp_miningHarness,true,'组装探照灯时必须同步取得采掘外骨骼蓝图，不能先把阿拓迁走再等交谈发放');assert.equal(s.discovered.underworks,true,'取得深层探照灯后必须直接标出船底维修井');assert.equal(a.npcLocation('阿拓'),'underworks','阿拓说要先下维修井后必须立即离开旧矿井');assert.equal(s.flags['storyScene_npc-depart-阿拓-underworks'],true,'NPC 动身时必须播放明确说明目的地的迁移剧情');
  s=reset();s.player.location='abyss';s.areaSearch.abyss=3;s.flags.relayFixed=true;s.inv.crystal=2;s.inv.ecomp=1;
  a.performFieldOperation('decodeRelic');assert.equal(s.inv.signalCipher,1);assert.equal(s.discovered.ruinVestibule,true,'解码中继信号后才应发现遗迹门厅');
}
{
  const s=reset();s.flags.minerFreed=true;s.flags.depthLampBuilt=true;s.inv.depthLamp=1;delete s.flags.bp_miningHarness;delete s.discovered.underworks;a.updateCheckpoint();a.restoreCheckpoint();const restored=a.getState();
  assert.equal(restored.flags.bp_miningHarness,true,'已经组装探照灯的旧检查点必须自动补发采掘外骨骼蓝图');assert.equal(restored.discovered.underworks,true,'已经组装探照灯的旧检查点必须自动补标船底维修井');assert.equal(a.npcLocation('阿拓'),'underworks','探照灯完成后阿拓的位置必须稳定指向维修井');
}
{
  const s=reset();s.player.location='joeCamp';s.player.stamina=20;sandbox.Math.random=()=>0;a.explore('investigate');
  assert.equal(s.inv.wood,1,'调查失败后应有机会随机拾取当前地点资源');
}
{
  const s=reset();s.player.location='outer';s.player.stamina=50;sandbox.Math.random=()=>.99;
  const first=a.milestoneNeed('outer',0,a.DISCOVERY_MILESTONES.outer[0]);assert.equal(first,26,'新路口应在18-26步中首次抽取一个固定值');
  sandbox.Math.random=()=>0;assert.equal(a.milestoneNeed('outer',0,a.DISCOVERY_MILESTONES.outer[0]),26,'同一存档返回营地后不得重新抽取发现步数');
  a.applyDiscoveryMilestones('outer',25);assert.equal(s.discovered.cargoYard,undefined);a.applyDiscoveryMilestones('outer',26);assert.equal(s.discovered.cargoYard,true);
}
{
  let s=reset();assert.deepEqual(Array.from(a.explorationPacingRange('resource','outer',0)),[5,10]);assert.deepEqual(Array.from(a.explorationPacingRange('resource','layer4',0)),[10,15]);assert.deepEqual(Array.from(a.explorationPacingRange('route','oldMine',0)),[20,30]);
  sandbox.Math.random=()=>.5;const npcNeed=a.npcDiscoveryNeed('林薇');assert.ok(npcNeed>=5&&npcNeed<=9);a.applyNpcDiscoveries('layer3',npcNeed-1);assert.equal(s.flags.fieldNpcFound_林薇,undefined);a.applyNpcDiscoveries('layer3',npcNeed);assert.equal(s.flags.fieldNpcFound_林薇,true,'现场 NPC 也必须在各自区间内随机发现');assert.ok(Array.from(a.npcsAt('layer3')).includes('林薇'));
  s=reset();s.fieldEncounter={pressure:0,safeSteps:0,cooldown:0};sandbox.Math.random=()=>0;assert.equal(a.rollFieldEncounter(.3),true);assert.equal(s.fieldEncounter.pressure,1);assert.equal(s.fieldEncounter.cooldown,1);assert.equal(a.rollFieldEncounter(.3),false,'遭遇战后的下一次野外行动必须安全');
  const reduced=a.fieldEncounterChance(.3);s.fieldEncounter.pressure=0;const recovered=a.fieldEncounterChance(.3);assert.ok(reduced<recovered,'近期战斗越密集，下一步再遇敌的概率必须越低');
  s.fieldEncounter={pressure:0,safeSteps:9,cooldown:0};sandbox.Math.random=()=>.99;assert.equal(a.rollFieldEncounter(.3),true,'长时间没有遭遇后应有软保底，避免战斗内容永远不出现');
}
{
  Object.entries(a.LOCAL_MAPS).forEach(([rid,map])=>{assert.ok(map.canvas.nodeWidth>=120,`${rid} 地图节点必须足够显示完整地点名`);const links=a.MAP_LINKS.filter(([from,to])=>map.pos[from]&&map.pos[to]);links.forEach(([from,to])=>{const p=a.mapEdgePath(map.pos[from],map.pos[to],map.canvas);assert.match(p,/^M[\d.]+,[\d.]+ L[\d.]+,[\d.]+ L[\d.]+,[\d.]+ L[\d.]+,[\d.]+$/,`${from} → ${to} 的连接线路径无效`);
    const n=p.match(/[\d.]+/g).map(Number),start=n.slice(0,2),end=n.slice(-2),onEdge=(point,pos)=>{const [x,y]=point,[left,top]=pos,right=left+map.canvas.nodeWidth,bottom=top+map.canvas.nodeHeight;return ((x===left||x===right)&&y>=top&&y<=bottom)||((y===top||y===bottom)&&x>=left&&x<=right);};
    assert.ok(onEdge(start,map.pos[from]),`${from} → ${to} 起点没有贴住节点边缘`);assert.ok(onEdge(end,map.pos[to]),`${from} → ${to} 终点没有贴住节点边缘`);
  });});
}
{
  const s=reset(); let route=a.travelRoute('camp','outer');
  assert.deepEqual(Array.from(route.path),['camp','outer']); assert.equal(route.cost,2,'相邻区域应显示准确体力消耗');
  assert.equal(a.travelRoute('camp','blackwood'),null,'不得快速移动跳过尚未探索的中间区域');
  Object.assign(s.discovered,{cargoYard:true,blackwood:true});s.inv.plasmaCutter=1;s.visited.outer=true;s.visited.cargoYard=true;s.visited.blackwood=true;s.knownRoutes[a.routeKey('outer','cargoYard')]=true;s.knownRoutes[a.routeKey('outer','blackwood')]=true;route=a.travelRoute('camp','blackwood');
  assert.deepEqual(Array.from(route.path),['camp','outer','blackwood']); assert.equal(route.cost,2,'已经走熟的路线应按路径段计费，不得按地图层级额外加价');
}
{
  const s=reset(); s.player.location='outer'; s.player.stamina=50; sandbox.Math.random=()=>1;
  a.explore('investigate'); a.explore('investigate'); const scrap=s.inv.scrap,stone=s.inv.stone;
  s.time+=24; a.explore('investigate');
  assert.equal(s.inv.scrap,scrap,'固定事件道具不得随日期刷新'); assert.equal(s.inv.stone,stone,'固定事件道具不得重复掉落');
}
{
  const s=reset(); s.meta.built.smelt=true; s.meta.damaged.smelt=true; s.inv.scrap=3; a.repairFacility('smelt');
  assert.equal(s.meta.damaged.smelt,undefined,'损坏设施必须有可用的修复路径'); assert.equal(s.inv.scrap,0);
}
{
  const s=reset(); s.meta.echo=20; a.buyEchoUpgrade('stamina');
  assert.equal(s.meta.echoUp.stamina,1); assert.equal(s.meta.mult.stamina,1.1,'回响强化必须立即刷新倍率');
}
{
  const s=reset(); a.chooseEnding('sever'); s.player.equip.weapon='sever';
  assert.ok(a.statPen()>=50,'断链者之刃必须兑现 50% 穿透说明');
  a.chooseEnding('sever'); assert.equal(s.inv.sever,1,'同一结局道具不得重复发放');
}
{
  const s=reset(); s.meta.built.smelt=true; s.inv.scrap=1; s.inv.ration=0; sandbox.Math.random=()=>0; a.resolveRaid();
  assert.ok(s.inv.scrap>=0&&s.inv.ration>=0,'袭营失败不得把资源扣成负数');
}
{
  const s=reset(),quarters=a.CAMP_BUILDINGS.find(b=>b.id==='quarters');
  assert.equal(s.tutorial.step,'wake','新档必须从睁眼动画开始');
  assert.equal(s.meta.built.quarters,undefined,'新档必须由玩家亲手建造休眠仓');
  assert.deepEqual(JSON.parse(JSON.stringify(quarters.cost)),{scrap:4,wood:4},'休眠仓应使用引导发放的废铁和木材');
  a.finishWakeAnimation(); assert.equal(s.tutorial.step,'meet','睁眼后应进入空营地并等待玩家点击引导 NPC');
  s.tutorial.step='bracelet_offer'; a.grantTutorialBracelet();
  assert.equal(s.inv.arkBand,1); assert.equal(s.flags.braceletUnlocked,true,'手环必须解锁状态栏和三个入口');
  s.tutorial.step='builder_offer'; a.grantTutorialBuilder();
  assert.equal(s.inv.builderGun,1); assert.equal(s.inv.scrap,4); assert.equal(s.inv.wood,4,'建造枪阶段必须发放刚好够用的初始材料');
  a.buildFacility(quarters); assert.equal(s.meta.built.quarters,true); assert.equal(s.inv.scrap,0); assert.equal(s.inv.wood,0); assert.equal(s.tutorial.step,'shelter');
  assert.equal(a.damageRandomFacility(),null,'只有休眠仓时不得在袭营中损坏，否则可能失去唯一休息路径');
  s.inv.scrap=2;s.inv.wood=2;
  a.grantTutorialMap(); assert.equal(s.inv.fieldMap,1); assert.equal(s.flags.mapUnlocked,true); assert.equal(s.flags.exploreUnlocked,true);
  a.completeTutorial(); assert.equal(a.tutorialActive(),false); assert.equal(s.flags.guideDeparted,true,'老乔告别后引导必须完成');
  const research=a.CAMP_BUILDINGS.find(b=>b.id==='research');assert.deepEqual(JSON.parse(JSON.stringify(research.cost)),{scrap:2,wood:2},'采集教学留下的材料应刚好够建造科技台');
  a.buildFacility(research);assert.equal(s.meta.built.research,true,'科技台必须作为营地建筑建造');const stateBeforePanel=s.campBuilding;s.campBuilding='research';assert.equal(a.panelView(),'tech','只有从营地科技台进入时才显示科技树');s.player.location='outer';assert.notEqual(a.panelView(),'tech','离开营地后不得继续查看科技树');s.player.location='camp';s.campBuilding=stateBeforePanel;
}
{
  const s=reset(); s.meta.techs.make_1=1; s.inv.scrap=10; s.inv.stone=10;
  const smelt=a.CAMP_BUILDINGS.find(x=>x.id==='smelt'); a.buildFacility(smelt);
  assert.equal(s.meta.built.smelt,true,'科技解锁后必须能建造设施'); assert.equal(a.buildingLevel('smelt'),1);
  s.meta.techs.make_3=1; s.inv.ingot=3; s.inv.copperIngot=2; a.upgradeFacility('smelt');
  assert.equal(a.buildingLevel('smelt'),2,'设施升级应保存在建筑等级中');
}
{
  const s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=1;Object.assign(s.inv,{ration:2,mutantMeat:2});s.player.hp=50;s.player.stamina=10;
  assert.equal(a.CAMP_BUILDINGS.find(x=>x.id==='mess').name,'营地厨房','配给站必须改成具有制作功能的营地厨房');
  assert.equal(a.cookFood('nutriStew'),true);assert.equal(a.cookFood('nutriStew'),true,'厨房料理不应继续受每日一次配给限制');
  assert.equal(s.inv.nutriStew,2);assert.equal(s.inv.ration,0);assert.equal(s.inv.mutantMeat,0);
  a.useItem('nutriStew');assert.equal(s.player.hp,70);assert.equal(s.player.stamina,45,'料理成品必须进入背包并由玩家选择使用时机');
}
{
  assert.deepEqual(Object.keys(a.LOCATION_ACTIONS),['floodChannel'],'只有形成独立用途闭环的地点才应增加专属行动');
  const fishGains=a.LOCATION_ACTIONS.floodChannel.outcomes.flatMap(o=>Object.keys(o.gain||{}));
  assert.ok(fishGains.length>0&&fishGains.every(id=>id==='riverFish'),'垂钓必须产出独有食材，不能退化成通用采集换皮');
  assert.equal(a.MATERIAL_SOURCES.riverFish,'冲刷排水渠 · 专属垂钓');
  assert.deepEqual(Array.from(a.TECHS.make_2.un),['fishingRod','miningPick','fieldShovel'],'三件基础野外工具必须随基础制造解锁');
}
{
  const s=reset();s.player.location='floodChannel';s.player.stamina=10;sandbox.Math.random=()=>0;
  assert.equal(a.performLocationAction('floodChannel'),false,'没有导电鱼竿时不得徒手钓鱼');assert.equal(s.player.stamina,10);
  s.inv.fishingRod=1;
  assert.equal(a.performLocationAction('floodChannel'),true);assert.equal(s.inv.riverFish,1);assert.equal(s.player.stamina,9);assert.equal(a.locationActionRemaining('floodChannel'),1);
  a.performLocationAction('floodChannel');const stamina=s.player.stamina,fish=s.inv.riverFish;
  assert.equal(a.performLocationAction('floodChannel'),false,'垂钓达到每日上限后不得继续结算');assert.equal(s.player.stamina,stamina);assert.equal(s.inv.riverFish,fish);
}
{
  let s=reset();s.player.location='outer';s.player.stamina=10;a.explore('hunt');assert.equal(s.player.stamina,10,'肃清周边只负责进入战斗，不得预扣体力');assert.ok(s.combat,'肃清周边必须直接触发战斗');
  s=reset();s.player.location='outer';assert.equal(a.resourceWorkStatus('outer').ok,true);assert.equal(a.resourceWorkStatus('outer').tool,null,'垃圾堆必须允许徒手翻找');
  s.player.location='floodChannel';assert.equal(a.resourceWorkStatus('floodChannel').ok,false);s.inv.fieldShovel=1;assert.equal(a.resourceWorkStatus('floodChannel').ok,true);assert.equal(a.resourceWorkStatus('floodChannel').cost,3,'漂积物挖掘必须使用工兵铲并高于普通翻找消耗');
  s.player.location='ridge';assert.equal(a.resourceWorkStatus('ridge').ok,false,'矿层不得徒手开采');s.inv.miningPick=1;assert.equal(a.resourceWorkStatus('ridge').cost,5,'基础矿业行动必须显著增加体力消耗');
  s.inv.miningPick=0;s.player.equip.legs='miningHarness';let work=a.resourceWorkStatus('ridge');assert.equal(work.ok,true);assert.equal(work.cost,3);assert.equal(work.yieldMult,1.5,'采掘外骨骼必须降低消耗并增加产量');
  s.player.equip.back='gravRig';work=a.resourceWorkStatus('ridge');assert.equal(work.cost,0);assert.equal(work.yieldMult,2,'后期重力作业背架必须实现矿业零体力与双倍产量');
}
{
  const s=reset();s.meta.careers.life={id:'noviceCollector',level:1,xp:0};s.player.location='outer';s.player.stamina=20;s.resourceSites.outer=true;s.inv.scrap=0;
  assert.equal(a.skillUnlocked('quickScavenge'),true);assert.equal(a.SKILLS.quickScavenge.type,'career');a.equipSkill('quickScavenge',0);assert.equal(s.skillSlots[0],null,'副职业能力不得占用主动技能栏');
  const status=a.quickScavengeStatus('outer');assert.equal(status.ok,true);assert.equal(status.cost,4,'快速搜刮应自动叠加资源点基础消耗与职业能力代价');assert.equal(a.activeFieldGatherSkill('outer'),'quickScavenge');
  sandbox.Math.random=()=>0;assert.equal(a.performQuickScavenge(),true);assert.equal(s.player.stamina,16);assert.equal(s.resourcePools.outer.charges,2);assert.ok(s.inv.scrap>=3,'快速搜刮必须把本次采集产量提高50%');assert.equal(s.combat,null,'快速搜刮完成后必须跳过采集遭遇判定');assert.equal(s.skills.quickScavenge.prof,11,'现场职业技能必须在实际作业成功后增加熟练度');
  s.skills.quickScavenge.prof=20;assert.equal(a.careerSkillYieldMult('quickScavenge'),1.55,'快速搜刮升到 Lv2 后必须实际继续提高产量倍率');
  s.player.location='oldMine';s.resourceSites.oldMine=true;s.inv.miningPick=1;assert.equal(a.quickScavengeApplicable('oldMine'),false);assert.match(a.quickScavengeStatus('oldMine').text,/当前是开采作业/,'矿层必须明确提示快速搜刮为何不可用，不能让技能入口凭空消失');
  const mineBefore=new FakeElement();assert.equal(a.renderFieldGatherSkills(mineBefore,'oldMine'),'pulseMining');assert.equal(mineBefore.children.length,0,'副职业能力应合并进原采集按钮，不得另加一排技能按钮');
  assert.equal(a.skillUnlocked('pulseMining'),true,'入门拾荒者必须同时获得独立的矿业能力');const mining=a.fieldGatherSkillStatus('pulseMining','oldMine');assert.equal(mining.ok,true);assert.equal(mining.cost,8,'脉冲采掘必须自动叠加矿业基础体力与职业能力代价');
  const coal=s.inv.coal||0;assert.equal(a.performFieldGatherSkill('pulseMining'),true);assert.ok(s.inv.coal>=coal+4,'脉冲采掘必须把矿层产量提高到两倍');assert.equal(s.combat,null,'脉冲采掘完成后不得再触发普通采集遭遇');
  s.player.location='ridge';s.resourceSites.ridge=true;assert.equal(a.quickScavengeApplicable('ridge'),false);assert.equal(a.quickScavengeStatus('ridge').ok,false,'快速搜刮不得覆盖采矿、挖掘或生物采样');
  s.meta.careers.life={id:'salvager',level:3,xp:0};assert.equal(a.skillUnlocked('quickScavenge'),true,'晋升正式残骸勘探员后不应遗失入门主动技能');
  assert.equal(a.skillUnlocked('precisionDismantle'),true);assert.equal(a.skillUnlocked('strataExcavation'),true,'正式残骸勘探员必须按资源类型继续解锁独立现场技能');
}
{
  let s=reset();s.meta.careers.life={id:'noviceApprentice',level:1,xp:0};s.meta.built.work=true;s.meta.damaged.work=true;s.player.stamina=10;s.inv.scrap=0;
  assert.equal(a.fieldRepairStatus('work').ok,true);assert.equal(a.performFieldRepair('work'),true);assert.equal(s.player.stamina,7);assert.equal(!!s.meta.damaged.work,false);assert.equal(s.inv.scrap,0,'应急修理必须以职业体力替代废铁维修材料');assert.equal(s.skills.fieldRepair.prof,11);
  s.skills.fieldRepair.prof=40;assert.equal(a.careerSkillCost('fieldRepair'),2,'应急修理升到 Lv4 后必须降低体力消耗');s.skills.fieldRepair.prof=70;assert.equal(a.careerSkillCost('fieldRepair'),1,'应急修理升到 Lv7 后必须再次降低体力消耗');
  s=reset();s.meta.careers.life={id:'noviceGrower',level:1,xp:0};s.meta.built.garden=true;s.meta.buildLevels.garden=1;s.player.stamina=10;const before=s.inv.ration||0;
  assert.equal(a.performSporeBoost(),true);assert.ok(s.inv.ration>before);assert.equal(s.player.stamina,8);assert.equal(s.skills.sporeBoost.prof,11);assert.equal(a.performSporeBoost(),false,'催生孢子每天只能提供一次额外菌圃收获');
  s.meta.careers.life={id:'biologist',level:3,xp:0};assert.equal(a.skillUnlocked('sporeBoost'),true,'正式生态培育师必须保留入门主动技能');
}
{
  const s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=1;s.inv.riverFish=2;s.inv.ration=1;s.player.hp=50;s.player.stamina=10;
  const box=new FakeElement(),nodes=[];a.renderBuilding(box,'mess');(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const productGrid=nodes.find(x=>(x.className||'').includes('station-product-grid'));assert.equal(productGrid.children.length,12,'营地厨房必须展示十二道分阶段解锁且用途明确的料理');
  assert.deepEqual(Array.from(Object.values(a.COOKING_RECIPES).reduce((n,r)=>(n[r.level-1]++,n),[0,0,0])),[4,4,4],'三级厨房必须各自对应四道新料理');
  assert.equal(a.cookFood('riverBroth'),true);assert.equal(s.inv.riverBroth,1);a.useItem('riverBroth');assert.equal(s.inv.riverFish,0);assert.equal(s.foodBuff.charges,3);assert.equal(a.fieldMealActive(),true,'鱼汤必须兑现远征准备用途');
  s.player.location='outer';s.player.stamina=10;assert.equal(a.areaActionCost(2),1);a.payAreaAction(2);assert.equal(s.player.stamina,9);assert.equal(s.foodBuff.charges,2,'每次野外行动只能消耗一层鱼汤增益');
  s.time+=24;assert.equal(a.fieldMealActive(),false);assert.equal(a.areaActionCost(2),2,'鱼汤增益必须在次日失效');
}
{
  const s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=3;Object.assign(s.inv,{glowMushroom:2,ration:1});s.player.location='fungal';s.player.hp=80;s.player.stamina=20;
  assert.equal(a.cookFood('glowSoup'),true);a.useItem('glowSoup');const hp=s.player.hp;a.payAreaAction(1);assert.equal(s.player.hp,hp,'菌光抗性汤必须实际抵消污染区行动伤害');assert.equal(s.foodBuff.charges,2);
  assert.equal(a.MATERIAL_SOURCES.mutantMeat,'地表变异兽 · 战斗掉落');assert.ok(a.LOCATIONS.blackwood.loot.blackwoodBerry>0&&a.LOCATIONS.fungal.loot.glowMushroom>0,'厨房食材必须分别接入采集与掉落来源');
}
{
  let s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=2;Object.assign(s.inv,{blackwoodBerry:2,mutantMeat:1,ration:1});s.player.location='outer';s.resourceSites.outer=true;
  assert.equal(a.cookFood('foragerBox'),true);a.useItem('foragerBox');sandbox.Math.random=()=>0;assert.equal(a.gatherArea('outer',1),true);assert.equal(s.foodBuff.charges,2,'采集者餐盒必须在成功采集后消耗一层并实际参与产量结算');
  s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=3;Object.assign(s.inv,{glowMushroom:1,mutantMeat:1,ration:1,miningPick:1});s.player.location='ridge';assert.equal(a.cookFood('minerChowder'),true);a.useItem('minerChowder');assert.equal(a.resourceWorkStatus('ridge').cost,3,'矿工浓汤必须把基础开矿消耗从5降低到3');
  s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=2;Object.assign(s.inv,{mutantMeat:2,blackwoodBerry:1});const base=a.totalAtk();assert.equal(a.cookFood('hunterRoast'),true);a.useItem('hunterRoast');a.startCombat('rat');assert.equal(s.foodBuff.charges,2);assert.equal(s.combat.foodAtkPct,15);assert.ok(a.totalAtk()>base,'猎手烤排必须在进入战斗时兑现15%攻击增益');
}
{
  const s=reset();assert.equal(a.npcLocation('老乔'),'camp');assert.ok(a.npcsAt('camp').includes('老乔'));
  s.tutorial.complete=true;s.tutorial.step='done';assert.equal(a.npcLocation('老乔'),'setHub');assert.ok(!a.npcsAt('camp').includes('老乔'),'教程完成后老乔必须回到聚居地中枢');
  assert.equal(a.npcLocation('阿拓'),'oldMine');s.flags.depthLampBuilt=true;assert.equal(a.npcLocation('阿拓'),'underworks','说要先行下井后，阿拓必须立刻从旧矿井迁往维修井，而不是保留两处头像');assert.equal(a.npcsAt('underworks').includes('阿拓'),false,'迁入野外新区域后必须重新探索到阿拓才能交谈');
  assert.equal(a.npcLocation('纪遥'),'nursery');s.flags.prototypeOnline=true;assert.equal(a.npcLocation('纪遥'),'setArchive','恢复原型终端后纪遥应转移到聚居地档案区');
  s.flags.tangLost=true;assert.equal(a.npcLocation('小唐'),null,'不可逆剧情结果必须能让 NPC 从世界中移除');
}
{
  let s=reset();assert.equal(Array.isArray(s.meta.careers.life),true);assert.equal(s.meta.careers.life.length,0);a.completeTutorial();assert.equal(s.tutorial.complete,true);assert.equal(a.careerRecord('life','noviceCollector').id,'noviceCollector','老乔序章结束时必须直接授予入门拾荒者');assert.equal(a.noviceJobStatus('noviceCollector').ok,false,'采集副职业不得在 NPC 页面重复手动转职');
  s=reset();s.tutorial.complete=true;s.tutorial.step='done';s.player.location='setWorkshop';Object.assign(s.inv,{scrap:5,ecomp:2});assert.equal(a.noviceJobStatus('noviceApprentice').ok,false);s.inv.scrap=6;assert.equal(a.noviceJobStatus('noviceApprentice').ok,true);a.chooseNoviceJob('noviceApprentice');assert.equal(a.careerRecord('life','noviceApprentice').id,'noviceApprentice');assert.equal(s.inv.scrap,0);assert.equal(s.inv.ecomp,0,'制造入门转职必须找到阿珍并提交考核材料');
  s=reset();s.tutorial.complete=true;s.tutorial.step='done';s.player.location='setBio';Object.assign(s.inv,{ration:3,biocore:2});assert.equal(a.noviceJobStatus('noviceGrower').ok,false);assert.match(a.noviceJobStatus('noviceGrower').text,/退烧药/);s.quests.fever='done';assert.equal(a.noviceJobStatus('noviceGrower').ok,true);a.chooseNoviceJob('noviceGrower');assert.equal(a.careerRecord('life','noviceGrower').id,'noviceGrower');assert.equal(s.inv.ration,0);assert.equal(s.inv.biocore,0,'培育入门转职必须完成陈嫂任务并提交培养材料');
}
{
  let s=reset();s.tutorial.complete=true;s.tutorial.step='done';assert.equal(a.npcLocation('老乔'),'setHub');assert.equal(a.npcLocation('阿珍'),'setWorkshop');assert.equal(a.npcLocation('陈嫂'),'setBio','三名入门副职导师必须分别落在中枢、工坊区与生态区');
  s.meta.careers.life={id:'noviceCollector',level:3,xp:17};s.player.location='oldMine';s.flags.minerFreed=true;assert.equal(a.jobRequirementStatus('salvager').ok,false);const lockedMentor=new FakeElement();a.renderCareerMentorAction(lockedMentor,'阿拓');const mentorButtons=[];(function walk(node){if(Object.hasOwn(node,'disabled'))mentorButtons.push(node);(node.children||[]).forEach(walk);})(lockedMentor);assert.equal(mentorButtons[0].disabled,true,'未与阿拓完成资格确认前晋升按钮必须锁定');
  a.talkAreaNpc('阿拓');assert.equal(s.flags.job_salvager_qualified,true);assert.equal(a.jobRequirementStatus('salvager').ok,true);a.chooseJob('salvager');assert.equal(a.careerRecord('life','salvager').id,'salvager');assert.equal(a.careerRecord('life','salvager').level,3);assert.equal(a.careerRecord('life','salvager').xp,17,'残骸勘探员晋升必须保留入门职业等级与经验');

  s=reset();s.meta.careers.life={id:'noviceApprentice',level:3,xp:9};s.quests.seal='done';s.quests.faultAudit='done';s.meta.techs.make_4=1;s.player.location='setHub';assert.equal(a.npcLocation('林薇'),'setHub');a.talkAreaNpc('林薇');assert.equal(s.flags.job_fabricator_qualified,true);a.chooseJob('fabricator');assert.equal(a.careerRecord('life','fabricator').id,'fabricator','完成故障审计、模块化制造并找林薇后必须能晋升制造技师');

  s=reset();s.meta.careers.life={id:'noviceGrower',level:2,xp:4};s.quests.sample='done';s.flags.nurseryFound=true;s.player.location='layer4';assert.equal(a.npcLocation('陈博士'),'layer4');a.talkAreaNpc('陈博士');assert.equal(s.flags.job_biologist_qualified,true);assert.equal(a.jobRequirementStatus('biologist').ok,false);assert.match(a.jobRequirementStatus('biologist').text,/达到 Lv3/,'生态培育师资格与入门等级必须分别检查');a.careerRecord('life','biologist').level=3;a.chooseJob('biologist');assert.equal(a.careerRecord('life','biologist').id,'biologist','完成样本任务、发现培养室并找陈博士后必须能晋升生态培育师');s.quests.signalTrace='done';assert.equal(a.npcLocation('陈博士'),'setBio','信号追踪完成后陈博士必须转移到聚居地生态区');
}
{
  const meta=a.normalizeMeta({careers:{main:null,life:{id:'salvager',level:4,xp:7}}});
  assert.equal(Array.isArray(meta.careers.life),true,'旧存档的单个副职业对象必须自动迁移为多副职业列表');assert.equal(meta.careers.life.length,1);assert.equal(meta.careers.life[0].id,'salvager');assert.equal(meta.careers.life[0].level,4);assert.equal(meta.careers.life[0].xp,7,'迁移不得丢失旧副职业等级与经验');
}
{
  const s=reset();a.completeTutorial();s.player.location='setWorkshop';Object.assign(s.inv,{scrap:6,ecomp:2});a.chooseNoviceJob('noviceApprentice');s.player.location='setBio';s.quests.fever='done';Object.assign(s.inv,{ration:3,biocore:2});a.chooseNoviceJob('noviceGrower');
  assert.deepEqual(Array.from(a.careerRecords('life'),r=>r.id).sort(),['noviceApprentice','noviceCollector','noviceGrower'],'三个生活副职业必须能在同一存档中全部学习');assert.equal(a.careerSummary('life'),'已学习 3 个副职业');
  assert.equal(a.skillUnlocked('quickScavenge'),true);assert.equal(a.skillUnlocked('fieldRepair'),true);assert.equal(a.skillUnlocked('sporeBoost'),true,'三条副职业路线的技能必须同时生效');
  assert.equal(a.skillUnlocked('salvageSense'),false);assert.equal(a.skillUnlocked('precisionFab'),false);assert.equal(a.skillUnlocked('bioCycle'),false,'入门副职业不得提前解锁正式职业的专属技能');
}
{
  const s=reset();s.meta.careers.life=[{id:'salvager',level:1,xp:49},{id:'fabricator',level:1,xp:49},{id:'biologist',level:1,xp:49}];a.gainCareerXp('life',1,'fabricator');
  assert.equal(a.careerRecord('life','fabricator').level,2,'制造行动经验只应升级制造副职业');assert.equal(a.careerRecord('life','salvager').level,1);assert.equal(a.careerRecord('life','biologist').level,1,'三条副职业经验必须独立计算');
  assert.ok(a.jobBonus('gatherPct')>0&&a.jobBonus('craftSavePct')>0&&a.jobBonus('gardenPct')>0,'已经学习的副职业属性必须同时叠加生效');
}
{
  const s=reset();s.meta.careers.life=[{id:'salvager',level:1,xp:0},{id:'fabricator',level:1,xp:0},{id:'biologist',level:1,xp:0}];s.meta.built.mess=true;s.meta.buildLevels.mess=1;Object.assign(s.inv,{ration:1,mutantMeat:1});a.cookFood('nutriStew');
  assert.equal(a.careerRecord('life','fabricator').xp,4);assert.equal(a.careerRecord('life','salvager').xp,0);assert.equal(a.careerRecord('life','biologist').xp,0,'烹饪经验只能进入制造路线');
  s.meta.built.garden=true;s.meta.buildLevels.garden=1;a.harvestGarden();assert.equal(a.careerRecord('life','biologist').xp,6,'菌圃经验只能进入培育路线');
  s.player.location='outer';s.resourceSites.outer=true;s.player.stamina=20;sandbox.Math.random=()=>0;a.gatherArea('outer',1);assert.equal(a.careerRecord('life','salvager').xp,4,'采集经验只能进入勘探路线');assert.equal(a.careerRecord('life','fabricator').xp,4);assert.equal(a.careerRecord('life','biologist').xp,6,'不同副职业行动不得串经验');
}
{
  const s=reset();s.meta.careers.life=[{id:'noviceCollector',level:3,xp:11},{id:'noviceApprentice',level:3,xp:12},{id:'noviceGrower',level:3,xp:13}];Object.assign(s.flags,{job_salvager_qualified:true,job_fabricator_qualified:true,job_biologist_qualified:true});a.chooseJob('salvager');a.chooseJob('fabricator');a.chooseJob('biologist');
  assert.deepEqual(Array.from(a.careerRecords('life'),r=>r.id).sort(),['biologist','fabricator','salvager'],'晋升一条副职业不得覆盖另外两条路线');assert.equal(a.careerRecord('life','salvager').xp,11);assert.equal(a.careerRecord('life','fabricator').xp,12);assert.equal(a.careerRecord('life','biologist').xp,13,'三条副职业晋升都必须保留各自经验');
  s.meta.careers.main={id:'vanguard',level:2,xp:4};s.charView='careers';const box=new FakeElement(),nodes=[];a.renderCharPanel(box);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);const markup=nodes.map(n=>n.innerHTML||'').join(' ');
  assert.equal(nodes.filter(n=>String(n.className).startsWith('career-dossier')).length,4,'职业档案必须同时展示一个主战职业和全部三个副职业');assert.match(markup,/主战 1\/1 · 副职 3\/3/);assert.match(markup,/主战职业唯一 · 副职业可全部学习并同时生效/,'职业页面必须明确说明主战唯一、副职全学规则');
}
{
  const s=reset();assert.equal(s.campName,'幸存者营地');assert.equal(s.settlementRep,0);assert.deepEqual(Object.keys(a.LOCAL_MAPS.settlement.pos).sort(),['camp','setArchive','setBio','setGarrison','setGate','setHub','setWorkshop'].sort());assert.deepEqual(Array.from(a.LOCAL_MAPS.settlement.externalLocations),['camp'],'聚居地局部地图必须直接提供玩家营地返程点');
  assert.ok(a.MAP_LINKS.some(([x,y])=>x==='outer'&&y==='setGate'),'坠毁带必须能进入聚居地大门');assert.ok(a.WORLD_REGION_LINKS.some(([x,y])=>x==='surface'&&y==='settlement'),'世界地图必须连接地表与聚居地');
  assert.equal(a.WORLD_REGIONS.settlement.defaultOpen,true,'成熟聚居地必须使用默认开放地图规则');s.discovered.setGate=true;
  assert.ok(a.WORLD_REGIONS.settlement.locations.every(a.locationRevealed),'取得聚居地入口坐标后，所有普通城区都必须显示名称与位置');assert.equal(a.locationGate('setHub').ok,true,'聚居地普通城区不得套用荒野调查解锁条件');assert.equal(a.locationRevealed('camp'),true);
  s.player.location='setGate';const settlementLayout=a.verticalMapLayout(a.LOCAL_MAPS.settlement.canvas,a.LOCAL_MAPS.settlement.pos),districts=['setWorkshop','setGarrison','setBio','setArchive'];
  for(let i=0;i<districts.length;i++)for(let j=i+1;j<districts.length;j++){const p=settlementLayout.pos[districts[i]],q=settlementLayout.pos[districts[j]];assert.ok(Math.abs(p[0]-q[0])>=settlementLayout.canvas.nodeWidth+20||Math.abs(p[1]-q[1])>=settlementLayout.canvas.nodeHeight+20,'聚居地城区节点必须在手机纵向地图中保持足够间距');}
  assert.ok(districts.every(id=>a.travelRoute('setGate',id)),'公开的聚居地城区必须都能从聚居地入口规划路线');s.player.location='outer';s.visited.outer=true;s.flags.mapUnlocked=true;assert.ok(districts.every(id=>a.travelRoute('outer',id)),'沿老乔标出的外围路线必须可以直接规划到所有公开城区');s.discovered.relayTower=true;assert.equal(a.travelRoute('outer','relayTower'),null,'聚居地公共路线不得放宽其他区域的未探索通行规则');
  s.player.location='setHub';Object.assign(s.visited,{setGate:true,setHub:true});const settlementMap=new FakeElement(),settlementNodes=[];a.renderLocalMap(settlementMap,'settlement');(function walk(node){settlementNodes.push(node);(node.children||[]).forEach(walk);})(settlementMap);assert.ok(settlementNodes.some(node=>node.dataset&&node.dataset.loc==='camp'),'聚居地局部地图必须直接显示玩家营地返程节点，不得强迫玩家先退到世界地图');assert.ok(a.travelRoute('setHub','camp'),'聚居地任意城区都应能沿已知路线直接规划返营');
  assert.equal(a.setCampName('  星火之家  '),'星火之家');assert.equal(s.campName,'星火之家');assert.equal(a.LOCATIONS.camp.name,'星火之家');
  s.player.location='setHub';s.inv.crystal=2;assert.equal(a.settlementTrade('cloth','buy'),true);assert.equal(s.inv.cloth,3);assert.equal(s.inv.crystal,1);
  s.settlementRep=20;s.inv.crystal=2;assert.equal(a.settlementDiscount(),.9);assert.equal(a.settlementTrade('ecomp','buy'),true);assert.equal(s.inv.ecomp,1);
  s.player.location='setBio';s.player.hp=10;s.player.stamina=10;assert.equal(a.settlementRecover('basic'),true);assert.ok(s.player.hp>10&&s.player.stamina>10);assert.equal(a.settlementRecover('basic'),false,'每日基础医疗不得重复领取');
  s.player.location='setHub';s.inv.scrap=12;assert.equal(a.acceptCommission('joe_scrap'),true);assert.equal(a.turnInCommission('joe_scrap'),true);assert.equal(s.settlementRep,26);assert.equal(s.settlementCommissions.joe_scrap.status,'done');assert.equal(a.acceptCommission('joe_scrap'),false,'一次性委托不得重复接取');
  s.masteries.gatherMastery=3;a.updateCheckpoint();s.masteries.gatherMastery=9;a.restoreCheckpoint();assert.equal(a.getState().masteries.gatherMastery,3,'聚居地教学取得的精通等级必须进入检查点');
}
{
  const s=reset();s.player.location='setHub';s.inv.crystal=5;const box=new FakeElement(),nodes=[];a.renderSettlementShop(box,true);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);
  assert.ok(nodes.some(n=>hasClass(n,'recipe-station-screen'))&&nodes.some(n=>hasClass(n,'recipe-station-top'))&&nodes.some(n=>hasClass(n,'recipe-station-bottom')),'商店必须使用与生产操作台一致的上下分屏结构');
  const goods=nodes.find(n=>n.className==='station-product-grid'),goodsMarkup=goods.children.map(n=>n.innerHTML).join(' ');assert.equal(goods.children.length,a.settlementShopCatalog('all').length);assert.match(goods.children[0].innerHTML,/data-item="cloth"[\s\S]*布料[\s\S]*持有 0/,'上半屏商品必须用图标、名称与持有量进行选择');assert.match(goodsMarkup,/data-item="knife"[\s\S]*铁刀/,'基础货架必须直接提供装备');assert.match(goodsMarkup,/data-item="medkit"[\s\S]*急救包/,'基础货架必须直接提供特殊补给');
  const categoryTabs=nodes.find(n=>hasClass(n,'shop-category-tabs'));assert.equal(categoryTabs.children.length,4,'商店必须提供全部、物资、装备和特殊四个分类');assert.ok(nodes.some(n=>hasClass(n,'shop-route-status')),'商店必须展示由探索推进的商路等级与下一档解锁条件');
  assert.deepEqual(nodes.filter(n=>n.className==='station-step').map(n=>n.innerHTML),['-10','-1','+1','+10']);assert.equal(nodes.find(n=>n.className==='station-quantity').value,1,'商店交易数量必须默认为1批');
  assert.match(nodes.find(n=>n.className==='shop-rate-copy').textContent,/本次共支付 晶体×1，获得 布料×3/,'下半屏必须用完整语句说明支付与获得内容');assert.equal(nodes.find(n=>String(n.className).includes('station-confirm')).textContent,'确认购买 · 1 批');
  goods.children.find(n=>/data-item="knife"/.test(n.innerHTML)).click();const gearBox=new FakeElement(),gearNodes=[];a.renderSettlementShop(gearBox,true);(function walk(node){gearNodes.push(node);(node.children||[]).forEach(walk);})(gearBox);const gearProfile=gearNodes.find(n=>hasClass(n,'shop-equipment-profile'));assert.ok(gearProfile,'选中装备商品后必须出现装备属性区');assert.match(gearProfile.innerHTML,/锻造级[\s\S]*攻\+7[\s\S]*战力增幅\+10%/,'商店装备详情必须展示品级与完整战斗属性');
  assert.equal(a.settlementTrade('cloth','buy',2),true);assert.equal(s.inv.crystal,3);assert.equal(s.inv.cloth,6,'批量购买必须按所选交易批次同步结算');assert.equal(a.settlementTrade('cloth','sell',1),true);assert.equal(s.inv.crystal,4);assert.equal(s.inv.cloth,1,'批量出售必须使用明确的每批物品数量结算');
}
{
  const s=reset(),initial=a.settlementShopCatalog('all');assert.equal(a.settlementShopProgress().tier,1);assert.ok(initial.some(([id,row])=>id==='knife'&&row.category==='equipment'));assert.ok(initial.some(([id,row])=>id==='medkit'&&row.category==='special'));
  Object.assign(s.discovered,{cargoYard:true,blackwood:true,ridge:true,floodChannel:true});assert.equal(a.settlementShopProgress().tier,2,'发现 6 个野外地点后必须接入地表商路');assert.ok(a.settlementShopCatalog('equipment').some(([id])=>id==='pistol'),'地表商路必须新增枪械装备');
  Object.assign(s.discovered,{relayTower:true,coalRift:true,oldMine:true,silicaField:true,titaniumMine:true,layer2:true,freightHub:true,layer3:true});assert.equal(a.settlementShopProgress().tier,3,'发现 14 个野外地点后必须接入深区商路');assert.equal(a.settlementShopUnlocked('rifle'),true);
  Object.assign(s.discovered,{coolingGallery:true,cryoVault:true,layer4:true,layer5:true,droneHangar:true,layer6:true,layer7:true,underworks:true,fungal:true,sporeTunnel:true});assert.equal(a.settlementShopProgress().tier,4,'发现 24 个野外地点后必须开放最高供货等级');assert.equal(a.settlementShopUnlocked('eblade'),true);assert.ok(a.settlementShopCatalog('all').length>initial.length*2,'最高商路的商品数量必须显著多于基础货架');
}
{
  const s=reset();s.settlementRep=0;Object.entries(a.SETTLEMENT_SHOP).forEach(([id,row])=>{const buy=a.settlementBuyPrice(row),sell=a.settlementSellTerms(row);assert.ok(sell.crystal*row.buy.amount<buy*sell.amount,`${id} 的普通声望回收单价必须低于买价`);});
  s.settlementRep=50;Object.entries(a.SETTLEMENT_SHOP).forEach(([id,row])=>{const buy=a.settlementBuyPrice(row),sell=a.settlementSellTerms(row);assert.equal(sell.crystal*row.buy.amount,buy*sell.amount,`${id} 的最高声望买卖必须同批次平价`);});
  s.player.location='setHub';s.inv.crystal=20;assert.equal(a.settlementTrade('knife','buy'),true);const afterKnife=s.inv.crystal;assert.equal(a.settlementTrade('knife','buy'),false,'限购装备已在背包或身上时不得重复购买');assert.equal(s.inv.crystal,afterKnife);assert.equal(a.settlementTrade('eblade','buy'),false,'未达到商路等级时不得通过函数绕过界面购买高级装备');
  const beforeRoundTrip=s.inv.crystal;assert.equal(a.settlementTrade('cloth','buy'),true);assert.equal(a.settlementTrade('cloth','sell'),true);assert.equal(s.inv.crystal,beforeRoundTrip,'最高声望允许买卖平价，但往返交易不得产生晶体');
}
{
  const s=reset(),ordinary=Object.keys(a.LOCATIONS).filter(id=>a.regionForLocation(id)!=='settlement'&&id!=='camp'&&!a.LOCATIONS[id].hiddenBy);ordinary.forEach(id=>s.discovered[id]=true);s.discovered.setGate=true;s.visited.ridge=true;
  assert.equal(a.repairLegacyDiscoveryFog(),true,'检测到旧兼容逻辑造成的整图公开时必须执行一次性修复');
  assert.equal(a.locationRevealed('blackwood'),false,'未到访且没有真实调查来源的荒野地点必须重新隐藏');assert.equal(a.locationRevealed('ridge'),true,'已经到访的地点不得被存档修复误删');assert.equal(a.locationRevealed('setHub'),true,'存档修复不得关闭曙光聚居地普通城区');
  assert.equal(a.repairLegacyDiscoveryFog(),false,'地图迷雾修复只能执行一次');
}
{
  const s=reset(); s.meta.built.garden=true; s.meta.buildLevels.garden=2; a.harvestGarden();
  assert.equal(s.inv.ration,3); assert.equal(s.inv.biocore,1,'二级菌圃应产出生物样本');
  const ration=s.inv.ration; a.harvestGarden(); assert.equal(s.inv.ration,ration,'固定每日设施不得无限领取');
}
{
  const s=reset(); s.meta.built.recycler=true; s.meta.buildLevels.recycler=2; s.inv.ingot=1; a.recycleMaterial('metal');
  assert.equal(s.inv.ingot,0); assert.equal(s.inv.scrap,4,'二级回收中心应兑现废铁产量加成');
}
{
  let s=reset();s.inv.scrap=20;s.inv.wood=8;a.beginExpedition();s.player.location='outer';s.inv.scrap=40;s.inv.wood=5;s.inv.plasmaCutter=1;s.player.hp=0;a.exhaustionDeath();
  assert.equal(s.inv.scrap,33,'无仓库时死亡应损失本次新增材料的35%');assert.equal(s.inv.wood,5,'出发前已有材料不得因净减少再次被扣');assert.equal(s.inv.plasmaCutter,1,'关键道具不得参与死亡掉落');assert.equal(s.siteSheet.kind,'exhaustion','死亡回营后应显示结算弹层');
  s=reset();s.meta.built.warehouse=true;s.meta.buildLevels.warehouse=3;s.inv.scrap=20;a.beginExpedition();s.player.location='outer';s.inv.scrap=40;s.player.hp=0;a.exhaustionDeath();
  assert.equal(s.inv.scrap,35,'三级仓库应把死亡损失降至25%');
}
{
  const techIds=new Set(Object.keys(a.TECHS));
  [...a.CAMP_BUILDINGS,...a.OUTPOST_BUILDINGS].forEach(b=>(b.upgrades||[]).forEach(up=>{assert.ok(techIds.has(up.tech),`设施 ${b.id} 的升级科技 ${up.tech} 不存在`);Object.keys(up.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`设施 ${b.id} 升级使用未知材料 ${item}`));}));
}
{
  const s=reset(); Object.keys(a.TECHS).forEach(id=>s.meta.techs[id]=1); Object.keys(a.ITEMS).forEach(id=>s.inv[id]=99);
  a.CAMP_BUILDINGS.forEach(b=>{s.meta.built[b.id]=true;s.meta.buildLevels[b.id]=1;const box=new FakeElement(),nodes=[];assert.doesNotThrow(()=>a.renderBuilding(box,b.id),`设施页面 ${b.id} 不得渲染崩溃`);(function walk(node){nodes.push(node);(node.children||[]).forEach(walk);})(box);if(b.id==='research'){assert.ok(nodes.some(n=>hasClass(n,'treevp')),`科技台必须直接打开科技画布`);assert.ok(nodes.some(n=>hasClass(n,'tech-det')),`科技台必须使用不受底栏占位影响的详情层`);return;}const nav=nodes.find(n=>hasClass(n,'facility-nav')),trigger=nodes.find(n=>n.className==='facility-upgrade-trigger'),screen=nodes.find(n=>hasClass(n,'facility-operation-screen')),close=nodes.find(n=>hasClass(n,'facility-operation-close'));assert.ok(nodes.some(n=>String(n.className).includes('facility-section'))&&nav&&trigger&&nav.children.includes(trigger),`设施页面 ${b.id} 必须把升级入口放在右上角导航栏`);assert.equal(nodes.some(n=>n.className==='facility-upgrade'),false,`设施页面 ${b.id} 不得常驻显示升级详情`);assert.ok(screen&&hasClass(screen.children.at(-1),'facility-operation-closebar'),`设施页面 ${b.id} 必须在全屏容器底部提供关闭操作`);assert.ok(close&&close.innerHTML.includes('关闭'+b.name),`设施页面 ${b.id} 的关闭按钮必须直接写明设施名`);});
  assert.match(source,/classList\.toggle\('facility-fullpage',activeView==='facility'\)/,'设施视图必须启用独立全屏模式');
}
{
  const s=reset();s.quests.core='done';a.chooseEnding('sever');assert.equal(s.meta.expansionUnlocked,true,'任意核心结局必须开启远航篇');assert.equal(a.metaFlag('postCoreStarMap'),true);assert.equal(s.meta.spaceQuests.exo_signal,'done','核心后的星图序章必须立即接上，而不是再卡一次旧主线');
}
{
  const s=reset();s.meta.expansionUnlocked=true;s.meta.ship.assembled=true;a.setMetaFlag('starshipReady');s.meta.built.starDock=true;s.meta.built.navArray=true;s.meta.buildLevels.starDock=1;s.meta.buildLevels.navArray=1;a.updateCheckpoint();
  const before=s.player.location;a.launchSpaceRoute('ark_orbit');assert.equal(s.player.location,before,'燃料不足的航行不得移动玩家');assert.equal(s.inv.fusionCell,0,'失败航行不得扣除燃料');
  s.inv.fusionCell=1;a.launchSpaceRoute('ark_orbit');assert.equal(s.player.location,'orbitalGraveyard');assert.equal(s.inv.fusionCell,1,'首次抵达储备必须足够支付正常返程');s.inv.fusionCell=0;a.restoreCheckpoint();assert.equal(a.getState().player.location,'orbitalGraveyard','星际抵达应自动建立防软锁航行锚点');assert.equal(a.getState().inv.fusionCell,1);
}
{
  const s=reset();s.meta.expansionUnlocked=true;s.meta.ship.assembled=true;a.setMetaFlag('starshipReady');s.player.location='zeroGate';a.updateCheckpoint();const box=new FakeElement();a.renderSpaceRoutes(box,false);const routePanel=box.children[0];assert.ok(routePanel&&routePanel.children.some(node=>(node.innerHTML||'').includes('紧急返航')),'不在常规港口的星外节点也必须显示紧急返航');a.emergencySpaceReturn();assert.equal(s.player.location,'camp');s.player.location='zeroGate';a.restoreCheckpoint();assert.equal(a.getState().player.location,'camp','紧急返航后不得因下一次回档又被送回星外');
}
{
  const s=reset();a.updateCheckpoint();s.player.location='zeroGate';a.startCombat('gateCustodian');s.combat.hp=0;a.winCombat();assert.equal(s.inv.gateKey,1);a.restoreCheckpoint();assert.equal(a.getState().inv.gateKey,1,'星门首领不会重生时，唯一密钥必须跨检查点保留');assert.equal(a.metaFlag('gateGuardianDown'),true);
}
{
  const s=reset();s.player.location='iridiumCrater';s.meta.techs.auto_13=1;a.setMetaFlag('massDriverSilenced');Object.assign(s.inv,{starAlloy:8,quantumCore:4,fusionCell:3,stellarFuel:1});a.updateCheckpoint();a.buildOutpostPart('outpostCore');a.buildOutpostPart('planetShield');assert.equal(s.meta.outposts.ashMoon.status,'defending');assert.equal(s.combat.id,'outpostRaid');s.combat.hp=0;a.winCombat();assert.equal(s.meta.outposts.ashMoon.status,'operational');a.restoreCheckpoint();assert.equal(a.getState().meta.outposts.ashMoon.status,'operational','守住反扑后的前哨必须跨回档保持运行');assert.equal(a.outpostReady('ashMoon'),true);
}
{
  const s=reset();s.meta.expansionUnlocked=true;s.meta.built.starDock=true;s.meta.built.navArray=true;s.meta.buildLevels.starDock=1;s.meta.buildLevels.navArray=1;['shipFrame','fusionDrive','inertialHull','arkHabitat','navComputer'].forEach(id=>s.inv[id]=1);a.updateCheckpoint();a.assembleStarship();assert.equal(a.shipReady(),true);assert.equal(s.inv.fusionCell,4,'星舰总装必须附带首航燃料');['shipFrame','fusionDrive','inertialHull','arkHabitat','navComputer'].forEach(id=>assert.equal(s.inv[id],0));a.restoreCheckpoint();assert.equal(a.shipReady(),true,'星舰总装是不可逆资料片里程碑');assert.equal(a.getState().inv.fusionCell,4);
}
{
  const s=reset();s.meta.built.starDock=true;s.meta.buildLevels.starDock=2;s.meta.techs.arms_10=1;Object.assign(s.inv,{starAlloy:5,warpCell:2,quantumCore:3});const box=new FakeElement();a.renderBuilding(box,'starDock');const text=[];(function walk(node){if(node.innerHTML)text.push(node.innerHTML);(node.children||[]).forEach(walk);})(box);assert.ok(text.join(' ').includes('轨道装备')&&text.join(' ').includes('轨道压制权限'),'最终武备必须在船坞拥有实际制作入口');
}
{
  const s=reset();s.meta.ship.assembled=true;a.setMetaFlag('starshipReady');s.inv.orbitalLance=1;s.player.location='zeroGate';a.startCombat('gateCustodian');const c=s.combat,def=c.def,hp=c.hp;a.orbitalStrike();assert.equal(c.orbitalUsed,true);assert.equal(c.armorSegments,0,'轨道压制必须实际清除首领场锚');assert.ok(c.def<def&&c.hp<hp,'轨道压制必须实际削甲并造成伤害');const after=c.hp;a.orbitalStrike();assert.equal(c.hp,after,'轨道压制每场战斗只能调用一次');
}
{
  const s=reset();s.player.location='blackGlassPlain';s.meta.techs.energy_12=1;s.flags.vaultRouteOpened=true;Object.assign(s.discovered,{blackGlassPlain:true,precursorVault:true});Object.assign(s.visited,{blackGlassPlain:true,precursorVault:true});s.inv.warpCell=0;assert.equal(a.travelRoute('blackGlassPlain','precursorVault'),null,'曲率档案库不得在首航后退化成零燃料步行边');assert.ok((a.LOCAL_MAPS.silent.specialLinks||[]).some(([from,to])=>from==='blackGlassPlain'&&to==='precursorVault'),'局部地图仍需用特殊航迹线说明两地关系');
}
{
  const s=reset();Object.assign(s.inv,{radSuit:1,bioSuit:1,xenoFilter:1,vest:1});s.player.equip.body='vest';
  ['radSuit','bioSuit','xenoFilter'].forEach(id=>{assert.equal(a.ITEMS[id].type,'key',`${a.ITEMS[id].name} 必须是常驻特殊道具`);assert.equal(a.ITEMS[id].slot,undefined,'环境防护组件不得占用正常装备槽');});
  assert.equal(Object.values(a.ITEMS).some(it=>it.type==='equip'&&it.imm),false,'普通战斗装备不得继续承担环境免疫，避免被迫来回换装');
  assert.equal(a.environmentProtected('radiation'),true);assert.equal(a.environmentProtected('contamination'),true);assert.equal(a.environmentProtected('xeno'),true);assert.equal(s.player.equip.body,'vest','三种防护必须能与战斗胸甲同时使用');
  s.player.equip.body='radSuit';s.inv.radSuit=0;a.normalizeEquipment(s.player,s.inv);assert.equal(s.player.equip.body,null);assert.equal(s.inv.radSuit,1,'旧存档中的防护服必须自动退回特殊道具库存');
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};s.player.location='camp';s.campView='home';s.mapOpen=true;s.mapReturn={campView:'home'};
  a.normalizePanelNavigationState();assert.equal(s.mapOpen,false,'营地首页必须清除旧存档残留的地图开启状态');assert.equal(s.mapReturn,null);assert.equal(a.panelView(),'camp','营地首页不得被误判为全屏地图并隐藏底部菜单');
  s.meta.built.quarters=true;s.campBuilding='quarters';s.mapOpen=true;a.normalizePanelNavigationState();assert.equal(s.mapOpen,false);assert.equal(a.panelView(),'facility','进入休眠仓时仍应显示设施页面');
  s.campBuilding=null;s.campView='home';s.mapOpen=true;a.normalizePanelNavigationState();assert.equal(a.panelView(),'camp','从休眠仓返回后底部菜单必须保持可见');
  s.campView='map';a.normalizePanelNavigationState();assert.equal(s.mapOpen,true);assert.equal(a.panelView(),'camp-map','只有明确进入营地地图时才启用全屏地图模式');
}
{
  let s=reset();a.startCombat('exp');s.combat.distNow=1;let rolls=[.99,0];sandbox.Math.random=()=>rolls.shift();a.enemyTurn();assert.equal(s.player.infected,true,'没有隔离膜时感染型敌人仍应造成感染');
  s=reset();s.inv.bioSuit=1;a.startCombat('exp');s.combat.distNow=1;rolls=[.99,0];sandbox.Math.random=()=>rolls.shift();a.enemyTurn();assert.equal(s.player.infected,false,'持有生物隔离膜组件时必须阻止战斗造成的新感染');
}
{
  const s=reset();s.player.level=75;a.GENE_NODES.forEach(g=>s.meta.geneNodes[g.id]=true);s.player.equip.weapon='crowbar';const salvage=a.totalAtk();s.player.equip.weapon='vacuumCarbine';const stellar=a.totalAtk();
  Object.entries(a.ITEMS).filter(([,it])=>it.type==='equip').forEach(([id,it])=>assert.ok(a.EQUIPMENT_GRADES[it.grade],`${id} 必须归入明确的材料装备代际`));
  assert.ok(stellar>salvage*1.8,'星际级武器必须以百分比增幅参与基因后的战斗力，不能退化为固定小数值');assert.equal(a.ITEMS.vacuumCarbine.grade,'stellar');assert.equal(a.EQUIPMENT_GRADES.stellar.material,'星舰铱合金 / 活体复材');
  s.player.equip.body='vest';const light=a.totalDef();s.player.equip.body='exoShell';assert.ok(a.totalDef()>light*1.7,'高阶护甲必须按材料代际放大基因后的基础防御');
}
{
  let s=reset();a.startCombat('rat');assert.equal(s.combat.maxHp,a.ENEMIES.rat.hp,'前期敌人不得读取后期基因适配');
  s=reset();s.player.level=75;a.GENE_NODES.forEach(g=>s.meta.geneNodes[g.id]=true);a.startCombat('gateCustodian');assert.equal(s.combat.adaptiveThreat,true);assert.ok(s.combat.maxHp>a.ENEMIES.gateCustodian.hp,'远航终局敌人必须能承接当前基因阶段的输出');assert.ok(s.combat.atk>a.ENEMIES.gateCustodian.atk,'远航终局敌人的威胁必须参考当前职业与基因生存能力');
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};Object.assign(s.flags,{mapUnlocked:true,exploreUnlocked:true});s.discovered.setGate=true;s.player.location='outer';sandbox.Math.random=()=>0;
  let markers=a.fieldMapMarkers('outer'),fog=a.fieldFogState('outer',markers);
  assert.deepEqual(Array.from(markers.filter(marker=>marker.kind==='route'),marker=>marker.target).sort(),['joeCamp','setGate'],'首次进入坠毁带时必须直接显示老乔交付地图中的前哨站与聚居地大门');assert.equal(fog.holes.length,2,'引导已知路线应从对应坐标驱散迷雾');assert.equal(fog.complete,false);
  const box=new FakeElement();a.renderFieldExpedition(box,'outer');assert.deepEqual(box.children.map(node=>node.className),['field-map-head','field-map-viewport surface','field-explore-dock'],'现场页必须固定为顶部情报、中部地图、底部探索按钮三段');
  const viewport=box.children[1],viewportNodes=[];(function walk(node){viewportNodes.push(node);(node.children||[]).forEach(walk);})(viewport);const fogLayer=viewportNodes.find(node=>node.className==='field-fog-layer'),markerLayer=viewportNodes.find(node=>node.className==='field-map-markers');
  assert.match(fogLayer.innerHTML,/<mask[\s\S]*<rect[\s\S]*<\/mask>/,'迷雾必须是一张连续遮罩，而不是可见方格');assert.equal(markerLayer.children.length,2);assert.equal(viewportNodes.some(node=>node.className==='field-map-empty'),false,'老乔交付的已知路线不能被整层迷雾藏掉');assert.equal(typeof box.children.at(-1).children[0].onclick,'function','探索按钮必须保持在整页最底部并可执行');
  s.exploreCount.outer=1;markers=a.fieldMapMarkers('outer');fog=a.fieldFogState('outer',markers);assert.equal(fog.holes.length,markers.length,'每个已发现地点必须从自己的坐标向外撕开迷雾');assert.ok(fog.holes.every(hole=>!hole.fresh&&hole.rx>0&&hole.ry>0),'引导路线首次入图后应保持静态，不得在第一轮探索时冒充新发现重播动画');assert.ok(markers.every(marker=>marker.kind==='route'),'第一次勘察只能显示引导已知路线，不得提前送出随机资源点');assert.doesNotMatch(a.fieldFogSvgMarkup('outer',fog),/<animate/,'迷雾遮罩不得再用 SVG 滤镜缩放动画，避免手机合成层闪出黑块');
  a.acknowledgeFieldFog('outer',fog);fog=a.fieldFogState('outer',markers);assert.ok(fog.holes.every(hole=>!hole.fresh),'已播放过的地点驱散动画不得在每次渲染时重复播放');
  s.exploreCount.outer=8;s.resourceSites.outer=true;s.resourcePools.outer={charges:4,updatedAt:0};markers=a.fieldMapMarkers('outer');fog=a.fieldFogState('outer',markers);const resource=markers.find(marker=>marker.kind==='resource'),resourceHole=fog.holes.find(hole=>hole.id===resource.id);assert.ok(resource&&resource.label,'达到随机阈值且资源被发现后，资源点必须成为可点地图标记');assert.deepEqual([resourceHole.x,resourceHole.y],[resource.x,resource.y],'地点出现时必须以该地点坐标为中心驱散周围迷雾');assert.equal(new Set(markers.map(marker=>marker.sector)).size,markers.length,'同一张现场地图的可点标记不得占用重叠槽位');
  const packed=a.assignFieldMarkerSlots(Array.from({length:12},(_,index)=>({id:'m'+index,kind:'route'})));for(let i=0;i<packed.length;i++)for(let j=i+1;j<packed.length;j++){const dx=(packed[i].x-packed[j].x)*3.9,dy=(packed[i].y-packed[j].y)*3.4;assert.ok(Math.hypot(dx,dy)>=58,'手机宽度下十二个地图槽位必须留出可点击间距');}
  a.fieldMapMarkerCandidates('outer').filter(marker=>marker.kind==='route').forEach(marker=>{s.discovered[marker.target]=true;s.knownRoutes[a.routeKey('outer',marker.target)]=true;});markers=a.fieldMapMarkers('outer');fog=a.fieldFogState('outer',markers);assert.equal(fog.complete,true,'当前场景全部特殊地点出现后必须触发整张地图清雾');assert.equal(fog.progress,100);assert.equal(fog.freshComplete,true);
  a.acknowledgeFieldFog('outer',fog);a.updateCheckpoint();s.fieldFogSeen.outer={holes:[],complete:false};a.restoreCheckpoint();assert.equal(a.getState().fieldFogSeen.outer.complete,true,'整图清雾状态必须进入检查点，返营或死亡回档后不能重新变未知');assert.equal(a.fieldFogState('outer',a.fieldMapMarkers('outer')).complete,true);
  const mapCss=fs.readFileSync(path.join(__dirname,'story-scenes.css'),'utf8');assert.match(mapCss,/#panel\.field-console\.expedition-board[\s\S]*grid-template-rows:auto minmax\(0,1fr\) auto/,'现场页必须锁定一屏而不是让整页滚动');assert.match(mapCss,/\.field-fog-layer svg\{[\s\S]*width:100%[\s\S]*height:100%/,'连续迷雾必须使用覆盖整张背景的遮罩');assert.match(mapCss,/\.field-fog-reveal\{[^}]*width:32px;height:32px;aspect-ratio:1\/1[^}]*radial-gradient\(circle/,'地点扫描圈必须锁定为正圆并与圆形地图图标一致');assert.match(mapCss,/@keyframes field-fog-radial-reveal[\s\S]*scale\(5\)/,'发现地点时只播放轻量的正圆扫描圈');assert.doesNotMatch(mapCss,/@keyframes field-fog-(?:radial-reveal|final-clear)\{[^}]*filter:/,'迷雾动画不得使用容易产生矩形黑块的整层滤镜');assert.match(mapCss,/\.field-fog-layer\.is-complete\.is-fresh[\s\S]*field-fog-final-clear/,'全部地点发现后必须播放整图清雾动画');assert.doesNotMatch(mapCss,/#panel \.field-map-marker::before\{[^}]*animation:/,'普通已知地点不能循环播放发现脉冲');assert.match(mapCss,/\.field-map-drawer-body\{[\s\S]*overflow-y:auto/,'地点详情必须在地图弹层内部滚动');
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};s.player.location='cargoYard';Object.assign(s.discovered,{outer:true,cargoYard:true});Object.assign(s.visited,{camp:true,outer:true,cargoYard:true});s.knownRoutes[a.routeKey('outer','cargoYard')]=true;sandbox.Math.random=()=>0;
  let markers=a.fieldMapMarkers('cargoYard'),fog=a.fieldFogState('cargoYard',markers);assert.ok(markers.some(marker=>marker.kind==='route'&&marker.target==='outer'),'首次进入相邻场景时，来路必须立刻显示，不能再探索一次才驱散迷雾');assert.ok(fog.holes.some(hole=>hole.id==='route:outer'),'来路标记必须同时从对应坐标驱散一片迷雾');assert.equal(markers.some(marker=>marker.kind==='operation'),false,'新场景尚未探索时不得提前发现现场操作点');
  const entryMap=new FakeElement(),entryNodes=[];a.renderFieldExpedition(entryMap,'cargoYard');(function walk(node){entryNodes.push(node);(node.children||[]).forEach(walk);})(entryMap);assert.equal(entryNodes.find(node=>node.className==='field-fog-reveals').children.length,0,'进入新地图时已有来路只能静态显示，不得冒充本次探索发现并播放动画');assert.equal(entryNodes.some(node=>String(node.className).includes('field-map-marker')&&String(node.className).includes('is-fresh')),false,'进入地图时已有地点不得逐个播放入场动画');
  s.discoveryThresholds['explore-v2:map-operation:cargoYard:0']=1;s.exploreCount.cargoYard=1;markers=a.fieldMapMarkers('cargoYard');assert.equal(markers.some(marker=>marker.kind==='operation'),false,'旧存档即使保存过首步阈值，第一次探索也不得必出新操作点');
  assert.match(source,/function render\(\)[^\n]*keepFieldViewport[^\n]*node!==retainedFieldViewport/,'无新地点时渲染流程必须保留原地图视口');assert.match(source,/function fieldViewportCanStayMounted[\s\S]{0,700}parentNode!==box/,'只有仍挂在当前页面的同一张地图才允许原地更新，不能摘下再挂回触发动画重播');assert.match(source,/settleFieldFogAnimation[\s\S]{0,500}reveals\.innerHTML=''/,'旧扩散圈必须在普通刷新前被清理');assert.match(source,/mappedBefore=new Set\(fieldMapMarkerCandidates\(id\)\.filter\(marker=>marker\.revealed\)/,'动画差值必须读取底层发现状态，不能把首次显示的已知路线误判为新发现');assert.match(source,/mappedBefore[\s\S]{0,1200}newMarkerIds[\s\S]{0,300}pendingFieldReveal/,'动画名单必须来自一次探索前后的地点差值，不能把新地图全部已知点当作新发现');assert.match(source,/freshMarkerIds[\s\S]{0,900}freshMarkerIds\.has\(marker\.id\)\?' is-fresh'/,'只有本次新发现的地点才能播放标记入场动画');assert.match(source,/fieldMarkerSelection=\{location:id,markerId:marker\.id\}[\s\S]{0,1200}restoreFieldMarkerSelection/,'地图地点详情必须记住当前选择，采集刷新后继续停留在同一操作点');
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};Object.assign(s.flags,{mapUnlocked:true,exploreUnlocked:true});Object.assign(s.discovered,{setGate:true,cargoYard:true,ridge:true});Object.assign(s.visited,{camp:true,outer:true,cargoYard:true,ridge:true});s.knownRoutes[a.routeKey('outer','cargoYard')]=true;s.knownRoutes[a.routeKey('outer','ridge')]=true;s.player.location='ridge';sandbox.Math.random=()=>0;a.repairKnownRoutes();
  let routes=a.fieldMapMarkers('ridge').filter(marker=>marker.kind==='route');assert.deepEqual(Array.from(routes,marker=>marker.target),['outer'],'从坠毁带入口首次进入断舰岩脊时，只能显示实际走过的来路；尚未测出的货柜捷径不能串图');
  const shortcutNeed=a.neighborRouteNeed('ridge','cargoYard');assert.ok(shortcutNeed>=5,'反向捷径不能在第一次探索必定出现');s.exploreCount.ridge=shortcutNeed-1;assert.equal(a.applyKnownNeighborRoutes('ridge',s.exploreCount.ridge),false);s.exploreCount.ridge=shortcutNeed;assert.equal(a.applyKnownNeighborRoutes('ridge',s.exploreCount.ridge),true,'在断舰岩脊持续勘察后应能反向测出通往货柜坟场的路');
  routes=a.fieldMapMarkers('ridge').filter(marker=>marker.kind==='route');assert.deepEqual(Array.from(routes,marker=>marker.target).sort(),['cargoYard','outer']);assert.equal(a.routeKnown('cargoYard','ridge'),true,'路线发现必须双向同步，而不是只在当前地图临时出现');assert.deepEqual(Array.from(a.travelRoute('ridge','cargoYard').path),['ridge','cargoYard']);
  a.updateCheckpoint();delete s.knownRoutes[a.routeKey('cargoYard','ridge')];a.restoreCheckpoint();assert.equal(a.routeKnown('ridge','cargoYard'),true,'已测绘路线必须随检查点保存，返营或死亡后不能重新变未知');
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};Object.assign(s.flags,{minerFreed:true,bp_miningHarness:true});s.player.location='oldMine';s.exploreCount.oldMine=12;s.flags['fieldNpcFound_阿拓_oldMine']=true;s.flags.storyNpcMet_阿拓=true;
  assert.ok(a.fieldMapMarkers('oldMine').some(marker=>marker.id==='npc:阿拓'),'阿拓离开前，已发现头像必须留在旧矿井');
  s.flags.depthLampBuilt=true;assert.equal(a.npcLocation('阿拓'),'underworks');assert.equal(a.fieldMapMarkers('oldMine').some(marker=>marker.id==='npc:阿拓'),false,'NPC 宣布迁移后，旧区域必须立刻移除头像和历史坐标');assert.equal(Array.from(a.npcsAt('oldMine')).includes('阿拓'),false);
  s.quests.deepLamp='done';a.activateAvailableQuests(false);assert.equal(s.quests.findAtuoUnderworks,'active','NPC 动身后必须出现前往新区域重新寻找他的任务');s.player.location='underworks';s.exploreCount.underworks=12;sandbox.Math.random=()=>0;a.fieldNpcMapped('阿拓','underworks');const need=a.npcDiscoveryNeed('阿拓','underworks');assert.ok(need>=3&&need<=6);assert.equal(a.fieldMapMarkers('underworks').some(marker=>marker.id==='npc:阿拓'),false,'抵达新区域不能因为以前认识 NPC 就自动显示头像');
  a.applyNpcDiscoveries('underworks',12+need-1);assert.equal(s.flags['fieldNpcFound_阿拓_underworks'],undefined,'新区域必须从 NPC 抵达时重新累计随机探索进度');a.applyNpcDiscoveries('underworks',12+need);assert.equal(s.flags['fieldNpcFound_阿拓_underworks'],true);assert.equal(s.flags['storyScene_field-npc-阿拓-underworks'],true,'重新发现 NPC 时必须自动接续该区域剧情');
  s.areaSearch.underworks=4;a.syncQuestProgress(false);assert.equal(s.quests.findAtuoUnderworks,'done');assert.equal(s.quests.underworksCache,'active');assert.equal(s.questStart.underworksCache,4,'汇合后的维修任务必须从续接剧情结束时重新计算，不能吃掉之前的探索次数');
  const npcMarker=a.fieldMapMarkers('underworks').find(marker=>marker.id==='npc:阿拓');assert.ok(npcMarker&&npcMarker.kind==='npc');const npcMap=new FakeElement(),npcNodes=[];a.renderFieldExpedition(npcMap,'underworks');(function walk(node){npcNodes.push(node);(node.children||[]).forEach(walk);})(npcMap);const npcButton=npcNodes.find(node=>String(node.className).includes('marker-npc'));assert.ok(npcButton&&/npc-portraits-v1\/a-tuo\.png/.test(npcButton.innerHTML),'重新发现后，新区域地图必须显示对应 NPC 头像');a.resetStoryScenes();
}

/* 终章不能再由一次普通探索直接触发；六件组件与十二人见证必须形成两层进度。 */
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};s.quests.bridge='done';a.activateAvailableQuests(false);
  assert.equal(a.FINALE_PRIMARY_IDS.filter(id=>a.questState(id)==='active').length,6,'舰桥之后必须同时开放六条组件任务');assert.equal(a.FINALE_CALIBRATION_IDS.filter(id=>a.questState(id)==='locked').length,6,'双人见证线必须在对应组件任务后逐条开放');
  s.player.location='layer7';s.screen='play';a.explore('hunt');assert.equal(s.combat,null,'进入核心或点击清理威胁不得再自动开始终战');assert.equal(s.screen,'play','没有闭合众证协议时不得直接进入结局');assert.equal(a.panelView(),'core','核心舱必须拥有独立控制室页面');
  const core=new FakeElement();a.renderCoreControl(core);const coreNodes=[];(function walk(node){coreNodes.push(node);(node.children||[]).forEach(walk);})(core);assert.ok(coreNodes.some(node=>node.className==='core-component-grid'),'控制室必须显示六个组件槽');assert.equal(coreNodes.find(node=>String(node.className).includes('core-control-dock')).children[0].disabled,true,'组件不全时最终授权按钮必须禁用');
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};s.quests.bridge='done';a.activateAvailableQuests(false);Object.assign(s.quests,{missingZhao:'done',blackwoodTrail:'done'});Object.assign(s.inv,{scrap:6,ecomp:2});s.player.location='setHub';s.npcTarget='老乔';
  let status=a.finaleTaskStatus(a.QUESTS.find(q=>q.id==='finale_joe'));assert.equal(status.accepted,false);s.flags.finaleAccepted_finale_joe=true;status=a.finaleTaskStatus(a.QUESTS.find(q=>q.id==='finale_joe'));assert.equal(status.ok,true,'人物剧情必须在听取委托、前置和材料均满足后才能推进');
  a.finishQuest('finale_joe',false);assert.equal(s.inv.manualOverride,1,'完成主要人物线必须获得对应核心组件');assert.equal(a.questState('finale_zhou'),'active','取得组件后必须开放搭档的可选见证校准线');
  a.resetStoryScenes();let completed=0;a.queueStoryScene({npc:'老乔',location:'setHub',kind:'finale',title:'多段对话测试',lines:['第一句','第二句','第三句'],onComplete:()=>completed++});a.flushStoryScenes();const all=[];(function walk(node){all.push(node);(node.children||[]).forEach(walk);})(document.body);const next=all.filter(node=>node.className==='story-cutscene-next').at(-1);assert.ok(next,'人物任务必须使用与开幕一致的全屏剧情层');next.click();assert.equal(completed,0);next.click();assert.equal(completed,0);next.click();assert.equal(completed,1,'多段剧情读完之后才允许结算任务');a.resetStoryScenes();
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};s.player.location='layer7';s.quests.bridge='done';a.activateAvailableQuests(false);a.FINALE_PRIMARY_IDS.forEach(id=>a.finishQuest(id,false));a.CORE_COMPONENTS.forEach(component=>{assert.ok(s.inv[component.id]>0,component.id+' 必须由对应人物任务产出');a.installCoreComponent(component.id);});assert.equal(a.coreProtocolReady(),true);assert.equal(a.coreInstalledCount(),6);
  assert.equal(a.endingAvailability('sever').ok,true,'基础断链结局必须永远可达');assert.equal(a.endingDisplayName('sever'),'孤证断链','跳过多数见证剧情时基础结局必须降级');assert.equal(a.endingAvailability('coexist').ok,false,'未做搭档剧情时不得开放受限共存');assert.equal(a.endingAvailability('cycle').ok,false,'六件组件齐全不等于真结局条件齐全');
  a.startFinalCoreBattle();assert.equal(s.combat.truthFinal,true);assert.equal(s.combat.name,'守望者·决策人格');assert.equal(a.panelView(),'combat');s.combat.hp=0;a.winCombat();assert.equal(s.meta.guardianDown,true);assert.equal(s.screen,'ending','只有最终决策人格被击败后才能进入结局选择');assert.equal(s.endingChosen,null);assert.equal(a.questDone('core'),true);
  a.resetStoryScenes();
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};s.player.location='layer7';s.quests.bridge='done';a.FINALE_QUEST_IDS.forEach(id=>s.quests[id]='done');a.CORE_COMPONENTS.forEach(component=>{s.inv[component.id]=1;s.flags['coreInstalled_'+component.id]=true;});Object.assign(s.flags,{tangSaved:true,evidenceFault:true,evidenceInner:true,evidenceSignal:true,signalTruth:true});s.meta.fragments=['故障线','内鬼线','信号线'];
  ['coexist','trial','voyage','cycle'].forEach(id=>assert.equal(a.endingAvailability(id).ok,true,'完整人物、证据与救援线必须开放结局 '+id));const full=a.finalBossOverrides();assert.equal(full.armorSegments,0,'老周与小唐的见证校准必须实际削弱最终防护');assert.ok(full.hp<a.ENEMIES.guardian.hp||full.atk<a.ENEMIES.guardian.atk,'人物校准必须真实改变最终战参数');
}
{
  const s=reset();s.tutorial={version:1,step:'done',complete:true};s.player.location='layer7';s.quests.bridge='done';a.FINALE_PRIMARY_IDS.forEach(id=>s.quests[id]='done');a.CORE_COMPONENTS.forEach(component=>{s.inv[component.id]=1;s.flags['coreInstalled_'+component.id]=true;});a.startFinalCoreBattle();a.die();assert.equal(s.screen,'ending');assert.equal(s.endingChosen,'silence','最终战失败必须进入独立坏结局，而不是普通检查点死亡');assert.ok(s.meta.endingsDone.includes('silence'));a.resetStoryScenes();
}
{
  const storyCss=fs.readFileSync(path.join(__dirname,'story-scenes.css'),'utf8');assert.match(storyCss,/#panel\.core-control-page\{[^}]*height:100%[^}]*overflow:hidden/,'核心控制室必须固定一屏');assert.match(storyCss,/\.core-control-scroll\{[^}]*overflow-y:auto/,'组件较多时只能在控制室中部滚动');assert.match(storyCss,/\.npc-finale-stories\{/,'NPC 人物任务必须拥有交谈页内的专用样式');assert.match(source,/function renderNpcDialogue\(box,npcName\)\{\s*renderNpcFinaleStories\(box,npcName\)/,'NPC 人物任务必须留在原交谈页而不是挤出第五个手机 Tab');assert.match(storyCss,/\.story-cutscene-core[\s\S]*story-core-breathe/,'历史真相必须使用带动效的核心剧情画面');assert.match(storyCss,/#panel\.ending-page\{[^}]*height:100%[^}]*overflow:hidden/,'多结局选择也必须保持单屏外壳');assert.match(source,/function endingAvailability\(id\)[\s\S]*finale_doctor[\s\S]*finale_mute[\s\S]*fragmentCount\(\)<3/,'结局条件必须同时关联人物任务、证据和跨周目碎片');
}

Promise.all(pendingTests).then(()=>console.log('game.test.js: all assertions passed')).catch(error=>{console.error(error);process.exitCode=1;});
