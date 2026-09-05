# 未通过验收的提取实验

内置 imagegen 返回的六张图片没有 alpha 通道，棋盘格是实际图像内容。保留在研究目录中记录失败原因，不用于正式游戏。没有切换到 CLI/API 或外部抠图服务。

## male-boots

源图：`/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-0be6f50d-6af1-43a1-8b26-d36622fab2b9.png`

Use case: background-removal / precise asset extraction. EDIT TARGET: the provided full-body image. Produce a genuinely transparent PNG wearable overlay at EXACTLY 1024x1536, same canvas and absolutely same pixel coordinates as source. Keep ONLY the two equipped boots, precisely where they lie at x=25..75%, y=81..99%, preserving their separate left and right positions. Erase the entire rest of the image to alpha zero: all background, smoke, glow haze, all skin and the person, pants, arms, face, hair, shirt. This is NOT a new illustration: faithfully extract the existing equipment surface and its shape, no redraw or lighting change. Do not re-center, enlarge, rearrange, crop or add any object. No underlying torso or feet remaining inside equipment openings. Outside the actual equipment silhouette must be truly transparent with no dark rectangular gradient, no shadow. Most of the canvas (over 80%) will intentionally be empty transparent space. Output one full-canvas sparse layer ready to overlay at (0,0) on the unchanged source character.

## male-magboots

源图：`/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-5775c734-7391-4496-9a7a-027eb9441ada.png`

Use case: background-removal / precise asset extraction. EDIT TARGET: the provided full-body image. Produce a genuinely transparent PNG wearable overlay at EXACTLY 1024x1536, same canvas and absolutely same pixel coordinates as source. Keep ONLY the two equipped boots, precisely where they lie at x=25..75%, y=81..99%, preserving their separate left and right positions. Erase the entire rest of the image to alpha zero: all background, smoke, glow haze, all skin and the person, pants, arms, face, hair, shirt. This is NOT a new illustration: faithfully extract the existing equipment surface and its shape, no redraw or lighting change. Do not re-center, enlarge, rearrange, crop or add any object. No underlying torso or feet remaining inside equipment openings. Outside the actual equipment silhouette must be truly transparent with no dark rectangular gradient, no shadow. Most of the canvas (over 80%) will intentionally be empty transparent space. Output one full-canvas sparse layer ready to overlay at (0,0) on the unchanged source character.

## male-vest

源图：`/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-1f56ec7c-0eac-4070-99eb-b71f07fa80d1.png`

Use case: background-removal / precise asset extraction. EDIT TARGET: the provided full-body image. Produce a genuinely transparent PNG wearable overlay at EXACTLY 1024x1536, same canvas and absolutely same pixel coordinates as source. Keep ONLY the armored vest including straps, pouches, lights and side attachments, precisely where it lies on the chest at x=34..66%, y=16..39%. Erase the entire rest of the image to alpha zero: all background, smoke, glow haze, all skin and the person, pants, arms, face, hair, shirt. This is NOT a new illustration: faithfully extract the existing equipment surface and its shape, no redraw or lighting change. Do not re-center, enlarge, rearrange, crop or add any object. No underlying torso or feet remaining inside equipment openings. Outside the actual equipment silhouette must be truly transparent with no dark rectangular gradient, no shadow. Most of the canvas (over 80%) will intentionally be empty transparent space. Output one full-canvas sparse layer ready to overlay at (0,0) on the unchanged source character.

## female-boots

源图：`/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-a63352f4-9df0-48f2-953f-68d1e0ab47a4.png`

Use case: background-removal / precise asset extraction. EDIT TARGET: the provided full-body image. Produce a genuinely transparent PNG wearable overlay at EXACTLY 1024x1536, same canvas and absolutely same pixel coordinates as source. Keep ONLY the two equipped boots, precisely where they lie at x=25..75%, y=81..99%, preserving their separate left and right positions. Erase the entire rest of the image to alpha zero: all background, smoke, glow haze, all skin and the person, pants, arms, face, hair, shirt. This is NOT a new illustration: faithfully extract the existing equipment surface and its shape, no redraw or lighting change. Do not re-center, enlarge, rearrange, crop or add any object. No underlying torso or feet remaining inside equipment openings. Outside the actual equipment silhouette must be truly transparent with no dark rectangular gradient, no shadow. Most of the canvas (over 80%) will intentionally be empty transparent space. Output one full-canvas sparse layer ready to overlay at (0,0) on the unchanged source character.

## female-magboots

源图：`/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-9851704c-120d-488c-9b92-58568631de87.png`

Use case: background-removal / precise asset extraction. EDIT TARGET: the provided full-body image. Produce a genuinely transparent PNG wearable overlay at EXACTLY 1024x1536, same canvas and absolutely same pixel coordinates as source. Keep ONLY the two equipped boots, precisely where they lie at x=25..75%, y=81..99%, preserving their separate left and right positions. Erase the entire rest of the image to alpha zero: all background, smoke, glow haze, all skin and the person, pants, arms, face, hair, shirt. This is NOT a new illustration: faithfully extract the existing equipment surface and its shape, no redraw or lighting change. Do not re-center, enlarge, rearrange, crop or add any object. No underlying torso or feet remaining inside equipment openings. Outside the actual equipment silhouette must be truly transparent with no dark rectangular gradient, no shadow. Most of the canvas (over 80%) will intentionally be empty transparent space. Output one full-canvas sparse layer ready to overlay at (0,0) on the unchanged source character.

## female-vest

源图：`/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-c019fc55-2d6a-4d07-a482-fdba7b94865d.png`

Use case: background-removal / precise asset extraction. EDIT TARGET: the provided full-body image. Produce a genuinely transparent PNG wearable overlay at EXACTLY 1024x1536, same canvas and absolutely same pixel coordinates as source. Keep ONLY the armored vest including straps, pouches, lights and side attachments, precisely where it lies on the chest at x=34..66%, y=16..39%. Erase the entire rest of the image to alpha zero: all background, smoke, glow haze, all skin and the person, pants, arms, face, hair, shirt. This is NOT a new illustration: faithfully extract the existing equipment surface and its shape, no redraw or lighting change. Do not re-center, enlarge, rearrange, crop or add any object. No underlying torso or feet remaining inside equipment openings. Outside the actual equipment silhouette must be truly transparent with no dark rectangular gradient, no shadow. Most of the canvas (over 80%) will intentionally be empty transparent space. Output one full-canvas sparse layer ready to overlay at (0,0) on the unchanged source character.

## 第三轮去背景

Remove the background from this image. Keep the entire person, armor, clothing and exact pose completely unchanged at original position and dimensions. Output a transparent PNG: actual alpha channel outside the person, not an illustration of a checkerboard. No gray squares, no black fill, no halo, no backdrop. Full person unchanged.

结果：/Users/wangyao/.codex/generated_images/01a060f4-2883-7b60-a836-8ded4c8e4676/exec-e585f8d5-f4df-4699-9ff3-12072413ab5c.png

同样没有 alpha，未采用。

