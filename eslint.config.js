import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reacthooks from "eslint-plugin-react-hooks";

export default [
  {
    ...js.configs.recommended,
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
    },
    plugins: {
      react,
      typescript,
      reacthooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      "quotes": ["error", "double", { avoidEscape: true }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-multiple-empty-lines": ["error", {
        max: 1,
        maxEOF: 0,
        maxBOF: 0
      }],
      "indent": ["error", 2, { SwitchCase: 1 }],
    },
    ignores: [
      "public/**",
      "node_modules/**",
      ".next/**",
    ]
  }
];
