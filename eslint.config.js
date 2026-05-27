// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  {
    ignores: ["dist/**", ".expo/**", "node_modules/**"],
  },
  expoConfig,
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react/no-unescaped-entities": "off",
      "no-unused-expressions": "off"
    }
  }
]);
