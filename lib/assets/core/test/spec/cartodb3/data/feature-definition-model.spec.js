var _ = require('underscore');
var Backbone = require('backbone');
var LayerDefinitionsCollection = require('../../../../javascripts/cartodb3/data/layer-definitions-collection');
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var UserModel = require('../../../../javascripts/cartodb3/data/user-model');
var FeatureDefinitionModel = require('../../../../javascripts/cartodb3/data/feature-definition-model');
var AnalysisDefinitionNodesCollection = require('../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');

describe('data/feature-definition-model', () => {
  var userModel;
  var configModel;
  var layerDefinitionsCollection;
  var layerDefinitionModel;

  beforeEach(() => {
    spyOn(_, 'debounce').and.callFake(function (func) {
      return () => {
        func.apply(this, arguments);
      };
    });

    configModel = new ConfigModel({
      base_url: '/u/pepe'
    });
    userModel = new UserModel({}, {
      configModel: configModel
    });

    var analysisDefinitionNodesCollection = new AnalysisDefinitionNodesCollection(null, {
      configModel: configModel,
      userModel: userModel
    });

    layerDefinitionsCollection = new LayerDefinitionsCollection(null, {
      configModel: configModel,
      userModel: userModel,
      analysisDefinitionNodesCollection: analysisDefinitionNodesCollection,
      mapId: 'm-123',
      stateDefinitionModel: {}
    });
    layerDefinitionsCollection.add({
      id: 'l-1',
      kind: 'carto',
      options: {
        table_name: 'foo'
      }
    });
    layerDefinitionModel = layerDefinitionsCollection.at(0);
    layerDefinitionModel.getColumnNamesFromSchema = () => { return ['name', 'country', 'the_geom']; };

    this.feature = new FeatureDefinitionModel({
      cartodb_id: '12345',
      name: 'Madrid',
      country: 'Spain'
    }, {
      configModel: configModel,
      layerDefinitionModel: layerDefinitionModel,
      userModel: userModel
    });

    this.fakeQueryRowModel = jest.createSpyObj('fakeQueryRowModel', ['save', 'fetch', 'destroy']);
    spyOn(this.feature, '_getQueryRowModel').and.returnValue(this.fakeQueryRowModel);
  });

  it('should create _changesHistory at the beginning', () => {
    expect(this.feature._changesHistory).toEqual([]);
  });

  describe('change bind', () => {
    it('should set at the beginning if model is new', () => {
      spyOn(FeatureDefinitionModel.prototype, '_bindChangeEvent');
      var feature = new FeatureDefinitionModel({}, {
        configModel: configModel,
        layerDefinitionModel: layerDefinitionModel,
        userModel: userModel
      });
      expect(FeatureDefinitionModel.prototype._bindChangeEvent).toHaveBeenCalled();
      expect(feature.isNew()).toBeTruthy();
    });

    it('should not be set at the beginning if model is not new', () => {
      spyOn(FeatureDefinitionModel.prototype, '_bindChangeEvent');
      var feature = new FeatureDefinitionModel({
        cartodb_id: 1
      }, {
        configModel: configModel,
        layerDefinitionModel: layerDefinitionModel,
        userModel: userModel
      });
      expect(FeatureDefinitionModel.prototype._bindChangeEvent).not.toHaveBeenCalled();
      expect(feature.isNew()).toBeFalsy();
    });
  });

  describe('.fetch', () => {
    describe('on success', () => {
      beforeEach(() => {
        this.fakeQueryRowModel.fetch.and.callFake(function (options) {
          options && options.success(
            new Backbone.Model({
              cartodb_id: '3',
              the_geom: '{whatever}'
            })
          );
        });
      });

      it('should fetch from query row model', () => {
        this.feature.fetch();
        expect(this.fakeQueryRowModel.fetch).toHaveBeenCalled();
      });

      it('should unbind change binding', () => {
        spyOn(this.feature, '_unbindChangeEvent');
        this.feature.fetch();
        expect(this.feature._unbindChangeEvent).toHaveBeenCalled();
      });

      it('should set properties after fetch', () => {
        expect(this.feature.get('cartodb_id')).toBe('12345');
        this.feature.fetch();
        expect(this.feature.get('cartodb_id')).toBe('3');
      });

      it('should listen changes after fetching successfully', () => {
        spyOn(this.feature, '_onChange');
        this.feature.fetch();
        this.feature.set('cartodb_id', 'hello');
        expect(this.feature._onChange).toHaveBeenCalled();
      });

      it('should add to changesHistory all changed attributes after fetching', () => {
        this.feature.fetch();
        this.feature.set('cartodb_id', 'hey');
        expect(this.feature._changesHistory).toEqual(['cartodb_id']);
        this.feature.set('the_geom', '{}');
        expect(this.feature._changesHistory).toEqual(['cartodb_id', 'the_geom']);
        this.feature.set('name', 'Barcelona');
        expect(this.feature._changesHistory).toEqual(['cartodb_id', 'the_geom', 'name']);
        this.feature.set('cartodb_id', '1');
        expect(this.feature._changesHistory).toEqual(['cartodb_id', 'the_geom', 'name']);
      });
    });
  });

  describe('.hasBeenChangedAfterLastSaved', () => {
    beforeEach(() => {
      this.feature._changesHistory = ['the_geom', 'cartodb_id'];
    });

    it('should return if an attribute has been changed before last saved', () => {
      expect(this.feature.hasBeenChangedAfterLastSaved('the_geom')).toBeTruthy();
      expect(this.feature.hasBeenChangedAfterLastSaved('name')).toBeFalsy();
      expect(this.feature.hasBeenChangedAfterLastSaved('cartodb_id')).toBeTruthy();
    });
  });

  describe('._cleanChangesHistory', () => {
    beforeEach(() => {
      this.feature._changesHistory = ['the_geom', 'cartodb_id'];
    });

    it('should clean changesHistory', () => {
      expect(this.feature.hasBeenChangedAfterLastSaved('the_geom')).toBeTruthy();
      expect(this.feature.hasBeenChangedAfterLastSaved('cartodb_id')).toBeTruthy();
      this.feature._cleanChangesHistory();
      expect(this.feature.hasBeenChangedAfterLastSaved('the_geom')).toBeFalsy();
      expect(this.feature.hasBeenChangedAfterLastSaved('cartodb_id')).toBeFalsy();
      expect(this.feature._changesHistory).toEqual([]);
    });
  });

  describe('.save', () => {
    beforeEach(() => {
      this.feature._changesHistory = ['the_geom'];
    });

    it('should save the feature using the query row model', () => {
      this.feature.save();
      expect(this.fakeQueryRowModel.save).toHaveBeenCalled();
    });

    describe('when save succeeds', () => {
      beforeEach(() => {
        this.fakeQueryRowModel.save.and.callFake(function (attrs, options) {
          options && options.success(new Backbone.Model(attrs));
        });
      });

      it('should invoke the success callback', () => {
        var successCallback = jest.createSpy('successCallback');
        this.feature.save({
          success: successCallback
        });

        expect(successCallback).toHaveBeenCalled();
      });

      it('should clean changes history', () => {
        this.feature.save();
        expect(this.feature._changesHistory.length).toBe(0);
      });

      it('should trigger a save event', () => {
        var saveCallback = jest.createSpy('save');
        this.feature.on('save', saveCallback);

        this.feature.save();

        expect(saveCallback).toHaveBeenCalled();
      });

      it('should update the cartodb_id of the feature when creating a new row', () => {
        this.feature.set('cartodb_id', null);

        expect(this.feature.isNew()).toBeTruthy();

        this.fakeQueryRowModel.save.and.callFake(function (attrs, options) {
          attrs = _.extend({}, attrs, {
            cartodb_id: '56789'
          });
          options && options.success(new Backbone.Model(attrs));
        });

        this.feature.save();

        expect(this.fakeQueryRowModel.save.calls.mostRecent().args[0]).toEqual({
          name: 'Madrid',
          country: 'Spain'
        });
        expect(this.feature.get('cartodb_id')).toEqual('56789');
      });

      it('should NOT update the cartodb_id of the feature when updating an existing row', () => {
        expect(this.feature.get('cartodb_id')).toEqual('12345');

        // Row is updated and it returns a different cartodb_id. This will never happen
        // in The Real World, but it helps in this test
        this.fakeQueryRowModel.save.and.callFake(function (attrs, options) {
          attrs = _.extend({}, attrs, {
            cartodb_id: '56789'
          });
          options && options.success(new Backbone.Model(attrs));
        });

        this.feature.save();

        expect(this.fakeQueryRowModel.save.calls.mostRecent().args[0]).toEqual({
          name: 'Madrid',
          country: 'Spain'
        });
        expect(this.feature.get('cartodb_id')).toEqual('12345');
      });
    });

    describe('when save fails', () => {
      beforeEach(() => {
        this.fakeQueryRowModel.save.and.callFake(function (attrs, options) {
          options && options.error();
        });
      });

      it('should invoke the error callback', () => {
        var errorCallback = jest.createSpy('errorCallback');
        this.feature.save({
          error: errorCallback
        });

        expect(errorCallback).toHaveBeenCalled();
      });

      it('should not clean changes history', () => {
        this.feature.save();
        expect(this.feature._changesHistory.length).toBe(1);
      });
    });
  });

  describe('.destroy', () => {
    describe('when destroy succeeds', () => {
      beforeEach(() => {
        this.fakeQueryRowModel.destroy.and.callFake(function (options) {
          options && options.success();
        });
      });

      it('should invoke the success callback', () => {
        var successCallback = jest.createSpy('successCallback');

        this.feature.destroy({
          success: successCallback
        });

        expect(successCallback).toHaveBeenCalled();
      });

      it('should trigger an event', () => {
        var onRemoveCallback = jest.createSpy('onRemoveCallback');
        this.feature.on('remove', onRemoveCallback);

        this.feature.destroy();

        expect(onRemoveCallback).toHaveBeenCalled();
      });
    });

    describe('when destroy fails', () => {
      beforeEach(() => {
        this.fakeQueryRowModel.destroy.and.callFake(function (options) {
          options && options.error();
        });
      });

      it('should invoke the error callback', () => {
        var errorCallback = jest.createSpy('errorCallback');

        this.feature.destroy({
          error: errorCallback
        });

        expect(errorCallback).toHaveBeenCalled();
      });
    });
  });
});
