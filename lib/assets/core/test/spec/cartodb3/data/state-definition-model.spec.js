var StateDefinitionModel = require('../../../../javascripts/cartodb3/data/state-definition-model');

describe('data/state-definition-model', () => {
  beforeEach(() => {
    var anObject = { something: 'something' };
    var visDefinitionModel = {};

    this.model = new StateDefinitionModel({
      json: JSON.stringify(anObject)
    }, {
      visDefinitionModel: visDefinitionModel
    });
  });

  describe('.setBounds', () => {
    it(' should trigger event when called', () => {
      jest.clock().install();

      var expectedBounds = [808];
      var actualBounds;
      function onBoundsSet (bounds) {
        actualBounds = bounds;
      }
      this.model.on('boundsSet', onBoundsSet);

      this.model.setBounds(expectedBounds);

      jest.clock().tick(10);
      expect(actualBounds[0]).toBe(expectedBounds[0]);

      jest.clock().uninstall();
    });
  });
});
