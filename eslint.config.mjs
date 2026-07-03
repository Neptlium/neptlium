export default [
  {
    ignores: ["node_modules", "dist", ".next", "packages/*/dist"]
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-duplicate-imports": "error"
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {}
  }
];
