var en = require('../../../../locale/en.json');

describe('en.json', () => {
  describe('edit-feature', () => {
    it('assert that the texts are the expected ones', () => {
      var texts = en.editor['edit-feature'];
      expect(texts.disabled).toEqual('Feature editing is disabled in %{disabledLayerType}. To edit the data, export this layer and import it as a new layer.');
    });
  });
});
