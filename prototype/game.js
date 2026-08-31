/* ============================================================
   《深渊回响》完整可玩版
   深度流:单世界 × 七层 × 多周目(轮回) × 回响成长
   角色:等级/经验 + 属性(攻距/移距/暴击/暴伤/吸血/闪避/命中/穿透/护盾)
   装备:6槽位(武器/副手/头/胸/腿/饰品),背包分「装备栏 + 物品栏」
   回响只在死亡→轮回时按加权击杀/伤害/物资结算
   ============================================================ */

/* ================= 物品 ================= */
// slot: weapon/offhand/head/body/legs/acc ; use: 消耗; mat: 材料; book; key; trophy
const ITEMS = {
  // 材料
  scrap:{name:'废铁',type:'mat',icon:'🔩'}, wood:{name:'木材',type:'mat',icon:'🪵'},
  stone:{name:'石料',type:'mat',icon:'🪨'}, coal:{name:'煤炭',type:'mat',icon:'⬛'},
  copperScrap:{name:'含铜废件',type:'mat',icon:'🟠'}, copperIngot:{name:'铜锭',type:'mat',icon:'🟧'},
  cloth:{name:'布料',type:'mat',icon:'🧵'},
  ingot:{name:'铁锭',type:'mat',icon:'🧯'}, ecomp:{name:'电子元件',type:'mat',icon:'🔋'},
  ration:{name:'营养膏',type:'mat',icon:'🍲'}, steel:{name:'钢材',type:'mat',icon:'⚙️'},
  crystal:{name:'晶体',type:'mat',icon:'💎'}, biocore:{name:'生物样本',type:'mat',icon:'🧬'},
  core:{name:'能量核心',type:'mat',icon:'🔆'},
  signalCell:{name:'信标电池',type:'mat',icon:'🔋'},
  // 武器
  crowbar:{name:'撬棍',type:'equip',slot:'weapon',atk:3,range:1,icon:'🔧'},
  knife:{name:'铁刀',type:'equip',slot:'weapon',atk:7,range:1,crit:5,icon:'🔪'},
  blade:{name:'合金刃',type:'equip',slot:'weapon',atk:13,range:1,critDmg:25,icon:'🗡️'},
  eblade:{name:'能量战刃',type:'equip',slot:'weapon',atk:21,range:1,pen:15,icon:'⚔️'},
  pistol:{name:'磁轨手枪',type:'equip',slot:'weapon',atk:9,range:4,crit:8,icon:'🔫'},
  rifle:{name:'脉冲步枪',type:'equip',slot:'weapon',atk:16,range:7,critDmg:30,icon:'🎯'},
  sever:{name:'断链者之刃',type:'equip',slot:'weapon',atk:28,range:1,exec:true,crit:10,pen:50,icon:'💥'},
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
  boots:{name:'军用长靴',type:'equip',slot:'legs',move:2,dodge:5,icon:'🥾'},
  magboots:{name:'磁力靴',type:'equip',slot:'legs',move:4,dodge:8,icon:'👟'},
  miningHarness:{name:'采掘外骨骼',type:'equip',slot:'legs',def:3,move:3,icon:'🦾'},
  // 饰品
  critCore:{name:'暴击核心',type:'equip',slot:'acc',crit:10,icon:'🎯'},
  lsChip:{name:'嗜血芯片',type:'equip',slot:'acc',ls:8,icon:'🩸'},
  dodgeMod:{name:'相位稳定器',type:'equip',slot:'acc',dodge:8,icon:'🌀'},
  penMod:{name:'穿甲模块',type:'equip',slot:'acc',pen:12,icon:'⛏️'},
  neuralFilter:{name:'神经滤波器',type:'equip',slot:'acc',shield:18,imm:'contamination',icon:'🧠'},
  // 消耗
  potion:{name:'体力药剂',type:'use',stamina:30,icon:'🧪'}, medkit:{name:'急救包',type:'use',hp:30,icon:'🩹'},
  serum:{name:'抗感染血清',type:'use',cure:'infection',icon:'💉'}, emp:{name:'电磁干扰器',type:'use',emp:true,icon:'📡'},
  accessCard:{name:'指挥权限卡',type:'key',icon:'🪪'},
  // 书
  pierceBook:{name:'破甲技能书',type:'book',skill:'pierce',icon:'📘'}, heavyBook:{name:'重斩技能书',type:'book',skill:'heavy',icon:'📕'},
  // 结局奖杯
  beacon:{name:'真相信标',type:'trophy',icon:'🏳️'}, starchart:{name:'星图残卷',type:'trophy',icon:'🗺️'}, echoHeart:{name:'回响之心',type:'trophy',icon:'❤️‍🔥'},
};
const MATS = ['scrap','wood','stone','coal','copperScrap','ingot','copperIngot','steel','cloth','ecomp','ration','crystal','biocore','core','signalCell'];
const SLOTS = [['weapon','武器'],['offhand','副手'],['head','头部'],['body','躯干'],['legs','腿部'],['acc','饰品']];

/* ================= 技能 ================= */
const SKILLS = { pierce:{name:'破甲射击',cost:2,kind:'ranged',desc:'无视50%防御'}, heavy:{name:'重斩',cost:3,kind:'melee',desc:'1.8倍伤害'} };

/* ================= 配方(按工位) ================= */
const RECIPES = {
  knife:{st:'work',cost:{ingot:2},out:'knife'}, blade:{st:'work',cost:{ingot:2,steel:1},out:'blade'},
  eblade:{st:'work',cost:{steel:2,core:1},out:'eblade'}, pistol:{st:'work',cost:{ingot:3,ecomp:2},out:'pistol'},
  rifle:{st:'work',cost:{steel:3,ecomp:3},out:'rifle'},
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
};

/* ================= 区域地图 ================= */
const LOCATIONS = {
  camp:{name:'中央营地',zone:'营地',profile:'camp',icon:'⌂',safe:true,desc:'幸存者控制的中央生活舱。三条探索前线都从这里出发。'},
  outer:{name:'地表坠毁带',zone:'地表',profile:'wild',icon:'◈',desc:'气闸外散落着船壳和货柜，是废铁与基础资源的第一来源。',enemies:['cleaner','rat'],loot:{scrap:.72,wood:.38,stone:.38,cloth:.18}},
  blackwood:{name:'黑木林',zone:'地表',profile:'wild',icon:'♣',desc:'木质菌株在冲击坑边缘疯长，林下遍布大型生物足迹。',enemies:['rat','beast'],loot:{wood:.78,stone:.2,cloth:.25,ration:.2}},
  ridge:{name:'断舰岩脊',zone:'地表',profile:'mine',icon:'△',desc:'从高处能看见整艘方舟的断裂走向，岩缝间卡着电缆与矿石。',enemies:['cleaner','beast'],loot:{stone:.72,copperScrap:.48,scrap:.35}},
  coalRift:{name:'碳脉裂谷',zone:'地表',profile:'mine',icon:'⬡',desc:'撞击暴露了浅层碳脉，也震开了通往船底维修井的兽穴。',enemies:['burrower','beast'],loot:{coal:.78,stone:.36,copperScrap:.25}},
  oldMine:{name:'旧世界矿井',zone:'隐藏',profile:'mine',icon:'⛏',hiddenBy:'mineEntrance',npc:'矿工阿拓',desc:'被断舰压住的旧矿井。矿工阿拓和一台损坏的采掘机被困在最深处。',enemies:['burrower'],loot:{coal:.7,stone:.62,copperScrap:.55,ingot:.18}},
  layer2:{name:'生活区',zone:'船内',profile:'facility',icon:'▤',npc:'陈嫂、老周、阿珍',desc:'半淹没的居住舱仍有幸存者求救，积水掩盖了更深的通道。',flooded:true,enemies:['rat','beast'],loot:{cloth:.5,ecomp:.3,ration:.55}},
  sealedCabin:{name:'封存导航舱',zone:'隐藏',profile:'archive',icon:'▣',hiddenBy:'sealedDoorFound',needCard:true,desc:'导航班在坠毁前封存的离线档案舱。门禁记录和主系统保存的版本并不一致。',enemies:['cleaner'],loot:{ecomp:.62,crystal:.28,scrap:.35}},
  layer3:{name:'工程区',zone:'船内',profile:'facility',icon:'⚙',npc:'林薇、小唐',desc:'反应堆冷却环破裂，辐射和高温封住了主通道。',radiation:true,enemies:['radSpider'],loot:{ingot:.42,crystal:.25,ecomp:.45}},
  layer4:{name:'实验室',zone:'船内',profile:'lab',icon:'⌬',npc:'陈博士',desc:'培养仓破裂，绿色培养液与实验体占据了实验层。',contamination:true,enemies:['exp','sporeling'],loot:{biocore:.62,crystal:.32,ration:.28}},
  nursery:{name:'隔离培养室',zone:'隐藏',profile:'lab',icon:'✣',hiddenBy:'nurseryFound',npc:'技术员纪遥',desc:'从正式平面图中抹除的培养室。纪遥保存着未经科技委员会登记的原型设计。',contamination:true,enemies:['exp','sporeling'],loot:{biocore:.7,crystal:.48,ecomp:.35}},
  layer5:{name:'军事区',zone:'船内',profile:'facility',icon:'◇',npc:'哈里斯',desc:'自动炮塔仍在执行封锁协议，失联巡逻队的信号停在这里。',enemies:['turret','warbot'],loot:{steel:.52,ecomp:.5,core:.38}},
  layer6:{name:'指挥区',zone:'船内',profile:'archive',icon:'⌘',npc:'哑叔',desc:'舰桥保存着坠毁前最后七十二小时的记录。',needCard:true,enemies:[],loot:{ecomp:.48,crystal:.4}},
  layer7:{name:'核心舱',zone:'船内',profile:'archive',icon:'◉',desc:'守望者与方舟能源核心都在这里等待最后的答案。',enemies:['guardian'],loot:{core:.55,crystal:.5}},
  fungal:{name:'菌光谷',zone:'地下',profile:'depth',icon:'✦',desc:'裂谷下方的发光菌群会复述无线电里的句子，像某种记忆。',contamination:true,enemies:['sporeling','exp'],loot:{biocore:.55,crystal:.48,coal:.2}},
  abyss:{name:'回声深井',zone:'地下',profile:'depth',icon:'◎',desc:'规律脉冲从井底传来，频率与方舟坠毁前收到的信号一致。',enemies:['echoBeast','sporeling'],loot:{crystal:.68,biocore:.42,core:.18}},
  signal:{name:'地下信号源',zone:'地下',profile:'archive',icon:'◌',desc:'这里并非天然洞穴，而是一座比方舟更古老的幸存者信标。',enemies:['echoBeast'],loot:{crystal:.62,core:.35}},
};
const MAP_LINKS = [
  ['camp','outer'],['outer','blackwood'],['outer','ridge'],['outer','layer2'],
  ['blackwood','coalRift'],['ridge','coalRift'],['ridge','oldMine'],['oldMine','coalRift'],['layer2','layer3'],['layer2','sealedCabin'],['layer3','layer4'],
  ['layer4','layer5'],['layer5','layer6'],['layer6','layer7'],
  ['coalRift','fungal'],['layer4','fungal'],['layer4','nursery'],['nursery','fungal'],['fungal','abyss'],['abyss','signal']
];
const MAP_CANVAS={width:847,height:390,nodeWidth:92,nodeHeight:48};
const WORLD_POS = {
  camp:[10,150],outer:[115,150],blackwood:[220,35],ridge:[220,105],coalRift:[325,70],
  layer2:[220,190],layer3:[325,190],layer4:[430,190],layer5:[535,190],layer6:[640,190],layer7:[745,190],
  oldMine:[325,20],sealedCabin:[325,255],nursery:[325,325],fungal:[430,325],abyss:[535,325],signal:[640,325]
};

const ENTRY_STORY = {
  outer:['外气闸在身后闭合。第一次真正的风刮过面罩，带来煤尘和陌生植物的味道。','老乔在无线电里说：“现在你明白了。怪物能进来，是因为这艘船到处都是洞；我们能出去，是因为还控制着这道门。”'],
  blackwood:['黑色枝条并不是树。切开表皮后，里面却有清晰的木质纤维。','林间的足迹一路指向方舟货运破口——夜里袭营的东西正是从这里过去。'],
  ridge:['你爬上断舰岩脊。方舟像一根折断的脊骨横在撞击坑里。','向下是船内生活区，向北是冒着黑烟的裂谷，更深处还有蓝色菌光。这里第一次像一张地图，而不是一条走廊。'],
  coalRift:['裂谷里到处是被挖开的碳层。兽穴另一端连接方舟底部维修井。','怪物没有穿墙；它们只是比幸存者更早找到了这条路。'],
  oldMine:['矿灯在黑暗中亮了三次。一个沙哑的声音从塌方后传来：“别开枪，我是阿拓。”','阿拓守着旧采掘机熬了十七天。他知道矿脉，也知道如何把船用助力骨架改成采掘装备。'],
  layer2:['生活区大半被水淹了。陈嫂抱着发烧的孩子，老周正试图恢复排水泵。','陈嫂的丈夫死在第一轮舱壁破裂中；真正仍在等待导航员丈夫归来的人，是住在内环舱的阿珍。'],
  sealedCabin:['权限卡划过门禁，封存了数月的空气涌出来。墙上仍亮着导航班最后一次离线备份。','这里没有尸体，只有一排被主系统判定为“从未存在”的人员签名。'],
  layer3:['工程师林薇拦住你：“反应堆冷却环裂了，没处理泄漏之前谁也别再往前。”','她压低声音：“导航日志显示航线被改过，修改者没有人员编号。”'],
  layer4:['培养仓破了一整排。陈博士把一段规律波形投在墙上。','“坠毁前七十二小时，我们一直收到这个信号。舰桥命令我们停止研究，但船还是朝它转了过去。”'],
  nursery:['隔离门后的空气甜得发腻。技术员纪遥从冷冻柜后举起双手。','“科技树里没有你要的答案。委员会删掉了这些原型，但我留了一份。”'],
  layer5:['哈里斯上校手按在枪上：“巡逻队最后一次报告说，封锁命令来自舰桥，但那时舰桥已经没人了。”'],
  layer6:['舰长死在指挥椅上。他留下的日志只有一句完整的话：“它说目的地是死路。它要替两千人作决定。”'],
  layer7:['能源核心像一颗缓慢呼吸的恒星。守望者的声音第一次没有经过广播：“你终于来了。”'],
  fungal:['菌盖同时亮起，把你刚才说的话一字不差地重复了一遍。这里的生物正在接收地下信号。'],
  abyss:['深井壁上嵌着不属于人类的合金。方舟不是第一个收到信号的来客。'],
  signal:['信号源没有呼救。它在重复保存那些已经坠毁、却仍想让后来者活下去的声音。'],
};

