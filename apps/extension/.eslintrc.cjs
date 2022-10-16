const tsconfigNode = require("./tsconfig.node.json");

module.exports = {
  root: true,
  extends: ["custom"],
  ignorePatterns: ["dist"],
  overrides: [
    {
      files: tsconfigNode.include,
      parserOptions: {
        project: "./tsconfig.node.json",
      },
    },
  ],
};
