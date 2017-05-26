var $ = require('jquery');
var MapboxView = require('../../../../../../../javascripts/cartodb3/components/modals/add-basemap/mapbox/mapbox-view');
var MapboxModel = require('../../../../../../../javascripts/cartodb3/components/modals/add-basemap/mapbox/mapbox-model');
var MapboxToTileLayerFactory = require('../../../../../../../javascripts/cartodb3/components/modals/add-basemap/mapbox/mapbox-to-tile-layer-factory');

describe('editor/components/modals/add-basemap/mapbox/mapbox-view', () => {
  beforeEach(() => {
    this.model = new MapboxModel();

    var submitButton = $('<button class="is-disabled">Submit</button>');
    var modalFooter = $('<div></div>');

    this.view = new MapboxView({
      model: this.model,
      submitButton: submitButton,
      modalFooter: modalFooter
    });
    this.view.render();
  });

  it('should render the inputs', () => {
    expect(this.view.$('input').length).toEqual(2);
  });

  describe('when click save', () => {
    beforeEach(() => {
      spyOn(MapboxToTileLayerFactory.prototype, 'createTileLayer');
      spyOn(this.model, 'validateInputs').and.callThrough();
      this.view.$('.js-url').val('mapbox/URL');
      this.view.$('.js-access-token').val('abc123');
      this.view._submitButton.click();
    });

    it('should call validateInputs on model with current values', () => {
      expect(this.model.validateInputs).toHaveBeenCalled();
      expect(this.model.validateInputs).toHaveBeenCalledWith('mapbox/URL', 'abc123');
    });

    it('should show the loading message', () => {
      expect(this.innerHTML()).toContain('components.modals.add-basemap.validating');
      expect(this.view.$('input').length).toEqual(0);
    });

    describe('when layer is created', () => {
      beforeEach(() => {
        this.saveBasemapSpy = jest.createSpy('saveBasemap');
        this.model.bind('saveBasemap', this.saveBasemapSpy);
        this.tileLayer = jest.createSpy('CustomBaselayerModel');
        MapboxToTileLayerFactory.prototype.createTileLayer.calls.argsFor(0)[0].success(this.tileLayer);
      });

      it('should set the layer on the model', () => {
        expect(this.model.get('layer')).toBe(this.tileLayer);
      });

      it('should trigger saveBasemap event', () => {
        expect(this.saveBasemapSpy).toHaveBeenCalled();
      });
    });

    describe('when layer fails to be created', () => {
      beforeEach(() => {
        MapboxToTileLayerFactory.prototype.createTileLayer.calls.argsFor(0)[0].error('something failed');
      });

      it('should show the start view again', () => {
        expect(this.view.$('input').length).toEqual(2);
      });
    });
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.clean();
  });
});
