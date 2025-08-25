# UI 設計語言規範

## 整體設計風格

### 色彩系統
- **主色調**: primary/secondary 色彩系統
- **背景**: 
  - 主背景: `bg-gradient-to-br from-background via-muted/30 to-accent/20`
  - 卡片背景: `bg-card/80 backdrop-blur`
  - 區塊背景: `bg-muted/50`, `bg-muted/30`
- **邊框**: `border-border/50`, `border-primary/20`

### 間距系統
- **容器間距**: `gap-6`, `gap-8`
- **內容間距**: `space-y-4`, `space-y-6`
- **卡片內距**: `p-4`, `p-6`, `p-8`
- **響應式間距**: `sm:p-6 lg:p-8`

## 組件設計模式

### Badge 組件
```tsx
<Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2 text-primary border-primary/20 bg-primary/10">
  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
  內容文字
</Badge>
```

### Card 組件
```tsx
<Card className="transition-all duration-300 hover:scale-105 hover:shadow-xl">
  <CardHeader className="pb-3">
    <CardTitle className="text-xl">標題</CardTitle>
  </CardHeader>
  <CardContent className="flex flex-col items-center gap-3">
    內容區域
  </CardContent>
</Card>
```

### 光暈效果
```tsx
<div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
```

## 佈局系統

### 響應式網格
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

### Flexbox 佈局
```tsx
<div className="flex flex-col lg:flex-row">
  <div className="flex-1">左側內容</div>
  <div className="flex-1">右側內容</div>
</div>
```

## 互動效果

### Hover 效果
- 卡片縮放: `hover:scale-105`
- 陰影變化: `hover:shadow-xl`
- 背景變化: `hover:bg-muted/50`
- 光暈效果: `group-hover:opacity-100`

### 過渡動畫
- 通用過渡: `transition-all duration-300`
- 特定過渡: `transition-colors`, `transition-shadow`

## 狀態指示器

### 圓點指示器
```tsx
<span className="w-2 h-2 bg-primary rounded-full"></span>
<span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
```

### 狀態徽章
```tsx
<Badge variant="secondary" className="text-xs sm:text-sm">
  內容
</Badge>
```

## 文字系統

### 標題階層
- H1: `text-4xl md:text-6xl font-bold`
- H2: `text-xl sm:text-2xl`
- H3: `text-base sm:text-lg font-semibold`

### 描述文字
- 主描述: `text-xl md:text-2xl text-muted-foreground`
- 次要描述: `text-sm text-muted-foreground`

## 特殊組件模式

### 圓形標識
```tsx
<div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
  <span className="text-xs sm:text-sm font-bold text-primary">正</span>
</div>
```

### 分隔線使用
```tsx
<Separator className="mb-3 sm:mb-4" />
<Separator className="max-w-xs mx-auto" />
```

## 無障礙設計

### 螢幕閱讀器支援
```tsx
<DialogTitle className="sr-only">
  對話框標題
</DialogTitle>
```

### 語義化結構
- 使用適當的 HTML 語義標籤
- 提供必要的 aria 屬性
- 確保鍵盤導航支援

## 響應式設計原則

### 斷點系統
- sm: 640px+
- lg: 1024px+
- xl: 1280px+

### 文字響應式
```tsx
className="text-sm sm:text-base"
className="text-base sm:text-lg"
```

### 間距響應式
```tsx
className="gap-2 sm:gap-3"
className="p-3 sm:p-4"
```