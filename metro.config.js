const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-dom is required by @clerk/clerk-react but unused at runtime in React Native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-dom': require.resolve('./shims/react-dom.js'),
};

module.exports = config;
