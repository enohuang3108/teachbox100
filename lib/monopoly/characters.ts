// 大富翁玩家可選的角色（圖檔在 public/images/monopoly/character/<id>.webp）
// 由 scripts/convert_characters.py 從去背 PNG 轉成 256×256 透明 webp。

export interface CharacterDef {
  id: string; // slug，同時是檔名與儲存值
  label: string; // 中文顯示名
  src: string; // 圖檔路徑
}

const FILES: ReadonlyArray<[string, string]> = [
  ["capybara", "水豚"],
  ["quokka", "短尾矮袋鼠"],
  ["panda", "貓熊"],
  ["tiger", "老虎"],
  ["deer", "梅花鹿"],
  ["elephant", "大象"],
  ["sheep", "綿羊"],
  ["chow-chow", "鬆獅犬"],
  ["black-cat", "黑貓"],
  ["duck", "鴨子"],
  ["cockatiel", "玄鳳鸚鵡"],
  ["hedgehog", "刺蝟"],
  ["meerkat", "狐獴"],
  ["dinosaur", "恐龍"],
  ["penguin", "企鵝"],
  ["dolphin", "海豚"],
  ["whale-shark", "鯨鯊"],
  ["jellyfish", "水母"],
  ["pufferfish", "河豚"],
  ["blobfish", "水滴魚"],
];

export const CHARACTERS: CharacterDef[] = FILES.map(([id, label]) => ({
  id,
  label,
  src: `/images/monopoly/character/${id}.webp`,
}));

const BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]));

// 依索引取得預設角色（玩家數 ≤ 角色數時彼此不重複）
export function defaultCharacterId(index: number): string {
  return CHARACTERS[index % CHARACTERS.length].id;
}

// 由 id 取得角色定義，找不到時退回預設第一個，確保畫面永遠有圖
export function characterById(id: string | undefined): CharacterDef {
  return (id ? BY_ID.get(id) : undefined) ?? CHARACTERS[0];
}
