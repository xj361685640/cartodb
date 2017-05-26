var AREA_OF_INFLUENCE_TYPES = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/area-of-influence-types');

describe('editor/layers/layer-content-views/analyses/analysis-form-models/area-of-influence-types', () => {
  AREA_OF_INFLUENCE_TYPES.forEach(function (d) {
    it('should have a type', () => {
      expect(d.type).toEqual(jest.any(String));
    });

    describe('area-of-influence type ' + d.type, () => {
      it('should have a label', () => {
        expect(d.label).toEqual(jest.any(String));
      });

      it('should have parametersDataFields defined with which schema props to use', () => {
        expect(d.parametersDataFields).toEqual(jest.any(String), 'on the format of "source,type,some_other,…"');
        expect(d.parametersDataFields).not.toContain(' ', 'the parametersDataFields must not contain any spaces');
      });

      it('should have a parse function', () => {
        expect(d.parse).toEqual(jest.any(Function));
        expect(d.parse.length).toEqual(1, 'should take one argument, which is the attrs from the analysis-definition-node-model');
      });

      it('should have a formatAttrs function', () => {
        expect(d.formatAttrs).toEqual(jest.any(Function));
        expect(d.formatAttrs.length).toEqual(1, 'should take one argument of the area-of-influence-form-model');
      });
    });
  });
});
