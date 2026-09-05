# 换装对位样板 v1

2026-09-05。使用内置 imagegen 生成；不是库存图标贴图。保留生成原文件；本目录仅进行 512×768 WebP 尺寸优化。此目录为未通过验收的研究素材，不参与游戏打包。

状态：未通过透明层验收。男女固定母版与军用长靴、磁力靴、复合护甲的整身变体已生成，但变体有背景光晕；直接局部裁切会出现方块边缘。第二轮提取的 `*-layer.webp` 实际是 RGB 图片，棋盘格被画进像素，不是真正透明层，而且男胸甲发生位置偏移。第三轮背景去除同样没有得到 alpha，未纳入本目录。不能把这些资源标记为已支持换装。临时演示页已撤下，正式背包不接入这些未合格资产。

每件穿戴源图与同一性别母版保持像素坐标。渲染只显示本装备负责的部位；其他部位始终来自母版或其他装备，避免换鞋改变脸。下一步需要盾、头具、手套、腿甲、背具以及三条主职的默认服，并逐性别验收边界。

## 文件与源图

- `male-base.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-8b5a8c29-b2d4-496b-b367-7fca5edd8b41.png`
- `male-boots.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-0b49475d-2644-4360-9b4d-18e298179339.png`
- `male-magboots.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-5679b4ac-ca84-4e2e-897c-d0140fc87052.png`
- `male-vest.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-7b22033a-53e5-485a-a722-7505ae772da1.png`
- `female-base.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-dea2f257-7443-46a1-b9bc-8dfab86a2fad.png`
- `female-boots.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-5ed4d4d7-e94a-41a7-a8f3-99146f75ca21.png`
- `female-magboots.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-755568cd-7155-401f-86d1-9a71c978155d.png`
- `female-vest.webp` ← `/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-faed2ca0-67db-41d0-b0ff-c1ab599a6f5d.png`

## 最终提示词

[
  {
    "id": "male",
    "prompt": "Use case: stylized-concept. Asset type: fixed-pose full-body character master for a layered dark sci-fi RPG paper doll. A single adult male survivor, East Asian appearance, short dark hair, calm face, practical charcoal-grey long-sleeve crew uniform, plain slim dark trousers and simple thin dark ankle shoes. NO armor, NO weapons, NO backpack, NO cape, NO gloves, NO UI. Full body centered in portrait 2:3 canvas, orthographic straight frontal view, feet evenly spaced shoulder-width apart, both hands empty down and separated from thighs, arms slightly away from torso by 15 degrees. Entire head at y=6%, soles at y=94%, figure width about45% of canvas, face and body facing camera. Clear visible ankle and wrist seams for modular clothing replacement. Sophisticated semi-realistic painted game character, restrained cool rim lighting, believable textile and anatomy, fully clothed. Genuinely transparent background, no scenery or ground shadow. This is an immutable outfit rig: neutral symmetrical pose, not dynamic action. No text or watermark."
  },
  {
    "id": "female",
    "prompt": "Use case: stylized-concept. Asset type: fixed-pose full-body character master for a layered dark sci-fi RPG paper doll. A single adult female survivor, East Asian appearance, short dark hair, calm face, practical charcoal-grey long-sleeve crew uniform, plain slim dark trousers and simple thin dark ankle shoes. NO armor, NO weapons, NO backpack, NO cape, NO gloves, NO UI. Full body centered in portrait 2:3 canvas, orthographic straight frontal view, feet evenly spaced shoulder-width apart, both hands empty down and separated from thighs, arms slightly away from torso by 15 degrees. Entire head at y=6%, soles at y=94%, figure width about45% of canvas, face and body facing camera. Clear visible ankle and wrist seams for modular clothing replacement. Sophisticated semi-realistic painted game character, restrained cool rim lighting, believable textile and anatomy, fully clothed. Genuinely transparent background, no scenery or ground shadow. This is an immutable outfit rig: neutral symmetrical pose, not dynamic action. No text or watermark."
  }
]

### male / boots

Use case: precise-object-edit. Image 1 is the IMMUTABLE male character master. Image 2 is the equipment design reference. Change ONLY the footwear to wear the exact pair of tall military boots from image 2. Keep the character at exactly the SAME pixel scale, SAME location, SAME pose, SAME facial identity, SAME clothing everywhere else, SAME 1024x1536 canvas. No zoom/reframing. Match perspective so it is physically worn; both feet still touch the exact same ground line, boots overlap the trousers naturally. Preserve background transparency. No text, panels or duplicate limbs. Output the complete full body image so the modified region can be used as an aligned paper-doll layer.

### male / magboots

Use case: precise-object-edit. Image 1 is the IMMUTABLE male character master. Image 2 is the equipment design reference. Change ONLY the footwear to wear the exact pair of magnetic boots from image 2. Keep the character at exactly the SAME pixel scale, SAME location, SAME pose, SAME facial identity, SAME clothing everywhere else, SAME 1024x1536 canvas. No zoom/reframing. Match perspective so it is physically worn; both feet still touch the exact same ground line, boots overlap the trousers naturally. Preserve background transparency. No text, panels or duplicate limbs. Output the complete full body image so the modified region can be used as an aligned paper-doll layer.

### male / vest

Use case: precise-object-edit. Image 1 is the IMMUTABLE male character master. Image 2 is the equipment design reference. Change ONLY the chest clothing by wearing the exact tactical vest over the shirt. Keep the character at exactly the SAME pixel scale, SAME location, SAME pose, SAME facial identity, SAME clothing everywhere else, SAME 1024x1536 canvas. No zoom/reframing. Match perspective so it is physically worn; arm and waist alignment must match. Preserve background transparency. No text, panels or duplicate limbs. Output the complete full body image so the modified region can be used as an aligned paper-doll layer.

### female / boots

Use case: precise-object-edit. Image 1 is the IMMUTABLE female character master. Image 2 is the equipment design reference. Change ONLY the footwear to wear the exact pair of tall military boots from image 2. Keep the character at exactly the SAME pixel scale, SAME location, SAME pose, SAME facial identity, SAME clothing everywhere else, SAME 1024x1536 canvas. No zoom/reframing. Match perspective so it is physically worn; both feet still touch the exact same ground line, boots overlap the trousers naturally. Preserve background transparency. No text, panels or duplicate limbs. Output the complete full body image so the modified region can be used as an aligned paper-doll layer.

### female / magboots

Use case: precise-object-edit. Image 1 is the IMMUTABLE female character master. Image 2 is the equipment design reference. Change ONLY the footwear to wear the exact pair of magnetic boots from image 2. Keep the character at exactly the SAME pixel scale, SAME location, SAME pose, SAME facial identity, SAME clothing everywhere else, SAME 1024x1536 canvas. No zoom/reframing. Match perspective so it is physically worn; both feet still touch the exact same ground line, boots overlap the trousers naturally. Preserve background transparency. No text, panels or duplicate limbs. Output the complete full body image so the modified region can be used as an aligned paper-doll layer.

### female / vest

Use case: precise-object-edit. Image 1 is the IMMUTABLE female character master. Image 2 is the equipment design reference. Change ONLY the chest clothing by wearing the exact tactical vest over the shirt. Keep the character at exactly the SAME pixel scale, SAME location, SAME pose, SAME facial identity, SAME clothing everywhere else, SAME 1024x1536 canvas. No zoom/reframing. Match perspective so it is physically worn; arm and waist alignment must match. Preserve background transparency. No text, panels or duplicate limbs. Output the complete full body image so the modified region can be used as an aligned paper-doll layer.
