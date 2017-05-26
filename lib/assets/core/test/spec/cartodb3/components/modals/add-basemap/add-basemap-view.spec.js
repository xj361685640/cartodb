var AddBasemapView = require('../../../../../../javascripts/cartodb3/components/modals/add-basemap/add-basemap-view');
var AddBasemapModel = require('../../../../../../javascripts/cartodb3/components/modals/add-basemap/add-basemap-model');
var BasemapsCollection = require('../../../../../../javascripts/cartodb3/editor/layers/basemap-content-views/basemaps-collection');
var CustomBaselayersCollection = require('../../../../../../javascripts/cartodb3/data/custom-baselayers-collection');
var ConfigModel = require('../../../../../../javascripts/cartodb3/data/config-model');
var UserModel = require('../../../../../../javascripts/cartodb3/data/user-model');
var LayerDefinitionsCollection = require('../../../../../../javascripts/cartodb3/data/layer-definitions-collection');
var AnalysisDefinitionNodesCollection = require('../../../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');
var ModalViewModel = require('../../../../../../javascripts/cartodb3/components/modals/modal-view-model');

describe('components/modals/add-basemap/add-basemap-view', () => {
  beforeEach(() => {
    this.createContentViewResult = {};
    this.createContentView = jest.createSpy('createContentView').and.returnValue(this.createContentViewResult);
    spyOn(ModalViewModel.prototype, 'destroy').and.callThrough();
    this.modalModel = new ModalViewModel({
      createContentView: this.createContentView
    });

    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    var userModel = new UserModel({}, {
      configModel: configModel
    });

    this.analysisDefinitionNodesCollection = new AnalysisDefinitionNodesCollection(null, {
      configModel: configModel,
      userModel: userModel
    });

    this.layerDefinitionsCollection = new LayerDefinitionsCollection(null, {
      configModel: configModel,
      userModel: userModel,
      analysisDefinitionNodesCollection: this.analysisDefinitionNodesCollection,
      mapId: 'm-123',
      stateDefinitionModel: {}
    });
    this.layerDefinitionsCollection.add({
      id: 'l-1',
      kind: 'carto',
      options: {
        table_name: 'foo',
        className: 'positron_rainbow',
        category: 'CARTO'
      }
    });

    this.customBaselayersCollection = new CustomBaselayersCollection([{
      id: 'basemap-id-1',
      options: {
        urlTemplate: '',
        category: 'Custom'
      }
    }], {
      configModel: configModel,
      currentUserId: 'current-user-id'
    });

    this.model = new AddBasemapModel({}, {
      layerDefinitionsCollection: this.layerDefinitionsCollection,
      basemapsCollection: new BasemapsCollection(),
      customBaselayersCollection: this.customBaselayersCollection
    });

    this.view = new AddBasemapView({
      modalModel: this.modalModel,
      layerDefinitionsCollection: this.layerDefinitionsCollection,
      createModel: this.model
    });

    this.view.render();
  });

  it('should render the tabs', () => {
    expect(this.innerHTML()).toContain('XYZ');
  });

  it('should start on XYZ view', () => {
    expect(this.innerHTML()).toContain('components.modals.add-basemap.xyz.insert');
  });

  it('should highlight the selected tab', () => {
    expect(this.view.$('.Modal-navigation .is-selected button').data('name')).toBe('xyz');
    expect(this.view.$('.Modal-navigation .is-selected button').data('name')).not.toBe('mapbox');
  });

  it('should not have any leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  describe('when clicking on a tab', () => {
    beforeEach(() => {
      this.view.$('button[data-name="mapbox"]').click();
    });

    it('should change tab', () => {
      expect(this.innerHTML()).toContain('components.modals.add-basemap.mapbox.insert');
    });

    it('should highlight new tab', () => {
      expect(this.view.$('.Modal-navigation .is-selected button').data('name')).toBe('mapbox');
      expect(this.view.$('.Modal-navigation .is-selected button').data('name')).not.toBe('xyz');
    });
  });

  describe('when click OK', () => {
    beforeEach(() => {
      spyOn(this.view._createModel, 'canSaveBasemap').and.returnValue(true);
      spyOn(this.view._createModel, 'saveBasemap');
      this.view.$('.js-ok').click();
    });

    it('should save new basemap', () => {
      expect(this.view._createModel.saveBasemap).toHaveBeenCalled();
    });

    describe('when save succeeds', () => {
      it('should close view', () => {
        this.view._createModel.trigger('saveBasemapDone');
        expect(ModalViewModel.prototype.destroy).toHaveBeenCalled();
      });
    });

    describe('when save fails', () => {
      beforeEach(() => {
        this.view._createModel.set('contentPane', 'addBasemapFailed');
      });

      it('should show an error explanation', () => {
        expect(this.innerHTML()).toContain('error');
      });
    });
  });

  afterEach(() => {
    this.view.clean();
  });
});
