import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import liteslint from "eslint-plugin-lit";
import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**", "static/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  liteslint.configs["flat/recommended"],
  {
    files: ["src/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2020,
        project: "./tsconfig.json",
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url))
      }
    },
    plugins: {
      lit: liteslint
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "no-console": "warn"
    }
  }
]);