import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

/**
 * shadcn 的原生元件，**vendored**：維持上游長相，升級時 diff 才乾淨，
 * 所以它們不吃專案的 `pnpm lint:tokens`。它們的顏色靠 `--primary`、`--border`
 * 這些語意變數接到紙感色票，切暗色會一起變。
 */
const meta = {
  title: "Primitives/表單與容器",
  decorators: [(Story) => <div className="max-w-md space-y-4"><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 輸入: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">組別名稱</Label>
        <Input id="name" placeholder="第一組" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="disabled">停用</Label>
        <Input id="disabled" placeholder="不能改" disabled />
      </div>
    </div>
  ),
};

export const 開關與勾選: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    const [checked, setChecked] = useState(true);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch id="sound" checked={on} onCheckedChange={setOn} />
          <Label htmlFor="sound">音效</Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="ordered"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
          />
          <Label htmlFor="ordered">由小到大排列</Label>
        </div>
      </div>
    );
  },
};

export const 單選: Story = {
  render: () => (
    <RadioGroup defaultValue="digit" className="space-y-2">
      {[
        ["digit", "數字調整"],
        ["multiple", "選擇題"],
        ["keypad", "手動輸入"],
      ].map(([value, label]) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={`radio-${value}`} />
          <Label htmlFor={`radio-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};

export const 下拉: Story = {
  render: () => (
    <Select defaultValue="2">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["1", "2", "3"].map((n) => (
          <SelectItem key={n} value={n}>
            {n} 位數
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const 滑桿: Story = {
  render: () => {
    const [value, setValue] = useState([300]);
    return (
      <div className="space-y-2">
        <Slider value={value} onValueChange={setValue} min={10} max={2000} step={10} />
        <p className="text-caption text-muted-foreground">{value[0]} 元</p>
      </div>
    );
  },
};

export const 卡片與徽章: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          購物
          <Badge>1–2 年級</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-body">挑出剛好的硬幣付款，算出該找多少錢。</p>
        <Separator />
        <p className="text-caption text-muted-foreground">分隔線用 border token</p>
      </CardContent>
    </Card>
  ),
};

/** 題庫來源這種「每一頁有自己內容」的切換。只是單選、沒有對應內容的，用 radiogroup 長成同一副樣子（大富翁 SetupPanel 的 Segmented）。 */
export const 分頁: Story = {
  render: () => (
    <Tabs defaultValue="default">
      <TabsList>
        <TabsTrigger value="default">預設題庫</TabsTrigger>
        <TabsTrigger value="custom">自訂題庫</TabsTrigger>
      </TabsList>
      <TabsContent value="default">直接用內建的 30 題開始。</TabsContent>
      <TabsContent value="custom">匯入自己出的 Excel 題庫。</TabsContent>
    </Tabs>
  ),
};

/** 從按鈕旁邊彈出的小清單（計時器的預設時間）。全螢幕時自動掛進全螢幕元素，不會被擋在外面。 */
export const 彈出選單: Story = {
  render: () => {
    const [value, setValue] = useState("05:00");
    return (
      <Popover>
        <PopoverTrigger className="bg-card border-border size-16 rounded-full border text-sm font-bold tabular-nums">
          {value}
        </PopoverTrigger>
        <PopoverContent side="right" className="w-auto rounded-2xl p-1.5">
          {["01:00", "05:00", "10:00", "30:00"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue(t)}
              className="hover:bg-muted flex w-24 rounded-xl px-3 py-2 tabular-nums"
            >
              {t}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );
  },
};

/** 提示延遲 350ms 才出現；第一顆開了之後滑到隔壁 600ms 內不再等。 */
export const 提示: Story = {
  render: () => (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <div className="flex gap-2">
        {["設定", "音效", "全螢幕"].map((label) => (
          <Tooltip key={label}>
            <TooltipTrigger className="bg-card border-border rounded-full border px-4 py-2">
              {label}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};
