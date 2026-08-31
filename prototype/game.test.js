const assert = require('node:assert/strict');
const fs = require('node:fs');
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
source += `\n;this.api={freshState,setState:s=>state=s,getState:()=>state,P,M,totalAtk,statPen,locExtraCost,payAreaAction,emergencyEvacuate,startCombat,catchBreath,useSkill,updateCheckpoint,restoreCheckpoint,research,unlockGene,doReincarnate,geneTier,chooseEnding,gatherAvailable,gatherArea,currentDay,rest,fmtTime,activateAvailableQuests,questSearchCount,startBeacon,flee,settleEcho,render,renderBuilding,explore,staminaToCamp,travelRoute,buyEchoUpgrade,repairFacility,resolveRaid,hasBuildingTech,buildFacility,buildingLevel,upgradeFacility,eatMeal,harvestGarden,recycleMaterial,damageRandomFacility,mapEdgePath,QUESTS,TECHS,LOCATIONS,MAP_LINKS,MAP_CANVAS,WORLD_POS,ITEMS,RECIPES,CAMP_BUILDINGS,SMELT,RECYCLE,BEACON};`;
vm.runInContext(source,sandbox);
const a=sandbox.api;
function reset(){ sandbox.Math.random=Math.random; const s=a.freshState(); a.setState(s); return s; }

{
  const css=fs.readFileSync(__dirname+'/style.css','utf8');
  assert.match(css,/\*\s*\{[^}]*user-select:\s*none/s,'整个游戏界面必须禁用文字选择，避免拖动时误选文本');
  const html=fs.readFileSync(__dirname+'/index.html','utf8');
  assert.match(html,/viewport-fit=cover/,'顶栏必须启用手机安全区');
  assert.match(html,/id="time"[\s\S]*class="camera-safe"[\s\S]*id="pt-label"/,'顶栏必须左右显示时间和周目，并为中置摄像头留空');
  assert.doesNotMatch(html,/id="(?:loc-label|echo-label|frag-label)"/,'顶栏不得继续堆放地点、回响和碎片');
  assert.doesNotMatch(html,/id="log-peek"/,'底部不得再显示统一的查看记录入口');
  assert.match(html,/class="gauge sp"[\s\S]*id="stamina"[\s\S]*class="g-ico">⚡/,'体力图标必须位于体力条最右侧');
  assert.match(html,/class="gear-svg"/,'设置按钮必须使用中心稳定的矢量齿轮，不能依赖字体字形');
  assert.equal((html.match(/<rect x="10\.5" y="1" width="3" height="5"/g)||[]).length,8,'设置图标必须是完整八齿轮');
  assert.match(css,/@keyframes\s+gear-idle/,'移动端设置齿轮必须具有不依赖 hover 的待机动画');
  assert.match(css,/animation:gear-idle\s+6s/,'完整齿轮的待机动画周期应为6秒');
  assert.match(css,/90%,100%\s*\{\s*transform:rotate\(1080deg\)/,'齿轮每次启动应连续旋转三圈');
  const js=fs.readFileSync(__dirname+'/game.js','utf8');
  assert.match(js,/function checkAppUpdate\(\)/,'设置页必须提供主动检查更新入口');
  assert.match(js,/bridge\.checkForUpdates\(\)/,'主动更新按钮必须调用安卓原生更新器');
  assert.match(js,/id=\"update-status\"/,'设置页必须显示更新过程和结果');
  const campHome=js.slice(js.indexOf('function renderCampHome'),js.indexOf('function renderConstruction'));
  assert.ok(campHome.indexOf('renderCampHero')<campHome.indexOf('camp-mapbar-top'),'营地地图入口必须紧跟在营地信息卡下面');
  assert.ok(campHome.indexOf('if(!state.mapOpen)')<campHome.indexOf('camp-mapbar-top'),'地图展开后不得继续显示外层地图入口');
  assert.doesNotMatch(campHome,/收起区域地图/,'展开后的收起操作只能保留在地图面板内部');
  assert.doesNotMatch(campHome,/renderObjectiveStrip/,'营地主页不应显示冗余的当前目标条');
  assert.ok(campHome.indexOf('camp-construction')<campHome.indexOf('camp-section-head'),'建筑管理必须和营地设施一起放在上半区');
  assert.ok(campHome.indexOf('camp-depart-dock')>campHome.indexOf('camp-layout'),'离开营地必须作为底部主操作');
  assert.match(css,/\.camp-depart-dock\s*\{[^}]*position:fixed[^}]*bottom:calc\(102px \+ env\(safe-area-inset-bottom,0px\)\)[^}]*padding:0[^}]*background:none/s,'离开营地固定操作不得用黑色外层遮住状态栏');
  assert.match(css,/#statusbar\s*\{[^}]*z-index:30/s,'状态栏必须显示在固定操作层上方');
}

