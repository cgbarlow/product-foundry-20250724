/**
 * Babel Configuration for Ravi's Adventure
 * Test Engineer: ES modules transformation for Jest compatibility
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'auto', // Let babel decide based on context (Jest will use CommonJS)
      },
    ],
  ],
  env: {
    test: {
      // Force CommonJS transformation for Jest
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
            modules: 'commonjs', // Explicitly use CommonJS for Jest
          },
        ],
      ],
    },
  },
};