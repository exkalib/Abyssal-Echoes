# 《深渊回响》远航篇：零号星门

> 第一部核心舱后的首个完整扩展篇。保留现有 64 项科技与全部结局，新增长线目标：建造星舰、进入近地轨道、建立外星据点，并追踪回响信号至零号星门。

## 1. 篇章定位

核心舱事件结束后，玩家从守望者残留数据中恢复一段深空航迹。无论第一部选择关闭、共存、公审、远航或轮回，都能进入本篇；原结局只改变协助者、对白与少量开局资源，不得锁死远航内容。

本篇主循环：

1. 在营地恢复星舰船坞与导航阵列。
2. 制造承力框架、推进脊、惯性壳、生态舱和导航核心五个总装组件。
3. 驾船抵达新区域，亲自完成首次测绘和样本采集。
4. 清除或解决区域控制者。
5. 建立据点核心、防卫阵列和采集站。
6. 守住一次反扑，使据点进入运行状态。
7. 用当地材料升级星舰，开启下一段航路。

玩家不是点完科技就自动占领星球。科技提供能力，探索提供资料和原料，据点提供持续产出，首领决定区域控制权，四者缺一不可。

## 2. 故事主线

守望者没有制造深渊信号，它只是截获并执行了一套更古老的“文明隔离协议”。近地轨道中继仍在重复该协议；赤烬卫星保存着远航燃料；绿潮星是一座被协议判定为失控的活体殖民地；静默星则封存着协议的源头——零号星门。

本篇逐步提出一个问题：玩家建立外星据点时，是在重建文明，还是在复制守望者以安全为名的控制？最终选择决定星门归属，但所有选择都应保留后续扩展入口。

## 3. 星际区域与地点

### 3.1 近地轨道残骸群 `orbit`

首航区域，不依赖外星材料。重点是失压探索、机械敌人与航迹资料。

| 地点 ID | 名称 | 玩法与产出 |
| --- | --- | --- |
| `orbitalGraveyard` | 轨道墓场 | 安全接驳点；回收钛合金、晶圆、能量核心；首次抵达固定留下返航燃料。 |
| `brokenRing` | 断裂环站 | 失压设施；真空作战教学与高阶旧舰材料资源点。 |
| `wardenRelay` | 守望者外轨中继 | 区域首领所在地；胜利获得 `orbitalRelay` 和赤烬卫星坐标。 |

### 3.2 赤烬卫星 `ashMoon`

第一座可控制的外星据点，提供稳定星际燃料和星舰结构材料。

| 地点 ID | 名称 | 玩法与产出 |
| --- | --- | --- |
| `regolithSea` | 赤烬月海 | `helium3` 资源点；固定事件提供 `heliumArchive`。 |
| `iridiumCrater` | 铱环陨坑 | `iridiumOre` 资源点；取得 `iridiumSample`；首个 `colonizable` 地点。 |
| `massDriver` | 废弃质量投射站 | 区域首领所在地；关闭投射主脑后才允许建立据点。 |

### 3.3 绿潮星 `verdant`

活体生态星球。安全登陆区先提供样本，玩家研究隔离技术后才能深入，避免进入条件与资料互锁。

| 地点 ID | 名称 | 玩法与产出 |
| --- | --- | --- |
| `xenoShore` | 绿潮登陆岸 | 安全登陆区；首次采样固定获得 `xenoGenome`。 |
| `livingCanopy` | 活体天幕 | 需要异星生态滤膜；`xenoBiomass` 资源点，也是绿潮星前哨候选地。 |
| `seedCitadel` | 母巢城 | 行星冠体所在地；可战胜或同步，两个方案都给 `monolithCoordinates`。 |

### 3.4 静默星 `silent`

星门文明遗址。玩家先抵达外层获取曲率资料，再制造曲率航迹胞进入内层，避免先有钥匙还是先到地点的死锁。

| 地点 ID | 名称 | 玩法与产出 |
| --- | --- | --- |
| `blackGlassPlain` | 黑玻原 | 安全外层；`voidCrystal` 资源点；固定获得 `gateLattice`。 |
| `precursorVault` | 先驱档案库 | 消耗 `warpCell` 进入；取得 `gateGrammar`。 |
| `zeroGate` | 零号星门 | 星门监护者与篇章终局选择所在地。 |

