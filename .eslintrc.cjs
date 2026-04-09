module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react-hooks"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    env: {
        es2022: true,
        node: true,
        browser: true,
    },
    ignorePatterns: ["dist", "node_modules"],
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
    },
};
