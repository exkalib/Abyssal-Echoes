/* V8 occupied cylindrical grips. Palm, the gripped hilt and all five fingers
 * are authored together. Item-specific blade/guard/pommel art stays separate.
 * No legacy empty-fist fallback and no one-weapon-only integrated sample.
 * Source pixels/alpha are untouched; cuff/finger limits are rig part visibility.
 */
const WEARABLE_SWORD_HANDS={};
const WEARABLE_SWORD_V8=[
  // id, native size, alpha bounds, wrist, grip, upper hilt axis, little-finger hem, palm width
  ['bare',768,768,[.332,.1224,.3255,.7305],[.508,.27],[.521,.54],[.508,.32],.716,7],
  ['workGloves',702,768,[.3063,.0521,.3946,.8424],[.506,.30],[.528,.535],[.515,.31],.741,7.6],
  ['nanoWeaveGloves',680,768,[.2941,.0508,.4132,.8529],[.505,.31],[.531,.56],[.523,.33],.76,7.5],
  ['servoGauntlet',615,768,[.2146,.0182,.548,.9427],[.506,.31],[.53,.55],[.512,.30],.786,8.3],
  ['hands_general_1',633,768,[.2796,.0612,.4471,.8646],[.502,.315],[.529,.57],[.518,.34],.777,7.7],
  ['hands_general_2',640,768,[.2734,.0716,.4609,.8281],[.505,.30],[.533,.55],[.527,.30],.756,7.9],
  ['hands_general_3',640,768,[.2547,.0521,.5016,.8633],[.505,.30],[.54,.55],[.525,.31],.764,7.9],
  ['hands_general_4',638,768,[.2367,.0365,.5031,.9063],[.503,.30],[.529,.56],[.513,.31],.8,7.9],
  ['hands_general_5',752,768,[.2527,.0326,.4574,.9141],[.504,.30],[.524,.54],[.512,.29],.798,7.9],
  ['hands_specialist_5',660,768,[.2485,.0352,.4955,.9245],[.505,.30],[.539,.54],[.521,.28],.785,8.4]
];
for(const [id,width,height,bounds,wrist,grip,handleAxis,fingerHem,palmWidth]of WEARABLE_SWORD_V8){
  const size=[palmWidth,palmWidth*(bounds[3]*height)/(bounds[2]*width)/1.5];
  WEARABLE_SWORD_HANDS[id]={file:'../wearables-v2/grip-sword-v8-'+id,width,height,bounds,wrist,grip,handleAxis,
    fit:{male:{size,rotation:0},female:{size:size.map(n=>n*.94),rotation:0}},
    pose:'sword',occupiedHilt:true,forearmPose:'v8',retainCuff:id!=='bare',
    // Trim only the wrist stub and the surplus handle below the little finger.
    // The visible leather inside the web and between the fingers stays intact.
    wristCutContour:[[0,wrist[1]-.018],[1,wrist[1]-.018],[1,fingerHem],[0,fingerHem]]};
}
if(typeof module!=='undefined'&&module.exports)module.exports={WEARABLE_SWORD_HANDS};
