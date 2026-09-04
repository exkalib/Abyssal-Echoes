const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=__dirname;
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const game=read('game.js');
const system=read('ui-system.css');
const layout=read('style.css');
const rules=read('UI_SYSTEM.md');
const html=read('index.html');

for(const archetype of ['.ui-page','.ui-workspace','.ui-canvas-workspace','.ui-dialog']){
  assert.match(rules,new RegExp(archetype.replace('.',String.raw`\.`)),`设计规范必须登记页面母版 ${archetype}`);
}
for(const primitive of ['.ui-workspace__shell','.ui-workspace__main','.ui-workspace__footer','.ui-workspace__exit','.ui-module-header','.ui-segmented','.ui-art-frame','.ui-stat-grid']){
  assert.match(system,new RegExp(primitive.replace('.',String.raw`\.`)),`统一样式文件必须实现 ${primitive}`);
}
for(const token of ['--ui-metal','--ui-metal-warm','--ui-oxide'])assert.match(system,new RegExp(token),`统一样式必须提供材质令牌 ${token}`);
assert.match(system,/Mobile interaction contract[\s\S]*touch-action:manipulation[\s\S]*#panel button:not\(\.ui-icon-button\)[\s\S]*min-height:44px/,'统一样式必须让全部移动端普通按钮达到 44px');
assert.match(system,/\.ui-icon-button,[\s\S]*#panel \.map-tool,[\s\S]*width:44px!important;[\s\S]*height:44px!important;/,'成组图标按钮必须使用不重叠的 44px 实体点击区');
assert.match(game,/style\.setProperty\('--map-scale',view\.scale\)/,'地图视口必须把实时缩放倍率传给触摸层');
assert.match(system,/#panel \.mapnode::before[\s\S]*44px \/ var\(--map-scale,1\)/,'地图节点必须按缩放倍率反向补偿触摸区');
assert.match(game,/const pointerPair=[\s\S]*beginPinch=[\s\S]*Math\.hypot[\s\S]*pointercancel/,'地图必须支持以双指中点为锚点的触摸缩放');
for(const control of ['station-detail-workbench \\.station-step','battle-primary-controls \\.battle-action'])assert.match(system,new RegExp(control),`${control} 必须接入统一移动触摸规格`);
assert.match(system,/#panel\[data-view="settings"\]\.settings-home[\s\S]*overflow-y:auto!important[\s\S]*settings-storage-actions \.cloud-action[\s\S]*min-height:44px!important/,'紧凑设置首页不得以缩小按钮换取伪一屏');
assert.match(system,/#panel\.settings-home \.settings-media[\s\S]*overflow:visible[\s\S]*repeat\(3,minmax\(44px,auto\)\)/,'矮屏设置项变大后不得被旧容器裁切');
assert.match(system,/body\[data-ui="abyss-frame"\] #panel \.field-head-tool,[\s\S]*field-map-marker,[\s\S]*field-map-drawer-close[\s\S]*min-height:44px!important/,'后加载的野外场景样式不得缩小统一触摸区');
assert.match(system,/recipe-station-top,[\s\S]*station-detail-body,[\s\S]*npc-content-scroll,[\s\S]*battle-tool-rail \{ overscroll-behavior:contain; \}/,'独立滚动区必须阻止滚动串联');
assert.doesNotMatch(layout,/\.ui-workspace__|\.ui-module-header|\.ui-segmented|\.ui-art-frame|\.ui-stat-(?:grid|chip)/,'共享组件皮肤只能定义在 ui-system.css');
assert.match(layout,/New visual tokens, component skins and state variants belong in ui-system\.css/,'页面布局文件必须明确指向唯一视觉样式入口');
assert.match(game,/workspace-fullpage',immersiveWorkspace\|\|canvasWorkspace/,'沉浸工作区与画布必须统一切换全屏状态');
assert.match(game,/box\.classList\.toggle\('ui-page',rootPage\)/,'页面必须在渲染时挂载统一母版类');
assert.match(game,/state\.campView==='construct'\|\|state\.npcTarget/,'建筑管理整页不得残留地图悬浮按钮');
assert.ok((game.match(/workspaceExit\('/g)||[]).length>=6,'设施、建筑、技能、职业、商店与 NPC 必须复用统一底部退出构造器');
for(const label of ['关闭建筑管理','关闭中枢商店','关闭技能矩阵','关闭职业档案'])assert.ok(game.includes(label),`沉浸工作区缺少明确退出文案：${label}`);
assert.doesNotMatch(game,/关闭建筑操作|退出界面/,'退出按钮不得使用不知道会关闭什么的抽象文案');
assert.doesNotMatch(game,/<span class="cc-icon">(?:DNA|JOB|SKL)<\/span>/,'角色入口必须使用统一 SVG sprite，不能使用文字缩写冒充图标');
assert.match(game,/function uiModuleHeader\(/,'页面标题必须通过统一模块头构造器创建');
for(const cls of ['construction-head','market-head','task-head','settings-head'])assert.match(game,new RegExp(`uiModuleHeader\\([^\n]+${cls}`),`${cls} 必须复用统一模块头而不是自建皮肤`);
assert.match(game,/facility-nav facility-module-head ui-module-header[\s\S]*facility-header-art ui-module-header__mark ui-art-frame/,'设施操作页必须复用统一模块头和建筑插画框');
assert.match(game,/task-overview ui-panel[\s\S]*task-metrics ui-stat-grid/,'任务总览必须复用统一面板和数据格');
assert.match(game,/PRIMARY OBJECTIVE[\s\S]*NEXT ACTION \/\/ 下一步[\s\S]*完成回报/,'任务首页必须先集中展示首要目标、下一步和回报');
assert.match(game,/taskBoardTab\('active','当前行动'[\s\S]*taskBoardTab\('main','主线进度'[\s\S]*taskBoardTab\('archive','调查档案'/,'任务面板必须把当前行动、主线与只读档案分层');
assert.match(layout,/#panel\.tasks-console[\s\S]*\.task-focus[\s\S]*\.task-queue-card[\s\S]*\.task-record-grid/,'任务面板必须拥有首要任务、待办队列与档案的集中布局');
assert.match(system,/\.task-board-nav[\s\S]*\.task-focus[\s\S]*\.task-queue-card[\s\S]*\.task-main-row[\s\S]*\.task-record-card/,'任务指挥台的状态与材质必须由统一视觉系统收口');
assert.match(system,/Material skin convergence[\s\S]*\.task-overview[\s\S]*\.build-card/,'旧页面的实际皮肤必须在统一样式文件中收口');
assert.match(system,/#panel \.facility-upgrade-trigger[\s\S]*\.facility-upgrade-sheet/,'设施升级入口和详情必须由统一样式文件收口');
assert.match(system,/Cinematic battle interface[\s\S]*\.battle-target-hud[\s\S]*\.battle-range-ring[\s\S]*\.battle-command-dock/,'目标锁定、战术准星与指令坞必须由统一样式文件收口');
assert.match(rules,/四层材料关系/,'设计规范必须明确开屏、人物和物品共同使用的材质层级');
assert.match(rules,/怪物立绘与战斗背景[\s\S]*object-fit: contain[\s\S]*禁止通过裁掉或大面积盖住怪物解决/,'设计规范必须明确怪物全身铺满战斗背景且禁止裁切或遮挡');
assert.match(rules,/不能继续向 `style\.css` 增加 `color \/ background \/ border \/ shadow`/,'规范必须阻止业务页面继续创建私有皮肤');
assert.match(html,/style\.css\?v=[^"\s]*workspace3/,'页面布局变更必须刷新浏览器缓存参数');
assert.match(html,/ui-system\.css\?v=[^"\s]*workspace3/,'统一样式变更必须刷新浏览器缓存参数');
assert.match(html,/game\.js\?v=[^"\s]*workspace3/,'页面骨架变更必须刷新浏览器缓存参数');
for(const asset of ['style.css','ui-system.css','game.js'])assert.match(html,new RegExp(asset.replace('.',String.raw`\.`)+String.raw`\?v=[^"\s]*taskboard1`),`任务面板变更必须刷新 ${asset} 缓存参数`);

console.log('ui-system.test.js: all assertions passed');