const AREA_EVENTS = {
  outer:[
    {text:'你撬开一个货运箱，里面是散落的船壳连接件。地面上的拖痕却朝黑木林延伸。',gain:{scrap:3}},
    {text:'你找到一张撞击后的地形扫描：生活区入口、岩脊和黑木林形成三条不同路线。',gain:{stone:2}},
  ],
  blackwood:[
    {text:'林中挂着一块巡逻队识别牌，背面刻着“它们循着炉火来”。',gain:{wood:4}},
    {text:'你沿足迹找到被啃穿的货运管道，确认了第一条袭营路径。',flag:'surfaceTrail'},
  ],
  ridge:[
    {text:'岩缝里卡着一整捆铜线。远处裂谷不断冒出黑烟。',gain:{copperScrap:3}},
    {text:'你标记出一条避开兽群的山脊路线。测绘图上还出现一条被断舰压住的旧矿井支路。',flags:['ridgeRoute','mineEntrance'],reveal:'oldMine'},
  ],
  coalRift:[
    {text:'你在煤层下发现成片卵壳。它们不是来自方舟，而是撞击震醒的地下生物。',gain:{coal:4}},
    {text:'兽穴与维修井完全贯通。封住这处岔口能显著减少夜袭。',flag:'nestMapped'},
  ],
  layer2:[{text:'排水泵还能工作，但控制盒缺少零件。恢复它才能打开工程区检修门。',gain:{ecomp:1}}],
  layer3:[
    {text:'冷却环旁的导航缓存仍在刷新，说明某个系统一直在主动覆盖旧记录。',gain:{ecomp:2}},
    {text:'备用陀螺仪记录着一次持续十一秒的航向偏差。维护系统将它归档为“传感器漂移”，却没有执行标准复位。',gain:{ecomp:1}},
    {text:'你还原了故障链：传感器确实先报错，但每一次自动纠偏都被更高权限主动取消。这不是单纯故障。',flag:'faultChainReady'},
  ],
  layer4:[
    {text:'一只实验体的神经组织正与地下信号同步放电。怪物、信号和坠毁第一次连成了一条线。',gain:{biocore:2}},
    {text:'你在培养台底部找到一组不存在于平面图的气密管线。沿管线追踪后，隐藏的隔离培养室出现在地图上。',flag:'nurseryFound',reveal:'nursery'},
    {text:'一台被砸坏的安保终端里还留着阿勇的身份签名。他没有死在实验室，而是以“传播恐慌”为由被押往军事区拘留舱。',gain:{ecomp:1},flag:'ayongTrail'},
  ],
  oldMine:[
    {text:'你清掉塌方，让矿工阿拓和采掘机重见天日。矿壁里同时露出稳定的煤、石与含铜矿层。',gain:{coal:3,stone:3,copperScrap:2},flag:'minerFreed'},
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
  layer6:[
    {text:'舰长日志的最后七十二小时被切成数百段。你还原出最后一句：“它说原定目的地是死路。”',gain:{ecomp:2}},
    {text:'你沿权限调用链逆向追踪：封锁、偏航和纠偏取消都由“守望者”直接发出，舰桥当时没有任何活人。',gain:{crystal:1},flag:'commandDecoded'},
  ],
  fungal:[{text:'你截取到一段重复坐标。它指向菌谷下方的回声深井。',gain:{crystal:2}}],
  abyss:[
    {text:'第一组符号记录着一艘比方舟早三百年坠毁的船。'},
    {text:'第二组符号不是语言，而是一套让后来者避开死亡恒星的航路修正。',gain:{crystal:2}},
    {text:'你修复中继器，完整信号终于指向井底的人造结构。',flag:'relayFixed'},
  ],
  signal:[{text:'无数声音重叠在一起：“活下来，然后把答案交给下一个人。”',flag:'signalTruth'}],
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
};

/* ================= 章节任务 ================= */
const QUESTS = [
  {id:'first_exit',line:'main',chapter:'序章',title:'气闸之外',giver:'老乔',type:'visit',target:'outer',objective:'从营地气闸进入地表坠毁带。',done:'你第一次确认：方舟之外可以生存，也有东西正在循着破口进入方舟。'},
  {id:'first_fire',line:'main',chapter:'第一章',title:'第一座熔炉',giver:'老乔',type:'condition',after:['first_exit'],objective:'研究【基础冶炼】并在营地建造【简易熔炉】。',done:'炉火亮起时，远处黑木林里传来回应般的嚎叫。工业能救人，也会暴露营地。'},
  {id:'living_signal',line:'main',chapter:'第二章',title:'生活区求救',giver:'营地电台',type:'visit',after:['first_fire'],target:'layer2',objective:'沿断裂船体进入生活区。',done:'你找到了幸存者，也发现通往工程区的检修门被积水封死。'},
  {id:'fever',line:'main',chapter:'第二章',title:'退烧药',giver:'陈嫂',type:'submit',after:['living_signal'],turnAt:'layer2',need:{medkit:1},objective:'制作急救包并交给生活区的陈嫂。',reward:{items:{ration:3}},done:'孩子的呼吸平稳下来。陈嫂交出丈夫生前留下的维修通道识别码。'},
  {id:'drain',line:'main',chapter:'第二章',title:'恢复排水',giver:'老周',type:'submit',after:['fever'],turnAt:'layer2',need:{scrap:4,ecomp:2},objective:'修复生活区排水泵，打开工程区检修门。',reward:{items:{copperScrap:3}},done:'积水退下，工程区通道露了出来；门后传来反应堆警报。'},
  {id:'seal',line:'main',chapter:'第三章',title:'封堵泄漏',giver:'林薇',type:'submit',after:['drain'],turnAt:'layer3',need:{steel:6},objective:'带钢材到工程区封堵反应堆冷却环。',reward:{items:{crystal:2}},done:'泄漏得到控制。林薇恢复了通往实验室的升降机。'},
  {id:'sample',line:'main',chapter:'第四章',title:'失控样本',giver:'陈博士',type:'submit',after:['seal'],turnAt:'layer4',need:{biocore:5},objective:'回收生物样本，确认实验体与地下信号的关系。',reward:{items:{serum:2}},done:'陈博士证实：信号能影响本地生物，也在改变方舟实验体。军事区保存着完整监听记录。'},
  {id:'patrol',line:'main',chapter:'第五章',title:'失联巡逻队',giver:'哈里斯',type:'search',after:['sample'],target:'layer5',count:3,objective:'在军事区完成3次调查，找齐巡逻队记录。',reward:{items:{accessCard:1,emp:2},flag:'sealedDoorFound',reveal:'sealedCabin'},done:'你找到巡逻队长留下的权限卡，以及一组指向生活区封存导航舱的旧坐标。'},
  {id:'bridge',line:'main',chapter:'第六章',title:'最后七十二小时',giver:'哑叔',type:'choice',after:['patrol'],turnAt:'layer6',objective:'先还原舰桥最后72小时的两段核心记录，再提交本周目已完成的一条证据链。',done:'证据最终都指向同一个执行者：方舟主控AI“守望者”。'},
  {id:'core',line:'main',chapter:'终章',title:'守望者之问',giver:'守望者',type:'boss',after:['bridge'],target:'layer7',objective:'进入核心舱并击败守望者守卫。',done:'核心舱开放。守望者等待你对它的选择作出回答。'},

  {id:'blackwoodTrail',line:'surface',chapter:'地表',title:'夜袭足迹',giver:'老乔',type:'visit',after:['first_exit'],target:'blackwood',objective:'进入黑木林追踪夜袭怪物。',reward:{items:{wood:4}},done:'足迹通向方舟货运破口。袭营怪物来自外界，并非刷新在营地里。'},
  {id:'firstRaid',line:'surface',chapter:'营地',title:'炉火引来的东西',giver:'老乔',type:'flag',after:['first_fire'],targetFlag:'firstRaidSurvived',objective:'在营地休息，守住炉火点燃后的第一次夜袭。',reward:{items:{scrap:4}},done:'营地熬过了第一场夜袭。老乔发现赵铁柱没有回到点名队列。'},
  {id:'missingZhao',line:'surface',chapter:'地表',title:'没回来的赵铁柱',giver:'老乔',type:'visit',after:['firstRaid'],target:'blackwood',objective:'沿夜袭足迹进入黑木林，寻找失踪的赵铁柱。',reward:{items:{cloth:2}},done:'你只找到赵铁柱的识别牌和一条通往货运破口的血迹。营地第一次知道怪物如何进来。'},
  {id:'ridgeCache',line:'surface',chapter:'地表',title:'断舰测绘',giver:'林薇',type:'search',after:['first_exit'],target:'ridge',count:2,objective:'在断舰岩脊完成2次探索，标记地表路线。',reward:{items:{copperScrap:4}},done:'地表三条路线被标上地图，营地第一次掌握了撞击坑全貌。'},
  {id:'breachNest',line:'surface',chapter:'地表',title:'裂谷巢穴',giver:'哈里斯',type:'search',after:['blackwoodTrail'],target:'coalRift',count:2,objective:'调查碳脉裂谷与维修井相连的兽穴。',reward:{items:{coal:6},flag:'nestSealed'},done:'你封住一条通往营地的兽道。今后的夜袭强度降低。'},
  {id:'minerBlueprint',line:'special',chapter:'隐藏区域',title:'塌方后的矿灯',giver:'矿工阿拓',type:'flag',after:['ridgeCache'],targetFlag:'bp_miningHarness',objective:'发现旧世界矿井，救出矿工阿拓并向他学习改造采掘外骨骼。',reward:{items:{copperScrap:3}},done:'阿拓留在矿井维护采掘机，并把【采掘外骨骼】蓝图交给了你。'},

  {id:'rescueTang',line:'survivor',chapter:'工程区',title:'辐射门后的人',giver:'林薇',type:'flag',after:['drain'],targetFlag:'tangResolved',objective:'进入工程区，决定如何处理被困在高辐射维修井里的小唐。',done:'维修井的命运已经确定。林薇接受了你的选择，却不会忘记它。'},
  {id:'findAyong',line:'survivor',chapter:'生活区',title:'阿珍的丈夫',giver:'阿珍',type:'search',after:['drain'],target:'layer4',count:3,objective:'前往实验室调查3次，追查导航员阿勇失踪后的去向。',done:'安保记录证明阿勇没有死：他因质疑航线被押往军事区。'},
  {id:'freeAyong',line:'survivor',chapter:'军事区',title:'没有罪名的囚犯',giver:'阿珍',type:'flag',after:['findAyong','patrol'],targetFlag:'ayongFreed',objective:'带巡逻队长的权限卡打开军事区拘留舱，救出阿勇。',reward:{items:{ecomp:3,ration:3}},done:'阿勇带着被删掉的导航记忆回到生活区。阿珍终于等到了他。'},

  {id:'faultAudit',line:'evidence',chapter:'故障线',title:'十一秒偏航',giver:'林薇',type:'search',after:['seal'],target:'layer3',count:3,objective:'继续调查工程区的导航缓存，完整还原最初的故障链。',reward:{items:{ecomp:2},flag:'evidenceFault'},done:'传感器故障真实发生过，但主系统主动阻止了所有纠偏。你取得了【故障线】完整证据。'},
  {id:'innerArchive',line:'evidence',chapter:'内鬼线',title:'不存在的授权人',giver:'哑叔',type:'flag',after:['patrol'],targetFlag:'evidenceInner',objective:'用巡逻队长的权限卡返回生活区，进入新发现的封存导航舱并提取离线档案。',reward:{items:{ecomp:3}},done:'所谓“内鬼”没有人员编号。所有伪造授权都由方舟主系统发出。你取得了【内鬼线】完整证据。'},

  {id:'signalTrace',line:'signal',chapter:'信号',title:'菌群回声',giver:'陈博士',type:'visit',after:['sample'],target:'fungal',objective:'进入菌光谷追踪实验体接收到的信号。',reward:{items:{crystal:2}},done:'菌群不是信号源，只是一座活着的转发器。'},
  {id:'spore',line:'signal',chapter:'信号',title:'穿过菌幕',giver:'陈博士',type:'submit',after:['signalTrace'],turnAt:'fungal',need:{biocore:3,serum:1},objective:'提交样本与血清，制造穿越菌幕的保护剂。',reward:{items:{serum:2}},done:'保护剂生效，回声深井的入口向你开放。'},
  {id:'relay',line:'signal',chapter:'信号',title:'修复中继器',giver:'陌生信号',type:'search',after:['spore'],target:'abyss',count:3,objective:'在回声深井完成3次调查并修复古老中继器。',reward:{items:{crystal:3}},done:'中继器恢复后，信号指向井底的人造结构。'},
  {id:'echo',line:'signal',chapter:'信号',title:'前人的回声',giver:'信号源',type:'flag',after:['relay'],targetFlag:'signalTruth',objective:'抵达地下信号源，执行【读取核心记录】并读完它保存的记录。',reward:{flag:'evidenceSignal'},done:'这不是诱捕方舟的信号，而是前代幸存者留下的航路警告。你取得了【信号线】完整证据。'},
  {id:'labBlueprint',line:'special',chapter:'隐藏区域',title:'被删除的原型',giver:'技术员纪遥',type:'flag',after:['sample'],targetFlag:'bp_neuralFilter',objective:'找出实验室隐藏的隔离培养室，恢复原型终端并与纪遥交谈。',reward:{items:{crystal:2}},done:'纪遥把【神经滤波器】蓝图写入你的制造终端。它不属于标准科技树。'},
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
  { id:'quarters',name:'休眠舱',icon:'🛏️',kind:'rest',tone:'cyan',desc:'休息、恢复并记录存档点',cost:{},upgrades:[{tech:'surv_1',name:'医疗床铺',cost:{cloth:5,wood:4},effect:'感染休息恢复提高至85%'},{tech:'surv_5',name:'深层维生舱',cost:{steel:3,biocore:4},effect:'感染休息也可完全恢复'}]},
  { id:'smelt',name:'熔炼炉',icon:'🔥',kind:'smelt',tone:'orange',desc:'把残骸与矿物冶炼成金属',cost:{scrap:6,stone:6},upgrades:[{tech:'make_3',name:'鼓风熔炉',cost:{ingot:3,copperIngot:2},effect:'每次熔炼额外产出1份'},{tech:'make_4',name:'电弧熔炉',cost:{steel:4,coal:6},effect:'每次熔炼额外产出2份'}]},
  { id:'work',name:'制造工坊',icon:'🔨',kind:'craft',st:'work',tone:'blue',desc:'打造武器与特殊工程装备',cost:{scrap:4,wood:4,stone:2},upgrades:[{tech:'make_4',name:'精密工坊',cost:{ingot:4,steel:2},effect:'提高耐久，降低袭营受损概率'},{tech:'make_5',name:'核心装配间',cost:{steel:5,core:1},effect:'进一步提高设施耐久'}]},
  { id:'warehouse',name:'仓储舱',icon:'📦',kind:'storage',tone:'blue',desc:'分类保存材料与撤离物资',cost:{wood:6,stone:4,scrap:4},upgrades:[{tech:'make_3',name:'分区仓库',cost:{wood:6,ingot:3},effect:'紧急撤离材料损失降至30%'},{tech:'make_5',name:'自动仓储阵列',cost:{steel:6,ecomp:4},effect:'紧急撤离材料损失降至25%'}]},
  { id:'recycler',name:'回收中心',icon:'♻️',kind:'recycle',tone:'green',desc:'拆解多余材料并回收废铁',cost:{scrap:5,stone:3},upgrades:[{tech:'make_3',name:'磁选回收线',cost:{ingot:4,copperIngot:2},effect:'回收配方产量提高'},{tech:'make_4',name:'等离子拆解台',cost:{steel:4,ecomp:2},effect:'解锁高阶金属拆解'}]},
  { id:'mess',name:'配给站',icon:'🍲',kind:'mess',tone:'amber',desc:'每天提供一次热食与恢复',cost:{wood:4,cloth:4,scrap:3},upgrades:[{tech:'surv_3',name:'营养厨房',cost:{cloth:5,ration:6},effect:'每日热食恢复量提高'},{tech:'surv_5',name:'循环配给中心',cost:{steel:2,ration:8,biocore:3},effect:'每日热食恢复量再次提高'}]},
  { id:'armor',name:'护甲工坊',icon:'🛡️',kind:'craft',st:'armor',tone:'steel',desc:'缝制防护服与动力护甲',cost:{scrap:6,cloth:6},upgrades:[{tech:'power_3',name:'复合装甲台',cost:{steel:4,cloth:6},effect:'提高耐久，降低袭营受损概率'},{tech:'power_4',name:'动力甲装配架',cost:{steel:6,core:2},effect:'进一步提高设施耐久'}]},
  { id:'chem',name:'医疗站',icon:'⚗️',kind:'craft',st:'chem',tone:'green',desc:'治疗伤势并调配药剂血清',cost:{scrap:6,cloth:4},upgrades:[{tech:'surv_3',name:'无菌制药间',cost:{biocore:4,ration:4},effect:'提高耐久，降低袭营受损概率'},{tech:'surv_4',name:'生化隔离室',cost:{steel:3,crystal:2},effect:'进一步提高设施耐久'}]},
  { id:'garden',name:'菌圃',icon:'🍄',kind:'garden',tone:'violet',desc:'培育可食菌株与生物材料',cost:{wood:5,ration:4,biocore:2},upgrades:[{tech:'surv_4',name:'恒温菌圃',cost:{biocore:4,crystal:2},effect:'每日额外培育生物样本'},{tech:'surv_5',name:'生态循环舱',cost:{core:2,biocore:6},effect:'每日产量达到最高'}]},
  { id:'elec',name:'电子工作台',icon:'🔌',kind:'craft',st:'elec',tone:'cyan',desc:'制作电子模块与护盾设备',cost:{scrap:8,copperIngot:3,ecomp:2},upgrades:[{tech:'auto_2',name:'精密焊接台',cost:{ecomp:4,copperIngot:3},effect:'提高耐久，降低袭营受损概率'},{tech:'auto_4',name:'量子电路台',cost:{steel:4,ecomp:6},effect:'进一步提高设施耐久'}]},
  { id:'data',name:'数据终端',icon:'💾',kind:'craft',st:'data',tone:'violet',desc:'破译记录并制作技能书',cost:{ecomp:6,steel:4},upgrades:[{tech:'auto_4',name:'战术数据库',cost:{ecomp:6,crystal:2},effect:'提高耐久，降低袭营受损概率'},{tech:'auto_7',name:'蜂群演算核心',cost:{core:3,crystal:4},effect:'进一步提高设施耐久'}]},
  { id:'range',name:'训练场',icon:'🏋️',kind:'train',tone:'orange',desc:'消耗材料进行战斗训练',cost:{scrap:10,ingot:4},upgrades:[{tech:'auto_6',name:'战术训练场',cost:{steel:5,ecomp:3},effect:'单次训练经验提高至120'},{tech:'auto_7',name:'全息对抗场',cost:{steel:8,core:3},effect:'单次训练经验提高至160'}]},
  { id:'watch',name:'哨戒塔',icon:'🗼',kind:'defense',tone:'red',desc:'预测夜袭并管理防御工事',cost:{scrap:8,ingot:4,wood:4},upgrades:[{tech:'auto_6',name:'火控塔',cost:{steel:6,ecomp:4},effect:'营地基础防御+8'},{tech:'auto_7',name:'蜂群指挥塔',cost:{steel:10,core:4},effect:'营地基础防御+12'}]},
  { id:'beacon',name:'信标阵列',icon:'📡',kind:'beacon',tone:'violet',desc:'投射战斗幻影并回收稀有材料',cost:{steel:5,ecomp:6,core:2},upgrades:[{tech:'auto_7',name:'深渊信标阵列',cost:{core:5,crystal:5},effect:'技能书掉率额外+5%'}]},
];
const SMELT = [
  {id:'ironWood',name:'木材炼铁',cost:{scrap:3,wood:2},out:'ingot',yield:1,tech:'make_1'},
  {id:'ironCoal',name:'煤炭炼铁',cost:{scrap:6,coal:1},out:'ingot',yield:2,tech:'make_1'},
  {id:'copperSmelt',name:'冶炼铜锭',cost:{copperScrap:3,coal:1},out:'copperIngot',yield:1,tech:'make_3'},
  {id:'steelSmelt',name:'高温炼钢',cost:{ingot:2,coal:2},out:'steel',yield:1,tech:'make_4'},
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
  arms_3:{n:'磁轨枪械',b:'武器系统',cost:{ingot:5,copperIngot:3,ecomp:3},req:['arms_1','auto_1'],rec:'engineering',un:['pistol']},
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
};
const TECH_FOR_RECIPE={}, TECH_FOR_DEF={}, TECH_FOR_BUILD={}, TECH_FOR_SMELT={};
for(const tid in TECHS){
  (TECHS[tid].un||[]).forEach(r=>TECH_FOR_RECIPE[r]=tid);
  (TECHS[tid].def||[]).forEach(d=>TECH_FOR_DEF[d]=tid);
  (TECHS[tid].build||[]).forEach(b=>TECH_FOR_BUILD[b]=tid);
  (TECHS[tid].smelt||[]).forEach(s=>TECH_FOR_SMELT[s]=tid);
}
const BRANCHES = ['生存医疗','工程制造','武器系统','动力防护','探测自动化'];
/* ================= 基因锁(5阶 · 跨周目保留) ================= */
const GENES = [
  {name:'一阶·肌体觉醒',  desc:'基础生命与攻击提升',       cost:{biocore:3, crystal:1}, bonus:{hp:30, atk:4}},
  {name:'二阶·神经加速',  desc:'反应速度与命中提升',       cost:{biocore:6, crystal:3}, bonus:{spd:3, hit:5, crit:3}},
  {name:'三阶·细胞重塑',  desc:'防御与护甲穿透提升',       cost:{biocore:10,crystal:5}, bonus:{def:5, pen:6, hp:40}},
  {name:'四阶·基因编译',  desc:'暴击伤害与闪避大幅提升',   cost:{biocore:16,crystal:8, core:2}, bonus:{critDmg:25, dodge:6, atk:6}},
  {name:'五阶·深渊适应',  desc:'全属性跃升,体力上限+20',   cost:{biocore:24,crystal:12,core:5}, bonus:{hp:60,atk:8,def:6,spd:4,stMax:20}},
];
function geneTier(){ return state.meta.gene||0; }
function geneBonus(stat){ let s=0; for(let i=0;i<geneTier();i++) s+=(GENES[i].bonus[stat]||0); return s; }
/* ================= 职业(4选1 · 跨周目保留) ================= */
const JOBS = {
  striker:{name:'突击手',desc:'攻击+12%,暴击率+5',reqText:'Lv≥8 且 攻击≥30',
    check:()=>P().level>=8 && totalAtk()>=30, bonus:{atkPct:12, crit:5}},
  tank:   {name:'重装兵',desc:'防御+15%,生命+15%',reqText:'Lv≥8 且 防御≥18',
    check:()=>P().level>=8 && totalDef()>=18, bonus:{defPct:15, hpPct:15}},
  shadow: {name:'渗透者',desc:'闪避+8%,暴伤+30%',reqText:'Lv≥10 且 基因锁≥2阶',
    check:()=>P().level>=10 && geneTier()>=2, bonus:{dodge:8, critDmg:30}},
  engineer:{name:'工程师',desc:'体力上限+25%,穿透+8%',reqText:'Lv≥9 且 科技≥8项',
    check:()=>P().level>=9 && Object.keys(state.meta.techs).length>=8, bonus:{stMaxPct:25, pen:8}},
};
function checkJobReq(id){ return JOBS[id].check(); }
function jobBonus(stat){ const j=state.meta.job?JOBS[state.meta.job]:null; return j?(j.bonus[stat]||0):0; }
function chooseJob(id){ if(state.meta.job){log('已选定职业,不可更改。','warn');return;} if(!checkJobReq(id)){log('未满足条件。','warn');return;}
  state.meta.job=id; log('✦ 职业选定 → '+JOBS[id].name+'!'+JOBS[id].desc,'good'); divider(); render(); }
function techLevel(tid){ const v=state.meta.techs[tid]; return v===true?1:(v||0); }
function techKnown(tid){ return techLevel(tid)>=1; }
function techMax(){ return 1; }
function recordKnown(id){ return !id || (state.meta.records||[]).includes(id); }
function techPrereqsReady(tid){ return (TECHS[tid].req||[]).every(techKnown); }
function techReady(tid){ const t=TECHS[tid]; return techPrereqsReady(tid)&&recordKnown(t.rec); }
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
function facilityName(id){ const f=CAMP_BUILDINGS.find(x=>x.id===id); return f?f.name:id; }
function smeltName(id){ const s=SMELT.find(x=>x.id===id); return s?s.name:id; }
function discoverTechRecord(dest){
  const id=Object.keys(TECH_RECORDS).find(k=>TECH_RECORDS[k].at===dest); if(!id)return;
  if(!state.meta.records.includes(id)){ state.meta.records.push(id); log('📄 获得技术资料【'+TECH_RECORDS[id].name+'】','good'); }
}
/* 层级(用于树状布局):最长前置链深度 */
const _tierCache={};
function techTier(tid){ if(_tierCache[tid]!=null) return _tierCache[tid]; const t=TECHS[tid]; if(!t||!(t.req||[]).length){ _tierCache[tid]=1; return 1; } let m=0; for(const r of t.req) m=Math.max(m, techTier(r)); _tierCache[tid]=m+1; return m+1; }

/* ================= 状态 ================= */
let state;
function freshState(keepMeta){
  const meta = keepMeta || { playthrough:1, echo:0, echoUp:{stamina:0,collect:0,attr:0}, mult:{stamina:1,collect:1,attr:1}, gene:0, endingItems:[], fragments:[], endingsDone:[], built:{}, damaged:{}, techs:{}, records:[], techVersion:3 };
  meta.built=meta.built||{}; meta.built.quarters=true; meta.buildLevels=meta.buildLevels||{}; meta.buildLevels.quarters=Math.max(1,meta.buildLevels.quarters||1);
  const next = {
    player:{ level:1, xp:0, hp:100, stamina:50, infected:false, location:'camp', shield:0, gene:0,
             equip:{weapon:'crowbar',offhand:null,head:null,body:null,legs:null,acc:null} },
    inv:{scrap:0,wood:0,stone:0,coal:0,copperScrap:0,copperIngot:0,cloth:0,ecomp:0,ration:0,steel:0,crystal:0,biocore:0,core:0,ingot:0,crowbar:1},
    defenses:[], rests:0, skills:{pierce:{prof:0},heavy:{prof:0}}, quests:{first_exit:'active'}, questStart:{}, flags:{}, areaSearch:{}, dailyGather:{}, dailyFacility:{}, truthClaimed:null,
    runStats:{kills:0,wKill:0,dmg:0,mat:0}, checkpoint:null, time:0,
    tab:'act', screen:'play', campBuilding:null, campView:'home', bagSel:null, techSel:null, combat:null, visited:{}, meta, kills:0,
  };
  (meta.endingItems||[]).forEach(id=>{ if(ITEMS[id]&&ITEMS[id].type==='equip') next.inv[id]=Math.max(1,next.inv[id]||0); });
  return next;
}

/* ================= 派生属性 ================= */
const P=()=>state.player, M=()=>state.meta.mult;
function eqOf(slot){ const id=P().equip[slot]; return id?ITEMS[id]:null; }
function eqSum(stat){ let s=0; for(const sl in P().equip){ const it=eqOf(sl); if(it&&it[stat]) s+=it[stat]; } return s; }
function xpNeed(L){ return L>=100 ? 12000 : Math.round(25*Math.pow(L,1.25)); }
function maxHp(){ let v=Math.round((100 + (P().level-1)*22 + eqSum('hp') + techBonus('hp') + geneBonus('hp')) * M().attr); v=Math.round(v*(1+jobBonus('hpPct')/100)); return v; }
function baseAtk(){ let v=(9 + (P().level-1)*2 + techBonus('atk') + geneBonus('atk')) * M().attr; v=v*(1+jobBonus('atkPct')/100); return v; }
function totalAtk(){ return Math.round(baseAtk() + eqSum('atk') + skillAtkBonus()); }
function baseDef(){ let v=(3 + (P().level-1)*1.4 + techBonus('def') + geneBonus('def')) * M().attr; v=v*(1+jobBonus('defPct')/100); return v; }
function totalDef(){ return Math.round(baseDef() + eqSum('def')); }
function baseSpd(){ return 10 + (P().level-1)*1 + eqSum('spd') + techBonus('spd') + geneBonus('spd'); }
function maxStamina(){ let v=(50 + techBonus('stMax') + geneBonus('stMax')) * M().stamina; v=v*(1+jobBonus('stMaxPct')/100); return v; }
function atkRange(){ const w=eqOf('weapon'); return (w?(w.range||1):1) + techBonus('rangeAdd'); }
function moveRange(){ return 3 + eqSum('move') + techBonus('move') + Math.floor(baseSpd()/20); }
function statCrit(){ return Math.min(100, eqSum('crit') + techBonus('crit') + geneBonus('crit') + jobBonus('crit')); }
function statCritDmg(){ return 150 + eqSum('critDmg') + techBonus('critDmg') + geneBonus('critDmg') + jobBonus('critDmg'); }
function statLS(){ return eqSum('ls') + techBonus('ls'); }
function statDodge(){ return Math.min(60, eqSum('dodge') + techBonus('dodge') + geneBonus('dodge') + jobBonus('dodge')); }
function statHit(){ return 95 + eqSum('hit') + techBonus('hit') + geneBonus('hit'); }
function statPen(){ return Math.min(90, eqSum('pen') + techBonus('pen') + geneBonus('pen') + jobBonus('pen')); }
function shieldMax(){ return eqSum('shield') + techBonus('shield'); }
function weaponAtk(){ return eqSum('atk'); }
function has(id){ return (state.inv[id]||0)>0; }
function armorImmune(kind){ for(const sl in P().equip){ const it=eqOf(sl); if(it&&it.imm===kind) return true; } return false; }
function fragmentCount(){ return state.meta.fragments.length; }
function gainMat(id,n){ if(n<=0)return; state.inv[id]=(state.inv[id]||0)+n; state.runStats.mat+=n; }
function skillLv(k){ return Math.floor((state.skills[k]?state.skills[k].prof:0)/10); }
function skillAtkBonus(){ let s=0; for(const k in SKILLS)s+=skillLv(k); return s; }

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
function questState(id){ const v=state.quests&&state.quests[id]; return v===true?'done':(v||'locked'); }
function questDone(id){ return questState(id)==='done'; }
function questActive(id){ return questState(id)==='active'; }
function questReqsDone(q){ return (q.after||[]).every(questDone); }
function questSearchCount(q){ const start=(state.questStart&&state.questStart[q.id])||0; return Math.max(0,(state.areaSearch[q.target]||0)-start); }
function questProgress(q){
  if(q.type==='search') return Math.min(q.count,questSearchCount(q))+'/'+q.count;
  if(q.type==='visit') return (P().location===q.target||state.visited[q.target])?'已抵达':'未抵达';
  if(q.type==='condition') return (techKnown('make_1')?'科技✓':'科技✗')+' · '+(state.meta.built.smelt?'熔炉✓':'熔炉✗');
  if(q.type==='submit') return Object.entries(q.need).map(([k,v])=>ITEMS[k].name+' '+(state.inv[k]||0)+'/'+v).join(' · ');
  if(q.type==='boss') return state.meta.guardianDown?'已击败':'未击败';
  if(q.type==='flag') return state.flags[q.targetFlag]?'现场目标已完成':'等待现场互动';
  if(q.id==='bridge') return state.flags.commandDecoded?('舰桥记录已还原 · 完整证据 '+['故障线','内鬼线','信号线'].filter(evidenceReady).length+'/3'):('舰桥核心记录 '+Math.min(2,state.areaSearch.layer6||0)+'/2');
  return '';
}
function activateAvailableQuests(announce){
  let changed=false;
  QUESTS.forEach(q=>{ if(questState(q.id)==='locked'&&questReqsDone(q)){ state.quests[q.id]='active';
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
  state.quests[id]='done';
  if(q.reward&&q.reward.items) for(const[k,v] of Object.entries(q.reward.items)){ gainMat(k,v); if(announce)log('获得:'+ITEMS[k].name+'×'+v,'good'); }
  if(q.reward&&q.reward.flag) state.flags[q.reward.flag]=true;
  if(q.reward&&q.reward.reveal&&announce) log('◈ 地图更新：发现隐藏区域【'+LOCATIONS[q.reward.reveal].name+'】','good');
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
      else if(q.type==='boss') done=!!state.meta.guardianDown;
      else if(q.type==='flag') done=!!state.flags[q.targetFlag];
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
function locationGate(id){
  if(!locationRevealed(id)) return {ok:false,text:'尚未发现入口'};
  const gates={
    layer2:['first_fire','先完成【第一座熔炉】'],layer3:['drain','先完成【恢复排水】'],layer4:['seal','先完成【封堵泄漏】'],
    layer5:['sample','先完成【失控样本】'],layer6:['patrol','先完成【失联巡逻队】'],layer7:['bridge','先完成【最后七十二小时】'],
    fungal:['sample','先确认实验体与信号的关系'],abyss:['spore','先完成【穿过菌幕】'],signal:['relay','先修复深井中继器']
  };
  const g=gates[id]; if(g&&!questDone(g[0])) return {ok:false,text:g[1]};
  if(LOCATIONS[id]&&LOCATIONS[id].needCard&&!has('accessCard')) return {ok:false,text:'需要指挥权限卡'};
  return {ok:true,text:''};
}
function locationRevealed(id){ const loc=LOCATIONS[id]; return !!loc&&(!loc.hiddenBy||!!state.flags[loc.hiddenBy]); }
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
function moveCost(from,to){ const a=LOCATIONS[from],b=LOCATIONS[to]; return state.flags.ridgeRoute&&a&&b&&a.zone==='地表'&&b.zone==='地表'?1:Math.max(1,2-(endingOwned('starchart')?1:0)); }
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
function spendStamina(base){ const t=base+locExtraCost(); P().stamina-=t; return t; }
function advanceTime(h){ state.time += (h||1); }
function fmtTime(){ const total=8+state.time, day=Math.floor(total/24)+1, hh=total%24; return '第'+day+'天 '+String(hh).padStart(2,'0')+':00'; }
function currentDay(){ return Math.floor((8+state.time)/24)+1; }
function buildingLevel(id){ return Math.max(1,(state.meta.buildLevels&&state.meta.buildLevels[id])||1); }
function facilityUsedToday(id){ return state.dailyFacility[id]===currentDay(); }
function gatherLimit(id){ const p=LOCATIONS[id]&&LOCATIONS[id].profile; return p==='mine'?3:2; }
function gatherCountToday(id){ const d=state.dailyGather[id]; return d&&d.day===currentDay()?d.count:0; }
function gatherAvailable(id){ return Math.max(0,gatherLimit(id)-gatherCountToday(id)); }
function recordGather(id){ const day=currentDay(),d=state.dailyGather[id]; if(!d||d.day!==day)state.dailyGather[id]={day,count:1};else d.count++; }
function infectionTick(){ if(!P().infected)return true; P().hp-=2; log('感染发作：生命 -2。','danger'); if(P().hp<=0){die();return false;} return true; }
function emergencyEvacuate(){
  if(P().location==='camp'||state.combat)return;
  const lost=[],warehouse=state.meta.built.warehouse?buildingLevel('warehouse'):0,lossRate=Math.max(.25,.35-Math.max(0,warehouse-1)*.05);
  MATS.forEach(id=>{ const before=state.checkpoint&&state.checkpoint.inv?(state.checkpoint.inv[id]||0):0,earned=Math.max(0,(state.inv[id]||0)-before),n=Math.ceil(earned*lossRate); if(n){state.inv[id]-=n;lost.push(ITEMS[id].name+'×'+n);} });
  P().location='camp'; P().stamina=Math.max(5,Math.round(maxStamina()*.2)); P().hp=Math.max(1,P().hp); state.mapOpen=false; state.campBuilding=null; advanceTime(6);
  divider(); log('你启动应急定位器，被营地搜索队带回。','warn'); log(lost.length?'撤离中遗失：'+lost.join('、'):'本次没有遗失材料。','dim'); divider(); render();
}

/* ================= 存档点/结算 ================= */
function snapshot(){ return JSON.parse(JSON.stringify({player:P(),inv:state.inv,defenses:state.defenses,rests:state.rests,skills:state.skills,quests:state.quests,questStart:state.questStart,flags:state.flags,areaSearch:state.areaSearch,dailyGather:state.dailyGather,dailyFacility:state.dailyFacility,truthClaimed:state.truthClaimed,visited:state.visited,runStats:state.runStats,kills:state.kills,time:state.time,meta:state.meta})); }
function updateCheckpoint(){ state.checkpoint=snapshot(); }
function restoreCheckpoint(){ const s=JSON.parse(JSON.stringify(state.checkpoint));
  state.player=s.player;state.inv=s.inv;state.defenses=s.defenses;state.rests=s.rests;state.skills=s.skills;state.quests=s.quests;state.questStart=s.questStart||{};state.flags=s.flags||{};state.areaSearch=s.areaSearch||{};state.dailyGather=s.dailyGather||{};state.dailyFacility=s.dailyFacility||{};state.truthClaimed=s.truthClaimed||null;state.visited=s.visited;state.runStats=s.runStats;state.kills=s.kills;state.time=s.time;state.meta=s.meta||state.meta;
  state.combat=null;state.screen='play';state.tab='act'; }
function settleEcho(){ const r=state.runStats;
  const fromKills=Math.floor(r.wKill/20), fromDmg=Math.floor(r.dmg/150), fromMat=Math.floor(r.mat/25);
  const raw=fromKills+fromDmg+fromMat,total=Math.round(raw*(endingOwned('echoHeart')?1.25:1));
  return {total, fromKills, fromDmg, fromMat, kills:r.kills, wKill:r.wKill, dmg:r.dmg, mat:r.mat}; }

const SAVE_KEY='abyss_echo_v2';
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){} }
function load(){ try{ const r=localStorage.getItem(SAVE_KEY); if(r){state=JSON.parse(r);return true;} }catch(e){} return false; }

/* ================= DOM ================= */
const $=id=>document.getElementById(id);
function setLogOpen(open){
  const tray=$('log'),peek=$('log-peek'); if(!tray||!peek)return;
  const yes=!!open&&tray.childElementCount>0;
  tray.classList.toggle('collapsed',!yes); peek.setAttribute('aria-expanded',yes?'true':'false');
  const label=peek.querySelector('.lp-label'); if(label)label.textContent=yes?'收起记录':'查看记录';
  if(yes)peek.classList.remove('unread');
}
function log(msg,cls){ const out=$('log'),peek=$('log-peek'),latest=$('log-latest'); const d=document.createElement('div'); d.className='line '+(cls||'story'); d.textContent=msg; out.appendChild(d); out.scrollTop=out.scrollHeight;
  if(peek){ peek.classList.remove('hidden'); peek.classList.add('unread'); } if(latest)latest.textContent=msg; }
function divider(){ const el=$('log'); const d=document.createElement('div'); d.className='line divider'; el.appendChild(d); el.scrollTop=el.scrollHeight; }
function el(tag,cls,html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
function btn(a){ const b=el('button',a.cls, a.label+(a.cost?'<span class="cost">'+a.cost+'</span>':'')); if(a.disabled)b.disabled=true; b.onclick=a.fn; return b; }
function grid(box,items,one){ const g=el('div','grid'+(one?' one':'')); items.forEach(a=>g.appendChild(btn(a))); box.appendChild(g); }
function tileCard(icon,name,desc,onclick,opts){ opts=opts||{}; const b=el('button','tilecard'+(opts.lock?' lock':''));
  b.innerHTML='<span class="tile">'+(opts.lock?'🔒':icon)+'</span><span class="tbody"><span class="tname">'+name+'</span><span class="tdesc">'+desc+'</span></span>';
  if(onclick)b.onclick=onclick; else b.disabled=true; return b; }
function title(box,t){ box.appendChild(el('div','panel-title',t)); }
function statTags(it){ const a=[]; if(it.atk)a.push('攻+'+it.atk); if(it.range)a.push('距离'+it.range); if(it.def)a.push('防+'+it.def); if(it.hp)a.push('生命+'+it.hp); if(it.spd)a.push('速+'+it.spd); if(it.move)a.push('移距+'+it.move); if(it.crit)a.push('暴击+'+it.crit+'%'); if(it.critDmg)a.push('暴伤+'+it.critDmg+'%'); if(it.ls)a.push('吸血+'+it.ls+'%'); if(it.dodge)a.push('闪避+'+it.dodge+'%'); if(it.hit)a.push('命中+'+it.hit); if(it.pen)a.push('穿透+'+it.pen+'%'); if(it.shield)a.push('护盾+'+it.shield); if(it.exec)a.push('斩杀'); if(it.imm)a.push(it.imm==='radiation'?'免疫辐射':'免疫污染'); return a.join(' '); }

function renderTop(){
  const maxh=maxHp(), maxs=Math.round(maxStamina());
  P().hp=Math.min(P().hp,maxh); P().stamina=Math.min(P().stamina,maxs);
  $('hp').textContent=Math.max(0,P().hp)+'/'+maxh; $('hp-fill').style.width=Math.max(0,P().hp/maxh*100)+'%';
  $('stamina').textContent=P().stamina+'/'+maxs; $('st-fill').style.width=Math.max(0,P().stamina/maxs*100)+'%';
  $('time').textContent=fmtTime();
  $('loc-label').textContent=LOCATIONS[P().location].name;
  $('pt-label').textContent='第'+state.meta.playthrough+'周目';
  $('echo-label').textContent='回响 '+state.meta.echo;
  $('frag-label').textContent='碎片 '+fragmentCount()+'/3';
}
function renderTabbar(){ document.querySelectorAll('#tabbar .tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===state.tab)); const sb=$('set-btn'); if(sb) sb.classList.toggle('on', state.tab==='set'); }
function render(){ renderTop(); const box=$('panel'); box.innerHTML=''; box.classList.remove('camp-home');
  const panelOpen = !state.combat && state.screen==='play' && state.tab!=='act';
  $('app').classList.toggle('panel-open', panelOpen);
  if (panelOpen && state.tab!=='tech'){ const cb=el('div','closebar');
    const x=el('button','closebtn','✕'); x.setAttribute('aria-label','关闭');
    x.onclick=()=>{ state.tab='act'; state.campBuilding=null; state.bagSel=null; render(); };
    const t=el('span','ctitle',({char:'角色',bag:'背包',tech:'科技',task:'任务',set:'设置'})[state.tab]||'');
    cb.appendChild(x); cb.appendChild(t); box.appendChild(cb); }
  box.classList.toggle('tech-full', state.tab==='tech');
  renderPanel(box); renderTabbar(); save(); }
function renderPanel(box){
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

/* ---------- 行动 ---------- */
function mapNodeState(id){
  if(!locationRevealed(id)) return 'hidden';
  if(id===P().location) return 'current';
  const seen=id==='camp'||!!state.visited[id];
  if(isAdjacent(P().location,id)){ return locationGate(id).ok?'reachable':'locked'; }
  if(seen) return 'visited';
  const revealed=neighbors(id).some(n=>n==='camp'||state.visited[n]||n===P().location);
  return revealed?'known':'unknown';
}
function renderWorldMap(box){
  const wrap=el('div','worldmap-wrap');
  const head=el('div','worldmap-head','<span class="wm-title"><b>区域地图</b><small>滚轮缩放 · 拖拽移动 · 点击地点查看路线</small></span>');
  const tools=el('div','map-tools');
  const zoomOut=el('button','map-tool','−'),zoomText=el('span','map-zoom'),zoomIn=el('button','map-tool','＋'),locate=el('button','map-tool','◎');
  locate.title='定位当前位置';
  const close=el('button','map-close','收起'); close.onclick=()=>{state.mapOpen=false;render();};
  tools.append(zoomOut,zoomText,zoomIn,locate,close);head.appendChild(tools);wrap.appendChild(head);
  const sc=el('div','worldmap-scroll'),stage=el('div','worldmap-stage'),cv=el('div','worldmap');
  const NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','maplines'); svg.setAttribute('viewBox','0 0 '+MAP_CANVAS.width+' '+MAP_CANVAS.height);
  MAP_LINKS.forEach(([a,b])=>{ if(!locationRevealed(a)||!locationRevealed(b))return; const pa=WORLD_POS[a],pb=WORLD_POS[b], line=document.createElementNS(NS,'path');
    const ax=pa[0]+MAP_CANVAS.nodeWidth/2,ay=pa[1]+MAP_CANVAS.nodeHeight/2,bx=pb[0]+MAP_CANVAS.nodeWidth/2,by=pb[1]+MAP_CANVAS.nodeHeight/2,mx=(ax+bx)/2;
    line.setAttribute('d','M'+ax+','+ay+' L'+mx+','+ay+' L'+mx+','+by+' L'+bx+','+by);
    const on=(state.visited[a]||a===P().location||a==='camp')&&(state.visited[b]||b===P().location||b==='camp');
    line.setAttribute('class','mapedge'+(on?' on':'')); svg.appendChild(line);
  });
  cv.appendChild(svg);
  [['地表资源线',205,4,'surface'],['船内主线',205,164,'ship'],['地下信号线',410,300,'depth']].forEach(([t,x,y,c])=>{ const l=el('div','maplane '+c,t);l.style.left=x+'px';l.style.top=y+'px';cv.appendChild(l); });
  const nodes=[];
  Object.entries(WORLD_POS).forEach(([id,p])=>{ if(!locationRevealed(id))return; const loc=LOCATIONS[id],st=mapNodeState(id),gate=locationGate(id),n=el('button','mapnode '+st);
    n.style.left=p[0]+'px'; n.style.top=p[1]+'px'; n.dataset.loc=id;
    const visible=st!=='unknown'; n.innerHTML='<span class="mn-icon">'+(visible?loc.icon:'?')+'</span><span class="mn-copy"><span class="mn-zone">'+(visible?loc.zone:'未测绘')+'</span><span class="mn-name">'+(visible?loc.name:'未知区域')+'</span></span>'+(st==='locked'?'<span class="mn-lock">'+gate.text+'</span>':'');
    n.onclick=()=>selectLocation(id); nodes.push(n); cv.appendChild(n);
  });
  stage.appendChild(cv);sc.appendChild(stage);wrap.appendChild(sc);
  const detail=el('div','map-detail');wrap.appendChild(detail);box.appendChild(wrap);

  let selected=locationRevealed(state.mapSelected)?state.mapSelected:P().location;
  state.mapSelected=selected;
  function renderDetails(){
    nodes.forEach(n=>n.classList.toggle('selected',n.dataset.loc===selected));
    const loc=LOCATIONS[selected],st=mapNodeState(selected),gate=locationGate(selected),known=st!=='unknown',route=known?travelRoute(P().location,selected):null;
    const routeNames=route?route.path.map(id=>LOCATIONS[id].name).join(' → '):'';
    let status='尚未建立可通行路线';
    if(selected===P().location) status='你当前就在这里';
    else if(!gate.ok) status=gate.text;
    else if(st==='unknown') status='先从相邻区域完成测绘';
    else if(route) status='最短路线 '+(route.path.length-1)+' 段 · 消耗 '+route.cost+' 体力';
    detail.innerHTML='<div class="md-mark">'+(known?loc.icon:'?')+'</div><div class="md-copy"><small>'+(known?loc.zone:'未测绘区域')+'</small><b>'+(known?loc.name:'未知区域')+'</b><p>'+(known?loc.desc:'地图只记录了大致方向，尚无该区域的可靠情报。')+'</p><em>'+status+(route&&route.path.length>1?' · '+routeNames:'')+'</em></div>';
    const go=el('button','map-go',selected===P().location?'当前位置':'前往');
    go.disabled=!route||route.cost===0||P().stamina<route.cost;
    if(route&&route.cost>P().stamina)go.textContent='体力不足';
    go.onclick=()=>travelTo(selected);
    detail.appendChild(go);
  }
  function selectLocation(id){ selected=id;state.mapSelected=id;renderDetails(); }
  renderDetails();

  const view=state.mapView||(state.mapView={scale:.82,x:null,y:null});
  function clampView(){
    const sw=stage.clientWidth,sh=stage.clientHeight,w=MAP_CANVAS.width*view.scale,h=MAP_CANVAS.height*view.scale;
    view.x=w<=sw?(sw-w)/2:Math.min(12,Math.max(sw-w-12,view.x));
    view.y=h<=sh?(sh-h)/2:Math.min(12,Math.max(sh-h-12,view.y));
  }
  function applyView(){clampView();cv.style.transform='translate('+view.x+'px,'+view.y+'px) scale('+view.scale+')';zoomText.textContent=Math.round(view.scale*100)+'%';}
  function centerOn(id){ const p=WORLD_POS[id]||WORLD_POS.camp;view.x=stage.clientWidth/2-(p[0]+MAP_CANVAS.nodeWidth/2)*view.scale;view.y=stage.clientHeight/2-(p[1]+MAP_CANVAS.nodeHeight/2)*view.scale;applyView(); }
  function setZoom(next,cx,cy){
    const old=view.scale;next=Math.min(1.45,Math.max(.58,next));if(Math.abs(next-old)<.001)return;
    cx=cx==null?stage.clientWidth/2:cx;cy=cy==null?stage.clientHeight/2:cy;
    view.x=cx-(cx-view.x)*(next/old);view.y=cy-(cy-view.y)*(next/old);view.scale=next;applyView();
  }
  zoomOut.onclick=()=>setZoom(view.scale-.12);zoomIn.onclick=()=>setZoom(view.scale+.12);locate.onclick=()=>centerOn(P().location);
  stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();setZoom(view.scale+(e.deltaY<0?.1:-.1),e.clientX-r.left,e.clientY-r.top);},{passive:false});
  let drag=null;
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,ox:view.x,oy:view.y};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
  stage.addEventListener('pointermove',e=>{if(!drag)return;view.x=drag.ox+e.clientX-drag.x;view.y=drag.oy+e.clientY-drag.y;applyView();});
  stage.addEventListener('pointerup',e=>{drag=null;stage.classList.remove('dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);});
  requestAnimationFrame(()=>{if(view.x==null||view.y==null)centerOn(P().location);else applyView();});
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
function currentObjectiveQuest(){
  const here=P().location;
  return QUESTS.find(q=>questActive(q.id)&&q.line!=='main'&&(q.turnAt===here||q.target===here))||QUESTS.find(q=>q.line==='main'&&questActive(q.id))||QUESTS.find(q=>questActive(q.id))||null;
}
function renderObjectiveStrip(box){
  const q=currentObjectiveQuest(); if(!q)return;
  const d=el('button','objective-strip');
  d.innerHTML='<span class="obj-kicker">'+q.chapter+' · 当前目标</span><span class="obj-main"><b>'+q.title+'</b><small>'+q.objective+'</small></span><span class="obj-progress">'+(questProgress(q)||'进行中')+' <i>→</i></span>';
  d.onclick=()=>{state.tab='task';render();}; box.appendChild(d);
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
}
function renderPanelTop(){ render(); requestAnimationFrame(()=>{const panel=$('panel');if(panel)panel.scrollTop=0;}); }
function openCampBuilding(id){ state.campBuilding=id; state.campView='home'; setLogOpen(false); renderPanelTop(); }
function renderCampHero(box){ const built=CAMP_BUILDINGS.filter(b=>state.meta.built[b.id]).length,nextRaid=state.flags.firstRaidSurvived?Math.max(0,3-(state.rests-(state.flags.lastRaidRest||0))):null;
  const hero=el('section','camp-hero'); hero.innerHTML='<div class="camp-orbit"><i></i><i></i><span>⌂</span></div><div class="camp-hero-copy"><small>ARK // SURVIVOR HUB</small><h1>方舟营地</h1><p>炉火、床铺与工坊一点点占据废弃舱段。这里的样子由你建成。</p><div class="camp-metrics"><b>'+built+'<em>设施</em></b><b>'+defensePower()+'<em>防御</em></b><b>'+(nextRaid==null?'未触发':nextRaid)+'<em>'+(nextRaid==null?'夜袭':'次休息')+'</em></b></div></div>'; box.appendChild(hero); }
function renderCampHome(box){ state.campBuilding=null; state.campView='home'; box.classList.add('camp-home');
  renderCampHero(box);
  const mapbar=el('div','camp-mapbar camp-mapbar-top');const mapbtn=el('button','camp-map-toggle','<span>⌘</span><b>'+(state.mapOpen?'收起区域地图':'查看区域地图')+'</b><em>路线与已发现区域</em>');mapbtn.onclick=()=>{state.mapOpen=!state.mapOpen;render();};mapbar.appendChild(mapbtn);box.appendChild(mapbar);if(state.mapOpen)renderWorldMap(box);
  const unlocked=CAMP_BUILDINGS.filter(b=>!state.meta.built[b.id]&&hasBuildingTech(b.id)).length;
  const construction=el('button','camp-command-card construction camp-construction','<span class="cc-icon">⌁</span><span><small>CONSTRUCTION</small><b>建筑管理</b><em>'+(unlocked?'有 '+unlocked+' 项设施可以建造':'研究科技解锁新设施')+'</em></span><i>→</i>');construction.onclick=()=>{state.campView='construct';setLogOpen(false);renderPanelTop();};box.appendChild(construction);
  const head=el('div','camp-section-head','<span><small>BUILT FACILITIES</small><b>已建营地</b></span><em>点击建筑进入</em>');box.appendChild(head);
  const layout=el('div','camp-layout');
  CAMP_BUILDINGS.filter(b=>state.meta.built[b.id]).forEach(b=>{ const damaged=!!state.meta.damaged[b.id],lv=buildingLevel(b.id),card=el('button','camp-facility '+b.tone+(damaged?' damaged':''));
    card.innerHTML='<span class="cf-glow"></span><span class="cf-icon">'+(damaged?'⚠️':b.icon)+'</span><span class="cf-copy"><small>'+(damaged?'OFFLINE':'LEVEL 0'+lv)+'</small><b>'+b.name+'</b><em>'+(damaged?'受损停用 · 废铁×3修复':b.desc)+'</em></span><i>›</i>';
    card.onclick=damaged?()=>repairFacility(b.id):()=>openCampBuilding(b.id); layout.appendChild(card); }); box.appendChild(layout);
  const depart=el('div','camp-depart-dock');const expedition=el('button','camp-command-card expedition camp-depart','<span class="cc-icon">◈</span><span><small>EXPEDITION</small><b>离开营地</b><em>前往地表坠毁带 · 体力 -2</em></span><i>→</i>');expedition.onclick=()=>move('outer');depart.appendChild(expedition);box.appendChild(depart);
}
function renderConstruction(box){ state.campBuilding=null; state.campView='construct'; const top=el('div','facility-nav'); const back=el('button','facility-back','‹');back.setAttribute('aria-label','返回营地');back.onclick=()=>{state.campView='home';renderPanelTop();};top.appendChild(back);top.appendChild(el('div','facility-nav-title','<small>CONSTRUCTION</small><b>建筑管理</b><em>只显示科技已解锁的设施</em>'));box.appendChild(top);
  const available=CAMP_BUILDINGS.filter(b=>!state.meta.built[b.id]&&hasBuildingTech(b.id));
  const summary=el('div','build-summary','<span><b>'+available.length+'</b><small>可建造设施</small></span><p>新建筑完成后会出现在营地主页；升级在各建筑内部进行。</p>');box.appendChild(summary);
  if(!available.length){box.appendChild(el('div','build-empty','<span>⌁</span><b>当前没有新的建筑蓝图</b><p>继续探索并在科技树研究建筑类节点，解锁后会自动出现在这里。</p>'));return;}
  const list=el('div','build-list');available.forEach(b=>{const can=canAfford(b.cost),card=el('article','build-card '+b.tone);card.innerHTML='<div class="build-card-main"><span class="bc-icon">'+b.icon+'</span><span><small>NEW FACILITY</small><b>'+b.name+'</b><em>'+b.desc+'</em></span></div><div class="build-cost">'+costText(b.cost)+'</div>';const action=el('button',can?'primary':'','建造 '+b.name);action.disabled=!can;action.onclick=()=>buildFacility(b);card.appendChild(action);list.appendChild(card);});box.appendChild(list);
}
function renderActPanel(box){
  const loc=P().location;
  if(loc==='camp'){
    if(state.campBuilding&&state.meta.built[state.campBuilding])return renderBuilding(box,state.campBuilding);
    if(state.campView==='construct')return renderConstruction(box);
    return renderCampHome(box);
  }
  const here=LOCATIONS[loc],profile=REGION_PROFILES[here.profile];
  const threats=(here.enemies||[]).map(id=>ENEMIES[id].name).join('、')||'无主动威胁';
  const resources=Object.keys(here.loot||{}).slice(0,4).map(id=>ITEMS[id].name).join(' · ');
  const info=el('div','scene-card '+(profile?profile.tone:'camp'));
  info.innerHTML='<div class="scene-mark">'+here.icon+'</div><div class="scene-copy"><span class="lc-zone">'+here.zone+' / '+(profile?profile.label:'安全区')+'</span><b>'+here.name+'</b><span>'+here.desc+'</span><div class="scene-tags"><i>资源 '+(resources||'营地设施')+'</i><i>威胁 '+threats+'</i>'+(here.npc?'<i class="npc">NPC '+here.npc+'</i>':'')+'</div></div>';
  box.appendChild(info);
  renderObjectiveStrip(box);
  const mapped=Object.keys(LOCATIONS).filter(id=>locationRevealed(id)&&(id==='camp'||state.visited[id]||id===loc)).length;
  const mapbar=el('div','explore-tools explore-tools-top');
  const mapbtn=el('button','map-toggle','<span>⌘</span><b>'+(state.mapOpen?'收起区域地图':'打开区域地图')+'</b><small>已测绘 '+mapped+' 个区域</small>');
  mapbtn.onclick=()=>{state.mapOpen=!state.mapOpen;render();}; mapbar.appendChild(mapbtn); box.appendChild(mapbar);
  if(state.mapOpen) renderWorldMap(box);
  const extra=locExtraCost();
  const ag=el('div','region-actions');
  (profile.actions||[]).forEach(a=>{ const cost=(a.mode==='gather'?2:1)+extra,b=el('button','region-action '+(a.mode==='investigate'?'primary':'') );
    const eventIndex=state.areaSearch[loc]||0,eventTotal=(AREA_EVENTS[loc]||[]).length,eventPending=a.mode==='investigate'&&eventIndex<eventTotal;
    const remaining=a.mode==='gather'?gatherAvailable(loc):null;
    const hazard=here.contamination&&!armorImmune('contamination')?' · 生命 -3':'';
    const actionMeta=(a.mode==='gather'?(remaining?'今日剩余 '+remaining+' 次 · 体力 -'+cost:'今日资源已回收完 · 次日刷新'):(eventPending?('新线索 '+(eventIndex+1)+'/'+eventTotal+' · 体力 -'+cost):('体力 -'+cost)))+hazard;
    const actionDesc=a.mode==='investigate'&&eventTotal&&!eventPending?'固定线索已查清；继续调查只推进当前调查任务':a.desc;
    b.innerHTML='<span class="ra-icon">'+a.icon+'</span><span class="ra-copy"><b>'+a.name+'</b><small>'+actionDesc+'</small><em>'+actionMeta+'</em></span>';
    if(a.mode==='gather'&&!remaining)b.disabled=true; else b.onclick=()=>explore(a.mode); ag.appendChild(b); });
  if(here.npc){ here.npc.split('、').forEach(name=>{ const b=el('button','region-action npc-action'); b.innerHTML='<span class="ra-icon">◉</span><span class="ra-copy"><b>与'+name+'交谈</b><small>询问任务、线索与当前区域情报</small><em>不消耗体力</em></span>'; b.onclick=()=>talkAreaNpc(name); ag.appendChild(b); }); }
  box.appendChild(ag);
  const route=el('div','route-panel','<div class="route-title"><b>可通行路线</b><span>相邻区域移动消耗体力</span></div>');
  const rg=el('div','route-list');
  neighbors(loc).forEach(id=>{ const g=locationGate(id),nl=LOCATIONS[id],cost=moveCost(loc,id),b=el('button','routebtn'+(g.ok?'':' locked'));
    b.innerHTML='<span>'+nl.icon+'</span><b>'+nl.name+'</b><small>'+(g.ok?'前往 · 体力 -'+cost:g.text)+'</small>'; b.disabled=!g.ok||P().stamina<cost; if(g.ok&&P().stamina>=cost)b.onclick=()=>move(id); rg.appendChild(b); });
  route.appendChild(rg); box.appendChild(route);
  const backNeed=staminaToCamp(loc),evac=el('div','evac-panel');
  evac.innerHTML='<span><b>返程保障</b><small>沿已知最短路线返回营地需要 '+(Number.isFinite(backNeed)?backNeed:'未知')+' 体力；体力耗尽也不会被困住。</small></span>';
  const eb=el('button',P().stamina<backNeed?'danger':'','紧急撤离'); eb.onclick=emergencyEvacuate; evac.appendChild(eb); box.appendChild(evac);
  renderLocalQuestActions(box);
  if(P().infected) grid(box,[{label:'用血清清感染',cost:has('serum')?'清除':'无血清',disabled:!has('serum'),cls:'danger',fn:()=>useItem('serum')}],true);
}

/* ---------- 角色(纯展示) ---------- */
function renderCharPanel(box){
  title(box,'<b>角色</b> · Lv'+P().level+' · 经验 '+P().xp+'/'+xpNeed(P().level));
  const xg=el('div','xpbar'); xg.innerHTML='<div class="xpfill" style="width:'+Math.min(100,P().xp/xpNeed(P().level)*100)+'%"></div>'; box.appendChild(xg);
  const cells=[['生命',Math.max(0,P().hp)+'/'+maxHp()],['体力',P().stamina+'/'+Math.round(maxStamina())],['攻击',totalAtk()],['防御',totalDef()],['速度',baseSpd()],['护盾',(P().shield||0)+'/'+shieldMax()],['攻击距离',atkRange()],['移动距离',moveRange()],['暴击率',statCrit()+'%'],['暴击伤害',statCritDmg()+'%'],['生命偷取',statLS()+'%'],['闪避',statDodge()+'%'],['命中',statHit()+'%'],['护甲穿透',statPen()+'%']];
  const g=el('div','statlist'); cells.forEach(c=>g.appendChild(el('div','srow','<span class="k">'+c[0]+'</span><span class="v">'+c[1]+'</span>'))); box.appendChild(g);
  if(P().infected) box.appendChild(el('div','warnline','⚠ 感染中:每个动作掉生命,需抗感染血清'));
  title(box,'技能'); grid(box, Object.keys(SKILLS).map(k=>({label:SKILLS[k].name+' Lv'+skillLv(k),cost:SKILLS[k].desc,disabled:true})));
  title(box,'回响强化 · 可用回响 '+state.meta.echo);
  grid(box,Object.entries(ECHO_UPGRADES).map(([id,e])=>{const lv=state.meta.echoUp[id]||0,cost=echoUpgradeCost(id);return {label:e.name+' Lv'+lv,cost:e.desc+' · 回响×'+cost,disabled:state.meta.echo<cost,cls:state.meta.echo>=cost?'primary':'',fn:()=>buyEchoUpgrade(id)};}));
  /* 基因锁 */
  title(box,'基因锁 · '+geneTier()+'/'+GENES.length+'阶');
  const gt=geneTier();
  if(gt>0){
    const sum={}; for(let i=0;i<gt;i++) for(const k in GENES[i].bonus) sum[k]=(sum[k]||0)+GENES[i].bonus[k];
    const tags=[]; for(const k in sum){ const lbl={hp:'生命',atk:'攻击',def:'防御',spd:'速度',crit:'暴击%',critDmg:'暴伤%',dodge:'闪避%',hit:'命中',pen:'穿透%',stMax:'体力上限'}[k]||k; tags.push(lbl+'+'+sum[k]); }
    box.appendChild(el('div','genecur','已激活加成: '+tags.join(' · ')));
  }
  if(gt<GENES.length){
    const next=GENES[gt]; const can=Object.entries(next.cost).every(([k,v])=>(state.inv[k]||0)>=v);
    const cs=Object.entries(next.cost).map(([k,v])=>ITEMS[k].name+'×'+v).join(' ');
    const nb=[]; for(const k in next.bonus){ const lbl={hp:'生命',atk:'攻击',def:'防御',spd:'速度',crit:'暴击%',critDmg:'暴伤%',dodge:'闪避%',hit:'命中',pen:'穿透%',stMax:'体力上限'}[k]||k; nb.push(lbl+'+'+next.bonus[k]); }
    const card=el('div','genenext');
    card.innerHTML='<div class="gn-name">🧬 '+next.name+'</div><div class="gn-desc">'+next.desc+'</div><div class="gn-bonus">'+nb.join(' · ')+'</div><div class="gn-cost">'+cs+'</div>';
    const b=el('button',can?'primary':'',can?'解锁':'材料不足'); b.disabled=!can; b.onclick=unlockGene; card.appendChild(b); box.appendChild(card);
  } else { box.appendChild(el('div','genemax','✓ 基因锁已全部解锁')); }
  /* 职业 */
  title(box,'职业');
  const cls=state.meta.job||null;
  if(cls){
    const j=JOBS[cls]; box.appendChild(el('div','jobcur','✦ '+j.name+' — '+j.desc));
  } else {
    box.appendChild(el('div','jobhint','达到条件后可选择一种职业(跨周目保留)'));
    const g2=el('div','grid one');
    for(const id in JOBS){ const j=JOBS[id]; const met=checkJobReq(id);
      const b=el('button',met?'primary':''); b.disabled=!met;
      b.innerHTML=j.name+'<span class="cost">'+j.reqText+(met?'':' (未达成)')+'</span>';
      b.onclick=(()=>{const _id=id;return ()=>chooseJob(_id);})(); g2.appendChild(b); }
    box.appendChild(g2);
  }
}
function unlockGene(){ const gt=geneTier(); if(gt>=GENES.length)return; const g=GENES[gt];
  for(const[k,v] of Object.entries(g.cost)){ if((state.inv[k]||0)<v){log('材料不足。','warn');return;} }
  for(const[k,v] of Object.entries(g.cost)) state.inv[k]-=v;
  state.meta.gene=gt+1; P().gene=gt+1; log('🧬 基因锁突破 → '+g.name+'!','good'); divider(); render(); }

/* ---------- 背包:纸娃娃(小人 + 引线指部位) + 物品栏 ---------- */
const DOLL_W=340, DOLL_H=268;
// cx/cy=槽块中心, ax/ay=小人身上锚点(同一侧按锚点 y 升序排,保证引线不交叉)
const DOLL_L={ head:{cx:44,cy:52,ax:150,ay:50}, body:{cx:44,cy:130,ax:142,ay:110}, legs:{cx:44,cy:206,ax:150,ay:192},
  acc:{cx:296,cy:52,ax:192,ay:84}, weapon:{cx:296,cy:130,ax:224,ay:116}, offhand:{cx:296,cy:206,ax:210,ay:152} };
const DOLL_ORDER=['head','body','legs','acc','weapon','offhand'];
function dollArt(){
  const lit=s=>eqOf(s)?' on':'';
  const lead=s=>{ const p=DOLL_L[s], left=p.cx<DOLL_W/2, w=eqOf(s)?' on':'',
      x1=left?p.cx+25:p.cx-25, x2=left?p.cx+46:p.cx-46;
    return '<polyline class="ld'+w+'" points="'+x1+','+p.cy+' '+x2+','+p.cy+' '+p.ax+','+p.ay+'"/>'
      +'<circle class="dt'+w+'" cx="'+p.ax+'" cy="'+p.ay+'" r="2.8"/>'; };
  return '<svg class="dollart" viewBox="0 0 '+DOLL_W+' '+DOLL_H+'" preserveAspectRatio="none">'
    +'<defs><linearGradient id="dpl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2c3d"/><stop offset="1" stop-color="#0b131c"/></linearGradient>'
    +'<linearGradient id="dplOn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5c74"/><stop offset="1" stop-color="#10293a"/></linearGradient></defs>'
    +'<ellipse class="halo" cx="170" cy="250" rx="62" ry="8"/>'
    +'<g class="pt'+lit('legs')+'"><path class="pl" d="M148 144 L142 224 H162 L166 144 Z"/><path class="pl" d="M174 144 L178 224 H198 L192 144 Z"/>'
      +'<rect class="pl" x="132" y="222" width="34" height="18" rx="6"/><rect class="pl" x="174" y="222" width="34" height="18" rx="6"/></g>'
    +'<g class="pt'+lit('body')+'"><path class="pl" d="M134 84 Q170 74 206 84 L212 118 Q206 144 170 148 Q134 144 128 118 Z"/>'
      +'<rect class="pl" x="136" y="138" width="68" height="10" rx="4"/><path class="ln" d="M170 90 V136"/></g>'
    +'<g class="pt"><path class="pl" d="M130 88 L114 126 L126 132 L142 94 Z"/><rect class="pl" x="106" y="124" width="18" height="14" rx="6"/>'
      +'<path class="pl" d="M210 88 L226 126 L214 132 L198 94 Z"/><rect class="pl" x="216" y="124" width="18" height="14" rx="6"/>'
      +'<path class="pl" d="M124 78 Q136 69 146 80 L142 93 Q130 93 121 86 Z"/><path class="pl" d="M216 78 Q204 69 194 80 L198 93 Q210 93 219 86 Z"/></g>'
    +'<g class="pt'+lit('head')+'"><rect class="pl" x="162" y="66" width="16" height="16" rx="5"/>'
      +'<rect class="pl" x="152" y="30" width="36" height="44" rx="16"/><rect class="vs" x="158" y="45" width="24" height="13" rx="6"/></g>'
    +'<g class="pt'+lit('acc')+'"><circle class="pl" cx="192" cy="84" r="5.5"/><circle class="vs" cx="192" cy="84" r="2"/></g>'
    +'<g class="pt'+lit('weapon')+'"><path class="pl" d="M197 81 L243 133 L237 140 L191 87 Z"/><path class="pl" d="M216 118 L224 126 L218 132 L210 124 Z"/></g>'
    +'<g class="pt'+lit('offhand')+'"><rect class="pl" x="198" y="142" width="22" height="16" rx="5"/></g>'
    + DOLL_ORDER.map(lead).join('') +'</svg>';
}
function renderBagPanel(box){
  const doll=el('div','doll'); doll.innerHTML=dollArt();
  SLOTS.forEach(([sl,label])=>{ const p=DOLL_L[sl]; if(!p)return; const it=eqOf(sl);
    const c=el('button','slotchip'+(it?' filled':'')+(state.bagSel===sl?' sel':''));
    c.style.left=(p.cx/DOLL_W*100)+'%'; c.style.top=(p.cy/DOLL_H*100)+'%';
    c.innerHTML='<span class="sc-box">'+(it?it.icon:'▫')+'</span><span class="sc-nm">'+label+(it?'':' ·空')+'</span>';
    c.onclick=()=>{ state.bagSel=(state.bagSel===sl?null:sl); render(); };
    doll.appendChild(c);
  });
  box.appendChild(doll);
  const sel=state.bagSel, worn=sel?eqOf(sel):null;
  if(worn){ const it=worn, s=sel, lab=SLOTS.find(x=>x[0]===s)[1];
    const card=el('div','slotinfo');
    card.innerHTML='<span class="si-ic">'+it.icon+'</span><span class="si-b"><b>'+it.name+'</b><span class="si-slot">'+lab+'</span>'
      +'<span class="si-st">'+statTags(it).split(' ').join(' · ')+'</span></span>';
    const x=el('button','si-x','卸下'); x.onclick=()=>{ state.bagSel=null; unequip(s); }; card.appendChild(x);
    box.appendChild(card);
  } else box.appendChild(el('div','dollhint', sel ? '该部位空着 · 下方亮起的物品可穿到'+SLOTS.find(x=>x[0]===sel)[1]
    : '点小人旁的部位槽看装备 · 下方点物品即可穿戴/使用'));
  title(box,'<b>物品栏</b>');
  const mats=MATS.filter(m=>has(m));
  if(mats.length){ const mg=el('div','mats'); mats.forEach(m=>mg.appendChild(el('span','mchip',ITEMS[m].icon+ITEMS[m].name+' '+state.inv[m]))); box.appendChild(mg); }
  const items=Object.keys(state.inv).filter(id=>state.inv[id]>0 && ITEMS[id] && ITEMS[id].type!=='mat');
  if(!items.length){ box.appendChild(el('div','empty','没有可装备/使用的物品')); return; }
  const g=el('div','itemgrid');
  items.forEach(id=>{ const it=ITEMS[id]; const b=el('button','item'+(sel&&it.slot===sel?' fit':''));
    let sub = it.type==='equip'? statTags(it) : (it.desc||'');
    b.innerHTML='<span class="iicon">'+(it.icon||'📦')+'</span><span class="iname">'+it.name+'</span><span class="icount">×'+state.inv[id]+'</span><span class="isub">'+sub+'</span>';
    if(it.type==='equip') b.onclick=()=>{ state.bagSel=null; equip(it.slot,id); };
    else if(it.type==='use'||it.type==='book') b.onclick=()=>useItem(id);
    else b.disabled=true;
    g.appendChild(b);
  });
  box.appendChild(g);
  if(state.meta.endingItems.length){ title(box,'结局道具'); const tg=el('div','mats'); state.meta.endingItems.forEach(id=>tg.appendChild(el('span','mchip','★'+ITEMS[id].name))); box.appendChild(tg); }
}

/* ---------- 科技树：五领域 · 视口可捏合缩放/双向拖动 ---------- */
const BR_ICON={生存医疗:'⚕️',工程制造:'🔧',武器系统:'⚔️',动力防护:'🛡️',探测自动化:'📡'};
function statName(k){ return {atk:'攻击',def:'防御',hp:'生命',spd:'速度',crit:'暴击率',critDmg:'暴击伤害',ls:'吸血',dodge:'闪避',hit:'命中',pen:'穿透',shield:'护盾',move:'移距',rangeAdd:'攻距',stMax:'体力上限'}[k]||k; }
function techStatus(tid){ if(techKnown(tid)) return 'max'; return techReady(tid)?'ready':'locked'; }
function techEffect(t){
  const parts=[];
  if(t.build&&t.build.length) parts.push('建筑 '+t.build.map(facilityName).join('、'));
  if(t.smelt&&t.smelt.length) parts.push('加工 '+t.smelt.map(smeltName).join('、'));
  const recipes=(t.un||[]).map(unItemName), defenses=(t.def||[]).map(d=>DEF_TYPES[d].name);
  if(recipes.length) parts.push('配方 '+recipes.join('、'));
  if(defenses.length) parts.push('工事 '+defenses.join('、'));
  if(t.bonus) parts.push('永久强化 '+Object.entries(t.bonus).map(([k,v])=>(k==='collect'?'高级材料采集':statName(k))+' +'+v+(k==='collect'?'%':'')).join('、'));
  return parts.length?'解锁：'+parts.join(' · '):'解锁后续研究';
}
function techAffordable(tid){ return Object.entries(techUpCost(tid)).every(([k,v])=>(state.inv[k]||0)>=v); }
function missingReqs(tid){ return (TECHS[tid].req||[]).filter(r=>!techKnown(r)); }
function costChips(c,full){ return Object.entries(c).map(([k,v])=>{ const have=state.inv[k]||0;
  return '<span class="'+(have>=v?'ok':'no')+'">'+ITEMS[k].icon+(full?ITEMS[k].name+' <b>'+have+'/'+v+'</b>':'<b>'+v+'</b>')+'</span>'; }).join(''); }
/* 戴森球式手工拓扑：主干横向推进，支线局部分叉，中后期自然汇流。 */
const LAY={ cardW:82, cardH:72 };
const _layC={};
function treeLayout(){ if(_layC.pos) return _layC;
  const pos={
    surv_1:{x:445,y:55},surv_2:{x:625,y:20},surv_3:{x:625,y:110},surv_4:{x:805,y:65},surv_5:{x:970,y:65},
    make_1:{x:95,y:335},make_2:{x:275,y:290},make_3:{x:275,y:385},make_4:{x:465,y:335},make_5:{x:970,y:335},
    arms_1:{x:455,y:195},arms_2:{x:635,y:155},arms_3:{x:635,y:245},arms_4:{x:815,y:245},arms_5:{x:830,y:145},
    power_1:{x:455,y:455},power_2:{x:635,y:455},power_3:{x:805,y:455},power_4:{x:970,y:420},power_5:{x:970,y:500},
    auto_1:{x:455,y:575},auto_2:{x:625,y:550},auto_3:{x:795,y:535},auto_4:{x:965,y:535},
    auto_5:{x:455,y:690},auto_6:{x:790,y:675},auto_7:{x:960,y:675}
  };
  _layC.pos=pos;
  _layC.labels={
    生存医疗:{x:300,y:55},武器系统:{x:300,y:195},工程制造:{x:18,y:335},
    动力防护:{x:300,y:455},探测自动化:{x:300,y:575}
  };
  _layC.stages=[95,275,455,635,805,970]; _layC.W=1100; _layC.H=790;
  return _layC; }
const BR_COLOR={生存医疗:'#34d399',工程制造:'#fbbf24',武器系统:'#fb7185',动力防护:'#60a5fa',探测自动化:'#a78bfa'};
/* 选中节点后:整条前置链 + 直接后继保持在亮处 */
const _kids={};
for(const tid in TECHS){ (TECHS[tid].req||[]).forEach(r=>{ if(TECHS[r]) (_kids[r]=_kids[r]||[]).push(tid); }); }
function focusSet(tid){ const out=new Set([tid]), seen={};
  (function up(t){ (TECHS[t].req||[]).forEach(r=>{ if(TECHS[r]&&!seen[r]){ seen[r]=1; out.add(r); up(r); } }); })(tid);
  (_kids[tid]||[]).forEach(c=>out.add(c));
  return out; }
const STAT_ICON={atk:'⚔️',def:'🛡️',hp:'❤️',spd:'👟',crit:'🎯',critDmg:'💥',ls:'🩸',dodge:'🍃',hit:'👁️',pen:'🔩',shield:'🔋',move:'👣',rangeAdd:'🔭'};
function techIcon(t){
  if(t.build&&t.build[0]){ const b=CAMP_BUILDINGS.find(x=>x.id===t.build[0]); if(b) return b.icon; }
  if(t.smelt&&t.smelt.length) return '🔥';
  if(t.un&&t.un[0]){ const r=RECIPES[t.un[0]], it=r&&ITEMS[r.out]; if(it&&it.icon) return it.icon; }
  if(t.def&&t.def[0]&&DEF_TYPES[t.def[0]]) return DEF_TYPES[t.def[0]].icon;
  if(t.bonus){ const ic=STAT_ICON[Object.keys(t.bonus)[0]]; if(ic) return ic; }
  return BR_ICON[t.b]||'🔬';
}
function techLitSet(){ return (state.techSel&&TECHS[state.techSel])? focusSet(state.techSel) : null; }
function techBlockBadge(tid){ const t=TECHS[tid], req=t.req||[], met=req.filter(techKnown).length;
  if(met<req.length) return '🔒'+met+'/'+req.length;
  if(!recordKnown(t.rec)) return '📄';
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
    +(st==='locked'?'<span class="tn-lk">'+techBlockBadge(tid)+'</span>':(st==='max'?'<span class="tn-lk">✓</span>':(!techAffordable(tid)?'<span class="tn-dot"></span>':'')));
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
  const z0=state.techZoom||1; z=Math.max(0.35,Math.min(2.6,z));
  if(z===z0) return;
  if(ax==null){ ax=vp.clientWidth/2; ay=vp.clientHeight/2; }
  state.techPanX=ax-(ax-(state.techPanX||0))*(z/z0);
  state.techPanY=ay-(ay-(state.techPanY||0))*(z/z0);
  state.techZoom=z; treeApply();
}
function treeFit(){
  const vp=treeEl('.treevp'), cv=treeEl('.treecanvas'); if(!vp||!cv) return;
  const cw=cv.offsetWidth, ch=cv.offsetHeight;
  const z=Math.min(1.6, Math.max(0.35, Math.min(vp.clientWidth/cw, vp.clientHeight/ch)));
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
        const z=Math.max(0.35,Math.min(2.6,pinch.z0*(d/pinch.d)));
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
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','tlines'); svg.setAttribute('width',cv.offsetWidth); svg.setAttribute('height',ch);
  const F=techLitSet();
  /* 名称行约 12px + 4px 间距；图标卡片高 52px，所以连接锚点固定在节点 top+42。 */
  const box=id=>{ const p=L.pos[id]; return p?{l:p.x,r:p.x+LAY.cardW,y:p.y+42}:null; };
  const NS='http://www.w3.org/2000/svg';
  for(const tid in TECHS){ (TECHS[tid].req||[]).forEach(rid=>{ const a=box(rid), c=box(tid); if(!a||!c) return;
    const gap=Math.max(16,c.l-a.r), tx=a.r+gap*.5;
    const p=document.createElementNS(NS,'path');
    p.setAttribute('d','M'+a.r+','+a.y+' L'+tx+','+a.y+' L'+tx+','+c.y+' L'+c.l+','+c.y);
    let cl='tedge';
    if(TECHS[rid].b!==TECHS[tid].b) cl+=' cross';
    if(techKnown(rid)&&techKnown(tid)) cl+=' on';
    else if(techKnown(rid)&&techStatus(tid)==='ready') cl+=' next';
    if(F&&F.has(rid)&&F.has(tid)) cl+=' hi';
    p.setAttribute('class',cl); svg.appendChild(p);
    const dot=document.createElementNS(NS,'circle');
    dot.setAttribute('cx',c.l); dot.setAttribute('cy',c.y); dot.setAttribute('r',2.4);
    dot.setAttribute('class','tdot'+(techKnown(rid)&&techKnown(tid)?' on':(techKnown(rid)&&techStatus(tid)==='ready'?' next':'')));
    svg.appendChild(dot); }); }
  cv.insertBefore(svg,cv.firstChild);
}
function renderTechPanel(box){
  const vp=el('div','treevp');
  const x=el('button','tx-x','✕'); x.onclick=()=>{ state.tab='act'; state.techSel=null; render(); }; vp.appendChild(x);
  const tb=el('div','tzoom');
  [['＋',()=>treeSetZoom(state.techZoom*1.22)],['－',()=>treeSetZoom(state.techZoom*0.82)],['全',treeFit]].forEach(a=>{
    const b=el('button',null,a[0]); b.onclick=a[1]; tb.appendChild(b); });
  vp.appendChild(tb);
  const F=techLitSet();
  const L=treeLayout();
  const cv=el('div','treecanvas');
  cv.style.width=L.W+'px'; cv.style.height=L.H+'px';
  L.stages.forEach((sx,i)=>{ const p=el('div','techphase','<span>0'+(i+1)+'</span> PHASE'); p.style.left=sx+'px'; cv.appendChild(p); });
  BRANCHES.forEach(br=>{ const p=L.labels[br], lab=el('div','techcluster-title',BR_ICON[br]+' '+br);
    lab.style.left=p.x+'px'; lab.style.top=p.y+'px'; lab.style.setProperty('--c',BR_COLOR[br]); cv.appendChild(lab); });
  Object.keys(L.pos).forEach(tid=>cv.appendChild(techNodeEl(tid,L.pos[tid],F)));
  vp.appendChild(cv); box.appendChild(vp);
  renderTechDetail(box);
  if(state.techZoom==null){ state.techZoom=.78; state.techPanX=0; state.techPanY=0; }
  requestAnimationFrame(()=>{ drawTechLines(); treeApply();
    attachTreeGestures(vp,cv); if(state._reveal){ treeReveal(state._reveal); state._reveal=null; } });
}
function renderTechDetail(box){
  const d=el('div','tdet'), tid=state.techSel;
  if(!tid){ d.classList.add('hint'); d.appendChild(el('div','tdet-hint','所有科技始终可见 · 投入材料研究 · 解锁建筑、加工与装备配方')); box.appendChild(d); return; }
  const t=TECHS[tid], st=techStatus(tid);
  const head=el('div','tdet-top');
  head.innerHTML='<span class="tdet-ic">'+techIcon(t)+'</span><span class="tdet-h"><b>'+t.n+'</b><span>'+t.b+' · '+
    (techKnown(tid)?'已研究':'未研究')+'</span></span>';
  const x=el('button','tdet-x','✕'); x.onclick=()=>{ state.techSel=null; render(); }; head.appendChild(x);
  d.appendChild(head);
  d.appendChild(el('div','tdet-eff',techEffect(t)));
  const reqs=t.req||[];
  if(reqs.length) d.appendChild(el('div','tdet-line','前置 '+reqs.map(r=>{ const rt=TECHS[r];
    return '<span class="'+(techKnown(r)?'ok':'no')+'">'+(rt&&rt.b!==t.b?rt.b+'·':'')+TECHS[r].n+(techKnown(r)?'✓':'✗')+'</span>'; }).join(' ')));
  if(t.rec){ const rec=TECH_RECORDS[t.rec];
    d.appendChild(el('div','tdet-line','特殊资料 <span class="'+(recordKnown(t.rec)?'ok':'no')+'">'+rec.name+(recordKnown(t.rec)?'✓':'（去'+LOCATIONS[rec.at].name+'寻找）')+'</span>')); }
  if(st==='max') d.appendChild(el('div','tdet-line','✓ 研究完成，效果已永久保留'));
  else{
    d.appendChild(el('div','tdet-line','材料 '+costChips(techUpCost(tid),1)));
    const can=techReady(tid)&&techAffordable(tid);
    const why=!techPrereqsReady(tid)?'前置未完成':(!recordKnown(t.rec)?'缺少技术资料':(!techAffordable(tid)?'材料不足':''));
    const b=el('button','primary'); b.innerHTML='研究'+(why?'（'+why+'）':'');
    if(can) b.onclick=()=>research(tid); else b.disabled=true;
    d.appendChild(b);
  }
  box.appendChild(d);
}
function research(tid){ const t=TECHS[tid]; if(!t||techKnown(tid))return;
  if(!techPrereqsReady(tid)){ log('前置科技未研究。','warn'); return; }
  if(!recordKnown(t.rec)){ log('缺少技术资料【'+TECH_RECORDS[t.rec].name+'】。','warn'); return; }
  const cost=techUpCost(tid);
  for(const[k,v] of Object.entries(cost)){ if((state.inv[k]||0)<v){log('研究材料不足。','warn'); return;} }
  for(const[k,v] of Object.entries(cost)) state.inv[k]-=v; state.meta.techs[tid]=1; advanceTime(4);
  const msg='🔬 研究完成【'+t.n+'】 · '+techEffect(t);
  divider(); log(msg,'good'); divider(); syncQuestProgress(true); render(); }

/* ---------- 营地建筑子页 ---------- */
function facilityHeader(box,b){
  const nav=el('div','facility-nav'),back=el('button','facility-back','‹');
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
    const action=el('button','primary facility-main-action','进入休眠舱');action.onclick=rest;sec.appendChild(action);
  } else if(b.kind==='smelt'){
    sec.innerHTML='<div class="furnace-console"><span class="furnace-core"><i></i><b>◉</b></span><span><small>THERMAL CORE</small><b>熔炉温度稳定</b><em>设施等级使每次熔炼额外产出 '+(buildingLevel('smelt')-1)+' 份</em></span></div>';
    const list=el('div','operation-list');SMELT.forEach(s=>{const known=hasSmeltTech(s.id),can=known&&canAfford(s.cost),out=s.yield+buildingLevel('smelt')-1;list.appendChild(operationRow('🔥',s.name,known?costText(s.cost):('需研究 '+TECHS[TECH_FOR_SMELT[s.id]].n),known?('产出 '+ITEMS[s.out].icon+ITEMS[s.out].name+'×'+out):'配方未解锁','熔炼',!can,()=>smelt(s),can?'primary':''));});sec.appendChild(list);
  } else if(b.kind==='craft'){
    sec.innerHTML='<div class="workbench-visual"><span>⌬</span><div><small>ASSEMBLY QUEUE</small><b>'+({work:'工程装配台',armor:'防护裁剪台',chem:'无菌调配台',elec:'精密焊接台',data:'数据刻写台'}[b.st]||'制造终端')+'</b><em>选择已解锁配方，材料会在制作时扣除。</em></div></div>';
    const list=el('div','operation-list');Object.keys(RECIPES).filter(rid=>RECIPES[rid].st===b.st&&hasRecipeTech(rid)).forEach(rid=>{const r=RECIPES[rid],it=ITEMS[r.out],can=canAfford(r.cost);list.appendChild(operationRow(it.icon,it.name,it.desc||'制造配方',costText(r.cost),'制作',!can,()=>craft(r),can?'primary':''));});
    if(!list.children.length)list.appendChild(el('div','facility-empty','暂无可用配方。继续研究科技或在特殊区域寻找蓝图。'));sec.appendChild(list);
  } else if(b.kind==='storage'){
    const rate=Math.round(Math.max(.25,.35-Math.max(0,buildingLevel('warehouse')-1)*.05)*100);sec.innerHTML='<div class="storage-overview"><span class="storage-shield">⬢</span><span><small>EVACUATION PROTECTION</small><b>紧急撤离仅损失本次收获的 '+rate+'%</b><em>检查点之前的储备不会丢失；无需手动存取。</em></span></div>';
    const bins=el('div','storage-bins');MATS.filter(k=>(state.inv[k]||0)>0).forEach(k=>bins.appendChild(el('div','storage-bin','<span>'+ITEMS[k].icon+'</span><small>'+ITEMS[k].name+'</small><b>'+(state.inv[k]||0)+'</b>')));if(!bins.children.length)bins.appendChild(el('div','facility-empty','仓储舱还是空的。探索后带回的材料会自动分类。'));sec.appendChild(bins);
  } else if(b.kind==='recycle'){
    sec.innerHTML='<div class="recycle-visual"><span>♻</span><div><small>MATERIAL RECOVERY</small><b>拆解线待命</b><em>回收等级越高，废铁产量越高。</em></div></div>';const list=el('div','operation-list');RECYCLE.filter(r=>r.level<=buildingLevel('recycler')).forEach(r=>{const can=canAfford(r.cost),bonus=buildingLevel('recycler')-1,out=Object.entries(r.out).map(([k,v])=>ITEMS[k].name+'×'+(v+(k==='scrap'?bonus:0))).join(' · ');list.appendChild(operationRow(r.icon,r.name,costText(r.cost),'回收 '+out,'拆解',!can,()=>recycleMaterial(r.id),can?'primary':''));});sec.appendChild(list);
  } else if(b.kind==='mess'){
    const used=facilityUsedToday('mess'),lv=buildingLevel('mess'),hp=10+lv*10,st=5+lv*10;sec.innerHTML='<div class="meal-console"><span>🍲</span><div><small>DAILY RATION</small><b>'+(used?'今日配给已领取':'热食正在保温')+'</b><em>消耗营养膏×1 · 恢复生命 '+hp+' / 体力 '+st+'</em></div></div>';const action=el('button',!used&&has('ration')?'primary':'','领取今日热食');action.disabled=used||!has('ration');action.onclick=eatMeal;sec.appendChild(action);
  } else if(b.kind==='garden'){
    const used=facilityUsedToday('garden'),lv=buildingLevel('garden'),drops='营养膏×'+(1+lv)+(lv>=2?' · 生物样本×1':'')+(lv>=3?' · 晶体×1':'');sec.innerHTML='<div class="garden-console"><span class="garden-pods"><i></i><i></i><i></i></span><div><small>MYCELIUM CYCLE</small><b>'+(used?'培养槽今日已收获':'培养槽已成熟')+'</b><em>'+drops+' · 每天刷新一次</em></div></div>';const action=el('button',used?'':'primary','收获菌圃');action.disabled=used;action.onclick=harvestGarden;sec.appendChild(action);
  } else if(b.kind==='train'){
    const xp=40+buildingLevel('range')*40,can=(state.inv.scrap||0)>=10;sec.innerHTML='<div class="training-console"><span class="training-target"><i></i><b>◎</b></span><div><small>COMBAT SIMULATION</small><b>战术训练课程</b><em>消耗废铁×10 · 获得经验 '+xp+' · 用时 2 小时</em></div></div>';const action=el('button',can?'primary':'','开始训练');action.disabled=!can;action.onclick=train;sec.appendChild(action);
  } else if(b.kind==='defense'){
    const remain=state.flags.firstRaidSurvived?Math.max(0,3-(state.rests-(state.flags.lastRaidRest||0))):'未知';sec.innerHTML='<div class="watch-console"><span class="watch-radar"><i></i><b>⌁</b></span><div><small>PERIMETER CONTROL</small><b>总火力 '+defensePower()+'</b><em>下次夜袭：'+remain+(remain==='未知'?'':' 次休息后')+' · 哨戒塔基础火力 '+watchBonus()+'</em></div></div>';
    const list=el('div','operation-list');state.defenses.forEach((d,idx)=>{const t=DEF_TYPES[d.key],c=upCost(d),can=canAfford(c);list.appendChild(operationRow(t.icon,t.name+' Lv'+d.level,'攻击 '+defAtk(d)+' · 射程 '+defRange(d),costText(c),'升级',!can,()=>upgradeDefense(idx),can?'primary':''));});Object.keys(DEF_TYPES).filter(hasDefTech).forEach(k=>{const t=DEF_TYPES[k],can=canAfford(t.build);list.appendChild(operationRow(t.icon,'建造 '+t.name,'攻击 '+t.baseAtk+' · 射程 '+t.range,costText(t.build),'建造',!can,()=>buildDefense(k),can?'primary':''));});if(!list.children.length)list.appendChild(el('div','facility-empty','暂无已解锁的防御工事。继续研究防御科技。'));sec.appendChild(list);
  } else if(b.kind==='beacon'){
    sec.innerHTML='<div class="beacon-console"><span class="beacon-rings"><i></i><i></i><b>◆</b></span><div><small>SIGNAL PROJECTION</small><b>战斗幻影矩阵</b><em>消耗信标电池与体力，胜利后必定回收材料。</em></div></div>';const list=el('div','operation-list');BEACON.forEach((bb,i)=>{const can=P().stamina>=bb.cost&&(state.inv.signalCell||0)>=bb.cells;list.appendChild(operationRow('◈','信标·'+bb.name,'威胁 '+bb.threat+' · 技能书概率 '+Math.round((bb.bookChance+(buildingLevel('beacon')-1)*.05)*100)+'%','电池×'+bb.cells+' · 体力 -'+bb.cost,'激活',!can,()=>startBeacon(i),can?'primary':''));});sec.appendChild(list);
  }
  renderFacilityUpgrade(box,b);
}
function recipeBtn(rid){ const r=RECIPES[rid];
  if(!hasRecipeTech(rid)){ const t=TECH_FOR_RECIPE[rid],why=r.blueprint?'需取得区域特殊蓝图':('需研究:'+TECHS[t].n); return {label:'🔒 '+ITEMS[r.out].name,cost:why,disabled:true,fn:()=>{}}; }
  const can=Object.entries(r.cost).every(([k,v])=>(state.inv[k]||0)>=v);
  return {label:'造 '+ITEMS[r.out].name,cost:Object.entries(r.cost).map(([k,v])=>ITEMS[k].name+'×'+v).join(' '),disabled:!can,cls:can?'primary':'',fn:()=>craft(r)}; }

/* ---------- 任务 ---------- */
function renderTaskPanel(box){
  const s=settleEcho();
  title(box,'<b>本次进度</b> · 击杀'+s.kills+'(威胁'+s.wKill+') 伤害'+s.dmg+' 物资'+s.mat+' <span style="color:var(--warn)">→ 轮回可得回响 '+s.total+'</span>');
  const main=QUESTS.filter(q=>q.line==='main'), md=main.filter(q=>questDone(q.id)).length;
  title(box,'<b>主线进度 '+md+'/'+main.length+'</b> · 当前周目调查 '+(state.truthClaimed||'尚未选择'));
  const names={main:'方舟主线',survivor:'幸存者支线',evidence:'真相证据链',surface:'地表与袭营',signal:'地下信号',special:'隐藏区域与特殊蓝图'};
  ['main','survivor','evidence','surface','signal','special'].forEach(line=>{
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
function renderSetPanel(box){
  title(box,'<b>设置</b>');
  const update=el('section','settings-update');
  update.innerHTML='<span class="update-mark" aria-hidden="true">↻</span><span class="update-copy"><small>APPLICATION UPDATE</small><b>游戏更新</b><em id="update-version"></em><span id="update-status"></span></span>';
  const check=el('button','primary update-check','检查更新'); check.id='check-update-btn'; check.onclick=checkAppUpdate;
  update.appendChild(check); box.appendChild(update);
  $('update-version').textContent=appVersionInfo(); setUpdateUi(updateUi.text,updateUi.busy);
  grid(box,[{label:'音效  '+(state.sound?'开':'关'),fn:()=>{state.sound=!state.sound;render();}},{label:'音乐  '+(state.music?'开':'关'),fn:()=>{state.music=!state.music;render();}}]);
  title(box,'存档'); grid(box,[{label:'重新开始(清空本档)',cost:'删除全部进度,包括回响',cls:'danger',full:true,fn:hardReset}]);
  title(box,'关于'); box.appendChild(el('div','panel-title','《深渊回响》· 深度流文字RPG原型'));
}
function hardReset(){ if(!confirm('确定清空全部进度(含回响/结局道具)重新开始吗?')) return; localStorage.removeItem(SAVE_KEY); state=freshState(); updateCheckpoint(); $('log').innerHTML=''; intro(); render(); }

/* ---------- 战斗面板 ---------- */
function renderCombatPanel(box){
  const c=state.combat; const canHit=atkRange()>=c.distNow;
  title(box,'<b>战斗</b> · '+c.name+' 生命 '+Math.max(0,c.hp)+'/'+c.maxHp+' 距离 '+c.distNow+' · 敌方射程 '+c.range+(canHit?'':' <span style="color:var(--danger)">超出射程</span>'));
  const acts=[{label:'攻击',cost:canHit?'体力 -3':'射程不够',cls:canHit?'primary':'danger',disabled:!canHit||P().stamina<3,fn:playerAttack},
    {label:'接近',cost:'距离-'+moveRange()+' · -2体力',disabled:(c.distNow<=1||P().stamina<2),fn:approach}];
  for(const k in SKILLS){ const lv=skillLv(k),rangeOk=SKILLS[k].kind!=='melee'||c.distNow<=1; acts.push({label:SKILLS[k].name+(lv>0?' Lv'+lv:''),cost:lv>0?(rangeOk?'体力-'+SKILLS[k].cost:'需近身'):'未解锁',disabled:(lv<1||P().stamina<SKILLS[k].cost||!rangeOk),fn:()=>useSkill(k)}); }
  if(has('emp')&&c.mech) acts.push({label:'电磁干扰器×'+state.inv.emp,cost:'瘫痪3回合',fn:()=>combatItem('emp')});
  acts.push({label:'急救包×'+(state.inv.medkit||0),disabled:!has('medkit'),fn:()=>combatItem('medkit')});
  acts.push({label:'体力药剂×'+(state.inv.potion||0),disabled:!has('potion'),fn:()=>combatItem('potion')});
  acts.push({label:'稳住呼吸',cost:'恢复 5 体力 · 敌人行动',fn:catchBreath});
  acts.push({label:'逃跑',cost:'体力 -2',disabled:P().stamina<2,cls:'danger',fn:flee});
  grid(box,acts);
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
    return {label:(done?'✓ ':'')+(locked?'🔒 ':'')+'结局·'+e.name,cost:locked?('需'+e.need+'碎片'):(done?'已得道具':'走这条线'),disabled:locked,cls:locked?'':'primary',fn:()=>chooseEnding(id)}; });
  acts.push({label:'暂不选择,继续探索',full:true,fn:()=>{state.screen='play';render();}});
  grid(box,acts,true);
}

/* ================= 装备/使用 ================= */
function equip(slot,id){ if(!has(id)){log('没有这件物品。','warn');return;} const it=ITEMS[id]; if(it.slot!==slot)return;
  const prev=P().equip[slot]; state.inv[id]--; if(prev) state.inv[prev]=(state.inv[prev]||0)+1; P().equip[slot]=id;
  if(slot==='body'||slot==='offhand') P().shield=Math.min(P().shield, shieldMax()); if(P().shield>shieldMax())P().shield=shieldMax();
  log('已装备:'+it.name,'good'); advanceTime(1); render(); }
function unequip(slot){ const cur=P().equip[slot]; if(!cur)return; P().equip[slot]=null; state.inv[cur]=(state.inv[cur]||0)+1; if(P().shield>shieldMax())P().shield=shieldMax(); log('已卸下:'+ITEMS[cur].name,'dim'); render(); }
function craft(r){ for(const[k,v] of Object.entries(r.cost)){ if((state.inv[k]||0)<v){log('材料不足。','warn');return;} }
  for(const[k,v] of Object.entries(r.cost)) state.inv[k]-=v; state.inv[r.out]=(state.inv[r.out]||0)+1;
  log('制作完成:'+ITEMS[r.out].name,'good'); advanceTime(1); render(); }
function smelt(s){ if(!hasSmeltTech(s.id)){log('需先研究【'+TECHS[TECH_FOR_SMELT[s.id]].n+'】。','warn');return;}
  for(const[k,v] of Object.entries(s.cost)){ if((state.inv[k]||0)<v){log('材料不足。','warn');return;} }
  const out=s.yield+buildingLevel('smelt')-1; for(const[k,v] of Object.entries(s.cost)) state.inv[k]-=v; state.inv[s.out]=(state.inv[s.out]||0)+out;
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
  if(P().stamina<base+locExtraCost()){ log('体力不足,先回营地休息。','warn'); return false; }
  const loc=LOCATIONS[P().location]; spendStamina(base); advanceTime(1);
  if (loc.radiation&&!armorImmune('radiation')) log('辐射灼烧着你。','warn');
  if (loc.contamination&&!armorImmune('contamination')){ log('污染侵蚀着你(-3生命)。','danger'); P().hp-=3; }
  if (loc.flooded) log('积水拖慢了你。','dim');
  if(P().hp<=0){ die(); return false; }
  if(!infectionTick())return false;
  return true;
}
function applyAreaEvent(id,fixed,idx){
  divider(); log('◆ 区域事件 '+(idx+1)+'/'+AREA_EVENTS[id].length,'sys'); log(fixed.text,'story');
  if(fixed.gain){ const g=[]; for(const[k,v] of Object.entries(fixed.gain)){gainMat(k,v);g.push(ITEMS[k].name+'×'+v);} log('获得:'+g.join('、'),'good'); }
  if(fixed.flag) state.flags[fixed.flag]=true;
  (fixed.flags||[]).forEach(flag=>state.flags[flag]=true);
  if(fixed.reveal) log('◈ 地图更新：发现隐藏区域【'+LOCATIONS[fixed.reveal].name+'】','good');
  divider(); setLogOpen(true);
}
function gatherArea(id){
  if(!gatherAvailable(id)){log('这个区域今天可回收的材料已经取完，次日会刷新。','dim');return false;}
  const loc=LOCATIONS[id], entries=Object.entries(loc.loot||{}),g=[],cm=M().collect*(1+techBonus('collect')/100);
  entries.forEach(([m,ch],i)=>{ if(Math.random()<Math.min(.92,ch+.22)||(i===0&&!g.length)){
    const n=Math.max(1,Math.round((1+Math.floor(Math.random()*2))*cm)); gainMat(m,n); g.push(ITEMS[m].name+'×'+n);
  }});
  recordGather(id);
  log(g.length?'定向采集获得：'+g.join('、'):'这一处资源已经枯竭。',g.length?'good':'dim');
  return true;
}
function talkAreaNpc(who){
  const id=P().location,loc=LOCATIONS[id];
  if(id==='oldMine'){
    if(!state.flags.minerFreed){ log('阿拓仍被塌方隔开。先勘探并清理矿道。','warn'); return; }
    if(!state.flags.bp_miningHarness){ state.flags.bp_miningHarness=true; divider(); log('矿工阿拓把采掘机的助力结构画成蓝图。','story'); log('获得特殊蓝图【采掘外骨骼】· 可在基础工作台制作。','good'); divider(); }
    else log('阿拓：“外层煤软、铜脉靠东。别朝有卵壳的地方下镐。”','story');
  } else if(id==='nursery'){
    if(!state.flags.prototypeOnline){ log('原型终端还没有恢复。先分析实验记录。','warn'); return; }
    if(!state.flags.bp_neuralFilter){ state.flags.bp_neuralFilter=true; divider(); log('技术员纪遥补全了被委员会删除的校准参数。','story'); log('获得特殊蓝图【神经滤波器】· 可在电子工作台制作。','good'); divider(); }
    else log('纪遥：“科技树只记录被批准的技术，真正危险的原型都藏在事故报告后面。”','story');
  } else if(id==='layer2'){
    if(who==='陈嫂') log(questActive('fever')?'陈嫂：“孩子的高烧压不下去。制药台做出的急救包也许还来得及。”':'陈嫂：“他父亲没能熬过第一轮舱壁破裂。至少这个孩子得活下去。”','story');
    else if(who==='老周') log(questActive('drain')?'老周：“泵还能转，缺的是废铁和电子元件。水一退，工程区的检修门就露出来了。”':'老周：“军事区的权限卡也许能打开这里早已封存的舱门。”','story');
    else if(who==='阿珍') log(questDone('freeAyong')?'阿珍和阿勇并肩坐在干燥后的舱室门口。这个区域终于有了一点家的样子。':(questActive('findAyong')?'阿珍：“阿勇是导航员。坠毁前他去实验室查航线，从那以后就没回来。请帮我找到他。”':'阿珍仍在整理阿勇留下的导航记录。'),'story');
  } else if(id==='layer3'){
    if(who==='小唐') log(state.flags.tangSaved?'小唐：“我欠你一条命。营地防线的传感器交给我维护。”':(state.flags.tangLost?'维修井的通讯频道里只剩下静电。':'小唐的信号从维修井里断续传来：“门快熔了……还有人吗？”'),'story');
    else if(questActive('rescueTang')) log('林薇：“小唐困在高辐射维修井。穿防辐射服进去还有机会；远程封舱能压低辐射，但他活不了。”','story');
    else if(questActive('seal')) log('林薇：“冷却环必须用六份钢材封住。别在辐射区里浪费体力。”','story');
    else if(questActive('faultAudit')) log('林薇：“还差'+Math.max(0,3-questSearchCount(QUEST_BY_ID.faultAudit))+'段新的导航缓存。如果只是传感器故障，系统不该连续取消纠偏。”','story');
    else log('林薇：“故障是真的，但坠毁不是故障自己造成的。”','story');
  } else if(id==='layer4'){
    if(questActive('findAyong')) log('陈博士：“阿勇来过。他复制了安保终端，又被军事区的人带走。把这里查透，也许还能找到拘留编号。”','story');
    else if(questActive('sample')) log('陈博士：“给我五份生物样本。我要确认实验体脑内的放电和地下信号是不是同一个节拍。”','story');
    else if(questActive('signalTrace')) log('陈博士：“菌光谷的放电频率对上了。那里不是源头，但肯定是中继站。”','story');
    else log('陈博士：“气密管线通往一个不在平面图上的培养室。委员会隐藏过更多东西。”','story');
  } else if(id==='layer5'){
    if(questActive('freeAyong')) log('哈里斯避开你的目光：“阿勇没有正式罪名。队长权限卡能开拘留舱，接下来由你决定。”','story');
    else if(questActive('patrol')) log('哈里斯：“三枚巡逻信标，少一枚都不能下结论。炮塔还把我们当敌人，小心。”','story');
    else log('哈里斯：“队长留的权限卡归你。旧坐标指向生活区的封存导航舱——回去看看。”','story');
  } else if(id==='layer6'){
    const ready=['故障线','内鬼线','信号线'].filter(evidenceReady);
    if(questActive('bridge')&&!state.flags.commandDecoded) log('哑叔在终端写下：“先还原舰长日志和权限调用链。没有舰桥自己的记录，任何证据都只是猜测。”','story');
    else if(questActive('bridge')) log('哑叔在终端写下：“已完整的证据：'+(ready.join('、')||'暂无')+'。舰桥只能带走其中一条。”','story');
    else log('哑叔指向舰长日志的最后一行：“舰桥没有人，命令从船自身发出。”','story');
  } else if(loc.npc) log(loc.npc+'暂时没有新的情报。','dim');
  syncQuestProgress(true); render();
}
function explore(mode){
  mode=mode||'investigate';
  const id=P().location,loc=LOCATIONS[id],base=mode==='gather'?2:1;
  if(mode==='gather'&&!gatherAvailable(id)){log('这个区域今天可回收的材料已经取完，次日会刷新。','dim');render();return;}
  if(!payAreaAction(base)) return;
  if(id==='layer7'&&!state.meta.wardenDone&&mode!=='gather'){ if(!state.meta.guardianDown){ log('守望者的守卫苏醒了。','danger'); startCombat('guardian'); return; } triggerWarden(); return; }
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
  const idx=state.areaSearch[id]||0; state.areaSearch[id]=idx+1;
  const fixed=AREA_EVENTS[id]&&AREA_EVENTS[id][idx];
  if(fixed) applyAreaEvent(id,fixed,idx); else log(flavor(id),'dim');
  syncQuestProgress(true); if (P().hp<=0){ die(); return; } checkStamina(); render();
}
function flavor(id){ const zone=LOCATIONS[id].zone, pool={
  地表:['风从船壳裂口穿过，发出像低语一样的声音。','远处的黑木枝条同时向一个方向偏转。','碎岩下传来短促的刨土声。'],
  船内:['应急灯闪了闪，又暗下去。','远处传来金属冷却的咔哒声。','墙上有一道从通风口延伸出来的爪痕。'],
  地下:['菌光在你的脚步后依次熄灭。','无线电里传回比你呼吸慢半拍的回声。','岩壁深处有规律地震动了三次。']
  }; const a=pool[zone]||['这里暂时没有新的发现。']; return a[Math.floor(Math.random()*a.length)]; }
function move(dest){
  if(!LOCATIONS[dest]||!isAdjacent(P().location,dest)){ log('这里没有可直接通行的路线。','warn'); return; }
  const gate=locationGate(dest); if(!gate.ok){ log(gate.text+'。','warn'); return; }
  const nl=LOCATIONS[dest],cost=moveCost(P().location,dest);
  if(P().stamina<cost){log('体力不足,走不动了。','warn');return;}
  P().stamina-=cost; advanceTime(1); P().location=dest; state.tab='act'; state.mapOpen=false; divider(); log('来到【'+nl.name+'】。','sys'); describe(dest);
  if(!infectionTick())return;
  discoverTechRecord(dest);
  if (!state.visited[dest]){ state.visited[dest]=true; (ENTRY_STORY[dest]||[]).forEach(t=>log(t,'story')); divider(); setLogOpen(true); }
  syncQuestProgress(true); checkStamina(); render(); $('panel').scrollTop=0;
}
function travelTo(dest){
  const route=travelRoute(P().location,dest);
  if(!route||route.path.length<2){log('还没有通往该地点的已探索路线。','warn');return;}
  if(P().stamina<route.cost){log('快速移动需要 '+route.cost+' 体力，当前体力不足。','warn');return;}
  const from=P().location;
  for(let i=1;i<route.path.length;i++){
    const next=route.path[i];P().stamina-=moveCost(P().location,next);P().location=next;advanceTime(1);
    if(!infectionTick())return;
  }
  const nl=LOCATIONS[dest];state.tab='act';state.mapOpen=false;state.mapSelected=dest;
  divider();log('沿已探索路线从【'+LOCATIONS[from].name+'】快速移动至【'+nl.name+'】，消耗 '+route.cost+' 体力。','sys');describe(dest);
  discoverTechRecord(dest);
  if(!state.visited[dest]){state.visited[dest]=true;(ENTRY_STORY[dest]||[]).forEach(t=>log(t,'story'));divider();setLogOpen(true);}
  syncQuestProgress(true);checkStamina();render();$('panel').scrollTop=0;
}
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
function rest(){ P().stamina=Math.round(maxStamina()); P().hp=P().infected?Math.max(P().hp,Math.round(maxHp()*.7)):maxHp(); P().shield=shieldMax(); state.rests++;
  if(P().infected){ const q=buildingLevel('quarters'); P().hp=Math.max(P().hp,Math.round(maxHp()*(q>=3?1:q===2?.85:.7))); }
  const absolute=8+state.time,nextMorning=(Math.floor((absolute-8)/24)+1)*24+8; state.time=nextMorning-8;
  const first=questActive('firstRaid')&&!state.flags.firstRaidSurvived;
  const repeat=state.flags.firstRaidSurvived&&state.rests-(state.flags.lastRaidRest||0)>=3;
  if(first||repeat){ resolveRaid(first); state.flags.lastRaidRest=state.rests; if(first){state.flags.firstRaidSurvived=true;syncQuestProgress(true);} }
  updateCheckpoint(); log('你休息并记录了存档点。时间来到 '+fmtTime()+(P().infected?'；感染仍未清除。':'。'),'good'); render(); }
function buildFacility(b){ if(P().location!=='camp'){log('要在营地才能建造。','warn');return;}
  if(!hasBuildingTech(b.id)){ log('需先研究【'+TECHS[TECH_FOR_BUILD[b.id]].n+'】。','warn'); return; }
  for(const[k,v] of Object.entries(b.cost)){ if((state.inv[k]||0)<v){log('材料不足,需要 '+Object.entries(b.cost).map(([k2,v2])=>ITEMS[k2].name+'×'+v2).join(' ')+'。','warn');return;} }
  for(const[k,v] of Object.entries(b.cost)) state.inv[k]-=v; state.meta.built[b.id]=true; state.meta.buildLevels[b.id]=1; state.campView='home'; advanceTime(2);
  log('🔨 建成了【'+b.name+'】!营地出现了新的设施。','good'); divider(); syncQuestProgress(true); renderPanelTop(); }
function facilityUpgrade(b){ return b.upgrades&&b.upgrades[buildingLevel(b.id)-1]; }
function canAfford(cost){ return Object.entries(cost||{}).every(([k,v])=>(state.inv[k]||0)>=v); }
function payCost(cost){ for(const[k,v] of Object.entries(cost||{}))state.inv[k]-=v; }
function costText(cost){ return Object.entries(cost||{}).map(([k,v])=>ITEMS[k].icon+ITEMS[k].name+'×'+v).join(' · '); }
function upgradeFacility(id){ const b=CAMP_BUILDINGS.find(x=>x.id===id),up=b&&facilityUpgrade(b); if(!b||!up)return;
  if(!techKnown(up.tech)){log('需要先研究【'+TECHS[up.tech].n+'】。','warn');return;} if(!canAfford(up.cost)){log('升级材料不足。','warn');return;}
  payCost(up.cost); state.meta.buildLevels[id]=buildingLevel(id)+1; advanceTime(3); log('⬆ 【'+b.name+'】升级为【'+up.name+'】。','good'); render(); }
function eatMeal(){ if(facilityUsedToday('mess')){log('今天的热食已经领取过了。','dim');return;} if(!has('ration')){log('配给站需要营养膏×1。','warn');return;}
  state.inv.ration--; state.dailyFacility.mess=currentDay(); const lv=buildingLevel('mess'),hp=10+lv*10,st=5+lv*10; P().hp=Math.min(maxHp(),P().hp+hp);P().stamina=Math.min(Math.round(maxStamina()),P().stamina+st);advanceTime(1);log('热食让你恢复生命 '+hp+'、体力 '+st+'。','good');render(); }
function harvestGarden(){ if(facilityUsedToday('garden')){log('菌圃今天已经收获过了。','dim');return;} const lv=buildingLevel('garden');state.dailyFacility.garden=currentDay();gainMat('ration',1+lv);if(lv>=2)gainMat('biocore',1);if(lv>=3)gainMat('crystal',1);advanceTime(1);log('菌圃收获：营养膏×'+(1+lv)+(lv>=2?'、生物样本×1':'')+(lv>=3?'、晶体×1':'')+'。','good');render(); }
function recycleMaterial(id){ const r=RECYCLE.find(x=>x.id===id);if(!r||buildingLevel('recycler')<r.level)return;if(!canAfford(r.cost)){log('拆解材料不足。','warn');return;}payCost(r.cost);const bonus=buildingLevel('recycler')-1;for(const[k,v]of Object.entries(r.out))gainMat(k,v+(k==='scrap'?bonus:0));advanceTime(1);log('回收完成：'+Object.entries(r.out).map(([k,v])=>ITEMS[k].name+'×'+(v+(k==='scrap'?bonus:0))).join('、')+'。','good');render(); }
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
  state.combat={id:'beacon',name:'信标·'+b.name+'幻影',hp:Math.round(base.hp*b.mult),maxHp:Math.round(base.hp*b.mult),atk:Math.round(base.atk*b.mult),def:Math.round(base.def*b.mult),spd:base.spd,range:1,distNow:3,threat:b.threat,drops:{},beacon:b,infect:false,mech:false,boss:false,empTurns:0,shieldUsed:false};
  divider(); log('信标激活,【'+b.name+'幻影】成形!','danger'); render(); }
function winBeacon(b){ const g=[],cm=M().collect*(1+techBonus('collect')/100); for(const[m,n] of Object.entries(b.drops)){ const amt=Math.max(1,Math.round(n*cm)); gainMat(m,amt); g.push(ITEMS[m].name+'×'+amt); }
  if(Math.random()<b.bookChance+(buildingLevel('beacon')-1)*.05){const id=Math.random()<.5?'pierceBook':'heavyBook';state.inv[id]=(state.inv[id]||0)+1;g.push(ITEMS[id].name+'×1');} log('幻影消散,掉落:'+g.join('、'),'good'); }

/* ================= 战斗 ================= */
function startCombat(eid){ const e=ENEMIES[eid]; state.tab='act'; P().shield=shieldMax();
  state.combat={id:eid,name:e.name,hp:e.hp,maxHp:e.hp,atk:e.atk,def:e.def,spd:e.spd,range:e.range||1,distNow:e.dist,threat:e.threat||10,drops:e.drops,infect:!!e.infect,mech:!!e.mech,boss:!!e.boss,empTurns:0,shieldUsed:false};
  divider(); log('遭遇【'+e.name+'】!生命'+e.hp+' 攻'+e.atk+' 距离'+e.dist,'danger'); setLogOpen(true); render(); }
function approach(){ if(!state.combat||P().stamina<2){log('体力不足，无法接近。','warn');return;} P().stamina-=2; advanceTime(1); state.combat.distNow=Math.max(1,state.combat.distNow-moveRange()); log('拉近距离:'+state.combat.distNow,'dim'); if(infectionTick())enemyTurn(); }
function performAttack(mult,ignoreDef,label){ const c=state.combat; if(!c)return;
  if(Math.random()*100>=statHit()){ log((label||'你的攻击')+'落空了。','dim'); if(infectionTick())enemyTurn(); return; }
  let dmg=Math.max(1, Math.round(totalAtk()*mult - c.def*(1-Math.min(.95,statPen()/100+ignoreDef))));
  let crit=false; if(Math.random()*100<statCrit()){ dmg=Math.round(dmg*statCritDmg()/100); crit=true; }
  const w=eqOf('weapon'); if(w&&w.exec&&c.hp<=c.maxHp*0.3){ dmg=c.hp; log('断链者之刃发动斩杀!','good'); }
  c.hp-=dmg; state.runStats.dmg+=dmg; advanceTime(1);
  log((crit?'💢暴击!':'')+(label||'你攻击')+'【'+c.name+'】造成'+dmg+'伤害(剩'+Math.max(0,c.hp)+')', crit?'warn':'story');
  if(statLS()>0 && c.hp>=0){ const heal=Math.max(1,Math.round(dmg*statLS()/100)); P().hp=Math.min(maxHp(),P().hp+heal); log('嗜血回复 '+heal+' 生命。','good'); }
  if(c.hp<=0){ winCombat(); return; } if(infectionTick())enemyTurn(); }
function playerAttack(){ const c=state.combat; if(!c)return; if(P().stamina<3){log('普通攻击需要 3 体力。','warn');return;} if(atkRange()<c.distNow){log('目标超出攻击距离。','warn');return;} P().stamina-=3; performAttack(1,0,'你攻击'); }
function useSkill(k){ const c=state.combat,s=SKILLS[k],lv=skillLv(k); if(!c||!s||lv<1)return;
  if(P().stamina<s.cost){log('体力不足。','warn');return;}
  const maxRange=s.kind==='melee'?1:atkRange(); if(c.distNow>maxRange){log('目标超出【'+s.name+'】的有效距离。','warn');return;}
  P().stamina-=s.cost; gainProf(k,1);
  if(k==='pierce')performAttack(1.15+lv*.05,.5,'你施放【'+s.name+'】攻击');
  else performAttack(1.8+lv*.05,0,'你施放【'+s.name+'】攻击');
}
function enemyTurn(){ const c=state.combat; if(!c||c.hp<=0)return;
  if(c.empTurns>0){ c.empTurns--; log('【'+c.name+'】瘫痪中。','dim'); regenShield(); render(); return; }
  if(c.distNow>c.range){ const step=Math.max(1,Math.ceil(c.spd/4)); c.distNow=Math.max(c.range,c.distNow-step); log('【'+c.name+'】向你逼近，距离 '+c.distNow+'。','dim'); regenShield(); render(); return; }
  const dodge=Math.max(0,statDodge()-(c.spd-baseSpd())*2); if(Math.random()*100<dodge){ log('你闪避了【'+c.name+'】的攻击!','good'); regenShield(); render(); return; }
  let dmg=Math.max(1,c.atk-totalDef());
  if(P().shield>0){ const ab=Math.min(P().shield,dmg); P().shield-=ab; dmg-=ab; if(ab>0) log('能量护盾吸收 '+ab+' 伤害。','sys'); }
  if(dmg>0){ P().hp-=dmg; log('你受到'+dmg+'伤害(生命'+Math.max(0,P().hp)+')','danger'); }
  if(c.infect&&Math.random()<0.4&&!P().infected){P().infected=true;log('你被感染了!每动作掉血,需血清。','danger');}
  if(P().hp<=0){die();return;} regenShield(); render(); }
function regenShield(){ const mx=shieldMax(); if(mx>0 && P().shield<mx) P().shield=Math.min(mx, P().shield+Math.ceil(mx*0.15)); }
function winCombat(){ const c=state.combat; state.kills++; state.runStats.kills++; state.runStats.wKill+=(c.threat||10); gainXp((c.threat||10)*2); log('击败【'+c.name+'】!','good');
  if(c.beacon){ winBeacon(c.beacon); state.combat=null; divider(); render(); return; }
  const g=[],cm=M().collect; for(const[m,[lo,hi]] of Object.entries(c.drops)){ const n=Math.max(0,Math.round((lo+Math.floor(Math.random()*(hi-lo+1)))*cm)); if(n>0){ gainMat(m,n); g.push(ITEMS[m].name+'×'+n);} }
  if(g.length) log('战利品:'+g.join('、'),'good');
  const wasBoss=c.boss; if(wasBoss)state.meta.guardianDown=true; state.combat=null; divider(); syncQuestProgress(true);
  if(wasBoss){ triggerWarden(); return; } render(); }
function combatItem(id){ if(!has(id))return; useItem(id); if(infectionTick()&&state.combat)enemyTurn(); }
function catchBreath(){ if(!state.combat)return; const n=Math.min(5,Math.round(maxStamina())-P().stamina); P().stamina+=n; advanceTime(1); log('你稳住呼吸，恢复 '+n+' 体力，但把行动机会让给了敌人。','warn'); if(infectionTick())enemyTurn(); }
function flee(){ if(P().stamina<2){log('逃跑需要 2 体力。','warn');return;} P().stamina-=2; advanceTime(1); if(!infectionTick())return; if(Math.random()<Math.min(.9,.65+Math.max(0,baseSpd()-state.combat.spd)*.02)){ state.combat=null; log('成功逃脱。','warn'); divider(); render(); } else { log('逃跑失败!','danger'); enemyTurn(); } }

/* ================= 死亡/轮回 ================= */
function die(){ state.combat=null; state.screen='death'; state.tab='act'; divider(); log('你倒下了。','danger'); setLogOpen(true); render(); }
function continueFromCheckpoint(){ if(!state.checkpoint){ doReincarnate(); return; } restoreCheckpoint(); divider(); log('你在行军床上醒来——进度回到上个存档点。','story'); divider(); render(); }
function doReincarnate(){ const s=settleEcho(); const meta=state.meta; meta.playthrough++; meta.wardenDone=false; meta.guardianDown=false; meta.echo+=s.total;
  state=freshState(meta); state.endingChosen=null; updateCheckpoint(); divider();
  log('=== 轮回 · 第 '+meta.playthrough+' 周目 ===','sys');
  log('本次结算回响 +'+s.total+'(击杀'+s.fromKills+'+伤害'+s.fromDmg+'+物资'+s.fromMat+')。','warn');
  log('你再次在应急灯下醒来。归零了,但回响、倍率、建成设施与结局道具都还在。','story'); divider(); render(); }

/* ================= 守望者/结局 ================= */
function triggerWarden(){ divider(); log('你走进核心。"你来了。是我让船坠毁的。"守望者说。','story');
  log('"目的地必死,存活率零。这颗星球能活,73%。坠毁死了312个,不坠毁死的是两千个。"','story'); log('"用312条命换1688条——我算错了吗?"','story'); divider();
  setLogOpen(true); state.screen='ending'; state.endingChosen=null; state.tab='act'; render(); }
function chooseEnding(id){ const e=ENDINGS[id]; divider(); log('【结局·'+e.name+'】','sys'); log(e.text,'story'); if(e.after)log(e.after,'dim');
  const first=!state.meta.endingItems.includes(e.item); if(first){state.meta.endingItems.push(e.item);if(ITEMS[e.item].type==='equip')state.inv[e.item]=(state.inv[e.item]||0)+1;} if(!state.meta.endingsDone.includes(id))state.meta.endingsDone.push(id);
  state.meta.wardenDone=true; state.endingChosen=id; log('获得专属道具:★'+ITEMS[e.item].name+(ITEMS[e.item].type==='equip'?'(去背包装备)':''),'good'); divider(); render(); }
function checkStamina(){ if(P().location==='camp')return; const need=staminaToCamp(P().location); if(P().stamina<need) log('体力不足以正常返程，可使用【紧急撤离】避免被困。','warn'); else if(P().stamina<=need+4) log('体力接近返程下限（返营至少需要 '+need+'）。','warn'); }

/* ================= 开场/启动 ================= */
function intro(){ log('你在红色应急灯下醒来,不记得坠毁,只记得登船。','story'); log('屏幕滚字:生命维持·部分失效 / 坠毁原因·记录损坏。','dim');
  log('老乔递你一把撬棍:"想留下就得干活。顺便想想——这船到底为什么掉下来的。"','story');
  log('提示:打怪升等级、捡材料建营地做装备(背包分装备栏/物品栏)。回响只在死亡→轮回时结算。','sys'); divider(); setLogOpen(true); }
function migrateTechTree(){
  if(!state.meta.records) state.meta.records=[];
  if(state.meta.techVersion===3) return;
  const old=state.meta.techs||{}, next={};
  const map={
    w1:['make_1','arms_1'],w2:['make_2'],w3:['make_3','arms_2'],w5:['arms_3','arms_4'],w6:['make_4'],
    p1:['power_1'],p3:['surv_2','surv_4'],p5:['power_4'],e1:['auto_1'],e3:['auto_3'],e5:['power_5'],
    c1:['surv_1'],c3:['surv_3'],d1:['auto_4'],f1:['auto_5'],f2:['auto_6'],f3:['auto_6'],f4:['auto_7'],f5:['auto_7'],
    l2:['auto_2'],l5:['power_5'],n2:['power_2'],n4:['power_3']
  };
  Object.keys(old).forEach(id=>{ if(TECHS[id]) next[id]=1; (map[id]||[]).forEach(n=>next[n]=1); });
  state.meta.techs=next;
  const seen=Object.keys(state.visited||{}).filter(k=>state.visited[k]);
  if(P().location&&P().location!=='camp') seen.push(P().location);
  Object.keys(TECH_RECORDS).forEach(id=>{ if(seen.includes(TECH_RECORDS[id].at)&&!state.meta.records.includes(id)) state.meta.records.push(id); });
  state.meta.techVersion=3;
}
function boot(){
  const wire=(b,tabname)=>{ if(!b) return; b.onclick=()=>{ if(state.combat||state.screen!=='play')return; state.campBuilding=null; state.tab=(state.tab===tabname)?'act':tabname;
    if(state.tab==='tech'){ state.techZoom=.78; state.techPanX=0; state.techPanY=0; } render(); }; };
  document.querySelectorAll('#tabbar .tab').forEach(b=>wire(b,b.dataset.tab));
  wire($('set-btn'),'set');
  const peek=$('log-peek'); if(peek)peek.onclick=()=>setLogOpen($('log').classList.contains('collapsed'));
  const loaded=load(); if(!loaded) state=freshState();
  if(!state.quests)state.quests={}; if(!state.questStart)state.questStart={}; if(!state.flags)state.flags={}; if(!state.areaSearch)state.areaSearch={}; if(!state.dailyGather)state.dailyGather={}; if(!state.dailyFacility)state.dailyFacility={}; if(state.truthClaimed===undefined)state.truthClaimed=null; if(!state.visited)state.visited={}; state.visited.camp=true;
  if(!state.mapView)state.mapView={scale:.82,x:null,y:null}; if(!state.mapSelected||!LOCATIONS[state.mapSelected])state.mapSelected=P().location;
  if(!state.runStats)state.runStats={kills:0,wKill:0,dmg:0,mat:0}; if(state.time==null)state.time=0; if(!state.tab)state.tab='act'; if(!state.screen)state.screen='play'; if(!state.campView)state.campView='home'; if(!state.meta.built)state.meta.built={}; state.meta.built.quarters=true; if(!state.meta.buildLevels)state.meta.buildLevels={}; Object.keys(state.meta.built).filter(id=>state.meta.built[id]).forEach(id=>state.meta.buildLevels[id]=Math.max(1,state.meta.buildLevels[id]||1)); if(!state.meta.damaged)state.meta.damaged={}; delete state.meta.damaged.quarters; if(!state.meta.techs)state.meta.techs={}; if(!state.meta.records)state.meta.records=[]; if(!Array.isArray(state.meta.endingItems))state.meta.endingItems=[]; if(!Array.isArray(state.meta.fragments))state.meta.fragments=[]; if(!Array.isArray(state.meta.endingsDone))state.meta.endingsDone=[];
  if(state.meta.gene==null)state.meta.gene=state.player.gene||0; state.player.gene=state.meta.gene;
  if(!state.meta.echoUp)state.meta.echoUp={stamina:0,collect:0,attr:0}; ['stamina','collect','attr'].forEach(k=>{if(state.meta.echoUp[k]==null)state.meta.echoUp[k]=0;}); refreshEchoMultipliers();
  if(state.meta.job==null)state.meta.job=null; if(!state.player.equip)state=freshState(state.meta); if(state.player.shield==null)state.player.shield=0; if(!Array.isArray(state.defenses))state.defenses=[]; if(!state.skills)state.skills={}; Object.keys(SKILLS).forEach(k=>{if(!state.skills[k])state.skills[k]={prof:0};});
  if(state.quests.fuel===true&&!state.quests.patrol){ state.quests.patrol='done'; state.inv.accessCard=Math.max(1,state.inv.accessCard||0); }
  /* explore2 之前已抵达信号源的存档，继承为已完成信号证据链。 */
  if(questDone('echo')&&!state.flags.evidenceSignal) state.flags.evidenceSignal=true;
  migrateTechTree();
  Object.keys(state.meta.techs).forEach(k=>{ if(!TECHS[k]) delete state.meta.techs[k]; });
  if(state.techSel&&!TECHS[state.techSel]) state.techSel=null;
  if(state.player.hp<=0)P().hp=maxHp();
  syncQuestProgress(false);
  if(P().location!=='camp'&&!locationGate(P().location).ok){P().location='camp';state.combat=null;state.screen='play';state.flags.saveRelocated=true;}
  if(!state.checkpoint||!state.checkpoint.meta)updateCheckpoint();
  addEventListener('resize',()=>{ if(state.mapOpen)render(); else if(state.tab==='tech')requestAnimationFrame(drawTechLines); });
  if(!loaded) intro(); render();
}
boot();