{
  const s=reset(); assert.equal(a.totalAtk(),12,'初始攻击应让前期敌人至少需要两次攻击');
  s.player.location='outer'; s.player.stamina=0; a.emergencyEvacuate();
  assert.equal(s.player.location,'camp'); assert.ok(s.player.stamina>0,'零体力仍可撤离');
}
{
  const s=reset(); s.player.stamina=0; a.startCombat('rat'); a.catchBreath();
  assert.ok(s.player.stamina>0,'战斗零体力仍可喘息恢复');
  s.player.stamina=0; a.flee(); assert.equal(s.player.stamina,0,'逃跑不得产生负体力');
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
  let s=reset(); s.inv.biocore=3; s.inv.crystal=1; a.unlockGene(); assert.equal(a.geneTier(),1);
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
  const s=reset(); s.skills.heavy.prof=10; s.player.stamina=10; a.startCombat('rat'); s.combat.distNow=1; sandbox.Math.random=()=>0;
  a.useSkill('heavy'); assert.ok(s.combat===null||s.combat.hp<16,'技能必须能实际造成伤害');
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
  function visit(id){
    if(done.has(id))return; assert.ok(ids.has(id),`科技 ${id} 不存在`); assert.ok(!visiting.has(id),`科技树存在循环：${id}`); visiting.add(id);
    (a.TECHS[id].req||[]).forEach(visit); visiting.delete(id); done.add(id);
  }
  ids.forEach(visit);
  Object.entries(a.TECHS).forEach(([id,t])=>{
    Object.keys(t.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`科技 ${id} 使用了未知材料 ${item}`));
    (t.un||[]).forEach(item=>assert.ok(a.RECIPES[item],`科技 ${id} 解锁了未知配方 ${item}`));
    (t.build||[]).forEach(fac=>assert.ok(a.CAMP_BUILDINGS.some(x=>x.id===fac),`科技 ${id} 解锁了未知设施 ${fac}`));
    (t.smelt||[]).forEach(sm=>assert.ok(a.SMELT.some(x=>x.id===sm),`科技 ${id} 解锁了未知熔炼 ${sm}`));
  });
}
{
  const ids=new Set(Object.keys(a.LOCATIONS));
  a.MAP_LINKS.forEach(([from,to])=>{assert.ok(ids.has(from),`地图端点 ${from} 不存在`);assert.ok(ids.has(to),`地图端点 ${to} 不存在`);});
  const s=reset(); a.QUESTS.forEach(q=>s.quests[q.id]='done');
  Object.values(a.LOCATIONS).forEach(loc=>{if(loc.hiddenBy)s.flags[loc.hiddenBy]=true;}); s.inv.accessCard=1;
  Object.keys(a.LOCATIONS).forEach(id=>assert.ok(Number.isFinite(a.staminaToCamp(id)),`${id} 没有可返回营地的路线`));
}
{
  Object.entries(a.WORLD_POS).forEach(([id,[x,y]])=>{assert.ok(x>=0&&y>=0,`地图节点 ${id} 不得越出左上边界`);assert.ok(x+a.MAP_CANVAS.nodeWidth<=a.MAP_CANVAS.width,`地图节点 ${id} 越出右边界`);assert.ok(y+a.MAP_CANVAS.nodeHeight<=a.MAP_CANVAS.height,`地图节点 ${id} 越出下边界`);});
  assert.ok(a.MAP_CANVAS.nodeWidth>=120,'地图节点必须足够显示完整地点名');
  a.MAP_LINKS.forEach(([from,to])=>{const p=a.mapEdgePath(a.WORLD_POS[from],a.WORLD_POS[to]);assert.match(p,/^M[\d.]+,[\d.]+ L[\d.]+,[\d.]+ L[\d.]+,[\d.]+ L[\d.]+,[\d.]+$/,`${from} → ${to} 的连接线路径无效`);
    const n=p.match(/[\d.]+/g).map(Number),start=n.slice(0,2),end=n.slice(-2),onEdge=(point,pos)=>{const [x,y]=point,[left,top]=pos,right=left+a.MAP_CANVAS.nodeWidth,bottom=top+a.MAP_CANVAS.nodeHeight;return ((x===left||x===right)&&y>=top&&y<=bottom)||((y===top||y===bottom)&&x>=left&&x<=right);};
    assert.ok(onEdge(start,a.WORLD_POS[from]),`${from} → ${to} 起点没有贴住节点边缘`);assert.ok(onEdge(end,a.WORLD_POS[to]),`${from} → ${to} 终点没有贴住节点边缘`);
  });
}
{
  const s=reset(); let route=a.travelRoute('camp','outer');
  assert.deepEqual(Array.from(route.path),['camp','outer']); assert.equal(route.cost,2,'相邻区域应显示准确体力消耗');
  assert.equal(a.travelRoute('camp','blackwood'),null,'不得快速移动跳过尚未探索的中间区域');
  s.visited.outer=true;s.visited.blackwood=true;route=a.travelRoute('camp','blackwood');
  assert.deepEqual(Array.from(route.path),['camp','outer','blackwood']); assert.equal(route.cost,4,'已探索区域应按最短路线累计体力');
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
  const s=reset(); assert.equal(s.meta.built.quarters,true,'新档必须自带休眠舱');
  assert.equal(Object.keys(s.meta.built).filter(id=>s.meta.built[id]).length,1,'未解锁建筑不得默认堆在营地');
  assert.equal(a.damageRandomFacility(),null,'休眠舱不得在袭营中损坏，否则可能失去唯一休息路径');
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
  const s=reset(); s.meta.built.garden=true; s.meta.buildLevels.garden=2; a.harvestGarden();
  assert.equal(s.inv.ration,3); assert.equal(s.inv.biocore,1,'二级菌圃应产出生物样本');
  const ration=s.inv.ration; a.harvestGarden(); assert.equal(s.inv.ration,ration,'固定每日设施不得无限领取');
}
{
  const s=reset(); s.meta.built.recycler=true; s.meta.buildLevels.recycler=2; s.inv.ingot=1; a.recycleMaterial('metal');
  assert.equal(s.inv.ingot,0); assert.equal(s.inv.scrap,4,'二级回收中心应兑现废铁产量加成');
}
{
  let s=reset(); s.player.location='outer'; s.inv.scrap=20; a.updateCheckpoint(); s.inv.scrap=40; a.emergencyEvacuate();
  assert.equal(s.inv.scrap,33,'无仓库紧急撤离应损失本次收获的35%');
  s=reset(); s.meta.built.warehouse=true; s.meta.buildLevels.warehouse=3; s.player.location='outer'; s.inv.scrap=20; a.updateCheckpoint(); s.inv.scrap=40; a.emergencyEvacuate();
  assert.equal(s.inv.scrap,35,'三级仓库应把紧急撤离损失降至25%');
}
{
  const techIds=new Set(Object.keys(a.TECHS));
  a.CAMP_BUILDINGS.forEach(b=>(b.upgrades||[]).forEach(up=>{assert.ok(techIds.has(up.tech),`设施 ${b.id} 的升级科技 ${up.tech} 不存在`);Object.keys(up.cost||{}).forEach(item=>assert.ok(a.ITEMS[item],`设施 ${b.id} 升级使用未知材料 ${item}`));}));
}
{
  const s=reset(); Object.keys(a.TECHS).forEach(id=>s.meta.techs[id]=1); Object.keys(a.ITEMS).forEach(id=>s.inv[id]=99);
  a.CAMP_BUILDINGS.forEach(b=>{s.meta.built[b.id]=true;s.meta.buildLevels[b.id]=1;const box=new FakeElement();assert.doesNotThrow(()=>a.renderBuilding(box,b.id),`设施页面 ${b.id} 不得渲染崩溃`);assert.ok(box.children.length>=3,`设施页面 ${b.id} 必须包含独立操作区与升级区`);});
}

console.log('game.test.js: all assertions passed');
