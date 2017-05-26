var Backbone = require('backbone');
var _ = require('underscore');
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var MapDefinitionModel = require('../../../../javascripts/cartodb3/data/map-definition-model');
var LayerDefinitionsCollection = require('../../../../javascripts/cartodb3/data/layer-definitions-collection');

describe('data/map-definition-model', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });
    this.layerDefinitionsCollection = new LayerDefinitionsCollection([
      {
        kind: 'tiled',
        options: {
          name: 'Positron',
          category: 'CartoDB',
          minZoom: 0,
          maxZoom: 40
        }
      }
    ], {
      configModel: {},
      userModel: {},
      analysisDefinitionNodesCollection: {},
      mapId: {},
      stateDefinitionModel: {}
    });

    spyOn(_, 'debounce').and.callFake(function (func) {
      return () => {
        func.apply(this, arguments);
      };
    });

    this.model = new MapDefinitionModel({
      id: 'm-123'
    }, {
      parse: true,
      userModel: new Backbone.Model(),
      vis: {
        map: new Backbone.Model()
      },
      configModel: configModel,
      layerDefinitionsCollection: this.layerDefinitionsCollection
    });
  });

  it('should have a url', () => {
    expect(this.model.url()).toEqual('/u/pepe/api/v2/maps/m-123');
  });

  it('should have a layerDefinitionsCollection', () => {
    expect(this.model._layerDefinitionsCollection).toBe(this.layerDefinitionsCollection);
  });

  describe('when the base layer is changed', () => {
    beforeEach(() => {
      spyOn(this.model, 'save');
    });

    it('should save maxZoom and minZoom', () => {
      this.layerDefinitionsCollection.trigger('baseLayerChanged');

      expect(this.model.save).toHaveBeenCalledWith(jest.objectContaining({
        minZoom: 0,
        maxZoom: 40
      }));
    });

    it('should save the provider', () => {
      this.layerDefinitionsCollection.trigger('baseLayerChanged');

      expect(this.model.save).toHaveBeenCalledWith(jest.objectContaining({
        provider: 'leaflet'
      }));
    });

    it('should save the provider', () => {
      this.layerDefinitionsCollection.reset({
        type: 'GMapsBase',
        baseType: 'roadmap',
        minZoom: 0,
        maxZoom: 40
      }, { parse: false });

      this.layerDefinitionsCollection.trigger('baseLayerChanged');

      expect(this.model.save).toHaveBeenCalledWith(jest.objectContaining({
        provider: 'googlemaps'
      }));
    });
  });
});
