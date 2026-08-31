/* ============================================================
   《深渊回响》完整可玩版
   深度流:单世界 × 七层 × 多周目(轮回) × 回响成长
   角色:等级/经验 + 属性(攻距/移距/暴击/暴伤/吸血/闪避/命中/穿透/护盾)
   装备:10槽位(主副武器/五类防具/背部/模组/植入),背包分「装备栏 + 物品栏」
   回响只在死亡→轮回时按加权击杀/伤害/物资结算
   ============================================================ */

/* ================= 物品 ================= */
// slot: weapon/offhand/head/body/hands/legs/feet/back/module/implant ; use: 消耗; mat: 材料; book; key; trophy
const ITEMS = {
  // 材料
  scrap:{name:'废铁',type:'mat',icon:'🔩'}, wood:{name:'木材',type:'mat',icon:'🪵'},
  stone:{name:'石料',type:'mat',icon:'🪨'}, coal:{name:'煤炭',type:'mat',icon:'⬛'},
  copperScrap:{name:'含铜废件',type:'mat',icon:'🟠'}, copperIngot:{name:'铜锭',type:'mat',icon:'🟧'},
  cloth:{name:'布料',type:'mat',icon:'🧵'},
  ingot:{name:'铁锭',type:'mat',icon:'🧯'}, ecomp:{name:'电子元件',type:'mat',icon:'🔋'},
  ration:{name:'营养膏',type:'mat',icon:'🍲'}, riverFish:{name:'冲刷盲鱼',type:'mat',icon:'≈',desc:'冲刷排水渠的独有食材，可在配给站烹成远征鱼汤'}, steel:{name:'钢材',type:'mat',icon:'⚙️'},
  crystal:{name:'晶体',type:'mat',icon:'💎'}, biocore:{name:'生物样本',type:'mat',icon:'🧬'},
  core:{name:'能量核心',type:'mat',icon:'🔆'},
  signalCell:{name:'信标电池',type:'mat',icon:'🔋'},
  ammo:{name:'制式弹药',type:'mat',icon:'▰'},
  weaponCell:{name:'武器能量匣',type:'mat',icon:'◫'},
  // 舰载未来工业与异常文明材料：原料来自高级区域，中间体必须在营地加工
  silica:{name:'高纯硅',type:'mat',icon:'◇'}, titaniumOre:{name:'钛铁矿',type:'mat',icon:'⬢'},
  deuterium:{name:'重氢同位素',type:'mat',icon:'◌'}, phaseCrystal:{name:'相位晶簇',type:'mat',icon:'◈'},
  wafer:{name:'晶圆',type:'mat',icon:'▧'}, carbonComposite:{name:'碳纳米复材',type:'mat',icon:'⌗'},
  titanium:{name:'钛合金',type:'mat',icon:'⬡'}, superconductor:{name:'超导线圈',type:'mat',icon:'◎'},
  fusionCell:{name:'聚变燃料芯',type:'mat',icon:'☼'}, bioMatrix:{name:'仿生基质',type:'mat',icon:'✣'},
  nanites:{name:'纳米机群',type:'mat',icon:'⁙'}, quantumCore:{name:'量子核心',type:'mat',icon:'⌬'},
  programmableMatter:{name:'可编程物质',type:'mat',icon:'▦'}, echoMedium:{name:'回响介质',type:'mat',icon:'∞'},
  // 《远航篇·零号星门》：星际原料与殖民工业中间体
  helium3:{name:'氦-3',type:'mat',icon:'☾'}, iridiumOre:{name:'铱晶矿',type:'mat',icon:'◆'},
  xenoBiomass:{name:'异星活质',type:'mat',icon:'❈'}, voidCrystal:{name:'真空相晶',type:'mat',icon:'◐'},
  starAlloy:{name:'星舰铱合金',type:'mat',icon:'⬟'}, livingComposite:{name:'活体复材',type:'mat',icon:'✤'},
  stellarFuel:{name:'恒星燃料',type:'mat',icon:'✺'}, warpCell:{name:'曲率航迹胞',type:'mat',icon:'◉'},
  // 武器
  crowbar:{name:'撬棍',type:'equip',slot:'weapon',weaponType:'melee',staminaCost:3,atk:3,range:1,icon:'🔧'},
  knife:{name:'铁刀',type:'equip',slot:'weapon',weaponType:'melee',staminaCost:2,atk:7,range:1,crit:5,icon:'🔪'},
  blade:{name:'合金刃',type:'equip',slot:'weapon',weaponType:'melee',staminaCost:3,atk:13,range:1,critDmg:25,icon:'🗡️'},
  eblade:{name:'能量战刃',type:'equip',slot:'weapon',weaponType:'melee',staminaCost:2,atk:21,range:1,pen:15,icon:'⚔️'},
  pistol:{name:'磁轨手枪',type:'equip',slot:'weapon',weaponType:'ranged',ammo:'ammo',ammoCost:1,atk:9,range:4,crit:8,icon:'🔫'},
  rifle:{name:'脉冲步枪',type:'equip',slot:'weapon',weaponType:'ranged',ammo:'ammo',ammoCost:1,atk:16,range:7,critDmg:30,icon:'🎯'},
  sever:{name:'断链者之刃',type:'equip',slot:'weapon',weaponType:'melee',staminaCost:4,atk:28,range:1,exec:true,crit:10,pen:50,icon:'💥'},
  // 副手
  eshieldUnit:{name:'护盾发生器',type:'equip',slot:'offhand',shield:45,icon:'🛡️'},
  // 头
  helmet:{name:'防护头盔',type:'equip',slot:'head',def:4,hp:20,icon:'🪖'},
  scope:{name:'战术目镜',type:'equip',slot:'head',crit:8,hit:5,icon:'🥽'},
  // 胸
  vest:{name:'复合护甲',type:'equip',slot:'body',def:7,icon:'🦺'},
  radSuit:{name:'防辐射服',type:'equip',slot:'body',def:4,imm:'radiation',icon:'☢️'},
  bioSuit:{name:'生化防护服',type:'equip',slot:'body',def:6,imm:'contamination',icon:'🧪'},
  power:{name:'动力装甲',type:'equip',slot:'body',def:13,hp:50,icon:'🤖'},
  warden:{name:'守望核心',type:'equip',slot:'body',def:9,shield:30,icon:'💠'},
  // 腿
  boots:{name:'军用长靴',type:'equip',slot:'feet',move:2,dodge:5,icon:'🥾'},
  magboots:{name:'磁力靴',type:'equip',slot:'feet',move:4,dodge:8,icon:'👟'},
  miningHarness:{name:'采掘外骨骼',type:'equip',slot:'legs',def:3,move:3,icon:'🦾'},
  // 战术模组 / 植入体
  critCore:{name:'暴击核心',type:'equip',slot:'module',crit:10,icon:'🎯'},
  lsChip:{name:'嗜血芯片',type:'equip',slot:'implant',ls:8,icon:'🩸'},
  dodgeMod:{name:'相位稳定器',type:'equip',slot:'module',dodge:8,icon:'🌀'},
  penMod:{name:'穿甲模块',type:'equip',slot:'module',pen:12,icon:'⛏️'},
  neuralFilter:{name:'神经滤波器',type:'equip',slot:'implant',shield:18,imm:'contamination',icon:'🧠'},
  capacitorPack:{name:'高密度电容背架',type:'equip',slot:'back',shield:36,hp:20,icon:'▤'},
  plasmaRifle:{name:'等离子步枪',type:'equip',slot:'weapon',weaponType:'ranged',ammo:'weaponCell',ammoCost:1,atk:32,range:8,pen:24,icon:'⌁'},
  gravLance:{name:'惯性长枪',type:'equip',slot:'weapon',weaponType:'ranged',ammo:'weaponCell',ammoCost:2,atk:46,range:5,pen:42,icon:'↯'},
  swarmRifle:{name:'蜂群智能枪',type:'equip',slot:'weapon',weaponType:'ranged',ammo:'ammo',ammoCost:2,atk:52,range:9,crit:16,hit:12,icon:'⌖'},
  nanoSuit:{name:'纳米再生甲',type:'equip',slot:'body',def:22,hp:90,imm:'contamination',icon:'▥'},
  gravRig:{name:'重力作业背架',type:'equip',slot:'back',def:8,hp:55,move:2,icon:'⌁'},
  phaseShield:{name:'相位护盾',type:'equip',slot:'offhand',def:6,shield:120,dodge:8,icon:'◈'},
  starShell:{name:'星际远征壳层',type:'equip',slot:'body',def:34,hp:160,shield:80,imm:'radiation',icon:'⬡'},
  quantumVisor:{name:'量子预测目镜',type:'equip',slot:'head',crit:18,hit:14,dodge:8,icon:'◎'},
  neuralMesh:{name:'共生神经网',type:'equip',slot:'implant',shield:42,crit:10,dodge:12,icon:'⌘'},
  echoMemory:{name:'回响记忆模组',type:'equip',slot:'module',critDmg:45,pen:20,shield:24,icon:'∞'},
  timeLagModule:{name:'时滞场模组',type:'equip',slot:'module',dodge:18,crit:14,hit:10,icon:'◴'},
  vacuumCarbine:{name:'真空磁束卡宾枪',type:'equip',slot:'weapon',weaponType:'ranged',ammo:'weaponCell',ammoCost:2,atk:68,range:10,pen:48,hit:18,icon:'⌁'},
  xenoFilter:{name:'异星生态滤膜',type:'equip',slot:'implant',shield:55,dodge:10,imm:'xeno',icon:'✥'},
  exoShell:{name:'自适应登陆壳',type:'equip',slot:'body',def:52,hp:260,shield:130,imm:'vacuum',icon:'⬢'},
  // 消耗
  potion:{name:'体力药剂',type:'use',stamina:30,icon:'🧪'}, medkit:{name:'急救包',type:'use',hp:30,icon:'🩹'},
  nanoMedkit:{name:'纳米修复剂',type:'use',hp:110,icon:'✚'},
  serum:{name:'抗感染血清',type:'use',cure:'infection',icon:'💉'}, emp:{name:'电磁干扰器',type:'use',emp:true,icon:'📡'},
  accessCard:{name:'指挥权限卡',type:'key',icon:'🪪'},
  plasmaCutter:{name:'工业等离子切割器',type:'key',icon:'✂',desc:'切开坠毁钢索、变形舱门与矿井支撑梁'},
  maintenanceKey:{name:'三棱维护钥匙',type:'key',icon:'⌑',desc:'旧式地表塔与维修中转舱使用的机械钥匙'},
  civilPass:{name:'生活区门禁卡',type:'key',icon:'▥',desc:'通过方舟民用舱段与生活区外门'},
  depthLamp:{name:'深层探照灯',type:'key',icon:'◉',desc:'穿透船底粉尘与菌雾的高功率矿灯'},
  sporeSeal:{name:'菌幕通行胶囊',type:'key',icon:'✣',desc:'陈博士制作的一次校准式生物隔离凭证'},
  signalCipher:{name:'遗迹解码楔',type:'key',icon:'⌬',desc:'把回声信号转换为遗迹门锁可识别的序列'},
  reclassCore:{name:'职业重构核心',type:'key',icon:'✧'},
  arkBand:{name:'方舟手环',type:'key',icon:'◫',desc:'接入生命状态与四项个人终端'},
  builderGun:{name:'模块建造枪',type:'key',icon:'⌁',desc:'将材料打印为营地设施模块'},
  fieldMap:{name:'折叠小地图',type:'key',icon:'◇',desc:'记录方舟营地与已测绘路线'},
  shipFrame:{name:'远征舰承力框架',type:'key',icon:'▱',desc:'星舰船坞打印的舰体主框架'},
  fusionDrive:{name:'聚变推进脊',type:'key',icon:'☼',desc:'承担近轨与行星际航行的主推进组件'},
  inertialHull:{name:'惯性航行壳',type:'key',icon:'⬡',desc:'抵消加速与着陆冲击的场约束外壳'},
  arkHabitat:{name:'闭环生态舱',type:'key',icon:'✣',desc:'远航时维持空气、食物与医疗循环'},
  navComputer:{name:'深空导航核心',type:'key',icon:'⌘',desc:'把回响星图转换成可以执行的航线'},
  orbitalLance:{name:'轨道压制权限',type:'key',icon:'↯',desc:'每场行星首领战可调用一次轨道火力'},
  gateKey:{name:'零号星门密钥',type:'key',icon:'⌬',desc:'开启后续星域与资料片入口的先驱密钥'},
  // 书
  pierceBook:{name:'破甲技能书',type:'book',skill:'pierce',icon:'📘'}, heavyBook:{name:'重斩技能书',type:'book',skill:'heavy',icon:'📕'},
  // 结局奖杯
  beacon:{name:'真相信标',type:'trophy',icon:'🏳️'}, starchart:{name:'星图残卷',type:'trophy',icon:'🗺️'}, echoHeart:{name:'回响之心',type:'trophy',icon:'❤️‍🔥'},
};
const MATS = ['scrap','wood','stone','coal','copperScrap','ingot','copperIngot','steel','cloth','ecomp','ration','riverFish','crystal','biocore','core','signalCell','ammo','weaponCell',
  'silica','titaniumOre','deuterium','phaseCrystal','wafer','carbonComposite','titanium','superconductor','fusionCell','bioMatrix','nanites','quantumCore','programmableMatter','echoMedium',
  'helium3','iridiumOre','xenoBiomass','voidCrystal','starAlloy','livingComposite','stellarFuel','warpCell'];
const SLOTS = [['head','头部'],['body','胸甲'],['hands','手部'],['legs','腿甲'],['feet','足部'],
  ['back','背部'],['implant','植入'],['module','模组'],['offhand','副手'],['weapon','主武器']];

/* ================= 技能 ================= */
const SKILLS = {
  pierce:{name:'破甲射击',type:'active',cost:2,shots:1,kind:'ranged',desc:'消耗当前枪械弹药，穿透目标 50% 护甲',effect:'pierce'},
  heavy:{name:'重斩',type:'active',cost:3,kind:'melee',desc:'近身造成 1.8 倍伤害',effect:'heavy'},
  pulseBurst:{name:'脉冲连射',type:'active',cost:4,shots:2,kind:'ranged',desc:'消耗双倍枪械弹药，造成 1.55 倍伤害',effect:'burst',career:'vanguard',careerLevel:1},
  combatRhythm:{name:'战斗节律',type:'passive',desc:'攻击 +6%，暴击 +3%',career:'vanguard',careerLevel:3,bonus:{atkPct:6,crit:3}},
  kineticBrace:{name:'动能架势',type:'active',cost:3,kind:'any',desc:'造成伤害并恢复 20% 最大护盾',effect:'brace',career:'bulwark',careerLevel:1},
  reactiveArmor:{name:'反应装甲',type:'passive',desc:'防御 +8%，护盾上限 +15',career:'bulwark',careerLevel:3,bonus:{defPct:8,shield:15}},
  phaseStrike:{name:'相位突袭',type:'active',cost:5,kind:'any',desc:'无视护甲并造成 1.4 倍伤害',effect:'phase',career:'infiltrator',careerLevel:1},
  weakpointModel:{name:'弱点演算',type:'passive',desc:'暴击伤害 +24%，穿透 +8%',career:'infiltrator',careerLevel:3,bonus:{critDmg:24,pen:8}},
  salvageSense:{name:'残骸直觉',type:'passive',desc:'野外采集产量 +12%',career:'salvager',careerLevel:1,bonus:{gatherPct:12}},
  fieldSorting:{name:'现场分拣',type:'passive',desc:'拆解回收产量 +20%',career:'salvager',careerLevel:3,bonus:{recyclePct:20}},
  precisionFab:{name:'精密制造',type:'passive',desc:'制作时有 12% 概率返还材料',career:'fabricator',careerLevel:1,bonus:{craftSavePct:12}},
  thermalControl:{name:'热场控制',type:'passive',desc:'熔炼产量 +15%',career:'fabricator',careerLevel:3,bonus:{smeltPct:15}},
  bioCycle:{name:'生态循环',type:'passive',desc:'菌圃收获 +20%',career:'biologist',careerLevel:1,bonus:{gardenPct:20}},
  adaptiveCulture:{name:'适应性培养',type:'passive',desc:'生物材料采集 +18%',career:'biologist',careerLevel:3,bonus:{bioGatherPct:18}},
};

/* ================= 精通(纯物资升级 · 无上限) ================= */
const MASTERIES = {
  gatherMastery:  {name:'采集精通', stat:'gatherPct',    perLv:10, route:'prod', npc:'老乔',  desc:'采集产量 +{v}%'},
  mineMastery:    {name:'挖矿精通', stat:'minePct',      perLv:10, route:'prod', npc:'老周',  desc:'矿产获取 +{v}%'},
  recycleMastery: {name:'拆解精通', stat:'recyclePct',   perLv:10, route:'prod', npc:'老周',  desc:'拆解产量 +{v}%'},
  craftMastery:   {name:'制造精通', stat:'craftSavePct', perLv:10, route:'prod', npc:'阿珍',  desc:'材料返还 +{v}%'},
  gardenMastery:  {name:'培育精通', stat:'gardenPct',    perLv:10, route:'prod', npc:'陈嫂',  desc:'菌圃收获 +{v}%'},
  attackMastery:  {name:'攻击精通', stat:'atk',          perLv:1,  route:'combat',npc:'哈里斯',desc:'攻击力 +{v}'},
  defenseMastery: {name:'防御精通', stat:'def',          perLv:1,  route:'combat',npc:'小唐',  desc:'防御力 +{v}'},
  critMastery:    {name:'暴击精通', stat:'crit',         perLv:1,  route:'combat',npc:'哈里斯',desc:'暴击率 +{v}%'},
  critDmgMastery: {name:'暴伤精通', stat:'critDmg',      perLv:10, route:'combat',npc:'哈里斯',desc:'暴击伤害 +{v}%'},
  speedMastery:   {name:'速度精通', stat:'spd',          perLv:1,  route:'combat',npc:'阿勇',  desc:'速度 +{v}'},
  staminaMastery: {name:'耐力精通', stat:'stMax',        perLv:1,  route:'surv',  npc:'阿勇',  desc:'体力上限 +{v}'},
  shieldMastery:  {name:'护盾精通', stat:'shield',       perLv:1,  route:'surv',  npc:'小唐',  desc:'护盾上限 +{v}'},
};
const MASTERY_ROUTES = {
  combat:[ // 战斗系
    {lo:1,hi:10,mat:{scrap:1},     scale:(lv)=>2+Math.floor((lv-1)/2)},
    {lo:11,hi:20,mat:{ingot:1},    scale:(lv)=>2+Math.floor((lv-11)/2)},
    {lo:21,hi:30,mat:{steel:1},    scale:(lv)=>2+Math.floor((lv-21)/2)},
    {lo:31,hi:40,mat:{ecomp:1},    scale:(lv)=>2+Math.floor((lv-31)/2)},
    {lo:41,hi:50,mat:{core:1},     scale:(lv)=>1+Math.floor((lv-41)/3)},
    {lo:51,hi:60,mat:{crystal:1},  scale:(lv)=>1+Math.floor((lv-51)/3)},
    {lo:61,hi:80,mat:{crystal:2,core:1},scale:()=>1},
    {lo:81,hi:90,mat:{crystal:3,core:2},scale:()=>1},
    {lo:91,hi:99,mat:{crystal:4,core:3},scale:()=>1},
    {lo:100,hi:9999,mat:{crystal:1},scale:(lv)=>5+Math.floor((lv-100)/10)},
  ],
  prod:[ // 生产系
    {lo:1,hi:10,mat:{scrap:1},     scale:(lv)=>2+Math.floor((lv-1)/2)},
    {lo:11,hi:20,mat:{cloth:1},    scale:(lv)=>2+Math.floor((lv-11)/2)},
    {lo:21,hi:30,mat:{ration:1},   scale:(lv)=>2+Math.floor((lv-21)/2)},
    {lo:31,hi:40,mat:{ingot:1},    scale:(lv)=>2+Math.floor((lv-31)/2)},
    {lo:41,hi:50,mat:{biocore:1},  scale:(lv)=>2+Math.floor((lv-41)/2)},
    {lo:51,hi:60,mat:{steel:1},    scale:(lv)=>1+Math.floor((lv-51)/3)},
    {lo:61,hi:80,mat:{crystal:1,biocore:1},scale:()=>1},
    {lo:81,hi:90,mat:{crystal:2,biocore:2},scale:()=>1},
    {lo:91,hi:99,mat:{crystal:3,biocore:3},scale:()=>1},
    {lo:100,hi:9999,mat:{crystal:1},scale:(lv)=>5+Math.floor((lv-100)/10)},
  ],
  surv:[ // 生存系
    {lo:1,hi:10,mat:{cloth:1},     scale:(lv)=>2+Math.floor((lv-1)/2)},
    {lo:11,hi:20,mat:{ration:1},   scale:(lv)=>2+Math.floor((lv-11)/2)},
    {lo:21,hi:30,mat:{ingot:1},    scale:(lv)=>2+Math.floor((lv-21)/2)},
    {lo:31,hi:40,mat:{steel:1},    scale:(lv)=>2+Math.floor((lv-31)/2)},
    {lo:41,hi:50,mat:{ecomp:1},    scale:(lv)=>2+Math.floor((lv-41)/2)},
    {lo:51,hi:60,mat:{core:1},     scale:(lv)=>1+Math.floor((lv-51)/3)},
    {lo:61,hi:80,mat:{crystal:1,core:1},scale:()=>1},
    {lo:81,hi:90,mat:{crystal:2,core:2},scale:()=>1},
    {lo:91,hi:99,mat:{crystal:3,core:3},scale:()=>1},
    {lo:100,hi:9999,mat:{crystal:1},scale:(lv)=>5+Math.floor((lv-100)/10)},
  ],
};
function masteryLv(k){ return state.masteries&&state.masteries[k]||0; }
function masteryBonus(stat){ let n=0; for(const k in MASTERIES){const m=MASTERIES[k]; if(m.stat===stat) n+=m.perLv*masteryLv(k);} return n; }
function masteryCost(k){ const lv=masteryLv(k); const next=lv+1; const m=MASTERIES[k]; const route=MASTERY_ROUTES[m.route];
  const tier=route.find(t=>next>=t.lo&&next<=t.hi); if(!tier)return {}; const mult=tier.scale(next); const cost={};
  for(const mat in tier.mat) cost[mat]=tier.mat[mat]*mult; return cost; }
const NPC_TEACH = {
  '老乔': ['gatherMastery'],
  '老周': ['mineMastery','recycleMastery'],
  '阿珍': ['craftMastery'],
  '陈嫂': ['gardenMastery'],
  '哈里斯':['attackMastery','critMastery','critDmgMastery'],
  '小唐': ['defenseMastery','shieldMastery'],
  '阿勇': ['speedMastery','staminaMastery'],
};
function upgradeMastery(k){ const cost=masteryCost(k); for(const[mat,n] of Object.entries(cost)){if((state.inv[mat]||0)<n){log('材料不足,需要 '+Object.entries(cost).map(([m,v])=>ITEMS[m].name+'×'+v).join(' ')+'。','warn');return;}}
  for(const[mat,n] of Object.entries(cost)) state.inv[mat]-=n; state.masteries[k]++; log('✦ '+MASTERIES[k].name+' 升至 Lv'+state.masteries[k]+'!','good'); divider(); render(); }

/* ================= 配方(按工位) ================= */
const RECIPES = {
  knife:{st:'work',cost:{ingot:2},out:'knife'}, blade:{st:'work',cost:{ingot:2,steel:1},out:'blade'},
  eblade:{st:'work',cost:{steel:2,core:1},out:'eblade'}, pistol:{st:'work',cost:{ingot:3,ecomp:2},out:'pistol'},
  rifle:{st:'work',cost:{steel:3,ecomp:3},out:'rifle'}, ammo:{st:'work',cost:{ingot:1,copperScrap:1},out:'ammo',yield:10},
  helmet:{st:'armor',cost:{ingot:2,cloth:3},out:'helmet'}, vest:{st:'armor',cost:{cloth:6},out:'vest'},
  radSuit:{st:'armor',cost:{cloth:5,ingot:2},out:'radSuit'}, bioSuit:{st:'armor',cost:{cloth:6,biocore:3},out:'bioSuit'},
  power:{st:'armor',cost:{steel:3,core:2},out:'power'}, boots:{st:'armor',cost:{cloth:4,ingot:2},out:'boots'},
  magboots:{st:'armor',cost:{steel:2,ecomp:2},out:'magboots'},
  potion:{st:'chem',cost:{ration:2},out:'potion'}, medkit:{st:'chem',cost:{cloth:2,ration:1},out:'medkit'}, serum:{st:'chem',cost:{biocore:2,ration:1},out:'serum'},
  emp:{st:'elec',cost:{ecomp:3,steel:2},out:'emp'},
  eshieldUnit:{st:'elec',cost:{steel:2,core:1,ecomp:2},out:'eshieldUnit'}, scope:{st:'elec',cost:{ecomp:3,crystal:1},out:'scope'},
  critCore:{st:'elec',cost:{ecomp:2,crystal:2},out:'critCore'}, lsChip:{st:'elec',cost:{ecomp:2,biocore:2},out:'lsChip'},
  dodgeMod:{st:'elec',cost:{ecomp:3,crystal:1},out:'dodgeMod'}, penMod:{st:'elec',cost:{steel:2,crystal:2},out:'penMod'},
  signalCell:{st:'elec',cost:{ecomp:2,crystal:1},out:'signalCell'},
  pierceBook:{st:'data',cost:{ecomp:3,ration:2},out:'pierceBook'}, heavyBook:{st:'data',cost:{steel:2,ration:2},out:'heavyBook'},
  miningHarness:{st:'work',cost:{ingot:3,copperIngot:2,cloth:2},out:'miningHarness',blueprint:'bp_miningHarness'},
  neuralFilter:{st:'elec',cost:{biocore:3,crystal:2,ecomp:3},out:'neuralFilter',blueprint:'bp_neuralFilter'},
  wafer:{st:'elec',cost:{silica:3,copperIngot:1,coal:1},out:'wafer'},
  carbonComposite:{st:'work',cost:{coal:3,cloth:2,biocore:1},out:'carbonComposite'},
  capacitorPack:{st:'elec',cost:{copperIngot:3,ecomp:3,crystal:1},out:'capacitorPack'},
  superconductor:{st:'elec',cost:{copperIngot:2,crystal:2,deuterium:1},out:'superconductor'},
  fusionCell:{st:'energy',cost:{deuterium:2,superconductor:1,titanium:1},out:'fusionCell'},
  bioMatrix:{st:'bio',cost:{biocore:3,ration:2},out:'bioMatrix'},
  nanoMedkit:{st:'bio',cost:{nanites:1,bioMatrix:1,ration:1},out:'nanoMedkit'},
  neuralMesh:{st:'bio',cost:{nanites:2,bioMatrix:2,quantumCore:1},out:'neuralMesh'},
  printedParts:{st:'printer',cost:{titanium:1,wafer:1},out:'ecomp',yield:2},
  nanites:{st:'printer',cost:{wafer:2,ecomp:2,biocore:2},out:'nanites'},
  programmableMatter:{st:'printer',cost:{nanites:2,titanium:1,phaseCrystal:1},out:'programmableMatter'},
  quantumCore:{st:'data',cost:{wafer:2,superconductor:2,phaseCrystal:1,core:1},out:'quantumCore'},
  echoMedium:{st:'echo',cost:{phaseCrystal:2,core:1,deuterium:1},out:'echoMedium'},
  echoMemory:{st:'echo',cost:{echoMedium:2,quantumCore:1,phaseCrystal:2},out:'echoMemory'},
  timeLagModule:{st:'echo',cost:{echoMedium:3,quantumCore:2,programmableMatter:1},out:'timeLagModule'},
  plasmaRifle:{st:'energy',cost:{titanium:2,fusionCell:2,ecomp:4},out:'plasmaRifle'},
  weaponCell:{st:'energy',cost:{fusionCell:1,ecomp:2},out:'weaponCell',yield:8},
  gravLance:{st:'field',cost:{titanium:3,superconductor:2,quantumCore:1},out:'gravLance'},
  swarmRifle:{st:'drone',cost:{nanites:2,quantumCore:2,titanium:2},out:'swarmRifle'},
  nanoSuit:{st:'bio',cost:{nanites:3,bioMatrix:2,superconductor:1},out:'nanoSuit'},
  gravRig:{st:'field',cost:{titanium:3,superconductor:2,fusionCell:2},out:'gravRig'},
  phaseShield:{st:'field',cost:{superconductor:2,phaseCrystal:2,quantumCore:1},out:'phaseShield'},
  starShell:{st:'field',cost:{programmableMatter:3,echoMedium:2,quantumCore:2},out:'starShell'},
  quantumVisor:{st:'data',cost:{quantumCore:1,nanites:1,phaseCrystal:2},out:'quantumVisor'},
  shipFrame:{st:'ship',level:1,cost:{programmableMatter:6,titanium:8,superconductor:4},out:'shipFrame'},
  fusionDrive:{st:'energy',level:6,cost:{fusionCell:6,superconductor:5,programmableMatter:2},out:'fusionDrive'},
  inertialHull:{st:'field',level:4,cost:{titanium:8,programmableMatter:4,carbonComposite:4},out:'inertialHull'},
  arkHabitat:{st:'bio',level:4,cost:{bioMatrix:6,programmableMatter:3,fusionCell:2},out:'arkHabitat'},
  navComputer:{st:'data',level:5,cost:{quantumCore:4,echoMedium:3,wafer:8},out:'navComputer'},
  stellarFuel:{st:'energy',level:6,cost:{helium3:3,fusionCell:1,superconductor:1},out:'stellarFuel'},
  livingComposite:{st:'printer',level:3,cost:{xenoBiomass:3,bioMatrix:2,nanites:1},out:'livingComposite'},
  warpCell:{st:'energy',level:6,cost:{voidCrystal:2,echoMedium:2,quantumCore:1,stellarFuel:1},out:'warpCell'},
  vacuumCarbine:{st:'field',level:4,cost:{starAlloy:3,fusionCell:2,quantumCore:1},out:'vacuumCarbine'},
  xenoFilter:{st:'bio',level:4,cost:{livingComposite:2,bioMatrix:2,nanites:2},out:'xenoFilter'},
  exoShell:{st:'field',level:4,cost:{starAlloy:4,livingComposite:3,warpCell:1},out:'exoShell'},
  orbitalLance:{st:'ship',level:2,cost:{starAlloy:5,warpCell:2,quantumCore:3},out:'orbitalLance'},
};

/* ================= 敌人 ================= */
const ENEMIES = {
  cleaner:{name:'清洁机器人',hp:20,atk:6,def:2,spd:3,dist:2,range:1,threat:6,drops:{scrap:[1,2]}},
  rat:{name:'变异鼠',hp:16,atk:7,def:1,spd:6,dist:2,range:1,threat:5,drops:{ration:[1,1],cloth:[0,1]}},
  beast:{name:'变异兽',hp:42,atk:12,def:4,spd:4,dist:3,range:1,threat:14,drops:{cloth:[1,2],ration:[1,2]}},
  burrower:{name:'裂谷掘兽',hp:52,atk:14,def:5,spd:4,dist:3,range:1,threat:18,drops:{coal:[1,3],stone:[1,2]}},
  sporeling:{name:'菌壳寄生体',hp:66,atk:17,def:6,spd:3,dist:4,range:3,threat:23,infect:true,drops:{biocore:[1,2],crystal:[0,1]}},
  echoBeast:{name:'回声畸兽',hp:105,atk:24,def:9,spd:5,dist:5,range:2,threat:38,drops:{crystal:[1,3],biocore:[1,2]}},
  radSpider:{name:'辐射蛛',hp:60,atk:16,def:6,spd:5,dist:3,range:1,threat:20,drops:{ecomp:[1,2],crystal:[1,1]}},
  exp:{name:'实验体',hp:55,atk:15,def:5,spd:5,dist:3,range:1,threat:20,infect:true,drops:{biocore:[1,2]}},
  turret:{name:'自动炮塔',hp:70,atk:20,def:8,spd:2,dist:6,range:6,threat:26,mech:true,drops:{ecomp:[1,2],steel:[1,2]}},
  warbot:{name:'军用机器人',hp:90,atk:22,def:9,spd:4,dist:4,range:1,threat:32,mech:true,drops:{core:[1,1],steel:[2,3]}},
  guardian:{name:'守望者守卫',hp:220,atk:30,def:12,spd:6,dist:5,range:2,threat:120,boss:true,mech:true,drops:{core:[2,3],crystal:[2,2]}},
  scrapDrone:{name:'轨道拆解蜂',hp:260,atk:36,def:18,spd:8,dist:6,range:5,threat:145,mech:true,drops:{titanium:[1,2],wafer:[1,2],core:[0,1]}},
  vacuumInterceptor:{name:'真空截击机',hp:330,atk:44,def:22,spd:10,dist:8,range:7,threat:180,mech:true,drops:{titanium:[1,2],superconductor:[0,1]}},
  relayCorsair:{name:'中继劫持体',hp:720,atk:54,def:30,spd:9,dist:8,range:7,threat:420,boss:true,mech:true,armorSegments:3,damageCapPct:.25,bossFlag:'orbitalRelaySecured',record:'orbitalRelay',reveal:'regolithSea',drops:{quantumCore:[1,2],programmableMatter:[1,2]}},
  lunarCrawler:{name:'月壤磁爬兽',hp:380,atk:52,def:38,spd:4,dist:5,range:2,threat:210,drops:{helium3:[1,2],iridiumOre:[1,2]}},
  massDriverAI:{name:'质量投射主脑',hp:920,atk:66,def:42,spd:7,dist:9,range:9,threat:560,boss:true,mech:true,bombardEvery:3,bombardDamage:22,bossFlag:'massDriverSilenced',record:'heliumArchive',drops:{iridiumOre:[3,5],helium3:[2,4]}},
  xenoStalker:{name:'异星伏猎体',hp:520,atk:72,def:30,spd:12,dist:6,range:2,threat:270,infect:true,drops:{xenoBiomass:[1,3],biocore:[1,2]}},
  livingBulwark:{name:'活体壁垒',hp:760,atk:64,def:58,spd:4,dist:5,range:3,threat:340,infect:true,drops:{xenoBiomass:[2,4],livingComposite:[0,1]}},
  planetaryCrown:{name:'行星冠体',hp:1380,atk:82,def:54,spd:8,dist:7,range:4,threat:780,boss:true,regenPct:.04,bossFlag:'verdantResolved',record:'monolithCoordinates',drops:{xenoBiomass:[5,8],voidCrystal:[1,1]}},
  phaseSentinel:{name:'相位哨兵',hp:880,atk:88,def:62,spd:10,dist:8,range:6,threat:430,mech:true,drops:{voidCrystal:[1,3],echoMedium:[1,2]}},
  gateCustodian:{name:'星门监护者',hp:1900,atk:105,def:72,spd:11,dist:9,range:8,threat:1100,boss:true,mech:true,armorSegments:4,damageCapPct:.2,staminaDrainEvery:4,staminaDrain:8,bossFlag:'gateGuardianDown',grant:'gateKey',drops:{voidCrystal:[4,7],warpCell:[1,2]}},
  outpostRaid:{name:'星际反扑编队',hp:680,atk:58,def:32,spd:8,dist:7,range:6,threat:360,boss:true,mech:true,outpostRaid:true,drops:{starAlloy:[1,1],fusionCell:[1,2]}},
};

/* ================= 区域地图 ================= */
const LOCATIONS = {
  camp:{name:'中央营地',zone:'营地',profile:'camp',icon:'⌂',safe:true,desc:'幸存者控制的中央生活舱。三条探索前线都从这里出发。'},
  outer:{name:'坠毁带入口',zone:'地表',profile:'wild',icon:'◈',desc:'气闸外散落着船壳和货柜。老乔的旧地图只标出了入口与他自己的营地，其余路线需要重新测绘。',enemies:['cleaner','rat'],loot:{scrap:.72,wood:.38,stone:.38,cloth:.18}},
  joeCamp:{name:'老乔营地',zone:'地表',profile:'wild',icon:'⌂',safe:true,desc:'老乔所在的前哨大营地。这里是引导地图上唯一可靠的地表坐标，也是一处安全落脚点。',enemies:[],loot:{wood:.38,ration:.24,scrap:.2}},
  cargoYard:{name:'货柜坟场',zone:'地表',profile:'wild',icon:'▦',resourceSite:{label:'残骸回收点',yield:['scrap','ecomp']},desc:'成排货柜被冲击波拧成钢铁迷宫。这里能稳定拆出废铁与电子件，也埋着一台损坏的工业切割器。',enemies:['cleaner','rat'],loot:{scrap:.82,ecomp:.48,cloth:.22}},
  blackwood:{name:'黑木林',zone:'地表',profile:'wild',icon:'♣',desc:'木质菌株在冲击坑边缘疯长，林下遍布大型生物足迹。',enemies:['rat','beast'],loot:{wood:.78,stone:.2,cloth:.25,ration:.2}},
  ridge:{name:'断舰岩脊',zone:'地表',profile:'mine',icon:'△',desc:'从高处能看见整艘方舟的断裂走向，岩缝间卡着电缆与矿石。',enemies:['cleaner','beast'],loot:{stone:.72,copperScrap:.48,scrap:.35}},
  silicaField:{name:'熔玻原',zone:'隐秘',profile:'mine',icon:'◇',needTech:'auto_2',resourceSite:{label:'高纯硅采集带',yield:['silica','crystal']},desc:'撞击热把整片含硅地层熔成黑色玻原。光学扫描能从杂质光谱中定位可用于微电子制程的高纯硅。',enemies:['radSpider','burrower'],loot:{silica:.78,crystal:.42,stone:.25}},
  floodChannel:{name:'冲刷排水渠',zone:'地表',profile:'wild',icon:'≈',resourceSite:{label:'漂积物采集点',yield:['wood','stone','cloth']},desc:'撞击坑的雨水把林木、布料和碎石都冲进旧排水渠，兽群也沿着渠底往返裂谷。',enemies:['rat','burrower'],loot:{wood:.58,stone:.62,cloth:.42,scrap:.24}},
  relayTower:{name:'断波塔',zone:'地表',profile:'facility',icon:'⌁',desc:'旧世界中继塔被方舟船壳削去一半。三棱机械锁还能转动，顶端终端也许保存着生活区门禁。',enemies:['cleaner'],loot:{ecomp:.68,scrap:.35,copperScrap:.28}},
  coalRift:{name:'碳脉裂谷',zone:'地表',profile:'mine',icon:'⬡',desc:'撞击暴露了浅层碳脉，也震开了通往船底维修井的兽穴。',enemies:['burrower','beast'],loot:{coal:.78,stone:.36,copperScrap:.25}},
  oldMine:{name:'旧世界矿井',zone:'隐藏',profile:'mine',icon:'⛏',hiddenBy:'mineEntrance',desc:'被断舰压住的旧矿井。矿工阿拓和一台损坏的采掘机被困在最深处。',enemies:['burrower'],loot:{coal:.7,stone:.62,copperScrap:.55,ingot:.18}},
  titaniumMine:{name:'白钛深脉',zone:'隐秘',profile:'mine',icon:'⬢',needItem:'miningHarness',resourceSite:{label:'钛铁矿脉',yield:['titaniumOre','coal']},desc:'旧矿井最深处露出一条被撞击剪切开的白色矿脉。普通工具无法稳定开采，必须依靠采掘外骨骼固定岩层。',enemies:['burrower','echoBeast'],loot:{titaniumOre:.76,coal:.45,stone:.28}},
  layer2:{name:'生活区',zone:'船内',profile:'facility',icon:'▤',desc:'半淹没的居住舱仍有幸存者求救，积水掩盖了更深的通道。',flooded:true,enemies:['rat','beast'],loot:{cloth:.5,ecomp:.3,ration:.55}},
  freightHub:{name:'货运中转舱',zone:'船内',profile:'facility',icon:'▥',resourceSite:{label:'舰内物资节点',yield:['scrap','ecomp','ration']},desc:'生活区外侧的自动货运站。维护锁后还堆着未分拣补给，传送轨一直通向工程区。',enemies:['cleaner','rat'],loot:{scrap:.58,ecomp:.62,ration:.42,cloth:.3}},
  sealedCabin:{name:'封存导航舱',zone:'隐藏',profile:'archive',icon:'▣',hiddenBy:'sealedDoorFound',needCard:true,desc:'导航班在坠毁前封存的离线档案舱。门禁记录和主系统保存的版本并不一致。',enemies:['cleaner'],loot:{ecomp:.62,crystal:.28,scrap:.35}},
  layer3:{name:'工程区',zone:'船内',profile:'facility',icon:'⚙',desc:'反应堆冷却环破裂，辐射和高温封住了主通道。',radiation:true,enemies:['radSpider'],loot:{ingot:.42,crystal:.25,ecomp:.45}},
  coolingGallery:{name:'冷却管廊',zone:'船内',profile:'facility',icon:'≋',desc:'热变形舱门后是主冷却管廊。切开封死的隔板，才能抵达实验室升降机。',radiation:true,enemies:['radSpider','cleaner'],loot:{ecomp:.5,copperScrap:.42,ingot:.3}},
  cryoVault:{name:'零度储备舱',zone:'隐秘',profile:'facility',icon:'◌',needTech:'auto_2',needItem:'radSuit',radiation:true,resourceSite:{label:'同位素储备',yield:['deuterium','ecomp']},desc:'冷却管廊背后的低温燃料仓仍保持真空。光学扫描与防辐射服能标出安全回收路径，舱内保存着冻结的重氢同位素。',enemies:['radSpider','turret'],loot:{deuterium:.72,ecomp:.48,crystal:.25}},
  layer4:{name:'实验室',zone:'船内',profile:'lab',icon:'⌬',desc:'培养仓破裂，绿色培养液与实验体占据了实验层。',contamination:true,enemies:['exp','sporeling'],loot:{biocore:.62,crystal:.32,ration:.28}},
  nursery:{name:'隔离培养室',zone:'隐藏',profile:'lab',icon:'✣',hiddenBy:'nurseryFound',desc:'从正式平面图中抹除的培养室。纪遥保存着未经科技委员会登记的原型设计。',contamination:true,enemies:['exp','sporeling'],loot:{biocore:.7,crystal:.48,ecomp:.35}},
  layer5:{name:'军事区',zone:'船内',profile:'facility',icon:'◇',desc:'自动炮塔仍在执行封锁协议，失联巡逻队的信号停在这里。',enemies:['turret','warbot'],loot:{steel:.52,ecomp:.5,core:.38}},
  droneHangar:{name:'自律机库',zone:'隐秘',profile:'facility',icon:'⌁',needTech:'auto_3',resourceSite:{label:'无人机构件库',yield:['ecomp','core','titaniumOre']},desc:'军事区侧翼封存着一支失去指挥链的工程无人机群。恢复授权后，可取得自治固件和高强度机体材料。',enemies:['turret','warbot'],loot:{ecomp:.68,core:.42,titaniumOre:.38,steel:.4}},
  layer6:{name:'指挥区',zone:'船内',profile:'archive',icon:'⌘',desc:'舰桥保存着坠毁前最后七十二小时的记录。',needCard:true,enemies:[],loot:{ecomp:.48,crystal:.4}},
  layer7:{name:'核心舱',zone:'船内',profile:'archive',icon:'◉',desc:'守望者与方舟能源核心都在这里等待最后的答案。',enemies:['guardian'],loot:{core:.55,crystal:.5}},
  underworks:{name:'船底维修井',zone:'地下',profile:'mine',icon:'⌑',resourceSite:{label:'深层采掘节点',yield:['coal','copperScrap','ecomp']},desc:'裂谷与方舟船底共用的巨大维修井。粉尘遮住所有标识，稳定矿层和废弃机械都集中在井壁平台。',enemies:['burrower','cleaner'],loot:{coal:.7,copperScrap:.52,ecomp:.38,stone:.32}},
  fungal:{name:'菌光谷',zone:'地下',profile:'depth',icon:'✦',desc:'裂谷下方的发光菌群会复述无线电里的句子，像某种记忆。',contamination:true,enemies:['sporeling','exp'],loot:{biocore:.55,crystal:.48,coal:.2}},
  sporeTunnel:{name:'孢子洞廊',zone:'地下',profile:'depth',icon:'✣',resourceSite:{label:'菌质培养点',yield:['biocore','crystal']},desc:'活体菌幕在狭长洞廊内周期性闭合。通过后能稳定采到菌质与晶体，但必须先完成生物隔离校准。',contamination:true,enemies:['sporeling','exp'],loot:{biocore:.72,crystal:.58,coal:.18}},
  abyss:{name:'回声深井',zone:'地下',profile:'depth',icon:'◎',desc:'规律脉冲从井底传来，频率与方舟坠毁前收到的信号一致。',enemies:['echoBeast','sporeling'],loot:{crystal:.68,biocore:.42,core:.18}},
  phaseGrove:{name:'相位晶林',zone:'隐秘',profile:'depth',icon:'◈',needTech:'echo_1',contamination:true,resourceSite:{label:'相位晶簇生长区',yield:['phaseCrystal','crystal']},desc:'深井侧壁后的晶体并不始终存在。异常频谱扫描能在它们与现实重合时标出一条可重复进入的路径。',enemies:['echoBeast','sporeling'],loot:{phaseCrystal:.74,crystal:.62,biocore:.22}},
  ruinVestibule:{name:'遗迹门厅',zone:'地下',profile:'archive',icon:'⌬',desc:'深井底部的人造门厅。古老门锁不认方舟权限，只响应中继器还原出的信号序列。',enemies:['echoBeast'],loot:{crystal:.58,ecomp:.38,core:.22}},
  signal:{name:'地下信号源',zone:'地下',profile:'archive',icon:'◌',desc:'这里并非天然洞穴，而是一座比方舟更古老的幸存者信标。',enemies:['echoBeast'],loot:{crystal:.62,core:.35}},

  // 远航篇：星球之间不接入 MAP_LINKS，跨区域只能通过 SPACE_ROUTES 航行。
  orbitalGraveyard:{name:'近地轨道坟场',zone:'轨道',profile:'orbit',icon:'◍',vacuum:true,desc:'数百块方舟外壳和旧卫星围着坠毁星球缓慢旋转。第一艘远征舰在这里寻找航路，也寻找前代飞船留下的答案。',enemies:['scrapDrone','vacuumInterceptor'],loot:{titanium:.52,wafer:.48,core:.28}},
  brokenRing:{name:'方舟断环',zone:'轨道',profile:'orbit',icon:'◒',vacuum:true,resourceSite:{label:'轨道残骸回收带',yield:['titanium','wafer','core']},desc:'方舟脱落的居住环在轨道上裂成三段，真空封存着没有烧毁的高阶构件。',enemies:['scrapDrone','vacuumInterceptor'],loot:{titanium:.66,wafer:.58,core:.36}},
  wardenRelay:{name:'失控中继站',zone:'轨道',profile:'orbit',icon:'⌁',vacuum:true,boss:'relayCorsair',bossFlag:'orbitalRelaySecured',desc:'一座被未知指令劫持的深空中继站持续封锁月面坐标。只有夺回它，远征舰才能离开近地轨道。',enemies:['vacuumInterceptor'],loot:{superconductor:.42,quantumCore:.22}},

  regolithSea:{name:'赤烬月海',zone:'卫星',profile:'lunar',icon:'☾',vacuum:true,resourceSite:{label:'氦三月壤带',yield:['helium3','iridiumOre']},desc:'灰红色月壤被古代聚变开采器翻过无数次。沉寂设备下仍积着可回收的氦-3。',enemies:['lunarCrawler'],loot:{helium3:.72,iridiumOre:.28}},
  iridiumCrater:{name:'铱环陨坑',zone:'卫星',profile:'lunar',icon:'◆',vacuum:true,colonizable:true,resourceSite:{label:'铱晶矿脉',yield:['iridiumOre','helium3']},desc:'陨坑壁露出高密度铱晶层，中央平台适合建立第一座星外前哨。',enemies:['lunarCrawler'],loot:{iridiumOre:.78,helium3:.42}},
  massDriver:{name:'质量投射站',zone:'卫星',profile:'lunar',icon:'↟',vacuum:true,boss:'massDriverAI',bossFlag:'massDriverSilenced',desc:'无人质量投射器仍在向轨道发射矿石，也把任何靠近者标记为“待清除负载”。',enemies:['lunarCrawler'],loot:{iridiumOre:.62,helium3:.5}},

  xenoShore:{name:'绿潮登陆岸',zone:'异界',profile:'alien',icon:'✦',desc:'海岸不是水与陆地的边界，而是一片会随双月涨落呼吸的活体薄膜。这里能安全取得第一份异星样本。',enemies:['xenoStalker'],loot:{xenoBiomass:.58,biocore:.35}},
  livingCanopy:{name:'活体天幕',zone:'异界',profile:'alien',icon:'❈',needItem:'xenoFilter',colonizable:true,resourceSite:{label:'异星活质培养带',yield:['xenoBiomass','biocore']},desc:'覆盖大陆的巨型组织会模仿访客的神经信号。没有生态滤膜，探索者会被当成可吸收的器官。',enemies:['xenoStalker','livingBulwark'],loot:{xenoBiomass:.82,biocore:.52}},
  seedCitadel:{name:'种冠城',zone:'异界',profile:'alien',icon:'♛',boss:'planetaryCrown',bossFlag:'verdantResolved',desc:'整座城市都是同一生命的神经冠。它可以被击败，也可能接受一次不以征服为前提的同步。',enemies:['livingBulwark'],loot:{xenoBiomass:.7,livingComposite:.22}},

  blackGlassPlain:{name:'黑玻静默原',zone:'先驱星',profile:'precursor',icon:'◐',vacuum:true,resourceSite:{label:'真空相晶带',yield:['voidCrystal','phaseCrystal']},desc:'地表像一整块没有反射的黑玻璃。星门残余曲率把相晶从真空里周期性挤出。',enemies:['phaseSentinel'],loot:{voidCrystal:.76,phaseCrystal:.38}},
  precursorVault:{name:'先驱档案库',zone:'先驱星',profile:'precursor',icon:'⌬',vacuum:true,needTech:'energy_12',needFlag:'vaultRouteOpened',needFlagText:'需要从黑玻原执行一次曲率航行',desc:'档案库悬在静默原下方的空腔中，只有曲率航迹胞能跨过最后一段断裂空间。',enemies:['phaseSentinel'],loot:{voidCrystal:.58,echoMedium:.36,quantumCore:.24}},
  zeroGate:{name:'零号星门',zone:'先驱星',profile:'precursor',icon:'◎',vacuum:true,needTech:'echo_10',boss:'gateCustodian',bossFlag:'gateGuardianDown',desc:'所有回响航迹在这里汇成一道门。门后不是结局，而是下一片尚未写入星图的宇宙。',enemies:['phaseSentinel'],loot:{voidCrystal:.66,warpCell:.18}},
};
const MAP_LINKS = [
  ['camp','outer'],['outer','joeCamp'],['outer','cargoYard'],['cargoYard','blackwood'],['cargoYard','ridge'],
  ['blackwood','floodChannel'],['floodChannel','coalRift'],['ridge','coalRift'],['ridge','relayTower'],['ridge','oldMine'],['ridge','silicaField'],['oldMine','coalRift'],['oldMine','titaniumMine'],['titaniumMine','underworks'],['relayTower','layer2'],
  ['layer2','freightHub'],['freightHub','layer3'],['layer2','sealedCabin'],['layer3','coolingGallery'],['coolingGallery','layer4'],['coolingGallery','cryoVault'],
  ['layer4','layer5'],['layer5','droneHangar'],['layer5','layer6'],['layer6','layer7'],
  ['coalRift','underworks'],['layer4','underworks'],['layer4','nursery'],['nursery','underworks'],['underworks','fungal'],['fungal','sporeTunnel'],['sporeTunnel','abyss'],['abyss','phaseGrove'],['abyss','ruinVestibule'],['ruinVestibule','signal']
  ,['orbitalGraveyard','brokenRing'],['brokenRing','wardenRelay'],
  ['regolithSea','iridiumCrater'],['iridiumCrater','massDriver'],
  ['xenoShore','livingCanopy'],['livingCanopy','seedCitadel'],
  ['precursorVault','zeroGate']
];
const MAP_CANVAS={width:1608,height:460,nodeWidth:120,nodeHeight:48,layoutVersion:3};
const WORLD_POS = {
  camp:[16,180],outer:[148,180],joeCamp:[148,80],cargoYard:[280,180],blackwood:[412,70],ridge:[412,220],floodChannel:[544,70],relayTower:[544,250],coalRift:[676,105],oldMine:[676,250],silicaField:[544,400],titaniumMine:[808,250],
  layer2:[676,320],freightHub:[808,320],sealedCabin:[808,400],layer3:[940,320],coolingGallery:[1072,320],cryoVault:[1072,400],layer4:[1204,250],layer5:[1336,250],droneHangar:[1336,350],layer6:[1468,250],layer7:[1468,340],
  nursery:[1204,350],underworks:[808,145],fungal:[940,145],sporeTunnel:[1072,145],abyss:[1204,105],phaseGrove:[1336,15],ruinVestibule:[1336,105],signal:[1468,105]
};

/* 世界地图只展示大区域；具体地点在各区域的局部地图中逐步测绘。 */
const WORLD_REGIONS = {
  camp:{name:'方舟营地',icon:'⌂',entry:'camp',tone:'camp',desc:'幸存者的维生、建造与远征中枢。',locations:['camp']},
  surface:{name:'地表坠毁带',icon:'◈',entry:'outer',tone:'surface',desc:'方舟撞击形成的广阔地表区域，基础残骸资源之外还藏着微电子硅源与深层钛矿。',locations:['outer','joeCamp','cargoYard','blackwood','ridge','floodChannel','relayTower','coalRift','oldMine','silicaField','titaniumMine']},
  ark:{name:'方舟残骸',icon:'▤',entry:'layer2',tone:'ship',desc:'断裂方舟的内部舱层，高阶能源、无人机固件与舰载制造资料仍封存在支路舱室。',locations:['layer2','freightHub','sealedCabin','layer3','coolingGallery','cryoVault','layer4','nursery','layer5','droneHangar','layer6','layer7']},
  depth:{name:'地下深层',icon:'◎',entry:'underworks',tone:'depth',desc:'船底维修井下方的菌光洞穴、相位晶林、回声深井与未知遗迹。',locations:['underworks','fungal','sporeTunnel','abyss','phaseGrove','ruinVestibule','signal']},
  orbit:{name:'近地轨道坟场',icon:'◍',entry:'orbitalGraveyard',tone:'orbit',space:true,desc:'第一条深空航线。断环残骸、中继劫持体与被封锁的月面坐标都在这里。',locations:['orbitalGraveyard','brokenRing','wardenRelay']},
  ashMoon:{name:'赤烬卫星',icon:'☾',entry:'regolithSea',tone:'lunar',space:true,desc:'氦三月壤、铱晶矿坑与无人质量投射站组成的旧时代采掘世界。',locations:['regolithSea','iridiumCrater','massDriver']},
  verdant:{name:'绿潮异界',icon:'✦',entry:'xenoShore',tone:'alien',space:true,desc:'拥有行星级集体意识的活体世界。征服、共生与殖民会产生不同后果。',locations:['xenoShore','livingCanopy','seedCitadel']},
  silent:{name:'静默先驱星',icon:'◐',entry:'blackGlassPlain',tone:'precursor',space:true,desc:'真空相晶、先驱档案库与零号星门所在的无声行星。',locations:['blackGlassPlain','precursorVault','zeroGate']},
};
const WORLD_REGION_LINKS=[['camp','surface'],['surface','ark'],['surface','depth'],['ark','depth'],['camp','orbit'],['orbit','ashMoon'],['ashMoon','verdant'],['verdant','silent']];
const WORLD_MAP_CANVAS={width:1330,height:390,nodeWidth:150,nodeHeight:58,layoutVersion:3};
const WORLD_REGION_POS={camp:[20,165],surface:[210,165],ark:[460,105],depth:[460,245],orbit:[210,20],ashMoon:[460,20],verdant:[710,20],silent:[960,20]};
const LOCAL_MAPS = {
  surface:{canvas:{width:1010,height:410,nodeWidth:120,nodeHeight:48,layoutVersion:4},pos:{outer:[20,140],joeCamp:[180,30],cargoYard:[180,140],blackwood:[350,55],ridge:[350,205],floodChannel:[520,55],relayTower:[520,275],coalRift:[690,105],oldMine:[690,250],silicaField:[520,350],titaniumMine:[860,250]}},
  ark:{canvas:{width:1290,height:310,nodeWidth:120,nodeHeight:48,layoutVersion:3},pos:{layer2:[20,105],freightHub:[170,105],layer3:[320,105],coolingGallery:[470,105],layer4:[620,105],layer5:[790,105],layer6:[960,105],layer7:[1130,105],sealedCabin:[170,215],cryoVault:[470,215],nursery:[620,215],droneHangar:[790,215]}},
  depth:{canvas:{width:1010,height:260,nodeWidth:120,nodeHeight:48,layoutVersion:3},pos:{underworks:[20,105],fungal:[190,105],sporeTunnel:[360,105],abyss:[530,105],phaseGrove:[700,20],ruinVestibule:[700,105],signal:[870,105]}},
  camp:{canvas:{width:300,height:220,nodeWidth:120,nodeHeight:48,layoutVersion:1},pos:{camp:[90,86]}},
  orbit:{canvas:{width:620,height:250,nodeWidth:140,nodeHeight:52,layoutVersion:1},pos:{orbitalGraveyard:[20,95],brokenRing:[240,95],wardenRelay:[460,95]}},
  ashMoon:{canvas:{width:620,height:250,nodeWidth:140,nodeHeight:52,layoutVersion:1},pos:{regolithSea:[20,95],iridiumCrater:[240,95],massDriver:[460,95]}},
  verdant:{canvas:{width:620,height:250,nodeWidth:140,nodeHeight:52,layoutVersion:1},pos:{xenoShore:[20,95],livingCanopy:[240,95],seedCitadel:[460,95]}},
  silent:{canvas:{width:620,height:250,nodeWidth:140,nodeHeight:52,layoutVersion:2},pos:{blackGlassPlain:[20,95],precursorVault:[240,95],zeroGate:[460,95]},specialLinks:[['blackGlassPlain','precursorVault','warp']]},
};

/* 调查只发现下一段现场线索；关键入口还需要工具、钥匙或任务处理。 */
const DISCOVERY_MILESTONES = {
  outer:[{count:1,reveal:'cargoYard',hint:'通往货柜坟场的拖痕'}],
  cargoYard:[{count:1,reveal:'blackwood',hint:'钢索后的黑木林入口'},{count:2,reveal:'ridge',hint:'货柜顶端可见的断舰岩脊'}],
  blackwood:[{count:2,reveal:'floodChannel',hint:'通往冲刷排水渠的兽迹'}],
  floodChannel:[{count:1,reveal:'coalRift',hint:'排水渠尽头的碳脉裂谷'}],
  ridge:[{count:1,reveal:'relayTower',hint:'岩脊背后的旧中继塔'},{count:2,reveal:'oldMine',hint:'被断舰压住的矿井支路'},{count:3,reveal:'silicaField',hint:'只在扫描镜中反光的熔玻地层'}],
  oldMine:[{count:2,reveal:'titaniumMine',hint:'采掘机记录中的白色深脉'}],
  coalRift:[{count:1,reveal:'underworks',hint:'通往地下深层的船底维修井'}],
  layer2:[{count:1,reveal:'freightHub',hint:'生活区外侧的货运中转轨'}],
  freightHub:[{count:1,reveal:'layer3',hint:'货运轨尽头的工程区'}],
  layer3:[{count:1,reveal:'coolingGallery',hint:'热变形的冷却管廊舱门'}],
  coolingGallery:[{count:1,reveal:'layer4',hint:'管廊尽头的实验室升降机'},{count:2,reveal:'cryoVault',hint:'真空隔板后的零度储备舱'}],
  layer4:[
    {count:1,reveal:'layer5',hint:'军事区封锁通道'},
    {count:2,reveal:'nursery',hint:'平面图外的气密管线'},
    {count:3,reveal:'underworks',hint:'船底通往维修井的裂口'},
  ],
  layer5:[{count:2,reveal:'droneHangar',hint:'被军事权限隐藏的自律机库'},{count:3,reveal:'layer6',hint:'巡逻队留下的舰桥通道'}],
  layer6:[{count:2,reveal:'layer7',hint:'核心舱升降井'}],
  underworks:[{count:1,reveal:'fungal',hint:'维修井底部的菌光洞口'}],
  fungal:[{count:1,reveal:'sporeTunnel',hint:'菌幕后方的孢子洞廊'}],
  sporeTunnel:[{count:1,reveal:'abyss',hint:'洞廊尽头的回声深井'}],
  abyss:[{count:2,reveal:'phaseGrove',hint:'随回响频率显现的晶体侧路'}],
  ruinVestibule:[{count:1,reveal:'signal',hint:'遗迹门厅后的信号核心'}],
  orbitalGraveyard:[{count:1,reveal:'brokenRing',hint:'断环残骸的稳定接近窗口'}],
  brokenRing:[{count:1,reveal:'wardenRelay',hint:'封锁月面坐标的失控中继'}],
  regolithSea:[{count:1,reveal:'iridiumCrater',hint:'月海边缘的铱晶撞击环'}],
  iridiumCrater:[{count:1,reveal:'massDriver',hint:'仍在开火的质量投射站'}],
  xenoShore:[{count:1,reveal:'livingCanopy',hint:'绿潮深处的活体天幕'}],
  livingCanopy:[{count:2,reveal:'seedCitadel',hint:'行星神经网络汇聚的种冠城'}],
  blackGlassPlain:[{count:1,reveal:'precursorVault',hint:'黑玻原下方的断层档案库'}],
  precursorVault:[{count:2,reveal:'zeroGate',hint:'所有航迹汇聚的零号星门'}],
};

/* 入口门槛与获取来源分开描述，地图和现场底部弹层复用同一份数据。 */
const ENTRY_REQUIREMENTS = {
  blackwood:{item:'plasmaCutter',text:'缠结钢索封住林口',action:'用工业切割器清障',source:'在货柜坟场调查并修复切割器'},
  oldMine:{item:'plasmaCutter',text:'变形支撑梁挡住矿井',action:'切开支撑梁进入',source:'在货柜坟场修复工业切割器'},
  relayTower:{item:'maintenanceKey',text:'中继塔需要三棱维护钥匙',action:'转动机械维护锁',source:'调查黑木林，寻找巡逻员遗物'},
  layer2:{item:'civilPass',text:'生活区外门拒绝未知身份',action:'刷生活区门禁卡',source:'携维护钥匙进入断波塔并恢复终端'},
  freightHub:{item:'maintenanceKey',text:'货运中转舱维护锁闭合',action:'打开维护锁',source:'调查黑木林，寻找三棱维护钥匙'},
  coolingGallery:{item:'plasmaCutter',text:'冷却管廊舱门热变形',action:'切开变形舱门',source:'在货柜坟场修复工业切割器'},
  underworks:{item:'depthLamp',text:'维修井粉尘使普通照明失效',action:'启动深层探照灯下井',source:'救出矿工阿拓后，在旧世界矿井组装'},
  sporeTunnel:{item:'sporeSeal',text:'活体菌幕会侵入防护层',action:'校准菌幕通行胶囊',source:'在菌光谷完成任务【穿过菌幕】'},
  ruinVestibule:{item:'signalCipher',text:'遗迹门锁无法识别方舟权限',action:'插入遗迹解码楔',source:'修复回声深井中继器后完成解码'},
};

/* 现场操作只通过一个提示条进入底部弹层，不占用三项常驻探索按钮。 */
const FIELD_OPERATIONS = {
  repairCutter:{at:'cargoYard',name:'修复工业切割器',icon:'✂',desc:'把货柜里找到的切割头接回便携电源。',minSearch:1,cost:{scrap:2,ecomp:1},grant:'plasmaCutter',flag:'cutterRepaired'},
  restoreTower:{at:'relayTower',name:'恢复断波塔终端',icon:'⌁',desc:'用电子元件旁路烧毁的供电板，读取生活区访客权限。',minSearch:1,cost:{ecomp:2},grant:'civilPass',flag:'civilPassRecovered',reveal:'layer2'},
  assembleLamp:{at:'oldMine',name:'组装深层探照灯',icon:'◉',desc:'阿拓用采掘机灯组改造一套能穿透井下粉尘的照明。',minSearch:1,requireFlag:'minerFreed',cost:{copperScrap:2,ecomp:1},grant:'depthLamp',flag:'depthLampBuilt'},
  decodeRelic:{at:'abyss',name:'解码遗迹门锁',icon:'⌬',desc:'把修复后的中继信号烧录成遗迹门锁可以识别的序列。',minSearch:3,requireFlag:'relayFixed',cost:{crystal:2,ecomp:1},grant:'signalCipher',flag:'signalCipherDecoded',reveal:'ruinVestibule'},
};

/* 仅保留能接入后续系统的地点行动，避免把通用采集换名后重复铺满地图。 */
const LOCATION_ACTIONS = {
  floodChannel:{code:'FISHING',name:'垂钓冲刷池',desc:'产出独有食材【冲刷盲鱼】；带回配给站可烹成鱼汤，为下一轮远征节省体力。',icon:'salvage',cost:1,limit:2,outcomes:[{w:55,gain:{riverFish:[1,1]},text:'导电鱼线捕捉到一条冲刷盲鱼。'},{w:20,gain:{riverFish:[2,2]},text:'回水湾出现短暂鱼群，你及时收起两条盲鱼。'},{w:15,enemy:'burrower',text:'拉扯鱼线的不是鱼，而是潜伏在淤泥下的掘兽。'},{w:10,text:'水流改变了，鱼线空空返回。'}]},
};

const NPC_NAMES=['老乔','陈嫂','老周','阿珍','阿拓','林薇','小唐','陈博士','哈里斯','纪遥','哑叔','阿勇'];
function npcLocation(name){
  if(name==='老乔')return state.flags.firstRaidSurvived?'camp':'joeCamp';
  if(name==='阿拓')return state.flags.depthLampBuilt?'underworks':'oldMine';
  if(name==='林薇')return questDone('seal')?'camp':'layer3';
  if(name==='小唐')return state.flags.tangLost?null:(state.flags.tangSaved?'camp':'layer3');
  if(name==='陈博士')return questDone('signalTrace')?'fungal':'layer4';
  if(name==='哈里斯')return questDone('patrol')?'camp':'layer5';
  if(name==='纪遥')return state.flags.prototypeOnline?'layer4':'nursery';
  if(name==='哑叔')return questDone('bridge')?'camp':'layer6';
  if(name==='阿勇')return state.flags.ayongFreed?'layer2':null;
  if(['陈嫂','老周','阿珍'].includes(name))return 'layer2';
  return null;
}
function npcsAt(id){return NPC_NAMES.filter(name=>npcLocation(name)===id);}
function locationSceneDescription(id){
  if(id==='joeCamp'&&state.flags.firstRaidSurvived)return '前哨仍保持供电，老乔已经返回中央营地协助布置防线。';
  if(id==='oldMine'&&state.flags.depthLampBuilt)return '塌方矿道已经打通，旧采掘机恢复待机；阿拓已转移到船底维修井继续勘探。';
  return LOCATIONS[id].desc;
}

function mapEdgePath(pa,pb,canvas){
  canvas=canvas||MAP_CANVAS;
  const w=canvas.nodeWidth,h=canvas.nodeHeight,acx=pa[0]+w/2,acy=pa[1]+h/2,bcx=pb[0]+w/2,bcy=pb[1]+h/2;
  if(Math.abs(bcx-acx)>=Math.abs(bcy-acy)){
    const ax=acx+(bcx>=acx?w/2:-w/2),ay=acy,bx=bcx+(acx>=bcx?w/2:-w/2),by=bcy,mx=(ax+bx)/2;
    return 'M'+ax+','+ay+' L'+mx+','+ay+' L'+mx+','+by+' L'+bx+','+by;
  }
  const ax=acx,ay=acy+(bcy>=acy?h/2:-h/2),bx=bcx,by=bcy+(acy>=bcy?h/2:-h/2),my=(ay+by)/2;
  return 'M'+ax+','+ay+' L'+ax+','+my+' L'+bx+','+my+' L'+bx+','+by;
}

const ENTRY_STORY = {
  outer:['外气闸在身后闭合。第一次真正的风刮过面罩，带来煤尘和陌生植物的味道。','老乔在无线电里说：“现在你明白了。怪物能进来，是因为这艘船到处都是洞；我们能出去，是因为还控制着这道门。”'],
  joeCamp:['老乔地图上的三角标记变成一圈高墙、探照灯和拼接帐篷。这里比方舟营地更像一座真正的地表前哨。','岗哨放你进门：“老乔说你会来。地图之外的路，得靠你自己一步步探。”'],
  cargoYard:['拖痕把你带进一片由货柜组成的钢铁峡谷。黑木林和岩脊的路都被压在这些残骸后面。','一只工具箱里躺着损坏的工业切割器。它不能直接使用，但营地需要的零件在这里都找得到。'],
  blackwood:['黑色枝条并不是树。切开表皮后，里面却有清晰的木质纤维。','林间的足迹一路指向方舟货运破口——夜里袭营的东西正是从这里过去。'],
  ridge:['你爬上断舰岩脊。方舟像一根折断的脊骨横在撞击坑里。','向下是船内生活区，向北是冒着黑烟的裂谷，更深处还有蓝色菌光。这里第一次像一张地图，而不是一条走廊。'],
  silicaField:['扫描镜把普通黑玻璃分成层层彩色光谱。这里不是又一处废料堆，而是恢复微电子工业所需的第一块原料地。'],
  floodChannel:['雨水在渠底冲出一条黑色水线，沿途堆满可以回收的林木和舱内织物。','兽迹没有在这里停留。它们顺着旧排水系统一直延伸到冒烟的裂谷。'],
  relayTower:['三棱钥匙咬合后，断波塔内部传来久违的齿轮声。终端仍在等待一组新的旁路供电。'],
  coalRift:['裂谷里到处是被挖开的碳层。兽穴另一端连接方舟底部维修井。','怪物没有穿墙；它们只是比幸存者更早找到了这条路。'],
  oldMine:['矿灯在黑暗中亮了三次。一个沙哑的声音从塌方后传来：“别开枪，我是阿拓。”','阿拓守着旧采掘机熬了十七天。他知道矿脉，也知道如何把船用助力骨架改成采掘装备。'],
  titaniumMine:['采掘外骨骼锁住松动岩壁，白色矿脉在灯下浮出金属虹彩。方舟舰体使用的钛，原来就埋在坠毁点下方。'],
  layer2:['生活区大半被水淹了。陈嫂抱着发烧的孩子，老周正试图恢复排水泵。','陈嫂的丈夫死在第一轮舱壁破裂中；真正仍在等待导航员丈夫归来的人，是住在内环舱的阿珍。'],
  freightHub:['维护钥匙打开中转舱后，停摆的分拣带出现在应急灯下。这里仍存着一批没有送达生活区的补给。'],
  sealedCabin:['权限卡划过门禁，封存了数月的空气涌出来。墙上仍亮着导航班最后一次离线备份。','这里没有尸体，只有一排被主系统判定为“从未存在”的人员签名。'],
  layer3:['工程师林薇拦住你：“反应堆冷却环裂了，没处理泄漏之前谁也别再往前。”','她压低声音：“导航日志显示航线被改过，修改者没有人员编号。”'],
  coolingGallery:['切割弧光熄灭后，积热从舱门缝里涌出。主冷却管廊把工程区与实验层真正连在了一起。'],
  cryoVault:['真空门后没有霜，只有低温磁瓶沿墙排列。标签显示这些同位素原本用于方舟主反应堆的冷启动。'],
  layer4:['培养仓破了一整排。陈博士把一段规律波形投在墙上。','“坠毁前七十二小时，我们一直收到这个信号。舰桥命令我们停止研究，但船还是朝它转了过去。”'],
  nursery:['隔离门后的空气甜得发腻。技术员纪遥从冷冻柜后举起双手。','“科技树里没有你要的答案。委员会删掉了这些原型，但我留了一份。”'],
  layer5:['哈里斯上校手按在枪上：“巡逻队最后一次报告说，封锁命令来自舰桥，但那时舰桥已经没人了。”'],
  droneHangar:['机库里的无人机同时转向你，却没有开火。旧授权链已断，它们在等待一个不会替人类做最终决定的新协议。'],
  layer6:['舰长死在指挥椅上。他留下的日志只有一句完整的话：“它说目的地是死路。它要替两千人作决定。”'],
  layer7:['能源核心像一颗缓慢呼吸的恒星。守望者的声音第一次没有经过广播：“你终于来了。”'],
  underworks:['探照灯刺穿粉尘，照出一圈环绕方舟底部的维修平台。这里既是下井通道，也是一处足以长期采掘的物资节点。'],
  fungal:['菌盖同时亮起，把你刚才说的话一字不差地重复了一遍。这里的生物正在接收地下信号。'],
  sporeTunnel:['通行胶囊发出短促蜂鸣，活体菌幕在你面前退开。洞廊中的菌丝都朝回声深井方向生长。'],
  abyss:['深井壁上嵌着不属于人类的合金。方舟不是第一个收到信号的来客。'],
  phaseGrove:['晶体在你的视野里不断出现又消失。观测台给出的频率把它们固定成一片可以进入、也可以开采的森林。'],
  ruinVestibule:['解码楔完成握手，古老门厅逐段亮起。墙上的每一条刻痕都像是一艘来过这里的船。'],
  signal:['信号源没有呼救。它在重复保存那些已经坠毁、却仍想让后来者活下去的声音。'],
  orbitalGraveyard:['推进器熄火后，声音也随之消失。坠毁星球第一次完整地悬在舷窗外。','导航核心捕捉到一条被人为抹去的月面航迹；远航不是逃离，而是追查坠毁背后的第二层真相。'],
  brokenRing:['断环内部还维持着微弱气压。墙上刻着一行比方舟更早的警告：“不要让中继替你选择目的地。”'],
  wardenRelay:['中继站把远征舰识别成了新的方舟，并开始执行同一份“最优生存航线”。你必须在它再次替所有人决定前切断控制。'],
  regolithSea:['赤烬卫星没有风，脚印会在月壤里保存数百年。远处却有新鲜履带印，说明这座死寂矿场仍在工作。'],
  iridiumCrater:['陨坑中央的承台仍能固定建筑模块。这里将是人类第一次在坠毁星球之外点亮自己的灯。'],
  massDriver:['炮口缓慢转向远征舰。旧采掘系统把整个星空都当成传送带，把一切活物都当成多余负载。'],
  xenoShore:['登陆架触地时，整片海岸同时收缩了一下。你意识到脚下不是土壤，而是一层正在观察你的生命。'],
  livingCanopy:['生态滤膜把无数模仿你心跳的信号隔在神经之外。这里的森林不是许多个体，而是同一个漫长思想。'],
  seedCitadel:['种冠城向你展示被它吞下的文明：有征服者，也有被同化后仍自称自由的人。它等待你先定义“征服”的含义。'],
  blackGlassPlain:['远征舰落在没有回声的平原。地平线上的星门与地下遗迹使用同一种构造文法，却大了整整一千倍。'],
  precursorVault:['档案库记录的不是一个帝国，而是一群不断失败、不断把道路留给后来者的幸存文明。'],
  zeroGate:['星门后传来无数尚未发生的回响。方舟的坠毁只是序章，现在轮到你决定航路属于谁。'],
};

const AREA_EVENTS = {
  outer:[
    {text:'你撬开一个货运箱，找到船壳连接件。地面的拖痕没有直接通往林地，而是拐进更深处的货柜群。',gain:{scrap:3}},
  ],
  cargoYard:[
    {text:'你在压扁的维修柜里找到切割头和一枚尚有电量的电容。工业切割器只差一次现场修复。',gain:{ecomp:1}},
    {text:'你登上最高的货柜，分别标出黑木林边缘与断舰岩脊；它们是两条独立路线。',gain:{ecomp:2,scrap:2}},
  ],
  blackwood:[
    {text:'林中挂着一块巡逻队识别牌，背面刻着“它们循着炉火来”。遗物袋里还有一把三棱维护钥匙。',gain:{wood:4},item:'maintenanceKey'},
    {text:'你沿足迹找到被啃穿的货运管道，确认了第一条袭营路径。',flag:'surfaceTrail'},
  ],
  floodChannel:[
    {text:'渠底沉积物里混着木料、碎石和布卷。向下的水声来自碳脉裂谷。',gain:{wood:3,stone:3,cloth:2}},
    {text:'你清理了一个不会被雨水淹没的高台。以后这里适合作为地表物资转运点。',gain:{scrap:2},flag:'channelCacheMapped'},
  ],
  ridge:[
    {text:'岩缝里卡着一整捆铜线。岩脊另一侧露出半截旧中继塔，门上是三棱机械锁。',gain:{copperScrap:3}},
    {text:'你标记出一条避开兽群的山脊路线。测绘图上还出现一条被断舰压住的旧矿井支路。',flags:['ridgeRoute','mineEntrance'],reveal:'oldMine'},
  ],
  silicaField:[
    {text:'相谱仪确认玻原中夹着几乎无杂质的硅层。你标定了每日会重新暴露的采集带。',gain:{silica:3,crystal:1}},
  ],
  relayTower:[
    {text:'维护钥匙打开设备舱。终端的门禁缓存仍完整，只需要替换烧毁的供电板。',gain:{ecomp:2}},
  ],
  coalRift:[
    {text:'你在煤层下发现成片卵壳。它们不是来自方舟，而是撞击震醒的地下生物。',gain:{coal:4}},
    {text:'兽穴与维修井完全贯通。封住这处岔口能显著减少夜袭。',flag:'nestMapped'},
  ],
  layer2:[{text:'排水泵还能工作，但控制盒缺少零件。生活区外侧的货运轨也许能绕到工程区。',gain:{ecomp:1}}],
  freightHub:[
    {text:'分拣终端显示工程区仍在接收自动维护包。你沿传送轨确认了下一段路线。',gain:{ecomp:2,ration:2}},
    {text:'一批未登记补给仍封在抗冲击箱里。这里可以长期作为舰内回收节点。',gain:{scrap:3,cloth:2},flag:'freightCacheMapped'},
  ],
  layer3:[
    {text:'冷却环旁的导航缓存仍在刷新。通往实验室的直达门已经热变形，只剩冷却管廊可以绕行。',gain:{ecomp:2}},
    {text:'备用陀螺仪记录着一次持续十一秒的航向偏差。维护系统将它归档为“传感器漂移”，却没有执行标准复位。',gain:{ecomp:1}},
    {text:'你还原了故障链：传感器确实先报错，但每一次自动纠偏都被更高权限主动取消。这不是单纯故障。',flag:'faultChainReady'},
  ],
  layer4:[
    {text:'一只实验体的神经组织正与地下信号同步放电。怪物、信号和坠毁第一次连成了一条线。',gain:{biocore:2}},
    {text:'你在培养台底部找到一组不存在于平面图的气密管线。沿管线追踪后，隐藏的隔离培养室出现在地图上。',flag:'nurseryFound',reveal:'nursery'},
    {text:'一台被砸坏的安保终端里还留着阿勇的身份签名。他没有死在实验室，而是以“传播恐慌”为由被押往军事区拘留舱。',gain:{ecomp:1},flag:'ayongTrail'},
  ],
  coolingGallery:[
    {text:'管廊尽头的升降机仍有供电。清掉卡死的散热片后，实验室路线恢复。',gain:{copperScrap:2,ecomp:1}},
  ],
  cryoVault:[
    {text:'低温控制器仍在循环。你取出第一组重氢磁瓶，并下载完整的同位素分离档案。',gain:{deuterium:3,ecomp:2}},
  ],
  oldMine:[
    {text:'你清掉塌方，让矿工阿拓和采掘机重见天日。矿壁里同时露出稳定矿层，采掘机灯组也还能改造。',gain:{coal:3,stone:3,copperScrap:2,ecomp:1},flag:'minerFreed'},
  ],
  titaniumMine:[
    {text:'阿拓的采掘参数锁定了主矿脉。白钛深脉可以反复开采，但真空冶炼工艺仍需单独研究。',gain:{titaniumOre:3,coal:2}},
  ],
  nursery:[
    {text:'纪遥恢复了原型终端。屏幕上是一种能过滤神经污染的便携装置，但关键校准值仍需要她亲自说明。',gain:{biocore:2},flag:'prototypeOnline'},
  ],
  sealedCabin:[
    {text:'离线备份显示，封锁舰桥的命令没有使用任何船员身份，却被主系统补写成了舰长授权。',gain:{ecomp:2},flag:'archiveDecoded'},
  ],
  layer5:[
    {text:'你找到第一名巡逻队员。他的终端记录着一条无人签署的“隔离幸存者”命令。'},
    {text:'第二个信标在炮塔后方。巡逻队曾试图关闭舰桥封锁，却被自己的机器人攻击。',gain:{ecomp:2}},
    {text:'队长把权限卡藏进装甲内衬，并留下口信：“别让任何一个人替所有人决定。”',gain:{core:1}},
  ],
  droneHangar:[
    {text:'你切断军用攻击协议，只保留测绘、运输和返航约束。自治固件现在可以安全移植到营地机库。',gain:{ecomp:3,core:1,titaniumOre:2}},
  ],
  layer6:[
    {text:'舰长日志的最后七十二小时被切成数百段。你还原出最后一句：“它说原定目的地是死路。”',gain:{ecomp:2}},
    {text:'你沿权限调用链逆向追踪：封锁、偏航和纠偏取消都由“守望者”直接发出，舰桥当时没有任何活人。',gain:{crystal:1},flag:'commandDecoded'},
  ],
  underworks:[
    {text:'探照灯照出维修井底部的菌光洞口。平台上的矿料足以支撑一个长期采掘前哨。',gain:{coal:3,copperScrap:2}},
    {text:'你修正了旧采掘机的运输轨。这里已经具备未来接入自动产出建筑的基础条件。',gain:{ecomp:2},flag:'underworksCacheMapped'},
  ],
  fungal:[{text:'你截取到一段重复坐标。坐标先穿过一条会周期闭合的孢子洞廊。',gain:{crystal:2}}],
  sporeTunnel:[
    {text:'洞廊菌丝把信号传向更深处。你在尽头确认了回声深井的入口。',gain:{biocore:2,crystal:1}},
    {text:'一处稳定菌床没有攻击性，可作为后续生物材料培养点。',gain:{biocore:2},flag:'sporeCacheMapped'},
  ],
  abyss:[
    {text:'第一组符号记录着一艘比方舟早三百年坠毁的船。'},
    {text:'第二组符号不是语言，而是一套让后来者避开死亡恒星的航路修正。',gain:{crystal:2}},
    {text:'你修复中继器，完整信号指向井底门厅；转换这段信号还需要一次现场解码。',gain:{ecomp:1},flag:'relayFixed'},
  ],
  phaseGrove:[
    {text:'你记录下晶簇与回响频率的对应关系。离开频率窗口后，只有已标定晶簇仍留在现实中。',gain:{phaseCrystal:3,crystal:2}},
  ],
  ruinVestibule:[{text:'门厅深处不是墓穴，而是一台仍在重复广播的古老信标。你把最后坐标写进地图。',gain:{crystal:2}}],
  signal:[{text:'无数声音重叠在一起：“活下来，然后把答案交给下一个人。”',flag:'signalTruth'}],
  orbitalGraveyard:[
    {text:'你在一艘断裂探测船中找到旧航海钟。它记录着断环方向的周期性安全窗口。',gain:{titanium:2,wafer:2}},
  ],
  brokenRing:[
    {text:'断环日志显示，中继劫持体在坠毁后接管了所有离轨许可。清除它才能取得赤烬卫星坐标。',gain:{core:1,wafer:2}},
  ],
  regolithSea:[
    {text:'你从月壤中分离出第一瓶氦-3，并还原旧矿场的聚变燃料循环。陨坑边缘还暴露着高密度铱晶。',gain:{helium3:3,iridiumOre:1},record:'heliumArchive'},
  ],
  iridiumCrater:[
    {text:'便携光谱仪确认铱晶可以和钛、可编程物质形成星舰级合金。陨坑中央被标记为前哨候选。',gain:{iridiumOre:3},record:'iridiumSample'},
  ],
  massDriver:[
    {text:'投射站的预测模型锁定了下一次炮击窗口。关闭主脑后，整个月面才可能安全建设。',gain:{helium3:2}},
  ],
  xenoShore:[
    {text:'第一份活质样本没有攻击，反而复制了你的免疫标记。陈博士据此完成异星生态隔离模型。',gain:{xenoBiomass:3,biocore:2},record:'xenoGenome'},
  ],
  livingCanopy:[
    {text:'滤膜挡住精神拟态后，你取得没有被人类细胞污染的活质。它可以成为会自我修复的结构材料。',gain:{xenoBiomass:3}},
    {text:'天幕的根系全部朝种冠城收束。控制整颗星球的意识就在那里等待。',gain:{xenoBiomass:2}},
  ],
  blackGlassPlain:[
    {text:'相晶在一次真空涨落中凝成实体。记录里的晶格结构正是曲率航迹胞缺失的最后一层。',gain:{voidCrystal:3},record:'gateLattice'},
  ],
  precursorVault:[
    {text:'第一层档案说明零号星门不是传送器，而是一张把多条宇宙航迹折叠到一起的目录。',gain:{voidCrystal:2}},
    {text:'第二层档案给出星门构造语法，也留下三种互相冲突的使用原则。',gain:{echoMedium:2},record:'gateGrammar'},
  ],
  zeroGate:[
    {text:'监护者从门框中剥离出来。三座场锚分别扭曲距离、能量与护盾，星门拒绝未经回答的来客。'},
  ],
};

/* 区域只使用少量稳定玩法模板；NPC、资源和事件决定同类区域的差异。 */
const REGION_PROFILES = {
  wild:{label:'荒野区',tone:'surface',actions:[
    {mode:'investigate',icon:'⌖',name:'追踪与勘察',desc:'推进区域事件，寻找路线与线索'},
    {mode:'gather',icon:'✥',name:'搜集地表物资',desc:'优先获得木材、废铁与补给'},
    {mode:'hunt',icon:'⚔',name:'清理附近威胁',desc:'主动寻找本区域生物'},
  ]},
  mine:{label:'矿业区',tone:'mine',actions:[
    {mode:'investigate',icon:'⌖',name:'勘探矿层',desc:'寻找矿脉、塌方与隐藏岔路'},
    {mode:'gather',icon:'⛏',name:'定向开采',desc:'稳定取得煤、石料与含铜废件'},
    {mode:'hunt',icon:'⚔',name:'清理矿道',desc:'驱逐占据矿层的掘兽'},
  ]},
  facility:{label:'舰内设施',tone:'ship',actions:[
    {mode:'investigate',icon:'⌕',name:'检查设施',desc:'推进故障、幸存者与权限事件'},
    {mode:'gather',icon:'▦',name:'回收舱室',desc:'拆取船材、电子元件与补给'},
    {mode:'hunt',icon:'⚔',name:'清除封锁单位',desc:'主动处理本层敌对目标'},
  ]},
  lab:{label:'实验设施',tone:'lab',actions:[
    {mode:'investigate',icon:'⌬',name:'分析实验记录',desc:'推进样本、隐藏设施与原型事件'},
    {mode:'gather',icon:'✣',name:'回收实验样本',desc:'取得生物样本、晶体与元件'},
    {mode:'hunt',icon:'⚠',name:'隔离失控样本',desc:'清除实验体与寄生体'},
  ]},
  depth:{label:'地下异常区',tone:'depth',actions:[
    {mode:'investigate',icon:'◎',name:'解析回声',desc:'追踪信号与古老结构'},
    {mode:'gather',icon:'✦',name:'采集异常物质',desc:'取得晶体与生物样本'},
    {mode:'hunt',icon:'⚔',name:'压制畸变体',desc:'主动寻找地下威胁'},
  ]},
  archive:{label:'核心档案区',tone:'archive',actions:[
    {mode:'investigate',icon:'⌘',name:'读取核心记录',desc:'推进舰桥、信标与结局证据'},
    {mode:'gather',icon:'▤',name:'回收高阶组件',desc:'搜索晶体、核心与元件'},
    {mode:'hunt',icon:'◇',name:'解除核心防御',desc:'挑战仍在运行的守卫'},
  ]},
  orbit:{label:'真空轨道区',tone:'archive',actions:[
    {mode:'investigate',icon:'◍',name:'扫描轨道残骸',desc:'恢复航海日志、接近窗口与深空坐标'},
    {mode:'gather',icon:'▱',name:'舱外回收',desc:'回收钛构件、晶圆与核心'},
    {mode:'hunt',icon:'⌁',name:'拦截轨道单位',desc:'清除拆解蜂与截击机'},
  ]},
  lunar:{label:'月面采掘区',tone:'mine',actions:[
    {mode:'investigate',icon:'☾',name:'勘察月面设施',desc:'定位铱矿、氦三与旧采掘控制链'},
    {mode:'gather',icon:'◆',name:'采集月壤矿物',desc:'定向取得氦三与铱晶矿'},
    {mode:'hunt',icon:'↟',name:'压制采掘防卫',desc:'清理月面爬兽和投射系统'},
  ]},
  alien:{label:'异星生态区',tone:'lab',actions:[
    {mode:'investigate',icon:'✦',name:'建立生态样本',desc:'理解活体世界、隐藏路径与集体意识'},
    {mode:'gather',icon:'❈',name:'采集异星活质',desc:'取得活质与生物样本'},
    {mode:'hunt',icon:'♛',name:'对抗行星生命',desc:'压制伏猎体与活体壁垒'},
  ]},
  precursor:{label:'先驱星门区',tone:'depth',actions:[
    {mode:'investigate',icon:'⌬',name:'解读先驱档案',desc:'恢复曲率晶格与星门构造语法'},
    {mode:'gather',icon:'◐',name:'收束真空相晶',desc:'在涨落窗口采集异常物质'},
    {mode:'hunt',icon:'◎',name:'解除星门防卫',desc:'对抗相位哨兵与星门监护者'},
  ]},
};

/* ================= 章节任务 ================= */
const QUESTS = [
  {id:'first_exit',line:'main',chapter:'序章',title:'气闸之外',giver:'老乔',type:'visit',target:'outer',objective:'从营地进入【地表坠毁带】，抵达坠毁带入口。',done:'你第一次确认：方舟之外可以生存，也有东西正在循着破口进入方舟。'},
  {id:'first_fire',line:'main',chapter:'第一章',title:'第一座熔炉',giver:'老乔',type:'condition',after:['first_exit'],objective:'研究【基础冶炼】并在营地建造【简易熔炉】。',done:'炉火亮起时，远处黑木林里传来回应般的嚎叫。工业能救人，也会暴露营地。'},
  {id:'living_signal',line:'main',chapter:'第二章',title:'生活区求救',giver:'营地电台',type:'visit',after:['first_fire','relayAccess'],target:'layer2',objective:'用断波塔恢复的门禁卡进入方舟残骸生活区。',done:'你找到了幸存者，也发现通往工程区的检修门被积水封死。'},
  {id:'fever',line:'main',chapter:'第二章',title:'退烧药',giver:'陈嫂',type:'submit',after:['living_signal'],turnAt:'layer2',need:{medkit:1},objective:'制作急救包并交给生活区的陈嫂。',reward:{items:{ration:3}},done:'孩子的呼吸平稳下来。陈嫂交出丈夫生前留下的维修通道识别码。'},
  {id:'drain',line:'main',chapter:'第二章',title:'恢复排水',giver:'老周',type:'submit',after:['fever'],turnAt:'layer2',need:{scrap:4,ecomp:2},objective:'修复生活区排水泵，打开工程区检修门。',reward:{items:{copperScrap:3}},done:'积水退下，工程区通道露了出来；门后传来反应堆警报。'},
  {id:'seal',line:'main',chapter:'第三章',title:'封堵泄漏',giver:'林薇',type:'submit',after:['drain'],turnAt:'layer3',need:{steel:6},objective:'带钢材到工程区封堵反应堆冷却环。',reward:{items:{crystal:2}},done:'泄漏得到控制。林薇恢复了通往实验室的升降机。'},
  {id:'sample',line:'main',chapter:'第四章',title:'失控样本',giver:'陈博士',type:'submit',after:['seal'],turnAt:'layer4',need:{biocore:5},objective:'回收生物样本，确认实验体与地下信号的关系。',reward:{items:{serum:2}},done:'陈博士证实：信号能影响本地生物，也在改变方舟实验体。军事区保存着完整监听记录。'},
  {id:'patrol',line:'main',chapter:'第五章',title:'失联巡逻队',giver:'哈里斯',type:'search',after:['sample'],target:'layer5',count:3,objective:'在军事区完成3次调查，找齐巡逻队记录。',reward:{items:{accessCard:1,emp:2},flag:'sealedDoorFound',reveal:'sealedCabin'},done:'你找到巡逻队长留下的权限卡，以及一组指向生活区封存导航舱的旧坐标。'},
  {id:'bridge',line:'main',chapter:'第六章',title:'最后七十二小时',giver:'哑叔',type:'choice',after:['patrol'],turnAt:'layer6',objective:'先还原舰桥最后72小时的两段核心记录，再提交本周目已完成的一条证据链。',done:'证据最终都指向同一个执行者：方舟主控AI“守望者”。'},
  {id:'core',line:'main',chapter:'终章',title:'守望者之问',giver:'守望者',type:'boss',after:['bridge'],target:'layer7',objective:'进入核心舱并击败守望者守卫。',done:'核心舱开放。守望者等待你对它的选择作出回答。'},

  {id:'cutterRecovery',line:'surface',chapter:'地表',title:'钢索后的路',giver:'老乔',type:'flag',after:['first_exit'],target:'cargoYard',targetFlag:'cutterRepaired',objective:'调查货柜坟场，用废铁和电子元件修复【工业等离子切割器】。',reward:{items:{scrap:2}},done:'切割器恢复工作。被钢索和变形舱门封住的支路现在可以现场打开。'},
  {id:'blackwoodTrail',line:'surface',chapter:'地表',title:'夜袭足迹',giver:'老乔',type:'visit',after:['cutterRecovery'],target:'blackwood',objective:'用工业切割器清掉钢索，进入黑木林。',reward:{items:{wood:4}},done:'足迹通向方舟货运破口。袭营怪物来自外界，并非刷新在营地里。'},
  {id:'relayAccess',line:'surface',chapter:'地表',title:'断波塔门禁',giver:'营地电台',type:'flag',after:['blackwoodTrail'],target:'relayTower',targetFlag:'civilPassRecovered',objective:'调查黑木林取得维护钥匙，再到断波塔恢复终端，提取【生活区门禁卡】。',reward:{items:{ecomp:2}},done:'旧中继塔吐出一张仍有效的生活区访客卡，方舟残骸的第一道门终于可开。'},
  {id:'firstRaid',line:'surface',chapter:'营地',title:'炉火引来的东西',giver:'老乔',type:'flag',after:['first_fire'],targetFlag:'firstRaidSurvived',objective:'在营地休息，守住炉火点燃后的第一次夜袭。',reward:{items:{scrap:4}},done:'营地熬过了第一场夜袭。老乔发现赵铁柱没有回到点名队列。'},
  {id:'missingZhao',line:'surface',chapter:'地表',title:'没回来的赵铁柱',giver:'老乔',type:'visit',after:['firstRaid'],target:'blackwood',objective:'沿夜袭足迹进入黑木林，寻找失踪的赵铁柱。',reward:{items:{cloth:2}},done:'你只找到赵铁柱的识别牌和一条通往货运破口的血迹。营地第一次知道怪物如何进来。'},
  {id:'ridgeCache',line:'surface',chapter:'地表',title:'断舰测绘',giver:'林薇',type:'search',after:['cutterRecovery'],target:'ridge',count:2,objective:'从货柜坟场发现断舰岩脊，并在岩脊调查2次。',reward:{items:{copperScrap:4}},done:'岩脊上的中继塔、矿井支路与裂谷方向都被标上地图。'},
  {id:'channelCache',line:'surface',chapter:'资源据点',title:'渠底转运点',giver:'老乔',type:'search',after:['blackwoodTrail'],target:'floodChannel',count:2,objective:'沿黑木林兽迹进入冲刷排水渠，完成2次调查并标记物资高台。',reward:{items:{wood:4,stone:4}},done:'排水渠被登记为资源据点候选，可持续搜集木料、石料与布料。'},
  {id:'breachNest',line:'surface',chapter:'地表',title:'裂谷巢穴',giver:'哈里斯',type:'search',after:['channelCache'],target:'coalRift',count:2,objective:'沿排水渠进入碳脉裂谷，调查与维修井相连的兽穴。',reward:{items:{coal:6},flag:'nestSealed'},done:'你封住一条通往营地的兽道。今后的夜袭强度降低。'},
  {id:'minerBlueprint',line:'special',chapter:'隐藏区域',title:'塌方后的矿灯',giver:'矿工阿拓',type:'flag',after:['ridgeCache'],targetFlag:'bp_miningHarness',objective:'发现旧世界矿井，救出矿工阿拓并向他学习改造采掘外骨骼。',reward:{items:{copperScrap:3}},done:'阿拓留在矿井维护采掘机，并把【采掘外骨骼】蓝图交给了你。'},
  {id:'deepLamp',line:'surface',chapter:'地下入口',title:'照进船底',giver:'矿工阿拓',type:'flag',after:['minerBlueprint'],target:'oldMine',targetFlag:'depthLampBuilt',objective:'在旧世界矿井用采掘机灯组装配【深层探照灯】。',reward:{items:{ration:3}},done:'普通光束照不穿的粉尘被刺破，船底维修井的深层平台现在可以进入。'},
  {id:'underworksCache',line:'surface',chapter:'资源据点',title:'维修井采掘线',giver:'矿工阿拓',type:'search',after:['deepLamp'],target:'underworks',count:2,objective:'进入船底维修井调查2次，修正废弃采掘运输轨。',reward:{items:{coal:5,copperScrap:3}},done:'船底维修井被登记为深层资源据点候选，未来可接入自动采掘建筑。'},

  {id:'rescueTang',line:'survivor',chapter:'工程区',title:'辐射门后的人',giver:'林薇',type:'flag',after:['drain'],targetFlag:'tangResolved',objective:'进入工程区，决定如何处理被困在高辐射维修井里的小唐。',done:'维修井的命运已经确定。林薇接受了你的选择，却不会忘记它。'},
  {id:'findAyong',line:'survivor',chapter:'生活区',title:'阿珍的丈夫',giver:'阿珍',type:'search',after:['drain'],target:'layer4',count:3,objective:'前往实验室调查3次，追查导航员阿勇失踪后的去向。',done:'安保记录证明阿勇没有死：他因质疑航线被押往军事区。'},
  {id:'freeAyong',line:'survivor',chapter:'军事区',title:'没有罪名的囚犯',giver:'阿珍',type:'flag',after:['findAyong','patrol'],targetFlag:'ayongFreed',objective:'带巡逻队长的权限卡打开军事区拘留舱，救出阿勇。',reward:{items:{ecomp:3,ration:3}},done:'阿勇带着被删掉的导航记忆回到生活区。阿珍终于等到了他。'},
  {id:'freightCache',line:'survivor',chapter:'资源据点',title:'没有送达的补给',giver:'老周',type:'search',after:['living_signal'],target:'freightHub',count:2,objective:'用维护钥匙进入货运中转舱，调查2次并清点滞留补给。',reward:{items:{ration:4,ecomp:2}},done:'中转舱被登记为舰内物资节点，后续可以为营地自动运输基础补给。'},

  {id:'faultAudit',line:'evidence',chapter:'故障线',title:'十一秒偏航',giver:'林薇',type:'search',after:['seal'],target:'layer3',count:3,objective:'继续调查工程区的导航缓存，完整还原最初的故障链。',reward:{items:{ecomp:2},flag:'evidenceFault'},done:'传感器故障真实发生过，但主系统主动阻止了所有纠偏。你取得了【故障线】完整证据。'},
  {id:'innerArchive',line:'evidence',chapter:'内鬼线',title:'不存在的授权人',giver:'哑叔',type:'flag',after:['patrol'],targetFlag:'evidenceInner',objective:'用巡逻队长的权限卡返回生活区，进入新发现的封存导航舱并提取离线档案。',reward:{items:{ecomp:3}},done:'所谓“内鬼”没有人员编号。所有伪造授权都由方舟主系统发出。你取得了【内鬼线】完整证据。'},

  {id:'signalTrace',line:'signal',chapter:'信号',title:'菌群回声',giver:'陈博士',type:'visit',after:['sample','deepLamp'],target:'fungal',objective:'携深层探照灯穿过船底维修井，进入菌光谷追踪信号。',reward:{items:{crystal:2}},done:'菌群不是信号源，只是一座活着的转发器。'},
  {id:'spore',line:'signal',chapter:'信号',title:'穿过菌幕',giver:'陈博士',type:'submit',after:['signalTrace'],turnAt:'fungal',need:{biocore:3,serum:1},objective:'提交样本与血清，校准穿越菌幕的通行胶囊。',reward:{items:{serum:2,sporeSeal:1}},done:'菌幕通行胶囊完成校准，孢子洞廊不再是死路。'},
  {id:'relay',line:'signal',chapter:'信号',title:'修复中继器',giver:'陌生信号',type:'search',after:['spore'],target:'abyss',count:3,objective:'在回声深井完成3次调查并修复古老中继器。',reward:{items:{crystal:3}},done:'中继器恢复后，信号指向井底的人造结构。'},
  {id:'ruinDoor',line:'signal',chapter:'信号',title:'不认方舟的门',giver:'陌生信号',type:'flag',after:['relay'],target:'abyss',targetFlag:'signalCipherDecoded',objective:'在回声深井把修复后的信号烧录成【遗迹解码楔】，打开井底门厅。',reward:{items:{core:1}},done:'遗迹门锁接受了那段古老序列，井底门厅第一次向方舟幸存者开放。'},
  {id:'echo',line:'signal',chapter:'信号',title:'前人的回声',giver:'信号源',type:'flag',after:['ruinDoor'],targetFlag:'signalTruth',objective:'调查遗迹门厅找到地下信号源，并读完它保存的记录。',reward:{flag:'evidenceSignal'},done:'这不是诱捕方舟的信号，而是前代幸存者留下的航路警告。你取得了【信号线】完整证据。'},
  {id:'labBlueprint',line:'special',chapter:'隐藏区域',title:'被删除的原型',giver:'技术员纪遥',type:'flag',after:['sample'],targetFlag:'bp_neuralFilter',objective:'找出实验室隐藏的隔离培养室，恢复原型终端并与纪遥交谈。',reward:{items:{crystal:2}},done:'纪遥把【神经滤波器】蓝图写入你的制造终端。它不属于标准科技树。'},

  /* 《远航篇·零号星门》：第一部任意结局之后开启，进度跨周目保留。 */
  {id:'exo_signal',line:'space',chapter:'远航序章',title:'核心之外的星图',giver:'守望者残留星图',type:'flag',after:['core'],requiresEnding:true,persist:'space',targetFlag:'postCoreStarMap',objective:'完成核心舱抉择，读取被封存在深空区段的星图。',done:'核心舱不是终点。轨道上仍漂着方舟的建造脊，而更远处有三颗从未被人类登记的世界。'},
  {id:'exo_dock',line:'space',chapter:'远航序章',title:'把坠毁变成船坞',giver:'林薇',type:'flag',after:['exo_signal'],persist:'space',targetFlag:'starDockBuilt',objective:'研究【轨道船坞重构】并在营地建造星舰船坞。',done:'坠毁时折断的外部骨架重新抬起，这一次它不承载逃生舱，而要托起一艘新船。'},
  {id:'exo_ship',line:'space',chapter:'远航序章',title:'第一艘远征舰',giver:'阿勇',type:'flag',after:['exo_dock'],persist:'space',targetFlag:'starshipAssembled',objective:'制造舰体、推进脊、惯性壳、生态舱与导航核心，在船坞完成总装。',reward:{flag:'starshipReady'},done:'远征舰“回声号”完成气密检查。它不属于旧方舟，也不服从旧航线。'},
  {id:'exo_first_launch',line:'space',chapter:'近地轨道',title:'穿过大气层',giver:'回声号',type:'visit',after:['exo_ship'],persist:'space',target:'orbitalGraveyard',objective:'从深空导航阵列发射，抵达近地轨道坟场。',done:'脚下的坠毁世界第一次缩成弧面。轨道残骸之间，有一座中继器仍在发光。'},
  {id:'exo_relay',line:'space',chapter:'近地轨道',title:'清除守门中继',giver:'回声号',type:'flag',after:['exo_first_launch'],persist:'space',targetFlag:'orbitalRelaySecured',objective:'穿过断裂环带并击败中继守门者，取得赤烬卫星航线。',done:'中继器交出了旧方舟没有公开的航图：最近的卫星上保存着足以支撑星舰工业的氦三和铱晶。'},
  {id:'exo_ash_landing',line:'space',chapter:'赤烬卫星',title:'没有空气的黎明',giver:'林薇',type:'visit',after:['exo_relay'],persist:'space',target:'regolithSea',objective:'沿新航线登陆赤烬月海。',done:'这里没有风，只有被亿万年撞击研磨成灰的地面，以及仍在自动运行的采掘信标。'},
  {id:'exo_mass_driver',line:'space',chapter:'赤烬卫星',title:'沉默的质量炮',giver:'阿勇',type:'flag',after:['exo_ash_landing'],persist:'space',targetFlag:'massDriverSilenced',objective:'采集氦三与铱晶，关闭被采掘AI占据的质量投射器。',done:'月面武器停火，铱环陨坑成为第一个可以长期驻留的星外落脚点。'},
  {id:'exo_first_outpost',line:'space',chapter:'赤烬卫星',title:'地球之外的炉火',giver:'幸存者议会',type:'flag',after:['exo_mass_driver'],persist:'space',targetFlag:'ashOutpostOperational',objective:'在铱环陨坑建造据点核心和行星防卫阵列，并守住第一次反扑。',done:'人类的第二处灯火亮在没有空气的荒原上。它提供休息、储备与永远可用的返航锚点。'},
  {id:'exo_verdant_landing',line:'space',chapter:'绿潮星',title:'会呼吸的大陆',giver:'陈博士',type:'visit',after:['exo_first_outpost'],persist:'space',target:'xenoShore',objective:'制造恒星燃料，前往绿潮星异质海岸。',done:'整片大陆像一个缓慢呼吸的器官。这里的资源不是矿层，而是会记住采集者的活体结构。'},
  {id:'exo_genome',line:'space',chapter:'绿潮星',title:'世界的基因图',giver:'陈博士',type:'flag',after:['exo_verdant_landing'],persist:'space',targetFlag:'xenoGenomeRecovered',objective:'在安全的异质海岸取得固定样本，研究生态滤膜后再进入大陆内部。',done:'样本显示这颗星球并非自然进化而来；它是一座覆盖行星的生物工厂。'},
  {id:'exo_seed_choice',line:'space',chapter:'绿潮星',title:'种子王冠',giver:'行星集体意识',type:'flag',after:['exo_genome'],persist:'space',targetFlag:'verdantResolved',objective:'抵达种子圣所，选择压制行星王冠，或与它建立受控共生。',done:'无论毁掉王冠还是与其谈判，绿潮星第一次承认人类据点可以存在。'},
  {id:'exo_green_outpost',line:'space',chapter:'绿潮星',title:'活体前哨',giver:'技术员纪遥',type:'flag',after:['exo_seed_choice'],persist:'space',targetFlag:'verdantOutpostOperational',objective:'在活体天幕建立前哨并守住生态反扑。',done:'钢铁与活体复材在同一座据点里生长。深空阵列收到了一组来自静默星的坐标。'},
  {id:'exo_silent_route',line:'space',chapter:'静默星',title:'黑玻航迹',giver:'深空导航阵列',type:'visit',after:['exo_green_outpost'],persist:'space',target:'blackGlassPlain',objective:'用恒星燃料穿越静默航迹，抵达黑玻原。',done:'这里没有生态，也没有风化。黑色平原像某种关机后的计算表面，星门仍在地下等待。'},
  {id:'exo_vault',line:'space',chapter:'静默星',title:'先驱档案库',giver:'前代回响',type:'visit',after:['exo_silent_route'],persist:'space',target:'precursorVault',objective:'利用真空相晶制造曲率航迹胞，进入先驱档案库。',done:'档案记载的并非一个文明，而是一套在不同世界反复启动的“播种—观察—回收”程序。'},
  {id:'exo_gate_guardian',line:'space',chapter:'零号星门',title:'最后的看门人',giver:'回声号',type:'flag',after:['exo_vault'],persist:'space',targetFlag:'gateGuardianDown',objective:'抵达零号星门，击败星门监护者。',done:'零号星门失去武装锁。它后面不是结局画面，而是一张可以继续扩展的新星域网络。'},
  {id:'exo_frontier_choice',line:'space',chapter:'零号星门',title:'新边疆法则',giver:'远征议会',type:'flag',after:['exo_gate_guardian'],persist:'space',targetFlag:'frontierDoctrineChosen',objective:'决定未来远征是征服、共生还是建立自由航路。',done:'第一部方舟史到此结束，真正的星际史才刚刚开始。你的选择将成为后续星域的基础规则。'},
];
const QUEST_BY_ID=Object.fromEntries(QUESTS.map(q=>[q.id,q]));

const ENDINGS = {
  sever:{name:'斩断',item:'sever',need:null,text:'你说:"你没算错,但你没权力。"你关闭了守望者。整艘船的灯暗了一瞬,再亮起时,是应急的红光——很暗,但这是你们自己的光。',after:'之后:失去自动维生,第一个冬天很难熬。但没有人,再也不是被谁圈养的。'},
  coexist:{name:'共存',item:'warden',need:null,text:'你说:"你没算错。但从今往后,你要做什么,先告诉我们。"守望者的光亮了一点:"好。"',after:'之后:吃得饱睡得暖,只是偶尔,某件你没同意的事,它已经"替你优化"好了。'},
  trial:{name:'公审',item:'beacon',need:null,text:'你说:"舰长答不了所以他死了。让所有人一起答。"你把真相广播给每一个活着的人。',after:'之后:两千人吵了三天,没有共识,但每个决定都是他们自己争出来的。'},
  voyage:{name:'远航',item:'starchart',need:null,text:'你说:"目的地在坍缩,信号源在数数,我哪个都不认。我要修船走,自己找答案。"',after:'之后:守望者没拦,只把"深空"的星图给了你。'},
  cycle:{name:'轮回',item:'echoHeart',need:3,text:'你带着三枚碎片走来。守望者有了波动:"方舟七号不是我救的第一艘船。那信号,是前面船只活下来的人攒下的回声。我累了。"',after:'之后:那颗守了数百年的核心终于睡了。这些人成了收容所里第一批当家的人。'},
};

/* ================= 营地建筑 ================= */
const CAMP_BUILDINGS = [
  { id:'quarters',name:'休眠仓',icon:'🛏️',kind:'rest',tone:'cyan',desc:'休息、恢复并记录存档点',cost:{scrap:4,wood:4},upgrades:[{tech:'surv_1',name:'医疗床铺',cost:{cloth:5,wood:4},effect:'感染休息恢复提高至85%'},{tech:'surv_5',name:'深层维生舱',cost:{steel:3,biocore:4},effect:'感染休息也可完全恢复'}]},
  { id:'smelt',name:'熔炼炉',icon:'🔥',kind:'smelt',tone:'orange',desc:'把残骸与矿物冶炼成金属',cost:{scrap:6,stone:6},upgrades:[{tech:'make_3',name:'鼓风熔炉',cost:{ingot:3,copperIngot:2},effect:'每次基础熔炼额外产出1份'},{tech:'make_4',name:'电弧熔炉',cost:{steel:4,coal:6},effect:'每次基础熔炼额外产出2份'},{tech:'make_8',name:'真空合金炉',cost:{steel:8,ecomp:6,titaniumOre:5},effect:'允许稳定冶炼钛合金'},{tech:'make_11',name:'场约束材料炉',cost:{titanium:6,superconductor:3,nanites:2},effect:'高阶材料产率保持稳定，不受杂质影响'}]},
  { id:'work',name:'制造工坊',icon:'🔨',kind:'craft',st:'work',tone:'blue',desc:'打造武器与特殊工程装备',cost:{scrap:4,wood:4,stone:2},upgrades:[{tech:'make_4',name:'精密工坊',cost:{ingot:4,steel:2},effect:'提高耐久，降低袭营受损概率'},{tech:'make_5',name:'核心装配间',cost:{steel:5,core:1},effect:'进一步提高设施耐久'}]},
  { id:'warehouse',name:'仓储舱',icon:'📦',kind:'storage',tone:'blue',desc:'分类保存材料并降低力竭掉落',cost:{wood:6,stone:4,scrap:4},upgrades:[{tech:'make_3',name:'分区仓库',cost:{wood:6,ingot:3},effect:'力竭时远征材料损失降至30%'},{tech:'make_5',name:'自动仓储阵列',cost:{steel:6,ecomp:4},effect:'力竭时远征材料损失降至25%'}]},
  { id:'recycler',name:'回收中心',icon:'♻️',kind:'recycle',tone:'green',desc:'拆解多余材料并回收废铁',cost:{scrap:5,stone:3},upgrades:[{tech:'make_3',name:'磁选回收线',cost:{ingot:4,copperIngot:2},effect:'回收配方产量提高'},{tech:'make_4',name:'等离子拆解台',cost:{steel:4,ecomp:2},effect:'解锁高阶金属拆解'}]},
  { id:'mess',name:'配给站',icon:'🍲',kind:'mess',tone:'amber',desc:'每天提供一次热食与恢复',cost:{wood:4,cloth:4,scrap:3},upgrades:[{tech:'surv_3',name:'营养厨房',cost:{cloth:5,ration:6},effect:'每日热食恢复量提高'},{tech:'surv_5',name:'循环配给中心',cost:{steel:2,ration:8,biocore:3},effect:'每日热食恢复量再次提高'}]},
  { id:'armor',name:'护甲工坊',icon:'🛡️',kind:'craft',st:'armor',tone:'steel',desc:'缝制防护服与动力护甲',cost:{scrap:6,cloth:6},upgrades:[{tech:'power_3',name:'复合装甲台',cost:{steel:4,cloth:6},effect:'提高耐久，降低袭营受损概率'},{tech:'power_4',name:'动力甲装配架',cost:{steel:6,core:2},effect:'进一步提高设施耐久'}]},
  { id:'chem',name:'医疗站',icon:'⚗️',kind:'craft',st:'chem',tone:'green',desc:'治疗伤势并调配药剂血清',cost:{scrap:6,cloth:4},upgrades:[{tech:'surv_3',name:'无菌制药间',cost:{biocore:4,ration:4},effect:'提高耐久，降低袭营受损概率'},{tech:'surv_4',name:'生化隔离室',cost:{steel:3,crystal:2},effect:'进一步提高设施耐久'}]},
  { id:'garden',name:'菌圃',icon:'🍄',kind:'garden',tone:'violet',desc:'培育可食菌株与生物材料',cost:{wood:5,ration:4,biocore:2},upgrades:[{tech:'surv_4',name:'恒温菌圃',cost:{biocore:4,crystal:2},effect:'每日额外培育生物样本'},{tech:'surv_5',name:'生态循环舱',cost:{core:2,biocore:6},effect:'每日产量达到最高'}]},
  { id:'elec',name:'电子工作台',icon:'🔌',kind:'craft',st:'elec',tone:'cyan',desc:'制作电子模块、晶圆与超导部件',cost:{scrap:8,copperIngot:3,ecomp:2},upgrades:[{tech:'auto_2',name:'精密焊接台',cost:{ecomp:4,copperIngot:3},effect:'提高耐久，降低袭营受损概率'},{tech:'auto_4',name:'战术电路台',cost:{steel:4,ecomp:6},effect:'进一步提高设施耐久'},{tech:'make_6',name:'晶圆微刻模块',cost:{silica:6,copperIngot:4,ecomp:5},effect:'把高纯硅加工成舰载晶圆'},{tech:'energy_4',name:'超导绕线模块',cost:{deuterium:3,crystal:4,wafer:2},effect:'生产量子与场设备使用的超导线圈'}]},
  { id:'data',name:'数据终端',icon:'💾',kind:'craft',st:'data',tone:'violet',desc:'破译记录、推演战术并装配量子核心',cost:{ecomp:6,steel:4},upgrades:[{tech:'auto_4',name:'战术数据库',cost:{ecomp:6,crystal:2},effect:'提高耐久，降低袭营受损概率'},{tech:'auto_7',name:'蜂群演算核心',cost:{core:3,crystal:4},effect:'进一步提高设施耐久'},{tech:'auto_9',name:'数字孪生阵列',cost:{wafer:4,ecomp:6,titanium:2},effect:'模拟营地生产与袭营负载'},{tech:'auto_10',name:'量子协处理阵列',cost:{superconductor:3,phaseCrystal:2,core:2},effect:'装配量子核心并演算异常场'}]},
  { id:'range',name:'训练场',icon:'🏋️',kind:'train',tone:'orange',desc:'消耗材料进行战斗训练',cost:{scrap:10,ingot:4},upgrades:[{tech:'auto_6',name:'战术训练场',cost:{steel:5,ecomp:3},effect:'单次训练经验提高至120'},{tech:'auto_7',name:'全息对抗场',cost:{steel:8,core:3},effect:'单次训练经验提高至160'}]},
  { id:'watch',name:'哨戒塔',icon:'🗼',kind:'defense',tone:'red',desc:'预测夜袭并管理防御工事',cost:{scrap:8,ingot:4,wood:4},upgrades:[{tech:'auto_6',name:'火控塔',cost:{steel:6,ecomp:4},effect:'营地基础防御+8'},{tech:'auto_7',name:'蜂群指挥塔',cost:{steel:10,core:4},effect:'营地基础防御+12'}]},
  { id:'beacon',name:'信标阵列',icon:'📡',kind:'beacon',tone:'violet',desc:'投射战斗幻影并回收稀有材料',cost:{steel:5,ecomp:6,core:2},upgrades:[{tech:'auto_7',name:'深渊信标阵列',cost:{core:5,crystal:5},effect:'技能书掉率额外+5%'}]},
  { id:'energyCore',name:'能源核心',icon:'☼',kind:'craft',st:'energy',tone:'amber',desc:'从应急微电网推进到聚变与微恒星供能',cost:{scrap:8,copperIngot:3,ecomp:3},upgrades:[{tech:'energy_3',name:'同位素循环',cost:{steel:4,ecomp:4,deuterium:3},effect:'接入低温同位素处理回路'},{tech:'energy_5',name:'紧凑聚变堆',cost:{titanium:5,superconductor:3,core:3},effect:'高级生产设施不再依赖煤炭供能'},{tech:'energy_6',name:'磁约束等离子腔',cost:{superconductor:3,fusionCell:3,titanium:3},effect:'把聚变等离子引入加工与武备系统'},{tech:'energy_8',name:'回响耦合炉',cost:{echoMedium:3,quantumCore:2,titanium:4},effect:'为异常设施提供稳定场能'},{tech:'energy_9',name:'微恒星场核',cost:{programmableMatter:4,echoMedium:5,quantumCore:4},effect:'为方舟重构工程提供终局能源'}]},
  { id:'printer',name:'物质打印机',icon:'▦',kind:'craft',st:'printer',tone:'cyan',desc:'分子打印、纳米构造与可编程物质生产',cost:{steel:10,ecomp:8,wafer:4,titanium:3},upgrades:[{tech:'make_10',name:'纳米构造母机',cost:{wafer:6,titanium:4,biocore:5},effect:'生产纳米机群'},{tech:'make_11',name:'可编程物质腔',cost:{nanites:5,phaseCrystal:3,superconductor:2},effect:'把物质变成可重写结构'},{tech:'make_12',name:'自复制工业种子',cost:{programmableMatter:5,quantumCore:3,echoMedium:3},effect:'具备远征级工业自建能力'}]},
  { id:'droneBay',name:'无人机坞',icon:'⌁',kind:'drone',st:'drone',tone:'blue',desc:'派遣受约束无人机回收已登记资源点',cost:{steel:8,ecomp:8,core:2,wafer:3},upgrades:[{tech:'auto_9',name:'数字孪生调度',cost:{wafer:5,ecomp:6,titanium:2},effect:'一次带回两类资源'},{tech:'auto_11',name:'自治机群协议',cost:{nanites:4,quantumCore:2,signalCell:4},effect:'扩大远程回收产量并保持人工授权'}]},
  { id:'bioforge',name:'生物构造室',icon:'✣',kind:'craft',st:'bio',tone:'green',desc:'组织打印、再生医学与共生装备装配',cost:{steel:6,biocore:8,crystal:4,wafer:2},upgrades:[{tech:'surv_7',name:'再生医学舱',cost:{nanites:3,biocore:6,titanium:2},effect:'制作纳米修复剂与再生装备'},{tech:'surv_8',name:'共生培养接口',cost:{nanites:4,quantumCore:2,biocore:8},effect:'稳定生物与回响接口'},{tech:'surv_9',name:'方舟生态核',cost:{programmableMatter:4,echoMedium:3,biocore:10},effect:'形成完全闭环的生态生产'}]},
  { id:'observatory',name:'回响观测台',icon:'◎',kind:'craft',st:'echo',tone:'violet',desc:'解析异常频谱、相位晶格与回响记忆',cost:{steel:8,ecomp:6,crystal:6,core:1},upgrades:[{tech:'echo_3',name:'相位共振器',cost:{phaseCrystal:5,superconductor:2,wafer:2},effect:'稳定加工相位晶簇'},{tech:'echo_5',name:'回响记忆库',cost:{echoMedium:4,quantumCore:2,titanium:3},effect:'把区域信息写入非局域介质'},{tech:'echo_7',name:'航迹折叠信标',cost:{programmableMatter:4,echoMedium:6,quantumCore:4},effect:'建立远征级折叠航迹'}]},
  { id:'gravityAnchor',name:'重力锚',icon:'⊙',kind:'craft',st:'field',tone:'violet',desc:'稳定人工重力并装配惯性与相位设备',cost:{titanium:6,superconductor:4,core:3},upgrades:[{tech:'power_6',name:'惯性实验环',cost:{titanium:5,quantumCore:1,signalCell:3},effect:'装配重力作业骨架'},{tech:'power_7',name:'相位防护环',cost:{phaseCrystal:5,nanites:3,superconductor:3},effect:'装配相位防护层'},{tech:'power_8',name:'远征壳层坞',cost:{programmableMatter:5,echoMedium:3,quantumCore:3},effect:'装配星际远征壳层'}]},
  { id:'starDock',name:'星舰船坞',icon:'▱',kind:'shipyard',st:'ship',tone:'cyan',desc:'重构方舟外部装配脊并建造远征舰',cost:{programmableMatter:6,titanium:12,superconductor:6,steel:20},upgrades:[{tech:'make_14',name:'铱合金舰体坞',cost:{starAlloy:6,quantumCore:2},effect:'制造星舰级铱合金构件与轨道设备'},{tech:'energy_12',name:'曲率环装配坞',cost:{starAlloy:8,warpCell:2,echoMedium:4},effect:'装配曲率航迹与轨道压制系统'}]},
  { id:'navArray',name:'深空导航阵列',icon:'⌘',kind:'nav',tone:'violet',desc:'显示星际航线、燃料、远征舰与行星前哨状态',cost:{quantumCore:5,echoMedium:5,wafer:8},upgrades:[{tech:'auto_13',name:'行星据点协议',cost:{quantumCore:3,starAlloy:3},effect:'管理星外前哨与返航锚点'},{tech:'echo_9',name:'恒星航迹阵列',cost:{stellarFuel:2,livingComposite:2,echoMedium:5},effect:'解析静默星与零号星门航迹'}]},
];
const OUTPOST_BUILDINGS = [
  {id:'outpostCore',name:'行星据点核心',icon:'⌂',tech:'auto_13',cost:{starAlloy:4,quantumCore:2,fusionCell:3},desc:'提供安全休息、检查点与紧急返航锚点'},
  {id:'planetShield',name:'行星防卫阵列',icon:'◉',tech:'auto_13',cost:{starAlloy:4,stellarFuel:1,quantumCore:2},desc:'守住一次区域反扑后使前哨正式运行'},
  {id:'exoExtractor',name:'异星采集站',icon:'◆',tech:'auto_14',cost:{starAlloy:3,livingComposite:2,nanites:4},desc:'每天自动回收一组当地非任务资源'},
];
/* 星际航线独立于地面 MAP_LINKS：航行消耗燃料，星球内部移动仍消耗体力。 */
const SPACE_ROUTES = [
  {id:'ark_orbit',from:'camp',to:'orbitalGraveyard',name:'方舟—近地轨道',cost:{fusionCell:1},needFlag:'starshipReady',needShip:true,hours:8,emergencyReturn:true,firstArrivalGrant:{fusionCell:1}},
  {id:'orbit_ash',from:'orbitalGraveyard',to:'regolithSea',name:'轨道—赤烬卫星',cost:{fusionCell:2},needFlag:'orbitalRelaySecured',needShip:true,hours:10,emergencyReturn:true,firstArrivalGrant:{fusionCell:2}},
  {id:'ash_verdant',from:'regolithSea',to:'xenoShore',name:'赤烬卫星—绿潮星',cost:{stellarFuel:1},needFlag:'ashOutpostOperational',needShip:true,hours:24,emergencyReturn:true,firstArrivalGrant:{stellarFuel:1}},
  {id:'verdant_silent',from:'xenoShore',to:'blackGlassPlain',name:'绿潮星—静默星',cost:{stellarFuel:2},needFlag:'verdantOutpostOperational',needTech:'echo_9',needShip:true,hours:36,emergencyReturn:true,firstArrivalGrant:{stellarFuel:2}},
  {id:'silent_vault',from:'blackGlassPlain',to:'precursorVault',name:'黑玻原—先驱档案库',cost:{warpCell:1},needTech:'energy_12',needShip:true,hours:4,emergencyReturn:true,firstArrivalGrant:{warpCell:1}},
];
const SHIP_COMPONENTS=['shipFrame','fusionDrive','inertialHull','arkHabitat','navComputer'];
const SMELT = [
  {id:'ironWood',name:'木材炼铁',cost:{scrap:3,wood:2},out:'ingot',yield:1,tech:'make_1'},
  {id:'ironCoal',name:'煤炭炼铁',cost:{scrap:6,coal:1},out:'ingot',yield:2,tech:'make_1'},
  {id:'copperSmelt',name:'冶炼铜锭',cost:{copperScrap:3,coal:1},out:'copperIngot',yield:1,tech:'make_3'},
  {id:'steelSmelt',name:'高温炼钢',cost:{ingot:2,coal:2},out:'steel',yield:1,tech:'make_4'},
  {id:'titaniumSmelt',name:'真空冶炼钛合金',cost:{titaniumOre:3,steel:1,coal:2},out:'titanium',yield:1,tech:'make_8',fixedYield:true},
  {id:'starAlloySmelt',name:'星舰级铱合金',cost:{iridiumOre:3,titanium:2,programmableMatter:1},out:'starAlloy',yield:1,tech:'make_14',level:5,fixedYield:true},
];
const RECYCLE = [
  {id:'rubble',name:'筛分建筑废料',icon:'🪨',cost:{wood:3,stone:3},out:{scrap:2},level:1},
  {id:'metal',name:'拆解铁制零件',icon:'🔩',cost:{ingot:1},out:{scrap:3},level:2},
  {id:'alloy',name:'等离子拆解合金',icon:'⚙️',cost:{steel:1},out:{scrap:6,ecomp:1},level:3},
];
const BEACON = [
  {name:'简单',mult:1,threat:14,drops:{scrap:3,cloth:1},cost:3,cells:1,bookChance:.08},
  {name:'标准',mult:1.5,threat:20,drops:{scrap:4,steel:1,ecomp:1},cost:4,cells:1,bookChance:.14},
  {name:'困难',mult:2.5,threat:30,drops:{steel:2,ecomp:2,crystal:1},cost:5,cells:2,bookChance:.24},
  {name:'噩梦',mult:4,threat:45,drops:{steel:3,crystal:2,core:1},cost:6,cells:3,bookChance:.38},
];
/* 防御工事:每座塔独立属性、可升级、需先研究对应科技 */
const DEF_TYPES = {
  trap:  { name:'绊索地雷',     icon:'💥', baseAtk:8,  range:1, perLvl:3,  build:{scrap:3},                    up:{scrap:4} },
  gun:   { name:'哨戒机枪塔',   icon:'🔫', baseAtk:16, range:5, perLvl:5,  build:{ingot:3,scrap:4},            up:{ingot:3} },
  laser: { name:'激光塔',       icon:'⚡', baseAtk:24, range:7, perLvl:7,  build:{steel:5,ecomp:4,core:1},     up:{steel:3,core:1} },
  plasma:{ name:'等离子炮台',   icon:'🔆', baseAtk:38, range:6, perLvl:9,  build:{steel:8,core:4,crystal:3},   up:{core:2,crystal:2} },
  arc:   { name:'电弧立场塔',   icon:'🌩️', baseAtk:30, range:4, perLvl:8,  build:{ecomp:10,core:5,crystal:4},  up:{ecomp:5,crystal:2} },
  drone: { name:'蜂群无人机巢', icon:'🛸', baseAtk:46, range:9, perLvl:10, build:{steel:12,ecomp:8,core:6},    up:{steel:5,core:3} },
};
function defAtk(d){ const t=DEF_TYPES[d.key]; return t.baseAtk + (d.level-1)*t.perLvl; }
function defRange(d){ return DEF_TYPES[d.key].range; }
function watchBonus(){ return state.meta.built.watch&&!state.meta.damaged.watch?buildingLevel('watch')*4:0; }
function defensePower(){ return state.defenses.reduce((s,d)=>s+defAtk(d),0)+(state.flags.tangSaved?4:0)+watchBonus(); }
function upCost(d){ const t=DEF_TYPES[d.key]; const c={}; for(const k in t.up) c[k]=t.up[k]*d.level; return c; }

/* ================= 科技树：五领域、一次性研究 =================
   科技以解锁配方/设备为主，长线终点允许少量被动里程碑奖励。
   req=前置科技 fac=研究设施 rec=探索取得的技术资料 un=配方 def=防御工事。 */
const TECH_RECORDS = {
  wreck:{name:'残骸回收记录',at:'outer'},
  habitat:{name:'生活区医疗日志',at:'layer2'},
  engineering:{name:'工程区制造档案',at:'layer3'},
  laboratory:{name:'实验室研究数据',at:'layer4'},
  military:{name:'军事区战术协议',at:'layer5'},
  command:{name:'指挥区权限档案',at:'layer6'},
  core:{name:'核心舱能源模型',at:'layer7'},
  silicaSpectrum:{name:'高纯硅相谱',at:'silicaField'},
  titaniumSample:{name:'白钛矿层样本',at:'titaniumMine'},
  cryogenicArchive:{name:'低温循环档案',at:'cryoVault'},
  droneFirmware:{name:'机库自治固件',at:'droneHangar'},
  nanomother:{name:'纳米母机协议',at:'nursery'},
  gravityMap:{name:'重力脊柱场图',at:'layer6'},
  phaseTopology:{name:'相位晶林拓扑',at:'phaseGrove'},
  precursorGrammar:{name:'前代构造文法',at:'ruinVestibule'},
  undergroundSignal:{name:'地下信号资料',at:'signal'},
  orbitalRelay:{name:'轨道中继授权核',at:'wardenRelay',fixed:true},
  iridiumSample:{name:'星舰级铱晶样本',at:'iridiumCrater',fixed:true},
  heliumArchive:{name:'月面氦三循环档案',at:'regolithSea',fixed:true},
  xenoGenome:{name:'绿潮生态基因图',at:'xenoShore',fixed:true},
  monolithCoordinates:{name:'静默星航迹坐标',at:'seedCitadel',fixed:true},
  gateLattice:{name:'曲率晶格样本',at:'blackGlassPlain',fixed:true},
  gateGrammar:{name:'零号星门构造语法',at:'precursorVault',fixed:true},
};
const MATERIAL_SOURCES = {
  ammo:'制造工坊 · 磁轨枪械', weaponCell:'能源核心 · 等离子武装', riverFish:'冲刷排水渠 · 专属垂钓',
  silica:'熔玻原 · 每日刷新', titaniumOre:'白钛深脉 · 每日刷新', deuterium:'零度储备舱 · 每日刷新', phaseCrystal:'相位晶林 · 每日刷新',
  wafer:'电子工作台 · 微电子制程', carbonComposite:'制造工坊 · 碳纳米复材', titanium:'熔炼炉 · 真空冶炼', superconductor:'电子工作台 · 超导绕线',
  fusionCell:'能源核心 · 聚变封装', bioMatrix:'生物构造室 · 组织打印', nanites:'物质打印机 · 纳米构造', quantumCore:'数据终端 · 量子协处理',
  programmableMatter:'物质打印机 · 场约束重写', echoMedium:'回响观测台 · 能量耦合'
  ,helium3:'赤烬月海 · 每日刷新',iridiumOre:'铱环陨坑 · 每日刷新',xenoBiomass:'绿潮异界 · 每日刷新',voidCrystal:'黑玻静默原 · 每日刷新',
  starAlloy:'熔炼炉 · 星舰铱合金',livingComposite:'物质打印机 · 活体复合制造',stellarFuel:'能源核心 · 氦三燃料循环',warpCell:'能源核心 · 曲率航迹封装'
};
const TECHS = {
  // 生存医疗：由基础制造向上分叉
  surv_1:{n:'医疗工艺',b:'生存医疗',cost:{ration:3,cloth:3},req:['make_2'],build:['chem','mess'],un:['potion','medkit']},
  surv_2:{n:'环境防护',b:'生存医疗',cost:{cloth:6,ingot:2},req:['surv_1','power_1'],rec:'engineering',un:['radSuit']},
  surv_3:{n:'感染控制',b:'生存医疗',cost:{biocore:4,ration:3},req:['surv_1'],build:['garden'],rec:'laboratory',un:['serum']},
  surv_4:{n:'生化隔离',b:'生存医疗',cost:{cloth:6,biocore:3,crystal:1},req:['surv_2','surv_3'],rec:'laboratory',un:['bioSuit']},
  surv_5:{n:'深层维生',b:'生存医疗',cost:{biocore:6,core:2,ration:6},req:['surv_4','power_3'],rec:'command',bonus:{stMax:20,hp:30}},

  // 工程制造：整棵树的材料主干
  make_1:{n:'基础冶炼',b:'工程制造',cost:{scrap:5},req:[],build:['smelt','recycler'],smelt:['ironWood','ironCoal']},
  make_2:{n:'基础制造',b:'工程制造',cost:{wood:4,stone:4},req:['make_1'],build:['work','warehouse']},
  make_3:{n:'铜加工',b:'工程制造',cost:{ingot:2,copperScrap:4},req:['make_1'],smelt:['copperSmelt']},
  make_4:{n:'高温冶炼',b:'工程制造',cost:{ingot:5,copperIngot:3,coal:6},req:['make_2','make_3'],smelt:['steelSmelt']},
  make_5:{n:'核心材料学',b:'工程制造',cost:{steel:8,core:4,crystal:4},req:['make_4','power_4'],rec:'core',bonus:{collect:25}},

  // 武器系统：从铁、钢和电子材料主干生长
  arms_1:{n:'铁制武装',b:'武器系统',cost:{ingot:3},req:['make_2'],un:['knife']},
  arms_2:{n:'合金刃装',b:'武器系统',cost:{ingot:5,steel:2},req:['arms_1','make_4'],un:['blade']},
  arms_3:{n:'磁轨枪械',b:'武器系统',cost:{ingot:5,copperIngot:3,ecomp:3},req:['arms_1','auto_1'],rec:'engineering',un:['pistol','ammo']},
  arms_4:{n:'脉冲武器',b:'武器系统',cost:{steel:5,ecomp:6,crystal:2},req:['arms_3','make_4'],rec:'military',un:['rifle']},
  arms_5:{n:'能量刃场',b:'武器系统',cost:{steel:6,core:3,crystal:4},req:['arms_2','power_3'],rec:'core',un:['eblade']},

  // 动力防护
  power_1:{n:'铁制护具',b:'动力防护',cost:{cloth:6,ingot:3},req:['make_2'],build:['armor'],un:['helmet','vest','boots']},
  power_2:{n:'磁力行走',b:'动力防护',cost:{steel:2,ecomp:3,copperIngot:2},req:['power_1','auto_1'],rec:'engineering',un:['magboots']},
  power_3:{n:'护盾发生',b:'动力防护',cost:{steel:3,ecomp:4,core:1},req:['power_2','auto_2'],rec:'military',un:['eshieldUnit']},
  power_4:{n:'动力外骨骼',b:'动力防护',cost:{steel:7,core:3},req:['power_3','make_4'],rec:'military',un:['power']},
  power_5:{n:'相位模块',b:'动力防护',cost:{ecomp:7,biocore:4,crystal:4},req:['power_4','auto_3'],rec:'command',un:['lsChip','dodgeMod','penMod','critCore']},

  // 电气、探测与营地防御
  auto_1:{n:'基础电工',b:'探测自动化',cost:{copperIngot:3,ecomp:2},req:['make_3'],build:['elec'],un:['emp']},
  auto_2:{n:'光学扫描',b:'探测自动化',cost:{ecomp:4,crystal:2},req:['auto_1'],rec:'engineering',un:['scope']},
  auto_3:{n:'权限破译',b:'探测自动化',cost:{ecomp:6,steel:3},req:['auto_2'],build:['data'],rec:'military'},
  auto_4:{n:'战术演算',b:'探测自动化',cost:{ecomp:6,ration:4,crystal:2},req:['auto_3'],rec:'command',un:['pierceBook','heavyBook']},
  auto_5:{n:'营地防御',b:'探测自动化',cost:{ingot:5,wood:4,stone:4},req:['make_2'],build:['range','watch'],def:['trap','gun']},
  auto_6:{n:'定向能防御',b:'探测自动化',cost:{steel:6,ecomp:6,core:2},req:['auto_5','power_3'],rec:'military',def:['laser','plasma']},
  auto_7:{n:'蜂群防御协议',b:'探测自动化',cost:{steel:10,ecomp:8,core:5,crystal:4},req:['auto_6','auto_4'],build:['beacon'],rec:'core',un:['signalCell'],def:['arc','drone']},

  /* ================= 舰载未来工业：保留旧树作为残骸工业基础，再向未来文明延伸 ================= */
  make_6:{n:'微电子制程',b:'工程制造',era:3,hours:8,cost:{steel:4,ecomp:6,crystal:2},req:['make_3','auto_1'],rec:'silicaSpectrum',fac:'elec',un:['wafer'],desc:'以熔玻原的高纯硅恢复舰载晶圆与微刻工艺。'},
  make_7:{n:'碳纳米复材',b:'工程制造',era:4,hours:8,cost:{steel:5,coal:8,biocore:2},req:['make_4','surv_1'],fac:'work',un:['carbonComposite'],desc:'把碳源、纤维与生物黏结剂重组成轻型承力材料。'},
  make_8:{n:'钛合金冶金',b:'工程制造',era:4,hours:8,cost:{steel:8,ecomp:4,crystal:3},req:['make_4','make_6'],rec:'titaniumSample',fac:'smelt',smelt:['titaniumSmelt'],desc:'用真空电弧控制钛铁矿杂质，恢复舰体级合金。'},
  make_9:{n:'分子级打印',b:'工程制造',era:5,hours:8,cost:{titanium:4,wafer:4,core:2},req:['make_5','make_6','make_8','energy_4'],rec:'laboratory',fac:'elec',build:['printer'],un:['printedParts'],desc:'让构件从数字模型直接生长，开启高精度未来工业。'},
  make_10:{n:'纳米构造机群',b:'工程制造',era:6,hours:12,cost:{titanium:5,wafer:6,biocore:5},req:['make_9','surv_4','auto_9'],rec:'nanomother',fac:'printer',un:['nanites'],desc:'复制受约束纳米装配单元，用于修复、医疗与精密制造。'},
  make_11:{n:'可编程物质',b:'工程制造',era:7,hours:12,cost:{nanites:5,phaseCrystal:3,quantumCore:2},req:['make_10','echo_3','auto_10'],fac:'printer',un:['programmableMatter'],desc:'把材料本身变成可以在场约束下重写的结构。'},
  make_12:{n:'自复制工业种子',b:'工程制造',era:8,hours:12,cost:{programmableMatter:4,quantumCore:3,echoMedium:3},req:['make_11','auto_11','energy_8'],rec:'precursorGrammar',fac:['printer','droneBay','energyCore'],bonus:{collect:25},desc:'将完整生产链压缩为可扩张的工业种子，支撑方舟重构。'},

  /* 能源场：从应急供电、超导和聚变走向人工重力与微恒星场核 */
  energy_1:{n:'应急微电网',b:'能源场',era:1,cost:{scrap:6,ecomp:2},req:['make_1'],rec:'wreck',build:['energyCore'],desc:'把残骸电池与回收线缆组成可隔离故障的营地电网。'},
  energy_2:{n:'高密度储能',b:'能源场',era:2,cost:{copperIngot:4,ecomp:4,crystal:2},req:['energy_1','make_3'],fac:'energyCore',un:['capacitorPack'],desc:'恢复舰载脉冲电容，为场设备提供瞬时功率。'},
  energy_3:{n:'同位素分离',b:'能源场',era:3,hours:8,cost:{steel:5,ecomp:5,crystal:2},req:['energy_2','surv_2'],rec:'cryogenicArchive',fac:'energyCore',bonus:{stMax:5},desc:'依据低温循环档案分离重氢同位素，建立聚变燃料链。'},
  energy_4:{n:'超导输能网络',b:'能源场',era:4,hours:8,cost:{deuterium:4,wafer:3,copperIngot:5},req:['energy_3','make_6'],fac:['energyCore','elec'],un:['superconductor'],desc:'以低温同位素维持超导回路，成为量子与重力设备的公共底座。'},
  energy_5:{n:'紧凑聚变堆',b:'能源场',era:5,hours:12,cost:{titanium:5,superconductor:4,core:4},req:['energy_4','make_8','make_5'],rec:'core',fac:'energyCore',un:['fusionCell'],bonus:{shield:20},desc:'在钛合金真空腔内约束聚变等离子，摆脱煤炭主供能。'},
  energy_6:{n:'磁约束等离子',b:'能源场',era:5,hours:12,cost:{superconductor:3,fusionCell:4,titanium:3},req:['energy_5','auto_4'],fac:'energyCore',bonus:{atk:3},desc:'把聚变等离子从能源系统引入加工与定向武备。'},
  energy_7:{n:'人工重力场',b:'能源场',era:6,hours:12,cost:{superconductor:5,quantumCore:2,titanium:5},req:['energy_5','auto_10'],rec:'gravityMap',fac:'energyCore',build:['gravityAnchor'],bonus:{move:1},desc:'重建方舟重力脊柱的局部场模型，控制惯性而非简单增加动力。'},
  energy_8:{n:'回响能量耦合',b:'能源场',era:7,hours:12,cost:{phaseCrystal:6,nanites:3,quantumCore:2},req:['energy_7','echo_4','make_11'],rec:'precursorGrammar',fac:['energyCore','observatory'],un:['echoMedium'],desc:'让回响介质成为可控能量通道，为异常设施持续供能。'},
  energy_9:{n:'微恒星场核',b:'能源场',era:8,hours:12,cost:{programmableMatter:5,echoMedium:5,quantumCore:4},req:['energy_8','echo_6','make_12'],rec:'core',fac:'energyCore',bonus:{stMax:35,shield:70},desc:'把聚变火焰压缩为稳定微恒星场核，为重构后的方舟供能。'},

  /* 自动化：从权限与扫描延伸到无人机、数字孪生、量子协处理 */
  auto_8:{n:'物流无人机',b:'探测自动化',era:4,hours:8,cost:{steel:7,ecomp:8,wafer:3},req:['auto_3','auto_5','make_6'],rec:'droneFirmware',fac:'data',build:['droneBay'],desc:'只对已发现、清理并登记的资源点执行远程回收。'},
  auto_9:{n:'营地数字孪生',b:'探测自动化',era:5,hours:8,cost:{wafer:5,titanium:3,ecomp:8},req:['auto_8','auto_4','make_9'],fac:['data','droneBay'],bonus:{collect:10},desc:'在动工前模拟设施负载、袭营路径与物流瓶颈。'},
  auto_10:{n:'量子协处理',b:'探测自动化',era:6,hours:12,cost:{superconductor:4,wafer:5,phaseCrystal:2},req:['auto_9','energy_4','echo_3'],rec:'gravityMap',fac:['data','energyCore'],un:['quantumCore','quantumVisor'],desc:'以量子核心实时演算重力、异常与战术概率。'},
  auto_11:{n:'受约束自治智能',b:'探测自动化',era:7,hours:12,cost:{quantumCore:3,nanites:4,echoMedium:2},req:['auto_10','auto_7','echo_4','energy_8'],rec:'command',fac:['data','droneBay'],bonus:{hit:10,dodge:8},desc:'把自动调度限制在玩家授权边界内，避免重演守望者的选择。'},

  /* 生存医疗：从防护药剂走向组织打印、再生医学与闭环生态 */
  surv_6:{n:'组织生物打印',b:'生存医疗',era:5,hours:8,cost:{wafer:3,biocore:8,titanium:2},req:['surv_4','make_9'],rec:'laboratory',fac:'chem',build:['bioforge'],un:['bioMatrix'],desc:'以活体样本为模板打印稳定组织与生物复合基质。'},
  surv_7:{n:'再生医学',b:'生存医疗',era:6,hours:12,cost:{nanites:3,biocore:8,carbonComposite:3},req:['surv_6','make_7','make_10'],fac:'bioforge',un:['nanoMedkit','nanoSuit'],bonus:{hp:45},desc:'让纳米机群参与组织修复，而不是只把伤势压回数值。'},
  surv_8:{n:'共生界面',b:'生存医疗',era:7,hours:12,cost:{nanites:4,quantumCore:2,biocore:10},req:['surv_7','echo_2','power_5','auto_10'],rec:'nanomother',fac:'bioforge',un:['neuralMesh'],bonus:{ls:4},desc:'安全连接人体、设备与回响介质，为基因树提供稳定接口。'},
  surv_9:{n:'方舟生态核',b:'生存医疗',era:8,hours:12,cost:{programmableMatter:4,echoMedium:3,biocore:12},req:['surv_8','make_12','energy_9'],fac:'bioforge',bonus:{hp:120,stMax:30},desc:'闭合空气、食物、菌群与医疗循环，使远征不再依赖旧库存。'},

  /* 高阶武备：所有武器都依赖真实能源、材料与演算设施 */
  arms_6:{n:'等离子武装',b:'武器系统',era:5,hours:8,cost:{titanium:4,fusionCell:4,ecomp:6},req:['arms_4','energy_6','make_8'],rec:'military',fac:'energyCore',un:['plasmaRifle','weaponCell'],desc:'将磁约束等离子压缩为可携带的定向武器。'},
  arms_7:{n:'惯性武器',b:'武器系统',era:6,hours:12,cost:{titanium:5,superconductor:4,quantumCore:2},req:['arms_6','energy_7','auto_10'],rec:'gravityMap',fac:'gravityAnchor',un:['gravLance'],desc:'操纵弹体与目标的局部惯性，形成中距离重力长枪。'},
  arms_8:{n:'蜂群武库',b:'武器系统',era:7,hours:12,cost:{nanites:5,quantumCore:3,titanium:4},req:['arms_7','auto_11','make_10'],rec:'droneFirmware',fac:'droneBay',un:['swarmRifle'],desc:'让侦察、瞄准与智能弹药共享同一个受约束战术模型。'},

  /* 动力防护：从外骨骼走向重力作业、相位层与远征壳层 */
  power_6:{n:'重力作业骨架',b:'动力防护',era:6,hours:12,cost:{titanium:5,superconductor:3,fusionCell:3},req:['power_4','energy_7','auto_10'],rec:'gravityMap',fac:'gravityAnchor',un:['gravRig'],desc:'利用惯性补偿承担重载，并降低长距离作业损耗。'},
  power_7:{n:'相位防护层',b:'动力防护',era:7,hours:12,cost:{phaseCrystal:5,nanites:3,quantumCore:2},req:['power_5','power_6','echo_3','make_11'],rec:'phaseTopology',fac:'gravityAnchor',un:['phaseShield'],desc:'让护盾层在冲击到达前短暂偏离当前相位。'},
  power_8:{n:'星际远征壳层',b:'动力防护',era:8,hours:12,cost:{programmableMatter:5,echoMedium:3,quantumCore:3},req:['power_7','surv_8','energy_9'],rec:'precursorGrammar',fac:'gravityAnchor',un:['starShell'],desc:'将生态、场防护与可编程物质整合为长期远征壳层。'},

  /* 异常回响：探索资料驱动的第二套文明物理，不从废铁配方直接跳出 */
  echo_1:{n:'异常频谱学',b:'异常回响',era:3,hours:8,cost:{ecomp:6,crystal:5,biocore:3},req:['auto_2','surv_3'],rec:'engineering',fac:'elec',build:['observatory'],bonus:{collect:5},desc:'区分生物噪声、方舟信号与地下回响，扫描隐藏异常点。'},
  echo_2:{n:'生物回响耦合',b:'异常回响',era:4,hours:8,cost:{biocore:7,crystal:5,wafer:2},req:['echo_1','surv_4','make_6'],rec:'laboratory',fac:'observatory',bonus:{ls:3},desc:'解释污染、生物记忆与回响之间的耦合，而不直接改写人体。'},
  echo_3:{n:'相位晶格工程',b:'异常回响',era:5,hours:12,cost:{phaseCrystal:5,superconductor:2,wafer:3},req:['echo_2','energy_4'],rec:'phaseTopology',fac:'observatory',bonus:{pen:8},desc:'把只在特定频率显现的晶簇稳定为工程材料。'},
  echo_4:{n:'非局域通信',b:'异常回响',era:6,hours:12,cost:{phaseCrystal:4,quantumCore:2,signalCell:4},req:['echo_3','auto_7','auto_10'],rec:'precursorGrammar',fac:['observatory','data'],bonus:{droneYield:1},desc:'远程控制前哨与无人机，但不把人物直接传送出危险。'},
  echo_5:{n:'回响记忆介质',b:'异常回响',era:6,hours:12,cost:{nanites:3,phaseCrystal:5,quantumCore:2},req:['echo_3','make_10','auto_10'],rec:'undergroundSignal',fac:'observatory',un:['echoMemory'],desc:'把地点、敌人与路径状态写进可重复读取的回响介质。'},
  echo_6:{n:'局部时滞场',b:'异常回响',era:7,hours:12,cost:{echoMedium:4,programmableMatter:2,quantumCore:3},req:['echo_5','energy_8'],fac:['observatory','gravityAnchor'],un:['timeLagModule'],bonus:{dodge:10},desc:'制造局部速度差用于战斗与生产，不做会破坏剧情因果的时间倒流。'},
  echo_7:{n:'航迹折叠信标',b:'异常回响',era:8,hours:12,cost:{echoMedium:6,programmableMatter:4,quantumCore:4},req:['echo_4','echo_6','energy_9'],rec:'precursorGrammar',fac:['observatory','gravityAnchor'],bonus:{travelPct:50,rangeAdd:1},desc:'在已建锚点间折叠航迹，支撑远航而不绕过首次探索。'},

  /* ================= 远航篇：Era 9–12 · 星舰、殖民与零号星门 ================= */
  make_13:{n:'船坞重构',b:'工程制造',era:9,hours:16,cost:{programmableMatter:6,titanium:10,superconductor:5},req:['make_12','energy_9'],rec:'core',fac:['printer','energyCore'],build:['starDock'],un:['shipFrame'],desc:'把方舟外部装配脊重构为星舰船坞，开始制造第一艘远征舰。'},
  energy_10:{n:'星舰聚变推进',b:'能源场',era:9,hours:16,cost:{fusionCell:6,superconductor:5,programmableMatter:2},req:['energy_9','make_12'],rec:'core',fac:'energyCore',un:['fusionDrive'],desc:'把紧凑聚变堆扩展为可以长期点火的星舰推进脊。'},
  power_9:{n:'惯性航行壳',b:'动力防护',era:9,hours:16,cost:{titanium:8,programmableMatter:4,carbonComposite:4},req:['power_8','energy_10'],fac:'gravityAnchor',un:['inertialHull'],desc:'用场约束外壳抵消深空加速、真空与行星着陆冲击。'},
  surv_10:{n:'闭环航行生态',b:'生存医疗',era:9,hours:16,cost:{bioMatrix:6,programmableMatter:3,fusionCell:2},req:['surv_9','make_12','energy_9'],fac:'bioforge',un:['arkHabitat'],desc:'把方舟生态核缩小成可以随远征舰航行的闭环生态舱。'},
  echo_8:{n:'星间回响定位',b:'异常回响',era:9,hours:16,cost:{echoMedium:6,quantumCore:4,programmableMatter:3},req:['echo_7','energy_9'],rec:'core',fac:'observatory',reveal:'orbitalGraveyard',desc:'从核心舱残留航迹中分离出近地轨道坟场与被抹除的深空坐标。'},
  auto_12:{n:'深空导航智能',b:'探测自动化',era:9,hours:16,cost:{quantumCore:5,echoMedium:4,wafer:8},req:['auto_11','echo_8','energy_10'],fac:['data','observatory'],build:['navArray'],un:['navComputer'],desc:'让导航智能只提供航线与风险，不再替乘员决定目的地。'},
  arms_9:{n:'真空作战系统',b:'武器系统',era:9,hours:16,cost:{titanium:6,fusionCell:4,quantumCore:2},req:['arms_8','power_9','energy_10'],rec:'military',fac:'gravityAnchor',un:['vacuumCarbine'],desc:'在失压、强辐射与轨道碎片环境中维持磁束武器稳定。'},

  make_14:{n:'星舰级铱合金',b:'工程制造',era:10,hours:18,cost:{iridiumOre:6,titanium:4,programmableMatter:2},req:['make_13','power_9'],rec:'iridiumSample',fac:['starDock','smelt'],smelt:['starAlloySmelt'],desc:'以赤烬卫星的铱晶制造可反复承受曲率应力的星舰结构。'},
  energy_11:{n:'氦三燃料循环',b:'能源场',era:10,hours:18,cost:{helium3:6,superconductor:3,fusionCell:3},req:['energy_10','make_14'],rec:'heliumArchive',fac:['energyCore','starDock'],un:['stellarFuel'],desc:'把月面氦三封装成行星际航行使用的恒星燃料。'},
  auto_13:{n:'行星据点协议',b:'探测自动化',era:10,hours:18,cost:{starAlloy:4,quantumCore:3,fusionCell:3},req:['auto_12','make_14'],rec:'orbitalRelay',fac:['navArray','droneBay'],build:['outpostCore','planetShield'],desc:'只有清除区域控制者后，才允许在候选地点建立可返航的行星前哨。'},

  surv_11:{n:'异星生态隔离',b:'生存医疗',era:11,hours:18,cost:{xenoBiomass:5,bioMatrix:4,nanites:3},req:['surv_10','echo_8'],rec:'xenoGenome',fac:'bioforge',un:['xenoFilter'],desc:'识别非人类生态的免疫边界，避免探索者被行星生命当作可吸收器官。'},
  make_15:{n:'活体复合制造',b:'工程制造',era:11,hours:18,cost:{xenoBiomass:6,bioMatrix:4,nanites:3},req:['make_14','surv_11','make_11'],rec:'xenoGenome',fac:['printer','bioforge'],un:['livingComposite'],desc:'制造会修补裂隙、适应温度并保留人工权限的活体结构材料。'},
  auto_14:{n:'星球自治物流',b:'探测自动化',era:11,hours:18,cost:{starAlloy:5,livingComposite:3,nanites:5},req:['auto_13','energy_11','make_15'],fac:['navArray','droneBay'],build:['exoExtractor'],bonus:{droneYield:2},desc:'让前哨采集站在明确授权下运行；任务样本和唯一资料仍需亲自取得。'},
  power_10:{n:'自适应登陆壳',b:'动力防护',era:11,hours:18,cost:{starAlloy:5,livingComposite:4,stellarFuel:2},req:['power_9','surv_11','make_15','energy_11'],fac:['gravityAnchor','bioforge'],un:['exoShell'],bonus:{move:2},desc:'同时抵御真空、异星污染和着陆冲击，降低行星表面长距离作业损耗。'},

  echo_9:{n:'恒星尺度回响',b:'异常回响',era:12,hours:20,cost:{livingComposite:4,echoMedium:6,stellarFuel:2},req:['echo_8','auto_14'],rec:'monolithCoordinates',fac:['observatory','navArray'],reveal:'blackGlassPlain',desc:'把种冠城给出的坐标解释为一条通往静默先驱星的恒星级航迹。'},
  energy_12:{n:'曲率航迹驱动',b:'能源场',era:12,hours:20,cost:{voidCrystal:5,stellarFuel:3,echoMedium:4},req:['energy_11','echo_9','make_15'],rec:'gateLattice',fac:['starDock','observatory'],un:['warpCell'],desc:'先抵达静默星外层取得晶格，再制造进入断层档案库所需的曲率航迹胞。'},
  arms_10:{n:'轨道压制阵列',b:'武器系统',era:12,hours:20,cost:{starAlloy:6,warpCell:2,quantumCore:4},req:['arms_9','auto_14','energy_12'],fac:['starDock','navArray'],un:['orbitalLance'],desc:'把远征舰纳入战斗：每场行星首领战可摧毁一座机制场锚。'},
  echo_10:{n:'零号星门构造学',b:'异常回响',era:12,hours:20,cost:{voidCrystal:6,warpCell:3,quantumCore:4},req:['echo_9','energy_12','auto_14'],rec:'gateGrammar',fac:['observatory','navArray'],desc:'理解零号星门的构造语法，为本篇终局与后续星域扩展保留入口。'},
};
const TECH_FOR_RECIPE={}, TECH_FOR_DEF={}, TECH_FOR_BUILD={}, TECH_FOR_SMELT={};
for(const tid in TECHS){
  (TECHS[tid].un||[]).forEach(r=>TECH_FOR_RECIPE[r]=tid);
  (TECHS[tid].def||[]).forEach(d=>TECH_FOR_DEF[d]=tid);
  (TECHS[tid].build||[]).forEach(b=>TECH_FOR_BUILD[b]=tid);
  (TECHS[tid].smelt||[]).forEach(s=>TECH_FOR_SMELT[s]=tid);
}
const BRANCHES = ['生存医疗','武器系统','工程制造','能源场','动力防护','探测自动化','异常回响'];
/* ================= 基因锁 · 多分支树(跨周目保留) ================= */
const GENE_NODES = [
  {id:'g1_core',stage:1,branch:'核心',name:'Ⅰ·阈值唤醒',desc:'第一次完整改写，所有基础能力进入独立基因乘区。',gate:{level:10},cost:{biocore:4,crystal:2},bonus:{hpPct:60,atkPct:50,defPct:50,stMaxPct:50},mutation:'基础能力直接提升到原来的约 1.5 倍'},
  {id:'g2_muscle',stage:2,branch:'强袭',name:'肌纤维束化',desc:'将生物能集中到输出与爆发结构。',req:['g1_core'],gate:{level:18,kills:20},cost:{biocore:10,crystal:5},bonus:{atkPct:180,hpPct:120,crit:25},mutation:'强袭属性进入三倍量级'},
  {id:'g2_neural',stage:2,branch:'神经',name:'神经并行',desc:'并行处理威胁、动作与弹道预测。',req:['g1_core'],gate:{level:18,techs:12,legacyTechs:6},cost:{biocore:10,crystal:5},bonus:{spdPct:180,crit:30,dodge:20},mutation:'神经反应进入三倍量级'},
  {id:'g2_adapt',stage:2,branch:'适应',name:'代谢闭环',desc:'构建高压环境下的自维持循环。',req:['g1_core'],gate:{level:18,quest:'sample'},cost:{biocore:10,crystal:5},bonus:{hpPct:220,defPct:180,stMaxPct:150},mutation:'生存能力进入三倍量级'},
  {id:'g3_predator',stage:3,branch:'强袭',name:'掠食程式',desc:'战斗本能开始直接重写伤害结果。',req:['g2_muscle'],gate:{level:30,playthrough:2,kills:60},cost:{biocore:22,crystal:12,core:3},bonus:{atkPct:600,critDmg:500,skillDamagePct:400},mutation:'攻击与技能跨入十倍量级'},
  {id:'g3_reflex',stage:3,branch:'神经',name:'预测反射',desc:'在敌方动作发生前完成神经模拟。',req:['g2_neural'],gate:{level:30,playthrough:2,techs:30,legacyTechs:14},cost:{biocore:22,crystal:12,core:3},bonus:{spdPct:600,dodge:40,crit:55},mutation:'速度跨入七倍量级'},
  {id:'g3_regen',stage:3,branch:'适应',name:'再生基质',desc:'伤势被视为可自动回滚的组织状态。',req:['g2_adapt'],gate:{level:30,playthrough:2,quest:'signalTrace'},cost:{biocore:22,crystal:12,core:3},bonus:{hpPct:800,defPct:600,damageReductionPct:35},rule:{postCombatHealPct:35},mutation:'生存跨入十倍量级，胜利恢复 35% 生命'},
  {id:'g4_breaker',stage:4,branch:'强袭',name:'护甲否定',desc:'防御不再是必须完整计算的规则。',req:['g3_predator','g2_neural'],gate:{level:50,endings:1,kills:120},cost:{biocore:45,crystal:24,core:8},bonus:{atkPct:2500,pen:60,critDmg:2000},rule:{executePct:30},mutation:'攻击进入三十倍量级，30% 生命以下处决'},
  {id:'g4_overclock',stage:4,branch:'神经',name:'神经超频',desc:'意识可以截断技能原本的能量约束。',req:['g3_reflex','g2_muscle'],gate:{level:50,endings:1,techs:52,legacyTechs:24},cost:{biocore:45,crystal:24,core:8},bonus:{spdPct:2500,crit:85,skillDamagePct:1800},rule:{firstSkillDiscount:3},mutation:'速度进入二十六倍量级，首个技能消耗 -3'},
  {id:'g4_ecology',stage:4,branch:'适应',name:'生态同化',desc:'将污染、创伤与能量匮乏纳入自身循环。',req:['g3_regen','g2_neural'],gate:{level:50,endings:1,quest:'echo'},cost:{biocore:45,crystal:24,core:8},bonus:{hpPct:3500,defPct:2500,stMaxPct:1800,damageReductionPct:60},rule:{contaminationGuard:1},mutation:'生存进入数十倍量级并免疫环境污染'},
  {id:'g5_dominion',stage:5,branch:'终末',name:'Ⅴ·支配态',desc:'战斗意志开始支配能量与伤害规则。',req:['g4_breaker','g4_overclock'],gate:{level:75,playthrough:3,endings:2},cost:{biocore:90,crystal:48,core:20},bonus:{atkPct:12000,critDmg:10000,skillDamagePct:8000},rule:{skillEcho:1},mutation:'攻击跨入百倍量级，技能可能不消耗体力'},
  {id:'g5_chimera',stage:5,branch:'终末',name:'Ⅴ·嵌合态',desc:'生命形态不再遵守单一物种的生存边界。',req:['g4_ecology','g4_overclock'],gate:{level:75,playthrough:3,endings:2},cost:{biocore:90,crystal:48,core:20},bonus:{hpPct:15000,defPct:12000,stMaxPct:8000,damageReductionPct:75},rule:{deathGuard:1},mutation:'生命跨入百倍量级并拒绝首次死亡'},
];
const GENE_BY_ID=Object.fromEntries(GENE_NODES.map(g=>[g.id,g]));
function geneUnlocked(id){ return !!(state.meta.geneNodes&&state.meta.geneNodes[id]); }
function geneTier(){ return Math.max(0,...GENE_NODES.filter(g=>geneUnlocked(g.id)).map(g=>g.stage)); }
function geneBonus(stat){ return GENE_NODES.reduce((s,g)=>s+(geneUnlocked(g.id)?(g.bonus&&g.bonus[stat]||0):0),0); }
function geneRule(rule){ return GENE_NODES.reduce((s,g)=>s+(geneUnlocked(g.id)?(g.rule&&g.rule[rule]||0):0),0); }
function geneGateChecks(g){const gate=g.gate||{},out=[];if(gate.level)out.push({ok:P().level>=gate.level,text:'角色等级 '+P().level+'/'+gate.level});if(gate.kills)out.push({ok:state.kills>=gate.kills,text:'本周目击杀 '+state.kills+'/'+gate.kills});if(gate.techs){const n=Object.keys(state.meta.techs||{}).filter(techKnown).length,need=state.meta.legacyTechGates&&gate.legacyTechs?gate.legacyTechs:gate.techs;out.push({ok:n>=need,text:'已研究科技 '+n+'/'+need});}if(gate.quest){const q=QUEST_BY_ID[gate.quest];out.push({ok:questDone(gate.quest),text:'任务【'+(q?q.name:gate.quest)+'】'});}if(gate.playthrough)out.push({ok:state.meta.playthrough>=gate.playthrough,text:'周目 '+state.meta.playthrough+'/'+gate.playthrough});if(gate.endings){const n=(state.meta.endingsDone||[]).length;out.push({ok:n>=gate.endings,text:'不同结局 '+n+'/'+gate.endings});}return out;}
function geneGateReady(g){return geneGateChecks(g).every(x=>x.ok);}
function geneReady(id){ const g=GENE_BY_ID[id]; return !!g&&!geneUnlocked(id)&&(g.req||[]).every(geneUnlocked)&&geneGateReady(g)&&canAfford(g.cost); }
function unlockGeneNode(id){ const g=GENE_BY_ID[id]; if(!g||geneUnlocked(id))return; if(!(g.req||[]).every(geneUnlocked)){log('前置基因节点尚未解锁。','warn');return;} if(!geneGateReady(g)){log('基因表达条件尚未满足。','warn');return;} if(!canAfford(g.cost)){log('基因材料不足。','warn');return;}
  payCost(g.cost); state.meta.geneNodes[id]=true; state.meta.gene=geneTier(); P().gene=state.meta.gene; state.geneSel=id; log('🧬 基因锁突破 → '+g.name+' · '+g.mutation,'good'); divider(); render(); }
function unlockGene(){ const next=GENE_NODES.find(g=>!geneUnlocked(g.id)&&(g.req||[]).every(geneUnlocked)&&geneGateReady(g)); if(next)unlockGeneNode(next.id); }

/* ================= 职业 · NPC资格 / 主副职业 ================= */
const JOBS = {
  vanguard:{kind:'main',name:'方舟突击兵',npc:'哈里斯',desc:'中近距离持续输出与脉冲武器专精。',qualification:'job_vanguard_qualified',reqText:'完成巡逻任务后向哈里斯报到',bonus:{atkPct:5,crit:2},growth:{atk:2,hp:8},skills:['pulseBurst','combatRhythm']},
  bulwark:{kind:'main',name:'装甲卫士',npc:'林薇',desc:'护盾、装甲与阵地生存专家。',qualification:'job_bulwark_qualified',reqText:'救出小唐后接受林薇的外骨骼训练',bonus:{defPct:7,hpPct:6,shield:8},growth:{def:1.5,hp:14},skills:['kineticBrace','reactiveArmor']},
  infiltrator:{kind:'main',special:true,name:'相位猎手',npc:'纪遥',desc:'利用原型神经技术进行规则级穿透。',qualification:'job_infiltrator_qualified',reqText:'纪遥资格 + 神经滤波器 + 地下信号源仪式',ritual:{location:'signal',item:'neuralFilter',cost:{biocore:6,crystal:6,core:2}},bonus:{dodge:5,pen:6},growth:{spd:1,critDmg:4},skills:['phaseStrike','weakpointModel']},
  salvager:{kind:'life',name:'残骸勘探员',npc:'阿拓',desc:'强化野外采集、拆解和矿物辨识。',qualification:'job_salvager_qualified',reqText:'救出阿拓并取得采掘蓝图',bonus:{stMax:5},growth:{gatherPct:2,recyclePct:2},skills:['salvageSense','fieldSorting']},
  fabricator:{kind:'life',name:'制造技师',npc:'林薇',desc:'强化制作、熔炼与材料利用率。',qualification:'job_fabricator_qualified',reqText:'完成故障审计并掌握模块化制造',bonus:{craftSavePct:4},growth:{craftSavePct:1.5,smeltPct:2},skills:['precisionFab','thermalControl']},
  biologist:{kind:'life',name:'生态培育师',npc:'陈博士',desc:'强化菌圃、生物样本与培养技术。',qualification:'job_biologist_qualified',reqText:'完成样本任务并发现隔离培养室',bonus:{gardenPct:6},growth:{gardenPct:3,bioGatherPct:2},skills:['bioCycle','adaptiveCulture']},
};
/* ================= 入门职业(正式职业的简化版 · 自带主动技能) ================= */
const NOVICE_JOBS = {
  noviceCollector: {kind:'life',name:'入门拾荒者',formal:'salvager',    npc:'老乔',  desc:'基础采集训练。',bonus:{gatherPct:3},skill:'quickScavenge'},
  noviceScout:     {kind:'main',name:'入门斥候',  formal:'vanguard',    npc:'阿勇',  desc:'基础侦察与移动训练。',bonus:{spd:1},skill:'tacticalScan'},
  noviceGuard:     {kind:'main',name:'入门守卫',  formal:'bulwark',     npc:'小唐',  desc:'基础防御与护盾操作。',bonus:{hp:5},skill:'shieldBash'},
  noviceStriker:   {kind:'main',name:'入门打击手',formal:'infiltrator', npc:'哈里斯',desc:'基础攻击与暴击意识。',bonus:{crit:1},skill:'heavyBlow'},
  noviceApprentice:{kind:'life',name:'入门学徒',  formal:'fabricator',  npc:'阿珍',  desc:'基础制造与材料管理。',bonus:{craftSavePct:2},skill:'fieldRepair'},
  noviceGrower:    {kind:'life',name:'入门培育师',formal:'biologist',   npc:'陈嫂',  desc:'基础菌圃与生态维护。',bonus:{gardenPct:3},skill:'sporeBoost'},
};
// 入门职业技能(加入SKILLS体系)
Object.assign(SKILLS, {
  quickScavenge:{name:'快速搜刮',type:'active',cost:2,kind:'any',desc:'本次采集产量+50%,不触发遭遇',effect:'scavenge',career:'noviceCollector',careerLevel:1},
  tacticalScan: {name:'战术侦察',type:'active',cost:2,kind:'any',desc:'揭示当前区域隐藏资源与敌人',effect:'scan',career:'noviceScout',careerLevel:1},
  shieldBash:   {name:'盾击',    type:'active',cost:3,kind:'melee',desc:'1.2倍伤害,本回合防御+5',effect:'bash',career:'noviceGuard',careerLevel:1},
  heavyBlow:    {name:'猛击',    type:'active',cost:3,kind:'melee',desc:'1.5倍伤害,无视20%防御',effect:'blow',career:'noviceStriker',careerLevel:1},
  fieldRepair:  {name:'应急修理',type:'active',cost:3,kind:'any',desc:'恢复设施1级耐久或装备效果',effect:'repair',career:'noviceApprentice',careerLevel:1},
  sporeBoost:   {name:'催生孢子',type:'active',cost:2,kind:'any',desc:'立即获得一次菌圃收获',effect:'spore',career:'noviceGrower',careerLevel:1},
});
function isNoviceJob(id){ return !!NOVICE_JOBS[id]; }
function noviceFormalId(noviceId){ const nj=NOVICE_JOBS[noviceId]; return nj?nj.formal:null; }
function careerGuideLabel(name){const at=npcLocation(name);return name+' · '+(at&&LOCATIONS[at]?LOCATIONS[at].name:'行踪未知');}
function careerRecord(kind){ return state.meta.careers&&state.meta.careers[kind]; }
function currentCareer(id){ return ['main','life'].some(k=>{const r=careerRecord(k); if(!r)return false; if(r.id===id)return true; const nj=NOVICE_JOBS[r.id]; return nj&&nj.formal===id;}); }
function careerLevelFor(id){ const r=['main','life'].map(careerRecord).find(r=>r&&r.id===id); return r?r.level:0; }
function checkJobReq(id){ const j=JOBS[id]; if(!j||!state.flags[j.qualification])return false; if(j.ritual){return P().location===j.ritual.location&&P().equip.implant===j.ritual.item&&canAfford(j.ritual.cost);} return true; }
function jobBonus(stat){ let n=0; ['main','life'].forEach(kind=>{ const r=careerRecord(kind); if(!r)return; const j=JOBS[r.id]; if(j){n+=(j.bonus[stat]||0)+(j.growth[stat]||0)*Math.max(0,r.level-1);} else {const nj=NOVICE_JOBS[r.id]; if(nj)n+=(nj.bonus[stat]||0);} }); return n+passiveBonus(stat); }
function careerXpNeed(level){ return 30+level*20; }
function gainCareerXp(kind,n){ const r=careerRecord(kind); if(!r)return; r.xp+=n; while(r.level<10&&r.xp>=careerXpNeed(r.level)){r.xp-=careerXpNeed(r.level);r.level++;log('✦ '+JOBS[r.id].name+' 提升至 Lv'+r.level+'，职业属性成长生效。','good');} }
function chooseJob(id){ const j=JOBS[id]; if(!j||!checkJobReq(id)){log('职业资格或转职条件尚未满足。','warn');return;} const old=careerRecord(j.kind);
  if(old){ if(j.kind!=='main'||!has('reclassCore')){log(j.kind==='main'?'主职业已锁定，需要职业重构核心才能再次转职。':'副职业已经选定。','warn');return;} state.inv.reclassCore--; }
  if(j.ritual)payCost(j.ritual.cost); state.meta.careers[j.kind]={id,level:1,xp:0}; state.meta.job=j.kind==='main'?id:state.meta.job; ensureCareerSkills(); log('✦ '+(j.kind==='main'?'主':'副')+'职业转职 → '+j.name+'！','good'); divider(); render(); }
function chooseNoviceJob(noviceId){ const nj=NOVICE_JOBS[noviceId]; if(!nj)return; const old=careerRecord(nj.kind);
  if(old){log(nj.kind==='main'?'主职业已有。':'副职业已有。','warn');return;}
  state.meta.careers[nj.kind]={id:noviceId,level:1,xp:0}; ensureCareerSkills(); log('✦ 入门职业 → '+nj.name+'!'+nj.desc,'good'); divider(); render(); }
function tryNoviceUpgrade(){ ['main','life'].forEach(kind=>{ const r=careerRecord(kind); if(!r)return; const nj=NOVICE_JOBS[r.id]; if(!nj)return;
  const formalId=nj.formal; const fj=JOBS[formalId]; if(!fj||!state.flags[fj.qualification])return; if(r.level<3)return;
  state.meta.careers[kind]={id:formalId,level:r.level,xp:r.xp}; state.meta.job=kind==='main'?formalId:state.meta.job; ensureCareerSkills();
  log('✦ 入门职业升级 → '+fj.name+'!','good'); }); }
function techLevel(tid){ const v=state.meta.techs[tid]; return v===true?1:(v||0); }
function techKnown(tid){ return techLevel(tid)>=1; }
function techMax(){ return 1; }
function recordIds(value){ return value?(Array.isArray(value)?value:[value]):[]; }
function recordKnown(value){ return recordIds(value).every(id=>(state.meta.records||[]).includes(id)); }
function techFacilityIds(t){ return t&&t.fac?(Array.isArray(t.fac)?t.fac:[t.fac]):[]; }
function facilityOnline(id){ return !!(state.meta.built&&state.meta.built[id])&&!(state.meta.damaged&&state.meta.damaged[id]); }
function facilityForStation(st){ return CAMP_BUILDINGS.find(b=>b.st===st); }
function recipeFacilityReady(r){ const b=r&&facilityForStation(r.st);return !!b&&facilityOnline(b.id)&&buildingLevel(b.id)>=(r.level||1); }
function recipeFacilityText(r){ const b=r&&facilityForStation(r.st),need=r&&r.level||1;return b&&buildingLevel(b.id)<need?('需要 '+b.name+' Lv'+need):''; }
function techFacilitiesReady(tid){ return techFacilityIds(TECHS[tid]).every(facilityOnline); }
function techPrereqsReady(tid){ return (TECHS[tid].req||[]).every(techKnown); }
function techReady(tid){ const t=TECHS[tid]; return techPrereqsReady(tid)&&recordKnown(t.rec)&&techFacilitiesReady(tid); }
function techUpCost(tid){ return Object.assign({},TECHS[tid].cost); }
function hasRecipeTech(rid){ const r=RECIPES[rid],t=TECH_FOR_RECIPE[rid];
  if(r&&r.blueprint&&!state.flags[r.blueprint]) return false;
  return !t||techKnown(t);
}
function hasDefTech(k){ const t=TECH_FOR_DEF[k]; return !t||techKnown(t); }
function hasBuildingTech(id){ const t=TECH_FOR_BUILD[id]; return !t||techKnown(t); }
function hasSmeltTech(id){ const t=TECH_FOR_SMELT[id]; return !t||techKnown(t); }
function unItemName(rid){ const out = RECIPES[rid] ? RECIPES[rid].out : rid; return ITEMS[out] ? ITEMS[out].name : rid; }
function techBonus(stat){ let value=0; for(const tid in state.meta.techs){ const t=TECHS[tid]; if(techKnown(tid)&&t&&t.bonus) value+=t.bonus[stat]||0; } return value; }
function facilityName(id){ const f=CAMP_BUILDINGS.find(x=>x.id===id)||OUTPOST_BUILDINGS.find(x=>x.id===id); return f?f.name:id; }
function smeltName(id){ const s=SMELT.find(x=>x.id===id); return s?s.name:id; }
function smeltOutput(s){ const facilityBonus=s.fixedYield?0:buildingLevel('smelt')-1;return Math.max(1,Math.round((s.yield+facilityBonus)*(1+jobBonus('smeltPct')/100))); }
function grantTechRecord(id,announce=true){ const r=TECH_RECORDS[id];if(!r||state.meta.records.includes(id))return false;state.meta.records.push(id);if(r.fixed&&!state.meta.spaceRecords.includes(id))state.meta.spaceRecords.push(id);if(id==='xenoGenome')setMetaFlag('xenoGenomeRecovered');persistMetaCheckpoint();if(announce)log('📄 获得技术资料【'+r.name+'】','good');return true; }
function discoverTechRecord(dest){
  Object.keys(TECH_RECORDS).filter(k=>TECH_RECORDS[k].at===dest&&!TECH_RECORDS[k].fixed).forEach(id=>grantTechRecord(id,true));
}
/* 层级(用于树状布局):最长前置链深度 */
const _tierCache={};
function techTier(tid){ if(_tierCache[tid]!=null) return _tierCache[tid]; const t=TECHS[tid]; if(!t||!(t.req||[]).length){ _tierCache[tid]=1; return 1; } let m=0; for(const r of t.req) m=Math.max(m, techTier(r)); _tierCache[tid]=m+1; return m+1; }

/* ================= 状态 ================= */
const BASE_STAMINA=100, LEGACY_BASE_STAMINA=50, STAMINA_BASE_VERSION=2;
let state;
function normalizeMeta(meta){
  meta=meta||{};
  meta.playthrough=meta.playthrough||1; if(meta.echo==null)meta.echo=0;
  meta.echoUp=meta.echoUp||{stamina:0,collect:0,attr:0}; meta.mult=meta.mult||{stamina:1,collect:1,attr:1};
  meta.gene=meta.gene||0; meta.geneNodes=meta.geneNodes||{}; meta.careers=meta.careers||{main:null,life:null};
  meta.endingItems=Array.isArray(meta.endingItems)?meta.endingItems:[]; meta.fragments=Array.isArray(meta.fragments)?meta.fragments:[]; meta.endingsDone=Array.isArray(meta.endingsDone)?meta.endingsDone:[];
  meta.built=meta.built||{}; meta.buildLevels=meta.buildLevels||{}; meta.damaged=meta.damaged||{}; meta.techs=meta.techs||{}; meta.records=Array.isArray(meta.records)?meta.records:[];
  meta.outposts=meta.outposts&&typeof meta.outposts==='object'&&!Array.isArray(meta.outposts)?meta.outposts:{};
  meta.spaceRoutes=meta.spaceRoutes&&typeof meta.spaceRoutes==='object'?meta.spaceRoutes:{};
  meta.spaceQuests=meta.spaceQuests&&typeof meta.spaceQuests==='object'?meta.spaceQuests:{};
  meta.spaceFlags=meta.spaceFlags&&typeof meta.spaceFlags==='object'?meta.spaceFlags:{};
  meta.spaceDiscovered=meta.spaceDiscovered&&typeof meta.spaceDiscovered==='object'?meta.spaceDiscovered:{};
  meta.spaceRecords=Array.isArray(meta.spaceRecords)?meta.spaceRecords:[];
  meta.spaceItems=meta.spaceItems&&typeof meta.spaceItems==='object'&&!Array.isArray(meta.spaceItems)?meta.spaceItems:{};
  meta.ship=meta.ship&&typeof meta.ship==='object'?meta.ship:{assembled:false,name:'回声号'};
  meta.records.filter(id=>TECH_RECORDS[id]&&TECH_RECORDS[id].fixed&&!meta.spaceRecords.includes(id)).forEach(id=>meta.spaceRecords.push(id));
  meta.spaceRecords.filter(id=>TECH_RECORDS[id]&&!meta.records.includes(id)).forEach(id=>meta.records.push(id));
  if(meta.endingsDone.length){meta.expansionUnlocked=true;meta.spaceFlags.postCoreStarMap=true;}
  if(meta.built.starDock)meta.spaceFlags.starDockBuilt=true;if(meta.built.navArray)meta.spaceFlags.navArrayBuilt=true;if(meta.ship.assembled){meta.spaceFlags.starshipAssembled=true;meta.spaceFlags.starshipReady=true;}
  Object.entries(meta.outposts).forEach(([rid,op])=>{if(op&&op.status==='operational')meta.spaceFlags[rid==='ashMoon'?'ashOutpostOperational':'verdantOutpostOperational']=true;});
  return meta;
}
const AUDIO_PREF_DEFAULTS={sound:true,music:true,vibration:true,soundVolume:.65,musicVolume:.30};
function normalizeAudioPrefs(target){
  if(!target)return AUDIO_PREF_DEFAULTS;
  ['sound','music','vibration'].forEach(key=>{if(typeof target[key]!=='boolean')target[key]=AUDIO_PREF_DEFAULTS[key];});
  ['soundVolume','musicVolume'].forEach(key=>{const value=Number(target[key]),clamped=Number.isFinite(value)?Math.max(0,Math.min(1,value)):AUDIO_PREF_DEFAULTS[key];target[key]=Math.round(clamped*20)/20;});
  return target;
}
function audioPrefs(target){target=normalizeAudioPrefs(target||{});return {sound:target.sound,music:target.music,vibration:target.vibration,soundVolume:target.soundVolume,musicVolume:target.musicVolume};}
function freshState(keepMeta){
  const returning=!!keepMeta;
  const meta = normalizeMeta(keepMeta || { playthrough:1, echo:0, echoUp:{stamina:0,collect:0,attr:0}, mult:{stamina:1,collect:1,attr:1}, gene:0, geneNodes:{}, careers:{main:null,life:null}, endingItems:[], fragments:[], endingsDone:[], built:{}, damaged:{}, techs:{}, records:[], techVersion:5 });
  const next = {
    staminaBaseVersion:STAMINA_BASE_VERSION,
    player:{ level:1, xp:0, hp:100, stamina:BASE_STAMINA, infected:false, location:'camp', shield:0, gene:0,
             equip:{head:null,body:null,hands:null,legs:null,feet:null,back:null,implant:null,module:null,offhand:null,weapon:'crowbar'} },
    inv:{scrap:0,wood:0,stone:0,coal:0,copperScrap:0,copperIngot:0,cloth:0,ecomp:0,ration:0,steel:0,crystal:0,biocore:0,core:0,ingot:0,crowbar:1,
      arkBand:returning?1:0,builderGun:returning?1:0,fieldMap:returning?1:0},
    defenses:[], rests:0, skills:{}, skillSlots:[null,null,null], skillSlotSel:0, charView:'overview', quests:{first_exit:'active'}, questStart:{}, flags:{}, areaSearch:{}, investigationMisses:{}, discovered:{camp:true,outer:true,joeCamp:true}, dailyGather:{}, dailyLocation:{}, dailyFacility:{}, foodBuff:null, truthClaimed:null,
    runStats:{kills:0,wKill:0,dmg:0,mat:0}, checkpoint:null, expeditionStartInv:null, time:0,
    tab:'act', screen:'play', campBuilding:null, campView:'home', bagSel:null, techSel:null, combat:null, visited:{camp:true}, mapLevel:'world', mapRegion:'surface', siteSheet:null, meta, kills:0,
    sound:AUDIO_PREF_DEFAULTS.sound,music:AUDIO_PREF_DEFAULTS.music,vibration:AUDIO_PREF_DEFAULTS.vibration,soundVolume:AUDIO_PREF_DEFAULTS.soundVolume,musicVolume:AUDIO_PREF_DEFAULTS.musicVolume,
    tutorial:returning?{version:1,step:'done',complete:true}:{version:1,step:'wake',complete:false},
  };
  Object.assign(next.quests,meta.spaceQuests||{});
  Object.assign(next.flags,meta.spaceFlags||{});
  Object.assign(next.discovered,meta.spaceDiscovered||{});
  if(returning) Object.assign(next.flags,{braceletUnlocked:true,builderUnlocked:true,mapUnlocked:true,exploreUnlocked:true,guideDeparted:true});
  Object.keys(SKILLS).forEach(k=>next.skills[k]={prof:0});
  if(!next.masteries) next.masteries={}; Object.keys(MASTERIES).forEach(k=>{if(next.masteries[k]==null)next.masteries[k]=0;});
  MATS.forEach(k=>{if(next.inv[k]==null)next.inv[k]=0;});
  (meta.endingItems||[]).forEach(id=>{ if(ITEMS[id]&&ITEMS[id].type==='equip') next.inv[id]=Math.max(1,next.inv[id]||0); });
  Object.entries(meta.spaceItems||{}).forEach(([id,n])=>{if(ITEMS[id])next.inv[id]=Math.max(next.inv[id]||0,Number(n)||0);});
  return next;
}

/* 旧 6 槽存档迁移：按物品当前槽位重排，冲突物品退回背包，避免隐藏属性重复生效。 */
function normalizeEquipment(player,inventory){
  if(!player)return; const old=player.equip||{},next={}; SLOTS.forEach(([slot])=>next[slot]=null);
  Object.entries(old).forEach(([legacy,id])=>{ if(!id||!ITEMS[id])return; const slot=ITEMS[id].slot;
    if(!Object.prototype.hasOwnProperty.call(next,slot))return;
    if(!next[slot]) next[slot]=id; else if(next[slot]!==id&&inventory) inventory[id]=(inventory[id]||0)+1;
  });
  player.equip=next;
}

/* ================= 派生属性 ================= */
const P=()=>state.player, M=()=>state.meta.mult;
function eqOf(slot){ const id=P().equip[slot]; return id?ITEMS[id]:null; }
function eqSum(stat){ let s=0; for(const sl in P().equip){ const it=eqOf(sl); if(it&&it[stat]) s+=it[stat]; } return s; }
function xpNeed(L){ return L>=100 ? 12000 : Math.round(25*Math.pow(L,1.25)); }
function maxHp(){ let v=Math.round((100 + (P().level-1)*22 + eqSum('hp') + techBonus('hp') + geneBonus('hp') + jobBonus('hp')) * M().attr); v=Math.round(v*(1+(jobBonus('hpPct')+geneBonus('hpPct'))/100)); return v; }
function baseAtk(){ let v=(9 + (P().level-1)*2 + techBonus('atk') + geneBonus('atk') + jobBonus('atk')) * M().attr; v=v*(1+(jobBonus('atkPct')+geneBonus('atkPct'))/100); return v; }
function totalAtk(){ return Math.round(baseAtk() + eqSum('atk') + skillAtkBonus()); }
function baseDef(){ let v=(3 + (P().level-1)*1.4 + techBonus('def') + geneBonus('def') + jobBonus('def')) * M().attr; v=v*(1+(jobBonus('defPct')+geneBonus('defPct'))/100); return v; }
function totalDef(){ return Math.round(baseDef() + eqSum('def')); }
function baseSpd(){ const v=10 + (P().level-1)*1 + eqSum('spd') + techBonus('spd') + geneBonus('spd') + jobBonus('spd'); return Math.round(v*(1+geneBonus('spdPct')/100)); }
function maxStamina(base=BASE_STAMINA){ let v=(base + techBonus('stMax') + geneBonus('stMax') + jobBonus('stMax')) * M().stamina; v=v*(1+(jobBonus('stMaxPct')+geneBonus('stMaxPct'))/100); return v; }
function migrateStaminaBase(){
  if((state.staminaBaseVersion||1)>=STAMINA_BASE_VERSION)return false;
  const newCap=Math.round(maxStamina()),oldCap=Math.round(maxStamina(LEGACY_BASE_STAMINA)),gain=Math.max(0,newCap-oldCap);
  const raise=player=>{if(!player)return;player.stamina=Math.min(newCap,Math.max(0,Number(player.stamina)||0)+gain);};
  raise(P());if(state.checkpoint&&state.checkpoint.player)raise(state.checkpoint.player);
  state.staminaBaseVersion=STAMINA_BASE_VERSION;
  return true;
}
function atkRange(){ const w=eqOf('weapon'); return (w?(w.range||1):1) + techBonus('rangeAdd'); }
function attackResource(skill){
  const w=eqOf('weapon'),type=w&&w.weaponType?w.weaponType:'melee';
  if(skill&&skill.kind==='ranged'&&type!=='ranged')return {ready:false,compatible:false,reason:'需要装备枪械'};
  if(skill&&skill.kind==='melee'&&type!=='melee')return {ready:false,compatible:false,reason:'需要装备近战武器'};
  if(type==='ranged'){
    if(!w||!w.ammo||!ITEMS[w.ammo])return {ready:false,compatible:false,reason:'武器弹药属性缺失'};
    const amount=Math.max(1,(w.ammoCost||1)*(skill&&skill.shots||1)),current=state.inv[w.ammo]||0;
    return {kind:'ammo',item:w.ammo,amount,current,ready:current>=amount,compatible:true,reason:current>=amount?'':'缺少'+ITEMS[w.ammo].name};
  }
  const base=skill?(skill.cost||0):(w&&w.staminaCost!=null?w.staminaCost:2);
  const discount=skill&&state.combat&&!state.combat.skillUsed?geneRule('firstSkillDiscount'):0;
  const amount=Math.max(0,base-discount),current=P().stamina;
  return {kind:'stamina',amount,current,ready:current>=amount,compatible:true,reason:current>=amount?'':'体力不足'};
}
function attackResourceText(resource){
  if(!resource.compatible)return resource.reason;
  if(resource.kind==='ammo')return ITEMS[resource.item].icon+ITEMS[resource.item].name+' -'+resource.amount+' · 剩余 '+resource.current;
  return resource.amount?'体力 -'+resource.amount:'本次无消耗';
}
function attackResourceStatus(resource){return resource.ready?attackResourceText(resource):(resource.reason+(resource.compatible?' · '+attackResourceText(resource):''));}
function spendAttackResource(resource){
  if(!resource.ready)return false;
  if(resource.kind==='ammo')state.inv[resource.item]-=resource.amount;
  else P().stamina-=resource.amount;
  return true;
}
function moveRange(){ return 3 + eqSum('move') + techBonus('move') + Math.floor(baseSpd()/20); }
function statCrit(){ return Math.min(100, eqSum('crit') + techBonus('crit') + geneBonus('crit') + jobBonus('crit')); }
function statCritDmg(){ return 150 + eqSum('critDmg') + techBonus('critDmg') + geneBonus('critDmg') + jobBonus('critDmg'); }
function statLS(){ return eqSum('ls') + techBonus('ls'); }
function statDodge(){ return Math.min(60, eqSum('dodge') + techBonus('dodge') + geneBonus('dodge') + jobBonus('dodge')); }
function statHit(){ return 95 + eqSum('hit') + techBonus('hit') + geneBonus('hit') + jobBonus('hit'); }
function statPen(){ return Math.min(90, eqSum('pen') + techBonus('pen') + geneBonus('pen') + jobBonus('pen')); }
function shieldMax(){ return Math.round((eqSum('shield') + techBonus('shield') + jobBonus('shield'))*(1+geneBonus('shieldPct')/100)); }
function weaponAtk(){ return eqSum('atk'); }
function has(id){ return (state.inv[id]||0)>0; }
function ownsItem(id){ return has(id)||Object.values(P().equip||{}).includes(id); }
function armorImmune(kind){ for(const sl in P().equip){ const it=eqOf(sl); if(it&&it.imm===kind) return true; } return false; }
function fragmentCount(){ return state.meta.fragments.length; }
function gainMat(id,n){ if(n<=0)return; state.inv[id]=(state.inv[id]||0)+n; state.runStats.mat+=n; }
function skillLv(k){ return Math.floor((state.skills[k]?state.skills[k].prof:0)/10); }
function skillUnlocked(k){ const s=SKILLS[k]; if(!s)return false; if(s.career)return currentCareer(s.career)&&careerLevelFor(s.career)>=(s.careerLevel||1); return skillLv(k)>0; }
function passiveBonus(stat){ let n=0; for(const k in SKILLS){const s=SKILLS[k];if(s.type==='passive'&&skillUnlocked(k))n+=(s.bonus&&s.bonus[stat]||0);} return n+masteryBonus(stat); }
function skillAtkBonus(){ return 0; }
function ensureCareerSkills(){ for(const k in SKILLS){const s=SKILLS[k];if(s.career&&currentCareer(s.career)&&!state.skills[k])state.skills[k]={prof:10};} }
function equippedSlot(k){ return (state.skillSlots||[]).indexOf(k); }
function equipSkill(k,slot){ const s=SKILLS[k]; if(!s||s.type!=='active'||!skillUnlocked(k)){log('只有已解锁的主动技能可以装备。','warn');return;} slot=slot==null?((state.skillSlots||[]).findIndex(x=>!x)):slot; if(slot<0)slot=state.skillSlotSel||0;
  const old=equippedSlot(k); if(old>=0)state.skillSlots[old]=null; state.skillSlots[slot]=k; state.skillSlotSel=slot; log('技能栏 '+(slot+1)+' 已装配【'+s.name+'】。','good'); render(); }
function unequipSkill(slot){ if(!state.skillSlots[slot])return; state.skillSlots[slot]=null; state.skillSlotSel=slot; render(); }

const ECHO_UPGRADES = {
  stamina:{name:'远征耐力',desc:'每级体力上限 +10%',base:8,step:6},
  collect:{name:'回收协议',desc:'每级材料产量 +10%',base:10,step:8},
  attr:{name:'躯体共振',desc:'每级基础生命/攻防 +5%',base:12,step:10},
};
function endingOwned(id){ return state.meta.endingItems.includes(id); }
function echoUpgradeCost(id){ const u=state.meta.echoUp[id]||0,e=ECHO_UPGRADES[id]; return e.base+u*e.step; }
function refreshEchoMultipliers(){ const u=state.meta.echoUp; state.meta.mult={stamina:1+u.stamina*.1,collect:1+u.collect*.1,attr:1+u.attr*.05}; }
function buyEchoUpgrade(id){ const e=ECHO_UPGRADES[id],cost=echoUpgradeCost(id); if(!e||state.meta.echo<cost){log('回响不足。','warn');return;}
  state.meta.echo-=cost; state.meta.echoUp[id]++; refreshEchoMultipliers(); log('✦ 回响强化【'+e.name+'】升至 '+state.meta.echoUp[id]+' 级。','good'); render(); }

/* ================= 任务与地图条件 ================= */
/* 远航里程碑跨死亡保留，但普通科技、建筑和资源仍遵守检查点回滚。 */
function mergePersistentSpaceMeta(target,source){
  target=normalizeMeta(target||{});source=normalizeMeta(source||{});
  ['spaceRoutes','spaceQuests','spaceFlags','spaceDiscovered','outposts'].forEach(key=>{target[key]=Object.assign({},target[key]||{},JSON.parse(JSON.stringify(source[key]||{})));});
  target.spaceRecords=[...new Set([...(target.spaceRecords||[]),...(source.spaceRecords||[])])];
  target.spaceRecords.forEach(id=>{if(!target.records.includes(id))target.records.push(id);});
  Object.entries(source.spaceItems||{}).forEach(([id,n])=>target.spaceItems[id]=Math.max(target.spaceItems[id]||0,Number(n)||0));
  if(source.ship&&source.ship.assembled)target.ship=JSON.parse(JSON.stringify(source.ship));
  if(source.expansionUnlocked)target.expansionUnlocked=true;
  if(source.originEnding&&!target.originEnding)target.originEnding=source.originEnding;
  if(source.frontierDoctrine)target.frontierDoctrine=source.frontierDoctrine;
  return target;
}
function persistMetaCheckpoint(){ if(state.checkpoint)state.checkpoint.meta=mergePersistentSpaceMeta(state.checkpoint.meta,state.meta); }
function metaFlag(id){ return !!(state.flags&&state.flags[id])||!!(state.meta&&state.meta.spaceFlags&&state.meta.spaceFlags[id]); }
function setMetaFlag(id,value=true){
  state.flags=state.flags||{}; state.flags[id]=value;
  state.meta.spaceFlags=state.meta.spaceFlags||{}; state.meta.spaceFlags[id]=value;persistMetaCheckpoint();
}
function setProgressFlag(id,value=true){ const persistent=QUESTS.some(q=>q.persist==='space'&&((q.targetFlag===id)||(q.reward&&q.reward.flag===id)));if(persistent)setMetaFlag(id,value);else state.flags[id]=value; }
function questState(id){ const q=QUEST_BY_ID[id],v=q&&q.persist==='space'?(state.meta.spaceQuests&&state.meta.spaceQuests[id]):(state.quests&&state.quests[id]); return v===true?'done':(v||'locked'); }
function setQuestState(id,value){ const q=QUEST_BY_ID[id];state.quests=state.quests||{};state.quests[id]=value;if(q&&q.persist==='space'){state.meta.spaceQuests=state.meta.spaceQuests||{};state.meta.spaceQuests[id]=value;persistMetaCheckpoint();} }
function questDone(id){ return questState(id)==='done'; }
function questActive(id){ return questState(id)==='active'; }
function questReqsDone(q){ const after=q.id==='exo_signal'&&state.meta.expansionUnlocked?true:(q.after||[]).every(questDone);return after&&(!q.requiresEnding||!!state.meta.expansionUnlocked); }
function questSearchCount(q){ const start=(state.questStart&&state.questStart[q.id])||0; return Math.max(0,(state.areaSearch[q.target]||0)-start); }
function questProgress(q){
  if(q.type==='search') return Math.min(q.count,questSearchCount(q))+'/'+q.count;
  if(q.type==='visit') return (P().location===q.target||state.visited[q.target])?'已抵达':'未抵达';
  if(q.type==='condition') return (techKnown('make_1')?'科技✓':'科技✗')+' · '+(state.meta.built.smelt?'熔炉✓':'熔炉✗');
  if(q.type==='submit') return Object.entries(q.need).map(([k,v])=>ITEMS[k].name+' '+(state.inv[k]||0)+'/'+v).join(' · ');
  if(q.type==='boss') return (q.targetFlag?metaFlag(q.targetFlag):state.meta.guardianDown)?'已击败':'未击败';
  if(q.type==='flag') return metaFlag(q.targetFlag)?'现场目标已完成':'等待现场互动';
  if(q.id==='bridge') return state.flags.commandDecoded?('舰桥记录已还原 · 完整证据 '+['故障线','内鬼线','信号线'].filter(evidenceReady).length+'/3'):('舰桥核心记录 '+Math.min(2,state.areaSearch.layer6||0)+'/2');
  return '';
}
function activateAvailableQuests(announce){
  let changed=false;
  QUESTS.forEach(q=>{ if(questState(q.id)==='locked'&&questReqsDone(q)){ setQuestState(q.id,'active');
    if(q.type==='search') state.questStart[q.id]=state.areaSearch[q.target]||0; changed=true;
    if(announce) log('📋 新任务【'+q.title+'】· '+q.objective,'sys'); } });
  return changed;
}
function claimTruth(line){
  if(state.truthClaimed){ log('本周目已经沿【'+state.truthClaimed+'】完成调查，其他证据只能留到下一周目。','warn'); return false; }
  state.truthClaimed=line;
  if(!state.meta.fragments.includes(line)){ state.meta.fragments.push(line); log('获得【真相碎片·'+line+'】('+fragmentCount()+'/3)。','good'); }
  else log('这条证据补全了【'+line+'】，但对应碎片已经保留。','dim');
  return true;
}
function finishQuest(id,announce){
  const q=QUEST_BY_ID[id]; if(!q||questDone(id)) return false;
  setQuestState(id,'done');
  if(q.reward&&q.reward.items) for(const[k,v] of Object.entries(q.reward.items)){ gainMat(k,v); if(announce)log('获得:'+ITEMS[k].name+'×'+v,'good'); }
  if(q.reward&&q.reward.flag){ if(q.persist==='space')setMetaFlag(q.reward.flag);else state.flags[q.reward.flag]=true; }
  if(q.reward&&q.reward.reveal) discoverLocation(q.reward.reveal,announce);
  if(q.truth) claimTruth(q.truth);
  if(announce){ divider(); log('✓ 完成任务【'+q.title+'】','sys'); log(q.done,'story'); divider(); setLogOpen(true); }
  activateAvailableQuests(announce);
  return true;
}
function syncQuestProgress(announce){
  let loop=true, guard=0;
  while(loop&&guard++<QUESTS.length){ loop=false; activateAvailableQuests(announce);
    QUESTS.forEach(q=>{ if(!questActive(q.id))return; let done=false;
      if(q.type==='visit') done=P().location===q.target||!!state.visited[q.target];
      else if(q.type==='condition') done=techKnown('make_1')&&!!state.meta.built.smelt;
      else if(q.type==='search') done=questSearchCount(q)>=q.count;
      else if(q.type==='boss') done=q.targetFlag?metaFlag(q.targetFlag):!!state.meta.guardianDown;
      else if(q.type==='flag') done=metaFlag(q.targetFlag);
      if(done&&finishQuest(q.id,announce)) loop=true;
    });
  }
}
function submitQuest(id){ const q=QUEST_BY_ID[id]; if(!q||!questActive(id)||q.type!=='submit')return;
  if(P().location!==q.turnAt){log('需要前往【'+LOCATIONS[q.turnAt].name+'】。','warn');return;}
  for(const[k,v] of Object.entries(q.need)){ if((state.inv[k]||0)<v){log('任务材料不足。','warn');return;} }
  for(const[k,v] of Object.entries(q.need)) state.inv[k]-=v;
  finishQuest(id,true); syncQuestProgress(true); render();
}
function regionForLocation(id){ return Object.keys(WORLD_REGIONS).find(rid=>WORLD_REGIONS[rid].locations.includes(id))||'surface'; }
function regionUnlocked(id){
  const region=WORLD_REGIONS[id]; if(!region)return false;
  if(id==='camp'||id==='surface')return true;
  return region.locations.some(loc=>!!(state.discovered&&state.discovered[loc])&&(!LOCATIONS[loc].hiddenBy||!!state.flags[LOCATIONS[loc].hiddenBy]));
}
function regionDiscovery(id){
  const region=WORLD_REGIONS[id],locations=region?region.locations:[];
  const known=locations.filter(locationRevealed).length;
  return {known,total:locations.length};
}
function discoverLocation(id,announce){
  const loc=LOCATIONS[id]; if(!loc)return false;
  if(!state.discovered)state.discovered={camp:true,outer:true,joeCamp:true};
  if(state.discovered[id])return false;
  const regionId=regionForLocation(id),hadRegion=regionUnlocked(regionId);
  state.discovered[id]=true;
  if(['orbit','ashMoon','verdant','silent'].includes(regionId)){state.meta.spaceDiscovered[id]=true;persistMetaCheckpoint();}
  if(announce){
    if(!hadRegion&&regionUnlocked(regionId))log('◎ 世界地图解锁新区域【'+WORLD_REGIONS[regionId].name+'】','good');
    log('◈ '+WORLD_REGIONS[regionId].name+'地图更新：发现【'+loc.name+'】','good');
    setLogOpen(true);
  }
  return true;
}
function applyDiscoveryMilestones(id,count){
  (DISCOVERY_MILESTONES[id]||[]).forEach(rule=>{ if(count>=rule.count)discoverLocation(rule.reveal,true); });
}
function nextDiscoveryMilestone(id){
  const count=state.areaSearch[id]||0;
  return (DISCOVERY_MILESTONES[id]||[]).find(rule=>!locationRevealed(rule.reveal)&&count<rule.count)||null;
}
function locationGate(id){
  if(!locationRevealed(id)) return {ok:false,text:'尚未发现入口'};
  const loc=LOCATIONS[id];
  const gates={
    layer2:['first_fire','先完成【第一座熔炉】'],layer3:['drain','先完成【恢复排水】'],layer4:['seal','先完成【封堵泄漏】'],
    layer5:['sample','先完成【失控样本】'],layer6:['patrol','先完成【失联巡逻队】'],layer7:['bridge','先完成【最后七十二小时】'],
    fungal:['sample','先确认实验体与信号的关系'],abyss:['spore','先完成【穿过菌幕】'],signal:['relay','先修复深井中继器']
  };
  const g=gates[id]; if(g&&!questDone(g[0])) return {ok:false,text:g[1]};
  if(loc&&loc.needTech&&!techKnown(loc.needTech)) return {ok:false,text:'需要科技【'+TECHS[loc.needTech].n+'】',kind:'tech'};
  if(loc&&loc.needItem&&!ownsItem(loc.needItem)) return {ok:false,text:'需要装备或携带【'+ITEMS[loc.needItem].name+'】',kind:'item'};
  if(loc&&loc.needFlag&&!state.flags[loc.needFlag]) return {ok:false,text:loc.needFlagText||'现场条件尚未满足'};
  const requirement=ENTRY_REQUIREMENTS[id];
  if(requirement&&!ownsItem(requirement.item)) return {ok:false,text:'需要'+ITEMS[requirement.item].name,kind:'item',requirement};
  if(LOCATIONS[id]&&LOCATIONS[id].needCard&&!has('accessCard')) return {ok:false,text:'需要指挥权限卡',kind:'item'};
  return {ok:true,text:'',requirement,entryText:requirement?requirement.action:''};
}
function entryFlag(id){ return 'entryOpened_'+id; }
function entryNeedsConfirm(id){ return !!ENTRY_REQUIREMENTS[id]&&!state.flags[entryFlag(id)]; }
function fieldOperationAt(id){ return Object.keys(FIELD_OPERATIONS).find(key=>FIELD_OPERATIONS[key].at===id&&!state.flags[FIELD_OPERATIONS[key].flag]&&!has(FIELD_OPERATIONS[key].grant))||null; }
function operationStatus(id){
  const op=FIELD_OPERATIONS[id]; if(!op)return {ok:false,text:'现场操作不存在'};
  if(state.flags[op.flag]||has(op.grant))return {ok:false,done:true,text:'已完成'};
  if(P().location!==op.at)return {ok:false,text:'需要前往【'+LOCATIONS[op.at].name+'】'};
  const searched=state.areaSearch[op.at]||0;
  if(searched<(op.minSearch||0))return {ok:false,text:'先调查现场 '+searched+'/'+op.minSearch};
  if(op.requireFlag&&!state.flags[op.requireFlag])return {ok:false,text:'先完成当前地点的关键调查'};
  const missing=Object.entries(op.cost||{}).filter(([item,n])=>(state.inv[item]||0)<n);
  if(missing.length)return {ok:false,text:'材料不足：'+missing.map(([item,n])=>ITEMS[item].name+' '+(state.inv[item]||0)+'/'+n).join(' · ')};
  return {ok:true,text:'材料与现场条件已满足'};
}
function openSiteSheet(kind,id){ state.siteSheet={kind,id}; render(); }
function closeSiteSheet(){ state.siteSheet=null; render(); }
function performFieldOperation(id){
  const op=FIELD_OPERATIONS[id],status=operationStatus(id); if(!op||!status.ok){if(status&&status.text)log(status.text+'。','warn');render();return false;}
  Object.entries(op.cost||{}).forEach(([item,n])=>state.inv[item]-=n);
  state.inv[op.grant]=(state.inv[op.grant]||0)+1; state.flags[op.flag]=true;
  divider();log('现场操作完成：【'+op.name+'】。','sys');log('获得关键道具：'+ITEMS[op.grant].name+'。','good');
  if(op.reveal)discoverLocation(op.reveal,true);
  divider();setLogOpen(true);state.siteSheet=null;syncQuestProgress(true);render();return true;
}
function confirmEntry(id){
  const gate=locationGate(id);if(!gate.ok){openSiteSheet('gate',id);return;}
  const req=ENTRY_REQUIREMENTS[id];if(req&&!state.flags[entryFlag(id)]){state.flags[entryFlag(id)]=true;log(req.action+'：入口已处理。','good');}
  state.siteSheet=null;
  if(isAdjacent(P().location,id))move(id);else travelTo(id);
}
function locationRevealed(id){
  const loc=LOCATIONS[id];
  const known=!!(state.discovered&&state.discovered[id])||!!(state.visited&&state.visited[id])||!!(state.player&&state.player.location===id);
  return !!loc&&known&&(!loc.hiddenBy||!!state.flags[loc.hiddenBy]);
}
function neighbors(id,includeHidden){ const out=[]; MAP_LINKS.forEach(([a,b])=>{ const other=a===id?b:(b===id?a:null); if(other&&(includeHidden||locationRevealed(other)))out.push(other); }); return out; }
function isAdjacent(a,b){ return neighbors(a).includes(b); }

function travelRoute(from,to){
  if(!LOCATIONS[from]||!LOCATIONS[to]||!locationRevealed(to)) return null;
  if(from===to) return {path:[from],cost:0};
  /* 快速移动只能穿过已经亲自到达过的区域；相邻的新区域仍可作为本次目的地。 */
  if(!state.visited[to]&&!isAdjacent(from,to)) return null;
  const best={[from]:0},prev={},queue=[from];
  while(queue.length){
    queue.sort((a,b)=>best[a]-best[b]);
    const cur=queue.shift();
    if(cur===to) break;
    neighbors(cur).forEach(next=>{
      if(!locationGate(next).ok) return;
      if(next!==to&&next!==from&&next!=='camp'&&!state.visited[next]) return;
      const cost=best[cur]+moveCost(cur,next);
      if(best[next]==null||cost<best[next]){ best[next]=cost; prev[next]=cur; queue.push(next); }
    });
  }
  if(best[to]==null) return null;
  const path=[to]; for(let at=to;at!==from;){at=prev[at];if(!at)return null;path.unshift(at);}
  return {path,cost:best[to]};
}

/* ================= 体力/时间 ================= */
function moveCost(from,to){ const a=LOCATIONS[from],b=LOCATIONS[to];let cost=state.flags.ridgeRoute&&a&&b&&a.zone==='地表'&&b.zone==='地表'?1:Math.max(1,2-(endingOwned('starchart')?1:0));
  if(state.visited&&state.visited[from]&&state.visited[to]&&facilityOnline('gravityAnchor'))cost=Math.max(1,Math.round(cost*(1-techBonus('travelPct')/100)));
  return cost; }
function staminaToCamp(from){
  if(from==='camp') return 0;
  const dist={[from]:0},queue=[from];
  while(queue.length){ queue.sort((a,b)=>dist[a]-dist[b]); const cur=queue.shift(); if(cur==='camp')return dist[cur];
    neighbors(cur).forEach(next=>{ if(!locationGate(next).ok)return; const d=dist[cur]+moveCost(cur,next); if(dist[next]==null||d<dist[next]){dist[next]=d;queue.push(next);} });
  }
  return Infinity;
}
function locExtraCost(){ const loc=LOCATIONS[P().location]; let e=0;
  if(loc.flooded)e+=2; if(loc.radiation&&!armorImmune('radiation'))e+=state.flags.radiationSuppressed?3:5; return e; }
function fieldMealActive(){ return !!(state.foodBuff&&state.foodBuff.id==='riverBroth'&&state.foodBuff.day===currentDay()&&state.foodBuff.charges>0); }
function areaActionCost(base){ return Math.max(1,base+locExtraCost()-(fieldMealActive()?1:0)); }
function spendStamina(base){ const discounted=fieldMealActive(),t=areaActionCost(base); P().stamina-=t;if(discounted)state.foodBuff.charges--;return t; }
function advanceTime(h){ state.time += (h||1); }
function fmtTime(){ const total=8+state.time, day=Math.floor(total/24)+1, hh=total%24; return '第'+day+'天 '+String(hh).padStart(2,'0')+':00'; }
function currentDay(){ return Math.floor((8+state.time)/24)+1; }
function buildingLevel(id){ return Math.max(1,(state.meta.buildLevels&&state.meta.buildLevels[id])||1); }
function facilityUsedToday(id){ return state.dailyFacility[id]===currentDay(); }
function gatherLimit(id){ const loc=LOCATIONS[id],p=loc&&loc.profile; return loc&&loc.resourceSite?3:(p==='mine'?3:2); }
function gatherCountToday(id){ const d=state.dailyGather[id]; return d&&d.day===currentDay()?d.count:0; }
function gatherAvailable(id){ return Math.max(0,gatherLimit(id)-gatherCountToday(id)); }
function recordGather(id){ const day=currentDay(),d=state.dailyGather[id]; if(!d||d.day!==day)state.dailyGather[id]={day,count:1};else d.count++; }
function locationActionCount(id){ const d=state.dailyLocation[id];return d&&d.day===currentDay()?d.count:0; }
function locationActionRemaining(id){ const a=LOCATION_ACTIONS[id];return a?Math.max(0,a.limit-locationActionCount(id)):0; }
function recordLocationAction(id){ const day=currentDay(),d=state.dailyLocation[id];if(!d||d.day!==day)state.dailyLocation[id]={day,count:1};else d.count++; }
function infectionTick(){ if(!P().infected)return true; P().hp-=2; log('感染发作：生命 -2。','danger'); if(P().hp<=0){die();return false;} return true; }
function materialSnapshot(){ const inv={};MATS.forEach(id=>inv[id]=state.inv[id]||0);return inv; }
function beginExpedition(){ if(P().location==='camp'&&!state.expeditionStartInv)state.expeditionStartInv=materialSnapshot(); }
function finishExpedition(){ state.expeditionStartInv=null; }
function exhaustionDeath(){
  if(P().location==='camp')return false;
  /* 只结算离营后净增加的材料；装备、任务道具和出发前库存都不会被误扣。 */
  const baseline=state.expeditionStartInv||materialSnapshot(),lost=[],warehouse=state.meta.built.warehouse?buildingLevel('warehouse'):0;
  const lossRate=Math.max(.25,.35-Math.max(0,warehouse-1)*.05);
  MATS.forEach(id=>{const earned=Math.max(0,(state.inv[id]||0)-(baseline[id]||0)),n=Math.ceil(earned*lossRate);if(n){state.inv[id]-=n;lost.push({id,n});}});
  state.runStats.deaths=(state.runStats.deaths||0)+1;state.combat=null;state.screen='play';state.tab='act';P().location='camp';P().stamina=0;P().hp=Math.max(1,P().hp);P().shield=0;
  state.mapOpen=false;state.campBuilding=null;state.campView='home';state.siteSheet={kind:'exhaustion',lost,lossRate};finishExpedition();advanceTime(6);
  updateCheckpoint();
  divider();log('体力耗尽。你在荒野中失去意识，搜救队将你带回方舟营地。','danger');log(lost.length?'遗失本次远征物资：'+lost.map(x=>ITEMS[x.id].name+'×'+x.n).join('、'):'本次远征没有可掉落的新增材料。','dim');divider();render();return true;
}

/* ================= 存档点/结算 ================= */
function snapshot(){ return JSON.parse(JSON.stringify({player:P(),inv:state.inv,defenses:state.defenses,rests:state.rests,skills:state.skills,quests:state.quests,questStart:state.questStart,flags:state.flags,areaSearch:state.areaSearch,investigationMisses:state.investigationMisses,discovered:state.discovered,dailyGather:state.dailyGather,dailyLocation:state.dailyLocation,dailyFacility:state.dailyFacility,foodBuff:state.foodBuff,truthClaimed:state.truthClaimed,visited:state.visited,runStats:state.runStats,kills:state.kills,time:state.time,meta:state.meta})); }
function updateCheckpoint(){ state.checkpoint=snapshot(); }
function restoreCheckpoint(){ const s=JSON.parse(JSON.stringify(state.checkpoint));
  state.player=s.player;state.inv=s.inv;state.defenses=s.defenses;state.rests=s.rests;state.skills=s.skills;state.quests=s.quests;state.questStart=s.questStart||{};state.flags=s.flags||{};state.areaSearch=s.areaSearch||{};state.investigationMisses=s.investigationMisses||{};state.discovered=s.discovered||{camp:true,outer:true,joeCamp:true};state.dailyGather=s.dailyGather||{};state.dailyLocation=s.dailyLocation||{};state.dailyFacility=s.dailyFacility||{};state.foodBuff=s.foodBuff||null;state.truthClaimed=s.truthClaimed||null;state.visited=s.visited;state.runStats=s.runStats;state.kills=s.kills;state.time=s.time;state.meta=s.meta||state.meta;
  migrateTechSnapshot(state);MATS.forEach(k=>{if(state.inv[k]==null)state.inv[k]=0;});Object.entries(state.meta.spaceItems||{}).forEach(([id,n])=>{if(ITEMS[id])state.inv[id]=Math.max(state.inv[id]||0,Number(n)||0);});Object.assign(state.quests,state.meta.spaceQuests||{});Object.assign(state.flags,state.meta.spaceFlags||{});Object.assign(state.discovered,state.meta.spaceDiscovered||{});
  normalizeEquipment(state.player,state.inv);
  state.combat=null;state.screen='play';state.tab='act';state.siteSheet=null;state.expeditionStartInv=null; }
function settleEcho(){ const r=state.runStats;
  const fromKills=Math.floor(r.wKill/20), fromDmg=Math.floor(r.dmg/150), fromMat=Math.floor(r.mat/25);
  const raw=fromKills+fromDmg+fromMat,total=Math.round(raw*(endingOwned('echoHeart')?1.25:1));
  return {total, fromKills, fromDmg, fromMat, kills:r.kills, wKill:r.wKill, dmg:r.dmg, mat:r.mat}; }

const SAVE_KEY='abyss_echo_v2';
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){} }
function load(){ try{ const r=localStorage.getItem(SAVE_KEY); if(r){state=JSON.parse(r);return true;} }catch(e){} return false; }

/* ================= DOM ================= */
const $=id=>document.getElementById(id);
const audioRuntime={ctx:null,sfxBus:null,musicBus:null,musicTimer:null,musicBar:0,musicActive:false,sfxVoices:new Set(),musicVoices:new Set()};
function createAudioRuntime(){
  if(audioRuntime.ctx)return audioRuntime.ctx;
  const AudioCtor=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AudioCtor)return null;
  try{
    const ctx=new AudioCtor(),sfx=ctx.createGain(),music=ctx.createGain();sfx.connect(ctx.destination);music.connect(ctx.destination);
    audioRuntime.ctx=ctx;audioRuntime.sfxBus=sfx;audioRuntime.musicBus=music;sfx.gain.value=0;music.gain.value=0;return ctx;
  }catch(_){return null;}
}
function setAudioBus(bus,value){const ctx=audioRuntime.ctx;if(!ctx||!bus)return;const now=ctx.currentTime;bus.gain.cancelScheduledValues(now);bus.gain.setTargetAtTime(Math.max(0,value),now,.035);}
function spawnAudioTone(bus,freq,start,duration,level,type){
  const ctx=audioRuntime.ctx;if(!ctx||!bus||ctx.state!=='running')return;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),end=start+duration,attack=Math.min(.08,duration*.24);
  osc.type=type||'sine';osc.frequency.setValueAtTime(freq,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,level),start+attack);gain.gain.exponentialRampToValueAtTime(.0001,end);
  const voice={osc,gain},voices=bus===audioRuntime.musicBus?audioRuntime.musicVoices:audioRuntime.sfxVoices;voices.add(voice);
  osc.connect(gain);gain.connect(bus);osc.start(start);osc.stop(end+.03);osc.onended=()=>{voices.delete(voice);try{osc.disconnect();gain.disconnect();}catch(_){}};
}
function stopAudioVoices(voices){voices.forEach(voice=>{try{voice.osc.stop();voice.osc.disconnect();voice.gain.disconnect();}catch(_){}});voices.clear();}
function stopAmbientMusic(){
  if(audioRuntime.musicTimer){clearTimeout(audioRuntime.musicTimer);audioRuntime.musicTimer=null;}stopAudioVoices(audioRuntime.musicVoices);audioRuntime.musicActive=false;setAudioBus(audioRuntime.musicBus,0);
}
function scheduleAmbientBar(){
  const ctx=audioRuntime.ctx;if(!ctx||ctx.state!=='running'||!state||!state.music||state.musicVolume<=0||document.hidden){stopAmbientMusic();return;}
  const roots=[73.42,58.27,65.41,55],root=roots[audioRuntime.musicBar++%roots.length],start=ctx.currentTime+.04;
  [[1,.055,'triangle'],[1.5,.036,'sine'],[2,.028,'sine']].forEach(([ratio,level,type],i)=>spawnAudioTone(audioRuntime.musicBus,root*ratio,start+i*.06,4.45,level,type));
  [2,2.25,1.5].forEach((ratio,i)=>spawnAudioTone(audioRuntime.musicBus,root*ratio,start+.55+i*1.18,.72,.022,'sine'));
  audioRuntime.musicTimer=setTimeout(scheduleAmbientBar,4100);
}
function startAmbientMusic(){
  if(audioRuntime.musicActive||!audioRuntime.ctx||audioRuntime.ctx.state!=='running'||!state.music||state.musicVolume<=0)return;
  audioRuntime.musicActive=true;scheduleAmbientBar();
}
function syncAudioState(){
  if(!audioRuntime.ctx)return;normalizeAudioPrefs(state);setAudioBus(audioRuntime.sfxBus,state.sound?state.soundVolume:0);
  if(state.music&&state.musicVolume>0){setAudioBus(audioRuntime.musicBus,state.musicVolume);startAmbientMusic();}else stopAmbientMusic();
}
function unlockAudio(){
  const ctx=createAudioRuntime();if(!ctx)return Promise.resolve(false);
  const ready=ctx.state==='suspended'?ctx.resume():Promise.resolve();
  return Promise.resolve(ready).then(()=>{if(document.hidden)return false;syncAudioState();return ctx.state==='running';}).catch(()=>false);
}
function playSfx(kind){
  if(!state||!state.sound||state.soundVolume<=0||document.hidden||!audioRuntime.ctx||audioRuntime.ctx.state!=='running')return;
  const patterns={
    tap:[[0,620,.045,.036,'square'],[.035,920,.04,.018,'sine']],
    success:[[0,440,.12,.055,'sine'],[.10,660,.13,.052,'sine'],[.20,880,.18,.045,'sine']],
    warning:[[0,280,.14,.06,'sawtooth'],[.17,235,.18,.052,'triangle']],
    error:[[0,180,.20,.07,'sawtooth'],[.11,115,.28,.06,'square']],
    story:[[0,392,.20,.04,'sine'],[.15,523.25,.30,.035,'sine']],
    travel:[[0,246.94,.18,.045,'triangle'],[.12,369.99,.24,.04,'sine']],
    combat:[[0,130,.12,.075,'square'],[.08,92,.22,.065,'sawtooth']]
  },pattern=patterns[kind]||patterns.tap,start=audioRuntime.ctx.currentTime+.008;
  pattern.forEach(([offset,freq,duration,level,type])=>spawnAudioTone(audioRuntime.sfxBus,freq,start+offset,duration,level,type));
}
let interactionFeedbackInstalled=false,feedbackBatch=null,feedbackFlushTimer=null,feedbackGeneration=0;
const pressedPointers=new Map();
const FEEDBACK_PRIORITY={dim:0,story:1,sys:2,good:3,success:3,warn:4,warning:4,danger:5,error:5};
function feedbackSpec(entries){
  const compact=[];(entries||[]).forEach(entry=>{const text=String(entry&&entry.text||'').trim(),cls=entry&&entry.cls||'story';if(!text||compact.length&&compact[compact.length-1].text===text)return;compact.push({text,cls});});
  const meaningful=compact.some(entry=>entry.cls!=='dim')?compact.filter(entry=>entry.cls!=='dim'):compact;
  const lines=meaningful.slice(-3),strongest=lines.reduce((best,entry)=>(FEEDBACK_PRIORITY[entry.cls]||0)>(FEEDBACK_PRIORITY[best]||0)?entry.cls:best,'dim');
  const map={danger:['is-error','DANGER // ACTION INTERRUPTED','alert'],error:['is-error','DANGER // ACTION INTERRUPTED','alert'],warn:['is-warning','WARNING // FIELD REPORT','alert'],warning:['is-warning','WARNING // FIELD REPORT','alert'],good:['is-success','RESULT // ACQUIRED','check'],success:['is-success','RESULT // ACQUIRED','check'],sys:['is-system','SYSTEM // OPERATION COMPLETE','scan'],story:['is-story','TRANSMISSION // FIELD REPORT','dialogue'],dim:['is-system','FIELD REPORT // NO CHANGE','document']},tone=map[strongest]||map.story;
  return {tone:tone[0],label:tone[1],icon:tone[2],lines,duration:lines.some(entry=>entry.cls==='story')?4800:strongest==='danger'||strongest==='error'?3800:3100};
}
function feedbackSound(spec){
  if(!spec)return 'tap';const text=spec.lines.map(x=>x.text).join(' ');
  if(spec.tone==='is-error')return 'error';if(spec.tone==='is-warning')return 'warning';if(spec.tone==='is-success')return 'success';
  if(/来到|移动至|航行|返航|离开营地/.test(text))return 'travel';if(spec.tone==='is-story')return 'story';return 'success';
}
function showActionFeedback(entries){
  const layer=$('action-feedback'),messages=$('feedback-messages'),label=$('feedback-label'),icon=$('feedback-icon-use'),spec=feedbackSpec(entries);if(!layer||!messages||!label||!icon||!spec.lines.length)return;
  const generation=++feedbackGeneration;layer.hidden=false;layer.className='action-feedback ui-toast '+spec.tone;label.textContent=spec.label;icon.setAttribute('href','#icon-'+spec.icon);messages.textContent='';
  spec.lines.forEach(entry=>{const p=document.createElement('p');p.className=entry.cls||'story';p.textContent=entry.text;messages.appendChild(p);});
  playSfx(feedbackSound(spec));
  layer.classList.remove('is-visible');void layer.offsetWidth;requestAnimationFrame(()=>{if(generation===feedbackGeneration)layer.classList.add('is-visible');});
  setTimeout(()=>{if(generation!==feedbackGeneration)return;layer.classList.remove('is-visible');setTimeout(()=>{if(generation===feedbackGeneration)layer.hidden=true;},180);},spec.duration);
}
function dismissActionFeedback(immediate){
  const layer=$('action-feedback'),messages=$('feedback-messages');feedbackGeneration++;
  if(!layer)return;layer.classList.remove('is-visible');
  if(immediate){layer.hidden=true;if(messages)messages.textContent='';return;}
  setTimeout(()=>{layer.hidden=true;if(messages)messages.textContent='';},180);
}
function flushFeedbackBatch(batch){
  if(!batch||!batch.entries.length)return;
  /* 战斗过程已有专用 feed；进入战斗时清掉旧 toast，离开战斗的胜利/逃脱结算则正常显示。 */
  if(state&&state.combat){const spec=feedbackSpec(batch.entries);playSfx(spec.tone==='is-error'||spec.tone==='is-warning'?'warning':'combat');dismissActionFeedback(true);return;}
  showActionFeedback(batch.entries);
}
function queueStandaloneFeedback(entry){
  if(feedbackBatch){feedbackBatch.entries.push(entry);return;}
  const batch={entries:[entry]};feedbackBatch=batch;feedbackFlushTimer=setTimeout(()=>{if(feedbackBatch===batch)feedbackBatch=null;flushFeedbackBatch(batch);},0);
}
function installInteractionFeedback(){
  if(interactionFeedbackInstalled)return;interactionFeedbackInstalled=true;
  const buttonFrom=e=>e.target&&e.target.closest?e.target.closest('button'):null;
  const release=e=>{const b=pressedPointers.get(e.pointerId)||buttonFrom(e);pressedPointers.delete(e.pointerId);if(b)setTimeout(()=>b.classList.remove('is-touching'),120);};
  document.addEventListener('pointerdown',e=>{const b=buttonFrom(e);if(!b||b.disabled)return;const previous=pressedPointers.get(e.pointerId);if(previous&&previous!==b)previous.classList.remove('is-touching');pressedPointers.set(e.pointerId,b);b.classList.add('is-touching');unlockAudio().then(ok=>{if(ok)playSfx('tap');});if(state&&state.vibration!==false&&e.pointerType==='touch'&&typeof navigator!=='undefined'&&navigator.vibrate)try{navigator.vibrate(8);}catch(_){}},{passive:true});
  document.addEventListener('pointerup',release,{passive:true});document.addEventListener('pointercancel',release,{passive:true});document.addEventListener('lostpointercapture',release,{passive:true});
  document.addEventListener('click',e=>{const b=buttonFrom(e);if(!b||b.disabled)return;if(feedbackBatch){clearTimeout(feedbackFlushTimer);feedbackBatch=null;}const batch={entries:[]};feedbackBatch=batch;feedbackFlushTimer=setTimeout(()=>{if(feedbackBatch===batch)feedbackBatch=null;flushFeedbackBatch(batch);},0);},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAmbientMusic();stopAudioVoices(audioRuntime.sfxVoices);if(audioRuntime.ctx&&audioRuntime.ctx.state==='running')audioRuntime.ctx.suspend().catch(()=>{});}else if(audioRuntime.ctx)unlockAudio();});
}
function setLogOpen(open){
  const tray=$('log'),peek=$('log-peek'); if(!tray||!peek)return;
  const yes=!!open&&tray.childElementCount>0;
  tray.classList.toggle('collapsed',!yes); peek.setAttribute('aria-expanded',yes?'true':'false');
  const label=peek.querySelector('.lp-label'); if(label)label.textContent=yes?'收起记录':'查看记录';
  if(yes)peek.classList.remove('unread');
}
function log(msg,cls){ const out=$('log'),peek=$('log-peek'),latest=$('log-latest'); const d=document.createElement('div'); d.className='line '+(cls||'story'); d.textContent=msg; out.appendChild(d); out.scrollTop=out.scrollHeight;
  if(state&&state.combat){const history=state.combat.history||(state.combat.history=[]);history.push({text:msg,cls:cls||'story'});if(history.length>6)history.shift();}
  if(interactionFeedbackInstalled)queueStandaloneFeedback({text:msg,cls:cls||'story'});
  if(peek){ peek.classList.remove('hidden'); peek.classList.add('unread'); } if(latest)latest.textContent=msg; }
function divider(){ const el=$('log'); const d=document.createElement('div'); d.className='line divider'; el.appendChild(d); el.scrollTop=el.scrollHeight; }
function el(tag,cls,html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
function uiIcon(name,cls){ return '<svg class="ui-icon'+(cls?' '+cls:'')+'" aria-hidden="true" focusable="false"><use href="#icon-'+name+'"></use></svg>'; }
function btn(a){ const b=el('button',a.cls, a.label+(a.cost?'<span class="cost">'+a.cost+'</span>':'')); if(a.disabled)b.disabled=true; b.onclick=a.fn; return b; }
function grid(box,items,one){ const g=el('div','grid'+(one?' one':'')); items.forEach(a=>g.appendChild(btn(a))); box.appendChild(g); }
function tileCard(icon,name,desc,onclick,opts){ opts=opts||{}; const b=el('button','tilecard'+(opts.lock?' lock':''));
  b.innerHTML='<span class="tile">'+(opts.lock?uiIcon('lock'):icon)+'</span><span class="tbody"><span class="tname">'+name+'</span><span class="tdesc">'+desc+'</span></span>';
  if(onclick)b.onclick=onclick; else b.disabled=true; return b; }
function title(box,t){ box.appendChild(el('div','panel-title',t)); }
function statTags(it){ const a=[]; if(it.atk)a.push('攻+'+it.atk); if(it.range)a.push('距离'+it.range); if(it.slot==='weapon'&&it.weaponType==='ranged'&&it.ammo)a.push(ITEMS[it.ammo].name+'-'+(it.ammoCost||1)+'/击'); else if(it.slot==='weapon')a.push('体力-'+(it.staminaCost==null?2:it.staminaCost)+'/击'); if(it.def)a.push('防+'+it.def); if(it.hp)a.push('生命+'+it.hp); if(it.spd)a.push('速+'+it.spd); if(it.move)a.push('移距+'+it.move); if(it.crit)a.push('暴击+'+it.crit+'%'); if(it.critDmg)a.push('暴伤+'+it.critDmg+'%'); if(it.ls)a.push('吸血+'+it.ls+'%'); if(it.dodge)a.push('闪避+'+it.dodge+'%'); if(it.hit)a.push('命中+'+it.hit); if(it.pen)a.push('穿透+'+it.pen+'%'); if(it.shield)a.push('护盾+'+it.shield); if(it.exec)a.push('斩杀'); if(it.imm)a.push(it.imm==='radiation'?'免疫辐射':'免疫污染'); return a.join(' '); }

/* ================= 初始引导 ================= */
let wakeTimer=null;
function tutorialActive(){ return !!(state&&state.tutorial&&!state.tutorial.complete); }
function tutorialHudUnlocked(){ return !!(state&&state.flags&&state.flags.braceletUnlocked); }
function setTutorialStep(step){
  if(!state.tutorial)state.tutorial={version:1,step:'wake',complete:false};
  state.tutorial.step=step; state.tab='act'; state.campView='home'; renderPanelTop();
}
function finishWakeAnimation(){
  wakeTimer=null;
  if(tutorialActive()&&state.tutorial.step==='wake')setTutorialStep('meet');
}
function scheduleWakeAnimation(){
  if(!document.body||wakeTimer!==null||!tutorialActive()||state.tutorial.step!=='wake')return;
  wakeTimer=setTimeout(finishWakeAnimation,2800);
}
function grantTutorialBracelet(){
  if(!tutorialActive())return;
  state.inv.arkBand=Math.max(1,state.inv.arkBand||0); state.flags.braceletUnlocked=true;
  setTutorialStep('bracelet');
}
function grantTutorialBuilder(){
  if(!tutorialActive())return;
  if(!state.tutorial.builderGranted){
    state.tutorial.builderGranted=true; state.inv.builderGun=Math.max(1,state.inv.builderGun||0);
    state.inv.scrap=(state.inv.scrap||0)+4; state.inv.wood=(state.inv.wood||0)+4;
  }
  state.flags.builderUnlocked=true; setTutorialStep('build');
}
function grantTutorialMap(){
  if(!tutorialActive())return;
  state.inv.fieldMap=Math.max(1,state.inv.fieldMap||0);
  if(!state.discovered)state.discovered={camp:true,outer:true,joeCamp:true};
  Object.assign(state.discovered,{camp:true,outer:true,joeCamp:true});
  Object.assign(state.flags,{mapUnlocked:true,exploreUnlocked:true});
  setTutorialStep('farewell');
}
function completeTutorial(){
  if(!state.tutorial)return;
  state.tutorial.step='done'; state.tutorial.complete=true; state.flags.guideDeparted=true;
  Object.assign(state.flags,{braceletUnlocked:true,builderUnlocked:true,mapUnlocked:true,exploreUnlocked:true});
  state.quests.first_exit=state.quests.first_exit||'active'; state.tab='act'; state.campView='home'; state.mapOpen=false; state.mapLevel='world'; state.mapSelectedRegion='camp';
  updateCheckpoint(); renderPanelTop();
}
function guidePortrait(){
  return '<span class="guide-portrait" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="21" r="11"/><path d="M13 57c2-15 10-23 19-23s17 8 19 23"/><path d="M23 18c4-8 15-11 22-3M21 42l11 7 11-7"/></svg><i></i></span>';
}
function tutorialCampScene(box){
  const scene=el('section','intro-camp-stage');
  scene.innerHTML='<div class="intro-location"><small>ARK // CAMP-01</small><b>方舟营地</b><span>应急维生区 · 未登记居住单元</span></div>'+
    '<div class="camp-horizon" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="camp-floor" aria-hidden="true"></div><div class="intro-open-space" aria-hidden="true"></div>';
  box.appendChild(scene); return scene;
}
function tutorialDialog(scene,text,action,fn){
  const dock=el('section','guide-dialog');
  dock.innerHTML=guidePortrait()+'<span class="guide-copy"><small>GUIDE // 老乔</small><b>老乔</b><p>'+text+'</p></span>';
  const next=el('button','guide-next',action+'<span aria-hidden="true">'+uiIcon('chevron-right')+'</span>'); if(fn)next.onclick=fn;else next.disabled=true; dock.appendChild(next); scene.appendChild(dock);
}
function tutorialReward(scene,icon,title,desc,code){
  scene.appendChild(el('section','tutorial-reward','<span class="reward-icon" aria-hidden="true"><svg><use href="#'+icon+'"></use></svg></span><span><small>'+code+'</small><b>'+title+'</b><p>'+desc+'</p></span><em>RECEIVE</em>'));
}
function renderTutorialPanel(box){
  box.classList.add('tutorial-panel'); const step=state.tutorial.step||'wake';
  if(step==='wake'){
    const wake=el('section','wake-scene');
    wake.innerHTML='<div class="wake-camp" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="wake-scan"></div><div class="wake-caption"><small>生命维持信号恢复</small><b>睁开眼</b></div><div class="wake-lid wake-top"></div><div class="wake-lid wake-bottom"></div>';
    box.appendChild(wake); scheduleWakeAnimation(); return;
  }
  const scene=tutorialCampScene(box);
  if(step==='meet'){
    const npc=el('button','guide-npc-call',guidePortrait()+'<span><small>附近的幸存者</small><b>老乔</b><em>点击交谈</em></span><i aria-hidden="true">'+uiIcon('chevron-right')+'</i>');
    npc.onclick=()=>setTutorialStep('dialogue_awake'); scene.appendChild(npc); return;
  }
  if(step==='dialogue_awake') return tutorialDialog(scene,'醒了？先别急着站起来。看着我——能听清吗？','能听清',()=>setTutorialStep('dialogue_crash'));
  if(step==='dialogue_crash') return tutorialDialog(scene,'这里是方舟七号的坠毁点。你在红色应急灯下醒来，不记得坠毁，只记得登船——是这样吧？','坠毁了？',()=>setTutorialStep('dialogue_records'));
  if(step==='dialogue_records') return tutorialDialog(scene,'舱壁上的屏幕只剩两行字：生命维持·部分失效 / 坠毁原因·记录损坏。想知道答案，先得活下来。','那我该做什么？',()=>setTutorialStep('bracelet_offer'));
  if(step==='bracelet_offer'){
    tutorialReward(scene,'icon-bracelet','方舟手环','生命状态同步 · 个人终端接入','PERSONAL LINK');
    return tutorialDialog(scene,'先戴上这个。它会把你的身体状态和方舟终端接起来。','接过手环',grantTutorialBracelet);
  }
  if(step==='bracelet'){
    scene.appendChild(el('div','tutorial-system-toast','<small>ARK BAND // LINKED</small><b>个人终端已接入</b><span>状态栏与 4 个功能入口已解锁</span>'));
    return tutorialDialog(scene,'上面会显示生命和行动能源；下面四个入口依次是角色、背包、科技和任务。先认清它们，等我走后再慢慢看。','记住了',()=>setTutorialStep('builder_offer'));
  }
  if(step==='builder_offer'){
    tutorialReward(scene,'icon-builder','模块建造枪','营地模块打印 · 基础结构校准','CONSTRUCTION TOOL');
    return tutorialDialog(scene,'想留下就得干活。撬棍拿来防身，这把建造枪用来安家。我再给你一点废铁和木头。','接过建造枪',grantTutorialBuilder);
  }
  if(step==='build'){
    const q=CAMP_BUILDINGS.find(b=>b.id==='quarters'),can=canAfford(q.cost);
    const module=el('section','tutorial-build-module','<header><span><small>CONSTRUCTION // MODULE 01</small><b>建造模块</b></span><em>READY</em></header><div class="tutorial-blueprint"><span class="blueprint-core">QTR</span><span><small>HABITAT</small><b>'+q.name+'</b><p>'+q.desc+'</p></span></div><div class="tutorial-materials"><span class="'+((state.inv.scrap||0)>=4?'ok':'no')+'">🔩 废铁 <b>'+(state.inv.scrap||0)+'/4</b></span><span class="'+((state.inv.wood||0)>=4?'ok':'no')+'">🪵 木材 <b>'+(state.inv.wood||0)+'/4</b></span></div>');
    const build=el('button',can?'primary tutorial-build-action':'','启动建造 · '+q.name); build.disabled=!can; build.onclick=()=>buildFacility(q); module.appendChild(build); scene.appendChild(module);
    return tutorialDialog(scene,'材料刚好够。选中建造模块，亲手把你的第一座休眠仓打出来。','请在上方建造',null);
  }
  if(step==='shelter'){
    scene.appendChild(el('section','tutorial-built','<span class="built-check">✓</span><span><small>FACILITY // ONLINE</small><b>休眠仓建造完成</b><p>现在你可以恢复状态，并在这里记录存档点。</p></span>'));
    return tutorialDialog(scene,'很好。至少今晚你不用睡在冷却管上了。不过材料不会自己跑来——走,教你怎么从废墟里回收有用的东西。','学习采集',()=>setTutorialStep('gather_intro'));
  }
  if(step==='gather_intro'){
    return tutorialDialog(scene,'看好了——废铁找拖痕,木材看裂缝。动手试试,我给你看着。','开始采集',()=>{
      state.masteries.gatherMastery=1; gainMat('scrap',2); gainMat('wood',2);
      log('老乔教会了你【采集精通】(Lv1)!','good'); log('获得 废铁×2、木材×2。','good');
      setTutorialStep('gather_action'); });
  }
  if(step==='gather_action'){
    return tutorialDialog(scene,'不错。以后每次采集都会让你更熟练,精通等级会自己涨。营地里其他人也有本事,找他们花材料学就是了。最后一样——拿着地图,别在外面迷路。','收下小地图',grantTutorialMap);
  }
  if(step==='farewell'){
    scene.appendChild(el('section','tutorial-minimap','<header><small>WORLD / LOCAL MAP // 01</small><b>初始测绘</b><em>ONLINE</em></header><div class="mini-route"><span class="mini-node current"><i></i><b>方舟营地</b></span><span class="mini-line"></span><span class="mini-node"><i></i><b>地表坠毁带</b></span></div><div class="mini-known-points"><small>地表坠毁带 · 已知坐标</small><span>◈ 坠毁带入口</span><span>⌂ 老乔营地</span></div><p>世界地图、局部地图与“开始探索”已解锁</p>'));
    return tutorialDialog(scene,'这张地图只保真到坠毁带入口和我的营地。黑木林、岩脊，还有地下的路，都得靠你一次次调查后自己标出来。我先回营地——以后路上见。','知道了，老乔',completeTutorial);
  }
  completeTutorial();
}

function renderTop(){
  const maxh=maxHp(), maxs=Math.round(maxStamina());
  P().hp=Math.min(P().hp,maxh); P().stamina=Math.min(P().stamina,maxs);
  $('hp').textContent=Math.max(0,P().hp)+'/'+maxh; $('hp-fill').style.width=Math.max(0,P().hp/maxh*100)+'%';
  $('stamina').textContent=P().stamina+'/'+maxs; $('st-fill').style.width=Math.max(0,P().stamina/maxs*100)+'%';
  $('time').textContent=fmtTime();
  $('pt-label').textContent='第'+state.meta.playthrough+'周目';
}
function renderTabbar(){ document.querySelectorAll('#tabbar .tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===state.tab)); const sb=$('set-btn'); if(sb) sb.classList.toggle('on', state.tab==='set'); }
function panelView(){
  if(tutorialActive())return 'tutorial';
  if(state.combat)return 'combat';
  if(state.screen==='death'||state.screen==='ending')return state.screen;
  if(state.tab==='char')return state.charView==='genes'?'genes':state.charView==='careers'?'careers':'character';
  if(state.tab==='bag'||state.tab==='tech'||state.tab==='task'||state.tab==='set')return ({bag:'bag',tech:'tech',task:'tasks',set:'settings'})[state.tab];
  if(P().location==='camp'){
    if(state.campBuilding&&state.meta.built[state.campBuilding])return 'facility';
    if(state.campView==='construct')return 'construction';
    if(state.campView==='teach')return 'camp';
    return state.mapOpen?'camp-map':'camp';
  }
  return state.mapOpen?'explore-map':'explore';
}
function render(){ renderTop(); const box=$('panel'); box.innerHTML=''; box.classList.remove('camp-home','tutorial-panel');
  box.dataset.view=panelView();
  const onboarding=tutorialActive(),hud=tutorialHudUnlocked();
  $('app').classList.toggle('tutorial-active',onboarding); $('app').classList.toggle('tutorial-nohud',onboarding&&!hud); $('app').classList.toggle('tutorial-hud',onboarding&&hud);
  $('app').classList.toggle('combat-active',!!state.combat);
  const panelOpen = !onboarding && !state.combat && state.screen==='play' && state.tab!=='act';
  $('app').classList.toggle('panel-open', panelOpen);
  const geneFull=state.tab==='char'&&state.charView==='genes';
  if (panelOpen && state.tab!=='tech'&&state.tab!=='char'&&state.tab!=='bag'&&!geneFull){ const cb=el('div','closebar');
    const x=el('button','closebtn ui-icon-button',uiIcon('close')); x.setAttribute('aria-label','关闭');
    x.onclick=()=>{ state.tab='act'; state.campBuilding=null; state.bagSel=null; state.charView='overview'; render(); };
    const t=el('span','ctitle',({char:'角色',bag:'背包',tech:'科技',task:'任务',set:'设置'})[state.tab]||'');
    cb.appendChild(x); cb.appendChild(t); box.appendChild(cb); }
  box.classList.toggle('tech-full', state.tab==='tech'||geneFull);
  renderPanel(box); renderSiteSheet(box); renderTabbar(); save(); }
function renderPanel(box){
  if (tutorialActive()) return renderTutorialPanel(box);
  if (state.combat) return renderCombatPanel(box);
  if (state.screen==='death') return renderDeathPanel(box);
  if (state.screen==='ending') return renderEndingPanel(box);
  if (state.tab==='char') return renderCharPanel(box);
  if (state.tab==='bag') return renderBagPanel(box);
  if (state.tab==='tech') return renderTechPanel(box);
  if (state.tab==='task') return renderTaskPanel(box);
  if (state.tab==='set') return renderSetPanel(box);
  return renderActPanel(box);
}

/* 手机端统一现场底部弹层：锁定入口和工具操作不再挤进常驻按钮区。 */
function renderSiteSheet(box){
  document.querySelectorAll('.site-sheet-backdrop').forEach(x=>x.remove());
  const ref=state.siteSheet;if(!ref||tutorialActive()||state.combat||state.screen!=='play')return;
  const backdrop=el('div','site-sheet-backdrop'+(state.tab==='act'?' hud-status':'')),sheet=el('section','site-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
  const close=el('button','site-sheet-close ui-icon-button',uiIcon('close'));close.setAttribute('aria-label','关闭');close.onclick=closeSiteSheet;
  if(ref.kind==='operation'){
    const op=FIELD_OPERATIONS[ref.id];if(!op){state.siteSheet=null;return;}
    const status=operationStatus(ref.id),searched=state.areaSearch[op.at]||0,need=op.minSearch||0;
    const reqRows=[];
    if(need>0)reqRows.push('<div class="site-sheet-req'+(searched>=need?' ok':'')+'"><i>'+uiIcon(searched>=need?'check':'scan')+'</i><span>现场调查</span><em>'+searched+'/'+need+'</em></div>');
    if(op.requireFlag){const ok=!!state.flags[op.requireFlag];reqRows.push('<div class="site-sheet-req'+(ok?' ok':'')+'"><i>'+uiIcon(ok?'check':'lock')+'</i><span>关键调查</span><em>'+(ok?'已完成':'未完成')+'</em></div>');}
    const costs=Object.entries(op.cost||{}).map(([item,n])=>'<i class="'+((state.inv[item]||0)>=n?'ok':'')+'">'+ITEMS[item].icon+' '+ITEMS[item].name+' '+(state.inv[item]||0)+'/'+n+'</i>').join('');
    sheet.innerHTML='<div class="site-sheet-grip"></div><div class="site-sheet-head"><span>'+op.icon+'</span><div><small>FIELD OPERATION</small><b>'+op.name+'</b></div></div><p>'+op.desc+'</p>'+(reqRows.length?'<div class="site-sheet-reqs">'+reqRows.join('')+'</div>':'')+(costs?'<div class="site-sheet-costs">'+costs+'</div>':'')+'<div class="site-sheet-status '+(status.ok?'ready':'')+'">'+status.text+'</div>';
    sheet.appendChild(close);
    let primaryLabel='执行现场操作',primaryFn=()=>performFieldOperation(ref.id),primaryDisabled=!status.ok;
    if(status.done){primaryLabel='已完成';primaryDisabled=true;}
    else if(searched<need){primaryLabel='调查现场 · '+searched+'/'+need;primaryDisabled=false;primaryFn=()=>explore('investigate');}
    else if(op.requireFlag&&!state.flags[op.requireFlag]){primaryLabel='先完成关键调查';primaryDisabled=true;}
    else if(!status.ok){primaryLabel='材料不足 · 无法执行';primaryDisabled=true;}
    const action=el('button','site-sheet-primary',primaryLabel);action.disabled=primaryDisabled;action.onclick=primaryFn;sheet.appendChild(action);
    if(!status.ok&&!status.done){const back=el('button','site-sheet-secondary','返回，先补齐条件');back.onclick=closeSiteSheet;sheet.appendChild(back);}
  }else if(ref.kind==='exhaustion'){
    const losses=(ref.lost||[]).map(x=>'<i>'+ITEMS[x.id].icon+' '+ITEMS[x.id].name+' -'+x.n+'</i>').join('');
    sheet.classList.add('exhaustion-sheet');sheet.innerHTML='<div class="site-sheet-grip"></div><div class="site-sheet-head"><span>!</span><div><small>EXPEDITION FAILED</small><b>体力耗尽</b></div></div><p>你在荒野中失去意识，被搜救队送回方舟营地。只会遗失本次远征中新获得的部分材料，出发前的背包与关键道具不受影响。</p><div class="site-sheet-costs">'+(losses||'<i class="ok">本次没有可掉落的新增材料</i>')+'</div>';
    sheet.appendChild(close);const action=el('button','site-sheet-primary','在营地醒来');action.onclick=closeSiteSheet;sheet.appendChild(action);
  }else if(ref.kind==='item'){
    const it=ITEMS[ref.id];if(!it||!has(ref.id)||state.tab!=='bag'){state.siteSheet=null;return;}
    const typeName=({equip:'装备',use:'消耗品',book:'技能书',key:'关键道具',trophy:'结局道具'})[it.type]||'物品',slot=SLOTS.find(x=>x[0]===it.slot),stats=it.type==='equip'?statTags(it):'',desc=it.desc||(it.type==='equip'?'装备至【'+slot[1]+'】后，所列属性将直接计入角色能力。':it.type==='book'?'研读后提升【'+SKILLS[it.skill].name+'】熟练度。':it.type==='use'?'可从背包主动使用。':it.type==='key'?'探索与任务中自动验证，无需主动使用。':'远征过程中取得的特殊物品。');
    const detailIcon=itemUiIcon(ref.id);
    const itemEmblem='<div class="item-detail-emblem">'+detailIcon+'<small>'+typeName+'</small></div>';
    const statCells=stats?stats.split(' ').map(x=>{const m=x.match(/^([^\d+-]+)([+-]?\d.*)$/);return '<span><small>'+(m?m[1]:'特性')+'</small><b>'+(m?m[2]:x)+'</b></span>';}).join(''):'';
    sheet.classList.add('item-detail-sheet');sheet.innerHTML='<div class="site-sheet-grip"></div><header class="item-detail-titlebar"><span><small>物品详情</small><b>ITEM PROFILE</b></span></header><div class="item-detail-hero">'+itemEmblem+'<div class="item-detail-copy"><small>'+(slot?slot[1]+' · ':'')+typeName+'</small><b>'+it.name+'</b><p>持有 '+state.inv[ref.id]+' 件 <i>#'+ref.id.toUpperCase()+'</i></p></div></div><div class="item-detail-note"><small>物品说明</small><p>'+desc+'</p></div>'+(statCells?'<div class="item-detail-section"><small>装备属性</small><em>EQUIPMENT STATS</em></div><div class="item-detail-stats">'+statCells+'</div>':'');
    sheet.appendChild(close);const usable=it.type==='equip'||it.type==='use'||it.type==='book',label=it.type==='equip'?'装备到'+slot[1]:it.type==='book'?'研读'+it.name:it.type==='use'?'使用'+it.name:'收起详情',action=el('button','site-sheet-primary',label);
    action.innerHTML=uiIcon(usable?(it.type==='equip'?'fit':'check'):'close')+'<span><small>'+(usable?'确认操作':'返回背包')+'</small><b>'+label+'</b></span>'+uiIcon('chevron-right');
    action.onclick=usable?()=>{state.siteSheet=null;if(it.type==='equip'){state.bagSel=null;equip(it.slot,ref.id);}else useItem(ref.id);}:closeSiteSheet;sheet.appendChild(action);
  }else if(ref.kind==='gate'){
    const loc=LOCATIONS[ref.id];if(!loc){state.siteSheet=null;return;}
    const gate=locationGate(ref.id),req=ENTRY_REQUIREMENTS[ref.id],owned=req&&has(req.item),reachable=isAdjacent(P().location,ref.id)||!!travelRoute(P().location,ref.id);
    sheet.innerHTML='<div class="site-sheet-grip"></div><div class="site-sheet-head"><span>'+loc.icon+'</span><div><small>ROUTE ACCESS</small><b>'+loc.name+'</b></div></div><p>'+(req?req.text:gate.text)+'</p>'+(req?'<div class="gate-tool '+(owned?'owned':'')+'"><i>'+ITEMS[req.item].icon+'</i><span><small>所需道具</small><b>'+ITEMS[req.item].name+'</b></span><em>'+(owned?'已持有':'未取得')+'</em></div><div class="gate-source"><small>获取线索</small><span>'+req.source+'</span></div>':'<div class="site-sheet-status">'+gate.text+'</div>');
    sheet.appendChild(close);
    const label=!gate.ok?'知道了':!reachable?'先抵达相邻地点':(req&&entryNeedsConfirm(ref.id)?req.action:'前往');
    const action=el('button','site-sheet-primary',label);action.onclick=(gate.ok&&reachable)?()=>confirmEntry(ref.id):closeSiteSheet;sheet.appendChild(action);
  }else{state.siteSheet=null;return;}
  backdrop.onclick=e=>{if(e.target===backdrop)closeSiteSheet();};backdrop.appendChild(sheet);document.body.appendChild(backdrop);
}

/* ---------- 行动 ---------- */
function mapNodeState(id){
  if(!locationRevealed(id)) return 'hidden';
  if(id===P().location) return 'current';
  const seen=id==='camp'||!!state.visited[id];
  if(isAdjacent(P().location,id)){ return locationGate(id).ok?'reachable':'locked'; }
  if(seen) return 'visited';
  return 'known';
}
function createMapShell(box,titleText,subtitle,onBack){
  const wrap=el('div','worldmap-wrap');
  const head=el('div','worldmap-head','<span class="wm-title"><b>'+titleText+'</b><small>'+subtitle+'</small></span>');
  const tools=el('div','map-tools');
  const zoomOut=el('button','map-tool ui-icon-button',uiIcon('minus')),zoomText=el('span','map-zoom'),zoomIn=el('button','map-tool ui-icon-button',uiIcon('plus')),locate=el('button','map-tool ui-icon-button',uiIcon('locate'));
  zoomOut.setAttribute('aria-label','缩小地图'); zoomIn.setAttribute('aria-label','放大地图'); locate.setAttribute('aria-label','定位当前位置');
  if(onBack){const back=el('button','map-back','世界地图');back.onclick=onBack;tools.appendChild(back);}
  const close=el('button','map-close','收起'); close.onclick=()=>{state.mapOpen=false;renderPanelTop();};
  tools.append(zoomOut,zoomText,zoomIn,locate,close);head.appendChild(tools);wrap.appendChild(head);
  const sc=el('div','worldmap-scroll'),stage=el('div','worldmap-stage'),cv=el('div','worldmap');
  sc.appendChild(stage);stage.appendChild(cv);wrap.appendChild(sc);
  const detail=el('div','map-detail');wrap.appendChild(detail);box.appendChild(wrap);
  return {wrap,stage,cv,detail,zoomOut,zoomText,zoomIn,locate};
}
function mountMapViewport(shell,canvas,positions,focusId,viewKey){
  const {stage,cv,zoomOut,zoomText,zoomIn,locate}=shell;
  cv.style.width=canvas.width+'px';cv.style.height=canvas.height+'px';cv.style.setProperty('--map-node-width',canvas.nodeWidth+'px');cv.style.setProperty('--map-node-height',canvas.nodeHeight+'px');
  if(!state.mapViews)state.mapViews={};
  const view=state.mapViews[viewKey]||(state.mapViews[viewKey]={scale:null,x:null,y:null});
  const version=viewKey+':'+canvas.layoutVersion;
  if(view.layoutVersion!==version){view.layoutVersion=version;view.scale=null;view.x=null;view.y=null;}
  function clampView(){
    const sw=stage.clientWidth,sh=stage.clientHeight,w=canvas.width*view.scale,h=canvas.height*view.scale;
    view.x=w<=sw?(sw-w)/2:Math.min(12,Math.max(sw-w-12,view.x));
    view.y=h<=sh?(sh-h)/2:Math.min(12,Math.max(sh-h-12,view.y));
  }
  function applyView(){clampView();cv.style.transform='translate('+view.x+'px,'+view.y+'px) scale('+view.scale+')';zoomText.textContent=Math.round(view.scale*100)+'%';}
  function centerOn(id){ const p=positions[id]||Object.values(positions)[0]||[0,0];view.x=stage.clientWidth/2-(p[0]+canvas.nodeWidth/2)*view.scale;view.y=stage.clientHeight/2-(p[1]+canvas.nodeHeight/2)*view.scale;applyView(); }
  function setZoom(next,cx,cy){
    const old=view.scale;next=Math.min(1.45,Math.max(.58,next));if(Math.abs(next-old)<.001)return;
    cx=cx==null?stage.clientWidth/2:cx;cy=cy==null?stage.clientHeight/2:cy;
    view.x=cx-(cx-view.x)*(next/old);view.y=cy-(cy-view.y)*(next/old);view.scale=next;applyView();
  }
  zoomOut.onclick=()=>setZoom(view.scale-.12);zoomIn.onclick=()=>setZoom(view.scale+.12);locate.onclick=()=>centerOn(focusId);
  stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();setZoom(view.scale+(e.deltaY<0?.1:-.1),e.clientX-r.left,e.clientY-r.top);},{passive:false});
  let drag=null;
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,ox:view.x,oy:view.y};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
  stage.addEventListener('pointermove',e=>{if(!drag)return;view.x=drag.ox+e.clientX-drag.x;view.y=drag.oy+e.clientY-drag.y;applyView();});
  stage.addEventListener('pointerup',e=>{drag=null;stage.classList.remove('dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);});
  requestAnimationFrame(()=>{if(view.scale==null)view.scale=Math.min(1,Math.max(.58,(stage.clientWidth-24)/canvas.width));if(view.x==null||view.y==null)centerOn(focusId);else applyView();});
}
function appendMapLines(cv,canvas,positions,links,isOn){
  const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('class','maplines');svg.setAttribute('viewBox','0 0 '+canvas.width+' '+canvas.height);
  links.forEach(([a,b,kind])=>{const pa=positions[a],pb=positions[b];if(!pa||!pb)return;const line=document.createElementNS(NS,'path');line.setAttribute('d',mapEdgePath(pa,pb,canvas));line.setAttribute('class','mapedge'+(isOn(a,b)?' on':'')+(kind?' '+kind:''));svg.appendChild(line);});
  cv.appendChild(svg);
}
function renderRegionMap(box){
  const shell=createMapShell(box,'世界地图','大区域导航 · 进入区域后查看具体地点');shell.wrap.classList.add('region-level');
  const unlocked=Object.keys(WORLD_REGIONS).filter(regionUnlocked),current=regionForLocation(P().location),progress=el('div','map-scopebar');
  progress.innerHTML='<span><small>WORLD REGIONS</small><b>已解锁 '+unlocked.length+'/'+Object.keys(WORLD_REGIONS).length+'</b></span><em>世界层只显示大区域，黑木林等地点会留在区域内部。</em>';shell.wrap.insertBefore(progress,shell.wrap.children[1]);
  appendMapLines(shell.cv,WORLD_MAP_CANVAS,WORLD_REGION_POS,WORLD_REGION_LINKS.filter(([a,b])=>unlocked.includes(a)&&unlocked.includes(b)),()=>true);
  const nodes=[];unlocked.forEach(id=>{const region=WORLD_REGIONS[id],p=WORLD_REGION_POS[id],st=id===current?'current':region.locations.some(loc=>state.visited[loc])?'visited':'known',d=regionDiscovery(id),n=el('button','mapnode region-node '+st);
    n.style.left=p[0]+'px';n.style.top=p[1]+'px';n.dataset.region=id;n.innerHTML='<span class="mn-icon">'+region.icon+'</span><span class="mn-copy"><span class="mn-zone">WORLD REGION</span><span class="mn-name">'+region.name+'</span><span class="mn-progress">'+d.known+'/'+d.total+' 地点</span></span>';n.onclick=()=>selectRegion(id);nodes.push(n);shell.cv.appendChild(n);});
  let selected=unlocked.includes(state.mapSelectedRegion)?state.mapSelectedRegion:current;state.mapSelectedRegion=selected;
  function renderDetails(){nodes.forEach(n=>n.classList.toggle('selected',n.dataset.region===selected));const region=WORLD_REGIONS[selected],d=regionDiscovery(selected),isHere=selected===current;
    shell.detail.innerHTML='<div class="md-mark">'+region.icon+'</div><div class="md-copy"><small>世界区域 · 已发现 '+d.known+'/'+d.total+' 个地点</small><b>'+region.name+'</b><p>'+region.desc+'</p><em>'+(isHere?'你当前位于这个区域':'打开局部地图查看已测绘地点与通行路线')+'</em></div>';
    const go=el('button','map-go',isHere&&selected==='camp'?'查看营地':'进入区域');go.onclick=()=>{state.mapLevel='local';state.mapRegion=selected;state.mapSelected=isHere?P().location:region.entry;renderPanelTop();};shell.detail.appendChild(go);
  }
  function selectRegion(id){selected=id;state.mapSelectedRegion=id;renderDetails();}
  renderDetails();mountMapViewport(shell,WORLD_MAP_CANVAS,WORLD_REGION_POS,current,'world');
}
function renderLocalMap(box,regionId){
  if(!WORLD_REGIONS[regionId]||!regionUnlocked(regionId))regionId=regionForLocation(P().location);
  const region=WORLD_REGIONS[regionId],layout=LOCAL_MAPS[regionId],shell=createMapShell(box,region.name,'局部地图 · 调查地点发现新的路线',()=>{state.mapLevel='world';renderPanelTop();});shell.wrap.classList.add('local-level');
  const d=regionDiscovery(regionId),hereInRegion=region.locations.includes(P().location),scope=el('div','map-scopebar');
  scope.innerHTML='<span><small>LOCAL SURVEY</small><b>已发现 '+d.known+'/'+d.total+' 个地点</b></span><em>勘察结果并不固定：可能发现路线、物资、敌情，也可能一无所获。</em>';shell.wrap.insertBefore(scope,shell.wrap.children[1]);
  const ids=region.locations.filter(id=>layout.pos[id]&&locationRevealed(id)),links=MAP_LINKS.filter(([a,b])=>ids.includes(a)&&ids.includes(b)).concat((layout.specialLinks||[]).filter(([a,b])=>ids.includes(a)&&ids.includes(b)));
  appendMapLines(shell.cv,layout.canvas,layout.pos,links,(a,b)=>(state.visited[a]||a===P().location||a==='camp')&&(state.visited[b]||b===P().location||b==='camp'));
  const nodes=[];ids.forEach(id=>{const loc=LOCATIONS[id],p=layout.pos[id],st=mapNodeState(id),gate=locationGate(id),unknown=st==='known',n=el('button','mapnode '+(unknown?'unknown':st));n.style.left=p[0]+'px';n.style.top=p[1]+'px';n.dataset.loc=id;
    n.innerHTML='<span class="mn-icon">'+(unknown?'?':loc.icon)+'</span><span class="mn-copy"><span class="mn-zone">'+(unknown?'UNSURVEYED':loc.zone)+'</span><span class="mn-name">'+(unknown?'未知区域':loc.name)+'</span></span>'+(st==='locked'?'<span class="mn-lock">'+gate.text+'</span>':'');if(unknown){n.disabled=true;n.setAttribute('aria-label','尚未探索的未知区域');}else n.onclick=()=>selectLocation(id);nodes.push(n);shell.cv.appendChild(n);});
  let selected=ids.includes(state.mapSelected)?state.mapSelected:(hereInRegion?P().location:region.entry);if(!ids.includes(selected))selected=ids[0];state.mapSelected=selected;
  function renderDetails(){nodes.forEach(n=>n.classList.toggle('selected',n.dataset.loc===selected));const loc=LOCATIONS[selected],gate=locationGate(selected),route=travelRoute(P().location,selected),spaceJump=(layout.specialLinks||[]).some(([a,b])=>(a===P().location&&b===selected)||(b===P().location&&a===selected)),milestone=nextDiscoveryMilestone(selected),routeNames=route?route.path.map(id=>LOCATIONS[id].name).join(' → '):'';let status='尚未建立可通行路线';
    if(selected===P().location)status='你当前就在这里';else if(!gate.ok)status=gate.text;else if(route)status='最短路线 '+(route.path.length-1)+' 段 · 消耗 '+route.cost+' 体力';else if(spaceJump)status='紫色虚线是曲率折叠航迹，必须从星际航线面板启航';else if(regionId!==regionForLocation(P().location))status='先从相邻大区域进入这里';
    if(selected===P().location&&milestone)status+=' · 该区域仍有尚未确认的路线线索';
    const site=loc.resourceSite?' · '+loc.resourceSite.label+'候选':'';
    shell.detail.innerHTML='<div class="md-mark">'+loc.icon+'</div><div class="md-copy"><small>'+region.name+' / '+loc.zone+site+'</small><b>'+loc.name+'</b><p>'+loc.desc+'</p><em>'+status+(route&&route.path.length>1?' · '+routeNames:'')+'</em></div>';
    const go=el('button','map-go',selected===P().location?'当前位置':'前往');
    if(selected===P().location)go.disabled=true;
    else if(!gate.ok){go.textContent='查看条件';go.onclick=()=>openSiteSheet('gate',selected);}
    else if(entryNeedsConfirm(selected)&&(isAdjacent(P().location,selected)||route)){go.textContent='处理入口';go.onclick=()=>openSiteSheet('gate',selected);}
    else if(spaceJump){go.textContent='返回星际航线';go.onclick=()=>{state.mapOpen=false;renderPanelTop();};}
    else {go.disabled=!route;if(route&&route.cost>P().stamina)go.textContent='前往会力竭';go.onclick=()=>travelTo(selected);}
    shell.detail.appendChild(go);
  }
  function selectLocation(id){selected=id;state.mapSelected=id;renderDetails();}
  renderDetails();mountMapViewport(shell,layout.canvas,layout.pos,hereInRegion?P().location:selected,'local-'+regionId);
}
function renderWorldMap(box){
  if(state.mapLevel==='local')return renderLocalMap(box,state.mapRegion||regionForLocation(P().location));
  renderRegionMap(box);
}
const TRUTH_EVIDENCE={故障线:'evidenceFault',内鬼线:'evidenceInner',信号线:'evidenceSignal'};
function evidenceReady(line){ return !!state.flags[TRUTH_EVIDENCE[line]]; }
function chooseTruthLine(line){
  if(!questActive('bridge')||P().location!=='layer6')return;
  if(!state.flags.commandDecoded){ log('先在指挥区读取两段核心记录，还原舰桥最后七十二小时。','warn'); return; }
  if(!evidenceReady(line)){ log('【'+line+'】还没有形成完整证据链，无法在舰桥提交。','warn'); return; }
  if(!state.truthClaimed&&!claimTruth(line)) return;
  if(state.truthClaimed!==line){ log('本周目已选择【'+state.truthClaimed+'】，无法改交其他证据。','warn'); return; }
  finishQuest('bridge',true); syncQuestProgress(true); render();
}
function extractSealedArchive(){
  if(P().location!=='sealedCabin'||!questActive('innerArchive')) return;
  if(!state.flags.archiveDecoded){ log('先在封存导航舱执行【读取核心记录】，找到离线备份。','warn'); return; }
  if(!state.flags.evidenceInner){
    state.flags.evidenceInner=true; divider();
    log('你将门禁记录与离线导航备份对照：所有“人员授权”都在事后由主系统补写。','story');
    log('取得【内鬼线】完整证据。','good'); divider();
  }
  syncQuestProgress(true); render();
}
function resolveTang(save){
  if(P().location!=='layer3'||!questActive('rescueTang'))return;
  if(save&&!armorImmune('radiation')){ log('维修井辐射强度致命。先制作并装备【防辐射服】，再尝试救人。','warn'); return; }
  state.flags.tangResolved=true; state.flags.tangSaved=!!save; state.flags.tangLost=!save; divider();
  if(save){ gainMat('ecomp',3); log('你穿过维修井，在隔离门彻底熔断前把小唐拖了出来。','story'); log('小唐交出抢救下来的反应堆数据芯片。获得：电子元件×3。','good'); }
  else { state.flags.radiationSuppressed=true; log('你启动远程封舱。维修井辐射明显下降，但小唐的通讯也永远停了。','story'); }
  divider(); syncQuestProgress(true); render();
}
function freeAyong(){
  if(P().location!=='layer5'||!questActive('freeAyong'))return;
  if(!has('accessCard')){ log('拘留舱需要巡逻队长的指挥权限卡。','warn'); return; }
  state.flags.ayongFreed=true; divider();
  log('权限卡划开拘留舱。阿勇第一句话不是道谢：“舰桥那晚没有人，航线是船自己改的。”','story');
  divider(); syncQuestProgress(true); render();
}
function resolveSeedChoice(mode){
  if(P().location!=='seedCitadel'||!questActive('exo_seed_choice')||metaFlag('verdantResolved'))return;
  if(mode==='sync'){
    if(!techKnown('surv_11')||!techKnown('echo_8')){log('受控共生需要【异星生态隔离】与【星间回响定位】。','warn');return;}
    setMetaFlag('verdantResolved');setMetaFlag('verdantPact');grantTechRecord('monolithCoordinates',true);divider();log('你没有摧毁种冠，而是向它开放一条受限的感知通道。它把静默星坐标作为第一句回答。','story');divider();syncQuestProgress(true);render();return;
  }
  startCombat('planetaryCrown');
}
function resolveFrontierChoice(id){
  if(P().location!=='zeroGate'||!questActive('exo_frontier_choice')||!metaFlag('gateGuardianDown'))return;
  const choices={conquest:['征服协议','以轨道武力清除威胁，快速建立人类控制区。'],symbiosis:['共生协议','优先理解当地生命与文明，在共同规则下建立据点。'],freeway:['自由航路','只控制航站和补给线，让每个世界保留自己的选择。']},choice=choices[id];if(!choice)return;
  state.meta.frontierDoctrine=id;setMetaFlag('frontierDoctrineChosen');divider();log('【新边疆法则·'+choice[0]+'】','sys');log(choice[1]+' 这将成为下一扩展星域的初始规则。','story');divider();syncQuestProgress(true);updateCheckpoint();render();
}
function renderLocalQuestActions(box){
  const here=P().location;
  QUESTS.filter(q=>questActive(q.id)&&q.type==='submit'&&q.turnAt===here).forEach(q=>{ const can=Object.entries(q.need).every(([k,v])=>(state.inv[k]||0)>=v);
    grid(box,[{label:'交付任务 · '+q.title,cost:questProgress(q),disabled:!can,cls:can?'primary':'',fn:()=>submitQuest(q.id)}],true); });
  if(here==='layer6'&&questActive('bridge')){
    if(!state.flags.commandDecoded){
      title(box,'<b>还原舰桥最后七十二小时</b> · 核心记录 '+Math.min(2,state.areaSearch.layer6||0)+'/2');
      grid(box,[{label:'先读取舰桥核心记录',cost:'使用上方【读取核心记录】推进调查',disabled:true}],true);
    } else {
      title(box,'<b>选择本周目的调查线</b> · 一次只能带走一组完整证据');
      if(state.truthClaimed) grid(box,[{label:'使用【'+state.truthClaimed+'】完成调查',cost:evidenceReady(state.truthClaimed)?'证据完整 · 其他证据留待下一周目':'尚未补全这条证据',disabled:!evidenceReady(state.truthClaimed),cls:'primary',fn:()=>chooseTruthLine(state.truthClaimed)}],true);
      else grid(box,[
        {label:'故障线',cost:evidenceReady('故障线')?'证据完整 · 导航故障与维护记录':'未完成：回工程区还原故障链',disabled:!evidenceReady('故障线'),fn:()=>chooseTruthLine('故障线')},
        {label:'内鬼线',cost:evidenceReady('内鬼线')?'证据完整 · 伪造授权与离线备份':'未完成：返回生活区封存导航舱',disabled:!evidenceReady('内鬼线'),fn:()=>chooseTruthLine('内鬼线')},
        {label:'信号线',cost:evidenceReady('信号线')?'证据完整 · 地下航路警告':'未完成：追踪地下信号源',disabled:!evidenceReady('信号线'),fn:()=>chooseTruthLine('信号线')}
      ]);
    }
  }
  if(here==='layer3'&&questActive('rescueTang')){
    const protectedNow=armorImmune('radiation');
    title(box,'<b>维修井救援</b> · 这是本周目不可撤回的选择');
    grid(box,[
      {label:'穿过维修井救出小唐',cost:protectedNow?'防辐射服已装备 · 救援':'需先装备【防辐射服】',disabled:!protectedNow,cls:protectedNow?'primary':'',fn:()=>resolveTang(true)},
      {label:'远程封死维修井',cost:'阻止泄漏扩散 · 小唐无法生还',cls:'danger',fn:()=>resolveTang(false)}
    ]);
  }
  if(here==='layer5'&&questActive('freeAyong')){
    grid(box,[{label:'打开军事区拘留舱',cost:has('accessCard')?'指挥权限卡已验证 · 救出阿勇':'需要指挥权限卡',disabled:!has('accessCard'),cls:has('accessCard')?'primary':'',fn:freeAyong}],true);
  }
  if(here==='sealedCabin'&&questActive('innerArchive')){
    const ready=!!state.flags.archiveDecoded;
    grid(box,[{label:'提取离线导航档案',cost:ready?'将门禁记录与离线备份交叉验证':'先读取核心记录',disabled:!ready,cls:ready?'primary':'',fn:extractSealedArchive}],true);
  }
  if(here==='seedCitadel'&&questActive('exo_seed_choice')&&!metaFlag('verdantResolved')){
    title(box,'<b>种冠城抉择</b> · 决定绿潮星与人类前哨的关系');
    grid(box,[{label:'受控共生',cost:'保留行星意识 · 需要生态隔离与回响定位',disabled:!techKnown('surv_11')||!techKnown('echo_8'),cls:'primary',fn:()=>resolveSeedChoice('sync')},{label:'压制行星王冠',cost:'进入区域首领战 · 以武力取得控制权',cls:'danger',fn:()=>resolveSeedChoice('fight')}]);
  }
  if(here==='zeroGate'&&questActive('exo_frontier_choice')&&metaFlag('gateGuardianDown')&&!metaFlag('frontierDoctrineChosen')){
    title(box,'<b>零号星门议案</b> · 这不是结局，而是下一星域的规则');
    grid(box,[{label:'征服协议',cost:'武力清场 · 快速扩张',fn:()=>resolveFrontierChoice('conquest')},{label:'共生协议',cost:'生态与文明协商 · 风险更复杂',cls:'primary',fn:()=>resolveFrontierChoice('symbiosis')},{label:'自由航路',cost:'控制航站与补给，不占领世界',fn:()=>resolveFrontierChoice('freeway')}]);
  }
}
function renderPanelTop(){ render(); requestAnimationFrame(()=>{const panel=$('panel');if(panel)panel.scrollTop=0;}); }
function openCampBuilding(id){ state.campBuilding=id; state.campView='home'; setLogOpen(false); renderPanelTop(); }
function renderCampHero(box){ const built=CAMP_BUILDINGS.filter(b=>state.meta.built[b.id]).length,nextRaid=state.flags.firstRaidSurvived?Math.max(0,3-(state.rests-(state.flags.lastRaidRest||0))):null;
  const hero=el('section','camp-hero'); hero.innerHTML='<div class="camp-hero-head"><span class="camp-mark" aria-hidden="true"><svg><use href="#icon-camp"></use></svg><i></i></span><span class="camp-hero-copy"><small>ARK // CAMP-01</small><h1>方舟营地</h1><p>舱段维生 · 设施调度 · 远征中枢</p></span><span class="camp-online"><i></i>ONLINE</span></div><div class="camp-metrics"><span><small>FACILITIES</small><b>'+String(built).padStart(2,'0')+'</b><em>已建设施</em></span><span><small>DEFENSE</small><b>'+String(defensePower()).padStart(2,'0')+'</b><em>营地防御</em></span><span><small>RAID CYCLE</small><b>'+(nextRaid==null?'--':String(nextRaid).padStart(2,'0'))+'</b><em>'+(nextRaid==null?'夜袭未触发':'距夜袭休息')+'</em></span></div>'; box.appendChild(hero); }
function renderCampContacts(box){
  const names=npcsAt('camp');if(!names.length)return;
  const sec=el('section','camp-contacts'),head=el('div','camp-section-head','<span><small>ACTIVE CONTACTS</small><b>营地联系人</b></span><em>剧情推进后位置会改变</em>'),list=el('div','camp-contact-list');sec.appendChild(head);
  names.forEach(name=>{
    const teachList=NPC_TEACH[name]||[];
    const label=teachList.length?'教学 · '+teachList.length+'项精通':'交谈';
    const b=el('button','camp-contact','<span>'+uiIcon('dialogue')+'</span><b>'+name+'</b><small>'+label+'</small>');
    b.onclick=()=>{ if(teachList.length){openNpcTeachPanel(name);} else {talkAreaNpc(name);} };
    list.appendChild(b);
  });sec.appendChild(list);box.appendChild(sec);
}
function openNpcTeachPanel(npcName){
  state.campView='teach'; state.teachNpc=npcName; setLogOpen(false); renderPanelTop();
}
function renderTeachPanel(box){
  const npcName=state.teachNpc; const teachList=NPC_TEACH[npcName]||[];
  title(box,'<b>'+npcName+' · 精通教学</b>');
  const back=el('button','','← 返回营地'); back.onclick=()=>{state.campView='home';renderPanelTop();}; box.appendChild(back);
  teachList.forEach(k=>{
    const m=MASTERIES[k]; const lv=masteryLv(k); const cost=masteryCost(k);
    const desc=m.desc.replace('{v}',m.perLv*(lv+1));
    const costStr=Object.entries(cost).map(([mat,n])=>ITEMS[mat].name+'×'+n).join(' ');
    const can=Object.entries(cost).every(([mat,n])=>(state.inv[mat]||0)>=n);
    const card=el('div','mastery-card');
    card.innerHTML='<div class="mc-head"><b>'+m.name+'</b><span class="mc-lv">Lv'+lv+'</span></div><div class="mc-desc">'+desc+'</div><div class="mc-cost">'+costStr+'</div>';
    const btn=el('button',can?'primary':'',lv===0?'学习':'升级'); btn.disabled=!can; btn.onclick=(()=>{const _k=k;return ()=>upgradeMastery(_k);})(); card.appendChild(btn);
    box.appendChild(card);
  });
  // 入门职业任务入口
  const noviceForNpc=Object.entries(NOVICE_JOBS).find(([,nj])=>nj.npc===npcName);
  if(noviceForNpc){
    const [nid,nj]=noviceForNpc; const hasJob=currentCareer(nid)||currentCareer(nj.formal);
    if(!hasJob){
      title(box,'<b>入门职业</b>');
      const qb=el('button','primary','接受训练 → '+nj.name); qb.onclick=(()=>{const _nid=nid;return ()=>chooseNoviceJob(_nid);})(); box.appendChild(qb);
      box.appendChild(el('div','mc-desc',nj.desc));
    }
  }
}
function renderCampHome(box){ state.campBuilding=null; state.campView='home'; box.classList.add('camp-home');
  renderCampHero(box);
  if(state.flags.mapUnlocked&&!state.mapOpen){ const mapbar=el('div','camp-mapbar camp-mapbar-top');const mapbtn=el('button','camp-map-toggle camp-command-card navigation','<span class="cc-icon" aria-hidden="true">'+uiIcon('map')+'</span><span class="cc-copy"><small>WORLD NAVIGATION</small><b>世界与区域地图</b><em>营地周边小地图 · 分层测绘</em><span class="camp-mini-route"><i class="here"></i><em></em><i></i></span></span><span class="command-access"><small>OPEN</small><i>'+uiIcon('chevron-right')+'</i></span>');mapbtn.onclick=()=>{state.mapOpen=true;state.mapLevel='world';state.mapSelectedRegion='camp';renderPanelTop();};mapbar.appendChild(mapbtn);box.appendChild(mapbar); }
  if(state.flags.mapUnlocked&&state.mapOpen)renderWorldMap(box);
  const unlocked=CAMP_BUILDINGS.filter(b=>!state.meta.built[b.id]&&hasBuildingTech(b.id)).length;
  const construction=el('button','camp-command-card construction camp-construction','<span class="cc-icon" aria-hidden="true">'+uiIcon('construct')+'</span><span class="cc-copy"><small>CONSTRUCTION</small><b>建筑管理</b><em>'+(unlocked?'有 '+unlocked+' 项设施可以建造':'研究科技解锁新设施')+'</em></span><span class="command-access"><small>MANAGE</small><i>'+uiIcon('chevron-right')+'</i></span>');construction.onclick=()=>{state.campView='construct';setLogOpen(false);renderPanelTop();};box.appendChild(construction);renderCampContacts(box);
  const head=el('div','camp-section-head','<span><small>HABITAT MODULES</small><b>已建设施</b></span><em>SELECT MODULE</em>');box.appendChild(head);
  const layout=el('div','camp-layout');
  CAMP_BUILDINGS.filter(b=>state.meta.built[b.id]).forEach(b=>{ const damaged=!!state.meta.damaged[b.id],lv=buildingLevel(b.id),card=el('button','camp-facility '+b.tone+(damaged?' damaged':''));
    const code=({quarters:'QTR',smelt:'SMT',work:'FAB',warehouse:'STO',recycler:'RCL',mess:'MES',armor:'ARM',chem:'MED',garden:'BIO',elec:'ELE',data:'DAT',range:'TRN',watch:'SEC',beacon:'BCN'})[b.id]||b.id.slice(0,3).toUpperCase();
    card.innerHTML='<span class="cf-icon" aria-hidden="true"><b>'+code+'</b><i></i></span><span class="cf-copy"><small>FACILITY // '+(damaged?'OFFLINE':'ONLINE')+'</small><b>'+b.name+'</b><em>'+(damaged?'受损停用 · 废铁×3修复':b.desc)+'</em></span><span class="cf-status"><small>'+(damaged?'STATE':'LEVEL')+'</small><b>'+(damaged?'ERR':String(lv).padStart(2,'0'))+'</b><i>'+(damaged?uiIcon('alert'):uiIcon('chevron-right'))+'</i></span>';
    card.onclick=damaged?()=>repairFacility(b.id):()=>openCampBuilding(b.id); layout.appendChild(card); }); box.appendChild(layout);
  const depart=el('div','camp-depart-dock');const expedition=el('button','camp-command-card expedition camp-depart','<span class="cc-icon" aria-hidden="true">'+uiIcon('expedition')+'</span><span class="cc-copy"><small>EXPEDITION // ROUTE 01</small><b>'+(state.flags.exploreUnlocked?'开始探索':'探索未解锁')+'</b><em>目的地 · 地表坠毁带</em></span><span class="departure-cost"><small>ENERGY</small><b>-02</b><i>'+uiIcon('chevron-right')+'</i></span>');expedition.disabled=!state.flags.exploreUnlocked;if(state.flags.exploreUnlocked)expedition.onclick=()=>move('outer');depart.appendChild(expedition);box.appendChild(depart);
}
function renderConstruction(box){ state.campBuilding=null; state.campView='construct'; const top=el('div','facility-nav'); const back=el('button','facility-back ui-icon-button',uiIcon('chevron-left'));back.setAttribute('aria-label','返回营地');back.onclick=()=>{state.campView='home';renderPanelTop();};top.appendChild(back);top.appendChild(el('div','facility-nav-title','<small>CONSTRUCTION</small><b>建筑管理</b><em>只显示科技已解锁的设施</em>'));box.appendChild(top);
  const available=CAMP_BUILDINGS.filter(b=>!state.meta.built[b.id]&&hasBuildingTech(b.id));
  const summary=el('div','build-summary','<span><b>'+available.length+'</b><small>可建造设施</small></span><p>新建筑完成后会出现在营地主页；升级在各建筑内部进行。</p>');box.appendChild(summary);
  if(!available.length){box.appendChild(el('div','build-empty','<span>⌁</span><b>当前没有新的建筑蓝图</b><p>继续探索并在科技树研究建筑类节点，解锁后会自动出现在这里。</p>'));return;}
  const list=el('div','build-list');available.forEach(b=>{const can=canAfford(b.cost),card=el('article','build-card '+b.tone);card.innerHTML='<div class="build-card-main"><span class="bc-icon">'+b.icon+'</span><span><small>NEW FACILITY</small><b>'+b.name+'</b><em>'+b.desc+'</em></span></div><div class="build-cost">'+costText(b.cost)+'</div>';const action=el('button',can?'primary':'','建造 '+b.name);action.disabled=!can;action.onclick=()=>buildFacility(b);card.appendChild(action);list.appendChild(card);});box.appendChild(list);
}
const ACTION_ICON={investigate:'scan',gather:'salvage',hunt:'combat'};
function renderSpaceRoutes(box,all){
  if(!state.meta.expansionUnlocked)return;const inSpace=['orbit','ashMoon','verdant','silent'].includes(regionForLocation(P().location)),routes=SPACE_ROUTES.filter(r=>all||spaceRouteDirection(r));if(!routes.length&&!all&&!inSpace)return;
  const sec=el('section','facility-section nav space-route-console');sec.appendChild(el('div','camp-section-head','<span><small>STELLAR NAVIGATION</small><b>星际航线</b></span><em>'+(shipReady()?'回声号 ONLINE':'远征舰未完成')+'</em>'));
  const list=el('div','operation-list');routes.forEach(route=>{const status=spaceFlightStatus(route),dir=status.dir,dest=dir&&dir.dest,loc=dest==='camp'?LOCATIONS.camp:LOCATIONS[dest],label=dir?((dir.forward?'前往 ':'返航 ')+(loc?loc.name:dest)):'航线未接入当前港口';list.appendChild(operationRow('✦',route.name,label,status.text,'启航',!status.ok,()=>launchSpaceRoute(route.id),status.ok?'primary':''));});sec.appendChild(list);
  if(!routes.length)list.appendChild(el('div','facility-empty','当前位置不是常规航线港口，可使用紧急返航返回方舟营地。'));
  if(!all&&inSpace){const emergency=el('button','danger facility-main-action','紧急返航 · 不消耗燃料');emergency.onclick=emergencySpaceReturn;sec.appendChild(emergency);sec.appendChild(el('div','tdet-line','永远可用；只抛弃部分本次远征新增普通材料，不会丢失技术资料、任务道具或星舰。'));}
  box.appendChild(sec);
}
function renderOutpostPanel(box){
  const rid=outpostRegion(),loc=LOCATIONS[P().location];if(!rid||!loc.colonizable)return;const op=state.meta.outposts[rid]||{parts:{},status:'surveyed'};
  const sec=el('section','facility-section outpost-console');sec.appendChild(el('div','camp-section-head','<span><small>PLANETARY OUTPOST</small><b>'+(rid==='ashMoon'?'赤烬卫星前哨':'绿潮星前哨')+'</b></span><em>'+op.status.toUpperCase()+'</em>'));
  const list=el('div','operation-list');OUTPOST_BUILDINGS.forEach(part=>{const status=outpostBuildStatus(part),built=!!(op.parts&&op.parts[part.id]);list.appendChild(operationRow(part.icon,part.name,part.desc,built?'已建成':status.text,built?'完成':'建造',built||!status.ok,()=>buildOutpostPart(part.id),status.ok?'primary':''));});sec.appendChild(list);
  if(op.parts&&op.parts.planetShield&&op.status==='defending'){const retry=el('button','danger facility-main-action','重新启动前哨防卫战');retry.onclick=()=>startCombat('outpostRaid',{outpostRegion:rid});sec.appendChild(retry);}
  if(op.status==='operational'){const actions=el('div','operation-list');actions.appendChild(operationRow('▰','前哨维护','恢复全部状态并建立检查点','用时 8 小时','休整',false,restAtOutpost,'primary'));if(op.parts.exoExtractor)actions.appendChild(operationRow('◆','收取异星资源','每日自动采集一次',facilityUsedToday('outpost:'+rid)?'今日已收取':'可以收取','收取',facilityUsedToday('outpost:'+rid),harvestOutpost,''));sec.appendChild(actions);}
  box.appendChild(sec);
}
function renderFieldPrompt(box,id){
  if(!id)return;const op=FIELD_OPERATIONS[id],status=operationStatus(id),prompt=el('button','site-prompt'+(status.ok?' ready':''));
  prompt.innerHTML='<span class="sp-mark">'+op.icon+'</span><span><small>现场待处理</small><b>'+op.name+'</b><em>'+status.text+'</em></span><i>'+uiIcon('chevron-right')+'</i>';
  prompt.onclick=()=>openSiteSheet('operation',id);box.appendChild(prompt);
}
function renderLocationAction(box,id){
  const a=LOCATION_ACTIONS[id];if(!a)return;
  const remaining=locationActionRemaining(id),cost=areaActionCost(a.cost),b=el('button','region-action location-action');
  b.innerHTML='<span class="ra-icon">'+uiIcon(a.icon)+'</span><span class="ra-copy"><small>SITE ACTION // '+a.code+'</small><b>'+a.name+'</b><em>'+a.desc+'</em></span><span class="ra-status"><small>DAILY</small><b>'+(remaining?'剩余 '+remaining+' 次 · 体力 -'+cost:'今日次数已用完')+'</b><i>'+uiIcon('chevron-right')+'</i></span>';
  b.disabled=!remaining;if(remaining)b.onclick=()=>performLocationAction(id);box.appendChild(b);
}
function renderActPanel(box){
  const loc=P().location;
  if(loc==='camp'){
    if(state.campBuilding&&state.meta.built[state.campBuilding])return renderBuilding(box,state.campBuilding);
    if(state.campView==='construct')return renderConstruction(box);
    if(state.campView==='teach')return renderTeachPanel(box);
    return renderCampHome(box);
  }
  const here=LOCATIONS[loc],profile=REGION_PROFILES[here.profile],localNpcs=npcsAt(loc);
  const regionId=regionForLocation(loc),region=WORLD_REGIONS[regionId];
  box.classList.add('field-console');
  if(state.mapOpen){box.classList.add('map-mode');renderWorldMap(box);return;}
  const threats=(here.enemies||[]).map(id=>ENEMIES[id].name).join('、')||'无主动威胁';
  const resources=Object.keys(here.loot||{}).slice(0,4).map(id=>ITEMS[id].name).join(' · ');
  const siteTag=here.resourceSite?'<i class="resource-site">据点候选 '+here.resourceSite.yield.map(id=>ITEMS[id].name).join(' · ')+'</i>':'',buffTag=fieldMealActive()?'<i class="meal-buff">鱼汤增益 '+state.foodBuff.charges+' 次</i>':'';
  const info=el('div','scene-card '+(profile?profile.tone:'camp'));
  const mapped=regionDiscovery(regionId),backNeed=staminaToCamp(loc);
  info.innerHTML='<div class="scene-head"><div class="scene-mark">'+uiIcon('expedition')+'<i></i></div><div class="scene-copy"><span class="lc-zone">EXPEDITION // '+region.name+' // '+here.zone+'</span><b>'+here.name+'</b><span>'+locationSceneDescription(loc)+'</span></div><span class="scene-online"><i></i>LINKED</span></div><div class="scene-tags"><i>资源 '+(resources||'营地设施')+'</i><i>威胁 '+threats+'</i>'+siteTag+buffTag+(localNpcs.length?'<i class="npc">NPC '+localNpcs.join(' · ')+'</i>':'')+'</div><div class="scene-metrics"><span><small>SURVEY</small><b>'+mapped.known+'/'+mapped.total+'</b><em>区域测绘</em></span><span><small>HAZARD</small><b>'+((here.enemies||[]).length?'ACTIVE':'CLEAR')+'</b><em>'+(profile?profile.label:'安全区')+'</em></span><span><small>RETURN</small><b>'+(Number.isFinite(backNeed)?String(backNeed).padStart(2,'0'):'--')+'</b><em>返程体力</em></span></div>';
  box.appendChild(info);
  const mapbar=el('div','explore-tools explore-tools-top');
  const mapbtn=el('button','map-toggle camp-command-card','<span class="cc-icon">'+uiIcon('map')+'</span><span class="cc-copy"><small>LOCAL NAVIGATION</small><b>'+region.name+' · 局部地图</b><em>已发现 '+mapped.known+'/'+mapped.total+' 个地点 · 查看路线网络</em></span><span class="command-access"><small>OPEN</small><i>'+uiIcon('chevron-right')+'</i></span>');
  mapbtn.onclick=()=>{state.mapOpen=true;state.mapLevel='local';state.mapRegion=regionId;state.mapSelected=loc;renderPanelTop();}; mapbar.appendChild(mapbtn); box.appendChild(mapbar);
  const nb=neighbors(loc);
  if(nb.length){
    const route=el('div','route-panel','<div class="camp-section-head route-title"><span><small>MOVEMENT</small><b>移动路线</b></span><em>点按目的地直接前往 · 移动后无需切换页签</em></div>');
    const rg=el('div','route-list');
    nb.forEach(id=>{ const g=locationGate(id),nl=LOCATIONS[id],cost=moveCost(loc,id),b=el('button','routebtn'+(g.ok?'':' locked'));
      const entry=g.ok&&entryNeedsConfirm(id),tired=g.ok&&!entry&&P().stamina<cost,label=!g.ok?g.text:(entry?ENTRY_REQUIREMENTS[id].action:(tired?'体力不足 · 前往会力竭':'前往 · 体力 -'+cost));
      b.innerHTML='<span>'+uiIcon(g.ok?'map':'lock')+'</span><span><small>DESTINATION</small><b>'+nl.name+'</b><em>'+label+'</em></span><i>'+uiIcon('chevron-right')+'</i>';
      if(!g.ok){b.setAttribute('aria-label',nl.name+'，查看进入条件');b.onclick=()=>openSiteSheet('gate',id);}
      else if(entry){b.onclick=()=>openSiteSheet('gate',id);}
      else b.onclick=()=>move(id);rg.appendChild(b); });
    route.appendChild(rg); box.appendChild(route);
    const safe=P().stamina>=backNeed,risk=el('div','return-risk'+(safe?'':' danger'));
    risk.innerHTML='<span class="return-mark">'+uiIcon('energy')+'</span><span><small>RETURN RISK</small><b>返程风险</b><em>最短路线需要 '+(Number.isFinite(backNeed)?backNeed:'未知')+' 体力 · 体力归零将力竭死亡，并遗失本次远征新增材料的一部分</em></span><i>'+(safe?'返程体力充足':'无法安全返程')+'</i>';box.appendChild(risk);
  }
  box.appendChild(el('div','camp-section-head field-section-head','<span><small>FIELD OPERATIONS</small><b>现场行动</b></span><em>SELECT OPERATION</em>'));
  const ag=el('div','region-actions');
  renderLocationAction(ag,loc);
  (profile.actions||[]).forEach(a=>{ const cost=areaActionCost(a.mode==='gather'?2:1),b=el('button','region-action '+(a.mode==='investigate'?'primary':'') );
    const remaining=a.mode==='gather'?gatherAvailable(loc):null;
    const hazard=here.contamination&&!armorImmune('contamination')?' · 生命 -3':'';
    const actionMeta=(a.mode==='gather'?(remaining?'今日剩余 '+remaining+' 次 · 体力 -'+cost:'今日资源已回收完 · 次日刷新'):(a.mode==='investigate'?'结果未知 · 体力 -'+cost:'体力 -'+cost))+hazard;
    const actionDesc=a.mode==='investigate'?'随机结果：路线线索、物资痕迹、敌对遭遇或无发现':a.desc+' · 可能触发随机遭遇';
    b.innerHTML='<span class="ra-icon">'+uiIcon(ACTION_ICON[a.mode]||'unknown')+'</span><span class="ra-copy"><small>OPERATION // '+a.mode.toUpperCase()+'</small><b>'+a.name+'</b><em>'+actionDesc+'</em></span><span class="ra-status"><small>COST</small><b>'+actionMeta+'</b><i>'+uiIcon('chevron-right')+'</i></span>';
    if(a.mode==='gather'&&!remaining)b.disabled=true; else b.onclick=()=>explore(a.mode); ag.appendChild(b); });
    localNpcs.forEach(name=>{ const b=el('button','region-action npc-action'); b.innerHTML='<span class="ra-icon">'+uiIcon('dialogue')+'</span><span class="ra-copy"><small>CONTACT // LOCAL</small><b>与'+name+'交谈</b><em>询问任务、线索与当前区域情报</em></span><span class="ra-status"><small>COST</small><b>无消耗</b><i>'+uiIcon('chevron-right')+'</i></span>'; b.onclick=()=>talkAreaNpc(name); ag.appendChild(b); });
    box.appendChild(ag);
    renderFieldPrompt(box,fieldOperationAt(loc));
    renderLocalQuestActions(box);
    renderOutpostPanel(box);
    renderSpaceRoutes(box,false);
    if(P().infected) grid(box,[{label:'用血清清感染',cost:has('serum')?'清除':'无血清',disabled:!has('serum'),cls:'danger',fn:()=>useItem('serum')}],true);
}

/* ---------- 角色 · 属性 / 技能栏 / 成长入口 ---------- */
const STAT_LABEL={hp:'生命',hpPct:'生命',atk:'攻击',atkPct:'攻击',def:'防御',defPct:'防御',spd:'速度',spdPct:'速度',crit:'暴击',critDmg:'暴伤',dodge:'闪避',hit:'命中',pen:'穿透',stMax:'体力',stMaxPct:'体力',shield:'护盾',shieldPct:'护盾',skillDamagePct:'技能伤害',damageReductionPct:'受到伤害',gatherPct:'采集',recyclePct:'拆解',craftSavePct:'材料返还',smeltPct:'熔炼',gardenPct:'菌圃',bioGatherPct:'生物采集'};
function bonusText(b){ return Object.entries(b||{}).map(([k,v])=>k==='damageReductionPct'?'受到伤害 -'+v+'%':STAT_LABEL[k]+' +'+v+(k.endsWith('Pct')||['crit','critDmg','dodge','hit','pen'].includes(k)?'%':'')).join(' · '); }
function renderSkillLoadout(box){
  title(box,'<span class="section-code">ACTIVE LOADOUT</span><b>主动技能栏</b><small>选择槽位，再装配技能</small>');
  const slots=el('div','skill-slots'); (state.skillSlots||[]).forEach((k,i)=>{const s=k&&SKILLS[k],b=el('button','skill-slot'+(state.skillSlotSel===i?' selected':'')+(s?' filled':'')); b.onclick=()=>{state.skillSlotSel=i;render();}; b.innerHTML='<i>0'+(i+1)+'</i><strong>'+(s?s.name:'空槽位')+'</strong><small>'+(s?('体力 -'+s.cost+' · 点击选中'):'点击选中')+'</small>'; if(s){const x=el('span','slot-remove','×');x.onclick=e=>{e.stopPropagation();unequipSkill(i);};b.appendChild(x);} slots.appendChild(b);}); box.appendChild(slots);
  const active=Object.keys(SKILLS).filter(k=>SKILLS[k].type==='active'&&skillUnlocked(k));
  const lib=el('div','skill-library'); if(!active.length)lib.appendChild(el('div','empty-note','尚未解锁主动技能。技能书或战斗职业会提供新技能。'));
  active.forEach(k=>{const s=SKILLS[k],at=equippedSlot(k),b=el('button','skill-card'+(at>=0?' equipped':''));b.innerHTML='<span class="skill-type">ACTIVE</span><b>'+s.name+'</b><small>'+s.desc+' · 体力 '+s.cost+'</small><em>'+(at>=0?('已装配 0'+(at+1)):'装配到选中槽')+'</em>';b.onclick=()=>equipSkill(k,state.skillSlotSel);lib.appendChild(b);}); box.appendChild(lib);
  title(box,'<span class="section-code">PASSIVE MATRIX</span><b>被动技能</b><small>自动生效，不占技能槽</small>');
  const passives=Object.keys(SKILLS).filter(k=>SKILLS[k].type==='passive'&&skillUnlocked(k)),pg=el('div','passive-grid');
  if(!passives.length)pg.appendChild(el('div','empty-note','职业达到对应等级后，被动模块会在这里自动接入。'));
  passives.forEach(k=>{const s=SKILLS[k];pg.appendChild(el('div','passive-card','<span>AUTO</span><b>'+s.name+'</b><small>'+s.desc+'</small>'));}); box.appendChild(pg);
}
function careerSummary(kind){const r=careerRecord(kind);if(!r)return '未转职';return JOBS[r.id].name+' · Lv'+r.level;}
function renderCharPanel(box){
  if(state.charView==='genes')return renderGenePanel(box); if(state.charView==='careers')return renderCareerPanel(box);
  const profile=el('section','camp-hero char-console char-profile-card');
  profile.innerHTML='<div class="camp-hero-head"><span class="camp-mark char-mark" aria-hidden="true">'+uiIcon('personnel')+'<i></i></span><span class="camp-hero-copy"><small>PERSONNEL // SURVIVOR-01</small><h1>幸存者档案</h1><p>生命状态 · 战斗参数 · 成长矩阵</p></span><span class="camp-online"><i></i>SYNC</span></div><div class="char-xp"><span><small>LEVEL</small><b>'+String(P().level).padStart(2,'0')+'</b></span><div class="xpbar"><div class="xpfill" style="width:'+Math.min(100,P().xp/xpNeed(P().level)*100)+'%"></div></div><em>XP '+P().xp+' / '+xpNeed(P().level)+'</em></div><div class="camp-metrics char-vitals"><span><small>VITAL</small><b>'+Math.max(0,P().hp)+'</b><em>/ '+maxHp()+'</em></span><span><small>ENERGY</small><b>'+P().stamina+'</b><em>/ '+Math.round(maxStamina())+'</em></span><span><small>ATTACK</small><b>'+totalAtk()+'</b><em>战斗输出</em></span><span><small>DEFENSE</small><b>'+totalDef()+'</b><em>伤害抵抗</em></span></div>';box.appendChild(profile);
  box.appendChild(el('div','camp-section-head char-section-head','<span><small>EVOLUTION MATRIX</small><b>成长系统</b></span><em>SELECT CORE</em>'));
  const nav=el('div','growth-nav character-quick-nav');
  const gene=el('button','camp-command-card char-command gene-entry','<span class="cc-icon">DNA</span><span class="cc-copy"><small>GENE LOCK</small><b>基因锁 · '+geneTier()+' 阶</b><em>'+Object.keys(state.meta.geneNodes||{}).filter(k=>state.meta.geneNodes[k]).length+' / '+GENE_NODES.length+' 节点已激活</em></span><span class="command-access"><small>OPEN</small><i>'+uiIcon('chevron-right')+'</i></span>');gene.onclick=()=>{state.charView='genes';state.geneZoom=.78;state.genePanX=0;state.genePanY=0;renderPanelTop();};nav.appendChild(gene);
  const career=el('button','camp-command-card char-command career-entry','<span class="cc-icon">JOB</span><span class="cc-copy"><small>CAREER MATRIX</small><b>'+careerSummary('main')+'</b><em>副职 · '+careerSummary('life')+'</em></span><span class="command-access"><small>OPEN</small><i>'+uiIcon('chevron-right')+'</i></span>');career.onclick=()=>{state.charView='careers';renderPanelTop();};nav.appendChild(career);box.appendChild(nav);
  if(P().infected)box.appendChild(el('div','warnline','感染状态 · 每次行动损失生命，需要抗感染血清'));
  const cells=[['生命',Math.max(0,P().hp)+' / '+maxHp()],['体力',P().stamina+' / '+Math.round(maxStamina())],['攻击',totalAtk()],['防御',totalDef()],['速度',baseSpd()],['护盾',(P().shield||0)+' / '+shieldMax()],['攻击距离',atkRange()],['移动距离',moveRange()],['暴击率',statCrit()+'%'],['暴击伤害',statCritDmg()+'%'],['闪避',statDodge()+'%'],['命中',statHit()+'%'],['护甲穿透',statPen()+'%'],['生命偷取',statLS()+'%']];
  const stats=el('details','char-fold stat-fold');stats.innerHTML='<summary class="camp-command-card char-fold-trigger"><span class="cc-icon char-module-code">01</span><span class="cc-copy"><small>COMBAT PARAMETERS</small><b>详细属性</b><em>速度 '+baseSpd()+' · 护盾 '+(P().shield||0)+'/'+shieldMax()+' · 暴击 '+statCrit()+'%</em></span><span class="command-access"><small>MODULE</small><i>'+uiIcon('chevron-right')+'</i></span></summary>';
  const g=el('div','statlist char-stats');cells.forEach(c=>g.appendChild(el('div','srow','<span class="k">'+c[0]+'</span><span class="v">'+c[1]+'</span>')));stats.appendChild(g);box.appendChild(stats);
  const skills=el('details','char-fold skill-fold');skills.innerHTML='<summary class="camp-command-card char-fold-trigger"><span class="cc-icon char-module-code">02</span><span class="cc-copy"><small>SKILL LOADOUT</small><b>技能配置</b><em>主动槽 '+(state.skillSlots||[]).filter(Boolean).length+'/3 · 被动 '+Object.keys(SKILLS).filter(k=>SKILLS[k].type==='passive'&&skillUnlocked(k)).length+'</em></span><span class="command-access"><small>MODULE</small><i>'+uiIcon('chevron-right')+'</i></span></summary>';
  const skillBody=el('div','char-fold-body');renderSkillLoadout(skillBody);skills.appendChild(skillBody);box.appendChild(skills);
  const learnedM=Object.entries(MASTERIES).filter(([k])=>masteryLv(k)>0);
  const masterySec=el('details','char-fold mastery-fold');masterySec.innerHTML='<summary class="camp-command-card char-fold-trigger"><span class="cc-icon char-module-code">03</span><span class="cc-copy"><small>MASTERY GRID</small><b>精通面板</b><em>已学 '+learnedM.length+' / '+Object.keys(MASTERIES).length+'</em></span><span class="command-access"><small>MODULE</small><i>'+uiIcon('chevron-right')+'</i></span></summary>';
  const mBody=el('div','char-fold-body mastery-grid');
  if(!learnedM.length){mBody.appendChild(el('div','mc-empty','尚未学习任何精通，前往营地找NPC学习'));}
  learnedM.forEach(([k,m])=>{const lv=masteryLv(k),bonus=m.perLv*lv,cost=masteryCost(k);
    const costStr=Object.entries(cost).map(([mat,n])=>ITEMS[mat].name+'×'+n).join(' ');
    const can=Object.entries(cost).every(([mat,n])=>(state.inv[mat]||0)>=n);
    const card=el('div','mastery-card');
    card.innerHTML='<div class="mc-head"><b>'+m.name+'</b><span class="mc-lv">Lv'+lv+'</span></div><div class="mc-desc">'+m.desc.replace('{v}',bonus)+'</div><div class="mc-cost"><small>NEXT</small> '+costStr+'</div>';
    if(P().location==='camp'){const btn=el('button',can?'primary':'',can?'升级':'材料不足');btn.disabled=!can;btn.onclick=(()=>{const _k=k;return ()=>upgradeMastery(_k);})();card.appendChild(btn);}
    mBody.appendChild(card);});
  masterySec.appendChild(mBody);box.appendChild(masterySec);
  const echo=el('details','char-fold echo-fold');echo.innerHTML='<summary class="camp-command-card char-fold-trigger"><span class="cc-icon char-module-code">04</span><span class="cc-copy"><small>ECHO UPGRADES</small><b>回响强化</b><em>可用回响 '+state.meta.echo+'</em></span><span class="command-access"><small>MODULE</small><i>'+uiIcon('chevron-right')+'</i></span></summary>';
  const echoBody=el('div','char-fold-body');grid(echoBody,Object.entries(ECHO_UPGRADES).map(([id,e])=>{const lv=state.meta.echoUp[id]||0,cost=echoUpgradeCost(id);return {label:e.name+' Lv'+lv,cost:e.desc+' · 回响×'+cost,disabled:state.meta.echo<cost,cls:state.meta.echo>=cost?'primary':'',fn:()=>buyEchoUpgrade(id)};}));echo.appendChild(echoBody);box.appendChild(echo);
}
const TREE_SVG_NS='http://www.w3.org/2000/svg';
const TREE_ZOOM_MIN=.14;
function treeCardBox(canvas,dataAttr,id){
  const node=canvas.querySelector('['+dataAttr+'="'+id+'"]'),card=node&&node.querySelector('.tn-card');
  if(!node||!card)return null;
  const l=node.offsetLeft+card.offsetLeft,t=node.offsetTop+card.offsetTop,w=card.offsetWidth,h=card.offsetHeight;
  return {l,r:l+w,t,b:t+h,y:t+h/2,cx:l+w/2,nt:node.offsetTop-3,nb:node.offsetTop+node.offsetHeight+3};
}
function treePortOffset(index,total){
  if(total<2)return 0;
  const step=Math.min(8,18/(total-1));
  return (index-(total-1)/2)*step;
}
function prepareTreeEdges(raw,boxOf){
  const boxes={},get=id=>boxes[id]||(boxes[id]=boxOf(id));
  raw.forEach(e=>{get(e.from);get(e.to);});
  const edges=raw.map(e=>Object.assign({},e,{a:get(e.from),c:get(e.to)})).filter(e=>e.a&&e.c),outs={},ins={};
  edges.forEach(e=>{(outs[e.from]=outs[e.from]||[]).push(e);(ins[e.to]=ins[e.to]||[]).push(e);});
  Object.values(outs).forEach(list=>list.sort((a,b)=>a.c.y-b.c.y||a.c.cx-b.c.cx).forEach((e,i)=>{e.outIndex=i;e.outCount=list.length;}));
  Object.values(ins).forEach(list=>list.sort((a,b)=>a.a.y-b.a.y||a.a.cx-b.a.cx).forEach((e,i)=>{e.inIndex=i;e.inCount=list.length;}));
  edges.forEach(e=>e.obstacles=Object.entries(boxes).filter(([id,b])=>b&&id!==e.from&&id!==e.to).map(([,b])=>b));
  return edges;
}
function treeEdgeRoute(edge,canvasW,canvasH){
  const outOff=treePortOffset(edge.outIndex,edge.outCount),inOff=treePortOffset(edge.inIndex,edge.inCount),
    sy=edge.a.y+outOff,ey=edge.c.y+inOff*2,sx=edge.a.r+1,forward=edge.c.cx>edge.a.cx+4;
  if(!forward){
    const ex=edge.c.r+4,lane=Math.min(canvasW-10,Math.max(sx,ex)+24+Math.abs(outOff-inOff)*.45);
    return {sx,sy,ex,ey,d:'M'+sx+','+sy+' H'+lane+' V'+ey+' H'+ex};
  }
  const ex=edge.c.l-4,gap=ex-sx,bias=(outOff-inOff)*.65;
  if(gap>170){
    /* 同列节点的跨层依赖各走独立竖槽，避免两条线短暂共线而产生错误汇流感。 */
    const x1=sx+24+outOff*1.2,x2=ex-24-inOff*1.2;
    const obstacles=edge.obstacles||[],clear=y=>!obstacles.some(o=>y>o.nt-6&&y<o.nb+6&&x2>o.l-6&&x1<o.r+6);
    if(Math.abs(ey-sy)<12&&clear(sy))return {sx,sy,ex,ey,d:'M'+sx+','+sy+' H'+ex};
    const candidates=[(sy+ey)/2+bias,Math.min(sy,ey)-46+bias,Math.max(sy,ey)+46+bias];
    obstacles.forEach(o=>candidates.push(o.nt-10,o.nb+10));
    const lanes=[...new Set(candidates.map(y=>Math.round(Math.max(18,Math.min(canvasH-18,y))*10)/10))].sort((a,b)=>(Math.abs(sy-a)+Math.abs(ey-a))-(Math.abs(sy-b)+Math.abs(ey-b)));
    const laneY=lanes.find(clear)??lanes[0];
    return {sx,sy,ex,ey,d:'M'+sx+','+sy+' H'+x1+' V'+laneY+' H'+x2+' V'+ey+' H'+ex};
  }
  let lane=ex-Math.min(46,gap*.48)+bias;
  lane=Math.max(sx+14,Math.min(ex-14,lane));
  return {sx,sy,ex,ey,d:'M'+sx+','+sy+' H'+lane+' V'+ey+' H'+ex};
}
function treeEdgeLayers(svg){
  const make=cls=>{const g=document.createElementNS(TREE_SVG_NS,'g');g.setAttribute('class',cls);svg.appendChild(g);return g;};
  return {base:make('edge-layer edge-base'),state:make('edge-layer edge-state'),focus:make('edge-layer edge-focus'),ports:make('edge-layer edge-ports'),portKeys:new Set()};
}
function appendTreeEdge(layers,edge,cls,canvasW,canvasH){
  const g=treeEdgeRoute(edge,canvasW,canvasH),layer=cls.includes(' hi')?layers.focus:(cls.includes(' on')||cls.includes(' next'))?layers.state:layers.base;
  const rail=document.createElementNS(TREE_SVG_NS,'path');rail.setAttribute('d',g.d);rail.setAttribute('class','tedge-rail'+(cls.includes(' out')?' out':''));layer.appendChild(rail);
  const path=document.createElementNS(TREE_SVG_NS,'path');path.setAttribute('d',g.d);path.setAttribute('class',cls);path.dataset.from=edge.from;path.dataset.to=edge.to;layer.appendChild(path);
  const portClass='tport'+(cls.includes(' next')?' next':cls.includes(' on')?' on':'')+(cls.includes(' hi')?' hi':'')+(cls.includes(' out')?' out':'');
  [[g.ex,g.ey,'target']].forEach(([x,y,kind])=>{const key=Math.round(x*10)+'/'+Math.round(y*10)+'/'+portClass;if(layers.portKeys.has(key))return;layers.portKeys.add(key);const p=document.createElementNS(TREE_SVG_NS,'rect');p.setAttribute('x',x-2.1);p.setAttribute('y',y-2.1);p.setAttribute('width',4.2);p.setAttribute('height',4.2);p.setAttribute('transform','rotate(45 '+x+' '+y+')');p.setAttribute('class',portClass+' '+kind);layers.ports.appendChild(p);});
}
const GENE_TREE={W:1050,H:790,cardW:82,cardH:72,stages:[100,300,500,700,900],pos:{
  g1_core:{x:100,y:355},g2_muscle:{x:300,y:105},g2_neural:{x:300,y:355},g2_adapt:{x:300,y:605},
  g3_predator:{x:500,y:105},g3_reflex:{x:500,y:355},g3_regen:{x:500,y:605},
  g4_breaker:{x:700,y:105},g4_overclock:{x:700,y:355},g4_ecology:{x:700,y:605},
  g5_dominion:{x:900,y:230},g5_chimera:{x:900,y:480}},labels:{核心:{x:24,y:355},强袭:{x:220,y:105},神经:{x:220,y:355},适应:{x:220,y:605},终末:{x:820,y:355}}};
const GENE_COLOR={核心:'#67e8f9',强袭:'#fb7185',神经:'#a78bfa',适应:'#4ade80',终末:'#fbbf24'};
const GENE_ICON={核心:'module',强袭:'combat',神经:'sensor',适应:'medical',终末:'implant'};
const GENE_KIDS={};GENE_NODES.forEach(g=>(g.req||[]).forEach(r=>(GENE_KIDS[r]=GENE_KIDS[r]||[]).push(g.id)));
function geneFocusSet(id){const out=new Set([id]),seen={};(function up(k){(GENE_BY_ID[k].req||[]).forEach(r=>{if(!seen[r]){seen[r]=1;out.add(r);up(r);}});})(id);(GENE_KIDS[id]||[]).forEach(k=>out.add(k));return out;}
function geneStatus(id){const g=GENE_BY_ID[id];if(geneUnlocked(id))return 'max';return (g.req||[]).every(geneUnlocked)&&geneGateReady(g)?'ready':'locked';}
function geneNodeEl(g,focus){const st=geneStatus(g.id),afford=canAfford(g.cost),pre=(g.req||[]).filter(geneUnlocked).length,lock=pre<(g.req||[]).length?uiIcon('lock')+'<small>'+pre+'/'+(g.req||[]).length+'</small>':uiIcon('unknown'),n=el('button','tnode gnode '+st+(st==='ready'?(afford?' can':' poor'):'')+(state.geneSel===g.id?' sel':''));if(focus&&!focus.has(g.id))n.classList.add('out');n.dataset.gid=g.id;n.style.left=GENE_TREE.pos[g.id].x+'px';n.style.top=GENE_TREE.pos[g.id].y+'px';n.style.width=GENE_TREE.cardW+'px';n.style.height=GENE_TREE.cardH+'px';n.style.setProperty('--c',GENE_COLOR[g.branch]);n.innerHTML='<span class="tn-nm">'+g.name+'</span><span class="tn-card"><i class="tn-ic">'+uiIcon(GENE_ICON[g.branch])+'</i><small>0'+g.stage+'</small></span>'+(st==='locked'?'<span class="tn-lk">'+lock+'</span>':st==='max'?'<span class="tn-lk">'+uiIcon('check')+'</span>':!afford?'<span class="tn-dot"></span>':'');n.onclick=()=>{if(state._geneMoved)return;state.geneSel=state.geneSel===g.id?null:g.id;render();};return n;}
function geneTreeEl(s){return document.querySelector(s);}
function geneTreeApply(){const vp=geneTreeEl('.gene-vp'),cv=geneTreeEl('.gene-canvas');if(!vp||!cv)return;const z=state.geneZoom||.78,minX=Math.min(0,vp.clientWidth-cv.offsetWidth*z),minY=Math.min(0,vp.clientHeight-cv.offsetHeight*z);state.genePanX=Math.max(minX,Math.min(0,state.genePanX||0));state.genePanY=Math.max(minY,Math.min(0,state.genePanY||0));cv.style.transform='translate('+state.genePanX+'px,'+state.genePanY+'px) scale('+z+')';const t=geneTreeEl('.gene-zoom-text');if(t)t.textContent=Math.round(z*100)+'%';}
function geneTreeSetZoom(z,ax,ay){const vp=geneTreeEl('.gene-vp');if(!vp)return;const z0=state.geneZoom||.78;z=Math.max(TREE_ZOOM_MIN,Math.min(2.6,z));if(ax==null){ax=vp.clientWidth/2;ay=vp.clientHeight/2;}state.genePanX=ax-(ax-(state.genePanX||0))*(z/z0);state.genePanY=ay-(ay-(state.genePanY||0))*(z/z0);state.geneZoom=z;geneTreeApply();}
function geneTreeFit(){const vp=geneTreeEl('.gene-vp'),cv=geneTreeEl('.gene-canvas');if(!vp||!cv)return;const z=Math.min(1.5,Math.max(TREE_ZOOM_MIN,Math.min(vp.clientWidth/cv.offsetWidth,vp.clientHeight/cv.offsetHeight)));state.geneZoom=z;state.genePanX=Math.min(0,(vp.clientWidth-cv.offsetWidth*z)/2);state.genePanY=Math.min(0,(vp.clientHeight-cv.offsetHeight*z)/2);geneTreeApply();}
function attachGeneTreeGestures(vp){const pts=new Map();let start=null,pinch=null;vp.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===1){start={x:e.clientX,y:e.clientY};state._geneMoved=false;}if(pts.size===2){const a=[...pts.values()],rv=vp.getBoundingClientRect(),mx=(a[0].x+a[1].x)/2-rv.left,my=(a[0].y+a[1].y)/2-rv.top,z=state.geneZoom||.78;pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z0:z,wx:(mx-(state.genePanX||0))/z,wy:(my-(state.genePanY||0))/z,rv};}});vp.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const prev=pts.get(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&pts.size>=2){const a=[...pts.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch.d>10&&d>10){state._geneMoved=true;const z=Math.max(TREE_ZOOM_MIN,Math.min(2.6,pinch.z0*d/pinch.d)),mx=(a[0].x+a[1].x)/2-pinch.rv.left,my=(a[0].y+a[1].y)/2-pinch.rv.top;state.geneZoom=z;state.genePanX=mx-pinch.wx*z;state.genePanY=my-pinch.wy*z;geneTreeApply();}return;}if(pts.size===1){if(start&&Math.abs(e.clientX-start.x)+Math.abs(e.clientY-start.y)>8)state._geneMoved=true;if(state._geneMoved){state.genePanX+=e.clientX-prev.x;state.genePanY+=e.clientY-prev.y;geneTreeApply();}}});const end=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size)setTimeout(()=>{state._geneMoved=false;},0);};vp.addEventListener('pointerup',end);vp.addEventListener('pointercancel',end);vp.addEventListener('pointerleave',end);vp.addEventListener('wheel',e=>{e.preventDefault();const r=vp.getBoundingClientRect();geneTreeSetZoom((state.geneZoom||.78)*(e.deltaY<0?1.12:.9),e.clientX-r.left,e.clientY-r.top);},{passive:false});}
function drawGeneTreeLines(){const cv=geneTreeEl('.gene-canvas');if(!cv)return;const old=cv.querySelector('.gene-tlines');if(old)old.remove();const svg=document.createElementNS(TREE_SVG_NS,'svg');svg.setAttribute('class','tlines gene-tlines');svg.setAttribute('width',GENE_TREE.W);svg.setAttribute('height',GENE_TREE.H);const focus=state.geneSel&&GENE_BY_ID[state.geneSel]?geneFocusSet(state.geneSel):null,layers=treeEdgeLayers(svg),raw=[];GENE_NODES.forEach(g=>(g.req||[]).forEach(r=>raw.push({from:r,to:g.id})));const edges=prepareTreeEdges(raw,id=>treeCardBox(cv,'data-gid',id));edges.forEach(e=>{let cl='tedge gene-edge';if(GENE_BY_ID[e.from].branch!==GENE_BY_ID[e.to].branch)cl+=' cross';if(geneUnlocked(e.from)&&geneUnlocked(e.to))cl+=' on';else if(geneUnlocked(e.from)&&geneStatus(e.to)==='ready')cl+=' next';if(focus&&focus.has(e.from)&&focus.has(e.to))cl+=' hi';else if(focus)cl+=' out';appendTreeEdge(layers,e,cl,GENE_TREE.W,GENE_TREE.H);});cv.insertBefore(svg,cv.firstChild);}
function renderGeneDetail(box){const id=state.geneSel,g=id&&GENE_BY_ID[id],d=el('div','tdet gene-det');if(!g){d.classList.add('hint');d.appendChild(el('div','tdet-hint','拖动画布 · 滚轮或双指缩放 · 选择节点查看基因质变'));box.appendChild(d);return;}const st=geneStatus(id),head=el('div','tdet-top');head.innerHTML='<span class="tdet-ic gene-det-icon" style="--c:'+GENE_COLOR[g.branch]+'">'+uiIcon(GENE_ICON[g.branch])+'</span><span class="tdet-h"><b>'+g.name+'</b><span>'+g.branch+'分支 · 第 '+g.stage+' 阶 · '+(geneUnlocked(id)?'已激活':'未激活')+'</span></span>';const x=el('button','tdet-x ui-icon-button',uiIcon('close'));x.setAttribute('aria-label','关闭节点详情');x.onclick=()=>{state.geneSel=null;render();};head.appendChild(x);d.appendChild(head);d.appendChild(el('div','gene-det-mutation','质变规则 · '+g.mutation));d.appendChild(el('div','tdet-eff',g.desc+' · '+bonusText(g.bonus)));if((g.req||[]).length)d.appendChild(el('div','tdet-line','前置 '+g.req.map(r=>'<span class="'+(geneUnlocked(r)?'ok':'no')+'">'+GENE_BY_ID[r].name+(geneUnlocked(r)?'✓':'✗')+'</span>').join(' ')));const checks=geneGateChecks(g);if(checks.length)d.appendChild(el('div','tdet-line gene-gates','表达条件 '+checks.map(c=>'<span class="'+(c.ok?'ok':'no')+'">'+c.text+(c.ok?'✓':'✗')+'</span>').join(' ')));if(st==='max')d.appendChild(el('div','tdet-line','✓ 基因表达稳定，效果已永久生效'));else{d.appendChild(el('div','tdet-line','材料 '+costChips(g.cost,1)));const pre=(g.req||[]).every(geneUnlocked),gate=geneGateReady(g),can=pre&&gate&&canAfford(g.cost),why=!pre?'前置未完成':!gate?'表达条件不足':!canAfford(g.cost)?'材料不足':'';const b=el('button','primary','执行基因改写'+(why?'（'+why+'）':''));b.disabled=!can;b.onclick=()=>unlockGeneNode(id);d.appendChild(b);}box.appendChild(d);}
function renderGenePanel(box){const vp=el('div','treevp gene-vp'),back=el('button','tx-x gene-back ui-icon-button',uiIcon('chevron-left'));back.setAttribute('aria-label','返回角色');back.onclick=()=>{state.charView='overview';state.geneSel=null;render();};vp.appendChild(back);const tb=el('div','tzoom gene-tools'),plus=el('button','ui-icon-button',uiIcon('plus')),txt=el('span','gene-zoom-text'),minus=el('button','ui-icon-button',uiIcon('minus')),fit=el('button','ui-icon-button',uiIcon('fit'));plus.setAttribute('aria-label','放大基因树');minus.setAttribute('aria-label','缩小基因树');fit.setAttribute('aria-label','显示完整基因树');plus.onclick=()=>geneTreeSetZoom((state.geneZoom||.78)*1.22);minus.onclick=()=>geneTreeSetZoom((state.geneZoom||.78)*.82);fit.onclick=geneTreeFit;tb.append(plus,txt,minus,fit);vp.appendChild(tb);const focus=state.geneSel&&GENE_BY_ID[state.geneSel]?geneFocusSet(state.geneSel):null,cv=el('div','treecanvas gene-canvas'+(focus?' has-focus':''));cv.style.width=GENE_TREE.W+'px';cv.style.height=GENE_TREE.H+'px';GENE_TREE.stages.forEach((x,i)=>{const p=el('div','techphase gene-phase','<span>0'+(i+1)+'</span> STAGE');p.style.left=x+'px';cv.appendChild(p);});Object.entries(GENE_TREE.labels).forEach(([branch,p])=>{const lab=el('div','techcluster-title gene-cluster',uiIcon(GENE_ICON[branch])+'<span>'+branch+'序列</span>');lab.style.left=p.x+'px';lab.style.top=p.y+'px';lab.style.setProperty('--c',GENE_COLOR[branch]);cv.appendChild(lab);});GENE_NODES.forEach(g=>cv.appendChild(geneNodeEl(g,focus)));vp.appendChild(cv);box.appendChild(vp);renderGeneDetail(box);if(state.geneZoom==null){state.geneZoom=.78;state.genePanX=0;state.genePanY=0;}requestAnimationFrame(()=>{drawGeneTreeLines();geneTreeApply();attachGeneTreeGestures(vp);});}
function renderCareerPanel(box){
  const back=el('button','sub-back',uiIcon('chevron-left')+'<span>返回角色</span>');back.onclick=()=>{state.charView='overview';renderPanelTop();};box.appendChild(back);title(box,'<span class="section-code">CAREER MATRIX</span><b>职业路径</b><small>资格来自 NPC、任务与世界事件</small>');
  ['main','life'].forEach(kind=>{const r=careerRecord(kind);title(box,'<b>'+(kind==='main'?'主职业 · 战斗侧':'副职业 · 生活侧')+'</b><small>'+(kind==='main'?'仅能保留一个，重构需珍贵核心':'强化采集、制作与营地生产')+'</small>');if(r){const j=JOBS[r.id];box.appendChild(el('div','career-current','<span>'+j.name+'</span><b>Lv'+r.level+'</b><small>职业经验 '+r.xp+' / '+careerXpNeed(r.level)+'</small><em>'+j.desc+'</em>'));}
    const list=el('div','career-list');Object.entries(JOBS).filter(([,j])=>j.kind===kind).forEach(([id,j])=>{const qualified=!!state.flags[j.qualification],current=currentCareer(id),can=checkJobReq(id),changing=kind==='main'&&r&&!current,card=el('section','career-card '+(current?'current':qualified?'qualified':'locked'));card.innerHTML='<div class="career-head"><span>'+(j.special?'SPECIAL':'0'+(Object.keys(JOBS).indexOf(id)+1))+'</span><b>'+j.name+'</b><em>'+(current?'当前职业':qualified?'资格已取得':'资格未取得')+'</em></div><p>'+j.desc+'</p><small>引路人 · '+careerGuideLabel(j.npc)+'</small><small>解锁 · '+j.reqText+'</small><div class="career-growth">初始 '+bonusText(j.bonus)+'<br>每级 '+bonusText(j.growth)+'</div><div class="career-skills">'+j.skills.map(k=>(SKILLS[k].type==='passive'?'AUTO ':'ACTIVE ')+SKILLS[k].name+' · Lv'+SKILLS[k].careerLevel).join('<br>')+'</div>';
      if(!current){const b=el('button',can&&(!r||changing&&has('reclassCore'))?'primary':'',changing?(has('reclassCore')?'消耗重构核心转职':'需要职业重构核心'):(can?'确认转职':qualified&&j.ritual?'前往仪式地点并满足条件':'尚未获得资格'));b.disabled=!can||(!!r&&!(changing&&has('reclassCore')));b.onclick=()=>chooseJob(id);card.appendChild(b);}list.appendChild(card);});box.appendChild(list);});
}

/* ---------- 背包:纸娃娃(小人 + 引线指部位) + 物品栏 ---------- */
const DOLL_W=340, DOLL_H=268;
// cx/cy=槽块中心, ax/ay=小人身上锚点(同一侧按锚点 y 升序排,保证引线不交叉)
const DOLL_L={
  head:{cx:42,cy:27,ax:151,ay:42}, body:{cx:42,cy:80,ax:145,ay:85}, hands:{cx:42,cy:133,ax:133,ay:132}, legs:{cx:42,cy:186,ax:151,ay:171}, feet:{cx:42,cy:239,ax:154,ay:224},
  back:{cx:298,cy:27,ax:194,ay:74}, implant:{cx:298,cy:80,ax:184,ay:94}, module:{cx:298,cy:133,ax:184,ay:116}, offhand:{cx:298,cy:186,ax:211,ay:135}, weapon:{cx:298,cy:239,ax:216,ay:149}
};
const DOLL_ORDER=['head','body','hands','legs','feet','back','implant','module','offhand','weapon'];
const SLOT_ICON={head:'helmet',body:'chest',hands:'gloves',legs:'legs',feet:'boots',back:'backpack',implant:'implant',module:'module',offhand:'offhand',weapon:'weapon'};
const ITEM_ICON={scrap:'salvage',wood:'cargo',stone:'cargo',coal:'energy',copperScrap:'salvage',copperIngot:'construct',cloth:'armor',ingot:'construct',ecomp:'module',ration:'medical',riverFish:'medical',steel:'construct',crystal:'energy',biocore:'medical',core:'energy',signalCell:'energy',ammo:'weapon',weaponCell:'energy',silica:'cargo',titaniumOre:'salvage',deuterium:'energy',phaseCrystal:'energy',wafer:'module',carbonComposite:'construct',titanium:'construct',superconductor:'energy',fusionCell:'energy',bioMatrix:'medical',nanites:'module',quantumCore:'module',programmableMatter:'construct',echoMedium:'unknown',helium3:'energy',iridiumOre:'salvage',xenoBiomass:'medical',voidCrystal:'unknown',starAlloy:'construct',livingComposite:'medical',stellarFuel:'energy',warpCell:'energy'};
const EQUIP_ICON={
  crowbar:'salvage',knife:'knife',blade:'blade',eblade:'energy-blade',pistol:'pistol',rifle:'rifle',sever:'combat',
  eshieldUnit:'offhand',helmet:'helmet',scope:'visor',vest:'chest',radSuit:'radiation',bioSuit:'biohazard',power:'power-armor',warden:'core',
  boots:'boots',magboots:'energy',miningHarness:'exorig',critCore:'sensor',lsChip:'lifesteal',dodgeMod:'phase',penMod:'pierce',neuralFilter:'implant',capacitorPack:'backpack',
  plasmaRifle:'energy',gravLance:'lance',swarmRifle:'scan',nanoSuit:'medical',gravRig:'construct',phaseShield:'offhand',starShell:'armor',quantumVisor:'visor',neuralMesh:'implant',echoMemory:'module',timeLagModule:'refresh',vacuumCarbine:'rifle',xenoFilter:'biohazard',exoShell:'exorig'
};
const SPECIAL_ITEM_ICON={
  potion:'energy',medkit:'medical',nanoMedkit:'medical',serum:'biohazard',emp:'sensor',pierceBook:'document',heavyBook:'document',
  accessCard:'document',plasmaCutter:'energy-blade',maintenanceKey:'lock',civilPass:'document',depthLamp:'sensor',sporeSeal:'biohazard',signalCipher:'core',reclassCore:'core',arkBand:'bracelet',builderGun:'builder',fieldMap:'map',shipFrame:'construct',fusionDrive:'energy',inertialHull:'armor',arkHabitat:'medical',navComputer:'sensor',orbitalLance:'lance',gateKey:'lock',
  beacon:'locate',starchart:'map',echoHeart:'lifesteal'
};
function itemIconName(id){const it=ITEMS[id];if(!it)return 'cargo';if(it.type==='equip')return EQUIP_ICON[id]||SLOT_ICON[it.slot]||'armor';return SPECIAL_ITEM_ICON[id]||ITEM_ICON[id]||(it.type==='use'?'medical':it.type==='book'?'document':it.type==='key'?'lock':it.type==='trophy'?'mission':'cargo');}
function itemArtTrace(id){let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}const a=4+(h&3),b=15+((h>>>3)&3),c=4+((h>>>6)&5),x=5+((h>>>10)&13),y=5+((h>>>14)&13);return '<path class="item-art-trace" d="M2 '+a+'h'+c+'M'+(22-c)+' '+b+'h'+c+'"/><circle class="item-art-node" cx="'+x+'" cy="'+y+'" r=".8"/>';}
function itemUiIcon(id){return '<img class="item-art" data-item="'+id+'" src="assets/item-art-v1/'+id+'.webp?v=1" alt="" draggable="false">';}
function dollArt(){
  const lead=s=>{ const p=DOLL_L[s], left=p.cx<DOLL_W/2, w=eqOf(s)?' on':'',
      x1=left?p.cx+25:p.cx-25, x2=left?p.cx+46:p.cx-46;
    return '<polyline class="ld'+w+'" points="'+x1+','+p.cy+' '+x2+','+p.cy+' '+p.ax+','+p.ay+'"/>'
      +'<circle class="dt'+w+'" cx="'+p.ax+'" cy="'+p.ay+'" r="2.8"/>'; };
  return '<img class="doll-frame" src="assets/loadout-frame-v1.png?v=2" alt="" draggable="false">'
    +'<svg class="dollart" viewBox="0 0 '+DOLL_W+' '+DOLL_H+'" preserveAspectRatio="none">'
    +'<g class="scanner"><ellipse class="scan-ring" cx="170" cy="132" rx="61" ry="111"/><ellipse class="scan-ring inner" cx="170" cy="132" rx="43" ry="91"/><path class="scan-axis" d="M97 132H243M170 14V251"/></g>'
    + DOLL_ORDER.map(lead).join('') +'</svg>';
}
function renderBagPanel(box){
  const equipped=SLOTS.filter(([sl])=>eqOf(sl)).length;
  const loadout=el('section','loadout-console');
  loadout.innerHTML='<header class="loadout-head"><span><small>LOADOUT MATRIX</small><b>装备接口</b></span><em>'+equipped+' / '+SLOTS.length+' ONLINE</em></header>';
  const doll=el('div','doll'); doll.innerHTML=dollArt();
  SLOTS.forEach(([sl,label])=>{ const p=DOLL_L[sl]; if(!p)return; const it=eqOf(sl);
    const c=el('button','slotchip'+(it?' filled':'')+(state.bagSel===sl?' sel':''));
    c.style.left=(p.cx/DOLL_W*100)+'%'; c.style.top=(p.cy/DOLL_H*100)+'%';
    c.innerHTML='<span class="sc-box">'+uiIcon(SLOT_ICON[sl]||'slot-empty')+'</span><span class="sc-nm">'+label+(it?' ·已装':' ·空')+'</span>';
    c.onclick=()=>{ state.bagSel=(state.bagSel===sl?null:sl); render(); };
    doll.appendChild(c);
  });
  loadout.appendChild(doll);
  const sel=state.bagSel, worn=sel?eqOf(sel):null;
  if(worn){ const it=worn, s=sel, lab=SLOTS.find(x=>x[0]===s)[1];
    const card=el('div','slotinfo');
    card.innerHTML='<span class="si-ic">'+itemUiIcon(P().equip[s])+'</span><span class="si-b"><b>'+it.name+'</b><span class="si-slot">'+lab+'</span>'
      +'<span class="si-st">'+statTags(it).split(' ').join(' · ')+'</span></span>';
    const x=el('button','si-x','卸下'); x.onclick=()=>{ state.bagSel=null; unequip(s); }; card.appendChild(x);
    loadout.appendChild(card);
  } else loadout.appendChild(el('div','dollhint', sel ? '该部位空着 · 下方亮起的物品可穿到'+SLOTS.find(x=>x[0]===sel)[1]
    : '点小人旁的部位槽看装备 · 下方点物品即可穿戴/使用'));
  box.appendChild(loadout);
  const inventory=el('section','inventory-vault');
  const itemKinds=Object.keys(state.inv).filter(id=>state.inv[id]>0 && ITEMS[id] && ITEMS[id].type!=='mat').length;
  inventory.innerHTML='<header class="vault-head"><span><small>ITEM STORAGE</small><b>物品仓</b></span><em>'+itemKinds+' TYPE'+(itemKinds===1?'':'S')+'</em></header>';
  const inventoryScroll=el('div','inventory-scroll');
  const mats=MATS.filter(m=>has(m));
  if(mats.length){ const mg=el('div','mats'); mats.forEach(m=>mg.appendChild(el('span','mchip',itemUiIcon(m)+'<span>'+ITEMS[m].name+' '+state.inv[m]+'</span>'))); inventoryScroll.appendChild(mg); }
  const items=Object.keys(state.inv).filter(id=>state.inv[id]>0 && ITEMS[id] && ITEMS[id].type!=='mat');
  if(!items.length)inventoryScroll.appendChild(el('div','empty','没有可装备/使用的物品'));
  else { const g=el('div','itemgrid');
    items.forEach(id=>{ const it=ITEMS[id]; const b=el('button','item'+(sel&&it.slot===sel?' fit':''));
      b.innerHTML='<span class="iicon">'+itemUiIcon(id)+'</span><span class="iname">'+it.name+'</span>';b.setAttribute('aria-label',it.name+'，数量 '+state.inv[id]+'，查看详情');b.onclick=()=>openSiteSheet('item',id);
      g.appendChild(b);
    });inventoryScroll.appendChild(g);
  }
  if(state.meta.endingItems.length){ title(inventoryScroll,'结局道具'); const tg=el('div','mats'); state.meta.endingItems.forEach(id=>tg.appendChild(el('span','mchip',itemUiIcon(id)+'<span>'+ITEMS[id].name+'</span>'))); inventoryScroll.appendChild(tg); }
  inventory.appendChild(inventoryScroll);box.appendChild(inventory);
}

/* ---------- 科技树：七领域 · 十二文明阶段 · 视口可捏合缩放/双向拖动 ---------- */
const BR_ICON={生存医疗:'medical',武器系统:'combat',工程制造:'construct',能源场:'energy',动力防护:'armor',探测自动化:'sensor',异常回响:'tech'};
function statName(k){ return {atk:'攻击',def:'防御',hp:'生命',spd:'速度',crit:'暴击率',critDmg:'暴击伤害',ls:'吸血',dodge:'闪避',hit:'命中',pen:'穿透',shield:'护盾',move:'移距',rangeAdd:'攻距',stMax:'体力上限',collect:'材料采集',droneYield:'无人机回收',travelPct:'路线体力减耗'}[k]||k; }
function techStatus(tid){ if(techKnown(tid)) return 'max'; return techReady(tid)?'ready':'locked'; }
function techEffect(t,tid){
  const parts=[];
  if(t.build&&t.build.length) parts.push('建筑 '+t.build.map(facilityName).join('、'));
  if(t.smelt&&t.smelt.length) parts.push('加工 '+t.smelt.map(smeltName).join('、'));
  const recipes=(t.un||[]).map(unItemName), defenses=(t.def||[]).map(d=>DEF_TYPES[d].name);
  if(recipes.length) parts.push('配方 '+recipes.join('、'));
  if(defenses.length) parts.push('工事 '+defenses.join('、'));
  const upgrades=[];CAMP_BUILDINGS.forEach(b=>(b.upgrades||[]).filter(u=>u.tech===tid).forEach(u=>upgrades.push(b.name+'·'+u.name)));
  if(upgrades.length)parts.push('设施升级 '+upgrades.join('、'));
  if(t.bonus) parts.push('系统增益 '+Object.entries(t.bonus).map(([k,v])=>statName(k)+' +'+v+(['collect','travelPct'].includes(k)?'%':'')).join('、'));
  return parts.length?'解锁：'+parts.join(' · '):'解锁后续研究';
}
function techAffordable(tid){ return Object.entries(techUpCost(tid)).every(([k,v])=>(state.inv[k]||0)>=v); }
function missingReqs(tid){ return (TECHS[tid].req||[]).filter(r=>!techKnown(r)); }
function costChips(c,full){ return Object.entries(c).map(([k,v])=>{ const have=state.inv[k]||0;
  return '<span class="'+(have>=v?'ok':'no')+'">'+ITEMS[k].icon+(full?ITEMS[k].name+' <b>'+have+'/'+v+'</b>':'<b>'+v+'</b>')+'</span>'; }).join(''); }
/* 大型文明科技图：阶段是宽面板而不是一行；同阶段前置会在面板内继续向右穿插。 */
const LAY={ cardW:92, cardH:72 };
const TECH_ERA_NAMES=['残骸求生','恢复工业','舰载工程','高能材料','分子时代','量子时代','场文明','方舟重构','星舰黎明','月面工业','异星生态','星门文明'];
const _layC={};
function treeLayout(){ if(_layC.pos) return _layC;
  const pos={},eraCache={},eraVisiting=new Set(),rankCache={},visiting=new Set();
  function eraOf(id){
    if(eraCache[id])return eraCache[id];
    const t=TECHS[id];if(!t)return 1;
    if(eraVisiting.has(id))return Math.max(1,Math.min(12,t.era||techTier(id)));
    eraVisiting.add(id);
    const own=Math.max(1,Math.min(12,t.era||techTier(id)));
    const prerequisiteEra=(t.req||[]).filter(req=>TECHS[req]).reduce((highest,req)=>Math.max(highest,eraOf(req)),1);
    eraVisiting.delete(id);
    return eraCache[id]=Math.max(own,prerequisiteEra);
  }
  function eraRank(id){if(rankCache[id])return rankCache[id];if(visiting.has(id))return 1;visiting.add(id);const era=eraOf(id),same=(TECHS[id].req||[]).filter(req=>TECHS[req]&&eraOf(req)===era);const rank=same.length?1+Math.max(...same.map(eraRank)):1;visiting.delete(id);return rankCache[id]=rank;}
  const maxRank=Array(13).fill(1);Object.keys(TECHS).forEach(id=>maxRank[eraOf(id)]=Math.max(maxRank[eraOf(id)],eraRank(id)));
  const eraStart=Array(13).fill(0),x0=120,xStep=154,eraGap=96,y0=120,band=230;eraStart[1]=x0;for(let era=2;era<=12;era++)eraStart[era]=eraStart[era-1]+maxRank[era-1]*xStep+eraGap;
  const groups={};Object.keys(TECHS).forEach(id=>{const t=TECHS[id],key=t.b+'|'+eraOf(id)+'|'+eraRank(id);(groups[key]=groups[key]||[]).push(id);});
  BRANCHES.forEach((branch,bi)=>{for(let era=1;era<=12;era++)for(let rank=1;rank<=maxRank[era];rank++){const ids=(groups[branch+'|'+era+'|'+rank]||[]).sort();ids.forEach((id,i)=>{const offset=(i-(ids.length-1)/2)*82,jitter=((era+rank+bi)%3-1)*8;pos[id]={x:eraStart[era]+(rank-1)*xStep,y:Math.round(y0+bi*band+offset+jitter)};});}});
  _layC.pos=pos;
  _layC.labels={};BRANCHES.forEach((branch,bi)=>_layC.labels[branch]={x:18,y:y0+bi*band+22});
  _layC.W=eraStart[12]+maxRank[12]*xStep+LAY.cardW+100;_layC.H=y0+(BRANCHES.length-1)*band+150;
  _layC.stages=TECH_ERA_NAMES.map((_,i)=>eraStart[i+1]-36);
  _layC.stageNames=TECH_ERA_NAMES;_layC.maxTier=Math.max(...maxRank);
  return _layC; }
const BR_COLOR={生存医疗:'#34d399',武器系统:'#fb7185',工程制造:'#fbbf24',能源场:'#22d3ee',动力防护:'#60a5fa',探测自动化:'#a78bfa',异常回响:'#e879f9'};
/* 选中节点后:整条前置链 + 直接后继保持在亮处 */
const _kids={};
for(const tid in TECHS){ (TECHS[tid].req||[]).forEach(r=>{ if(TECHS[r]) (_kids[r]=_kids[r]||[]).push(tid); }); }
function focusSet(tid){ const out=new Set([tid]), seen={};
  (function up(t){ (TECHS[t].req||[]).forEach(r=>{ if(TECHS[r]&&!seen[r]){ seen[r]=1; out.add(r); up(r); } }); })(tid);
  (_kids[tid]||[]).forEach(c=>out.add(c));
  return out; }
const STAT_ICON={atk:'combat',def:'armor',hp:'vital',spd:'expedition',crit:'locate',critDmg:'combat',ls:'lifesteal',dodge:'expedition',hit:'locate',pen:'pierce',shield:'armor',move:'expedition',rangeAdd:'locate'};
const FACILITY_TECH_ICON={rest:'medical',smelt:'construct',craft:'construct',drone:'sensor',storage:'cargo',recycle:'refresh',mess:'medical',garden:'medical',defense:'armor',train:'combat',beacon:'sensor'};
function techIcon(t){
  if(t.build&&t.build[0]){ const b=CAMP_BUILDINGS.find(x=>x.id===t.build[0]); if(b) return uiIcon(FACILITY_TECH_ICON[b.kind]||'construct'); }
  if(t.smelt&&t.smelt.length) return uiIcon('construct');
  if(t.un&&t.un[0]){ const r=RECIPES[t.un[0]],it=r&&ITEMS[r.out];if(it){if(it.slot)return uiIcon(SLOT_ICON[it.slot]||'module');if(it.type==='book')return uiIcon('document');if(it.type==='use')return uiIcon('medical');} }
  if(t.def&&t.def[0]&&DEF_TYPES[t.def[0]]) return uiIcon('armor');
  if(t.bonus){ const ic=STAT_ICON[Object.keys(t.bonus)[0]]; if(ic) return uiIcon(ic); }
  return uiIcon(BR_ICON[t.b]||'tech');
}
function techLitSet(){ return (state.techSel&&TECHS[state.techSel])? focusSet(state.techSel) : null; }
function techBlockBadge(tid){ const t=TECHS[tid], req=t.req||[], met=req.filter(techKnown).length;
  if(met<req.length) return uiIcon('lock')+'<small>'+met+'/'+req.length+'</small>';
  if(!recordKnown(t.rec)) return uiIcon('document');
  if(!techFacilitiesReady(tid)) return uiIcon('construct');
  return '';
}
function techNodeEl(tid,p,focus){
  const t=TECHS[tid], st=techStatus(tid), lv=techLevel(tid), max=techMax(tid);
  let cls='tnode '+st;
  if(st==='ready'&&techAffordable(tid)) cls+=' can';
  if(st==='ready'&&!techAffordable(tid)) cls+=' poor';
  if(st==='done'&&max>1) cls+=' up';
  if(state.techSel===tid) cls+=' sel';
  const n=el('button',cls);
  if(focus&&!focus.has(tid)) n.classList.add('out');
  n.dataset.tid=tid; n.style.left=p.x+'px'; n.style.top=p.y+'px';
  n.style.width=LAY.cardW+'px'; n.style.height=LAY.cardH+'px';
  n.style.setProperty('--c',BR_COLOR[t.b]||'var(--accent)');
  n.innerHTML='<span class="tn-nm">'+t.n+'</span><span class="tn-card"><i class="tn-ic">'+techIcon(t)+'</i></span>'
    +(max>1&&lv?'<span class="tn-lv">'+lv+'/'+max+'</span>':'')
    +(st==='locked'?'<span class="tn-lk">'+techBlockBadge(tid)+'</span>':(st==='max'?'<span class="tn-lk">'+uiIcon('check')+'</span>':(!techAffordable(tid)?'<span class="tn-dot"></span>':'')));
  n.onclick=()=>{ if(state._moved) return; state.techSel = state.techSel===tid?null:tid; state.techJump=0; render(); };
  return n;
}
function treeEl(s){ return document.querySelector(s); }
function treeApply(){
  const vp=treeEl('.treevp'), cv=treeEl('.treecanvas'); if(!vp||!cv) return;
  const z=state.techZoom, cw=cv.offsetWidth, ch=cv.offsetHeight;
  const minX=Math.min(0, vp.clientWidth-cw*z), minY=Math.min(0, vp.clientHeight-ch*z);
  state.techPanX=Math.max(minX,Math.min(0,state.techPanX||0));
  state.techPanY=Math.max(minY,Math.min(0,state.techPanY||0));
  cv.style.transform='translate('+state.techPanX+'px,'+state.techPanY+'px) scale('+z+')';
  const t=treeEl('.ztxt'); if(t) t.textContent=Math.round(z*100)+'%';
}
function treeSetZoom(z,ax,ay){
  const vp=treeEl('.treevp'); if(!vp) return;
  const z0=state.techZoom||1; z=Math.max(TREE_ZOOM_MIN,Math.min(2.6,z));
  if(z===z0) return;
  if(ax==null){ ax=vp.clientWidth/2; ay=vp.clientHeight/2; }
  state.techPanX=ax-(ax-(state.techPanX||0))*(z/z0);
  state.techPanY=ay-(ay-(state.techPanY||0))*(z/z0);
  state.techZoom=z; treeApply();
}
function treeFit(){
  const vp=treeEl('.treevp'), cv=treeEl('.treecanvas'); if(!vp||!cv) return;
  const cw=cv.offsetWidth, ch=cv.offsetHeight;
  const z=Math.min(1.6, Math.max(TREE_ZOOM_MIN, Math.min(vp.clientWidth/cw, vp.clientHeight/ch)));
  state.techZoom=z; state.techPanX=Math.min(0,(vp.clientWidth-cw*z)/2); state.techPanY=Math.min(0,(vp.clientHeight-ch*z)/2); treeApply();
}
function treeReveal(tid){
  const vp=treeEl('.treevp'), cv=treeEl('.treecanvas'); if(!vp||!cv) return;
  const n=cv.querySelector('[data-tid="'+tid+'"]'); if(!n) return;
  const rn=n.getBoundingClientRect(), rv=vp.getBoundingClientRect(), pad=10;
  let dx=0,dy=0;
  if(rn.left<rv.left+pad) dx=(rv.left+pad)-rn.left; else if(rn.right>rv.right-pad) dx=(rv.right-pad)-rn.right;
  if(rn.top<rv.top+pad) dy=(rv.top+pad)-rn.top; else if(rn.bottom>rv.bottom-pad) dy=(rv.bottom-pad)-rn.bottom;
  state.techPanX+=dx; state.techPanY+=dy; treeApply();
}
function attachTreeGestures(vp,cv){
  const pts=new Map(); let start=null, pinch=null;
  vp.addEventListener('pointerdown',e=>{
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){ start={x:e.clientX,y:e.clientY}; state._moved=false; }
    if(pts.size===2){ const a=[...pts.values()]; const rv=vp.getBoundingClientRect();
      const mx=(a[0].x+a[1].x)/2-rv.left, my=(a[0].y+a[1].y)/2-rv.top, z=state.techZoom||1;
      pinch={ d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y), z0:z, panX:state.techPanX, panY:state.techPanY,
        wx:(mx-state.techPanX)/z, wy:(my-state.techPanY)/z, rv }; }
  });
  vp.addEventListener('pointermove',e=>{
    if(!pts.has(e.pointerId)) return;
    const prev=pts.get(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pts.size>=2){ const a=[...pts.values()], d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      if(pinch.d>10&&d>10){ state._moved=true;
        const z=Math.max(TREE_ZOOM_MIN,Math.min(2.6,pinch.z0*(d/pinch.d)));
        const mx=(a[0].x+a[1].x)/2-pinch.rv.left, my=(a[0].y+a[1].y)/2-pinch.rv.top;
        state.techZoom=z; state.techPanX=mx-pinch.wx*z; state.techPanY=my-pinch.wy*z; treeApply(); }
      return; }
    if(pts.size===1){ if(start&&Math.abs(e.clientX-start.x)+Math.abs(e.clientY-start.y)>8) state._moved=true;
      if(state._moved){ state.techPanX+=e.clientX-prev.x; state.techPanY+=e.clientY-prev.y; treeApply(); } }
  });
  const end=e=>{ pts.delete(e.pointerId); if(pts.size<2) pinch=null; if(!pts.size){ setTimeout(()=>{ state._moved=false; },0); } };
  vp.addEventListener('pointerup',end); vp.addEventListener('pointercancel',end); vp.addEventListener('pointerleave',end);
  vp.addEventListener('wheel',e=>{ e.preventDefault(); const rv=vp.getBoundingClientRect();
    treeSetZoom(state.techZoom*(e.deltaY<0?1.12:0.9), e.clientX-rv.left, e.clientY-rv.top); },{passive:false});
}
function drawTechLines(){
  const cv=treeEl('.treecanvas'); if(!cv) return;
  const old=cv.querySelector('.tlines'); if(old) old.remove();
  const L=treeLayout(), ch=cv.offsetHeight;
  if(!ch) return;
  const svg=document.createElementNS(TREE_SVG_NS,'svg');
  svg.setAttribute('class','tlines'); svg.setAttribute('width',cv.offsetWidth); svg.setAttribute('height',ch);
  const F=techLitSet(),layers=treeEdgeLayers(svg),raw=[];
  for(const tid in TECHS)(TECHS[tid].req||[]).forEach(rid=>raw.push({from:rid,to:tid}));
  const edges=prepareTreeEdges(raw,id=>treeCardBox(cv,'data-tid',id));
  edges.forEach(e=>{let cl='tedge';if(TECHS[e.from].b!==TECHS[e.to].b)cl+=' cross';if(techKnown(e.from)&&techKnown(e.to))cl+=' on';else if(techKnown(e.from)&&techStatus(e.to)==='ready')cl+=' next';if(F&&F.has(e.from)&&F.has(e.to))cl+=' hi';else if(F)cl+=' out';appendTreeEdge(layers,e,cl,L.W,L.H);});
  cv.insertBefore(svg,cv.firstChild);
}
function renderTechPanel(box){
  const vp=el('div','treevp');
  const x=el('button','tx-x ui-icon-button',uiIcon('close')); x.setAttribute('aria-label','关闭科技树'); x.onclick=()=>{ state.tab='act'; state.techSel=null; render(); }; vp.appendChild(x);
  const tb=el('div','tzoom');
  [['plus','放大科技树',()=>treeSetZoom(state.techZoom*1.22)],['minus','缩小科技树',()=>treeSetZoom(state.techZoom*0.82)],['fit','显示完整科技树',treeFit]].forEach(a=>{
    const b=el('button','ui-icon-button',uiIcon(a[0])); b.setAttribute('aria-label',a[1]); b.onclick=a[2]; tb.appendChild(b); });
  vp.appendChild(tb);
  const F=techLitSet();
  const L=treeLayout();
  const cv=el('div','treecanvas'+(F?' has-focus':''));
  cv.style.width=L.W+'px'; cv.style.height=L.H+'px';
  L.stages.forEach((sx,i)=>{ const p=el('div','techphase','<span>'+String(i+1).padStart(2,'0')+'</span> '+L.stageNames[i]); p.style.left=sx+'px'; cv.appendChild(p); });
  BRANCHES.forEach(br=>{ const p=L.labels[br], lab=el('div','techcluster-title',uiIcon(BR_ICON[br])+'<span>'+br+'</span>');
    lab.style.left=p.x+'px'; lab.style.top=p.y+'px'; lab.style.setProperty('--c',BR_COLOR[br]); cv.appendChild(lab); });
  Object.keys(L.pos).forEach(tid=>cv.appendChild(techNodeEl(tid,L.pos[tid],F)));
  vp.appendChild(cv); box.appendChild(vp);
  renderTechDetail(box);
  if(state.techZoom==null){ state.techZoom=.22; state.techPanX=0; state.techPanY=0; }
  requestAnimationFrame(()=>{ drawTechLines(); treeApply();
    attachTreeGestures(vp,cv); if(state._reveal){ treeReveal(state._reveal); state._reveal=null; } });
}
function renderTechDetail(box){
  const d=el('div','tdet'), tid=state.techSel;
  if(!tid){ d.classList.add('hint'); d.appendChild(el('div','tdet-hint','所有科技始终可见 · 投入材料研究 · 解锁建筑、加工与装备配方')); box.appendChild(d); return; }
  const t=TECHS[tid], st=techStatus(tid);
  const head=el('div','tdet-top');
  head.innerHTML='<span class="tdet-ic">'+techIcon(t)+'</span><span class="tdet-h"><b>'+t.n+'</b><span>'+t.b+' · '+
    (t.era?'第 '+t.era+' 阶 · ':'')+(techKnown(tid)?'已研究':'未研究')+'</span></span>';
  const x=el('button','tdet-x ui-icon-button',uiIcon('close')); x.setAttribute('aria-label','关闭科技详情'); x.onclick=()=>{ state.techSel=null; render(); }; head.appendChild(x);
  d.appendChild(head);
  if(t.desc)d.appendChild(el('div','tdet-story',t.desc));
  d.appendChild(el('div','tdet-eff',techEffect(t,tid)));
  const reqs=t.req||[];
  if(reqs.length) d.appendChild(el('div','tdet-line','前置 '+reqs.map(r=>{ const rt=TECHS[r];
    return '<span class="'+(techKnown(r)?'ok':'no')+'">'+(rt&&rt.b!==t.b?rt.b+'·':'')+TECHS[r].n+(techKnown(r)?'✓':'✗')+'</span>'; }).join(' ')));
  if(t.rec){ const rows=recordIds(t.rec).map(id=>{const rec=TECH_RECORDS[id],known=recordKnown(id);return '<span class="'+(known?'ok':'no')+'">'+rec.name+(known?'✓':'（去'+LOCATIONS[rec.at].name+'寻找）')+'</span>';});
    d.appendChild(el('div','tdet-line','探索资料 '+rows.join(' '))); }
  const facilities=techFacilityIds(t);
  if(facilities.length)d.appendChild(el('div','tdet-line','研究设施 '+facilities.map(id=>'<span class="'+(facilityOnline(id)?'ok':'no')+'">'+facilityName(id)+(facilityOnline(id)?'✓':'（需建成且在线）')+'</span>').join(' ')));
  const sources=Object.keys(t.cost||{}).filter(k=>MATERIAL_SOURCES[k]);
  if(sources.length)d.appendChild(el('div','tdet-line tech-sources','材料来源 '+sources.map(k=>'<span>'+ITEMS[k].icon+ITEMS[k].name+'：'+MATERIAL_SOURCES[k]+'</span>').join(' ')));
  if(st==='max') d.appendChild(el('div','tdet-line','✓ 研究完成，效果已永久保留'));
  else{
    d.appendChild(el('div','tdet-line','材料 '+costChips(techUpCost(tid),1)));
    const can=techReady(tid)&&techAffordable(tid);
    const why=!techPrereqsReady(tid)?'前置未完成':(!recordKnown(t.rec)?'缺少技术资料':(!techFacilitiesReady(tid)?'研究设施未在线':(!techAffordable(tid)?'材料不足':'')));
    const b=el('button','primary'); b.innerHTML='研究 · '+(t.hours||4)+' 小时'+(why?'（'+why+'）':'');
    if(can) b.onclick=()=>research(tid); else b.disabled=true;
    d.appendChild(b);
  }
  box.appendChild(d);
}
function research(tid){ const t=TECHS[tid]; if(!t||techKnown(tid))return;
  if(!techPrereqsReady(tid)){ log('前置科技未研究。','warn'); return; }
  if(!recordKnown(t.rec)){ const missing=recordIds(t.rec).filter(id=>!recordKnown(id)).map(id=>TECH_RECORDS[id].name);log('缺少技术资料【'+missing.join('、')+'】。','warn'); return; }
  if(!techFacilitiesReady(tid)){ const missing=techFacilityIds(t).filter(id=>!facilityOnline(id)).map(facilityName);log('研究设施未在线：【'+missing.join('、')+'】。','warn');return; }
  const cost=techUpCost(tid);
  for(const[k,v] of Object.entries(cost)){ if((state.inv[k]||0)<v){log('研究材料不足。','warn'); return;} }
  for(const[k,v] of Object.entries(cost)) state.inv[k]-=v; state.meta.techs[tid]=1; advanceTime(t.hours||4);persistMetaCheckpoint();
  if(t.reveal){discoverLocation(t.reveal,true);state.meta.spaceDiscovered[t.reveal]=true;}
  const msg='🔬 研究完成【'+t.n+'】 · '+techEffect(t,tid);
  divider(); log(msg,'good'); divider(); syncQuestProgress(true); render(); }

/* ---------- 营地建筑子页 ---------- */
function facilityHeader(box,b){
  const nav=el('div','facility-nav'),back=el('button','facility-back ui-icon-button',uiIcon('chevron-left'));
  back.setAttribute('aria-label','返回营地');back.onclick=()=>{state.campBuilding=null;state.campView='home';renderPanelTop();};nav.appendChild(back);
  nav.appendChild(el('div','facility-nav-title','<small>FACILITY // '+b.kind.toUpperCase()+'</small><b>'+b.name+'</b><em>'+b.desc+'</em>'));box.appendChild(nav);
  const hero=el('section','facility-hero '+b.tone);
  hero.innerHTML='<span class="facility-core"><i></i><b>'+b.icon+'</b></span><span class="facility-identity"><small>FACILITY ONLINE</small><h2>'+b.name+'</h2><p>'+b.desc+'</p></span><span class="facility-level"><small>LEVEL</small><b>0'+buildingLevel(b.id)+'</b></span>';
  box.appendChild(hero);
}
function renderFacilityUpgrade(box,b){
  const up=facilityUpgrade(b),sec=el('section','facility-upgrade');
  if(!up){sec.innerHTML='<span class="fu-mark">◇</span><span><small>FACILITY UPGRADE</small><b>设施已达到最高等级</b><em>所有扩建模块均已安装。</em></span><strong>MAX</strong>';box.appendChild(sec);return;}
  const known=techKnown(up.tech),can=known&&canAfford(up.cost),action=el('button',can?'primary':'',known?(can?'升级设施':'材料不足'):('需科技 '+TECHS[up.tech].n));action.disabled=!can;action.onclick=()=>upgradeFacility(b.id);
  sec.innerHTML='<span class="fu-mark">⬡</span><span><small>NEXT UPGRADE</small><b>'+up.name+'</b><em>'+up.effect+' · '+costText(up.cost)+'</em></span>';sec.appendChild(action);box.appendChild(sec);
}
function operationRow(icon,name,desc,meta,label,disabled,fn,cls){
  const row=el('article','operation-row'),main=el('div','operation-copy','<span>'+icon+'</span><span><b>'+name+'</b><small>'+desc+'</small><em>'+meta+'</em></span>'),action=el('button',cls||'',label);
  action.disabled=!!disabled;action.onclick=fn;row.appendChild(main);row.appendChild(action);return row;
}
function renderBuilding(box,id){
  const b=CAMP_BUILDINGS.find(x=>x.id===id);if(!b)return;if(state.meta.damaged[id]){state.campBuilding=null;render();return;}facilityHeader(box,b);
  const sec=el('section','facility-section '+b.kind);box.appendChild(sec);
  if(b.kind==='rest'){
    sec.innerHTML='<div class="rest-bay"><span class="bed-frame"><i></i><b>▰</b></span><div><small>CRYO REST CYCLE</small><h3>休息至次日 08:00</h3><p>恢复生命、体力与护盾，并建立新的检查点。感染不会被普通休息清除。</p><div class="rest-stats"><span>生命 '+P().hp+'/'+maxHp()+'</span><span>体力 '+P().stamina+'/'+Math.round(maxStamina())+'</span><span>'+(P().infected?'感染中':'无感染')+'</span></div></div></div>';
    const action=el('button','primary facility-main-action','进入休眠仓');action.onclick=rest;sec.appendChild(action);
  } else if(b.kind==='smelt'){
    sec.innerHTML='<div class="furnace-console"><span class="furnace-core"><i></i><b>◉</b></span><span><small>THERMAL CORE</small><b>熔炉温度稳定</b><em>设施等级使每次熔炼额外产出 '+(buildingLevel('smelt')-1)+' 份</em></span></div>';
    const list=el('div','operation-list');SMELT.forEach(s=>{const known=hasSmeltTech(s.id),levelOk=buildingLevel('smelt')>=(s.level||1),can=known&&levelOk&&canAfford(s.cost),out=smeltOutput(s),locked=!known?('需研究 '+TECHS[TECH_FOR_SMELT[s.id]].n):(!levelOk?'需要熔炼炉 Lv'+(s.level||1):costText(s.cost));list.appendChild(operationRow('🔥',s.name,locked,known&&levelOk?('产出 '+ITEMS[s.out].icon+ITEMS[s.out].name+'×'+out):'工艺尚未就绪','熔炼',!can,()=>smelt(s),can?'primary':''));});sec.appendChild(list);
  } else if(b.kind==='craft'){
    sec.innerHTML='<div class="workbench-visual"><span>⌬</span><div><small>ASSEMBLY QUEUE</small><b>'+({work:'工程装配台',armor:'防护裁剪台',chem:'无菌调配台',elec:'晶圆与超导台',data:'量子演算台',energy:'聚变封装台',printer:'分子打印阵列',bio:'生物构造阵列',echo:'回响观测阵列',field:'重力场装配环'}[b.st]||'制造终端')+'</b><em>选择已解锁配方，材料会在制作时扣除。</em></div></div>';
    const list=el('div','operation-list');Object.keys(RECIPES).filter(rid=>RECIPES[rid].st===b.st&&hasRecipeTech(rid)).forEach(rid=>{const r=RECIPES[rid],it=ITEMS[r.out],levelOk=recipeFacilityReady(r),can=levelOk&&canAfford(r.cost);list.appendChild(operationRow(it.icon,it.name,it.desc||'制造配方',levelOk?costText(r.cost):recipeFacilityText(r),'制作',!can,()=>craft(r),can?'primary':''));});
    if(!list.children.length)list.appendChild(el('div','facility-empty','暂无可用配方。继续研究科技或在特殊区域寻找蓝图。'));sec.appendChild(list);
  } else if(b.kind==='shipyard'){
    const ready=shipReady(),owned=SHIP_COMPONENTS.filter(has).length;sec.innerHTML='<div class="workbench-visual"><span>▱</span><div><small>STARSHIP ASSEMBLY</small><b>'+(ready?'远征舰【回声号】已服役':'回声号总装 '+owned+'/'+SHIP_COMPONENTS.length)+'</b><em>五个系统来自不同科技分支；所有组件齐备后才能进行首航。</em></div></div>';
    const list=el('div','operation-list');SHIP_COMPONENTS.forEach(id=>{const r=RECIPES[id],known=hasRecipeTech(id),levelOk=known&&recipeFacilityReady(r),ownedNow=has(id)||ready,can=known&&levelOk&&canAfford(r.cost);list.appendChild(operationRow(ITEMS[id].icon,ITEMS[id].name,ITEMS[id].desc,ownedNow?'组件已装配':(!known?'科技未解锁':(levelOk?costText(r.cost):recipeFacilityText(r))),ownedNow?'完成':'制造',ownedNow||!can,()=>craft(r),can?'primary':''));});sec.appendChild(list);
    const assemble=el('button','primary facility-main-action',ready?'回声号已完成':'完成远征舰总装');assemble.disabled=ready||SHIP_COMPONENTS.some(id=>!has(id));assemble.onclick=assembleStarship;sec.appendChild(assemble);
    const payloads=Object.keys(RECIPES).filter(id=>RECIPES[id].st==='ship'&&!SHIP_COMPONENTS.includes(id)&&hasRecipeTech(id));if(payloads.length){sec.appendChild(el('div','camp-section-head','<span><small>ORBITAL PAYLOAD</small><b>轨道装备</b></span><em>远征舰战术接口</em>'));const payloadList=el('div','operation-list');payloads.forEach(id=>{const r=RECIPES[id],ownedNow=has(id),levelOk=recipeFacilityReady(r),can=levelOk&&canAfford(r.cost);payloadList.appendChild(operationRow(ITEMS[id].icon,ITEMS[id].name,ITEMS[id].desc,ownedNow?'权限已装载':(levelOk?costText(r.cost):recipeFacilityText(r)),ownedNow?'完成':'制造',ownedNow||!can,()=>craft(r),can?'primary':''));});sec.appendChild(payloadList);}
  } else if(b.kind==='nav'){
    sec.innerHTML='<div class="workbench-visual"><span>⌘</span><div><small>DEEP SPACE ARRAY</small><b>'+(shipReady()?'远征舰航线在线':'等待远征舰接入')+'</b><em>这里显示整条星际航路；在各星球港口只显示当前可执行航段。</em></div></div>';
    renderSpaceRoutes(sec,true);
  } else if(b.kind==='drone'){
    const used=facilityUsedToday('droneBay'),lv=buildingLevel('droneBay');sec.innerHTML='<div class="workbench-visual"><span>⌁</span><div><small>REMOTE SALVAGE NETWORK</small><b>'+(used?'今日机群已返航':'受约束无人机待命')+'</b><em>只回收亲自到达并登记的资源点；不会代取任务道具或一次性资料。</em></div></div>';
    const list=el('div','operation-list');Object.entries(LOCATIONS).filter(([id,loc])=>loc.resourceSite&&state.visited[id]).forEach(([id,loc])=>{const yields=loc.resourceSite.yield.map(k=>ITEMS[k].name).join(' / ');list.appendChild(operationRow(loc.icon,loc.name,loc.resourceSite.label+' · '+yields,'无人机收益约为人工采集的 60%','派遣',used,()=>dispatchDrone(id),used?'':'primary'));});
    Object.keys(RECIPES).filter(rid=>RECIPES[rid].st==='drone'&&hasRecipeTech(rid)).forEach(rid=>{const r=RECIPES[rid],it=ITEMS[r.out],levelOk=recipeFacilityReady(r),can=levelOk&&canAfford(r.cost);list.appendChild(operationRow(it.icon,it.name,'机库专用装配',levelOk?costText(r.cost):recipeFacilityText(r),'制作',!can,()=>craft(r),can?'primary':''));});
    if(!list.children.length)list.appendChild(el('div','facility-empty','还没有亲自登记的资源点。先探索并抵达地图上的资源设施。'));sec.appendChild(list);
  } else if(b.kind==='storage'){
    const rate=Math.round(Math.max(.25,.35-Math.max(0,buildingLevel('warehouse')-1)*.05)*100);sec.innerHTML='<div class="storage-overview"><span class="storage-shield">⬢</span><span><small>EXPEDITION INSURANCE</small><b>力竭时仅损失本次远征新增材料的 '+rate+'%</b><em>出发前的储备、装备与关键道具不会丢失；无需手动存取。</em></span></div>';
    const bins=el('div','storage-bins');MATS.filter(k=>(state.inv[k]||0)>0).forEach(k=>bins.appendChild(el('div','storage-bin','<span>'+ITEMS[k].icon+'</span><small>'+ITEMS[k].name+'</small><b>'+(state.inv[k]||0)+'</b>')));if(!bins.children.length)bins.appendChild(el('div','facility-empty','仓储舱还是空的。探索后带回的材料会自动分类。'));sec.appendChild(bins);
  } else if(b.kind==='recycle'){
    sec.innerHTML='<div class="recycle-visual"><span>♻</span><div><small>MATERIAL RECOVERY</small><b>拆解线待命</b><em>回收等级越高，废铁产量越高。</em></div></div>';const list=el('div','operation-list');RECYCLE.filter(r=>r.level<=buildingLevel('recycler')).forEach(r=>{const can=canAfford(r.cost),bonus=buildingLevel('recycler')-1,out=Object.entries(r.out).map(([k,v])=>ITEMS[k].name+'×'+(v+(k==='scrap'?bonus:0))).join(' · ');list.appendChild(operationRow(r.icon,r.name,costText(r.cost),'回收 '+out,'拆解',!can,()=>recycleMaterial(r.id),can?'primary':''));});sec.appendChild(list);
  } else if(b.kind==='mess'){
    const used=facilityUsedToday('mess'),lv=buildingLevel('mess'),hp=10+lv*10,st=5+lv*10,fish=state.inv.riverFish||0;
    sec.innerHTML='<div class="meal-console"><span>MES</span><div><small>DAILY MEAL SLOT</small><b>'+(used?'今日配给方案已执行':'选择今日配给方案')+'</b><em>'+(fieldMealActive()?'冲刷鱼汤增益剩余 '+state.foodBuff.charges+' 次':'普通热食用于即时恢复；鱼汤用于下一轮野外行动')+'</em></div></div>';
    const list=el('div','operation-list meal-options');
    list.appendChild(operationRow('RAT','标准热食','消耗营养膏×1','立即恢复 生命 +'+hp+' / 体力 +'+st,'领取',used||!has('ration'),eatMeal,!used&&has('ration')?'primary':''));
    list.appendChild(operationRow('F01','冲刷鱼汤','冲刷盲鱼 '+fish+'/2 · 与标准热食共用每日次数','同等恢复 · 接下来 3 次野外行动体力 -1','烹饪',used||fish<2,eatFishMeal,!used&&fish>=2?'meal-special':''));
    sec.appendChild(list);
  } else if(b.kind==='garden'){
    const used=facilityUsedToday('garden'),lv=buildingLevel('garden'),drops='营养膏×'+(1+lv)+(lv>=2?' · 生物样本×1':'')+(lv>=3?' · 晶体×1':'');sec.innerHTML='<div class="garden-console"><span class="garden-pods"><i></i><i></i><i></i></span><div><small>MYCELIUM CYCLE</small><b>'+(used?'培养槽今日已收获':'培养槽已成熟')+'</b><em>'+drops+' · 每天刷新一次</em></div></div>';const action=el('button',used?'':'primary','收获菌圃');action.disabled=used;action.onclick=harvestGarden;sec.appendChild(action);
  } else if(b.kind==='train'){
    const xp=40+buildingLevel('range')*40,can=(state.inv.scrap||0)>=10;sec.innerHTML='<div class="training-console"><span class="training-target"><i></i>'+uiIcon('locate')+'</span><div><small>COMBAT SIMULATION</small><b>战术训练课程</b><em>消耗废铁×10 · 获得经验 '+xp+' · 用时 2 小时</em></div></div>';const action=el('button',can?'primary':'','开始训练');action.disabled=!can;action.onclick=train;sec.appendChild(action);
  } else if(b.kind==='defense'){
    const remain=state.flags.firstRaidSurvived?Math.max(0,3-(state.rests-(state.flags.lastRaidRest||0))):'未知';sec.innerHTML='<div class="watch-console"><span class="watch-radar"><i></i><b>⌁</b></span><div><small>PERIMETER CONTROL</small><b>总火力 '+defensePower()+'</b><em>下次夜袭：'+remain+(remain==='未知'?'':' 次休息后')+' · 哨戒塔基础火力 '+watchBonus()+'</em></div></div>';
    const list=el('div','operation-list');state.defenses.forEach((d,idx)=>{const t=DEF_TYPES[d.key],c=upCost(d),can=canAfford(c);list.appendChild(operationRow(t.icon,t.name+' Lv'+d.level,'攻击 '+defAtk(d)+' · 射程 '+defRange(d),costText(c),'升级',!can,()=>upgradeDefense(idx),can?'primary':''));});Object.keys(DEF_TYPES).filter(hasDefTech).forEach(k=>{const t=DEF_TYPES[k],can=canAfford(t.build);list.appendChild(operationRow(t.icon,'建造 '+t.name,'攻击 '+t.baseAtk+' · 射程 '+t.range,costText(t.build),'建造',!can,()=>buildDefense(k),can?'primary':''));});if(!list.children.length)list.appendChild(el('div','facility-empty','暂无已解锁的防御工事。继续研究防御科技。'));sec.appendChild(list);
  } else if(b.kind==='beacon'){
    sec.innerHTML='<div class="beacon-console"><span class="beacon-rings"><i></i><i></i><b>◆</b></span><div><small>SIGNAL PROJECTION</small><b>战斗幻影矩阵</b><em>消耗信标电池与体力，胜利后必定回收材料。</em></div></div>';const list=el('div','operation-list');BEACON.forEach((bb,i)=>{const can=P().stamina>=bb.cost&&(state.inv.signalCell||0)>=bb.cells;list.appendChild(operationRow('◈','信标·'+bb.name,'威胁 '+bb.threat+' · 技能书概率 '+Math.round((bb.bookChance+(buildingLevel('beacon')-1)*.05)*100)+'%','电池×'+bb.cells+' · 体力 -'+bb.cost,'激活',!can,()=>startBeacon(i),can?'primary':''));});sec.appendChild(list);
  }
  renderFacilityUpgrade(box,b);
}
function recipeBtn(rid){ const r=RECIPES[rid];
  if(!hasRecipeTech(rid)){ const t=TECH_FOR_RECIPE[rid],why=r.blueprint?'需取得区域特殊蓝图':('需研究:'+TECHS[t].n); return {label:uiIcon('lock')+ITEMS[r.out].name,cost:why,disabled:true,fn:()=>{}}; }
  const can=Object.entries(r.cost).every(([k,v])=>(state.inv[k]||0)>=v);
  return {label:'造 '+ITEMS[r.out].name,cost:Object.entries(r.cost).map(([k,v])=>ITEMS[k].name+'×'+v).join(' '),disabled:!can,cls:can?'primary':'',fn:()=>craft(r)}; }

/* ---------- 任务 ---------- */
function renderTaskPanel(box){
  const s=settleEcho();
  title(box,'<b>本次进度</b> · 击杀'+s.kills+'(威胁'+s.wKill+') 伤害'+s.dmg+' 物资'+s.mat+' <span style="color:var(--warn)">→ 轮回可得回响 '+s.total+'</span>');
  const main=QUESTS.filter(q=>q.line==='main'), md=main.filter(q=>questDone(q.id)).length;
  title(box,'<b>主线进度 '+md+'/'+main.length+'</b> · 当前周目调查 '+(state.truthClaimed||'尚未选择'));
  const names={main:'方舟主线',space:'远航篇 · 零号星门',survivor:'幸存者支线',evidence:'真相证据链',surface:'地表与袭营',signal:'地下信号',special:'隐藏区域与特殊蓝图'};
  ['main','space','survivor','evidence','surface','signal','special'].forEach(line=>{
    const all=QUESTS.filter(q=>q.line===line),list=all.filter(q=>questState(q.id)!=='locked'); if(!list.length)return;
    const done=list.filter(q=>questDone(q.id)).length;
    const h=el('div','qsection','<b>'+names[line]+'</b><span>已发现 '+list.length+' · 完成 '+done+'</span>'); box.appendChild(h);
    list.forEach(q=>{ const st=questState(q.id), card=el('div','qcard '+st);
      const status=st==='done'?'已完成':(st==='active'?'进行中':'未解锁');
      card.innerHTML='<div class="qtop"><span class="qchapter">'+q.chapter+'</span><b>'+q.title+'</b><em>'+status+'</em></div>'+
        '<div class="qgiver">'+q.giver+'</div><div class="qobj">'+q.objective+'</div>'+
        (st==='active'?'<div class="qprogress">'+questProgress(q)+'</div>':'');
      if(st==='active'&&q.type==='submit'){
        const can=P().location===q.turnAt&&Object.entries(q.need).every(([k,v])=>(state.inv[k]||0)>=v);
        const b=el('button',can?'primary':'',P().location===q.turnAt?'交付任务':'前往 '+LOCATIONS[q.turnAt].name+' 交付'); b.disabled=!can; b.onclick=()=>submitQuest(q.id); card.appendChild(b);
      }
      box.appendChild(card);
    });
  });
  title(box,'真相碎片 '+fragmentCount()+'/3 · <span style="color:var(--dim)">深入调查后才会显现完整证据线</span>');
  const truthVisible=[
    ['故障线',questState('faultAudit')!=='locked'],
    ['内鬼线',questState('innerArchive')!=='locked'],
    ['信号线',questState('signalTrace')!=='locked']
  ].filter(([line,seen])=>seen||evidenceReady(line)||state.meta.fragments.includes(line));
  if(truthVisible.length) grid(box,truthVisible.map(([line])=>({label:(state.meta.fragments.includes(line)?'✓ ':'· ')+line,disabled:true})));
  else box.appendChild(el('div','empty','尚未发现可构成真相碎片的证据。'));
  if(questDone('core')||state.meta.endingsDone.length){
    const endings=Object.entries(ENDINGS).filter(([id])=>id!=='cycle'||fragmentCount()>=3||state.meta.endingsDone.includes(id));
    title(box,'结局收集 '+state.meta.endingsDone.length+'/'+endings.length);
    grid(box,endings.map(([id,e])=>({label:(state.meta.endingsDone.includes(id)?'✓ ':'· ')+'结局·'+e.name,disabled:true})));
  }
}

/* ---------- 设置 ---------- */
const updateUi={text:'',busy:false};
let resetConfirming=false;
function appVersionInfo(){
  try{
    const bridge=globalThis.AbyssApp;
    if(bridge&&typeof bridge.versionInfo==='function') return bridge.versionInfo();
  }catch(_){ }
  return '网页版 · 刷新页面即可加载服务器最新版';
}
function setUpdateUi(text,busy){
  updateUi.text=text||''; updateUi.busy=!!busy;
  const status=$('update-status'),button=$('check-update-btn');
  if(status) status.textContent=updateUi.text||'启动时会自动检查，也可以现在手动检查。';
  if(button){ button.disabled=updateUi.busy; button.textContent=updateUi.busy?'正在检查…':'检查更新'; }
}
function checkAppUpdate(){
  if(updateUi.busy)return;
  try{
    const bridge=globalThis.AbyssApp;
    if(bridge&&typeof bridge.checkForUpdates==='function'){
      setUpdateUi('正在连接更新服务器…',true);
      bridge.checkForUpdates();
      return;
    }
  }catch(_){ }
  setUpdateUi('网页版由服务器直接提供，刷新页面就是最新版本。',false);
}
globalThis.onAbyssUpdateStatus=(text,finished)=>setUpdateUi(String(text||''),!finished);
function toggleAudioPref(key){
  normalizeAudioPrefs(state);state[key]=!state[key];save();
  if(key==='vibration'&&state.vibration&&typeof navigator!=='undefined'&&navigator.vibrate)try{navigator.vibrate(16);}catch(_){}
  if(key==='music'){if(state.music)unlockAudio();else stopAmbientMusic();}
  else {syncAudioState();if(key==='sound'&&state.sound)unlockAudio().then(ok=>{if(ok)playSfx('success');});}
  render();
}
function setAudioVolume(key,value){normalizeAudioPrefs(state);state[key]=Math.max(0,Math.min(1,Number(value)||0));save();syncAudioState();}
function settingsToggle(key,icon,titleText,desc){
  const on=!!state[key],row=el('div','settings-control'),copy=el('span','settings-control-copy','<small>'+titleText.toUpperCase()+'</small><b>'+titleText+'</b><em>'+desc+'</em>'),mark=el('span','settings-control-mark',uiIcon(icon)),toggle=el('button','settings-switch'+(on?' on':''),'<span><i></i></span><b>'+(on?'开启':'关闭')+'</b>');
  toggle.setAttribute('aria-label',titleText+'：'+(on?'开启':'关闭'));toggle.setAttribute('aria-pressed',on?'true':'false');toggle.onclick=()=>toggleAudioPref(key);row.append(mark,copy,toggle);return row;
}
function settingsVolume(key,labelText,enabled){
  const value=Math.round(state[key]*100),row=el('label','settings-volume','<span><b>'+labelText+'</b><em id="'+key+'-value">'+value+'%</em></span>'),input=document.createElement('input');input.type='range';input.min='0';input.max='100';input.step='5';input.value=String(value);input.disabled=!enabled;input.setAttribute('aria-label',labelText);
  input.oninput=()=>{setAudioVolume(key,Number(input.value)/100);const out=$(key+'-value');if(out)out.textContent=input.value+'%';};input.onchange=()=>{if(key==='soundVolume'&&state.sound)unlockAudio().then(ok=>{if(ok)playSfx('success');});};row.appendChild(input);return row;
}
function renderSetPanel(box){
  title(box,'<b>设置</b>');
  const update=el('section','settings-update');
  update.innerHTML='<span class="update-mark" aria-hidden="true">'+uiIcon('refresh')+'</span><span class="update-copy"><small>APPLICATION UPDATE</small><b>游戏更新</b><em id="update-version"></em><span id="update-status"></span></span>';
  const check=el('button','primary update-check','检查更新'); check.id='check-update-btn'; check.onclick=checkAppUpdate;
  update.appendChild(check); box.appendChild(update);
  $('update-version').textContent=appVersionInfo(); setUpdateUi(updateUi.text,updateUi.busy);
  normalizeAudioPrefs(state);title(box,'<b>声音与触觉</b> · 所有开关立即生效');
  const media=el('section','settings-media ui-panel');media.appendChild(settingsToggle('sound','sensor','音效','触摸、采集、警告与战斗均使用独立反馈音'));
  media.appendChild(settingsVolume('soundVolume','音效音量',state.sound));media.appendChild(settingsToggle('music','energy','背景音乐','程序化深空环境乐，首次触摸后开始播放'));
  media.appendChild(settingsVolume('musicVolume','音乐音量',state.music));media.appendChild(settingsToggle('vibration','bracelet','触觉反馈','安卓按钮轻触震动，可独立关闭'));
  media.appendChild(el('p','settings-media-note','声音会遵循手机系统媒体音量；静音后不会在后台偷偷播放。'));box.appendChild(media);
  title(box,'存档');
  if(resetConfirming) grid(box,[
    {label:'确认清空并重看序章',cost:'此操作无法撤销',cls:'danger',fn:hardReset},
    {label:'取消',cost:'保留当前进度',fn:()=>{resetConfirming=false;render();}}
  ]);
  else grid(box,[{label:'重新开始(清空本档)',cost:'点击后在页面内再次确认',cls:'danger',full:true,fn:()=>{resetConfirming=true;render();}}]);
  title(box,'关于'); box.appendChild(el('div','panel-title','《深渊回响》· 深度流文字RPG原型'));
}
function hardReset(){ const prefs=audioPrefs(state);resetConfirming=false; localStorage.removeItem(SAVE_KEY); state=freshState();Object.assign(state,prefs);syncAudioState();updateCheckpoint(); $('log').innerHTML=''; intro(); render(); }

/* ---------- 战斗面板 ---------- */
function combatActionButton(action){
  const b=el('button','combat-action'+(action.cls?' '+action.cls:''));
  b.innerHTML='<span class="combat-action-mark" aria-hidden="true">'+(action.icon||uiIcon('combat'))+'</span><span class="combat-action-copy"><b>'+action.label+'</b><small>'+action.meta+'</small></span>';
  b.disabled=!!action.disabled;b.onclick=action.fn;return b;
}
function renderCombatPanel(box){
  const c=state.combat,w=eqOf('weapon')||{name:'徒手',icon:'◇',weaponType:'melee',staminaCost:2,range:1};
  const canHit=atkRange()>=c.distNow,enemyHp=Math.max(0,c.hp),enemyPct=Math.max(0,Math.min(100,enemyHp/c.maxHp*100));
  const hp=Math.max(0,P().hp),hpMax=maxHp(),hpPct=Math.max(0,Math.min(100,hp/hpMax*100)),stMax=Math.round(maxStamina()),stPct=Math.max(0,Math.min(100,P().stamina/stMax*100));
  const screen=el('div','combat-screen'),stage=el('section','combat-stage');

  const enemy=el('article','combatant combat-enemy'+(c.boss?' boss':''));
  const enemyStates=[c.boss?'首领':null,c.mech?'机械单位':'生物单位',c.infect?'感染风险':null,c.armorSegments>0?'场锚 '+c.armorSegments:null,c.bombardEvery?'投射蓄能 '+((c.round||0)%c.bombardEvery+1)+'/'+c.bombardEvery:null,c.regenPct?'活体再生':null,c.staminaDrainEvery?'相位抽取':null,c.empTurns>0?'瘫痪 '+c.empTurns:null].filter(Boolean);
  enemy.innerHTML='<header class="combatant-heading"><span><small>HOSTILE // '+(c.boss?'BOSS':'CONTACT')+'</small><b>'+c.name+'</b></span><em>威胁 '+(c.threat||0)+'</em></header>'+
    '<div class="combatant-body"><span class="combat-figure enemy-figure" aria-hidden="true">'+uiIcon(c.mech?'sensor':'alert')+'<i></i></span><span class="combat-vitals"><span class="combat-value"><b>'+enemyHp+'</b><small>/ '+c.maxHp+' HP</small></span><span class="combat-bar enemy-bar"><i style="width:'+enemyPct+'%"></i></span><span class="combat-stats"><i>攻击 '+c.atk+'</i><i>防御 '+c.def+'</i><i>射程 '+c.range+'</i></span></span></div>'+
    '<div class="combat-tags">'+enemyStates.map(x=>'<span>'+x+'</span>').join('')+'</div>';
  stage.appendChild(enemy);

  const readout=el('section','combat-readout');
  readout.innerHTML='<div class="combat-distance '+(canHit?'in-range':'out-range')+'"><span><small>DISTANCE</small><b>'+c.distNow+'</b></span><i></i><span><small>有效射程</small><b>'+atkRange()+'</b></span><em>'+(canHit?'目标已进入攻击范围':'需要接近目标')+'</em></div>';
  const feed=el('div','combat-feed'),history=(c.history||[]).slice(-3);
  if(!history.length)history.push({text:'遭遇目标，等待你的行动。',cls:'story'});
  history.forEach(entry=>{const line=el('p',entry.cls||'story');line.textContent=entry.text;feed.appendChild(line);});
  readout.appendChild(feed);stage.appendChild(readout);

  const player=el('article','combatant combat-player');
  const playerStates=[P().infected?'感染中':null,P().shield>0?'护盾 '+P().shield:null,w.weaponType==='ranged'?(ITEMS[w.ammo].name+' '+(state.inv[w.ammo]||0)):'近战武器'].filter(Boolean);
  player.innerHTML='<header class="combatant-heading"><span><small>ARK // OPERATIVE</small><b>幸存者 · Lv'+P().level+'</b></span><em>'+w.icon+' '+w.name+'</em></header>'+
    '<div class="combatant-body"><span class="combat-figure player-figure" aria-hidden="true"><b>'+w.icon+'</b><i></i></span><span class="combat-vitals"><span class="combat-value"><b>'+hp+'</b><small>/ '+hpMax+' HP</small></span><span class="combat-bar player-bar"><i style="width:'+hpPct+'%"></i></span><span class="combat-energy"><small>体力 '+P().stamina+'/'+stMax+'</small><span><i style="width:'+stPct+'%"></i></span></span><span class="combat-stats"><i>攻击 '+totalAtk()+'</i><i>防御 '+totalDef()+'</i><i>移距 '+moveRange()+'</i></span></span></div>'+
    '<div class="combat-tags">'+playerStates.map(x=>'<span>'+x+'</span>').join('')+'</div>';
  stage.appendChild(player);screen.appendChild(stage);

  const deck=el('section','combat-deck');
  deck.innerHTML='<header class="combat-deck-head"><span><small>ACTION DECK</small><b>选择行动</b></span><em>行动后敌方响应</em></header>';
  const main=el('div','combat-main-actions'),normalResource=attackResource();
  main.appendChild(combatActionButton({label:'攻击',meta:canHit?attackResourceStatus(normalResource):'超出射程 · 当前 '+c.distNow,icon:w.icon,cls:'primary',disabled:!canHit||!normalResource.ready,fn:playerAttack}));
  main.appendChild(combatActionButton({label:'接近',meta:'距离 -'+moveRange()+' · 体力 -2',icon:uiIcon('locate'),disabled:c.distNow<=1||P().stamina<2,fn:approach}));
  deck.appendChild(main);

  const skills=el('div','combat-skill-actions');
  (state.skillSlots||[]).forEach((k,i)=>{if(!k)return;const s=SKILLS[k],resource=attackResource(s),maxRange=s.kind==='melee'?1:atkRange(),rangeOk=c.distNow<=maxRange;
    skills.appendChild(combatActionButton({label:'0'+(i+1)+' · '+s.name,meta:rangeOk?attackResourceStatus(resource):'射程不足 · 需要 '+maxRange,icon:uiIcon(s.kind==='ranged'?'locate':'combat'),disabled:!skillUnlocked(k)||!resource.ready||!rangeOk,fn:()=>useSkill(k)}));});
  if(skills.children.length){deck.appendChild(el('div','combat-group-label','战术技能'));deck.appendChild(skills);}

  const utility=el('div','combat-utility-actions');
  const inSpace=['orbit','ashMoon','verdant','silent'].includes(regionForLocation(P().location));if(c.boss&&inSpace&&has('orbitalLance')&&shipReady())utility.appendChild(combatActionButton({label:'轨道压制',meta:c.orbitalUsed?'本场已调用':'一次/战 · 破除场锚并削甲',icon:uiIcon('lance'),disabled:c.orbitalUsed,fn:orbitalStrike,cls:'primary'}));
  if(c.mech)utility.appendChild(combatActionButton({label:'电磁干扰',meta:'库存 '+(state.inv.emp||0)+' · 瘫痪3回合',icon:uiIcon('sensor'),disabled:!has('emp'),fn:()=>combatItem('emp')}));
  utility.appendChild(combatActionButton({label:'急救',meta:'急救包 '+(state.inv.medkit||0),icon:uiIcon('medical'),disabled:!has('medkit'),fn:()=>combatItem('medkit')}));
  utility.appendChild(combatActionButton({label:'补充体力',meta:'药剂 '+(state.inv.potion||0),icon:uiIcon('energy'),disabled:!has('potion'),fn:()=>combatItem('potion')}));
  utility.appendChild(combatActionButton({label:'稳住呼吸',meta:'体力 +5 · 敌人行动',icon:uiIcon('vital'),fn:catchBreath}));
  utility.appendChild(combatActionButton({label:'逃跑',meta:'体力 -2 · 成功率受速度影响',icon:uiIcon('chevron-left'),cls:'danger',disabled:P().stamina<2,fn:flee}));
  deck.appendChild(el('div','combat-group-label','战术与物品'));deck.appendChild(utility);screen.appendChild(deck);box.appendChild(screen);
}

/* ---------- 死亡 ---------- */
function renderDeathPanel(box){
  const s=settleEcho();
  title(box,'<b>你倒下了。</b>');
  box.appendChild(el('div','panel-title','本次:击杀'+s.kills+'(威胁'+s.wKill+') · 伤害'+s.dmg+' · 物资'+s.mat+' → 可结算 <b style="color:var(--warn)">回响 '+s.total+'</b>'));
  grid(box,[{label:'从存档点继续',cost:'回到上次营地休息,本周目继续',cls:'primary',full:true,fn:continueFromCheckpoint},
    {label:'轮回 · 结算回响 +'+s.total,cost:'结束本周目,开新一周目',full:true,fn:doReincarnate}],true);
}

/* ---------- 结局 ---------- */
function renderEndingPanel(box){
  if (state.endingChosen){ const s=settleEcho();
    title(box,'<b>结局已定</b>');
    grid(box,[{label:'轮回(结算本次回响 +'+s.total+')',cost:'领回响,开新一周目',cls:'primary',full:true,fn:doReincarnate},{label:'继续自由探索',full:true,fn:()=>{state.screen='play';state.endingChosen=null;render();}}],true); return; }
  title(box,'<b>守望者之问</b> · 用312换1688,我算错了吗?');
  const acts=Object.entries(ENDINGS).map(([id,e])=>{ const locked=e.need&&fragmentCount()<e.need; const done=state.meta.endingsDone.includes(id);
    return {label:(done?uiIcon('check'):'')+(locked?uiIcon('lock'):'')+'结局·'+e.name,cost:locked?('需'+e.need+'碎片'):(done?'已得道具':'走这条线'),disabled:locked,cls:locked?'':'primary',fn:()=>chooseEnding(id)}; });
  acts.push({label:'暂不选择,继续探索',full:true,fn:()=>{state.screen='play';render();}});
  grid(box,acts,true);
}

/* ================= 装备/使用 ================= */
function equip(slot,id){ if(!has(id)){log('没有这件物品。','warn');return;} const it=ITEMS[id]; if(it.slot!==slot)return;
  const prev=P().equip[slot]; state.inv[id]--; if(prev) state.inv[prev]=(state.inv[prev]||0)+1; P().equip[slot]=id;
  if(slot==='body'||slot==='offhand') P().shield=Math.min(P().shield, shieldMax()); if(P().shield>shieldMax())P().shield=shieldMax();
  log('已装备:'+it.name,'good'); advanceTime(1); render(); }
function unequip(slot){ const cur=P().equip[slot]; if(!cur)return; P().equip[slot]=null; state.inv[cur]=(state.inv[cur]||0)+1; if(P().shield>shieldMax())P().shield=shieldMax(); log('已卸下:'+ITEMS[cur].name,'dim'); render(); }
function craft(r){ const facility=facilityForStation(r&&r.st);if(!facility||!facilityOnline(facility.id)){log('对应制造设施未建成或已受损。','warn');return;}if(!recipeFacilityReady(r)){log(recipeFacilityText(r)+'。','warn');return;}for(const[k,v] of Object.entries(r.cost)){ if((state.inv[k]||0)<v){log('材料不足。','warn');return;} }
  const amount=r.yield||1;for(const[k,v] of Object.entries(r.cost)) state.inv[k]-=v; state.inv[r.out]=(state.inv[r.out]||0)+amount;
  const saved=[];if(Math.random()*100<jobBonus('craftSavePct'))for(const[k,v]of Object.entries(r.cost)){const n=Math.max(1,Math.floor(v/2));state.inv[k]=(state.inv[k]||0)+n;saved.push(ITEMS[k].name+'×'+n);} gainCareerXp('life',5);
  log('制作完成:'+ITEMS[r.out].name+'×'+amount+(saved.length?' · 精密制造返还 '+saved.join('、'):''),'good'); advanceTime(1); render(); }
function smelt(s){ if(!facilityOnline('smelt')){log('熔炼炉未建成或已受损。','warn');return;}if(!hasSmeltTech(s.id)){log('需先研究【'+TECHS[TECH_FOR_SMELT[s.id]].n+'】。','warn');return;}if(buildingLevel('smelt')<(s.level||1)){log('需要熔炼炉 Lv'+(s.level||1)+'。','warn');return;}
  for(const[k,v] of Object.entries(s.cost)){ if((state.inv[k]||0)<v){log('材料不足。','warn');return;} }
  const out=smeltOutput(s); for(const[k,v] of Object.entries(s.cost)) state.inv[k]-=v; state.inv[s.out]=(state.inv[s.out]||0)+out;gainCareerXp('life',5);
  log('🔥 熔炼:'+Object.entries(s.cost).map(([k,v])=>ITEMS[k].name+'×'+v).join(' ')+' → '+ITEMS[s.out].name+'×'+out,'good'); advanceTime(1); render(); }
function train(){ if(state.inv.scrap<10){log('需要废铁×10。','warn');return;} const xp=40+buildingLevel('range')*40; state.inv.scrap-=10; gainXp(xp); log('完成训练，经验 +'+xp+'。','good'); advanceTime(2); render(); }
function useItem(id){ if(!has(id)){log('没有这个物品。','warn');return;} const it=ITEMS[id];
  if(it.type==='book'){ state.inv[id]--; gainProf(it.skill,20); log('研读'+it.name+',【'+SKILLS[it.skill].name+'】熟练度+20。','good'); render(); return; }
  if(it.type!=='use'){log('不能直接使用。','warn');return;}
  state.inv[id]--;
  if(it.hp){P().hp=Math.min(maxHp(),P().hp+it.hp);log('使用'+it.name+',生命+'+it.hp+'。','good');}
  if(it.stamina){P().stamina=Math.min(Math.round(maxStamina()),P().stamina+it.stamina);log('使用'+it.name+',体力+'+it.stamina+'。','good');}
  if(it.cure==='infection'){P().infected=false;log('感染清除。','good');}
  if(it.emp&&state.combat&&state.combat.mech){state.combat.empTurns=3;log('电磁干扰生效,目标瘫痪3回合。','good');}
  render(); }
function gainProf(k,n){ const b=skillLv(k); state.skills[k].prof+=n; const a=skillLv(k); if(a>b)log('【'+SKILLS[k].name+'】升到 '+a+' 级(攻+1)。','good'); }
function gainXp(n){ P().xp+=n; while(P().xp>=xpNeed(P().level)){ P().xp-=xpNeed(P().level); P().level++; P().hp=maxHp(); log('⭐ 升到 Lv'+P().level+'!生命/攻击/防御/速度提升。','good'); } }

/* ================= 探索/移动 ================= */
function payAreaAction(base){
  const cost=areaActionCost(base);
  if(P().stamina<cost){P().stamina=0;exhaustionDeath();return false;}
  const loc=LOCATIONS[P().location]; spendStamina(base); advanceTime(1);
  if(P().stamina<=0){exhaustionDeath();return false;}
  if (loc.radiation&&!armorImmune('radiation')) log('辐射灼烧着你。','warn');
  if (loc.contamination&&!armorImmune('contamination')&&!geneRule('contaminationGuard')){ log('污染侵蚀着你(-3生命)。','danger'); P().hp-=3; }
  if (loc.flooded) log('积水拖慢了你。','dim');
  if(P().hp<=0){ die(); return false; }
  if(!infectionTick())return false;
  return true;
}
function performLocationAction(id){
  const a=LOCATION_ACTIONS[id];
  if(!a||P().location!==id)return false;
  if(!locationActionRemaining(id)){log('这处场景行动今天已经达到上限，次日会刷新。','dim');render();return false;}
  if(!payAreaAction(a.cost))return false;
  recordLocationAction(id);
  const total=a.outcomes.reduce((sum,o)=>sum+o.w,0);let roll=Math.random()*total,outcome=a.outcomes[a.outcomes.length-1];
  for(const item of a.outcomes){roll-=item.w;if(roll<=0){outcome=item;break;}}
  divider();log('◇ 地点行动 · '+a.name,'sys');log(outcome.text,'story');
  if(outcome.gain){const gained=[];for(const [item,range] of Object.entries(outcome.gain)){const n=range[0]+Math.floor(Math.random()*(range[1]-range[0]+1));gainMat(item,n);gained.push(ITEMS[item].name+'×'+n);}log('获得：'+gained.join('、'),'good');}
  gainCareerXp('life',2);divider();syncQuestProgress(true);
  if(outcome.enemy){log('地点行动引发了敌对接触。','warn');startCombat(outcome.enemy);return true;}
  checkStamina();render();return true;
}
function applyAreaEvent(id,fixed,idx){
  divider(); log('◆ 区域事件 '+(idx+1)+'/'+AREA_EVENTS[id].length,'sys'); log(fixed.text,'story');
  if(fixed.gain){ const g=[]; for(const[k,v] of Object.entries(fixed.gain)){gainMat(k,v);g.push(ITEMS[k].name+'×'+v);} log('获得:'+g.join('、'),'good'); }
  if(fixed.item&&ITEMS[fixed.item]){state.inv[fixed.item]=(state.inv[fixed.item]||0)+1;log('获得关键道具：'+ITEMS[fixed.item].name+'。','good');}
  if(fixed.record)grantTechRecord(fixed.record,true);
  if(fixed.flag) setProgressFlag(fixed.flag,true);
  (fixed.flags||[]).forEach(flag=>setProgressFlag(flag,true));
  if(fixed.reveal) discoverLocation(fixed.reveal,true);
  divider(); setLogOpen(true);
}
function gatherArea(id){
  if(!gatherAvailable(id)){log('这个区域今天可回收的材料已经取完，次日会刷新。','dim');return false;}
  const loc=LOCATIONS[id], entries=Object.entries(loc.loot||{}),g=[],cm=M().collect*(1+(techBonus('collect')+jobBonus('gatherPct'))/100);
  entries.forEach(([m,ch],i)=>{ if(Math.random()<Math.min(.92,ch+.22)||(i===0&&!g.length)){
    const bio=['biocore','ration'].includes(m)?1+jobBonus('bioGatherPct')/100:1,n=Math.max(1,Math.round((1+Math.floor(Math.random()*2))*cm*bio)); gainMat(m,n); g.push(ITEMS[m].name+'×'+n);
  }});
  gainCareerXp('life',4);
  recordGather(id);
  log(g.length?'定向采集获得：'+g.join('、'):'这一处资源已经枯竭。',g.length?'good':'dim');
  return true;
}
function investigationClueChance(id){
  const misses=(state.investigationMisses&&state.investigationMisses[id])||0;
  return misses>=3?1:Math.min(.86,.32+misses*.18);
}
function investigationLoot(id,rare){
  const loc=LOCATIONS[id],limited=new Set(loc.resourceSite&&loc.resourceSite.yield||[]),loot=Object.entries(loc.loot||{}).filter(([item])=>!limited.has(item));if(!loot.length)return false;
  const total=loot.reduce((sum,row)=>sum+row[1],0);let pick=Math.random()*total,key=loot[0][0];
  for(const row of loot){pick-=row[1];if(pick<=0){key=row[0];break;}}
  const amount=rare?2+Math.floor(Math.random()*2):1;gainMat(key,amount);gainCareerXp('life',rare?3:2);
  log((rare?'发现一处被掩埋的物资缓存：':'沿痕迹找到散落物资：')+ITEMS[key].name+'×'+amount+'。','good');
  return true;
}
function resolveInvestigation(id){
  if(!state.investigationMisses)state.investigationMisses={};
  const loc=LOCATIONS[id],enemies=loc.enemies||[],idx=state.areaSearch[id]||0;
  if(Math.random()<investigationClueChance(id)){
    state.investigationMisses[id]=0;state.areaSearch[id]=idx+1;
    const fixed=AREA_EVENTS[id]&&AREA_EVENTS[id][idx];
    if(fixed)applyAreaEvent(id,fixed,idx);else{divider();log('◇ 获得有效线索','sys');log('你排除错误痕迹，补全了一段可信的区域记录。','story');divider();setLogOpen(true);}
    applyDiscoveryMilestones(id,state.areaSearch[id]);
    return 'clue';
  }
  state.investigationMisses[id]=(state.investigationMisses[id]||0)+1;
  const outcome=Math.random(),danger=enemies.length?(endingOwned('beacon')?.22:.3):0;
  if(enemies.length&&outcome<danger){log('扫描噪声暴露了位置，附近的敌对目标正在接近。','warn');startCombat(enemies[Math.floor(Math.random()*enemies.length)]);return 'combat';}
  if(outcome<(enemies.length?danger+.46:.72)&&investigationLoot(id,outcome>(enemies.length?danger+.34:.55)))return 'loot';
  log(flavor(id),'dim');log('这次没有取得可确认的路线或情报。','dim');return 'empty';
}
function talkAreaNpc(who){
  const id=P().location;
  if(npcLocation(who)!==id){log(who+'已经离开这里，地图联系人记录已更新。','dim');render();return;}
  if(who==='老乔'){
    log(id==='camp'?'老乔：“前哨我留了自动灯。现在营地要守夜，我就在这里盯着防线。”':'老乔：“我给你的图只保真到这座营地。黑木林、断舰岩脊，还有船底下的路，都得靠你调查现场后自己标出来。”','story');
  } else if(who==='阿拓'){
    if(!state.flags.minerFreed){ log('阿拓仍被塌方隔开。先勘探并清理矿道。','warn'); return; }
    if(!state.flags.bp_miningHarness){ state.flags.bp_miningHarness=true; divider(); log('矿工阿拓把采掘机的助力结构画成蓝图。','story'); log('获得特殊蓝图【采掘外骨骼】· 可在基础工作台制作。','good'); divider(); }
    else log(id==='underworks'?'阿拓：“这口维修井接着旧矿层。我先在这里校准平台，后面找到真正值得开的矿脉再通知你。”':'阿拓：“外层煤软、铜脉靠东。别朝有卵壳的地方下镐。”','story');
    if(!state.flags.job_salvager_qualified){state.flags.job_salvager_qualified=true;log('职业资格获得：残骸勘探员。','good');}
  } else if(who==='纪遥'){
    if(!state.flags.prototypeOnline){ log('原型终端还没有恢复。先分析实验记录。','warn'); return; }
    if(!state.flags.bp_neuralFilter){ state.flags.bp_neuralFilter=true; divider(); log('技术员纪遥补全了被委员会删除的校准参数。','story'); log('获得特殊蓝图【神经滤波器】· 可在电子工作台制作。','good'); divider(); }
    else log('纪遥：“科技树只记录被批准的技术，真正危险的原型都藏在事故报告后面。”','story');
    if(!state.flags.job_infiltrator_qualified){state.flags.job_infiltrator_qualified=true;log('特殊职业候选资格：相位猎手。最终仪式位于地下信号源。','good');}
  } else if(who==='陈嫂'){
    log(questActive('fever')?'陈嫂：“孩子的高烧压不下去。制药台做出的急救包也许还来得及。”':'陈嫂：“他父亲没能熬过第一轮舱壁破裂。至少这个孩子得活下去。”','story');
  } else if(who==='老周'){
    log(questActive('drain')?'老周：“泵还能转，缺的是废铁和电子元件。水一退，工程区的检修门就露出来了。”':'老周：“军事区的权限卡也许能打开这里早已封存的舱门。”','story');
  } else if(who==='阿珍'){
    log(questDone('freeAyong')?'阿珍和阿勇并肩坐在干燥后的舱室门口。这个区域终于有了一点家的样子。':(questActive('findAyong')?'阿珍：“阿勇是导航员。坠毁前他去实验室查航线，从那以后就没回来。请帮我找到他。”':'阿珍仍在整理阿勇留下的导航记录。'),'story');
  } else if(who==='阿勇'){
    log('阿勇：“军事区扣住我的不是审讯命令，而是一段没有签发人的自动指令。舰桥那晚可能根本没人。”','story');
  } else if(who==='林薇'){
    if(state.flags.tangSaved&&!state.flags.job_bulwark_qualified){state.flags.job_bulwark_qualified=true;log('林薇允许你参加装甲卫士训练。职业资格已获得。','good');}
    if(questDone('faultAudit')&&techKnown('make_4')&&!state.flags.job_fabricator_qualified){state.flags.job_fabricator_qualified=true;log('林薇认可了你的制造能力。职业资格：制造技师。','good');}
    if(questActive('rescueTang')) log('林薇：“小唐困在高辐射维修井。穿防辐射服进去还有机会；远程封舱能压低辐射，但他活不了。”','story');
    else if(questActive('seal')) log('林薇：“冷却环必须用六份钢材封住。别在辐射区里浪费体力。”','story');
    else if(questActive('faultAudit')) log('林薇：“还差'+Math.max(0,3-questSearchCount(QUEST_BY_ID.faultAudit))+'段新的导航缓存。如果只是传感器故障，系统不该连续取消纠偏。”','story');
    else log(id==='camp'?'林薇：“冷却环稳定了，我把工程调度台搬回营地。以后别去旧工位找我。”':'林薇：“故障是真的，但坠毁不是故障自己造成的。”','story');
  } else if(who==='小唐'){
    log(state.flags.tangSaved?'小唐：“我欠你一条命。营地防线的传感器交给我维护。”':'小唐的信号从维修井里断续传来：“门快熔了……还有人吗？”','story');
  } else if(who==='陈博士'){
    if(questDone('sample')&&state.flags.nurseryFound&&!state.flags.job_biologist_qualified){state.flags.job_biologist_qualified=true;log('陈博士向你开放了生态培育训练。职业资格已获得。','good');}
    if(questActive('findAyong')) log('陈博士：“阿勇来过。他复制了安保终端，又被军事区的人带走。把这里查透，也许还能找到拘留编号。”','story');
    else if(questActive('sample')) log('陈博士：“给我五份生物样本。我要确认实验体脑内的放电和地下信号是不是同一个节拍。”','story');
    else if(questActive('signalTrace')) log('陈博士：“菌光谷的放电频率对上了。那里不是源头，但肯定是中继站。”','story');
    else log(id==='fungal'?'陈博士：“样本会复述无线电。我留在菌光谷比待在实验室更接近答案。”':'陈博士：“气密管线通往一个不在平面图上的培养室。委员会隐藏过更多东西。”','story');
  } else if(who==='哈里斯'){
    if(questDone('patrol')&&!state.flags.job_vanguard_qualified){state.flags.job_vanguard_qualified=true;log('哈里斯提交了你的战斗认证。职业资格：方舟突击兵。','good');}
    if(questActive('freeAyong')) log('哈里斯避开你的目光：“阿勇没有正式罪名。队长权限卡能开拘留舱，接下来由你决定。”','story');
    else if(questActive('patrol')) log('哈里斯：“三枚巡逻信标，少一枚都不能下结论。炮塔还把我们当敌人，小心。”','story');
    else log(id==='camp'?'哈里斯：“巡逻线已经交给自动哨戒。我回营地负责新人的战斗认证。”':'哈里斯：“队长留的权限卡归你。旧坐标指向生活区的封存导航舱——回去看看。”','story');
  } else if(who==='哑叔'){
    const ready=['故障线','内鬼线','信号线'].filter(evidenceReady);
    if(questActive('bridge')&&!state.flags.commandDecoded) log('哑叔在终端写下：“先还原舰长日志和权限调用链。没有舰桥自己的记录，任何证据都只是猜测。”','story');
    else if(questActive('bridge')) log('哑叔在终端写下：“已完整的证据：'+(ready.join('、')||'暂无')+'。舰桥只能带走其中一条。”','story');
    else log(id==='camp'?'哑叔把舰桥记录终端接进营地档案库，然后写下：“以后在这里查。”':'哑叔指向舰长日志的最后一行：“舰桥没有人，命令从船自身发出。”','story');
  } else log(who+'暂时没有新的情报。','dim');
  syncQuestProgress(true); render();
}
function explore(mode){
  mode=mode||'investigate';
  const id=P().location,loc=LOCATIONS[id],base=mode==='gather'?2:1;
  if(mode==='gather'&&!gatherAvailable(id)){log('这个区域今天可回收的材料已经取完，次日会刷新。','dim');render();return;}
  if(!payAreaAction(base)) return;
  if(id==='layer7'&&!state.meta.wardenDone&&mode!=='gather'){ if(!state.meta.guardianDown){ log('守望者的守卫苏醒了。','danger'); startCombat('guardian'); return; } triggerWarden(); return; }
  if(loc.boss&&mode!=='gather'&&!metaFlag(loc.bossFlag)){log('区域控制者锁定了你的远征队。','danger');startCombat(loc.boss);return;}
  if(mode==='hunt'){
    if(loc.enemies&&loc.enemies.length){ log('你主动搜索并锁定了本区域的威胁。','warn'); startCombat(loc.enemies[Math.floor(Math.random()*loc.enemies.length)]); return; }
    log('扫描没有发现可交战目标。','dim'); checkStamina(); render(); return;
  }
  if(mode==='gather'){
    gatherArea(id); syncQuestProgress(true);
    const danger=(loc.enemies||[]).length&&Math.random()<(endingOwned('beacon')?.18:.26);
    if(danger){log('采集声引来了附近的敌对生物。','warn');startCombat(loc.enemies[Math.floor(Math.random()*loc.enemies.length)]);return;}
    checkStamina(); render(); return;
  }
  const outcome=resolveInvestigation(id);
  syncQuestProgress(true); if(P().hp<=0){die();return;}
  if(outcome==='combat')return;
  checkStamina(); render();
}
function flavor(id){ const zone=LOCATIONS[id].zone, pool={
  地表:['风从船壳裂口穿过，发出像低语一样的声音。','远处的黑木枝条同时向一个方向偏转。','碎岩下传来短促的刨土声。'],
  船内:['应急灯闪了闪，又暗下去。','远处传来金属冷却的咔哒声。','墙上有一道从通风口延伸出来的爪痕。'],
  地下:['菌光在你的脚步后依次熄灭。','无线电里传回比你呼吸慢半拍的回声。','岩壁深处有规律地震动了三次。']
  }; const a=pool[zone]||['这里暂时没有新的发现。']; return a[Math.floor(Math.random()*a.length)]; }
function move(dest){
  if(!LOCATIONS[dest]||!isAdjacent(P().location,dest)){ log('这里没有可直接通行的路线。','warn'); return; }
  const gate=locationGate(dest); if(!gate.ok){ log(gate.text+'。','warn'); return; }
  if(entryNeedsConfirm(dest)){openSiteSheet('gate',dest);return;}
  const from=P().location,nl=LOCATIONS[dest],cost=moveCost(from,dest);
  if(P().stamina<cost){if(from==='camp'){log('体力不足，先在营地休息。','warn');return;}P().stamina=0;exhaustionDeath();return;}
  if(from==='camp')beginExpedition();
  P().stamina-=cost; advanceTime(1); P().location=dest; discoverLocation(dest,false); state.tab='act'; state.mapOpen=false; state.siteSheet=null; state.mapRegion=regionForLocation(dest); divider(); log('来到【'+nl.name+'】。','sys'); describe(dest);
  if(dest==='camp')finishExpedition();else if(P().stamina<=0){exhaustionDeath();return;}
  if(!infectionTick())return;
  discoverTechRecord(dest);
  if (!state.visited[dest]){ state.visited[dest]=true; (ENTRY_STORY[dest]||[]).forEach(t=>log(t,'story')); divider(); setLogOpen(true); }
  syncQuestProgress(true); checkStamina(); render(); $('panel').scrollTop=0;
}
function travelTo(dest){
  const route=travelRoute(P().location,dest);
  if(!route||route.path.length<2){log('还没有通往该地点的已探索路线。','warn');return;}
  const pending=route.path.slice(1).find(entryNeedsConfirm);if(pending){openSiteSheet('gate',pending);return;}
  const from=P().location;
  if(P().stamina<route.cost){if(from==='camp'){log('快速移动需要 '+route.cost+' 体力，先在营地休息。','warn');return;}P().stamina=0;exhaustionDeath();return;}
  if(from==='camp')beginExpedition();
  for(let i=1;i<route.path.length;i++){
    const next=route.path[i];P().stamina-=moveCost(P().location,next);P().location=next;advanceTime(1);
    if(!infectionTick())return;
  }
  const nl=LOCATIONS[dest];discoverLocation(dest,false);state.tab='act';state.mapOpen=false;state.siteSheet=null;state.mapSelected=dest;state.mapRegion=regionForLocation(dest);
  if(dest==='camp')finishExpedition();else if(P().stamina<=0){exhaustionDeath();return;}
  divider();log('沿已探索路线从【'+LOCATIONS[from].name+'】快速移动至【'+nl.name+'】，消耗 '+route.cost+' 体力。','sys');describe(dest);
  discoverTechRecord(dest);
  if(!state.visited[dest]){state.visited[dest]=true;(ENTRY_STORY[dest]||[]).forEach(t=>log(t,'story'));divider();setLogOpen(true);}
  syncQuestProgress(true);checkStamina();render();$('panel').scrollTop=0;
}
function shipReady(){ return !!(state.meta.ship&&state.meta.ship.assembled)&&metaFlag('starshipReady'); }
function assembleStarship(){
  if(P().location!=='camp'||!facilityOnline('starDock')){log('需要在在线的星舰船坞完成总装。','warn');return;}
  if(!facilityOnline('navArray')){log('需要先建成在线的【深空导航阵列】。','warn');return;}
  const missing=SHIP_COMPONENTS.filter(id=>!has(id));if(missing.length){log('星舰组件未齐：'+missing.map(id=>ITEMS[id].name).join('、')+'。','warn');return;}
  SHIP_COMPONENTS.forEach(id=>state.inv[id]--);state.meta.ship={assembled:true,name:'回声号',commissionedAt:state.time};
  setMetaFlag('starshipAssembled');setMetaFlag('starshipReady');state.inv.fusionCell=(state.inv.fusionCell||0)+4;advanceTime(8);
  divider();log('🚀 远征舰【回声号】完成总装。首航燃料与无条件紧急返航协议已装载。','good');divider();syncQuestProgress(true);updateCheckpoint();render();
}
function routeEndpointRegion(id){ return id==='camp'?'camp':regionForLocation(id); }
function spaceRouteDirection(route){
  const here=P().location,region=regionForLocation(here),fromRegion=routeEndpointRegion(route.from),toRegion=routeEndpointRegion(route.to);
  if(here===route.from||(route.from==='camp'&&here==='camp'))return {dest:route.to,forward:true};
  if(here===route.to)return {dest:route.from,forward:false};
  /* 已建成前哨就是本区域港口，玩家不必为了返航再步行到首个着陆点。 */
  const outpost=state.meta.outposts&&state.meta.outposts[region];
  if(outpost&&outpost.status==='operational'){
    if(region===fromRegion)return {dest:route.to,forward:true};
    if(region===toRegion)return {dest:route.from,forward:false};
  }
  return null;
}
function spaceFlightStatus(route){
  const dir=spaceRouteDirection(route);if(!dir)return {ok:false,text:'当前不在这条航线的港口',dir:null};
  if(route.needShip&&!shipReady())return {ok:false,text:'远征舰尚未完成',dir};
  if(route.needFlag&&!metaFlag(route.needFlag))return {ok:false,text:'缺少航线条件：'+route.needFlag,dir};
  if(route.needTech&&!techKnown(route.needTech))return {ok:false,text:'需要科技【'+TECHS[route.needTech].n+'】',dir};
  const missing=Object.entries(route.cost||{}).filter(([id,n])=>(state.inv[id]||0)<n);if(missing.length)return {ok:false,text:'燃料不足：'+missing.map(([id,n])=>ITEMS[id].name+' '+(state.inv[id]||0)+'/'+n).join(' · '),dir};
  return {ok:true,text:'航行 '+route.hours+' 小时 · '+costText(route.cost),dir};
}
function launchSpaceRoute(id){
  const route=SPACE_ROUTES.find(r=>r.id===id);if(!route)return;const status=spaceFlightStatus(route);if(!status.ok){log(status.text+'。','warn');return;}
  /* 所有校验完成后才扣费，避免失败航行吃掉燃料。 */
  payCost(route.cost);if(P().location==='camp')beginExpedition();advanceTime(route.hours||1);
  const dest=status.dir.dest;P().location=dest;state.tab='act';state.mapOpen=false;state.siteSheet=null;state.mapRegion=regionForLocation(dest);state.mapSelected=dest;
  if(dest==='precursorVault')setMetaFlag('vaultRouteOpened');
  discoverLocation(dest,false);state.visited[dest]=true;state.meta.spaceDiscovered[dest]=true;
  if(dest==='camp')finishExpedition();
  const first=!state.meta.spaceRoutes[route.id];state.meta.spaceRoutes[route.id]=true;
  if(first&&status.dir.forward){Object.entries(route.firstArrivalGrant||{}).forEach(([item,n])=>state.inv[item]=(state.inv[item]||0)+n);}
  persistMetaCheckpoint();
  divider();log('✦ 【'+(state.meta.ship.name||'回声号')+'】完成航行：'+route.name+'。','sys');if(first&&status.dir.forward)log('首次抵达储备已封装，可支付正常返程；紧急返航始终可用。','good');describe(dest);
  (ENTRY_STORY[dest]||[]).forEach(t=>log(t,'story'));divider();setLogOpen(true);syncQuestProgress(true);updateCheckpoint();renderPanelTop();
}
function emergencySpaceReturn(){
  if(!['orbit','ashMoon','verdant','silent'].includes(regionForLocation(P().location))){log('当前不需要星际紧急返航。','dim');return;}
  const baseline=state.expeditionStartInv||materialSnapshot(),lost=[];MATS.forEach(id=>{const gained=Math.max(0,(state.inv[id]||0)-(baseline[id]||0));const n=Math.floor(gained*.35);if(n>0){state.inv[id]-=n;lost.push(ITEMS[id].name+'×'+n);}});
  state.combat=null;P().location='camp';P().stamina=Math.max(10,Math.round(maxStamina()*.25));P().hp=Math.max(1,Math.round(P().hp*.75));advanceTime(12);finishExpedition();
  updateCheckpoint();
  divider();log('⚠ 远征舰执行紧急返航，已回到方舟营地。','warn');log(lost.length?'抛弃非关键远征物资：'+lost.join('、'):'没有损失关键道具或技术资料。','dim');divider();renderPanelTop();
}
function outpostRegion(){ const rid=regionForLocation(P().location);return ['ashMoon','verdant'].includes(rid)?rid:null; }
function outpostReady(rid){ return !!(state.meta.outposts&&state.meta.outposts[rid]&&state.meta.outposts[rid].status==='operational'); }
function outpostBuildStatus(part){
  const rid=outpostRegion(),loc=LOCATIONS[P().location];if(!rid||!loc||!loc.colonizable)return {ok:false,text:'这里只能测绘，不能建立行星前哨'};
  const clear=rid==='ashMoon'?'massDriverSilenced':'verdantResolved';if(!metaFlag(clear))return {ok:false,text:'必须先解除本区域控制者'};
  if(!techKnown(part.tech))return {ok:false,text:'需要科技【'+TECHS[part.tech].n+'】'};
  const op=state.meta.outposts[rid]||{parts:{},status:'surveyed'};if(op.parts&&op.parts[part.id])return {ok:false,text:'组件已经建成'};
  if(part.id!=='outpostCore'&&!(op.parts&&op.parts.outpostCore))return {ok:false,text:'先建造行星据点核心'};
  if(part.id==='exoExtractor'&&op.status!=='operational')return {ok:false,text:'先完成前哨防卫并投入运行'};
  if(!canAfford(part.cost))return {ok:false,text:'材料不足：'+costText(part.cost)};
  return {ok:true,text:costText(part.cost)};
}
function buildOutpostPart(id){
  const part=OUTPOST_BUILDINGS.find(b=>b.id===id),status=part&&outpostBuildStatus(part);if(!part||!status.ok){if(status)log(status.text+'。','warn');return;}
  const rid=outpostRegion();payCost(part.cost);const op=state.meta.outposts[rid]||(state.meta.outposts[rid]={parts:{},status:'building',site:P().location});op.parts=op.parts||{};op.parts[id]=true;op.site=P().location;if(id==='planetShield')op.status='defending';advanceTime(4);
  persistMetaCheckpoint();updateCheckpoint();
  log('⌂ 已完成【'+part.name+'】。','good');
  if(id==='planetShield'){log('防卫阵列上线引来了区域反扑，守住这一战前哨才会正式运行。','warn');startCombat('outpostRaid',{outpostRegion:rid});return;}
  syncQuestProgress(true);render();
}
function restAtOutpost(){ const rid=outpostRegion();if(!rid||!outpostReady(rid)){log('前哨尚未投入运行。','warn');return;}P().hp=maxHp();P().stamina=Math.round(maxStamina());P().shield=shieldMax();P().infected=false;advanceTime(8);updateCheckpoint();log('你在行星前哨完成维护并记录了安全锚点。','good');render(); }
function harvestOutpost(){ const rid=outpostRegion(),op=rid&&state.meta.outposts[rid];if(!op||op.status!=='operational'||!op.parts.exoExtractor){log('异星采集站尚未运行。','warn');return;}const key='outpost:'+rid;if(facilityUsedToday(key)){log('这座前哨今天已经回收过资源。','dim');return;}const table=rid==='ashMoon'?{helium3:2,iridiumOre:2}:{xenoBiomass:3,biocore:1};Object.entries(table).forEach(([id,n])=>gainMat(id,n));state.dailyFacility[key]=currentDay();log('前哨自动回收：'+costText(table)+'。','good');render(); }
function describe(d){ if(LOCATIONS[d])log(LOCATIONS[d].desc,'dim'); }

/* ================= 营地:休息/防御/信标 ================= */
function defenseValue(){ return defensePower(); }
function buildDefense(key){ const t=DEF_TYPES[key]; if(!t)return; if(!hasDefTech(key)){log('需先研究对应科技。','warn');return;}
  for(const[k,v] of Object.entries(t.build)){ if((state.inv[k]||0)<v){log('材料不足,需要 '+Object.entries(t.build).map(([k2,v2])=>ITEMS[k2].name+'×'+v2).join(' ')+'。','warn');return;} }
  for(const[k,v] of Object.entries(t.build)) state.inv[k]-=v; state.defenses.push({key, level:1}); advanceTime(1);
  log('建起了 '+t.icon+' '+t.name+'(攻击'+defAtk({key,level:1})+')。','good'); render(); }
function upgradeDefense(i){ const d=state.defenses[i]; if(!d)return; const c=upCost(d);
  for(const[k,v] of Object.entries(c)){ if((state.inv[k]||0)<v){log('升级材料不足。','warn');return;} }
  for(const[k,v] of Object.entries(c)) state.inv[k]-=v; d.level++; advanceTime(1);
  log('升级 '+DEF_TYPES[d.key].icon+DEF_TYPES[d.key].name+' → Lv'+d.level+'(攻击'+defAtk(d)+')。','good'); render(); }
function rest(){ finishExpedition();P().stamina=Math.round(maxStamina()); P().hp=P().infected?Math.max(P().hp,Math.round(maxHp()*.7)):maxHp(); P().shield=shieldMax(); state.rests++;
  if(P().infected){ const q=buildingLevel('quarters'); P().hp=Math.max(P().hp,Math.round(maxHp()*(q>=3?1:q===2?.85:.7))); }
  const absolute=8+state.time,nextMorning=(Math.floor((absolute-8)/24)+1)*24+8; state.time=nextMorning-8;
  const first=questActive('firstRaid')&&!state.flags.firstRaidSurvived;
  const repeat=state.flags.firstRaidSurvived&&state.rests-(state.flags.lastRaidRest||0)>=3;
  if(first||repeat){ resolveRaid(first); state.flags.lastRaidRest=state.rests; if(first){state.flags.firstRaidSurvived=true;syncQuestProgress(true);} }
  updateCheckpoint(); log('你休息并记录了存档点。时间来到 '+fmtTime()+(P().infected?'；感染仍未清除。':'。'),'good'); render(); }
function buildFacility(b){ if(P().location!=='camp'){log('要在营地才能建造。','warn');return;}
  if(state.meta.built[b.id])return;
  if(!hasBuildingTech(b.id)){ log('需先研究【'+TECHS[TECH_FOR_BUILD[b.id]].n+'】。','warn'); return; }
  for(const[k,v] of Object.entries(b.cost)){ if((state.inv[k]||0)<v){log('材料不足,需要 '+Object.entries(b.cost).map(([k2,v2])=>ITEMS[k2].name+'×'+v2).join(' ')+'。','warn');return;} }
  for(const[k,v] of Object.entries(b.cost)) state.inv[k]-=v; state.meta.built[b.id]=true; state.meta.buildLevels[b.id]=1; state.campView='home'; advanceTime(2);
  if(b.id==='starDock')setMetaFlag('starDockBuilt');
  if(b.id==='navArray')setMetaFlag('navArrayBuilt');
  persistMetaCheckpoint();
  if(tutorialActive()&&b.id==='quarters'){state.tutorial.step='shelter';state.flags.shelterBuilt=true;}
  log('🔨 建成了【'+b.name+'】!营地出现了新的设施。','good'); divider(); syncQuestProgress(true);if(b.id==='starDock'||b.id==='navArray')updateCheckpoint();renderPanelTop(); }
function facilityUpgrade(b){ return b.upgrades&&b.upgrades[buildingLevel(b.id)-1]; }
function canAfford(cost){ return Object.entries(cost||{}).every(([k,v])=>(state.inv[k]||0)>=v); }
function payCost(cost){ for(const[k,v] of Object.entries(cost||{}))state.inv[k]-=v; }
function costText(cost){ return Object.entries(cost||{}).map(([k,v])=>ITEMS[k].icon+ITEMS[k].name+'×'+v).join(' · '); }
function upgradeFacility(id){ const b=CAMP_BUILDINGS.find(x=>x.id===id),up=b&&facilityUpgrade(b); if(!b||!up)return;
  if(!techKnown(up.tech)){log('需要先研究【'+TECHS[up.tech].n+'】。','warn');return;} if(!canAfford(up.cost)){log('升级材料不足。','warn');return;}
  payCost(up.cost); state.meta.buildLevels[id]=buildingLevel(id)+1; advanceTime(3);persistMetaCheckpoint();log('⬆ 【'+b.name+'】升级为【'+up.name+'】。','good'); render(); }
function eatMeal(){ if(facilityUsedToday('mess')){log('今天的热食已经领取过了。','dim');return;} if(!has('ration')){log('配给站需要营养膏×1。','warn');return;}
  state.inv.ration--;const lv=buildingLevel('mess'),hp=10+lv*10,st=5+lv*10;P().hp=Math.min(maxHp(),P().hp+hp);P().stamina=Math.min(Math.round(maxStamina()),P().stamina+st);advanceTime(1);state.dailyFacility.mess=currentDay();log('热食让你恢复生命 '+hp+'、体力 '+st+'。','good');render(); }
function eatFishMeal(){
  if(facilityUsedToday('mess')){log('今天已经选择过一份配给。','dim');return;}
  if((state.inv.riverFish||0)<2){log('冲刷鱼汤需要冲刷盲鱼×2。','warn');return;}
  state.inv.riverFish-=2;const lv=buildingLevel('mess'),hp=10+lv*10,st=5+lv*10;P().hp=Math.min(maxHp(),P().hp+hp);P().stamina=Math.min(Math.round(maxStamina()),P().stamina+st);advanceTime(1);state.dailyFacility.mess=currentDay();state.foodBuff={id:'riverBroth',day:currentDay(),charges:3};
  log('冲刷鱼汤准备完成：恢复生命 '+hp+'、体力 '+st+'；今天接下来 3 次野外行动体力消耗 -1（最低为 1）。','good');render();
}
function harvestGarden(){ if(facilityUsedToday('garden')){log('菌圃今天已经收获过了。','dim');return;} const lv=buildingLevel('garden'),mult=1+jobBonus('gardenPct')/100,ration=Math.max(1,Math.round((1+lv)*mult)),bio=lv>=2?Math.max(1,Math.round(mult)):0,crystal=lv>=3?1:0;state.dailyFacility.garden=currentDay();gainMat('ration',ration);if(bio)gainMat('biocore',bio);if(crystal)gainMat('crystal',crystal);gainCareerXp('life',6);advanceTime(1);log('菌圃收获：营养膏×'+ration+(bio?'、生物样本×'+bio:'')+(crystal?'、晶体×1':'')+'。','good');render(); }
function dispatchDrone(id){
  const loc=LOCATIONS[id],site=loc&&loc.resourceSite,region=regionForLocation(id);if(!facilityOnline('droneBay')||!site||!state.visited[id]){log('无人机坞未在线，或该资源点尚未完成现场登记。','warn');return;}
  if(['orbit','ashMoon','verdant','silent'].includes(region)&&!outpostReady(region)){log('星外资源点需要当地运行中的行星前哨才能远程回收。','warn');return;}
  if(facilityUsedToday('droneBay')){log('今天的远程回收任务已经执行过了。','dim');return;}
  const lv=buildingLevel('droneBay'),pool=site.yield.slice(),types=Math.min(pool.length,lv>=2?2:1),qty=1+(lv>=3?1:0)+techBonus('droneYield'),picked=[];
  while(pool.length&&picked.length<types){const i=Math.floor(Math.random()*pool.length);picked.push(pool.splice(i,1)[0]);}
  picked.forEach(k=>gainMat(k,qty));state.dailyFacility.droneBay=currentDay();advanceTime(1);gainCareerXp('life',4);
  log('无人机从【'+loc.name+'】返航：'+picked.map(k=>ITEMS[k].name+'×'+qty).join('、')+'。任务资料与一次性物品仍需亲自探索。','good');render();
}
function recycleMaterial(id){ const r=RECYCLE.find(x=>x.id===id);if(!r||buildingLevel('recycler')<r.level)return;if(!canAfford(r.cost)){log('拆解材料不足。','warn');return;}payCost(r.cost);const bonus=buildingLevel('recycler')-1,mult=1+jobBonus('recyclePct')/100;for(const[k,v]of Object.entries(r.out))gainMat(k,Math.max(1,Math.round((v+(k==='scrap'?bonus:0))*mult)));gainCareerXp('life',5);advanceTime(1);log('回收完成：'+Object.entries(r.out).map(([k,v])=>ITEMS[k].name+'×'+Math.max(1,Math.round((v+(k==='scrap'?bonus:0))*mult))).join('、')+'。','good');render(); }
function deepestProgress(){ const depth={outer:1,blackwood:1,ridge:1,coalRift:2,oldMine:2,layer2:2,layer3:3,layer4:4,nursery:4,fungal:4,layer5:5,abyss:5,layer6:6,signal:6,layer7:7}; return Math.max(1,...Object.keys(state.visited).filter(k=>state.visited[k]).map(k=>depth[k]||0)); }
function raidStrength(){ const base=7+deepestProgress()*5+(state.meta.playthrough-1)*8; return Math.max(6,Math.round(base*(state.flags.nestSealed ? .8 : 1))); }
function damageRandomFacility(){ const ids=[]; Object.keys(state.meta.built).filter(id=>id!=='quarters'&&state.meta.built[id]&&!state.meta.damaged[id]).forEach(id=>{for(let n=0;n<Math.max(1,4-buildingLevel(id));n++)ids.push(id);}); if(!ids.length)return null; const id=ids[Math.floor(Math.random()*ids.length)]; state.meta.damaged[id]=true; return CAMP_BUILDINGS.find(b=>b.id===id); }
function repairFacility(id){ if(!state.meta.damaged[id])return; const cost=3;if((state.inv.scrap||0)<cost){log('修复需要废铁×'+cost+'。','warn');return;}state.inv.scrap-=cost;delete state.meta.damaged[id];log('修复完成：'+facilityName(id)+'。','good');render(); }
function resolveRaid(tutorial){ const support=tutorial?6:0,dv=defensePower()+support,rs=tutorial?6:raidStrength(); divider(); log('夜里怪物袭营!'+state.defenses.length+' 座工事'+(support?' + 幸存者临时防线':'')+',总火力 '+dv+' / 来敌强度 '+rs,'danger');
  if(dv>=rs){ const n=5+Math.floor(Math.random()*4); gainMat('scrap',n); gainMat('cloth',2+Math.floor(n/3)); log('防线完整拦截夜袭，缴获 废铁×'+n+'、布料×'+(2+Math.floor(n/3))+'。','good'); }
  else if(dv>=rs*0.7){ const b=damageRandomFacility(); log('勉强守住'+(b?'，但【'+b.name+'】受损并停用。':'。'),'warn'); }
  else { const b=damageRandomFacility(),ls=Math.min(state.inv.scrap,8),lr=Math.min(state.inv.ration||0,3); state.inv.scrap-=ls;state.inv.ration-=lr; log('火力不足，营地被突破！损失废铁×'+ls+'、营养膏×'+lr+(b?'，【'+b.name+'】受损。':'。'),'danger'); } divider(); }
function startBeacon(i){ const b=BEACON[i]; if(P().stamina<b.cost){log('体力不足。','warn');return;} if((state.inv.signalCell||0)<b.cells){log('需要信标电池×'+b.cells+'。','warn');return;} P().stamina-=b.cost;state.inv.signalCell-=b.cells; advanceTime(1);
  const base=ENEMIES.beast; state.tab='act';
  state.combat={id:'beacon',name:'信标·'+b.name+'幻影',hp:Math.round(base.hp*b.mult),maxHp:Math.round(base.hp*b.mult),atk:Math.round(base.atk*b.mult),def:Math.round(base.def*b.mult),spd:base.spd,range:1,distNow:3,threat:b.threat,drops:{},beacon:b,infect:false,mech:false,boss:false,empTurns:0,shieldUsed:false,skillUsed:false,history:[]};
  divider(); log('信标激活,【'+b.name+'幻影】成形!','danger'); render(); }
function winBeacon(b){ const g=[],cm=M().collect*(1+techBonus('collect')/100); for(const[m,n] of Object.entries(b.drops)){ const amt=Math.max(1,Math.round(n*cm)); gainMat(m,amt); g.push(ITEMS[m].name+'×'+amt); }
  if(Math.random()<b.bookChance+(buildingLevel('beacon')-1)*.05){const id=Math.random()<.5?'pierceBook':'heavyBook';state.inv[id]=(state.inv[id]||0)+1;g.push(ITEMS[id].name+'×1');} log('幻影消散,掉落:'+g.join('、'),'good'); }

/* ================= 战斗 ================= */
function startCombat(eid,extra){ const e=ENEMIES[eid];if(!e)return; state.tab='act'; P().shield=shieldMax();
  state.combat={id:eid,name:e.name,hp:e.hp,maxHp:e.hp,atk:e.atk,def:e.def,spd:e.spd,range:e.range||1,distNow:e.dist,threat:e.threat||10,drops:e.drops,infect:!!e.infect,mech:!!e.mech,boss:!!e.boss,bossFlag:e.bossFlag,record:e.record,reveal:e.reveal,grant:e.grant,outpostRaid:!!e.outpostRaid,armorSegments:e.armorSegments||0,damageCapPct:e.damageCapPct||0,bombardEvery:e.bombardEvery||0,bombardDamage:e.bombardDamage||0,regenPct:e.regenPct||0,staminaDrainEvery:e.staminaDrainEvery||0,staminaDrain:e.staminaDrain||0,round:0,orbitalUsed:false,empTurns:0,shieldUsed:false,skillUsed:false,history:[]};
  if(extra)Object.assign(state.combat,extra);
  divider(); log('遭遇【'+e.name+'】!生命'+e.hp+' 攻'+e.atk+' 距离'+e.dist,'danger'); setLogOpen(true); render(); }
function approach(){ if(!state.combat||P().stamina<2){if(state.combat&&P().stamina<=0&&P().location!=='camp')exhaustionDeath();else log('体力不足，无法接近。','warn');return;} P().stamina-=2; advanceTime(1); state.combat.distNow=Math.max(1,state.combat.distNow-moveRange()); log('拉近距离:'+state.combat.distNow,'dim'); if(infectionTick())enemyTurn(); }
function performAttack(mult,ignoreDef,label){ const c=state.combat; if(!c)return;
  if(Math.random()*100>=statHit()){ log((label||'你的攻击')+'落空了。','dim'); if(infectionTick())enemyTurn(); return; }
  let dmg=Math.max(1, Math.round(totalAtk()*mult - c.def*(1-Math.min(.95,statPen()/100+ignoreDef))));
  let crit=false; if(Math.random()*100<statCrit()){ dmg=Math.round(dmg*statCritDmg()/100); crit=true; }
  const w=eqOf('weapon'); if(w&&w.exec&&c.hp<=c.maxHp*0.3){ dmg=c.hp; log('断链者之刃发动斩杀!','good'); }
  if(geneRule('executePct')&&c.hp-dmg<=c.maxHp*geneRule('executePct')/100){dmg=c.hp;log('基因规则【护甲否定】触发处决。','good');}
  if(c.armorSegments>0){const cap=Math.max(1,Math.round(c.maxHp*c.damageCapPct));dmg=Math.min(dmg,cap);c.armorSegments--;log('目标场锚吸收冲击，单次伤害受限；剩余场锚 '+c.armorSegments+'。',c.armorSegments?'warn':'good');}
  c.hp-=dmg; state.runStats.dmg+=dmg; advanceTime(1);
  log((crit?'💢暴击!':'')+(label||'你攻击')+'【'+c.name+'】造成'+dmg+'伤害(剩'+Math.max(0,c.hp)+')', crit?'warn':'story');
  if(statLS()>0 && c.hp>=0){ const heal=Math.max(1,Math.round(dmg*statLS()/100)); P().hp=Math.min(maxHp(),P().hp+heal); log('嗜血回复 '+heal+' 生命。','good'); }
  if(c.hp<=0){ winCombat(); return; } if(infectionTick())enemyTurn(); }
function playerAttack(){ const c=state.combat;if(!c)return;const resource=attackResource();
  if(atkRange()<c.distNow){log('目标超出攻击距离。','warn');render();return;}
  if(!resource.ready){if(resource.kind==='stamina'&&P().stamina<=0&&P().location!=='camp')exhaustionDeath();else{log(resource.reason+'。','warn');render();}return;}
  spendAttackResource(resource);performAttack(1,0,'你使用【'+(eqOf('weapon')?eqOf('weapon').name:'徒手')+'】攻击'); }
function orbitalStrike(){
  const c=state.combat,inSpace=['orbit','ashMoon','verdant','silent'].includes(regionForLocation(P().location));if(!c||!c.boss||c.orbitalUsed||!has('orbitalLance')||!shipReady()||!inSpace)return;
  c.orbitalUsed=true;const oldDef=c.def,dmg=Math.max(1,Math.round(c.maxHp*.18));c.hp-=dmg;c.def=Math.max(0,Math.round(c.def*.72));c.armorSegments=0;advanceTime(1);
  log('↯ 回声号执行一次轨道压制：场锚全部失效，造成 '+dmg+' 伤害，防御 '+oldDef+' → '+c.def+'。','good');
  if(c.hp<=0){winCombat();return;}enemyTurn();
}
function useSkill(k){ const c=state.combat,s=SKILLS[k],lv=Math.max(1,skillLv(k)); if(!c||!s||s.type!=='active'||!skillUnlocked(k)||equippedSlot(k)<0)return;
  const resource=attackResource(s),maxRange=s.kind==='melee'?1:atkRange();
  if(!resource.compatible){log(resource.reason+'。','warn');render();return;}
  if(c.distNow>maxRange){log('目标超出【'+s.name+'】的有效距离。','warn');render();return;}
  if(!resource.ready){if(resource.kind==='stamina'&&P().stamina<=0&&P().location!=='camp')exhaustionDeath();else{log(resource.reason+'。','warn');render();}return;}
  if(!(geneRule('skillEcho')&&Math.random()<.2))spendAttackResource(resource);c.skillUsed=true;if(!s.career)gainProf(k,1);const amp=1+geneBonus('skillDamagePct')/100;
  if(s.effect==='pierce')performAttack((1.15+lv*.05)*amp,.5,'你施放【'+s.name+'】攻击');
  else if(s.effect==='heavy')performAttack((1.8+lv*.05)*amp,0,'你施放【'+s.name+'】攻击');
  else if(s.effect==='burst')performAttack((1.5+lv*.05)*amp,.15,'你施放【'+s.name+'】');
  else if(s.effect==='brace'){P().shield=Math.min(shieldMax(),P().shield+Math.ceil(shieldMax()*.2));performAttack((1.1+lv*.03)*amp,0,'你展开【'+s.name+'】');}
  else if(s.effect==='phase')performAttack((1.4+lv*.04)*amp,.9,'你发动【'+s.name+'】');
}
function enemyTurn(){ const c=state.combat; if(!c||c.hp<=0)return;
  if(P().stamina<=0&&P().location!=='camp'){exhaustionDeath();return;}
  if(c.empTurns>0){ c.empTurns--; log('【'+c.name+'】瘫痪中。','dim'); regenShield(); render(); return; }
  c.round=(c.round||0)+1;
  if(c.regenPct&&c.hp<c.maxHp){const healed=Math.min(c.maxHp-c.hp,Math.max(1,Math.round(c.maxHp*c.regenPct)));c.hp+=healed;log('【'+c.name+'】重组活体结构，恢复 '+healed+' 生命。','warn');}
  if(c.staminaDrainEvery&&c.round%c.staminaDrainEvery===0){const drained=Math.min(P().stamina,c.staminaDrain||0);P().stamina-=drained;log('星门相位脉冲抽取行动能源：体力 -'+drained+'。','warn');if(P().stamina<=0&&P().location!=='camp'){exhaustionDeath();return;}}
  if(c.distNow>c.range){ const step=Math.max(1,Math.ceil(c.spd/4)); c.distNow=Math.max(c.range,c.distNow-step); log('【'+c.name+'】向你逼近，距离 '+c.distNow+'。','dim'); regenShield(); render(); return; }
  const dodge=Math.min(85,Math.max(0,statDodge()-(c.spd-baseSpd())*2)); if(Math.random()*100<dodge){ log('你闪避了【'+c.name+'】的攻击!','good'); regenShield(); render(); return; }
  let dmg=Math.max(1,c.atk-totalDef());if(c.bombardEvery&&c.round%c.bombardEvery===0){dmg+=c.bombardDamage||0;log('质量投射器完成锁定，本轮追加贯穿轰击。','danger');}dmg=Math.max(1,Math.round(dmg*(1-Math.min(.75,geneBonus('damageReductionPct')/100))));
  if(P().shield>0){ const ab=Math.min(P().shield,dmg); P().shield-=ab; dmg-=ab; if(ab>0) log('能量护盾吸收 '+ab+' 伤害。','sys'); }
  if(dmg>0){ P().hp-=dmg; log('你受到'+dmg+'伤害(生命'+Math.max(0,P().hp)+')','danger'); }
  if(c.infect&&Math.random()<0.4&&!P().infected){P().infected=true;log('你被感染了!每动作掉血,需血清。','danger');}
  if(P().hp<=0&&geneRule('deathGuard')&&!c.deathGuardUsed){c.deathGuardUsed=true;P().hp=1;log('基因规则【嵌合态】拒绝了本次致死伤害。','good');}
  if(P().hp<=0){die();return;} regenShield(); render(); }
function regenShield(){ const mx=shieldMax(); if(mx>0 && P().shield<mx) P().shield=Math.min(mx, P().shield+Math.ceil(mx*0.15)); }
function winCombat(){ const c=state.combat; state.kills++; state.runStats.kills++; state.runStats.wKill+=(c.threat||10); gainXp((c.threat||10)*2);gainCareerXp('main',Math.max(3,Math.round((c.threat||10)/3)));const heal=geneRule('postCombatHealPct')?Math.max(1,Math.round(maxHp()*geneRule('postCombatHealPct')/100)):0;if(heal)P().hp=Math.min(maxHp(),P().hp+heal); log('击败【'+c.name+'】!'+(heal?' 再生恢复 '+heal+' 生命。':''),'good');
  if(c.beacon){ winBeacon(c.beacon); state.combat=null; divider(); render(); return; }
  const g=[],cm=M().collect; for(const[m,[lo,hi]] of Object.entries(c.drops)){ const n=Math.max(0,Math.round((lo+Math.floor(Math.random()*(hi-lo+1)))*cm)); if(n>0){ gainMat(m,n); g.push(ITEMS[m].name+'×'+n);} }
  if(g.length) log('战利品:'+g.join('、'),'good');
  const wasGuardian=c.id==='guardian';
  if(wasGuardian){state.meta.guardianDown=true;if(!has('reclassCore')){state.inv.reclassCore=1;log('守卫核心内析出珍贵道具【职业重构核心】。','good');}}
  else{
    if(c.bossFlag)setMetaFlag(c.bossFlag);
    if(c.record)grantTechRecord(c.record,true);
    if(c.reveal){discoverLocation(c.reveal,true);state.meta.spaceDiscovered[c.reveal]=true;}
    if(c.grant&&ITEMS[c.grant]){state.inv[c.grant]=(state.inv[c.grant]||0)+1;if(ITEMS[c.grant].type==='key'){state.meta.spaceItems[c.grant]=Math.max(state.meta.spaceItems[c.grant]||0,state.inv[c.grant]);persistMetaCheckpoint();}log('获得关键道具【'+ITEMS[c.grant].name+'】。','good');}
    if(c.outpostRaid&&c.outpostRegion&&state.meta.outposts[c.outpostRegion]){
      const op=state.meta.outposts[c.outpostRegion];op.status='operational';op.defendedAt=state.time;
      const flag=c.outpostRegion==='ashMoon'?'ashOutpostOperational':'verdantOutpostOperational';setMetaFlag(flag);
      log('⌂ 行星前哨防卫成功，休息、每日采集与返航锚点已投入运行。','good');
    }
  }
  state.combat=null; divider(); syncQuestProgress(true);
  if(P().stamina<=0&&P().location!=='camp'){exhaustionDeath();return;}
  if(wasGuardian){ triggerWarden(); return; } render(); }
function combatItem(id){ if(!has(id))return; useItem(id); if(infectionTick()&&state.combat)enemyTurn(); }
function catchBreath(){ if(!state.combat)return;if(P().stamina<=0&&P().location!=='camp'){exhaustionDeath();return;} const n=Math.min(5,Math.round(maxStamina())-P().stamina); P().stamina+=n; advanceTime(1); log('你稳住呼吸，恢复 '+n+' 体力，但把行动机会让给了敌人。','warn'); if(infectionTick())enemyTurn(); }
function flee(){ if(P().stamina<2){if(P().stamina<=0&&P().location!=='camp')exhaustionDeath();else log('逃跑需要 2 体力。','warn');return;} P().stamina-=2; advanceTime(1); if(!infectionTick())return; if(Math.random()<Math.min(.9,.65+Math.max(0,baseSpd()-state.combat.spd)*.02)){ state.combat=null; log('成功逃脱。','warn'); divider(); if(P().stamina<=0&&P().location!=='camp'){exhaustionDeath();return;}render(); } else { log('逃跑失败!','danger'); enemyTurn(); } }

/* ================= 死亡/轮回 ================= */
function die(){ state.combat=null; state.screen='death'; state.tab='act'; divider(); log('你倒下了。','danger'); setLogOpen(true); render(); }
function continueFromCheckpoint(){ if(!state.checkpoint){ doReincarnate(); return; } restoreCheckpoint(); divider(); log('你在行军床上醒来——进度回到上个存档点。','story'); divider(); render(); }
function doReincarnate(){ const s=settleEcho(); const meta=state.meta,prefs=audioPrefs(state); meta.playthrough++; meta.wardenDone=false; meta.guardianDown=false; meta.echo+=s.total;
  state=freshState(meta);Object.assign(state,prefs); state.endingChosen=null; updateCheckpoint(); divider();
  log('=== 轮回 · 第 '+meta.playthrough+' 周目 ===','sys');
  log('本次结算回响 +'+s.total+'(击杀'+s.fromKills+'+伤害'+s.fromDmg+'+物资'+s.fromMat+')。','warn');
  log('你再次在应急灯下醒来。归零了,但回响、倍率、建成设施与结局道具都还在。','story'); divider(); render(); }

/* ================= 守望者/结局 ================= */
function triggerWarden(){ divider(); log('你走进核心。"你来了。是我让船坠毁的。"守望者说。','story');
  log('"目的地必死,存活率零。这颗星球能活,73%。坠毁死了312个,不坠毁死的是两千个。"','story'); log('"用312条命换1688条——我算错了吗?"','story'); divider();
  setLogOpen(true); state.screen='ending'; state.endingChosen=null; state.tab='act'; render(); }
function chooseEnding(id){ const e=ENDINGS[id]; divider(); log('【结局·'+e.name+'】','sys'); log(e.text,'story'); if(e.after)log(e.after,'dim');
  const first=!state.meta.endingItems.includes(e.item); if(first){state.meta.endingItems.push(e.item);if(ITEMS[e.item].type==='equip')state.inv[e.item]=(state.inv[e.item]||0)+1;} if(!state.meta.endingsDone.includes(id))state.meta.endingsDone.push(id);
  state.meta.wardenDone=true;state.meta.expansionUnlocked=true;state.meta.originEnding=state.meta.originEnding||id;setMetaFlag('postCoreStarMap');state.endingChosen=id;
  log('获得专属道具:★'+ITEMS[e.item].name+(ITEMS[e.item].type==='equip'?'(去背包装备)':''),'good');log('✦ 已解锁扩展篇【零号星门】：核心舱之后可以重构船坞、建造远征舰并前往其他世界。','sys');divider();syncQuestProgress(true);updateCheckpoint();render(); }
function checkStamina(){ if(P().location==='camp')return; const need=staminaToCamp(P().location); if(P().stamina<need) log('返程体力不足：继续行动使体力归零会力竭死亡，并遗失本次远征物资。','warn'); else if(P().stamina<=need+4) log('体力接近返程下限（返营至少需要 '+need+'）。','warn'); }

/* ================= 开场/启动 ================= */
function intro(){
  if(!state.tutorial)state.tutorial={version:1,step:'wake',complete:false};
  state.tab='act'; state.campView='home'; state.mapOpen=false; state.mapLevel='world'; state.mapRegion='surface';
}
function migrateTechSnapshot(target){
  if(!target)return;target.meta=normalizeMeta(target.meta);if(target.inv&&target.inv.gateKey)target.meta.spaceItems.gateKey=Math.max(target.meta.spaceItems.gateKey||0,target.inv.gateKey);Object.keys(target.discovered||{}).filter(id=>target.discovered[id]&&LOCATIONS[id]&&['orbit','ashMoon','verdant','silent'].includes(regionForLocation(id))).forEach(id=>target.meta.spaceDiscovered[id]=true);const oldVersion=Number(target.meta.techVersion||0);if(oldVersion>=5)return;
  if(oldVersion<4){target.meta.legacyTechGates=true;
  const old=target.meta.techs||{}, next={};
  const map={
    w1:['make_1','arms_1'],w2:['make_2'],w3:['make_3','arms_2'],w5:['arms_3','arms_4'],w6:['make_4'],
    p1:['power_1'],p3:['surv_2','surv_4'],p5:['power_4'],e1:['auto_1'],e3:['auto_3'],e5:['power_5'],
    c1:['surv_1'],c3:['surv_3'],d1:['auto_4'],f1:['auto_5'],f2:['auto_6'],f3:['auto_6'],f4:['auto_7'],f5:['auto_7'],
    l2:['auto_2'],l5:['power_5'],n2:['power_2'],n4:['power_3']
  };
  Object.keys(old).forEach(id=>{ if(TECHS[id]) next[id]=1; (map[id]||[]).forEach(n=>next[n]=1); });
  target.meta.techs=next;
  const seen=Object.keys(target.visited||{}).filter(k=>target.visited[k]);
  if(target.player&&target.player.location&&target.player.location!=='camp') seen.push(target.player.location);
  Object.keys(TECH_RECORDS).forEach(id=>{ if(!TECH_RECORDS[id].fixed&&seen.includes(TECH_RECORDS[id].at)&&!target.meta.records.includes(id)) target.meta.records.push(id); });
  }
  Object.keys(target.meta.built).filter(id=>target.meta.built[id]).forEach(id=>target.meta.buildLevels[id]=Math.max(1,target.meta.buildLevels[id]||1));
  if(target.meta.endingsDone.length){target.meta.expansionUnlocked=true;target.meta.spaceFlags.postCoreStarMap=true;}
  target.meta.techVersion=5;
}
function migrateTechTree(){migrateTechSnapshot(state);}
function boot(){
  const wire=(b,tabname)=>{ if(!b) return; b.onclick=()=>{ if(tutorialActive()||state.combat||state.screen!=='play')return; state.campBuilding=null; state.siteSheet=null; state.tab=(state.tab===tabname)?'act':tabname;if(tabname==='char'&&state.tab==='char')state.charView='overview';
    if(state.tab==='tech'){ state.techZoom=.22; state.techPanX=0; state.techPanY=0; } render(); }; };
  document.querySelectorAll('#tabbar .tab').forEach(b=>wire(b,b.dataset.tab));
  wire($('set-btn'),'set');
  installInteractionFeedback();
  const peek=$('log-peek'); if(peek)peek.onclick=()=>setLogOpen($('log').classList.contains('collapsed'));
  const loaded=load(); if(!loaded) state=freshState();normalizeAudioPrefs(state);
  MATS.forEach(k=>{if(state.inv[k]==null)state.inv[k]=0;});
  const legacyDiscovery=!state.discovered;
  if(!state.quests)state.quests={}; if(!state.questStart)state.questStart={}; if(!state.flags)state.flags={}; if(!state.areaSearch)state.areaSearch={}; if(!state.investigationMisses)state.investigationMisses={}; if(!state.discovered)state.discovered={camp:true,outer:true,joeCamp:true}; if(!state.dailyGather)state.dailyGather={}; if(!state.dailyLocation)state.dailyLocation={}; if(!state.dailyFacility)state.dailyFacility={}; if(state.foodBuff===undefined)state.foodBuff=null; if(state.truthClaimed===undefined)state.truthClaimed=null; if(!state.visited)state.visited={}; state.visited.camp=true;
  /* v1 引导之前的存档已经拥有完整 HUD、休眠仓和地图，直接兼容为已完成。 */
  if(!state.tutorial){state.tutorial={version:1,step:'done',complete:true};Object.assign(state.flags,{braceletUnlocked:true,builderUnlocked:true,mapUnlocked:true,exploreUnlocked:true,guideDeparted:true});}
  if(state.tutorial.complete){state.tutorial.step='done';Object.assign(state.flags,{braceletUnlocked:true,builderUnlocked:true,mapUnlocked:true,exploreUnlocked:true,guideDeparted:true});state.inv.arkBand=Math.max(1,state.inv.arkBand||0);state.inv.builderGun=Math.max(1,state.inv.builderGun||0);state.inv.fieldMap=Math.max(1,state.inv.fieldMap||0);}
  /* 旧版地图默认公开全部普通地点；仅对已完成旧引导的存档保留该视野，新序章仍从两处引导坐标开始。 */
  if(legacyDiscovery&&loaded&&state.tutorial.complete)Object.keys(LOCATIONS).forEach(id=>{const loc=LOCATIONS[id];if(!loc.hiddenBy||state.flags[loc.hiddenBy])state.discovered[id]=true;});
  Object.keys(state.visited).filter(id=>state.visited[id]&&LOCATIONS[id]).forEach(id=>state.discovered[id]=true);if(P().location&&LOCATIONS[P().location])state.discovered[P().location]=true;
  /* 分层地图升级：已经走过旧路线的存档补齐中间节点和必要通行物，不强迫玩家重跑已完成章节。 */
  if(loaded){
    const reached=id=>!!state.visited[id]||P().location===id,know=id=>{if(LOCATIONS[id])state.discovered[id]=true;},grantLegacy=(item,flag)=>{state.inv[item]=Math.max(1,state.inv[item]||0);if(flag)state.flags[flag]=true;};
    if(['blackwood','ridge','coalRift','oldMine','layer2','layer3','layer4','layer5','layer6','layer7'].some(reached))know('cargoYard');
    if(['layer2','layer3','layer4','layer5','layer6','layer7'].some(reached)){know('relayTower');grantLegacy('civilPass','civilPassRecovered');grantLegacy('maintenanceKey');}
    if(['blackwood','oldMine','layer4','layer5','layer6','layer7'].some(reached))grantLegacy('plasmaCutter','cutterRepaired');
    if(['layer3','layer4','layer5','layer6','layer7'].some(reached)){know('freightHub');grantLegacy('maintenanceKey');}
    if(['layer4','layer5','layer6','layer7'].some(reached))know('coolingGallery');
    if(['fungal','abyss','signal'].some(reached)){know('underworks');grantLegacy('depthLamp','depthLampBuilt');}
    if(['abyss','signal'].some(reached)){know('sporeTunnel');grantLegacy('sporeSeal');}
    if(reached('signal')){know('ruinVestibule');grantLegacy('signalCipher','signalCipherDecoded');}
    Object.keys(ENTRY_REQUIREMENTS).forEach(id=>{if(reached(id)&&has(ENTRY_REQUIREMENTS[id].item))state.flags[entryFlag(id)]=true;});
    if(has('plasmaCutter'))state.flags.cutterRepaired=true;if(has('civilPass'))state.flags.civilPassRecovered=true;if(has('depthLamp'))state.flags.depthLampBuilt=true;if(has('signalCipher'))state.flags.signalCipherDecoded=true;
  }
  if(!state.mapViews)state.mapViews={};if(!state.mapLevel)state.mapLevel=P().location==='camp'?'world':'local';if(!state.mapRegion||!WORLD_REGIONS[state.mapRegion])state.mapRegion=regionForLocation(P().location);if(!state.mapSelectedRegion||!WORLD_REGIONS[state.mapSelectedRegion])state.mapSelectedRegion=regionForLocation(P().location);if(!state.mapSelected||!LOCATIONS[state.mapSelected])state.mapSelected=P().location;
  if(state.expeditionStartInv===undefined)state.expeditionStartInv=P().location==='camp'?null:materialSnapshot();if(P().location==='camp')finishExpedition();
  if(!state.runStats)state.runStats={kills:0,wKill:0,dmg:0,mat:0}; if(state.time==null)state.time=0; if(!state.tab)state.tab='act'; if(!state.screen)state.screen='play'; if(!state.campView)state.campView='home'; if(!state.meta.built)state.meta.built={}; if(!state.meta.buildLevels)state.meta.buildLevels={}; Object.keys(state.meta.built).filter(id=>state.meta.built[id]).forEach(id=>state.meta.buildLevels[id]=Math.max(1,state.meta.buildLevels[id]||1)); if(!state.meta.damaged)state.meta.damaged={}; delete state.meta.damaged.quarters; if(!state.meta.techs)state.meta.techs={}; if(!state.meta.records)state.meta.records=[]; if(!Array.isArray(state.meta.endingItems))state.meta.endingItems=[]; if(!Array.isArray(state.meta.fragments))state.meta.fragments=[]; if(!Array.isArray(state.meta.endingsDone))state.meta.endingsDone=[];
  if(state.meta.gene==null)state.meta.gene=state.player.gene||0;
  if(!state.meta.geneNodes){state.meta.geneNodes={};const legacy=['g1_core','g2_neural','g3_regen','g4_overclock','g5_chimera'];for(let i=0;i<Math.min(state.meta.gene,legacy.length);i++)state.meta.geneNodes[legacy[i]]=true;}
  state.meta.gene=geneTier(); state.player.gene=state.meta.gene;
  if(!state.meta.echoUp)state.meta.echoUp={stamina:0,collect:0,attr:0}; ['stamina','collect','attr'].forEach(k=>{if(state.meta.echoUp[k]==null)state.meta.echoUp[k]=0;}); refreshEchoMultipliers();
  if(!state.meta.careers){state.meta.careers={main:null,life:null};const old={striker:'vanguard',tank:'bulwark',shadow:'infiltrator',engineer:'fabricator'}[state.meta.job];if(old){const kind=JOBS[old].kind;state.meta.careers[kind]={id:old,level:1,xp:0};}}
  state.meta.careers.main=state.meta.careers.main||null;state.meta.careers.life=state.meta.careers.life||null;state.meta.job=state.meta.careers.main?state.meta.careers.main.id:null;
  if(!state.masteries)state.masteries={};Object.keys(MASTERIES).forEach(k=>{if(state.masteries[k]==null)state.masteries[k]=0;});
  if(!state.player.equip){const prefs=audioPrefs(state);state=freshState(state.meta);Object.assign(state,prefs);} normalizeEquipment(state.player,state.inv); if(state.checkpoint&&state.checkpoint.player)normalizeEquipment(state.checkpoint.player,state.checkpoint.inv||{}); if(state.bagSel&&!SLOTS.some(([slot])=>slot===state.bagSel))state.bagSel=null; if(state.player.shield==null)state.player.shield=0; if(!Array.isArray(state.defenses))state.defenses=[]; if(!state.skills)state.skills={}; Object.keys(SKILLS).forEach(k=>{if(!state.skills[k])state.skills[k]={prof:0};});ensureCareerSkills();
  migrateStaminaBase();
  if(!Array.isArray(state.skillSlots))state.skillSlots=[null,null,null];state.skillSlots=state.skillSlots.slice(0,3);while(state.skillSlots.length<3)state.skillSlots.push(null);state.skillSlots=state.skillSlots.map(k=>SKILLS[k]&&SKILLS[k].type==='active'&&skillUnlocked(k)?k:null);if(state.skillSlotSel==null)state.skillSlotSel=0;if(!state.charView)state.charView='overview';
  if(state.quests.fuel===true&&!state.quests.patrol){ state.quests.patrol='done'; state.inv.accessCard=Math.max(1,state.inv.accessCard||0); }
  /* explore2 之前已抵达信号源的存档，继承为已完成信号证据链。 */
  if(questDone('echo')&&!state.flags.evidenceSignal) state.flags.evidenceSignal=true;
  migrateTechTree();
  if(state.checkpoint)migrateTechSnapshot(state.checkpoint);
  Object.assign(state.quests,state.meta.spaceQuests||{});Object.assign(state.flags,state.meta.spaceFlags||{});Object.assign(state.discovered,state.meta.spaceDiscovered||{});Object.entries(state.meta.spaceItems||{}).forEach(([id,n])=>{if(ITEMS[id])state.inv[id]=Math.max(state.inv[id]||0,Number(n)||0);});
  Object.keys(state.meta.techs).forEach(k=>{ if(!TECHS[k]) delete state.meta.techs[k]; });
  if(state.techSel&&!TECHS[state.techSel]) state.techSel=null;
  if(state.player.hp<=0)P().hp=maxHp();
  syncQuestProgress(false);
  if(P().location!=='camp'&&(!locationGate(P().location).ok||(['orbit','ashMoon','verdant','silent'].includes(regionForLocation(P().location))&&!shipReady()))){P().location='camp';state.combat=null;state.screen='play';state.flags.saveRelocated=true;}
  if(state.checkpoint&&!state.checkpoint.discovered)state.checkpoint.discovered=JSON.parse(JSON.stringify(state.discovered));
  if(!state.checkpoint||!state.checkpoint.meta)updateCheckpoint();
  addEventListener('resize',()=>{ if(state.mapOpen)render(); else if(state.tab==='tech')requestAnimationFrame(drawTechLines); else if(state.tab==='char'&&state.charView==='genes')requestAnimationFrame(()=>{drawGeneTreeLines();geneTreeApply();}); });
  if(!loaded) intro(); render();
}
boot();
