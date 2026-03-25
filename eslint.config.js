import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import n from "eslint-plugin-n";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["node_modules/", "bun.lock", "dist/", "coverage/", "generated/", "prisma/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.bun,
        ...globals.node,
      },
    },
    plugins: {
      n,
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "no-console": "warn",
      "no-undef": "off",
      "prefer-const": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "n/no-deprecated-api": "warn",
      "n/no-missing-import": "off",
      "n/no-path-concat": "warn",
      "n/no-process-exit": "warn",
      "n/prefer-global/process": ["warn", "always"],
    },
  },
);
