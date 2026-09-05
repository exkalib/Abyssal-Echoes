/* Fixed-pose wardrobe rig. Every item has a fitted, true-alpha physical layer.
 * V3 inventory thumbnails show the same wearable object's canonical artwork. */
const WEARABLE_ROOT='assets/wearables-v1/';
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
function wearableSpecification(gender,equipment={},career,lifeCareers=[]){
  const sex=gender==='female'?'female':'male',layers=[{key:'base',src:WEARABLE_ROOT+'base-'+sex+'.webp',slot:'base',item:'base-'+sex}];
  // At runtime a glove replaces the bare-hand region, not the whole body. This
  // is part visibility in the rig; source images and their alpha stay untouched.
  const coversHands=WEARABLE_ART[equipment.hands]?.coversHands,coversFeet=WEARABLE_ART[equipment.feet]?.coversFeet,baseHem=coversFeet?(sex==='female'?87:88.5):100;
  if(coversHands){const wrist=sex==='female'?44:46;layers[0].clip='polygon(0 0,100% 0,100% '+wrist+'%,68% '+wrist+'%,68% 59%,100% 59%,100% '+baseHem+'%,0 '+baseHem+'%,0 59%,32% 59%,32% '+wrist+'%,0 '+wrist+'%)';}
  else if(coversFeet)layers[0].clip='inset(0 0 '+(100-baseHem)+'% 0)';
  const job={noviceGuard:'bulwark',noviceScout:'vanguard',noviceStriker:'infiltrator'}[career]||career;
  if(WEARABLE_UNIFORMS.includes(job)){
    const wrist=sex==='female'?44:46,hem=sex==='female'?87:90;
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
async function updateWearablePortrait(host,gender,equipment,career,lifeCareers=[]){
  const specs=wearableSpecification(gender,equipment,career,lifeCareers),keep=new Set(specs.map(s=>s.key));
  const version=(host._wearableVersion||0)+1;host._wearableVersion=version;
  // Decode before changing the mounted layer. Rapid choices cannot finish out of
  // order or leave the character blank while a new asset is still loading.
  await Promise.all(specs.map(spec=>loadWearableSource(spec.src)));
  if(host._wearableVersion!==version)return false;
  host.classList.add('wearable-portrait');host.dataset.gender=gender==='female'?'female':'male';
  host.setAttribute('role','img');host.setAttribute('aria-label',(gender==='female'?'女性':'男性')+'当前穿戴');
  for(const old of host.querySelectorAll('[data-wear-key]'))if(!keep.has(old.dataset.wearKey))old.remove();
  for(const spec of specs){
    let img=host.querySelector('[data-wear-key="'+spec.key+'"]');
    if(!img){img=document.createElement('img');img.dataset.wearKey=spec.key;img.alt='';img.draggable=false;host.appendChild(img);}
    if(img.getAttribute('src')!==spec.src)img.src=spec.src;
    img.dataset.slot=spec.slot;img.dataset.item=spec.item;img.style.zIndex=spec.slot==='base'?1:spec.slot==='uniform'?2:spec.slot==='back'?0:spec.slot==='life'?20:WEARABLE_ORDER.indexOf(spec.slot)+2;
    img.style.transform=spec.slot==='base'?'none':'translate('+spec.x+'%,'+spec.y+'%) scale('+spec.sx+','+spec.sy+')';
    img.style.transformOrigin=spec.origin||'50% 0%';
    img.style.clipPath=spec.clip||(spec.half==='left'?'inset(0 50% 0 0)':spec.half==='right'?'inset(0 0 0 50%)':'none');
  }
  return true;
}
if(typeof module!=='undefined'&&module.exports)module.exports={WEARABLE_ROOT,WEARABLE_ORDER,WEARABLE_ART,WEARABLE_UNIFORMS,wearableSpecification};
