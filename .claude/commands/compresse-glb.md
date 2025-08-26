---
description: 壓縮 glb 3D 模型
allowed-tools: gltf-pipeline
---


1. 確認目標檔案為 `.glb` 格式
2. 使用 `gltf-pipeline` 進行壓縮（啟用 Draco 壓縮）
3. 重新命名壓縮後的檔案
4. 清理原始未壓縮檔案

- 使用 `gltf-pipeline` 壓縮 `.glb` 檔案（Draco 壓縮）：
```bash
npx gltf-pipeline -i input.glb -o output-compressed.glb -d -b
```