## 4. 科技阶段 9–12

现有 64 个节点仍为第 1–8 阶段。本篇追加 18 个节点，总计 82 个，继续沿用现有七个分支，不增加孤立的“太空分支”。

### 4.1 第 9 阶段：远航准备

| ID | 分支 | 前置 | 资料 / 设施 | 解锁 |
| --- | --- | --- | --- | --- |
| `make_13` 船坞重构 | 工程制造 | `make_12`,`energy_9` | `core`；物质打印机、能源核心 | 建筑 `starDock`；配方 `shipFrame` |
| `energy_10` 星舰聚变推进 | 能源场 | `energy_9`,`make_12` | `core`；能源核心 | `fusionDrive` |
| `power_9` 惯性航行壳 | 动力防护 | `power_8`,`energy_10` | 重力锚 | `inertialHull` |
| `surv_10` 闭环航行生态 | 生存医疗 | `surv_9`,`make_12`,`energy_9` | 生物构造室 | `arkHabitat` |
| `echo_8` 星间回响定位 | 异常回响 | `echo_7`,`energy_9` | `core`；回响观测台 | 揭示 `orbitalGraveyard` |
| `auto_12` 深空导航智能 | 探测自动化 | `auto_11`,`echo_8`,`energy_10` | 数据终端、回响观测台 | 建筑 `navArray`；`navComputer` |
| `arms_9` 真空作战系统 | 武器系统 | `arms_8`,`power_9`,`energy_10` | `military`；重力锚 | `vacuumCarbine` |

五个星舰总装组件（承力框架与四个核心系统）全部使用第一部材料，不能要求尚未抵达的外星资源：

- `shipFrame`：可编程物质×6、钛合金×8、超导线圈×4。
- `fusionDrive`：聚变燃料芯×6、超导线圈×5、可编程物质×2。
- `inertialHull`：钛合金×8、可编程物质×4、碳纳米复材×4。
- `arkHabitat`：仿生基质×6、可编程物质×3、聚变燃料芯×2。
- `navComputer`：量子核心×4、回响介质×4、晶圆×6。

### 4.2 第 10 阶段：轨道工业

| ID | 分支 | 前置 | 资料 / 设施 | 解锁 |
| --- | --- | --- | --- | --- |
| `make_14` 星舰级铱合金 | 工程制造 | `make_13`,`power_9` | `iridiumSample`；星舰船坞、熔炼炉 | `starAlloy` |
| `energy_11` 氦三燃料循环 | 能源场 | `energy_10`,`make_14` | `heliumArchive`；能源核心、星舰船坞 | `stellarFuel` |
| `auto_13` 行星据点协议 | 探测自动化 | `auto_12`,`make_14` | `orbitalRelay`；导航阵列、无人机坞 | `outpostCore`,`planetShield` |

`auto_13` 必须显式依赖 `make_14`，因为据点核心需要星舰铱合金。第一座据点的基础防卫也必须在该节点解锁，不能反向依赖绿潮星之后的 `auto_14`。

### 4.3 第 11 阶段：行星殖民

| ID | 分支 | 前置 | 资料 / 设施 | 解锁 |
| --- | --- | --- | --- | --- |
| `surv_11` 异星生态隔离 | 生存医疗 | `surv_10`,`echo_8` | `xenoGenome`；生物构造室 | `xenoFilter` |
| `make_15` 活体复合制造 | 工程制造 | `make_14`,`surv_11`,`make_11` | `xenoGenome`；打印机、生物构造室 | `livingComposite` |
| `auto_14` 星球自治物流 | 探测自动化 | `auto_13`,`energy_11`,`make_15` | 导航阵列、无人机坞 | `exoExtractor`；防卫与无人机升级 |
| `power_10` 自适应登陆壳 | 动力防护 | `power_9`,`surv_11`,`make_15`,`energy_11` | 重力锚、生物构造室 | `exoShell` |

