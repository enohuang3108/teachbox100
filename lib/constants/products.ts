export interface Product {
  name: string;
  modelPath: string;
  priceRange: [number, number];
}

export const PRODUCTS: Product[] = [
  { name: "檸檬", modelPath: "/3d_model/lemon.glb", priceRange: [30, 40] },
  { name: "洋蔥", modelPath: "/3d_model/onion.glb", priceRange: [30, 40] },
  { name: "棒球", modelPath: "/3d_model/baseball.glb", priceRange: [80, 150] },
  { name: "蘋果", modelPath: "/3d_model/apple.glb", priceRange: [60, 100] },
  { name: "可頌", modelPath: "/3d_model/croissant.glb", priceRange: [35, 55] },
  { name: "清潔劑", modelPath: "/3d_model/cleaner.glb", priceRange: [90, 110] },
  { name: "遊戲手把", modelPath: "/3d_model/gamepad.glb", priceRange: [800, 1500] },
  { name: "園藝手套", modelPath: "/3d_model/gloves.glb", priceRange: [100, 250] },
  { name: "LED燈泡", modelPath: "/3d_model/lightbulb.glb", priceRange: [90, 160] },
  { name: "捲尺", modelPath: "/3d_model/measuring-tape.glb", priceRange: [150, 350] },
  { name: "咖啡", modelPath: "/3d_model/coffee.glb", priceRange: [100, 180] },
  { name: "巴斯光年", modelPath: "/3d_model/buzz.glb", priceRange: [500, 800] },
  { name: "衛生紙", modelPath: "/3d_model/toilet-paper.glb", priceRange: [20, 40] },
  { name: "洋芋片", modelPath: "/3d_model/chips.glb", priceRange: [30, 50] },
  { name: "礦泉水", modelPath: "/3d_model/bottle.glb", priceRange: [10, 25] },
  { name: "漢堡", modelPath: "/3d_model/hamburger.glb", priceRange: [90, 200] },
  { name: "可樂", modelPath: "/3d_model/cola.glb", priceRange: [25, 40] },
  { name: "泡麵", modelPath: "/3d_model/noodles.glb", priceRange: [40, 60] },
  { name: "排球", modelPath: "/3d_model/volleyball.glb", priceRange: [200, 500] },
  { name: "魔術方塊", modelPath: "/3d_model/magic-cube.glb", priceRange: [120, 250] },
];
