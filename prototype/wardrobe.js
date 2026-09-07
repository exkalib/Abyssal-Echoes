/* Fixed-pose wardrobe rig. Every item has a fitted, true-alpha physical layer.
 * V3 inventory thumbnails show the same wearable object's canonical artwork. */
const WEARABLE_ROOT='assets/wearables-v1/';
const wearableFits=typeof WEARABLE_FIT_V2!=='undefined'?WEARABLE_FIT_V2:require('./wardrobe-fit.js').WEARABLE_FIT_V2;
const wearableGrips=typeof WEARABLE_GRIPS!=='undefined'?WEARABLE_GRIPS:require('./wardrobe-grips.js').WEARABLE_GRIPS;
const wearableHands=typeof WEARABLE_HOLD_HANDS!=='undefined'?WEARABLE_HOLD_HANDS:require('./wardrobe-hands.js').WEARABLE_HOLD_HANDS;
const wearableTriggerHands=typeof WEARABLE_TRIGGER_HANDS!=='undefined'?WEARABLE_TRIGGER_HANDS:require('./wardrobe-trigger-hands.js').WEARABLE_TRIGGER_HANDS;
const wearableSwordHands=typeof WEARABLE_SWORD_HANDS!=='undefined'?WEARABLE_SWORD_HANDS:require('./wardrobe-sword-hands.js').WEARABLE_SWORD_HANDS;
const wearableWeaponPoses=typeof WEARABLE_WEAPON_POSES!=='undefined'?WEARABLE_WEAPON_POSES:require('./wardrobe-weapon-poses.js');
const wearableWeaponArt=typeof WEARABLE_WEAPON_ART!=='undefined'?WEARABLE_WEAPON_ART:require('./wardrobe-weapon-art.js');
const wearableWeaponEffects=typeof WEARABLE_WEAPON_EFFECTS!=='undefined'?WEARABLE_WEAPON_EFFECTS:require('./wardrobe-weapon-effects.js');
const wearableHandEffects=typeof WEARABLE_HAND_EFFECTS!=='undefined'?WEARABLE_HAND_EFFECTS:require('./wardrobe-hand-effects.js');
const WEARABLE_UNIFORMS=['bulwark','vanguard','infiltrator'];
const WEARABLE_ORDER=['back','legs','feet','body','hands','weapon','offhand','head','implant','module'];
const WEARABLE_ART={
  sever:{slot:'weapon',male:[['sever',-16,33,.25,.48]],female:[['sever',-16,31,.25,.48]]},
  plasmaSaber:{slot:'weapon',male:[['plasmaSaber',-16,33,.30,.48]],female:[['plasmaSaber',-16,31,.30,.48]]},
  phaseBlade:{slot:'weapon',male:[['phaseBlade',-16,36,.25,.42]],female:[['phaseBlade',-16,34,.25,.42]]},
  voidBlade:{slot:'weapon',male:[['voidBlade',-16,33,.34,.48]],female:[['voidBlade',-16,31,.34,.48]]},
  dodgeMod:{slot:'module',male:[['dodgeMod',0,35,.20,.20]],female:[['dodgeMod',0,34,.20,.20]]},
  penMod:{slot:'module',male:[['penMod',0,34,.20,.20]],female:[['penMod',0,33,.20,.20]]},
  echoMemory:{slot:'module',male:[['echoMemory',0,34,.20,.20]],female:[['echoMemory',0,33,.20,.20]]},
  timeLagModule:{slot:'module',male:[['timeLagModule',0,41,.10,.10]],female:[['timeLagModule',0,40,.10,.10]]},
  crowbar:{slot:'weapon',male:[['crowbar',-16,38,.24,.44]],female:[['crowbar',-16,36,.24,.44]]},
  knife:{slot:'weapon',male:[['knife',-15,42,.25,.24]],female:[['knife',-15,40,.25,.24]]},
  blade:{slot:'weapon',male:[['blade',-16,36,.25,.50]],female:[['blade',-16,34,.25,.50]]},
  eblade:{slot:'weapon',male:[['eblade',-16,34,.25,.42]],female:[['eblade',-16,32,.25,.42]]},
  lsChip:{slot:'implant',male:[['lsChip',0,14,.14,.14]],female:[['lsChip',0,14,.14,.14]]},
  neuralFilter:{slot:'implant',male:[['neuralFilter',0,14,.15,.15]],female:[['neuralFilter',0,14,.15,.15]]},
  neuralMesh:{slot:'implant',male:[['neuralMesh',0,16,.11,.10]],female:[['neuralMesh',0,16,.11,.10]]},
  critCore:{slot:'module',male:[['critCore',0,41,.10,.10]],female:[['critCore',0,40,.10,.10]]},
  boots:{slot:'feet',male:[['boots',0,4.5,.76,.76,'bottom']],female:[['boots',0,4.5,.76,.76,'bottom']]},
  magboots:{slot:'feet',male:[['magboots',-2.5,1.7,.52,.4,'bottom','left'],['magboots',2.5,1.7,.52,.4,'bottom','right']],female:[['magboots',-2.5,1.7,.52,.4,'bottom','left'],['magboots',2.5,1.7,.52,.4,'bottom','right']]},
  vest:{slot:'body',male:[['vest-male',0,13,.53,.53]],female:[['vest-female',0,15,.36,.36]]},
  power:{slot:'body',male:[['power',0,5.5,.50,.53]],female:[['power',0,6,.45,.50]]},
  warden:{slot:'body',male:[['warden',0,8,.49,.47]],female:[['warden',0,9,.43,.44]]},
  nanoSuit:{slot:'body',male:[['nanoSuit',0,8.5,.48,.46]],female:[['nanoSuit',0,9.5,.43,.44]]},
  exoShell:{slot:'body',male:[['exoShell',0,6,.51,.51]],female:[['exoShell',0,6.8,.46,.48]]},
  starShell:{slot:'body',male:[['starShell',0,14,.50,.38]],female:[['starShell',0,14,.45,.36]]},
  quantumVisor:{slot:'head',male:[['quantumVisor',0,-1.2,.18,.18]],female:[['quantumVisor',0,-1.2,.18,.18]]},
  riotShield:{slot:'offhand',male:[['riotShield',24,33,.26,.26]],female:[['riotShield',24,32,.26,.26]]},
  eshieldUnit:{slot:'offhand',male:[['eshieldUnit',24,32,.34,.36]],female:[['eshieldUnit',24,30,.34,.36]]},
  phaseShield:{slot:'offhand',male:[['phaseShield',24,30,.37,.43]],female:[['phaseShield',24,28,.37,.43]]},
  citadelShield:{slot:'offhand',male:[['citadelShield',23.5,23,.43,.53]],female:[['citadelShield',23.5,21,.43,.53]]},
  gravityBoots:{slot:'feet',male:[['gravityBoots',-6.5,3,.44,.34,'bottom','left'],['gravityBoots',6.5,3,.44,.34,'bottom','right']],female:[['gravityBoots',-6.5,3,.44,.34,'bottom','left'],['gravityBoots',6.5,3,.44,.34,'bottom','right']]},
  workGloves:{slot:'hands',coversHands:true,male:[['workGloves',-18,38.5,.30,.26,'top','left'],['workGloves',18,38.5,.30,.26,'top','right']],female:[['workGloves',-18,36.5,.30,.26,'top','left'],['workGloves',18,36.5,.30,.26,'top','right']]},
  servoGauntlet:{slot:'hands',coversHands:true,male:[['servoGauntlet',-14.8,30,.33,.32,'top','left'],['servoGauntlet',14.8,30,.33,.32,'top','right']],female:[['servoGauntlet',-14.8,28,.33,.32,'top','left'],['servoGauntlet',14.8,28,.33,.32,'top','right']]},
  nanoWeaveGloves:{slot:'hands',coversHands:true,male:[['nanoWeaveGloves',-17,40,.24,.21,'top','left'],['nanoWeaveGloves',17,40,.24,.21,'top','right']],female:[['nanoWeaveGloves',-17,38,.24,.21,'top','left'],['nanoWeaveGloves',17,38,.24,.21,'top','right']]},
  phaseGrip:{slot:'hands',male:[['phaseGrip',-18,35,.22,.20,'top','left'],['phaseGrip',18,35,.22,.20,'top','right']],female:[['phaseGrip',-18,33,.22,.20,'top','left'],['phaseGrip',18,33,.22,.20,'top','right']]},
  helmet:{slot:'head',male:[['helmet',0,-4,.25,.25]],female:[['helmet',0,-4,.25,.25]]},
  scope:{slot:'head',male:[['scope',0,-1,.18,.18]],female:[['scope',0,-1,.18,.18]]},
  fieldGreaves:{slot:'legs',male:[['fieldGreaves',-4,51.2,.32,.4,'top','left'],['fieldGreaves',6,51.2,.32,.4,'top','right']],female:[['fieldGreaves',-4,49.2,.32,.4,'top','left'],['fieldGreaves',6,49.2,.32,.4,'top','right']]},
  phaseGreaves:{slot:'legs',male:[['phaseGreaves',-5,39,.40,.62,'top','left'],['phaseGreaves',5,39,.40,.62,'top','right']],female:[['phaseGreaves',-5,37,.40,.62,'top','left'],['phaseGreaves',5,37,.40,.62,'top','right']]},
  miningHarness:{slot:'legs',male:[['miningHarness',-3.5,49,.40,.43,'top','left'],['miningHarness',3.5,49,.40,.43,'top','right']],female:[['miningHarness',-3.5,47,.40,.43,'top','left'],['miningHarness',3.5,47,.40,.43,'top','right']]},
  capacitorPack:{slot:'back',male:[['capacitorPack',0,6,.62,.48]],female:[['capacitorPack',0,5.5,.55,.47]]},
  gravRig:{slot:'back',male:[['gravRig',0,6,.67,.49]],female:[['gravRig',0,5.5,.60,.48]]},
};
for(const id of ['starterAssaultModule','starterSurveyModule',...[1,2,3,4,5].flatMap(stage=>['module_specialist_'+stage,'module_general_'+stage])]){
  WEARABLE_ART[id]={slot:'module',male:[['../equipment-art-v3/'+id,0,41,.11,.11]],female:[['../equipment-art-v3/'+id,0,40,.11,.11]]};
}
// Expanded equipment is fitted from measured alpha bounds. These are runtime
// transforms only: generated image pixels and transparent edges stay untouched.
const WEARABLE_V3_BOUNDS=[
  {
    "id": "blade_general_1",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.374,
      0.0052,
      0.2666,
      0.987
    ]
  },
  {
    "id": "blade_general_2",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.3955,
      0.0091,
      0.2227,
      0.9271
    ]
  },
  {
    "id": "blade_general_3",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.3896,
      0.0111,
      0.2354,
      0.946
    ]
  },
  {
    "id": "blade_general_4",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.3662,
      0.0052,
      0.2422,
      0.9863
    ]
  },
  {
    "id": "blade_general_5",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.3525,
      0.0046,
      0.2813,
      0.9642
    ]
  },
  {
    "id": "firearm_general_1",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0664,
      0.0124,
      0.7813,
      0.9707
    ]
  },
  {
    "id": "firearm_general_2",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.083,
      0.0208,
      0.8096,
      0.9473
    ]
  },
  {
    "id": "firearm_general_3",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.041,
      0.0169,
      0.8975,
      0.9486
    ]
  },
  {
    "id": "firearm_general_4",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0352,
      0.0052,
      0.8682,
      0.9805
    ]
  },
  {
    "id": "firearm_general_5",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0898,
      0.0241,
      0.7842,
      0.9401
    ]
  },
  {
    "id": "shield_specialist_3",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.2273,
      0.008,
      0.5455,
      0.9864
    ]
  },
  {
    "id": "shield_general_1",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0263,
      0.0247,
      0.9466,
      0.9418
    ]
  },
  {
    "id": "shield_general_2",
    "width": 1290,
    "height": 1219,
    "bounds": [
      0.0341,
      0.0131,
      0.9318,
      0.9557
    ]
  },
  {
    "id": "shield_general_3",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0391,
      0.0072,
      0.9219,
      0.9705
    ]
  },
  {
    "id": "shield_general_4",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0167,
      0.0072,
      0.9673,
      0.9737
    ]
  },
  {
    "id": "shield_general_5",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0096,
      0.0096,
      0.9785,
      0.9729
    ]
  },
  {
    "id": "head_specialist_4",
    "width": 1312,
    "height": 1199,
    "bounds": [
      0.0663,
      0.1243,
      0.8788,
      0.7189
    ]
  },
  {
    "id": "head_specialist_5",
    "width": 1310,
    "height": 1200,
    "bounds": [
      0.0443,
      0.1375,
      0.916,
      0.6558
    ]
  },
  {
    "id": "head_general_1",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0375,
      0.0136,
      0.9282,
      0.9553
    ]
  },
  {
    "id": "head_general_2",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.059,
      0.0096,
      0.882,
      0.9689
    ]
  },
  {
    "id": "head_general_3",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.075,
      0.0136,
      0.8509,
      0.9633
    ]
  },
  {
    "id": "head_general_4",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.1045,
      0.0136,
      0.7919,
      0.9665
    ]
  },
  {
    "id": "head_general_5",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0598,
      0.0136,
      0.8804,
      0.9689
    ]
  },
  {
    "id": "body_general_1",
    "width": 1199,
    "height": 1312,
    "bounds": [
      0.0942,
      0.013,
      0.8115,
      0.9649
    ]
  },
  {
    "id": "body_general_2",
    "width": 1199,
    "height": 1312,
    "bounds": [
      0.1418,
      0.0236,
      0.7173,
      0.9512
    ]
  },
  {
    "id": "body_general_3",
    "width": 1224,
    "height": 1285,
    "bounds": [
      0.0033,
      0.0093,
      0.9951,
      0.9767
    ]
  },
  {
    "id": "body_general_4",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0098,
      0.0111,
      0.9814,
      0.9766
    ]
  },
  {
    "id": "body_general_5",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0342,
      0.0423,
      0.9326,
      0.8971
    ]
  },
  {
    "id": "hands_specialist_5",
    "width": 1295,
    "height": 1214,
    "bounds": [
      0.1251,
      0.014,
      0.7444,
      0.9679
    ],
    "left": [
      0.1251,
      0.014,
      0.3266,
      0.9679
    ],
    "right": [
      0.5436,
      0.014,
      0.3259,
      0.9679
    ]
  },
  {
    "id": "hands_general_1",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0167,
      0.0734,
      0.9681,
      0.8533
    ],
    "left": [
      0.0167,
      0.0742,
      0.4665,
      0.8517
    ],
    "right": [
      0.5183,
      0.0734,
      0.4665,
      0.8533
    ]
  },
  {
    "id": "hands_general_2",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.008,
      0.0566,
      0.9841,
      0.8732
    ],
    "left": [
      0.008,
      0.0566,
      0.4721,
      0.8732
    ],
    "right": [
      0.5183,
      0.0566,
      0.4737,
      0.8724
    ]
  },
  {
    "id": "hands_general_3",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0032,
      0.0941,
      0.992,
      0.8022
    ],
    "left": [
      0.0032,
      0.0949,
      0.4625,
      0.8014
    ],
    "right": [
      0.5311,
      0.0941,
      0.4641,
      0.8022
    ]
  },
  {
    "id": "hands_general_4",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0128,
      0.059,
      0.9745,
      0.8772
    ],
    "left": [
      0.0128,
      0.059,
      0.4577,
      0.8772
    ],
    "right": [
      0.5303,
      0.059,
      0.4569,
      0.8772
    ]
  },
  {
    "id": "hands_general_5",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0112,
      0.0662,
      0.9777,
      0.8708
    ],
    "left": [
      0.0112,
      0.067,
      0.4673,
      0.87
    ],
    "right": [
      0.5215,
      0.0662,
      0.4673,
      0.8708
    ]
  },
  {
    "id": "legs_specialist_2",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.1006,
      0.0241,
      0.8008,
      0.9154
    ],
    "left": [
      0.1006,
      0.0241,
      0.3525,
      0.9154
    ],
    "right": [
      0.5479,
      0.0241,
      0.3535,
      0.9154
    ]
  },
  {
    "id": "legs_specialist_3",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0811,
      0.0039,
      0.8389,
      0.9844
    ],
    "left": [
      0.0811,
      0.0052,
      0.373,
      0.9831
    ],
    "right": [
      0.5459,
      0.0039,
      0.374,
      0.9844
    ]
  },
  {
    "id": "legs_specialist_5",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.1191,
      0.0163,
      0.7617,
      0.9395
    ],
    "left": [
      0.1191,
      0.0163,
      0.3516,
      0.9395
    ],
    "right": [
      0.5293,
      0.0163,
      0.3516,
      0.9395
    ]
  },
  {
    "id": "legs_general_1",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0918,
      0.0085,
      0.8174,
      0.9531
    ],
    "left": [
      0.0918,
      0.0085,
      0.3711,
      0.9531
    ],
    "right": [
      0.5361,
      0.0085,
      0.373,
      0.9531
    ]
  },
  {
    "id": "legs_general_2",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.123,
      0.0117,
      0.7549,
      0.9421
    ],
    "left": [
      0.123,
      0.0117,
      0.3555,
      0.9421
    ],
    "right": [
      0.5225,
      0.0117,
      0.3555,
      0.9421
    ]
  },
  {
    "id": "legs_general_3",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0947,
      0.0085,
      0.8115,
      0.9414
    ],
    "left": [
      0.0947,
      0.0085,
      0.3438,
      0.9408
    ],
    "right": [
      0.5625,
      0.0085,
      0.3438,
      0.9414
    ]
  },
  {
    "id": "legs_general_4",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.1123,
      0.0189,
      0.7764,
      0.9362
    ],
    "left": [
      0.1123,
      0.0195,
      0.3516,
      0.9355
    ],
    "right": [
      0.5371,
      0.0189,
      0.3516,
      0.9362
    ]
  },
  {
    "id": "legs_general_5",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.125,
      0.0072,
      0.752,
      0.9049
    ],
    "left": [
      0.125,
      0.0078,
      0.3379,
      0.9043
    ],
    "right": [
      0.5381,
      0.0072,
      0.3389,
      0.9043
    ]
  },
  {
    "id": "feet_specialist_4",
    "width": 1536,
    "height": 1024,
    "bounds": [
      0.125,
      0.0107,
      0.75,
      0.9385
    ],
    "left": [
      0.125,
      0.0107,
      0.3288,
      0.9385
    ],
    "right": [
      0.5462,
      0.0107,
      0.3288,
      0.9385
    ]
  },
  {
    "id": "feet_specialist_5",
    "width": 1536,
    "height": 1024,
    "bounds": [
      0.123,
      0.0273,
      0.7539,
      0.9082
    ],
    "left": [
      0.123,
      0.0273,
      0.3255,
      0.9082
    ],
    "right": [
      0.5508,
      0.0273,
      0.3262,
      0.9072
    ]
  },
  {
    "id": "feet_general_1",
    "width": 1536,
    "height": 1024,
    "bounds": [
      0.1335,
      0.0088,
      0.7337,
      0.9453
    ],
    "left": [
      0.1335,
      0.0088,
      0.3301,
      0.9453
    ],
    "right": [
      0.5378,
      0.0088,
      0.3294,
      0.9453
    ]
  },
  {
    "id": "feet_general_2",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.059,
      0.0311,
      0.8804,
      0.9107
    ],
    "left": [
      0.059,
      0.0311,
      0.3668,
      0.9107
    ],
    "right": [
      0.5702,
      0.0311,
      0.3692,
      0.9083
    ]
  },
  {
    "id": "feet_general_3",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0383,
      0.0502,
      0.9242,
      0.8772
    ],
    "left": [
      0.0383,
      0.051,
      0.3971,
      0.8764
    ],
    "right": [
      0.5662,
      0.0502,
      0.3963,
      0.8772
    ]
  },
  {
    "id": "feet_general_4",
    "width": 1536,
    "height": 1024,
    "bounds": [
      0.1608,
      0.0264,
      0.6712,
      0.9424
    ],
    "left": [
      0.1608,
      0.0264,
      0.2988,
      0.9424
    ],
    "right": [
      0.5352,
      0.0264,
      0.2969,
      0.9424
    ]
  },
  {
    "id": "feet_general_5",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0247,
      0.059,
      0.9506,
      0.8676
    ],
    "left": [
      0.0247,
      0.059,
      0.3971,
      0.8676
    ],
    "right": [
      0.5789,
      0.059,
      0.3963,
      0.8676
    ]
  },
  {
    "id": "back_specialist_1",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0694,
      0.0359,
      0.862,
      0.9266
    ]
  },
  {
    "id": "back_specialist_4",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.041,
      0.0755,
      0.918,
      0.849
    ]
  },
  {
    "id": "back_specialist_5",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0674,
      0.0697,
      0.8672,
      0.862
    ]
  },
  {
    "id": "back_general_1",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0574,
      0.0207,
      0.886,
      0.9545
    ]
  },
  {
    "id": "back_general_2",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0527,
      0.0514,
      0.8975,
      0.8568
    ]
  },
  {
    "id": "back_general_3",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0752,
      0.0189,
      0.8477,
      0.929
    ]
  },
  {
    "id": "back_general_4",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0371,
      0.0482,
      0.9277,
      0.7956
    ]
  },
  {
    "id": "back_general_5",
    "width": 1024,
    "height": 1536,
    "bounds": [
      0.0498,
      0.0703,
      0.9014,
      0.8392
    ]
  },
  {
    "id": "implant_specialist_1",
    "width": 1536,
    "height": 1024,
    "bounds": [
      0.0085,
      0.1182,
      0.9831,
      0.7637
    ]
  },
  {
    "id": "implant_specialist_3",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0048,
      0.0742,
      0.9896,
      0.8357
    ]
  },
  {
    "id": "implant_specialist_5",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0128,
      0.13,
      0.9753,
      0.6778
    ]
  },
  {
    "id": "implant_general_1",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0048,
      0.2002,
      0.9904,
      0.5742
    ]
  },
  {
    "id": "implant_general_2",
    "width": 1536,
    "height": 1024,
    "bounds": [
      0.0286,
      0.1396,
      0.9434,
      0.7109
    ]
  },
  {
    "id": "implant_general_3",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0056,
      0.1435,
      0.9896,
      0.6188
    ]
  },
  {
    "id": "implant_general_4",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0271,
      0.2018,
      0.9466,
      0.567
    ]
  },
  {
    "id": "implant_general_5",
    "width": 1254,
    "height": 1254,
    "bounds": [
      0.0024,
      0.0981,
      0.9952,
      0.7464
    ]
  }
];
function fitWearablePiece(file,art,bounds,target,half){
  const ratio=art.width/art.height,drawW=Math.min(1,1.5*ratio),drawH=Math.min(1,1/(1.5*ratio));
  const rawX=((1-drawW)/2+bounds[0]*drawW)*100,rawY=((1-drawH)/2+bounds[1]*drawH)*100;
  const sx=target[2]/(bounds[2]*drawW*100),sy=target[3]/(bounds[3]*drawH*100);
  return [file,target[0]-50-sx*(rawX-50),target[1]-sy*rawY,sx,sy,'top',half];
}
for(const art of WEARABLE_V3_BOUNDS){
  const family=art.id.split('_')[0],slot={blade:'weapon',firearm:'weapon',shield:'offhand'}[family]||family;
  const paired=['hands','legs','feet'].includes(slot),entry={slot};if(slot==='hands')entry.coversHands=true;if(slot==='feet')entry.coversFeet=true;
  for(const sex of ['male','female']){
    const female=sex==='female',stage=Number(art.id.split('_').at(-1)),file='../equipment-art-v3/'+art.id;
    let targets;
    if(slot==='hands'){const long=art.id==='hands_specialist_5';targets=[[22.5,female?(long?33:44.5):(long?35:46.5),8,long?25:12.5],[69.5,female?(long?33:44.5):(long?35:46.5),8,long?25:12.5]];}
    else if(slot==='legs')targets=[[33,female?50:52,13.5,female?36:37],[53,female?50:52,13.5,female?36:37]];
    else if(slot==='feet')targets=[art.left,art.right].map((bounds,i)=>{const h=18,w=h*1.5*(bounds[2]*art.width)/(bounds[3]*art.height);return [(i?64.5:35.5)-w/2,81,h*1.5*(bounds[2]*art.width)/(bounds[3]*art.height),h];});
    else if(slot==='body')targets=[female?[31,16,38,33]:[29,15,42,36]];
    else if(slot==='head')targets=[art.id.includes('specialist')?[39,7,22,8]:[39,female?1.5:1,22,14.5]];
    else if(slot==='back')targets=[female?[23,13,54,40]:[20,13,60,42]];
    else if(slot==='offhand')targets=[art.id.includes('specialist')?[68,female?25:27,30,43]:[69,female?35:37,26,17.4]];
    else if(slot==='implant')targets=[[43,female?16:17,14,5]];
    else if(family==='firearm')targets=[[25,female?39:41,17,20]];
    else targets=[[29,female?34:36,10,[0,27,35,40,38,44][stage]]];
    entry[sex]=targets.map((target,i)=>fitWearablePiece(file,art,paired?(i?art.right:art.left):art.bounds,target,paired?(i?'right':'left'):undefined));
  }
  WEARABLE_ART[art.id]=entry;
}
const WEARABLE_GUN_BOUNDS=[{"id":"pistol","width":1024,"height":1536,"bounds":[0.0635,0.0671,0.8955,0.7793]},{"id":"rifle","width":1024,"height":1536,"bounds":[0.2764,0.0072,0.583,0.9336]},{"id":"plasmaRifle","width":1024,"height":1536,"bounds":[0.251,0.013,0.4297,0.9538]},{"id":"gravLance","width":1024,"height":1536,"bounds":[0.3711,0.0078,0.2334,0.9583]},{"id":"swarmRifle","width":1024,"height":1536,"bounds":[0.2607,0.0182,0.501,0.9323]},{"id":"vacuumCarbine","width":1024,"height":1536,"bounds":[0.2832,0.0182,0.4541,0.9505]}];
for(const art of WEARABLE_GUN_BOUNDS){
  const pistol=art.id==='pistol',entry={slot:'weapon',carry:pistol?'holster':'sling'};
  for(const sex of ['male','female']){
    const h=pistol?23:art.id==='gravLance'?55:51,w=h*1.5*(art.bounds[2]*art.width)/(art.bounds[3]*art.height);
    entry[sex]=[fitWearablePiece(art.id,art,art.bounds,[pistol?28:40-w/2,sex==='female'?(pistol?40:16):(pistol?42:17),w,h])];
  }
  WEARABLE_ART[art.id]=entry;
}
const WEARABLE_LIFE_BOUNDS=[{"id":"life-salvager","width":1254,"height":1254,"bounds":[0.0893,0.0399,0.8214,0.9099]},{"id":"life-fabricator","width":1254,"height":1254,"bounds":[0.1116,0.0502,0.7759,0.8963]},{"id":"life-biologist","width":1254,"height":1254,"bounds":[0.2337,0.0199,0.5327,0.9195]}];
const wearableImageCache=new Map();
function loadWearableSource(src){
  if(!wearableImageCache.has(src)){const image=new Image();image.src=src;const ready=image.decode().catch(error=>{wearableImageCache.delete(src);throw error;});wearableImageCache.set(src,ready);}
  return wearableImageCache.get(src);
}
function legacyWearableSpecification(gender,equipment={},career,lifeCareers=[]){
  const sex=gender==='female'?'female':'male',layers=[{key:'base',src:WEARABLE_ROOT+'base-'+sex+'.webp',slot:'base',item:'base-'+sex}];
  // At runtime a glove replaces the bare-hand region, not the whole body. This
  // is part visibility in the rig; source images and their alpha stay untouched.
  const coversHands=WEARABLE_ART[equipment.hands]?.coversHands,coversFeet=WEARABLE_ART[equipment.feet]?.coversFeet,baseHem=coversFeet?(sex==='female'?87:88.5):100;
  if(coversHands){const wrist=sex==='female'?44:46;layers[0].clip='polygon(0 0,100% 0,100% '+wrist+'%,68% '+wrist+'%,68% 59%,100% 59%,100% '+baseHem+'%,0 '+baseHem+'%,0 59%,32% 59%,32% '+wrist+'%,0 '+wrist+'%)';}
  else if(coversFeet)layers[0].clip='inset(0 0 '+(100-baseHem)+'% 0)';
  const job={noviceGuard:'bulwark',noviceScout:'vanguard',noviceStriker:'infiltrator'}[career]||career;
  if(WEARABLE_UNIFORMS.includes(job)){
    const wrist=sex==='female'?44:46,hem=Math.min(sex==='female'?87:90,wearableFits[equipment.feet]?.baseCutY?.[sex]??100);
    // Only clothing is displayed from career artwork. The original face, bare
    // hands and shoes remain the same character; armor mounts above the uniform.
    layers.push({key:'uniform',src:WEARABLE_ROOT+'uniform-'+job+'-'+sex+'.webp',slot:'uniform',item:job,x:0,y:0,sx:1,sy:1,clip:'polygon(0 16%,100% 16%,100% '+wrist+'%,68% '+wrist+'%,68% 59%,100% 59%,100% '+hem+'%,0 '+hem+'%,0 59%,32% 59%,32% '+wrist+'%,0 '+wrist+'%)'});
  }
  for(const slot of WEARABLE_ORDER){
    const id=equipment[slot],art=WEARABLE_ART[id];if(!id||!art||art.slot!==slot)continue;
    const waistShift=!equipment.body&&WEARABLE_UNIFORMS.includes(job)&&(slot==='module'||slot==='weapon'&&art.carry!=='sling')?({bulwark:{male:-6,female:-8},vanguard:{male:-5,female:-5},infiltrator:{male:-4,female:-4}}[job][sex]):0;
    art[sex].forEach(([file,x,y,sx,sy,origin,half],i)=>layers.push({key:slot+'-'+i,src:WEARABLE_ROOT+file+'.webp',slot,item:id,x,y:y+waistShift,sx,sy,origin:origin==='bottom'?'50% 100%':'50% 0%',half}));
  }
  const lifeIds=new Set(lifeCareers.map(record=>{const id=typeof record==='string'?record:record.id;return {noviceCollector:'salvager',noviceApprentice:'fabricator',noviceGrower:'biologist'}[id]||id;}));
  WEARABLE_LIFE_BOUNDS.forEach((art,i)=>{const id=art.id.slice(5);if(!lifeIds.has(id))return;
    const h=5,w=h*1.5*(art.bounds[2]*art.width)/(art.bounds[3]*art.height),[file,x,y,sx,sy]=fitWearablePiece(art.id,art,art.bounds,[40+i*7-w/2,sex==='female'?22:21,w,h]);
    layers.push({key:art.id,src:WEARABLE_ROOT+file+'.webp',slot:'life',item:id,x,y,sx,sy});
  });
  return layers;
}
// Source coordinates are projected through object-fit:contain into the 2:3
// portrait plane. Rotation uses physical pixels (Y spans 1.5 times X), so a leg
// follows the hip/knee/ankle axis rather than rotating in a distorted square.
function wearableSourcePoint(art,point){
  const ratio=art.width/art.height,w=Math.min(1,1.5*ratio),h=Math.min(1,1/(1.5*ratio));
  return [((1-w)/2+point[0]*w)*100,((1-h)/2+point[1]*h)*100];
}
function wearableTransformPoint(spec,point){
  const p=wearableSourcePoint(spec.art,point),o=spec.pivotPoint,r=(spec.rotation||0)*Math.PI/180;
  if(spec.matrix){const [a,b,c,d]=spec.matrix;return [spec.x+a*p[0]+c*p[1]*1.5,spec.y+b*p[0]/1.5+d*p[1]];}
  const x=(p[0]-o[0])*spec.sx,y=(p[1]-o[1])*spec.sy*1.5;
  return [o[0]+spec.x+x*Math.cos(r)-y*Math.sin(r),o[1]+spec.y+(x*Math.sin(r)+y*Math.cos(r))/1.5];
}
function fittedWearableSpec(piece,slot,item,index){
  const b=piece.bounds,t=piece.target,p=piece.pivot||[.5,0],point=[b[0]+b[2]*p[0],b[1]+b[3]*p[1]];
  const top=wearableSourcePoint(piece,[b[0],b[1]]),bottom=wearableSourcePoint(piece,[b[0]+b[2],b[1]+b[3]]),pivot=wearableSourcePoint(piece,point),anchor=[t[0]+t[2]*p[0],t[1]+t[3]*p[1]];
  return {key:slot+'-'+index,src:WEARABLE_ROOT+piece.file+'.webp',slot,item,half:piece.half,clip:piece.clip,art:piece,handFx:piece.handFx,...(piece.fxAnchors?{fxAnchors:piece.fxAnchors}:{}),
    x:anchor[0]-pivot[0],y:anchor[1]-pivot[1],sx:t[2]/(bottom[0]-top[0]),sy:t[3]/(bottom[1]-top[1]),
    origin:pivot[0]+'% '+pivot[1]+'%',pivotPoint:pivot,rotation:piece.rotation||0,contact:{sourcePoint:point,anchor},fit:'calibrated'};
}
const WEARABLE_BODY_WRISTS={male:[[26.1,46],[73.9,46]],female:[[26.5,44],[73.5,44]]};
// V8 rotates the whole lower arm at the elbow, not the wrist in isolation.
// Clothing and armor use this same physical transform; face/body identity stays.
const WEARABLE_FOREARM_V8={male:{elbow:[30,32.5],rotation:-15,scale:.82},female:{elbow:[30.2,31],rotation:-15,scale:.84}};
function posedForearmPoint(sex,point){
  const {elbow,rotation,scale}=WEARABLE_FOREARM_V8[sex],r=rotation*Math.PI/180;
  const x=(point[0]-elbow[0])*scale,y=(point[1]-elbow[1])*1.5*scale;
  return [elbow[0]+x*Math.cos(r)-y*Math.sin(r),elbow[1]+(x*Math.sin(r)+y*Math.cos(r))/1.5];
}
function posedForearmSpec(spec,sex){
  const pose=WEARABLE_FOREARM_V8[sex],pivot=spec.pivotPoint||[50,0];
  const anchor=posedForearmPoint(sex,[pivot[0]+(spec.x||0),pivot[1]+(spec.y||0)]);
  const next={...spec,pivotPoint:pivot,origin:pivot[0]+'% '+pivot[1]+'%',x:anchor[0]-pivot[0],y:anchor[1]-pivot[1],sx:(spec.sx||1)*pose.scale,sy:(spec.sy||1)*pose.scale,rotation:(spec.rotation||0)+pose.rotation};
  for(const key of ['contact','triggerContact','gripContact'])if(spec[key])next[key]={...spec[key],anchor:posedForearmPoint(sex,spec[key].anchor)};
  return next;
}
function wearablePlaneClip(spec,points){
  const [ox,oy]=spec.pivotPoint,r=(spec.rotation||0)*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
  return 'polygon('+points.map(([px,py])=>{
    const x=px-ox-spec.x,y=(py-oy-spec.y)*1.5;
    return (ox+(x*c+y*s)/spec.sx)+'% '+(oy+(-x*s+y*c)/(spec.sy*1.5))+'%';
  }).join(',')+')';
}
function wearableCuffClip(spec,cutY){
  const [ox,oy]=spec.pivotPoint,r=(spec.rotation||0)*Math.PI/180;
  const y=([x,y])=>oy+spec.y+((x-ox)*spec.sx*Math.sin(r)+(y-oy)*spec.sy*1.5*Math.cos(r))/1.5;
  const left=spec.half==='right'?50:0,right=spec.half==='left'?50:100,points=[[left,0],[right,0],[right,100],[left,100]],result=[];
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],ya=y(a),yb=y(b),insideA=ya<=cutY,insideB=yb<=cutY;
    if(insideA)result.push(a);
    if(insideA!==insideB){const t=(cutY-ya)/(yb-ya);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
  }
  return 'polygon('+result.map(point=>point.map(n=>n+'%').join(' ')).join(',')+')';
}
function grippingHandSpec(sex,equipment,side,item){
  const kind=wearableGrips[item]?.kind,pose=side==='right'?'shield':['sidearm','longgun'].includes(kind)?'trigger':['bar','staff'].includes(kind)?'shaft':'sword';
  const catalog=pose==='trigger'?wearableTriggerHands:pose==='shield'?wearableHands:wearableSwordHands;
  const glove=equipment.hands&&equipment.hands!=='phaseGrip'?equipment.hands:'bare',art=catalog[glove]?.weapons?.[item]||catalog[glove];
  if(!art)throw new Error('Missing wearable hand pose: '+glove+'/'+pose);
  const part=art[side]||art,b=part.bounds;
  const bodyWrist=WEARABLE_BODY_WRISTS[sex][side==='left'?0:1],wrist=art.forearmPose==='v8'?posedForearmPoint(sex,bodyWrist):bodyWrist,factor=sex==='female'?.95:1,sexFit=art.fit?.[sex],w=sexFit?.size[0]??art.size[0]*factor,h=sexFit?.size[1]??art.size[1]*factor;
  const pivot=[(part.wrist[0]-b[0])/b[2],(part.wrist[1]-b[1])/b[3]],target=[wrist[0]-w*pivot[0],wrist[1]-h*pivot[1],w,h];
  const single=pose!=='shield',rotation=typeof sexFit?.rotation==='number'?sexFit.rotation:sexFit?.rotation[side]??(side==='left'?3:-3);
  const spec=fittedWearableSpec({...art,bounds:b,target,pivot,half:single?undefined:side,rotation},'grip',item,side);
  if(art.cutTop)spec.clip='inset('+wearableSourcePoint(art,[0,art.cutTop])[1]+'% 0 0 0)';
  if(art.wristCutContour){
    spec.clip='polygon('+art.wristCutContour.map(point=>wearableSourcePoint(art,point).map(n=>n+'%').join(' ')).join(',')+')';
  }else if(art.wristOverlap!==undefined){
    const y=wrist[1]-art.wristOverlap;
    // For an occupied grip retain the blade above the wrist. Only the forearm
    // stub meets the sleeve cut; this is not a mask through palm or fingers.
    const points=art.integratedWeapon?[[-100,-100],[wrist[0]-art.wristCutOffset,-100],[wrist[0]-art.wristCutOffset,y],[200,y],[200,150],[-100,150]]:[[-100,y],[200,y],[200,150],[-100,150]];
    spec.clip=wearablePlaneClip(spec,points);
  }
  spec.handleAxis=part.handleAxis||art.handleAxis;spec.indexRest=part.indexRest;
  spec.key='grip-'+side;spec.gripPoint=part.grip;spec.triggerPoint=part.trigger;spec.handItem=glove;spec.z=22;spec.pose=pose;spec.occupiedHilt=!!art.occupiedHilt;spec.integratedGrip=!!art.integratedWeapon;return spec;
}
function heldWearableSpec(art,slot,item,hand){
  if(hand.integratedGrip)return {...hand,key:slot+'-0',slot,fit:'authored-occupied-grip',
    gripContact:{sourcePoint:hand.gripPoint,anchor:wearableTransformPoint(hand,hand.gripPoint),kind:'grip',occluded:true,occlusion:'authored-in-sprite',anatomy:'palm-handle-fingers'}};
  const pivot=wearableSourcePoint(art,art.grip),top=wearableSourcePoint(art,[art.bounds[0],art.bounds[1]]),bottom=wearableSourcePoint(art,[art.bounds[0]+art.bounds[2],art.bounds[1]+art.bounds[3]]);
  const anchor=wearableTransformPoint(hand,hand.gripPoint);let scale=art.length/(bottom[1]-top[1]),rotation=art.rotation||0,triggerContact;
  if(hand.pose==='sword')rotation+=155;
  else if(hand.pose==='shaft')rotation=-17;
  const sourceIndex=hand.indexRest?art.indexRest:art.trigger,handIndex=hand.indexRest||hand.triggerPoint;
  if(sourceIndex&&handIndex){
    const source=wearableSourcePoint(art,sourceIndex),target=wearableTransformPoint(hand,handIndex),a=[source[0]-pivot[0],(source[1]-pivot[1])*1.5],b=[target[0]-anchor[0],(target[1]-anchor[1])*1.5];
    scale=Math.hypot(...b)/Math.hypot(...a);rotation=(Math.atan2(b[1],b[0])-Math.atan2(a[1],a[0]))*180/Math.PI;
    triggerContact={sourcePoint:sourceIndex,anchor:target,kind:'grip',occluded:true,occlusion:'front-fingers',anatomy:hand.indexRest?'index-outside-guard':'index-trigger'};
  }else if(art.handleAxis&&hand.handleAxis){
    const source=wearableSourcePoint(art,art.handleAxis),target=wearableTransformPoint(hand,hand.handleAxis),a=[source[0]-pivot[0],(source[1]-pivot[1])*1.5],b=[target[0]-anchor[0],(target[1]-anchor[1])*1.5];
    rotation=(Math.atan2(b[1],b[0])-Math.atan2(a[1],a[0]))*180/Math.PI;
  }
  return {key:slot+'-0',src:art.source,slot,item,art,x:anchor[0]-pivot[0],y:anchor[1]-pivot[1],sx:scale,sy:scale,origin:pivot[0]+'% '+pivot[1]+'%',pivotPoint:pivot,rotation,z:slot==='offhand'?24:21,fit:art.status,triggerContact,
    contact:{sourcePoint:art.grip,anchor,kind:'grip',occluded:true,occlusion:slot==='offhand'?'behind-shield':hand.occupiedHilt?'occupied-hilt':'front-fingers',anatomy:hand.occupiedHilt?'palm-handle-fingers':undefined}};
}
// V11: one elbow/wrist rig drives anatomy, sleeves and occupied hands together.
// Art keeps its native alpha. A part contour only hides a surplus grip or cuff.
function poseSourceClip(art,contour){
  const wrist=wearableSourcePoint(art,art.wrist),forearm=wearableSourcePoint(art,art.forearm);
  const axis=[wrist[0]-forearm[0],(wrist[1]-forearm[1])*1.5];
  const points=(contour||[[0,0],[1,0],[1,1],[0,1]]).map(p=>wearableSourcePoint(art,p)),kept=[];
  const distance=p=>(p[0]-wrist[0])*axis[0]+(p[1]-wrist[1])*1.5*axis[1]+Math.hypot(...axis)*1.5;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],da=distance(a),db=distance(b);
    if(da>=0)kept.push(a);
    if((da>=0)!==(db>=0)){const t=da/(da-db);kept.push(a.map((n,k)=>n+t*(b[k]-n)));}
  }
  return 'polygon('+kept.map(p=>p.map(n=>n+'%').join(' ')).join(',')+')';
}
function poseHandSpec(art,arm,sex,item,handItem,role){
  const w=wearableSourcePoint(art,art.wrist),f=wearableSourcePoint(art,art.forearm),g=wearableSourcePoint(art,art.grip);
  const scale=art.palmLength*(sex==='female'?.84:1)/Math.hypot(g[0]-w[0],(g[1]-w[1])*1.5);
  const rotation=(Math.atan2((arm.wrist[1]-arm.elbow[1])*1.5,arm.wrist[0]-arm.elbow[0])-Math.atan2((w[1]-f[1])*1.5,w[0]-f[0]))*180/Math.PI;
  const spec={key:'grip-'+arm.side,src:WEARABLE_ROOT+art.file+'.webp',slot:'grip',item,art,
    x:arm.wrist[0]-w[0],y:arm.wrist[1]-w[1],sx:scale,sy:scale,rotation,pivotPoint:w,origin:w[0]+'% '+w[1]+'%',
    handItem,handFx:art.handFx,pose:role,z:22,fit:'pose-v11',gripPoint:art.grip,handleAxis:art.axis,occupiedHilt:true,
    clip:poseSourceClip(art,art.contour),contact:{sourcePoint:art.wrist,anchor:arm.wrist,kind:'seam'}};
  return spec;
}
function poseWeaponSpec(art,item,rig,hand){
  const p=wearableSourcePoint(art,art.grip),anchor=wearableTransformPoint(hand,hand.gripPoint);
  const gun=['sidearm','longgun'].includes(rig.kind),horizontal=art.sourceView==='horizontal-right',mirror=gun&&!horizontal?-1:1;
  const length=({crowbar:40,knife:26,phaseBlade:37,blade:57,eblade:55,sever:58,plasmaSaber:57,voidBlade:61,
    blade_general_1:44,blade_general_2:54,blade_general_3:58,blade_general_4:54,blade_general_5:62,
    pistol:23,firearm_general_1:22,firearm_general_2:24,firearm_general_3:25,firearm_general_4:24,firearm_general_5:26,
    rifle:58,plasmaRifle:58,swarmRifle:60,vacuumCarbine:54,gravLance:70})[item];
  const extent=horizontal?art.bounds[2]*Math.min(1,1.5*art.width/art.height)*100:art.bounds[3]*Math.min(1,1/(1.5*art.width/art.height))*150;
  const scale=length/extent;
  let rotation;
  if(gun)rotation=hand.rotation-(horizontal?0:90);
  else{
    const axis=wearableSourcePoint(art,art.handleAxis),target=wearableTransformPoint(hand,hand.handleAxis);
    rotation=(Math.atan2((target[1]-anchor[1])*1.5,target[0]-anchor[0])-Math.atan2((axis[1]-p[1])*1.5,axis[0]-p[0]))*180/Math.PI;
  }
  const r=rotation*Math.PI/180,c=Math.cos(r)*scale,s=Math.sin(r)*scale,matrix=[c*mirror,s*mirror,-s,c];
  return {key:'weapon-0',src:art.source,slot:'weapon',item,art,matrix,
    x:anchor[0]-matrix[0]*p[0]-matrix[2]*p[1]*1.5,y:anchor[1]-matrix[1]*p[0]/1.5-matrix[3]*p[1],
    origin:'0 0',pivotPoint:[0,0],z:21,pose:rig.kind,fit:'pose-v11',
    contact:{sourcePoint:art.grip,anchor,kind:'grip',occluded:true,occlusion:'occupied-hilt',anatomy:'palm-handle-fingers'}};
}
function occupiedWeaponPose(sex,equipment){
  const item=equipment.weapon,rig=wearableWeaponPoses.weaponPoseRig(sex,item);if(!rig)return null;
  const glove=equipment.hands&&equipment.hands!=='phaseGrip'?equipment.hands:'bare',gun=['sidearm','longgun'].includes(rig.kind);
  const art=(gun?wearableWeaponArt.primary:wearableWeaponArt.low)[glove],support=wearableWeaponArt.support[glove];
  if(!art||(rig.twoHanded&&!support))throw new Error('Missing native weapon gesture: '+glove+'/'+rig.kind);
  const left=poseHandSpec(art,rig.arms.left,sex,item,glove,gun?'trigger':rig.kind),weapon=poseWeaponSpec(wearableGrips[item],item,rig,left),held={left},extra=[];
  if(rig.twoHanded){
    // Solve the support wrist from the item's real fore-end; the gun does not
    // stretch to reach the offhand, and the hand does not bend at its wrist.
    const point=wearableGrips[item].support||({rifle:[.472,.64],plasmaRifle:[.468,.65],swarmRifle:[.484,.66],vacuumCarbine:[.477,.59]})[item];
    const target=wearableTransformPoint(weapon,point),arm=rig.arms.right;
    const w=wearableSourcePoint(support,support.wrist),f=wearableSourcePoint(support,support.forearm),g=wearableSourcePoint(support,support.grip);
    const sf=support.palmLength*(sex==='female'?.84:1)/Math.hypot(g[0]-w[0],(g[1]-w[1])*1.5),d=[(g[0]-w[0])*sf,(g[1]-w[1])*1.5*sf];
    const u=[w[0]-f[0],(w[1]-f[1])*1.5],ul=Math.hypot(...u);u[0]/=ul;u[1]/=ul;
    const v=[target[0]-arm.elbow[0],(target[1]-arm.elbow[1])*1.5],parallel=u[0]*d[0]+u[1]*d[1],cross=u[0]*d[1]-u[1]*d[0];
    const length=Math.sqrt(Math.max(1,v[0]*v[0]+v[1]*v[1]-cross*cross))-parallel;
    const angle=Math.atan2(v[1],v[0])-Math.atan2(length*u[1]+d[1],length*u[0]+d[0]);
    arm.wrist=[target[0]-d[0]*Math.cos(angle)+d[1]*Math.sin(angle),target[1]-(d[0]*Math.sin(angle)+d[1]*Math.cos(angle))/1.5];
    arm.transform=wearableWeaponPoses.forearmTransform(sex,'right',arm.wrist);
    held.right=poseHandSpec(support,arm,sex,item,glove,'support');
    extra.push({...held.right,key:'grip-support-rear',z:20,contact:undefined,handFx:undefined,clip:poseSourceClip(support,support.rearContour)});
    held.right.clip=poseSourceClip(support,support.frontContour);held.right.gripContact={sourcePoint:support.grip,anchor:target,kind:'grip',occluded:true,occlusion:'front-fingers',anatomy:'support-foreend'};
  }
  return {rig,held,weapon,extra};
}
function armPoseLayer(spec,arm){
  const o=spec.pivotPoint||[50,0],r=(spec.rotation||0)*Math.PI/180,sx=spec.sx??1,sy=spec.sy??1;
  const a=spec.matrix||[Math.cos(r)*sx,Math.sin(r)*sx,-Math.sin(r)*sy,Math.cos(r)*sy];
  const t=spec.matrix?[spec.x,spec.y]:[o[0]+(spec.x||0)-a[0]*o[0]-a[2]*o[1]*1.5,o[1]+(spec.y||0)-a[1]*o[0]/1.5-a[3]*o[1]];
  const b=arm.transform.matrix,matrix=[b[0]*a[0]+b[2]*a[1],b[1]*a[0]+b[3]*a[1],b[0]*a[2]+b[2]*a[3],b[1]*a[2]+b[3]*a[3]];
  const at=wearableWeaponPoses.transformPosePoint(arm.transform,t);
  const next={...spec,matrix,x:at[0],y:at[1],origin:'0 0',pivotPoint:[0,0],fit:'pose-v11'};
  for(const key of ['contact','triggerContact','gripContact'])if(spec[key])next[key]={...spec[key],anchor:wearableWeaponPoses.transformPosePoint(arm.transform,spec[key].anchor)};
  return next;
}
/* Footwear v10: source artwork is never flattened or edited. Each boot has a
 * rear shell behind the leg and a front shell above it. These measured source
 * contours follow the front lip; the empty opening and heel tab stay behind
 * the actual trousers, including equipped leg armor and career uniforms.
 */
