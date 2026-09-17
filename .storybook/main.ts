import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.tsx", "../.storybook/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/nextjs-vite", options: {} },
  // 硬幣圖、商品圖、封面都在 public 底下，元件用絕對路徑引用
  staticDirs: ["../public"],
  viteFinal: (config) => {
    // 元件帶著 Next 的 "use client"，Storybook 打包時不需要它。
    // 這個警告每個檔噴一次，會把真的錯誤蓋掉。
    config.build ??= {};
    config.build.rollupOptions ??= {};
    config.build.rollupOptions.onwarn = (warning, warn) => {
      if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
      warn(warning);
    };
    return config;
  },
};

export default config;
