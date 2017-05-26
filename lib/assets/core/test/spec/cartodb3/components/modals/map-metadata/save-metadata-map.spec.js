var VisDefinitionModel = require('../../../../../../javascripts/cartodb3/data/vis-definition-model');
var ConfigModel = require('../../../../../../javascripts/cartodb3/data/config-model');
var saveMetadataMap = require('../../../../../../javascripts/cartodb3/components/modals/map-metadata/save-metadata-map');

describe('components/modals/map-metadata/save-metadata-map', () => {
  var visDefinitionModel;
  var successSaveSpy;
  var errorSaveSpy;

  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    visDefinitionModel = new VisDefinitionModel({
      name: 'Foo Map',
      privacy: 'LINK',
      updated_at: '2016-06-21T15:30:06+00:00',
      type: 'derived',
      tags: ['foo', 'bar'],
      permission: {}
    }, {
      configModel: configModel
    });

    successSaveSpy = jest.createSpy('successSave');
    errorSaveSpy = jest.createSpy('erroSave');
    spyOn(visDefinitionModel, 'save');
  });

  it('should rename document title and the suffix should contain | CARTO', () => {
    saveMetadataMap({
      onSuccess: successSaveSpy,
      onError: errorSaveSpy,
      visDefinitionModel: visDefinitionModel,
      name: 'FOO',
      description: 'Wadus',
      tags: ['foo', 'bar']
    });

    expect(visDefinitionModel.save).toHaveBeenCalled();
    visDefinitionModel.save.calls.argsFor(0)[1].success();

    expect(successSaveSpy).toHaveBeenCalled();
    expect(document.title).not.toMatch(/CartoDB/);
    expect(document.title).toBe('FOO | CARTO');
  });
});
