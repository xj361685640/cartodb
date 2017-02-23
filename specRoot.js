var requireAll = function (requireContext) {
  requireContext.keys().map(requireContext);
};

// requireAll(require.context('lib/assets/test/spec/', true, /\.js$/));
requireAll(require.context('lib/assets/test/spec/cartodb3/', true, /[sS]pec\.js$/));