### 4.4 第 12 阶段：星门时代

| ID | 分支 | 前置 | 资料 / 设施 | 解锁 |
| --- | --- | --- | --- | --- |
| `echo_9` 恒星尺度回响 | 异常回响 | `echo_8`,`auto_14` | `monolithCoordinates`；观测台、导航阵列 | 揭示 `blackGlassPlain` |
| `energy_12` 曲率航迹驱动 | 能源场 | `energy_11`,`echo_9`,`make_15` | `gateLattice`；星舰船坞、观测台 | `warpCell` |
| `arms_10` 轨道压制阵列 | 武器系统 | `arms_9`,`auto_14`,`energy_12` | 星舰船坞、导航阵列 | `orbitalLance` |
| `echo_10` 零号星门构造学 | 异常回响 | `echo_9`,`energy_12`,`auto_14` | `gateGrammar`；观测台、导航阵列 | 零号星门通行知识；`gateKey` 由监护者固定掉落 |

`orbitalLance` 不是普通攻击加成。每场行星首领战只能调用一次，用于摧毁一个护盾塔、场锚或机制目标。

## 5. 材料与加工链

本篇新增 8 种材料，其中 4 种地图原料、4 种营地加工品。

| ID | 名称 | 来源 / 配方 |
| --- | --- | --- |
| `helium3` | 氦三 | 赤烬月海，每日定向采集 2 次。 |
| `iridiumOre` | 铱晶矿 | 铱环陨坑，每日定向采集 2 次。 |
| `xenoBiomass` | 异星活质 | 活体天幕，每日定向采集 2 次。 |
| `voidCrystal` | 真空相晶 | 黑玻原，每日定向采集 1 次。 |
| `starAlloy` | 星舰铱合金 | 铱晶矿×3、钛合金×2、可编程物质×1。 |
| `livingComposite` | 活体复材 | 异星活质×3、仿生基质×2、纳米机群×1。 |
| `stellarFuel` | 恒星燃料 | 氦三×3、聚变燃料芯×1、超导线圈×1。 |
| `warpCell` | 曲率航迹胞 | 真空相晶×2、回响介质×2、量子核心×1、恒星燃料×1。 |

加工品只能由对应科技和设施等级生产，随机调查不得绕过每日资源点上限。

## 6. 营地建筑与外星前哨

### 6.1 营地建筑

#### 星舰船坞 `starDock`

- 类型：`kind:'shipyard'`，工位：`st:'ship'`。
- 基础成本：可编程物质×6、钛合金×12、超导线圈×6、钢材×20。
- Lv1：组装承力框架与四个核心系统。
- Lv2，需要 `make_14`：加工星舰铱合金、改装殖民舱段。
- Lv3，需要 `energy_12`：制造曲率航迹胞、安装曲率环。

#### 深空导航阵列 `navArray`

- 类型：`kind:'nav'`。
- 基础成本：量子核心×5、回响介质×5、晶圆×8。
- 展示航线、去返燃料、首次抵达储备和各据点状态。
- 后续科技需要它在线，但配方仍在各自唯一工位制作。

### 6.2 外星据点组件 `OUTPOST_BUILDINGS`

#### 行星据点核心 `outpostCore`

- 科技：`auto_13`。
- 成本：星舰铱合金×4、量子核心×2、聚变燃料芯×3。
- 只能建在已解决区域控制者的 `colonizable` 地点。
- 提供检查点、当地休整、失联返航落点和一次性基础维修。

#### 行星防卫阵列 `planetShield`

- 科技：`auto_13`。
- 成本：星舰铱合金×4、恒星燃料×1、量子核心×2。
- 建成后触发一次区域反扑；守住后据点从 `secured` 进入 `operational`。
- 失败只会停产一天并允许重试，不摧毁据点核心或航路。

#### 异星采集站 `exoExtractor`

- 科技：`auto_14`。
- 成本：星舰铱合金×3、活体复材×2、纳米机群×4。
- 每日从本区域已亲自登记的资源点带回一组原料。
- 不获取任务资料、首领掉落或一次性道具。

据点最小状态：

