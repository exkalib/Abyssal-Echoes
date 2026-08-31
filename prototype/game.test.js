const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeElement {
  constructor(){
    this.children=[]; this.style={}; this.dataset={}; this.attributes={}; this.textContent=''; this.innerHTML='';
    this.classList={add(){},remove(){},toggle(){return false;},contains(){return false;}};
  }
  appendChild(child){ this.children.push(child); return child; }
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
  Math:Object.create(Math), JSON,
};
vm.createContext(sandbox);
let source=fs.readFileSync(__dirname+'/game.js','utf8').replace(/\nboot\(\);\s*$/,'');
source += `\n;this.api={freshState,setState:s=>state=s,getState:()=>state,P,M,totalAtk,statPen,locExtraCost,areaActionCost,fieldMealActive,payAreaAction,materialSnapshot,beginExpedition,finishExpedition,exhaustionDeath,startCombat,winCombat,playerAttack,orbitalStrike,attackResource,attackResourceText,catchBreath,useSkill,equipSkill,unequipSkill,skillUnlocked,passiveBonus,updateCheckpoint,restoreCheckpoint,research,unlockGene,unlockGeneNode,geneTier,geneBonus,geneRule,chooseJob,jobBonus,gainCareerXp,doReincarnate,chooseEnding,gatherAvailable,gatherArea,gatherLimit,performLocationAction,locationActionRemaining,currentDay,rest,fmtTime,activateAvailableQuests,questSearchCount,startBeacon,flee,settleEcho,render,renderCharPanel,renderBuilding,renderSpaceRoutes,explore,staminaToCamp,travelRoute,buyEchoUpgrade,repairFacility,resolveRaid,hasBuildingTech,buildFacility,buildingLevel,upgradeFacility,eatMeal,eatFishMeal,harvestGarden,dispatchDrone,recycleMaterial,damageRandomFacility,mapEdgePath,tutorialActive,finishWakeAnimation,grantTutorialBracelet,grantTutorialBuilder,grantTutorialMap,completeTutorial,normalizeEquipment,normalizeMeta,mergePersistentSpaceMeta,metaFlag,setMetaFlag,grantTechRecord,syncQuestProgress,shipReady,assembleStarship,spaceFlightStatus,launchSpaceRoute,emergencySpaceReturn,outpostBuildStatus,buildOutpostPart,outpostReady,locationRevealed,locationGate,entryNeedsConfirm,operationStatus,performFieldOperation,regionForLocation,regionUnlocked,regionDiscovery,treeLayout,treePortOffset,treeEdgeRoute,techReady,techFacilitiesReady,discoverTechRecord,migrateTechTree,SLOTS,EQUIP_ICON,QUESTS,TECHS,TECH_RECORDS,BRANCHES,MATS,MATERIAL_SOURCES,LOCATIONS,MAP_LINKS,MAP_CANVAS,WORLD_POS,WORLD_REGIONS,WORLD_REGION_LINKS,LOCAL_MAPS,DISCOVERY_MILESTONES,ENTRY_REQUIREMENTS,FIELD_OPERATIONS,LOCATION_ACTIONS,npcLocation,npcsAt,ITEMS,RECIPES,CAMP_BUILDINGS,OUTPOST_BUILDINGS:(typeof OUTPOST_BUILDINGS==='undefined'?[]:OUTPOST_BUILDINGS),SPACE_ROUTES:(typeof SPACE_ROUTES==='undefined'?[]:SPACE_ROUTES),SMELT,RECYCLE,BEACON,SKILLS,GENE_NODES,GENE_TREE,JOBS};`;
vm.runInContext(source,sandbox);
const a=sandbox.api;
function reset(){ sandbox.Math.random=Math.random; const s=a.freshState(); a.setState(s); return s; }

