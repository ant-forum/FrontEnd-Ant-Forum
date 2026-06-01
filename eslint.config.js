import js from "@eslint/js";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "vite.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        document: "readonly",
        FormData: "readonly",
        localStorage: "readonly",
        process: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        window: "readonly",
      },
    },
  },
];