```js
state.meta.outposts = {
  ashMoon: {
    site: 'iridiumCrater',
    parts: { outpostCore:true, planetShield:true, exoExtractor:false },
    status: 'operational',
  }
};
```

## 7. 航线与燃料

`SPACE_ROUTES` 使用独立对象，不与地面体力路线混在一起：

| 航线 | 解锁 | 消耗 |
| --- | --- | --- |
| `camp → orbitalGraveyard` | `starshipReady` | 首航聚变燃料芯×1 |
| `orbitalGraveyard → regolithSea` | `orbitalRelaySecured` | 聚变燃料芯×2 |
| `regolithSea → xenoShore` | `ashOutpostOperational` | 恒星燃料×1 |
| `xenoShore → blackGlassPlain` | `verdantOutpostOperational` 与 `echo_9` | 恒星燃料×2 |
| `blackGlassPlain → precursorVault` | `energy_12` | 曲率航迹胞×1 |

每条航线对象必须包含：`from`、`to`、`cost`、解锁引用、`emergencyReturn:true`。所有前向首次抵达都带 `firstArrivalGrant`，数量至少覆盖一次原路返航成本。

## 8. 十六节任务 DAG

| ID | 前置 | 类型 / 目标 | 关键结果 |
| --- | --- | --- | --- |
| `exo_signal` | `core` | 核心舱固定事件 | 恢复深空航迹。 |
| `exo_dock` | `exo_signal` | 建造星舰船坞 | 开放星舰装配。 |
| `exo_ship` | `exo_dock` | 在营地提交五个总装组件 | `starshipReady`，并给首航与返航燃料。 |
| `exo_first_launch` | `exo_ship` | 抵达轨道墓场 | 开启轨道篇。 |
| `exo_relay` | `exo_first_launch` | 击败轨道中继首领 | `orbitalRelaySecured`，获得卫星坐标。 |
| `exo_ash_landing` | `exo_relay` | 抵达赤烬月海 | 固定返航储备。 |
| `exo_mass_driver` | `exo_ash_landing` | 关闭质量投射主脑 | 赤烬卫星允许建据点。 |
| `exo_first_outpost` | `exo_mass_driver` | 建核心、防卫并守住反扑 | `ashOutpostOperational`。 |
| `exo_verdant_landing` | `exo_first_outpost` | 抵达绿潮登陆岸 | 固定获得异星基因组与返航储备。 |
| `exo_genome` | `exo_verdant_landing` | 绿潮登陆岸取得固定样本，再研究生态滤膜 | 确认行星冠体与旧殖民者关系。 |
| `exo_seed_choice` | `exo_genome` | 战胜或同步行星冠体 | 两路都设置 `verdantResolved` 并给静默星坐标。 |
| `exo_green_outpost` | `exo_seed_choice` | 建立绿潮星据点并守住反扑 | `verdantOutpostOperational`。 |
| `exo_silent_route` | `exo_green_outpost` | 抵达黑玻原 | 获得曲率晶格资料。 |
| `exo_vault` | `exo_silent_route` | 用曲率航迹胞抵达先驱档案库 | 搜索固定档案后获得零号星门构造文法。 |
| `exo_gate_guardian` | `exo_vault` | 击败星门监护者 | `gateGuardianDown`，固定获得星门密钥。 |
| `exo_frontier_choice` | `exo_gate_guardian` | 星门终局选择 | 完成本篇并保留后续航路。 |

所有新增任务仍使用现有 `after` DAG；不得用“科技数量达到多少”代替明确剧情前置。

## 9. 敌人和首领机制

