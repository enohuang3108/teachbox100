# 大富翁實體骰子

產生資產：

```sh
blender --background --factory-startup --threads 1 --python design/monopoly/create_dice.py
```

- `monopoly-dice.blend`：可編輯模型與剛體場景。
- `public/3d_model/monopoly-die.glb`：唯一的六面模型，對面合計為 7。
- `public/3d_model/monopoly-dice-motion.json`：60fps、兩條 Blender Bullet 剛體軌跡，包含位置及四元數。左骰向左、右骰向右落地翻滾。
- 遊戲隨機點數仍由原有規則產生。拋出前旋轉編號模型，使目標面對齊軌跡最後朝上的實體面；整段播放不改貼圖、不換面、不修改途中旋轉。
- 網頁以 Three.js 播放軌跡，動畫完成後才走棋或揭曉卡片結果。降低動態效果偏好直接顯示落定姿態；WebGL／資產載入失敗顯示對應骰面並繼續流程。

自動驗證：`pnpm test lib/monopoly`。實際物理與投影驗收範圍見 `docs/testing.md`。
