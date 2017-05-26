var _ = require('underscore');
var Backbone = require('backbone');
var cdb = require('cartodb.js');
var ConfigModel = require('../../../../../../../javascripts/cartodb3/data/config-model');
var QuerySchemaModel = require('../../../../../../../javascripts/cartodb3/data/query-schema-model');
var QueryGeometryModel = require('../../../../../../../javascripts/cartodb3/data/query-geometry-model');
var SQLModel = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/data/data-sql-model');
var UserModel = require('../../../../../../../javascripts/cartodb3/data/user-model');
var VisDefinitionModel = require('../../../../../../../javascripts/cartodb3/data/vis-definition-model');
var Notifier = require('../../../../../../../javascripts/cartodb3/components/notifier/notifier.js');
var DataView = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/data/data-view');
var SQLNotifications = require('../../../../../../../javascripts/cartodb3/sql-notifications.js');
var UserNotifications = require('../../../../../../../javascripts/cartodb3/data/user-notifications');
var layerOnboardingKey = require('../../../../../../../javascripts/cartodb3/components/onboardings/layers/layer-onboarding-key');
var AnalysesService = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-service');

describe('editor/layers/layers-content-view/data/data-view', () => {
  var sqlExecuteBackup = cdb.SQL.prototype.execute;

  beforeEach(() => {
    jest.Ajax.install();

    this.sqlModel = new SQLModel({
      content: 'SELECT * FROM table'
    });

    cdb.SQL.prototype.execute = function (query, vars, params) {
      params.success();
    };

    this.configModel = new ConfigModel({
      sql_api_template: 'http://{user}.localhost.lan:8080',
      user_name: 'pepito',
      api_key: 'hello-apikey'
    });

    this.node = new Backbone.Model({
      type: 'source'
    });
    this.node.getDefaultQuery = () => {
      return 'SELECT * FROM table';
    };
    this.node.querySchemaModel = new QuerySchemaModel({
      query: 'SELECT * FROM table',
      status: 'fetched'
    }, {
      configModel: this.configModel
    });
    this.node.queryGeometryModel = new QueryGeometryModel({
      query: 'SELECT * FROM table',
      status: 'fetched',
      simple_geom: 'point'
    }, {
      configModel: this.configModel
    });
    this.stackLayoutModel = jest.createSpyObj('stackLayoutModel', ['goToStep']);

    this.layerDefinitionModel = new Backbone.Model({
      user_name: 'pepito'
    });
    this.layerDefinitionModel.getAnalysisDefinitionNodeModel = () => {
      return this.node;
    };
    this.layerDefinitionModel.getTableName = () => {
      return 'table';
    };
    this.layerDefinitionModel.canBeGeoreferenced = () => { return false; };
    this.layerDefinitionModel.toggleVisible = () => { return; };

    this.userModel = new UserModel({
      username: 'pepe'
    }, {
      configModel: this.configModel
    });

    this.layerDefinitionModel.sqlModel = this.sqlModel;

    this.editorModel = new Backbone.Model();
    this.editorModel.isEditing = () => { return false; };
    this.userActions = jest.createSpyObj('userActions', ['saveAnalysisSourceQuery', 'saveLayer']);

    this.visDefinitionModel = new VisDefinitionModel({
      name: 'Foo Map',
      privacy: 'PUBLIC',
      updated_at: '2016-06-21T15:30:06+00:00',
      type: 'derived'
    }, {
      configModel: this.configModel
    });

    Notifier.init({
      editorModel: this.editorModel,
      visDefinitionModel: this.visDefinitionModel
    });

    spyOn(SQLNotifications, 'showErrorNotification');
    spyOn(SQLNotifications, 'removeNotification');
    spyOn(SQLNotifications, '_addOrUpdateNotification');

    var onboardingNotification = new UserNotifications({}, {
      key: 'builder',
      configModel: this.configModel
    });

    this.view = new DataView({
      layerDefinitionModel: this.layerDefinitionModel,
      stackLayoutModel: this.stackLayoutModel,
      widgetDefinitionsCollection: new Backbone.Collection(),
      editorModel: this.editorModel,
      userModel: this.userModel,
      userActions: this.userActions,
      configModel: this.configModel,
      onboardings: {},
      onboardingNotification: onboardingNotification
    });
    spyOn(this.view._onboardingLauncher, 'launch');

    this.view._widgetDefinitionsCollection.isThereTimeSeries = () => {
      return false;
    };
    spyOn(this.view, 'clean');
    this.view.render();
  });

  afterEach(() => {
    cdb.SQL.prototype.execute = sqlExecuteBackup;
    jest.Ajax.uninstall();
  });

  it('should render properly', () => {
    expect(_.size(this.view._subviews)).toBe(1);
  });

  it('should create internal codemirror model', () => {
    expect(this.view._codemirrorModel).toBeDefined();
  });

  it('should create _onboardingNotification', () => {
    expect(this.view._onboardingNotification).not.toBe(null);
  });

  it('render should call _launchOnboarding', () => {
    spyOn(this.view, '_launchOnboarding');

    this.view.render();

    expect(this.view._launchOnboarding).toHaveBeenCalled();
  });

  describe('bindings', () => {
    it('should set codemirror value when query schema model changes', () => {
      spyOn(this.view._codemirrorModel, 'set');
      this.node.querySchemaModel.set('query_errors', ['Syntax error']);
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
    });

    it('should update codemirror if query schema model changes', () => {
      spyOn(this.view._codemirrorModel, 'set');
      this.view._querySchemaModel.set({query: 'SELECT * FROM table LIMIT 10'});
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
    });

    it('should set codemirror value when undo or redo is applied', () => {
      this.sqlModel.set('content', 'SELECT foo FROM table');
      spyOn(this.view._codemirrorModel, 'set');
      this.sqlModel.undo();
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
      this.view._codemirrorModel.set.calls.reset();
      this.sqlModel.redo();
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
    });
  });

  it('should apply default query and refresh map and dataset view when query alters data', () => {
    jest.Ajax.stubRequest(new RegExp('^http(s)?.*'))
      .andReturn({ status: 200 });

    var originalQuery = 'SELECT * FROM table';
    spyOn(this.editorModel, 'isEditing').and.returnValue(true);
    spyOn(this.node.querySchemaModel, 'resetDueToAlteredData');
    this.view._codemirrorModel.set('content', 'DELETE FROM table WHERE cartodb_id=2');
    this.view._parseSQL();
    expect(this.view._codemirrorModel.get('content')).toBe(originalQuery);
    expect(this.userActions.saveAnalysisSourceQuery).toHaveBeenCalled();
    expect(this.node.querySchemaModel.get('query_errors').length).toBe(0);
    expect(this.node.querySchemaModel.get('query')).toBe(originalQuery);
    expect(this.node.querySchemaModel.resetDueToAlteredData).toHaveBeenCalled();
  });

  it('should fetch geometry when a new query is applied', () => {
    this.view._codemirrorModel.set('content', 'SELECT * FROM table LIMIT 10');
    spyOn(this.node.queryGeometryModel, 'fetch');
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._parseSQL();
    expect(this.node.queryGeometryModel.hasChanged('simple_geom')).toBeFalsy();
    expect(this.node.queryGeometryModel.get('query')).toBe('SELECT * FROM table LIMIT 10');
    expect(this.node.queryGeometryModel.fetch).toHaveBeenCalled();
  });

  it('should not let run the same query that is applied', () => {
    var originalQuery = 'SELECT * FROM table';
    spyOn(this.node.querySchemaModel, 'fetch');
    this.node.querySchemaModel.set('query', originalQuery);
    this.view._codemirrorModel.set('content', originalQuery);
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).not.toHaveBeenCalled();
    this.view._codemirrorModel.set('content', originalQuery.toUpperCase());
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).not.toHaveBeenCalled();
  });

  it('should not apply an empty query', () => {
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._codemirrorModel.set('content', '');
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).not.toHaveBeenCalled();
  });

  it('should not set a query with a ; character at the end', () => {
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._codemirrorModel.set('content', 'select * from whatever;');
    this.view._parseSQL();
    expect(this.view._codemirrorModel.get('content')).toBe('select * from whatever');
    expect(this.node.querySchemaModel.fetch).toHaveBeenCalled();

    this.view._codemirrorModel.set('content', 'select * from whatever; hello');
    this.view._parseSQL();
    expect(this.view._codemirrorModel.get('content')).toBe('select * from whatever; hello');
  });

  it('should not throw notification if same query that is applied', () => {
    SQLNotifications._addOrUpdateNotification.calls.reset();
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._sqlModel.set('content', 'SELECT * FROM table');
    this.view._codemirrorModel.set('content', 'SELECT * + FROM table');
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).toHaveBeenCalled();

    this.node.querySchemaModel.set('query', 'SELECT * FROM table');
    this.node.querySchemaModel.set('query_errors', ['Syntax error']);
    this.view._codemirrorModel.set('content', 'SELECT * FROM table');
    this.node.querySchemaModel.set('query_errors', []);
    this.view._parseSQL();

    expect(SQLNotifications.showErrorNotification).toHaveBeenCalledTimes(1);
    expect(SQLNotifications.removeNotification).toHaveBeenCalledTimes(1);
    expect(SQLNotifications._addOrUpdateNotification).toHaveBeenCalledTimes(1);
  });

  describe('_launchOnboarding', () => {
    it('should do nothing if onboarding was skipped', () => {
      this.view._onboardingNotification.setKey(layerOnboardingKey, true);
      this.view._onboardingLauncher.launch.calls.reset();

      this.view._launchOnboarding();

      expect(this.view._onboardingLauncher.launch).not.toHaveBeenCalled();
    });

    it('should do nothing if we are on editing mode', () => {
      this.view._onboardingNotification.setKey(layerOnboardingKey, false);
      this.view._editorModel.isEditing = () => { return true; };
      this.view._onboardingLauncher.launch.calls.reset();

      this.view._launchOnboarding();

      expect(this.view._onboardingLauncher.launch).not.toHaveBeenCalled();
    });

    it('should launch the onboarding', () => {
      this.view._onboardingNotification.setKey(layerOnboardingKey, false);
      this.view._editorModel.isEditing = () => { return false; };
      this.view._onboardingLauncher.launch.calls.reset();

      this.view._launchOnboarding();

      expect(this.view._onboardingLauncher.launch).toHaveBeenCalled();
    });
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  describe('._infoboxState', () => {
    beforeEach(() => {
      this.view._infoboxModel.set('state', '');
      this.view._overlayModel.set('visible', false);
      this.view._editorModel.set('edition', false);
      this.view._codemirrorModel.set('readonly', false);
      spyOn(this.view, '_hasAnalysisApplied').and.returnValue(false);
      spyOn(this.view, '_isLayerHidden').and.returnValue(false);
      spyOn(this.view._layerDefinitionModel, 'canBeGeoreferenced').and.returnValue(false);
    });

    describe('if layer can be georeferenced', () => {
      it('should set infobox state', () => {
        this.view._layerDefinitionModel.canBeGeoreferenced.and.returnValue(true);

        this.view._infoboxState();

        expect(this.view._infoboxModel.get('state')).toBe('georeference');
        expect(this.view._overlayModel.get('visible')).toBe(false);
      });
    });

    describe('if layer is editing and has analysis', () => {
      it('should set infobox state', () => {
        this.view._editorModel.set('edition', true);
        this.view._hasAnalysisApplied.and.returnValue(true);

        this.view._infoboxState();

        expect(this.view._infoboxModel.get('state')).toBe('readonly');
        expect(this.view._codemirrorModel.get('readonly')).toBe(true);
      });
    });

    describe('if layer is not editing and is hidden', () => {
      it('should set infobox state', () => {
        this.view._isLayerHidden.and.returnValue(true);

        this.view._infoboxState();

        expect(this.view._infoboxModel.get('state')).toBe('layer-hidden');
        expect(this.view._overlayModel.get('visible')).toBe(true);
      });
    });

    it('should unset infobox state', () => {
      this.view._infoboxState();

      expect(this.view._infoboxModel.get('state')).toBe('');
      expect(this.view._overlayModel.get('visible')).toBe(false);
    });
  });

  describe('._showHiddenLayer', () => {
    it('should show layer if is visible', () => {
      spyOn(this.view._layerDefinitionModel, 'toggleVisible');

      this.view._showHiddenLayer();

      expect(this.view._layerDefinitionModel.toggleVisible).toHaveBeenCalled();
      expect(this.view._userActions.saveLayer).toHaveBeenCalledWith(this.view._layerDefinitionModel, { shouldPreserveAutoStyle: true });
    });
  });

  describe('._isLayerHidden', () => {
    it('should return true if layer is not visible', () => {
      this.view._layerDefinitionModel.set('visible', false);

      expect(this.view._isLayerHidden()).toBe(true);
    });
  });

  describe('._onGeoreferenceClicked', () => {
    it('should add Georeference Analysis', () => {
      spyOn(AnalysesService, 'addGeoreferenceAnalysis');

      this.view._onGeoreferenceClicked();

      expect(AnalysesService.addGeoreferenceAnalysis).toHaveBeenCalled();
    });
  });
});