- `scrapDrone` 轨道拆解蜂：机械敌人，会破坏装备耐久或偷取本次收获。
- `vacuumInterceptor` 真空截击机：远程单位，EMP 可切断护盾。
- `relayCorsair` 中继劫持体：三段场锚依次吸收攻击；场锚存在时单次伤害上限为最大生命的 25%。
- `lunarCrawler` 月壤磁爬兽：高护甲、低速度，穿透与重力武器克制。
- `massDriverAI` 质量投射主脑：每三回合完成一次追加贯穿轰击，EMP 可推迟该循环。
- `xenoStalker` 异星伏猎体、`livingBulwark` 活体壁垒：高生命、高感染压力，是绿潮星的常驻敌群。
- `planetaryCrown` 行星冠体：可以战斗，也可通过生态与回响条件同步；主线资料奖励一致。
- `phaseSentinel` 相位哨兵：静默星的高护甲远程守卫，曲率阶段主要承担常驻压力。
- `gateCustodian` 星门监护者：四座场锚限制单次伤害，并周期抽取体力；轨道压制可一次清除全部场锚并削弱防御。

完成 `arms_10` 并在船坞制造 `orbitalLance` 后，星外首领战出现一次性的【轨道压制】操作：造成最大生命 18% 伤害、清除场锚并降低 28% 防御。

## 10. 分支结局

### 征服协议

玩家接管星门，将据点纳入单一指挥链。生产效率最高，外星反扑频率也最高；后续剧情质疑玩家是否成为新的守望者。

### 共生协议

玩家把星门协议交给营地与绿潮星共同管理。资源增长较慢，但据点关系稳定，后续篇章获得更多 NPC 与外交路线。

### 自由航路

玩家只控制航站和补给线，不占领完整世界。扩张速度较慢，但各区域保留自己的选择，后续扩展更偏探索与贸易。

选择记录在 `meta.frontierDoctrine`，三种路线都保留零号星门、已建设施和下一篇入口，不得要求玩家重装或重开存档。

## 11. 防软锁原则

1. 航线界面同时显示去程与返程所需燃料；不足时禁止出发。
2. 每个首次登陆点固定提供一次返航储备，不能依赖随机掉落。
3. 所有星外地点始终显示“紧急返航”：直接回方舟营地，损失部分本次普通收获，不损失唯一资料与任务道具。
4. 唯一科技资料来自固定事件、首领或选择结算，不进入随机掉落池。
5. 两个剧情选择都发放后续科技所需的同一份关键资料。
6. 据点反扑失败后保持 `defending` 状态并允许重试，不销毁核心、航路或唯一燃料。
7. 新区域原料不得作为首次抵达该区域的航线成本。
8. 静默星外层无需曲率航迹胞；玩家先取得 `gateLattice`，再研究 `energy_12` 进入内层。
9. 随机调查不能绕过资源点每日次数；外星采集站也共享独立的每日结算。
10. 出航途中体力归零有安全结算，不允许出现既不能继续、又不能返航的状态。

## 12. 实现约束

### 12.1 设施等级必须是真门槛

新增配方应声明设施等级，例如：

```js
starAlloySmelt: { level:5, cost:{iridiumOre:3,titanium:2,programmableMatter:1}, out:'starAlloy' },
warpCell: { st:'energy', level:6, cost:{voidCrystal:2,echoMedium:2,quantumCore:1,stellarFuel:1}, out:'warpCell' }
```

研究、配方列表和实际制作必须调用同一个设施门槛函数。不能只在升级说明里写“允许制造”，却让 Lv1 设施直接制作终局材料。

### 12.2 存档与检查点必须一起迁移

新增状态至少包括：

- `meta.outposts`
- `meta.frontierDoctrine`
- `meta.spaceFlags.starshipReady`
- `meta.spaceRecords` 与 `meta.spaceItems`
- `dailyFacility['outpost:'+regionId]`
- 星际首次抵达与航路解锁记录

提升 `techVersion` 时，`freshState`、启动读取和 `restoreCheckpoint` 必须共用同一个标准化/迁移函数。检查点中的 `meta` 不能绕过迁移，否则死亡读档会丢失据点、建筑等级或远航科技。

### 12.3 测试口径

- 科技总数 82，分支仍为 7。
- 新材料 8 种，其中加工配方 4 个。
- 世界区域总数 8，新区域 4 个、新地点 12 个。
- 所有科技前置、设施、资料、配方和航线端点必须引用有效 ID。
- 所有科技成本必须能由其前置链或此前可到达的地图来源获得。
- `SPACE_ROUTES` 必须具备返航兜底；新存档必须初始化 `meta.outposts`。