const WEARABLE_FOOTWEAR_CUFFS={
  boots:[[[0,522],[145,522],[157,526],[177,532],[199,532],[217,521],[256,521]],[[256,521],[295,521],[313,532],[335,532],[355,526],[367,522],[512,522]]],
  magboots:[[[0,365],[104,365],[113,384],[135,397],[163,403],[191,398],[210,382],[219,365],[256,365]],[[256,365],[293,365],[302,382],[321,398],[349,403],[377,397],[399,384],[408,365],[512,365]]],
  gravityBoots:[[[0,550],[198,550],[220,574],[258,594],[301,619],[340,644],[375,660],[397,638],[420,565],[512,565]],[[512,565.87],[594.64,565.87],[617.49,638.78],[639.34,660.75],[674.11,644.77],[712.84,619.8],[755.55,594.83],[793.3,574.86],[815.15,550.88],[1024,550.88]]],
  feet_general_1:[[[0,48],[114,48],[125,61],[140,72],[161,78],[182,72],[197,61],[207,48],[256,48]],[[256,48],[305,48],[315,61],[330,72],[351,78],[372,72],[387,61],[398,48],[512,48]]],
  feet_general_2:[[[0,57],[64,57],[81,69],[104,79],[129,84],[152,79],[174,67],[187,57],[256,57]],[[256,57],[325,57],[338,67],[360,79],[383,84],[408,79],[431,69],[448,57],[512,57]]],
  feet_general_3:[[[0,151],[186,151],[216,178],[242,191],[281,198],[330,201],[365,194],[400,178],[434,151],[627,151]],[[627,151.92],[819.22,151.92],[853.29,178.89],[888.36,194.88],[923.43,201.87],[972.53,198.88],[1011.61,191.88],[1037.66,178.89],[1067.72,151.92],[1254,151.92]]],
  feet_general_4:[[[0,72],[350,72],[388,102],[427,133],[467,160],[504,173],[543,167],[590,150],[625,115],[655,74],[768,74]],[[768,73.94],[866.69,73.94],[896.49,114.9],[931.26,149.86],[977.95,166.85],[1016.7,172.84],[1053.45,159.85],[1093.19,132.88],[1131.93,101.91],[1169.68,71.94],[1536,71.94]]],
  feet_general_5:[[[0,110],[181,110],[208,134],[250,146],[308,150],[365,174],[410,201],[446,184],[476,147],[627,147]],[[627,147],[775.21,147],[805.33,184],[841.47,201],[886.64,174],[943.87,150],[1002.09,146],[1044.26,134],[1071.36,110],[1254,110]]],
  feet_specialist_4:[[[0,162.41],[386.29,162.41],[406.9,175.7],[431.92,189.74],[464.3,197.12],[501.1,198.6],[538.63,194.91],[570.27,183.09],[597.5,161.67],[768.5,161.67]],[[768.5,161.67],[929.67,161.67],[956.97,183.09],[988.7,194.91],[1026.33,198.6],[1063.22,197.12],[1095.69,189.74],[1120.78,175.7],[1141.44,162.41],[1537,162.41]]],
  feet_specialist_5:[[[0,50],[324,50],[371,76],[418,95],[464,106],[516,99],[563,78],[610,48],[768.5,48]],[[768.5,48],[921.48,48],[968.76,78],[1016.04,99],[1068.34,106],[1114.62,95],[1161.89,76],[1209.17,50],[1537,50]]]
};
function wearableFootwearLayers(layers){
  const rear=[];
  for(const layer of layers){
    if(layer.slot!=='feet'||!WEARABLE_FOOTWEAR_CUFFS[layer.item])continue;
    const side=layer.half==='right'?1:0,art=layer.art;
    const ratio=art.width/art.height,w=Math.min(1,1.5*ratio),h=Math.min(1,1/(1.5*ratio));
    const project=([x,y])=>[((1-w)/2+x/art.width*w)*100,((1-h)/2+y/art.height*h)*100];
    const edge=WEARABLE_FOOTWEAR_CUFFS[layer.item][side];
    const points=[...edge,[side?art.width:art.width/2,art.height],[side?art.width/2:0,art.height]];
    rear.push({...layer,key:layer.key+'-rear',z:0,contact:undefined,fit:'rear-boot-shell'});
    layer.clip='polygon('+points.map(point=>project(point).map(n=>n+'%').join(' ')).join(',')+')';
    layer.z=5;layer.fit='front-boot-cuff';
    if(layer.contact)layer.contact={...layer.contact,occluded:true,occlusion:'trouser-between-boot-shells'};
  }
  return [...layers,...rear];
}
function fittedLegLayers(piece,id,index,joints,sex,foot){
  const b=piece.bounds,female=sex==='female',side=index?1:-1;
  const knee=joints.knee[index],top=joints.top[female?1:0],kneeY=female?68.8:70.4;
  let bottom=female?88.4:88.9,ankleX=50+side*14.2;
  if(foot){
    const edge=WEARABLE_FOOTWEAR_CUFFS[foot.item][index],lip=edge.reduce((deepest,point)=>point[1]>deepest[1]?point:deepest);
    const cuff=wearableTransformPoint(foot,[lip[0]/foot.art.width,lip[1]/foot.art.height]);
    bottom=Math.min(bottom,cuff[1]+.65);ankleX=cuff[0];
  }
  const sourceYs=[b[1],knee-.065,knee+.065,b[1]+b[3]];
  const targetXs=[50+side*9.5,50+side*11.8,50+side*12.5,ankleX];
  const width=joints.width[female?1:0],center=b[0]+b[2]/2;
  const srcWidth=wearableSourcePoint(piece,[b[0]+b[2],0])[0]-wearableSourcePoint(piece,[b[0],0])[0];
  const sx=width/srcWidth,parts=[];
  const kneeHalf=(wearableSourcePoint(piece,[center,sourceYs[2]])[1]-wearableSourcePoint(piece,[center,sourceYs[1]])[1])*sx/2;
  const targetYs=[top,kneeY-kneeHalf,kneeY+kneeHalf,bottom];
  for(let band=0;band<3;band++){
    const p=wearableSourcePoint(piece,[center,sourceYs[band]]),q=wearableSourcePoint(piece,[center,sourceYs[band+1]]);
    const sy=(targetYs[band+1]-targetYs[band])/(q[1]-p[1]);
    const shear=(targetXs[band+1]-targetXs[band])/((q[1]-p[1])*1.5);
    const spec={key:'legs-'+index+'-'+band,slot:'legs',item:id,src:WEARABLE_ROOT+piece.file+'.webp',art:piece,
      half:piece.half,x:targetXs[band]-sx*p[0]-shear*p[1]*1.5,y:targetYs[band]-sy*p[1],sx,sy,
      matrix:[sx,0,shear,sy],pivotPoint:[0,0],origin:'0 0',z:4,fit:'joint-fitted',
      contact:{sourcePoint:[center,sourceYs[band]],anchor:[targetXs[band],targetYs[band]]}};
    const x0=index?.5:0,x1=index?1:.5,y0=band?sourceYs[band]-.0005:0,y1=band===2?1:sourceYs[band+1]+.0005;
    const polygon=points=>'polygon('+points.map(point=>wearableSourcePoint(piece,point).map(n=>n+'%').join(' ')).join(',')+')';
    spec.clip=polygon([[x0,y0],[x1,y0],[x1,y1],[x0,y1]]);
    if(!band){
      parts.push({...spec,key:spec.key+'-rear',z:0,contact:undefined,fit:'rear-leg-rim'});
      // Front rim wraps around the trousers. The hollow rear lining remains
      // behind the original leg; the native sprite and alpha are unchanged.
      const lip=joints.rim?.[index]||[[0,0],[.2,.045],[.5,.055],[.8,.045],[1,0]];
      const edge=lip.map(([x,y])=>[b[0]+x*b[2],b[1]+y*b[3]]);
      spec.clip=polygon([[x0,edge[0][1]],...edge,[x1,edge.at(-1)[1]],[x1,y1],[x0,y1]]);
    }
    parts.push(spec);
  }
  return parts;
}
const WEARABLE_UNIFORM_HEMS={bulwark:[296,272],vanguard:[298,288],infiltrator:[307,294]};
function fittedTrouserLayers(art,id,sex,equipment,job){
  const female=sex==='female',point=([x,y])=>wearableSourcePoint(art,[x/art.width,y/art.height]);
  const knees=art.knees.map(point),sx=(female?24.4:25)/(knees[1][0]-knees[0][0]);
  const x=50-sx*(knees[0][0]+knees[1][0])/2,kneeY=female?68.8:70.4;
  const sourceYs=[art.waist[1],art.crotch[1],...art.kneeBand,(art.ankles[0][1]+art.ankles[1][1])/2].map(y=>point([0,y])[1]);
  const kneeCenter=(knees[0][1]+knees[1][1])/2;
  let waist=equipment.body?(female?40.8:43.8):(female?42:45.2);
  if(WEARABLE_UNIFORM_HEMS[job]){
    // Career shirts are tucked in at their authored waist, which is above the
    // untucked starter T-shirt hem. Match the actual FRONT rim, not image top.
    const front=point([art.waist[0],Math.max(...art.rim.map(p=>p[1]))])[1];
    const targetRim=WEARABLE_UNIFORM_HEMS[job][female?1:0]/768*100-.2,crotch=female?50.5:53.8;
    waist=crotch-(sourceYs[1]-sourceYs[0])*(crotch-targetRim)/(sourceYs[1]-front);
  }
  const targets=[waist,female?50.5:53.8,kneeY+(sourceYs[2]-kneeCenter)*sx,kneeY+(sourceYs[3]-kneeCenter)*sx,female?88.4:88.9];
  let hem=100,bootEdge;
  const shoes=wearableFits[equipment.feet]?.[sex],cuffs=WEARABLE_FOOTWEAR_CUFFS[equipment.feet];
  if(shoes&&cuffs){
    bootEdge=shoes.flatMap((shoe,i)=>{const foot=fittedWearableSpec(shoe,'feet',equipment.feet,i);
      return cuffs[i].map(([px,py])=>{const p=wearableTransformPoint(foot,[px/shoe.width,py/shoe.height]);return [p[0],p[1]+.35];});}).sort((a,b)=>a[0]-b[0]);
    hem=Math.max(...bootEdge.map(p=>p[1]));
  }
  const polygon=points=>'polygon('+points.map(p=>p.map(n=>n+'%').join(' ')).join(',')+')',layers=[];
  for(let band=0;band<4;band++){
    const sy=(targets[band+1]-targets[band])/(sourceYs[band+1]-sourceYs[band]),y=targets[band]-sourceYs[band]*sy;
    // The following band is painted on top. Extend only this band's bottom
    // underneath it: two independently antialiased clip edges otherwise leave
    // opaque cloth ~25% transparent at fractional CSS pixels. The bleed is in
    // portrait space, so a stretched career pelvis gets the same small cover;
    // source landmarks, rigid knees, the front/rear waistband and boot rim stay
    // unchanged. No extra source patch or visible duplicate strip is added.
    const top=band?sourceYs[band]-.015:0,bottom=band===3?Math.min(100,(hem-y)/sy):sourceYs[band+1]+.4/sy;
    const spec={key:'legs-trousers-'+band,slot:'legs',item:id,src:WEARABLE_ROOT+art.file+'.webp',art,x,y,sx,sy,
      origin:'0 0',pivotPoint:[0,0],matrix:[sx,0,0,sy],z:4,fit:'complete-trousers',
      contact:{sourcePoint:[art.waist[0]/art.width,(band?art.kneeBand[0]:art.waist[1])/art.height],anchor:[]}};
    spec.contact.anchor=wearableTransformPoint(spec,spec.contact.sourcePoint);
    spec.clip=polygon([[0,top],[100,top],[100,bottom],[0,bottom]]);
    if(band===3&&bootEdge){
      const edge=bootEdge.map(([px,py])=>[(px-x)/sx,(py-y)/sy]);
      spec.clip=polygon([[0,top],[100,top],[100,edge.at(-1)[1]],...edge.slice().reverse(),[0,edge[0][1]]]);
    }
    if(!band){
      const rim=art.rim.map(point),edge=[[0,rim[0][1]],...rim,[100,rim.at(-1)[1]]];
      layers.push({...spec,key:'legs-trousers-rear',z:0,contact:undefined,clip:polygon([[0,0],[100,0],...edge.slice().reverse()])});
      spec.clip=polygon([...edge,[100,bottom],[0,bottom]]);
    }
    layers.push(spec);
  }
  return layers;
}
function hideReplacedTrousers(layer,cut,keepFeet,sex){
  const original=layer.clip?.startsWith('polygon(')?layer.clip.slice(8,-1).split(',').map(p=>p.trim().split(/\s+/).map(parseFloat)):[[0,0],[100,0],[100,100],[0,100]];
  function crop(rect){
    let points=original;
    for(const [axis,edge,greater]of [[0,rect[0],true],[0,rect[2],false],[1,rect[1],true],[1,rect[3],false]]){
      const next=[];
      for(let i=0;i<points.length;i++){
        const a=points[i],b=points[(i+1)%points.length],ia=greater?a[axis]>=edge:a[axis]<=edge,ib=greater?b[axis]>=edge:b[axis]<=edge;
        if(ia)next.push(a);
        if(ia!==ib){const t=(edge-a[axis])/(b[axis]-a[axis]);next.push(a.map((v,k)=>v+t*(b[k]-v)));}
      }
      points=next;
    }
    return points;
  }
  const regions=[[0,0,100,cut],[0,cut,31.5,58],[68.5,cut,100,58]];
  if(keepFeet)regions.push([0,sex==='female'?88.4:88.9,100,100]);
  const parts=regions.map(crop).filter(p=>p.length>=3),points=[...parts[0],parts[0][0]];
  // Separate kept regions are joined by doubled, zero-area edges. This is one
  // CSS polygon; unlike a rectangular cutoff it retains hands and original feet.
  for(const part of parts.slice(1))points.push(...part,part[0],parts[0][0]);
  layer.clip='polygon('+points.map(p=>p.map(v=>v+'%').join(' ')).join(',')+')';
}
function wearableSpecification(gender,equipment={},career,lifeCareers=[]){
  equipment=Object.fromEntries(Object.entries(equipment).filter(([slot,id])=>WEARABLE_ART[id]?.slot===slot));
  const sex=gender==='female'?'female':'male',weaponPose=occupiedWeaponPose(sex,equipment);
  if(weaponPose?.rig.twoHanded)equipment={...equipment,offhand:undefined};
  const layers=legacyWearableSpecification(sex,equipment,career,lifeCareers),held={...weaponPose?.held};
  for(const [slot,side] of [['weapon','left'],['offhand','right']])if(!held[side]&&wearableGrips[equipment[slot]])held[side]=grippingHandSpec(sex,equipment,side,equipment[slot]);
  const gloves=wearableFits[equipment.hands]?.coversHands??WEARABLE_ART[equipment.hands]?.coversHands;
  const hem=wearableFits[equipment.feet]?.baseCutY?.[sex]??(WEARABLE_ART[equipment.feet]?.coversFeet?(sex==='female'?87:88.5):100);
  const left=gloves||held.left?WEARABLE_BODY_WRISTS[sex][0][1]:60,right=gloves||held.right?WEARABLE_BODY_WRISTS[sex][1][1]:60;
  layers[0].clip=(left<60||right<60||hem<100)?'polygon(0 0,100% 0,100% '+right+'%,67% '+right+'%,67% 60%,100% 60%,100% '+hem+'%,0 '+hem+'%,0 60%,33% 60%,33% '+left+'%,0 '+left+'%)':undefined;
  for(const slot of WEARABLE_ORDER){
    const id=equipment[slot],fit=wearableFits[id],grip=wearableGrips[id];if(!fit&&!grip)continue;
    for(let i=layers.length-1;i>=0;i--)if(layers[i].slot===slot)layers.splice(i,1);
    if(grip){layers.push(slot==='weapon'&&weaponPose?weaponPose.weapon:heldWearableSpec(grip,slot,id,held[slot==='weapon'?'left':'right']));continue;}
    if(slot==='legs'&&fit.trousers){layers.push(...fittedTrouserLayers(fit.trousers,id,sex,equipment,layers.find(s=>s.slot==='uniform')?.item));continue;}
    fit[sex].forEach((piece,index)=>{
      if(slot==='legs'&&fit.joints){
        const shoe=wearableFits[equipment.feet]?.[sex]?.[index],foot=shoe&&WEARABLE_FOOTWEAR_CUFFS[equipment.feet]?fittedWearableSpec(shoe,'feet',equipment.feet,index):null;
        layers.push(...fittedLegLayers(piece,id,index,fit.joints,sex,foot));return;
      }
      // On the gripping side the closed glove replaces the entire relaxed hand;
      // retaining both is what previously produced doubled fingers and cuffs.
      if(slot==='hands'&&fit.coversHands!==false&&held[piece.half]){
        if(held[piece.half].art.retainCuff){
          const cuff=fittedWearableSpec(piece,slot,id,index);cuff.key='cuff-'+piece.half;cuff.slot='cuff';cuff.z=held[piece.half].art.occupiedHilt?20:23;
          cuff.handFx=piece.cuffFx;
          cuff.clip=wearableCuffClip(cuff,WEARABLE_BODY_WRISTS[sex][piece.half==='left'?0:1][1]+.25);
          const arm=weaponPose?.rig.arms[piece.half];
          layers.push(arm?.occupied?armPoseLayer(cuff,arm):held[piece.half].art.forearmPose==='v8'?posedForearmSpec(cuff,sex):cuff);
        }
        return;
      }
      let spec=fittedWearableSpec(piece,slot,id,index);spec.pose=slot==='hands'?'relaxed':undefined;
      if(slot==='hands'&&weaponPose?.rig.arms[piece.half]?.occupied){spec=armPoseLayer(spec,weaponPose.rig.arms[piece.half]);spec.z=20;}
      else if(slot==='hands'&&piece.half==='left'&&held.left?.art.forearmPose==='v8')spec=posedForearmSpec(spec,sex);
      layers.push(spec);
    });
    if(fit.mount)layers.push({key:fit.mount,slot:'mount',item:fit.mount,mount:slot,x:slot==='module'?86:87,y:slot==='module'?25:36,z:27});
  }
  const torso=wearableFits[equipment.body];
  if(torso?.wornTorso){
    // The garment's native alpha contains the actual neck opening, shoulder
    // curves and hem. Preserve sleeves/trousers; never replace a rectangular ROI.
    // Original skin sits above career clothing but behind the armor's front rim.
    layers.push({key:'body-identity',slot:'anatomy',item:'base-head-'+sex,src:WEARABLE_ROOT+'base-'+sex+'.webp',x:0,y:0,sx:1,sy:1,z:3,clip:'inset(0 0 81.4% 0)'});
  }
  if(weaponPose){
    for(const layer of [...layers].filter(s=>['base','uniform'].includes(s.slot))){
      const spec={x:0,y:0,sx:1,sy:1,pivotPoint:[50,0],...layer};
      for(const side of ['left','right']){
        const arm=weaponPose.rig.arms[side];if(!arm.occupied)continue;
        const ey=arm.sourceElbow[1],wy=arm.sourceWrist[1];
        const points=[[0,ey-1.2],[31,ey-2.2],[35.5,ey-.5],[33,wy+.25],[0,wy+.25]].map(([x,y])=>[side==='right'?100-x:x,y]);
        layers.push(armPoseLayer({...spec,key:'forearm-'+side+'-'+layer.key,slot:'forearm',z:layer.slot==='uniform'?19:18,clip:wearablePlaneClip(spec,points)},arm));
        const elbow=arm.sourceElbow;
        const cap=Array.from({length:20},(_,i)=>[elbow[0]+4.2*Math.cos(i*Math.PI/10),elbow[1]+3.1*Math.sin(i*Math.PI/10)]);
        layers.push({...spec,key:'elbow-'+side+'-'+layer.key,slot:'forearm',z:layer.slot==='uniform'?18:17,clip:wearablePlaneClip(spec,cap)});
      }
      const top=layer.slot==='uniform'?16:0,lower=layer.slot==='base'?hem:Math.min(sex==='female'?87:90,hem),a=weaponPose.rig.arms;
      const lc=a.left.occupied?a.left.sourceElbow[1]+1.8:left,rc=a.right.occupied?a.right.sourceElbow[1]+1.8:layer.slot==='uniform'?WEARABLE_BODY_WRISTS[sex][1][1]:right;
      layer.clip=wearablePlaneClip(spec,[[0,top],[100,top],[100,rc],[a.right.occupied?65:67,rc],[67,60],[100,60],[100,lower],[0,lower],[0,60],[33,60],[a.left.occupied?35:33,lc],[0,lc]]);
    }
    layers.push(...weaponPose.extra);
  }else if(held.left?.art.forearmPose==='v8'){
    const elbowY=WEARABLE_FOREARM_V8[sex].elbow[1],wristY=WEARABLE_BODY_WRISTS[sex][0][1];
    for(const layer of [...layers].filter(s=>['base','uniform'].includes(s.slot)||(s.slot==='body'&&!torso?.wornTorso))){
      const spec={x:0,y:0,sx:1,sy:1,pivotPoint:[50,0],...layer};
      // Only actual sleeves follow the forearm. Worn torso sprites end above
      // the elbow: this broad plane must never cut/rotate their side waist plates.
      const arm={...spec,key:'forearm-'+layer.key,slot:'forearm',z:layer.slot==='body'?7:layer.slot==='uniform'?3:2,
        clip:wearablePlaneClip(spec,[[0,elbowY-.85],[35,elbowY-.85],[33,wristY+.2],[0,wristY+.2]])};
      layers.push(posedForearmSpec(arm,sex));
      const lower=layer.slot==='base'?hem:layer.slot==='uniform'?Math.min(sex==='female'?87:90,hem):100;
      const top=layer.slot==='uniform'?16:0;
      const oppositeCut=layer.slot==='uniform'?WEARABLE_BODY_WRISTS[sex][1][1]:right;
      layer.clip=wearablePlaneClip(spec,[[0,top],[100,top],[100,oppositeCut],[67,oppositeCut],[67,60],[100,60],[100,lower],[0,lower],[0,60],[33,60],[33,wristY+.2],[35,elbowY],[0,elbowY]]);
    }
  }
  layers.push(...Object.values(held).filter(hand=>!hand.integratedGrip));
  if(wearableFits[equipment.legs]?.trousers){
    const trousers=layers.find(s=>s.key==='legs-trousers-0'),art=trousers.art;
    const cut=Math.max(...art.rim.map(([x,y])=>wearableTransformPoint(trousers,[x/art.width,y/art.height])[1]))+.35;
    hideReplacedTrousers(layers[0],cut,!equipment.feet,sex);
    const uniform=layers.find(s=>s.slot==='uniform');
    if(uniform)hideReplacedTrousers(uniform,Math.min(cut,WEARABLE_UNIFORM_HEMS[uniform.item][sex==='female'?1:0]/768*100),false,sex);
  }
  return wearableFootwearLayers(layers);
}
function wearableFitAudit(gender,equipment={},career){
  const specs=wearableSpecification(gender,equipment,career),contacts=[];
  for(const spec of specs){
    if(!spec.contact||!WEARABLE_ART[spec.item])continue;
    for(const c of [spec.contact,spec.triggerContact,spec.gripContact].filter(Boolean)){
      const kind=c.kind||(['module','implant','back'].includes(spec.slot)?'socket':'seam');
      contacts.push({item:spec.item,kind,anchor:c.anchor,actual:wearableTransformPoint(spec,c.sourcePoint),sourcePoint:c.sourcePoint,layerKey:spec.key,tolerance:kind==='grip'?.35:1,occluded:c.occluded,occlusion:c.occlusion,anatomy:c.anatomy});
    }
  }
  return {contacts,visualFit:'requires-human-review'};
}
async function updateWearablePortrait(host,gender,equipment,career,lifeCareers=[]){
  const specs=wearableSpecification(gender,equipment,career,lifeCareers),keep=new Set(specs.map(s=>s.key));
  const version=(host._wearableVersion||0)+1;host._wearableVersion=version;
  // Decode before changing the mounted layer. Rapid choices cannot finish out of
  // order or leave the character blank while a new asset is still loading.
  await Promise.all(specs.filter(spec=>spec.src).map(spec=>loadWearableSource(spec.src)));
  if(host._wearableVersion!==version)return false;
  host.classList.add('wearable-portrait');host.dataset.gender=gender==='female'?'female':'male';
  host.setAttribute('role','img');host.setAttribute('aria-label',(gender==='female'?'女性':'男性')+'当前穿戴');
  for(const old of host.querySelectorAll('[data-wear-key]'))if(!keep.has(old.dataset.wearKey))old.remove();
  for(const spec of specs){
    let img=host.querySelector('[data-wear-key="'+spec.key+'"]');
    if(!img){img=document.createElement(spec.mount?'span':'img');img.dataset.wearKey=spec.key;img.alt='';img.draggable=false;host.appendChild(img);}
    if(spec.mount){img.className='wearable-dock';img.dataset.slot='mount';img.dataset.item=spec.item;img.dataset.mount=spec.mount;img.style.left=spec.x+'%';img.style.top=spec.y+'%';img.style.zIndex=spec.z;img.innerHTML='<i></i><b>'+ (spec.mount==='module'?'M':'N')+'</b>';continue;}
    if(img.getAttribute('src')!==spec.src)img.src=spec.src;
    img.dataset.slot=spec.slot;img.dataset.item=spec.item;img.dataset.pose=spec.pose||'';img.dataset.handItem=spec.handItem||'';img.dataset.integratedGrip=spec.integratedGrip?'true':'';img.dataset.occupiedHilt=spec.occupiedHilt?'true':'';img.style.zIndex=spec.z??({base:1,uniform:2,back:0,legs:4,feet:5,body:6,hands:9,weapon:21,offhand:24,grip:22,head:26,implant:28,module:28,life:30}[spec.slot]);
    img.style.transform=spec.slot==='base'?'none':spec.matrix?'translate('+spec.x+'%,'+spec.y+'%) matrix('+spec.matrix.join(',')+',0,0)':'translate('+spec.x+'%,'+spec.y+'%) rotate('+(spec.rotation||0)+'deg) scale('+spec.sx+','+spec.sy+')';
    img.style.transformOrigin=spec.origin||'50% 0%';
    img.style.clipPath=spec.clip||(spec.half==='left'?'inset(0 50% 0 0)':spec.half==='right'?'inset(0 0 0 50%)':'none');
  }
  const weapon=specs.find(spec=>spec.slot==='weapon');
  wearableWeaponEffects.update(host,weapon,host.querySelector('[data-wear-key="weapon-0"]'),point=>wearableSourcePoint(weapon.art,point));
  wearableHandEffects.update(host,specs,(spec,point)=>wearableSourcePoint(spec.art,point));
  if(typeof syncWardrobeEffects==='function')syncWardrobeEffects(host,{gender,equipment,career,specs});
  return true;
}
if(typeof module!=='undefined'&&module.exports)module.exports={WEARABLE_ROOT,WEARABLE_ORDER,WEARABLE_ART,WEARABLE_UNIFORMS,wearableSpecification,wearableFitAudit,wearableTransformPoint,fittedWearableSpec};
