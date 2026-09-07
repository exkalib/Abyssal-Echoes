/* Visually audited 2026-09-05: 34 individual weapon/offhand source images.
 * grip is the physical palm/forearm contact in the FULL source image, not its
 * alpha bounding-box center. Coordinates are normalized [0,1].
 * rotation is clockwise degrees about grip; length is the opaque object's
 * vertical extent in percent of a 1024x1536 character canvas BEFORE rotation.
 * Scale isotropically by length / bounds[3]; never stretch X and Y separately.
 * bounds are measured alpha > 8, in normalized full-source coordinates.
 * All 24 weapon sources are newly generated bare held art with real alpha.
 * ready means the source is prepared; on-body visual QA is a separate gate.
 * Shields show their FRONT. Their rear grip is deliberately occluded: draw the
 * arm and wrist brace behind the shield, never a foreground hand atop the face.
 */
const WEARABLE_GRIPS={
  crowbar:{source:'assets/wearables-v2/weapon-crowbar.webp',width:768,height:768,grip:[0.539,0.518],rotation:18,length:34,kind:'bar',bounds:[0.2852,0.013,0.4466,0.9766],status:'ready',note:'新生成裸撬棍，粗绳缠柄中段；根据源图倾斜单独旋转18度，所有腰带座移除。'},
  knife:{source:'assets/wearables-v2/weapon-knife.webp',width:768,height:768,grip:[.500,.224],rotation:10,length:22,kind:'blade',bounds:[.4076,.0143,.1849,.9661],status:'ready',note:'新生成真实透明裸刀；黑色滚花柄的中段，刀鞘和携行附件全部移除。'},
  blade:{source:'assets/wearables-v2/weapon-blade.webp',width:768,height:768,grip:[0.499,0.132],rotation:8,length:36,kind:'blade',bounds:[0.4102,0.0104,0.1797,0.9779],status:'ready',note:'新生成裸露钢刃，黑色缠绕柄中段；保留青色中槽，挂扣和鞘全部移除。'},
  eblade:{source:'assets/wearables-v2/weapon-eblade.webp',width:768,height:768,grip:[0.5,0.13],rotation:10,length:34,kind:'blade',bounds:[0.4271,0.0104,0.1471,0.9792],status:'ready',note:'新生成电刃，蓝色能源护手上方黑色柄心；电弧保留在刀体附近，没有挂载附件。'},
  sever:{source:'assets/wearables-v2/weapon-sever.webp',width:768,height:768,grip:[0.505,0.153],rotation:9,length:37,kind:'blade',bounds:[0.4297,0.0104,0.1432,0.9766],status:'ready',note:'新生成链刃，棕皮缠柄中段；链齿及红色机体保留，横带和大腰带全部移除。'},
  plasmaSaber:{source:'assets/wearables-v2/weapon-plasmaSaber.webp',width:768,height:768,grip:[0.483,0.151],rotation:10,length:35,kind:'blade',bounds:[0.431,0.0052,0.2266,0.9453],status:'ready',note:'新生成等离子弯刃，橙色能源结上方黑色环纹柄心；无腕绳或腰带片。'},
  phaseBlade:{source:'assets/wearables-v2/weapon-phaseBlade.webp',width:768,height:768,grip:[0.501,0.195],rotation:7,length:29,kind:'blade',bounds:[0.3659,0.0013,0.2708,0.9857],status:'ready',note:'新生成紫晶裸刀，黑色编织柄中段；保留晶刃与紫色护手，背鞘和横带全部移除。'},
  voidBlade:{source:'assets/wearables-v2/weapon-voidBlade.webp',width:768,height:768,grip:[0.501,0.162],rotation:7,length:40,kind:'blade',bounds:[0.4258,0.0065,0.151,0.9857],status:'ready',note:'新生成虚空螺旋刃，青色圆护手上方黑色缠柄；无腰挂座。'},
  pistol:{source:'assets/wearables-v2/weapon-pistol.webp',width:768,height:768,grip:[.654,.207],trigger:[0.47,0.465],rotation:8,length:20,kind:'sidearm',bounds:[.1992,.0143,.6745,.9714],status:'ready',note:'新生成裸枪，右上斜出握把的纹理掌握面；枪套全部移除，扳机护圈透明，枪口外露。'},
  rifle:{source:'assets/wearables-v2/weapon-rifle.webp',width:768,height:768,grip:[.594,.344],trigger:[0.536,0.413],rotation:8,length:41,kind:'longgun',bounds:[.3177,.0078,.3802,.9844],status:'ready',note:'新生成无背带步枪，右侧纹理握把中段；食指沿下方护圈，手心不落在扳机孔或机匣。'},
  plasmaRifle:{source:'assets/wearables-v2/weapon-plasmaRifle.webp',width:768,height:768,grip:[0.583,0.373],trigger:[0.539,0.426],rotation:8,length:40,kind:'longgun',bounds:[0.3581,0.0052,0.2852,0.9844],status:'ready',note:'新生成无背带等离子步枪，右侧黑色纹理握把中段；蓝色能源腔不作为握点，枪口完整裸露。'},
  gravLance:{source:'assets/weapon-poses-v11/weapon-gravLance.webp',width:1672,height:941,grip:[.243,.581],indexRest:[.33,.50],support:[.595,.505],rotation:0,length:70,kind:'longgun',sourceView:'horizontal-right',bounds:[.016,.303,.97,.38],status:'ready',note:'原生透明双手惯性能量长枪；主手握独立手枪式握把，辅助手托前端护木，不再套用法杖姿势。'},
  swarmRifle:{source:'assets/wearables-v2/weapon-swarmRifle.webp',width:768,height:768,grip:[0.607,0.329],trigger:[0.558,0.4],rotation:8,length:39,kind:'longgun',bounds:[0.3802,0.0013,0.2878,0.9857],status:'ready',note:'新生成异化长枪，右侧黑色肋纹握把中段；红色生物机匣与下方异化能源腔保持完整，背带全部移除。'},
  vacuumCarbine:{source:'assets/wearables-v2/weapon-vacuumCarbine.webp',width:768,height:768,grip:[0.575,0.294],trigger:[0.539,0.347],rotation:8,length:40,kind:'longgun',bounds:[0.4063,0.0013,0.2135,0.9922],status:'ready',note:'新生成无背带真空卡宾枪，右上黑色斜握把中段；银色枪身与青色中槽保持连续，握点不落在扳机孔。'},
  blade_general_1:{source:'assets/wearables-v2/weapon-blade_general_1.webp',width:768,height:768,grip:[0.484,0.177],rotation:9,length:28,kind:'blade',bounds:[0.431,0.0013,0.1393,0.9974],status:'ready',note:'新生成裸露砍刀，棕皮螺旋缠柄中段；握柄稍弯，护手、刀刃一体连续，无鞘。'},
  blade_general_2:{source:'assets/wearables-v2/weapon-blade_general_2.webp',width:768,height:768,grip:[0.5,0.154],rotation:8,length:34,kind:'blade',bounds:[0.4388,0.0091,0.1224,0.9818],status:'ready',note:'新生成黄黑工业裸刀，黑色环纹柄心；右侧黄脊是刀体结构，左侧完整钢刃外露。'},
  blade_general_3:{source:'assets/wearables-v2/weapon-blade_general_3.webp',width:768,height:768,grip:[0.501,0.143],rotation:9,length:36,kind:'blade',bounds:[0.3919,0,0.2161,0.9974],status:'ready',note:'新生成黄灰战术裸刀，黑金螺旋柄心；无挂环或承载鞘，侧方切刃外露。'},
  blade_general_4:{source:'assets/wearables-v2/weapon-blade_general_4.webp',width:768,height:768,grip:[0.187,0.167],rotation:49,length:31,kind:'blade',bounds:[0.0651,0.0169,0.8438,0.9688],status:'ready',note:'新生成白紫相位剑，源图为右下斜剑；握点取左上黑柄，单独转49度、缩短预旋转高度，不能沿用中央握点。'},
  blade_general_5:{source:'assets/wearables-v2/weapon-blade_general_5.webp',width:768,height:768,grip:[0.499,0.137],rotation:9,length:41,kind:'blade',bounds:[0.3919,0,0.2161,1],status:'ready',note:'新生成金青综合长剑，黑金缠柄中段；金色护手下方银刃全部裸露，无收纳铰链或框鞘。'},
  firearm_general_1:{source:'assets/wearables-v2/weapon-firearm_general_1.webp',width:768,height:768,grip:[0.646,0.212],trigger:[0.486,0.43],rotation:8,length:20,kind:'sidearm',bounds:[0.2266,0.0273,0.638,0.9362],status:'ready',note:'新生成无套灰钢手枪，右上菱格黑握把中段；棕铜铆钉与橙光保留，整个枪管及扳机护圈外露。'},
  firearm_general_2:{source:'assets/wearables-v2/weapon-firearm_general_2.webp',width:768,height:768,grip:[0.643,0.2],trigger:[0.508,0.424],rotation:8,length:21,kind:'sidearm',bounds:[0.2357,0.013,0.6172,0.9635],status:'ready',note:'新生成无套黄黑工业手枪，右上黑色纹理握把中段；黄色警戒条是枪身涂装，无枪套或带扣。'},
  firearm_general_3:{source:'assets/wearables-v2/weapon-firearm_general_3.webp',width:768,height:768,grip:[0.638,0.178],trigger:[0.528,0.377],rotation:8,length:22,kind:'sidearm',bounds:[0.2891,0.013,0.5599,0.9596],status:'ready',note:'新生成黄灰双蓝芯手枪，右上黑色纹理握把中段；蓝色双芯及下方灰钢枪管外露，无固定支架。'},
  firearm_general_4:{source:'assets/wearables-v2/weapon-firearm_general_4.webp',width:768,height:768,grip:[0.614,0.185],trigger:[0.499,0.38],rotation:8,length:22,kind:'sidearm',bounds:[0.2799,0.0339,0.5195,0.9206],status:'ready',note:'新生成白紫相位手枪，右上黑色握把中段；白瓷枪体、紫色能源腔裸露，原枪套和横扣全部移除。'},
  firearm_general_5:{source:'assets/wearables-v2/weapon-firearm_general_5.webp',width:768,height:768,grip:[0.664,0.215],trigger:[0.556,0.439],rotation:8,length:23,kind:'sidearm',bounds:[0.2878,0.0286,0.5625,0.9245],status:'ready',note:'新生成金青高阶手枪，右上黑色纹理握把中段；金色星章为握把饰面，无大外套或右侧扣带。'},
  riotShield:{source:'assets/wearables-v1/riotShield.webp',width:512,height:768,grip:[.190,.534],rotation:-3,length:37,kind:'shield-handle',bounds:[.0898,.043,.8398,.9063],occlusion:'behind-shield',status:'ready',note:'左缘可见真实纵向后握杆，掌心放橙环上方黑杆，不放盾牌几何中心。臂和手在盾面后，只允许盾缘露出指节。'},
  eshieldUnit:{source:'assets/wearables-v1/eshieldUnit.webp',width:512,height:524,grip:[.497,.512],rotation:-4,length:23,kind:'shield-brace',bounds:[.0527,.0229,.8945,.9561],occlusion:'behind-shield',status:'ready',note:'上下腕带对应纵向前臂安装轴；中心为背面掌握接触点，前景不画手。腕部连接应从上缘带座露出。'},
  phaseShield:{source:'assets/wearables-v1/phaseShield.webp',width:512,height:768,grip:[.500,.476],rotation:-3,length:39,kind:'shield-brace',bounds:[.1289,.0039,.7422,.9922],occlusion:'behind-shield',status:'ready',note:'中心能源结后方是掌握轴；该图只有盾前脸，无可见后握把。用被盾遮住的握拳及前臂背部连接，不可把手叠在发光盾面上。'},
  citadelShield:{source:'assets/wearables-v1/citadelShield.webp',width:512,height:768,grip:[.506,.456],rotation:-3,length:43,kind:'shield-brace',bounds:[.1426,0,.7129,1],occlusion:'behind-shield',status:'ready',note:'中央能源结下方对应隐藏后把；长盾覆盖手和前臂，上臂必须在盾顶附近连续接入。'},
  shield_specialist_3:{source:'assets/equipment-art-v3/shield_specialist_3.webp',width:512,height:512,grip:[.501,.485],rotation:-3,length:41,kind:'shield-brace',bounds:[.2266,.0078,.5469,.9883],occlusion:'behind-shield',status:'ready',note:'长盾中央能源结后方掌握点；顶部横杆是提手不是垂臂战斗握点。前臂及握拳遮于盾后。'},
  shield_general_1:{source:'assets/equipment-art-v3/shield_general_1.webp',width:512,height:512,grip:[.501,.505],rotation:-4,length:22,kind:'shield-brace',bounds:[.0254,.0234,.9473,.9434],occlusion:'behind-shield',status:'ready',note:'圆盾中心凸台后的横握把；四角皮带是盾结构不是手握位置。握拳在盾后，前臂从上缘接入。'},
  shield_general_2:{source:'assets/equipment-art-v3/shield_general_2.webp',width:512,height:484,grip:[.504,.497],rotation:-4,length:23,kind:'shield-brace',bounds:[.0332,.0124,.9336,.9566],occlusion:'behind-shield',status:'ready',note:'中央黑圆盖后的隐藏握点；源图略宽于高，保持原始比例，不能拉成长椭圆。'},
  shield_general_3:{source:'assets/equipment-art-v3/shield_general_3.webp',width:512,height:512,grip:[.501,.505],rotation:-4,length:24,kind:'shield-brace',bounds:[.0391,.0059,.9219,.9727],occlusion:'behind-shield',status:'ready',note:'中央三螺栓圆盘背后安装掌握点；前景能源盘保持完整，手只在其背面。'},
  shield_general_4:{source:'assets/equipment-art-v3/shield_general_4.webp',width:512,height:512,grip:[.503,.499],rotation:-4,length:25,kind:'shield-brace',bounds:[.0156,.0059,.9688,.9766],occlusion:'behind-shield',status:'ready',note:'白色圆盘中心后的隐藏横握把；前臂要被上半圆遮挡，不在紫色外环处悬接。'},
  shield_general_5:{source:'assets/equipment-art-v3/shield_general_5.webp',width:512,height:512,grip:[.499,.500],rotation:-4,length:26,kind:'shield-brace',bounds:[.0098,.0098,.9785,.9727],occlusion:'behind-shield',status:'ready',note:'中央黑钢凸面背后为掌握点；上方金色径向梁作为前臂入盾方向，手在盾后。'}
};
// Hilt direction is measured from the actual handle, not the art canvas center.
const WEARABLE_HANDLE_AXES={crowbar:[.53,.38],knife:[.5,.39],blade:[.5,.23],eblade:[.5,.23],sever:[.5,.26],plasmaSaber:[.49,.26],phaseBlade:[.50,.33],voidBlade:[.50,.28],blade_general_1:[.50,.30],blade_general_2:[.50,.28],blade_general_3:[.50,.27],blade_general_4:[.286,.269],blade_general_5:[.50,.25]};
for(const [id,axis]of Object.entries(WEARABLE_HANDLE_AXES))WEARABLE_GRIPS[id].handleAxis=axis;
// V8 standing pose: keep actual longsword proportions. Move the physical hand
// contact toward the guard as length increases, rather than enlarging the fist.
// Short knives remain short; long shafts use a modest separate adjustment.
for(const [id,factor]of Object.entries({blade:1.32,eblade:1.32,sever:1.25,plasmaSaber:1.3,voidBlade:1.25,blade_general_1:1.18,blade_general_2:1.3,blade_general_3:1.3,blade_general_4:1.25,blade_general_5:1.25})){
  const art=WEARABLE_GRIPS[id];art.length*=factor;
  if(art.kind==='blade')art.grip=art.grip.map((n,i)=>n+(art.handleAxis[i]-n)*(1-1/factor));
}
// Resting inventory portrait: index contacts the frame ABOVE the guard, never
// the trigger opening. Each point is on that item's actual source silhouette.
const WEARABLE_INDEX_RESTS={pistol:[.378,.553],firearm_general_1:[.389,.49],firearm_general_2:[.443,.46],firearm_general_3:[.45,.435],firearm_general_4:[.421,.441],firearm_general_5:[.474,.49],rifle:[.497,.423],plasmaRifle:[.506,.442],swarmRifle:[.517,.421],vacuumCarbine:[.51,.364]};
for(const [id,point]of Object.entries(WEARABLE_INDEX_RESTS))WEARABLE_GRIPS[id].indexRest=point;
if(typeof module!=='undefined'&&module.exports)module.exports={WEARABLE_GRIPS};
