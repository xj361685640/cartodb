var Backbone = require('backbone');
var AddLayerModel = require('../../../../../../javascripts/cartodb3/components/modals/add-layer/add-layer-model');
var TableModel = require('../../../../../../javascripts/cartodb3/data/table-model');
var UserModel = require('../../../../../../javascripts/cartodb3/data/user-model');
var ConfigModel = require('../../../../../../javascripts/cartodb3/data/config-model');
var sharedForCreateListingViewModel = require('./shared-for-create-listing-view-model.spec.js');
var sharedForCreateListingImportViewModel = require('./shared-for-import-view-model.spec.js');
var UserActions = require('../../../../../../javascripts/cartodb3/data/user-actions');

describe('components/modals/add-layer/add-layer-model', () => {
  beforeEach(() => {
    jest.Ajax.install();

    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    var vizUrl = 'http(s)?://(.)+' + configModel.get('base_url') + '/api/v1/viz.*';
    jest.Ajax.stubRequest(new RegExp(vizUrl)).andReturn({
      status: 200
    });

    this.pollingModel = new Backbone.Model();

    this.userModel = new UserModel({
      username: 'pepe'
    }, {
      configModel: configModel
    });

    this.userActions = UserActions({
      userModel: this.userModel,
      analysisDefinitionNodesCollection: {},
      analysisDefinitionsCollection: {},
      layerDefinitionsCollection: {},
      widgetDefinitionsCollection: {}
    });
    spyOn(this.userActions, 'createLayerFromTable');

    this.model = new AddLayerModel(null, {
      pollingModel: this.pollingModel,
      configModel: configModel,
      userModel: this.userModel,
      userActions: this.userActions
    });
  });

  afterEach(() => {
    jest.Ajax.uninstall();
  });

  sharedForCreateListingViewModel.call(this);
  sharedForCreateListingImportViewModel.call(this);

  it('should have listing as default content pane', () => {
    expect(this.model.get('contentPane')).toEqual('listing');
  });

  describe('.canFinish', () => {
    describe('when listing is import', () => {
      beforeEach(() => {
        spyOn(this.model._uploadModel, 'isValidToUpload');
        this.model.set('listing', 'import');
      });

      it('should return true only if upload is valid', () => {
        expect(this.model.canFinish()).toBeFalsy();

        this.model._uploadModel.isValidToUpload = () => { return true; };
        expect(this.model.canFinish()).toBeTruthy();
      });
    });

    describe('when listing is datasets', () => {
      beforeEach(() => {
        this.model.set('listing', 'datasets');
      });

      it('should return true if there is at least one dataset selected', () => {
        expect(this.model.canFinish()).toBeFalsy();

        this.model._selectedDatasetsCollection.add({});
        expect(this.model.canFinish()).toBeTruthy();
      });
    });
  });

  describe('.canSelect', () => {
    beforeEach(() => {
      this.dataset = new Backbone.Model({
        selected: false
      });
    });

    it('should return true only if there is dataset selected or if wanting to deselect', () => {
      expect(this.model.canSelect(this.dataset)).toBeTruthy();

      this.model._selectedDatasetsCollection.add({ selected: true });
      expect(this.model.canSelect(this.dataset)).toBeFalsy();

      this.dataset.set('selected', true);
      expect(this.model.canSelect(this.dataset)).toBeTruthy();
    });
  });

  describe('.finish', () => {
    describe('when an dataset is selected', () => {
      describe('when dataset is a remote one (from library)', () => {
        beforeEach(() => {
          this.pollingModel.bind('importByUploadData', function (data) {
            this.importByUploadData = data;
          }, this);

          this.model._tablesCollection.reset([{
            id: 'abc-123',
            type: 'remote',
            name: 'foobar',
            external_source: {
              size: 1024
            }
          }]);
          this.model._tablesCollection.at(0).set('selected', true);
          this.model.finish();
        });

        it('should trigger a importByUploadData event', () => {
          expect(this.importByUploadData).toBeTruthy();
        });

        it('should pass a metadata object with necessary data to import dataset', () => {
          expect(this.importByUploadData).toEqual(jest.objectContaining({ type: 'remote' }));
          expect(this.importByUploadData).toEqual(jest.objectContaining({ value: 'foobar' }));
          expect(this.importByUploadData).toEqual(jest.objectContaining({ remote_visualization_id: 'abc-123' }));
          expect(this.importByUploadData).toEqual(jest.objectContaining({ size: 1024 }));
          expect(this.importByUploadData).toEqual(jest.objectContaining({ create_vis: false }));
        });
      });

      describe('when dataset is not a remote one', () => {
        beforeEach(() => {
          this.model.bind('addLayerDone', () => {
            this.addLayerDoneCalled = true;
          }, this);

          this.model._tablesCollection.reset([{
            id: 'abc',
            type: 'table',
            name: 'paco',
            table: {
              name: 'tableName'
            }
          }]);
          this.model._tablesCollection.at(0).set('selected', true);
          this.model.finish();
        });

        it('should create layer from dataset', () => {
          expect(this.userActions.createLayerFromTable).toHaveBeenCalled();
        });

        it('should create layer with expected params', () => {
          var tableModel = this.userActions.createLayerFromTable.calls.argsFor(0)[0];
          expect(tableModel.get('name')).toBe('tableName');
        });

        it('should change the content view setting', () => {
          expect(this.model.get('contentPane')).toEqual('addingNewLayer');
        });

        describe('when adding layer succeeds', () => {
          beforeEach(() => {
            expect(this.addLayerDoneCalled).toBeFalsy();
            this.userActions.createLayerFromTable.calls.argsFor(0)[1].success();
          });

          it('should trigger addLayerDone', () => {
            expect(this.addLayerDoneCalled).toBeTruthy();
          });
        });

        describe('when adding layer fails', () => {
          beforeEach(() => {
            this.userActions.createLayerFromTable.calls.argsFor(0)[1].error();
          });

          it('should change contentPane to addLayerFail', () => {
            expect(this.model.get('contentPane')).toEqual('addLayerFailed');
          });
        });
      });
    });

    describe('.createFromScratch', () => {
      beforeEach(() => {
        spyOn(TableModel.prototype, 'save').and.callFake(() => {
          this.set('name', 'name-just-for-testing-purposes', { silent: true });
          return this;
        });
      });

      it('should change to loading state', () => {
        this.model.createFromScratch();
        expect(this.model.get('contentPane')).toEqual('creatingFromScratch');
      });

      it('should save a new dataset table', () => {
        this.model.createFromScratch();
        expect(TableModel.prototype.save).toHaveBeenCalled();
      });

      describe('when table is successfully created', () => {
        it('should add the table as new layer', () => {
          this.model.createFromScratch();
          TableModel.prototype.save.calls.argsFor(0)[1].success();

          expect(this.userActions.createLayerFromTable).toHaveBeenCalled();
          var tableModel = this.userActions.createLayerFromTable.calls.argsFor(0)[0];
          expect(tableModel.get('name')).toBe('name-just-for-testing-purposes');
        });
      });
    });

    describe('when an upload is set', () => {
      beforeEach(() => {
        this.pollingModel.bind('importByUploadData', function (d) {
          this.importByUploadData = d;
        }, this);
        this.model.set('listing', 'import');
        this.model.finish();
      });

      it('should call pollingModel importByUploadData with expected data', () => {
        expect(this.importByUploadData).toBeTruthy();
        expect(this.importByUploadData).toEqual(jest.objectContaining({ state: 'idle' }));
      });
    });
  });
});
