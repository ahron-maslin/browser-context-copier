import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      globals: globals.vitest,
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.*"],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
