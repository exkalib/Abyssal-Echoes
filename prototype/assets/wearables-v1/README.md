# 固定姿势穿戴层 v1

2026-09-05，内置 imagegen 直接生成真实透明背景。未使用本地抠图、遮罩去背景或外部服务；仅做保持宽高比的 512px 宽 WebP 尺寸/格式转换，保留 alpha。旧装备独立制作穿戴图；v3 装备先制作可装配的正面实物原画，再用同一实物原画显示物品缩略图，并非把旧图标搬到人体上。

正式背包已切换此系统。`wardrobe.js` 覆盖全部 124 件装备的男女锚点、男女固定母版、三主职男女制服与三个可并存副职挂件。此目录 59 张，`equipment-art-v3` 77 张，合计 136 张实际透明资源。

## 生成与验收规范

- 提示词第一句明确 `Generate on a genuinely transparent background`；画“已穿戴视角的独立装备”，不先画整个人再提取部位。
- 输出必须有 RGBA/alpha，空白区域必须真实透明。RGB 棋盘格即失败，不进行 CSS 混合去背景掩盖。
- 人物身份、姿势和默认衣服来自固定男女母版。每件装备使用独立图像节点；换一件不替换母版或其他装备。
- 图层的缩放与身体锚点是运行时布局数据，不修改原画像素。男女分别验收肩、腰、腕、踝与遮挡余量。
- 文件存在/alpha/空白区域/加载测试后，仍需整身与实际游戏缩小尺寸人工审查。独立浏览器全目录、快速切换和正式背包实穿测试已通过。

## 当前验收与来源清单

- `GENERATIONS.json`：后续 40 件旧装备/制服生成与源文件；`FINAL-GENERATIONS.json`：6 把枪和 3 个副职挂件。首批母版/样板的来源记录见下文及该目录原有提示文件。
- `../equipment-art-v3/ALL-GENERATIONS.json`：77 件新装备最终选用原图；`SELECTED-ALPHA-BOUNDS.json`：最终透明边界测量值。重试前的边界数据仅为历史验收记录。
- `wardrobe.test.cjs` 验证所有装备必须有男女映射，不允许新增装备静默缺图；浏览器测试检查真实 alpha、完整挂载、节点保留和失败重试。

## 首批文件来源

| 文件 | 内置生成原图 |
| --- | --- |
| base-male.webp | exec-8b5a8c29-b2d4-496b-b367-7fca5edd8b41.png |
| base-female.webp | exec-dea2f257-7443-46a1-b9bc-8dfab86a2fad.png |
| boots.webp | exec-7163d178-82dd-4857-bae8-6cf55437ab40.png |
| magboots.webp | exec-885d0988-f5f8-4ab2-9ce7-82961545618e.png |
| vest-male.webp | exec-4657ff93-276a-47c7-9311-4f481472266a.png |
| vest-female.webp | exec-db307c65-9ba4-44eb-9536-aaf2e08cf580.png |
| riotShield.webp | exec-42f12e88-5039-4860-af33-671727b504c8.png |

原图目录：`/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/`。
男女母版提示词见 `docs/art-studies/wardrobe-v1/README.md`。

## 最终穿戴层提示词

### boots

Use case: stylized-concept. Create a new transparent PNG game wearable asset, not a background extraction. Image 1 is ONLY a pose/placement reference. Image 2 is ONLY a boot design reference. Draw ONLY two worn boots and their armored ankle cuffs, sized and angled to replace image 1's boots. Entire 1024x1536 canvas, boots at bottom y=80%-98%; left boot at x=27%-41%, right boot at x=59%-73%, toes splay outward like reference person. Make the boots slightly broader than the original shoes so the original shoes are completely covered when overlaid. Match black leather, dull bronze fastening straps, heavy sole and small cyan ankle lamps of reference 2. Realistic sci-fi painted game art with soft frontal neutral illumination, no floor shadow. CRITICAL DELIVERY: genuine PNG alpha transparency outside the two boot silhouettes. Empty transparent space, never draw a checkerboard, solid background, human, mannequin, legs, trousers, glow fog, ground, grid, labels or text. There must be NO person. Return a sparse transparent overlay with only the two boots. Do not crop, center or enlarge them to fill the canvas.

### magboots_v4

Generate on a genuinely transparent background. Transparent-background PNG game wearable: a left and right pair of the reference magnetic boots, viewed straight from the front as if worn on feet planted shoulder-width apart, toes slightly splayed outward. Two mirrored boots, not two same-side boots. Charcoal metal armor, cyan circular magnetic ankle actuators, amber toe strips. Portrait 1024x1536 canvas; boots alone occupy lower quarter, left at x=30%, right at x=70%. Realistic painted sci-fi game equipment. Only boots, no person or legs, no shadow or scenery. Preserve actual background transparency.

### male_vest_v4

Generate on a genuinely transparent background. Transparent-background PNG game wearable: one front-facing version of this tactical armored vest, fitted for an adult male torso. Square shoulders, front chest plate, side pouches and tiny cyan batteries, realistic dark charcoal ballistic textile. Perfectly frontal view, not inventory isometric perspective. Armholes and neck opening empty. Portrait 1024x1536 canvas, vest centered in upper half, top y=17%, bottom y=44%, width35%. Only vest, no body or mannequin, no person or sleeves, no shadow or scenery. Preserve actual background transparency.

### female_vest_v4

Generate on a genuinely transparent background. Transparent-background PNG game wearable: one front-facing version of this tactical armored vest, fitted for an adult female torso and natural tapered waist. Front chest plate, side pouches and tiny cyan batteries, realistic dark charcoal ballistic textile, practical protective fit. Perfectly frontal view, not inventory isometric perspective. Armholes and neck opening empty. Portrait 1024x1536 canvas, vest centered in upper half. Only vest, no body or mannequin, no person or sleeves, no shadow or scenery. Preserve actual background transparency.

### riotShield_wear_v1

Generate on a genuinely transparent background. Transparent-background PNG game wearable: one tall rectangular folding riot shield based on reference, seen from nearly straight front, tilted outward by 10 degrees as mounted on a standing character's left forearm lowered beside the left hip (viewer right). Dull worn gray steel, black rectangular frame, narrow viewing slit, amber caution stripe, visible hinged side wings. No hands or body, shield only. Realistic sci-fi painted equipment art, no floating icon perspective, neutral frontal lighting, no ground shadow or scenery. Portrait canvas with shield centered. Preserve actual background transparency.
