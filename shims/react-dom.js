// react-dom is not used in React Native — this shim prevents bundling errors
// from @clerk/clerk-react's useCustomElementPortal which is web-only
module.exports = {
  createPortal: (children) => children,
  flushSync: (fn) => fn(),
};
