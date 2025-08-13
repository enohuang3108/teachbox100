---
description: 將 3D 模型轉換為 .glb 格式
allowed-tools: gltf-pipeline
---

1. 判斷目標模型的類型
2. 如果是 `.gltf` 格式，則直接使用 `gltf-pipeline` 進行轉換。
3. 如果是其他格式（如 `.obj`），則先使用 `obj2gltf` 轉換為 `.gltf`，然後再使用 `gltf-pipeline` 進行轉換。
4. 重新命名成乾淨的檔名
5. 清理原始檔案

- 將 `.gltf` 文件轉換為 `.glb` 格式：
```bash
npx gltf-pipeline -i input.gltf -o output.glb -b
```

- 將 `.obj` 文件轉換 `.glb` 格式：
```bash
npx obj2gltf -i model.obj -o model.gltf
npx gltf-pipeline -i model.gltf -o model.glb -b

```