{
  const s=reset();
  assert.equal(s.player.stamina,100,'新档初始体力必须为100');
  s.player.stamina=0;a.rest();
  assert.equal(s.player.stamina,100,'休息必须恢复到新的100点基础体力上限');
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
  assert.match(source,/loadout-console/,'背包必须使用科幻装备终端容器');
  assert.match(source,/inventory-vault/,'背包物品必须使用独立物品仓容器');
  assert.match(source,/inventory-scroll/,'物品仓内容必须拥有独立滚动层，不能推动整页与底部菜单');
  assert.match(source,/openSiteSheet\(['"]item['"],id\)/,'紧凑物品格必须先打开详情弹层，不能直接装备或消耗');
  assert.match(source,/detailIcon=itemUiIcon\(ref\.id\)[\s\S]{0,1600}item-detail-emblem/,'物品详情主视觉必须复用物品仓的科幻实物图，不能放大 Emoji');
  assert.match(source,/mchip',itemUiIcon\(m\)[\s\S]{0,900}iicon">'\+itemUiIcon\(id\)/,'材料条、物品仓和详情页必须共用同一个图标解析函数');
  const itemIds=vm.runInContext('Object.keys(ITEMS)',sandbox);
  assert.equal(itemIds.length,106,'当前106个物品必须全部进入独立实物图系统');
  itemIds.forEach(id=>{const asset=path.join(__dirname,'assets','item-art-v1',id+'.webp');assert.ok(fs.existsSync(asset),id+' 缺少科幻实物图');assert.ok(fs.statSync(asset).size>1000,id+' 的科幻实物图文件异常');});
  assert.match(source,/function itemUiIcon\(id\)\{return '<img class="item-art" data-item="'\+id\+'" src="assets\/item-art-v1\/'\+id\+'\.webp\?v=1"/,'物品图必须统一从独立 WebP 实物资源加载');
  assert.match(css,/\.item-detail-emblem \.item-art\{[^}]*width:58px[^}]*object-fit:contain/,'详情页必须以完整比例展示实物图');
  assert.doesNotMatch(source,/item-detail-facts/,'物品详情不得使用重复、笨重的三栏参数表');
  assert.match(source,/item-detail-titlebar[\s\S]{0,1200}物品说明[\s\S]{0,1200}装备属性/,'物品详情必须按标题、说明和装备属性建立清晰层级');
  assert.match(css,/\.item-detail-sheet \.site-sheet-close\{[^}]*border-left:1px solid[^}]*border-radius:0[^}]*background:transparent/s,'物品详情关闭按钮必须并入标题栏，不能继续使用悬浮圆形按钮');
  assert.match(css,/\.itemgrid\s*\{[^}]*repeat\(5,minmax\(0,1fr\)\)/,'手机物品仓应使用五列紧凑物品格');
  assert.match(source,/panelOpen && state\.tab!==['"]tech['"]&&state\.tab!==['"]char['"]&&state\.tab!==['"]bag['"]/,'角色和背包入口本身可再次点击关闭，不应重复渲染标题与关闭栏');
  assert.match(html,/viewport-fit=cover/,'顶栏必须启用手机安全区');
  assert.match(html,/id="time"[\s\S]*class="camera-safe"[\s\S]*id="pt-label"/,'顶栏必须左右显示时间和周目，并为中置摄像头留空');
  assert.doesNotMatch(html,/id="(?:loc-label|echo-label|frag-label)"/,'顶栏不得继续堆放地点、回响和碎片');
  assert.doesNotMatch(html,/id="log-peek"/,'底部不得再显示统一的查看记录入口');
  assert.match(html,/class="gauge sp"[\s\S]*id="stamina"[\s\S]*href="#icon-energy"/,'体力图标必须位于体力条最右侧并使用统一线性图标');
  assert.equal((html.match(/class="ti"/g)||[]).length,4,'底部四个入口必须使用统一图标容器');
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
  assert.ok(campHome.indexOf('renderCampHero')<campHome.indexOf('camp-mapbar-top'),'营地地图入口必须紧跟在营地信息卡下面');
  assert.ok(campHome.indexOf('state.flags.mapUnlocked&&!state.mapOpen')<campHome.indexOf('camp-mapbar-top'),'地图展开后不得继续显示外层地图入口');
  assert.doesNotMatch(campHome,/收起区域地图/,'展开后的收起操作只能保留在地图面板内部');
  assert.doesNotMatch(campHome,/renderObjectiveStrip/,'营地主页不应显示冗余的当前目标条');
  assert.doesNotMatch(js,/renderObjectiveStrip|currentObjectiveQuest|objective-strip/,'探索页不得残留已删除的当前目标条');
  assert.doesNotMatch(css,/objective-strip|obj-kicker|obj-main|obj-progress/,'已删除的当前目标条不得保留孤立样式');
  assert.ok(campHome.indexOf('camp-construction')<campHome.indexOf('camp-section-head'),'建筑管理必须和营地设施一起放在上半区');
  assert.ok(campHome.indexOf('camp-depart-dock')>campHome.indexOf('camp-layout'),'离开营地必须作为底部主操作');
  assert.match(campHome,/uiIcon\('map'\)[\s\S]*uiIcon\('construct'\)/,'营地主页入口必须使用统一线框图标');
  assert.doesNotMatch(campHome,/b\.icon/,'营地主页设施卡不得继续显示风格不统一的 Emoji');
  assert.match(campHome,/FACILITY \/\/[\s\S]*cf-status/,'设施卡必须统一显示运行状态和等级读数');
  assert.match(campHome,/营地周边小地图[\s\S]*开始探索/,'完成引导后必须同时出现小地图与探索入口');
  assert.match(css,/\.camp-layout\s*\{[^}]*grid-template-columns:1fr/s,'已建营地设施必须整行显示，避免单个设施只占半宽');
  assert.match(css,/\.camp-depart-dock\s*\{[^}]*position:fixed[^}]*bottom:calc\(102px \+ env\(safe-area-inset-bottom,0px\)\)[^}]*padding:0[^}]*background:none/s,'离开营地固定操作不得用黑色外层遮住状态栏');
  assert.match(css,/#statusbar\s*\{[^}]*z-index:30/s,'状态栏必须显示在固定操作层上方');
  assert.doesNotMatch(css,/#59612a|#242818/,'离开营地操作不得脱离营地的冷蓝终端配色');
  assert.match(js,/const ACTION_ICON=\{investigate:'scan',gather:'salvage',hunt:'combat'\}/,'探索操作必须复用语义化 SVG 图标映射');
  assert.match(js,/box\.classList\.add\('field-console'\)/,'探索页必须启用统一的远征终端布局');
  assert.match(js,/scene-metrics[\s\S]*SURVEY[\s\S]*HAZARD[\s\S]*RETURN/,'探索区域头部必须提供测绘、风险和返程读数');
  assert.match(css,/\.region-actions\s*\{[^}]*grid-template-columns:1fr/s,'探索操作必须使用统一的整行模块布局');
  assert.doesNotMatch(js,/b\.innerHTML='<span>'\+nl\.icon/,'探索路线不得继续混用地点 Emoji 图标');
  assert.match(js,/unknown\?'未知区域':loc\.name/,'尚未实地探索的地图节点不得泄露地点名称');
  assert.match(js,/if\(state\.mapOpen\)\{box\.classList\.add\('map-mode'\);renderWorldMap\(box\);return;\}/,'手机展开地图时不得继续渲染下方行动长页面');
  assert.match(css,/#panel \.map-back\s*\{[^}]*height:27px[^}]*min-height:27px/s,'世界地图返回按钮必须与相邻地图工具等高');
  assert.match(css,/\.route-list\{display:flex;overflow-x:auto;scroll-snap-type:x proximity/,'手机端路线必须改为横向快捷条以缩短页面');
  assert.match(css,/\.field-console:not\(\.map-mode\) \.scene-card\{padding:7px 9px 0\}/,'区域信息摘要必须直接适配应用的手机容器，不能依赖外层视口宽度');
  assert.match(css,/\.scene-metrics>span\{padding:5px 8px\}/,'手机端区域读数必须使用紧凑间距');
  assert.match(js,/const fieldView=state\.fieldView==='routes'\?'routes':'actions'/,'探索页必须提供行动与路线双模式');
  assert.match(js,/if\(fieldView==='actions'\)[\s\S]*\}else\{[\s\S]*ROUTE NETWORK/,'行动与路线内容必须互斥渲染，避免手机长页面');
  assert.match(js,/if\(state\.mapOpen\)\{box\.classList\.add\('map-mode'\);renderWorldMap\(box\);return;\}/,'地图必须独占探索页面');
  assert.match(css,/\.field-switch\{display:grid;grid-template-columns:1fr 1fr/,'手机探索页必须提供双模式切换器');
  assert.match(css,/#panel \.region-action\s*\{[^}]*grid-template-columns:40px minmax\(0,1fr\) 118px/s,'三个现场行动必须使用同宽的右侧状态列');
  assert.match(css,/\.ra-status\s*\{[^}]*grid-template-columns:minmax\(0,1fr\) 15px[^}]*grid-template-rows:auto auto/s,'行动消耗文字与箭头必须共享固定对齐网格');
  assert.match(js,/function investigationClueChance\(id\)[\s\S]*misses>=3\?1/,'随机勘察必须提供三次失败后的线索保底');
  assert.match(js,/随机结果：路线线索、物资痕迹、敌对遭遇或无发现/,'勘察入口必须说明随机结果类别');
  assert.doesNotMatch(js,/actionMeta=[^\n]*新线索 \+\(eventIndex\+1\)/,'勘察入口不得提前承诺下一次必出线索');
  assert.match(js,/const SLOT_ICON=\{head:'helmet'[\s\S]*weapon:'weapon'\}/,'十个装备接口必须各自使用语义化 SVG 图标');
  assert.doesNotMatch(js,/training-target[^\n]*◎/,'训练设施不得退回字体符号图标');
  assert.match(js,/treeCardBox\(cv,'data-gid'/,'基因树连线必须读取实际卡片边界，不能继续写死端点高度');
  assert.match(js,/treeCardBox\(cv,'data-tid'/,'科技树连线必须读取实际卡片边界，不能继续写死端点高度');
  assert.match(js,/const TREE_ZOOM_MIN=\.14/,'大型文明科技图必须允许手机端缩放到完整视图');
}

{
  const L=a.treeLayout();
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
  s.inv.scrap=20;a.beginExpedition();s.player.location='outer';s.inv.scrap=30;s.player.stamina=0;a.exhaustionDeath();
  assert.equal(s.player.location,'camp');assert.equal(s.player.stamina,0,'力竭后应以零体力回到营地');assert.equal(s.inv.scrap,26,'力竭只损失本次新增材料的35%');
}
{
  const s=reset(),box=new FakeElement();a.renderCharPanel(box);const classes=box.children.map(x=>x.className||'');
  const growth=classes.indexOf('growth-nav character-quick-nav'),stats=classes.indexOf('char-fold stat-fold');
  assert.equal(classes[0],'camp-hero char-console char-profile-card','角色页首屏应复用统一营地控制台组件');assert.ok(growth>=0&&growth<stats,'基因锁和职业入口必须排在详细属性之前');assert.equal(classes.filter(x=>x.startsWith('char-fold')).length,3,'详细属性、技能和回响应收进三个按需展开区');
  assert.equal(s.charView,'overview');
}
{
  const s=reset();s.inv.scrap=10;a.beginExpedition();s.player.location='outer';s.inv.scrap=20;s.player.stamina=1;
  assert.equal(a.payAreaAction(1),false,'行动刚好耗尽体力时不得继续发放探索结果');assert.equal(s.player.location,'camp');assert.equal(s.inv.scrap,16,'行动力竭只结算本次远征新增材料');
}
{
  const s=reset(); s.player.stamina=0; a.startCombat('rat'); a.catchBreath();
  assert.ok(s.player.stamina>0,'战斗零体力仍可喘息恢复');
  s.player.stamina=0; a.flee(); assert.equal(s.player.stamina,0,'逃跑不得产生负体力');
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
  assert.ok(combat.indexOf('combat-enemy')<combat.indexOf('combat-readout')&&combat.indexOf('combat-readout')<combat.indexOf('combat-player')&&combat.indexOf('combat-player')<combat.indexOf('combat-deck'),'战斗页必须按敌方、战况、我方、操作区自上而下渲染');
  assert.match(css,/#app\.combat-active #statusbar,#app\.combat-active #tabbar\s*\{\s*display:none/s,'战斗时必须隐藏无效的全局导航，把底部留给战斗操作');
  assert.match(css,/\.combat-main-actions,[^}]*grid-template-columns:1fr 1fr/s,'战斗操作必须使用紧凑的底部双列按键区');
}
{
  const s=reset(); s.player.location='layer4'; s.player.infected=true; s.player.hp=100;
  assert.equal(a.locExtraCost(),0,'污染只造成生命伤害，不重复增加体力消耗');
  a.payAreaAction(1); assert.equal(s.player.hp,95,'污染3点与感染2点均应生效');
}
{
  const s=reset(); s.inv.scrap=10; a.updateCheckpoint(); a.research('make_1');
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
  a.gatherArea('outer'); a.gatherArea('outer'); assert.equal(a.gatherAvailable('outer'),0);
  s.time=24; assert.equal(a.gatherAvailable('outer'),2,'常规资源应在次日刷新');
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
  assert.equal(a.skillUnlocked('combatRhythm'),false,'高阶职业被动不应提前解锁');
  a.gainCareerXp('main',200); assert.ok(s.meta.careers.main.level>=3); assert.equal(a.skillUnlocked('combatRhythm'),true,'职业升级后被动应自动生效');
  assert.ok(a.passiveBonus('atkPct')>0,'被动技能必须自动提供属性，无需装备');
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
  assert.equal(a.MATS.length,40,'原有32种材料加远航篇8种材料后应为40种');
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
  assert.equal(Object.keys(a.WORLD_REGIONS).length,8,'原有四区域加远航篇四区域后应为八个大区域');
  assert.equal(Object.keys(a.LOCATIONS).length,43,'原有31地点加远航篇12地点后应为43个地点');
  Object.entries(regionLocations).forEach(([rid,locations])=>{const region=a.WORLD_REGIONS[rid];assert.ok(region,`远航区域 ${rid} 必须存在`);assert.deepEqual(Array.from(region.locations).sort(),locations.slice().sort(),`${rid} 必须恰好包含三个设计地点`);assert.ok(a.LOCAL_MAPS[rid],`远航区域 ${rid} 必须有可缩放的局部地图`);});

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
  ['accessCard','plasmaCutter','maintenanceKey','civilPass','depthLamp','sporeSeal','signalCipher'].forEach(id=>s.inv[id]=1);
  const spaceLocations=new Set(['orbit','ashMoon','verdant','silent'].flatMap(rid=>a.WORLD_REGIONS[rid]?Array.from(a.WORLD_REGIONS[rid].locations):[]));
  Object.keys(a.LOCATIONS).filter(id=>!spaceLocations.has(id)).forEach(id=>assert.ok(Number.isFinite(a.staminaToCamp(id)),`${id} 没有可返回营地的路线`));
}
{
  Object.keys(a.WORLD_POS).forEach(id=>assert.ok(a.LOCATIONS[id],`兼容用全局坐标 ${id} 必须指向真实地点`));
  Object.entries(a.WORLD_REGIONS).forEach(([rid,region])=>{const local=a.LOCAL_MAPS[rid];assert.ok(local,`区域 ${rid} 必须有局部地图`);assert.deepEqual(Object.keys(local.pos).sort(),Array.from(region.locations).sort(),`区域 ${rid} 的地点与局部坐标必须完全一致`);Object.entries(local.pos).forEach(([id,[x,y]])=>{assert.ok(x>=0&&y>=0&&x+local.canvas.nodeWidth<=local.canvas.width&&y+local.canvas.nodeHeight<=local.canvas.height,`${id} 越出局部地图`);});});
  ['silica','titaniumOre','deuterium','phaseCrystal'].forEach(item=>assert.ok(Object.values(a.LOCATIONS).some(loc=>(loc.loot||{})[item]>0),`高级地图原料 ${item} 必须有明确产区`));
}
{
  let s=reset();s.meta.records=[];a.discoverTechRecord('layer6');assert.ok(s.meta.records.includes('command')&&s.meta.records.includes('gravityMap'),'同一地点的多份技术资料必须一次全部取得');
  s=reset();Object.assign(s.meta.techs,{make_1:1,make_3:1,energy_1:1});Object.assign(s.inv,{copperIngot:4,ecomp:4,crystal:2});const before=JSON.stringify({copperIngot:s.inv.copperIngot,ecomp:s.inv.ecomp,crystal:s.inv.crystal});
  a.research('energy_2');assert.equal(s.meta.techs.energy_2,undefined,'研究设施未建时不得完成高阶研究');assert.equal(JSON.stringify({copperIngot:s.inv.copperIngot,ecomp:s.inv.ecomp,crystal:s.inv.crystal}),before,'设施缺失不得扣研究材料');
  s.meta.built.energyCore=true;a.research('energy_2');assert.equal(s.meta.techs.energy_2,1,'研究设施上线后应允许研究');assert.equal(s.time,4,'早期未来科技应使用声明的研究时长');
  s=reset();s.meta.techVersion=3;s.meta.techs={make_1:1,auto_7:1};a.migrateTechTree();assert.equal(s.meta.techVersion,5);assert.equal(s.meta.techs.make_1,1);assert.equal(s.meta.techs.auto_7,1);assert.equal(s.meta.legacyTechGates,true,'v3 存档应保留旧基因科技门槛豁免');const once=JSON.stringify(s.meta);a.migrateTechTree();assert.equal(JSON.stringify(s.meta),once,'v5 科技迁移必须幂等');
}
{
  const allRegionLocations=Object.values(a.WORLD_REGIONS).flatMap(r=>Array.from(r.locations));
  assert.equal(new Set(allRegionLocations).size,Object.keys(a.LOCATIONS).length,'每个具体地点必须且只能归属一个大区域');
  ['outer','joeCamp','cargoYard','blackwood','ridge','floodChannel','relayTower','coalRift','oldMine','silicaField','titaniumMine'].forEach(id=>assert.ok(a.WORLD_REGIONS.surface.locations.includes(id),id+' 必须留在坠毁带局部地图'));
  assert.ok(!Object.keys(a.WORLD_REGIONS).includes('blackwood'),'世界地图不得把黑木林当作大区域节点');
  const s=reset();assert.deepEqual(Object.keys(s.discovered).sort(),['camp','joeCamp','outer'],'引导地图开局只能登记营地、坠毁带入口与老乔营地');
  s.player.location='outer';s.player.stamina=50;sandbox.Math.random=()=>0;
  a.explore('investigate');assert.equal(s.discovered.cargoYard,true);assert.equal(s.discovered.blackwood,undefined,'入口调查只应发现货柜坟场');
  a.explore('investigate');a.explore('investigate');assert.equal(s.discovered.blackwood,undefined);assert.equal(s.discovered.layer2,undefined,'重复调查入口不得继续连锁解锁地点');
  s.player.location='cargoYard';s.visited.cargoYard=true;a.explore('investigate');
  assert.equal(s.discovered.blackwood,true);assert.equal(a.locationGate('blackwood').ok,false,'发现黑木林后仍需工业切割器');
  assert.equal(a.operationStatus('repairCutter').ok,true,'入口事件与货柜事件应提供修复切割器所需材料');
  a.performFieldOperation('repairCutter');assert.equal(s.inv.plasmaCutter,1);assert.equal(a.locationGate('blackwood').ok,true,'修复切割器后才可处理黑木林入口');
  a.explore('investigate');assert.equal(s.discovered.ridge,true);assert.equal(s.discovered.layer2,undefined,'货柜坟场只能继续发现岩脊，不能直达方舟残骸');
}
{
  const s=reset();
  Object.entries(a.ENTRY_REQUIREMENTS).forEach(([loc,req])=>{assert.ok(a.LOCATIONS[loc],`入口条件地点 ${loc} 不存在`);assert.ok(a.ITEMS[req.item],`入口条件 ${loc} 使用未知道具 ${req.item}`);});
  Object.entries(a.FIELD_OPERATIONS).forEach(([id,op])=>{assert.ok(a.LOCATIONS[op.at],`现场操作 ${id} 地点不存在`);assert.ok(a.ITEMS[op.grant],`现场操作 ${id} 产出未知道具`);Object.keys(op.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`现场操作 ${id} 使用未知材料 ${item}`));});
  const resourceSites=Object.entries(a.LOCATIONS).filter(([,loc])=>loc.resourceSite);
  assert.ok(resourceSites.length>=5,'三层地图都应包含可供后续自动建筑接管的资源据点候选');
  resourceSites.forEach(([id,loc])=>{assert.equal(a.gatherLimit(id),3,`${loc.name} 每日应有更高的定向采集次数`);loc.resourceSite.yield.forEach(item=>assert.ok(loc.loot[item]>0,`${loc.name} 必须实际产出标注资源 ${item}`));});
  const css=fs.readFileSync(__dirname+'/style.css','utf8'),js=fs.readFileSync(__dirname+'/game.js','utf8');
  assert.match(css,/\.site-sheet-backdrop\s*\{[^}]*position:fixed[^}]*max-width:520px/s,'入口与现场操作必须使用手机宽度内的底部弹层');
  assert.match(js,/box\.appendChild\(ag\);\s*renderFieldPrompt/s,'现场操作提示必须放在常驻探索按钮网格之外');
}
{
  let s=reset();s.player.location='relayTower';s.areaSearch.relayTower=1;s.inv.ecomp=2;
  assert.equal(a.operationStatus('restoreTower').ok,true);a.performFieldOperation('restoreTower');
  assert.equal(s.inv.civilPass,1);assert.equal(s.discovered.layer2,true,'恢复断波塔应取得生活区门禁并现场标出方舟入口');
  s=reset();s.player.location='oldMine';s.areaSearch.oldMine=1;s.flags.minerFreed=true;s.inv.copperScrap=2;s.inv.ecomp=1;
  a.performFieldOperation('assembleLamp');assert.equal(s.inv.depthLamp,1,'救出矿工后应能组装深层探照灯');
  s=reset();s.player.location='abyss';s.areaSearch.abyss=3;s.flags.relayFixed=true;s.inv.crystal=2;s.inv.ecomp=1;
  a.performFieldOperation('decodeRelic');assert.equal(s.inv.signalCipher,1);assert.equal(s.discovered.ruinVestibule,true,'解码中继信号后才应发现遗迹门厅');
}
{
  const s=reset();s.player.location='joeCamp';s.player.stamina=20;const rolls=[.9,.5,0];sandbox.Math.random=()=>rolls.shift()??0;a.explore('investigate');
  assert.equal(s.inv.wood,1,'调查失败后应有机会随机拾取当前地点资源');
}
{
  const s=reset();s.player.location='outer';s.player.stamina=50;sandbox.Math.random=()=>.99;
  a.explore('investigate');assert.equal(s.discovered.cargoYard,undefined,'单次调查不得保证发现新地点');assert.equal(s.areaSearch.outer||0,0,'无有效线索时不得推进调查进度');
  a.explore('investigate');a.explore('investigate');a.explore('investigate');
  assert.equal(s.discovered.cargoYard,true,'连续三次未取得线索后，下一次调查必须触发保底');
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
  Object.assign(s.discovered,{cargoYard:true,blackwood:true});s.inv.plasmaCutter=1;s.visited.outer=true;s.visited.cargoYard=true;s.visited.blackwood=true;route=a.travelRoute('camp','blackwood');
  assert.deepEqual(Array.from(route.path),['camp','outer','cargoYard','blackwood']); assert.equal(route.cost,6,'已探索区域应按分层后的最短路线累计体力');
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
  assert.equal(s.inv.arkBand,1); assert.equal(s.flags.braceletUnlocked,true,'手环必须解锁状态栏和四个入口');
  s.tutorial.step='builder_offer'; a.grantTutorialBuilder();
  assert.equal(s.inv.builderGun,1); assert.equal(s.inv.scrap,4); assert.equal(s.inv.wood,4,'建造枪阶段必须发放刚好够用的初始材料');
  a.buildFacility(quarters); assert.equal(s.meta.built.quarters,true); assert.equal(s.inv.scrap,0); assert.equal(s.inv.wood,0); assert.equal(s.tutorial.step,'shelter');
  a.grantTutorialMap(); assert.equal(s.inv.fieldMap,1); assert.equal(s.flags.mapUnlocked,true); assert.equal(s.flags.exploreUnlocked,true);
  a.completeTutorial(); assert.equal(a.tutorialActive(),false); assert.equal(s.flags.guideDeparted,true,'老乔告别后引导必须完成');
  assert.equal(a.damageRandomFacility(),null,'休眠仓不得在袭营中损坏，否则可能失去唯一休息路径');
}
{
  const s=reset(); s.meta.techs.make_1=1; s.inv.scrap=10; s.inv.stone=10;
  const smelt=a.CAMP_BUILDINGS.find(x=>x.id==='smelt'); a.buildFacility(smelt);
  assert.equal(s.meta.built.smelt,true,'科技解锁后必须能建造设施'); assert.equal(a.buildingLevel('smelt'),1);
  s.meta.techs.make_3=1; s.inv.ingot=3; s.inv.copperIngot=2; a.upgradeFacility('smelt');
  assert.equal(a.buildingLevel('smelt'),2,'设施升级应保存在建筑等级中');
}
{
  const s=reset(); s.meta.built.mess=true; s.meta.buildLevels.mess=1; s.inv.ration=2; s.player.hp=50; s.player.stamina=10;
  a.eatMeal(); const hp=s.player.hp,st=s.player.stamina; a.eatMeal();
  assert.equal(s.inv.ration,1,'每日热食只能消耗一次材料'); assert.equal(s.player.hp,hp); assert.equal(s.player.stamina,st);
  s.time+=24; a.eatMeal(); assert.equal(s.inv.ration,0,'次日应刷新配给站');
}
{
  assert.deepEqual(Object.keys(a.LOCATION_ACTIONS),['floodChannel'],'只有形成独立用途闭环的地点才应增加专属行动');
  const fishGains=a.LOCATION_ACTIONS.floodChannel.outcomes.flatMap(o=>Object.keys(o.gain||{}));
  assert.ok(fishGains.length>0&&fishGains.every(id=>id==='riverFish'),'垂钓必须产出独有食材，不能退化成通用采集换皮');
  assert.equal(a.MATERIAL_SOURCES.riverFish,'冲刷排水渠 · 专属垂钓');
}
{
  const s=reset();s.player.location='floodChannel';s.player.stamina=10;sandbox.Math.random=()=>0;
  assert.equal(a.performLocationAction('floodChannel'),true);assert.equal(s.inv.riverFish,1);assert.equal(s.player.stamina,9);assert.equal(a.locationActionRemaining('floodChannel'),1);
  a.performLocationAction('floodChannel');const stamina=s.player.stamina,fish=s.inv.riverFish;
  assert.equal(a.performLocationAction('floodChannel'),false,'垂钓达到每日上限后不得继续结算');assert.equal(s.player.stamina,stamina);assert.equal(s.inv.riverFish,fish);
}
{
  const s=reset();s.meta.built.mess=true;s.meta.buildLevels.mess=1;s.inv.riverFish=2;s.inv.ration=1;s.player.hp=50;s.player.stamina=10;
  const box=new FakeElement();a.renderBuilding(box,'mess');const mealSection=box.children.find(x=>(x.className||'').includes('facility-section')),mealOptions=mealSection.children.find(x=>(x.className||'').includes('meal-options'));assert.equal(mealOptions.children.length,2,'配给站必须明确提供即时恢复与远征增益两种互斥方案');
  a.eatFishMeal();assert.equal(s.inv.riverFish,0);assert.equal(s.foodBuff.charges,3);assert.equal(a.fieldMealActive(),true,'鱼汤必须兑现远征准备用途');
  a.eatMeal();assert.equal(s.inv.ration,1,'鱼汤与普通热食必须共用每日选择次数');
  s.player.location='outer';s.player.stamina=10;assert.equal(a.areaActionCost(2),1);a.payAreaAction(2);assert.equal(s.player.stamina,9);assert.equal(s.foodBuff.charges,2,'每次野外行动只能消耗一层鱼汤增益');
  s.time+=24;assert.equal(a.fieldMealActive(),false);assert.equal(a.areaActionCost(2),2,'鱼汤增益必须在次日失效');
}
{
  const s=reset();assert.equal(a.npcLocation('老乔'),'joeCamp');assert.ok(a.npcsAt('joeCamp').includes('老乔'));
  s.flags.firstRaidSurvived=true;assert.equal(a.npcLocation('老乔'),'camp');assert.ok(!a.npcsAt('joeCamp').includes('老乔'),'剧情推进后旧地点不得继续显示 NPC');
  assert.equal(a.npcLocation('阿拓'),'oldMine');s.flags.depthLampBuilt=true;assert.equal(a.npcLocation('阿拓'),'underworks','组装深层探照灯后阿拓应转移到维修井');
  assert.equal(a.npcLocation('纪遥'),'nursery');s.flags.prototypeOnline=true;assert.equal(a.npcLocation('纪遥'),'layer4','恢复原型终端后纪遥应转移到实验室');
  s.flags.tangLost=true;assert.equal(a.npcLocation('小唐'),null,'不可逆剧情结果必须能让 NPC 从世界中移除');
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
  let s=reset();s.inv.scrap=20;s.inv.wood=8;a.beginExpedition();s.player.location='outer';s.inv.scrap=40;s.inv.wood=5;s.inv.plasmaCutter=1;a.exhaustionDeath();
  assert.equal(s.inv.scrap,33,'无仓库力竭应损失本次新增材料的35%');assert.equal(s.inv.wood,5,'出发前已有材料不得因净减少再次被扣');assert.equal(s.inv.plasmaCutter,1,'关键道具不得参与力竭掉落');assert.equal(s.siteSheet.kind,'exhaustion','力竭回营后应显示结算弹层');
  s=reset();s.meta.built.warehouse=true;s.meta.buildLevels.warehouse=3;s.inv.scrap=20;a.beginExpedition();s.player.location='outer';s.inv.scrap=40;a.exhaustionDeath();
  assert.equal(s.inv.scrap,35,'三级仓库应把力竭损失降至25%');
}
{
  const techIds=new Set(Object.keys(a.TECHS));
  [...a.CAMP_BUILDINGS,...a.OUTPOST_BUILDINGS].forEach(b=>(b.upgrades||[]).forEach(up=>{assert.ok(techIds.has(up.tech),`设施 ${b.id} 的升级科技 ${up.tech} 不存在`);Object.keys(up.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`设施 ${b.id} 升级使用未知材料 ${item}`));}));
}
{
  const s=reset(); Object.keys(a.TECHS).forEach(id=>s.meta.techs[id]=1); Object.keys(a.ITEMS).forEach(id=>s.inv[id]=99);
  a.CAMP_BUILDINGS.forEach(b=>{s.meta.built[b.id]=true;s.meta.buildLevels[b.id]=1;const box=new FakeElement();assert.doesNotThrow(()=>a.renderBuilding(box,b.id),`设施页面 ${b.id} 不得渲染崩溃`);assert.ok(box.children.length>=3,`设施页面 ${b.id} 必须包含独立操作区与升级区`);});
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

console.log('game.test.js: all assertions passed');
