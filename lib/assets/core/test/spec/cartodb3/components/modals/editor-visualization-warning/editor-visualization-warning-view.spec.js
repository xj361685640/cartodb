var Backbone = require('backbone');
var ConfigModel = require('../../../../../../javascripts/cartodb3/data/config-model');
var VisDefinitionModel = require('../../../../../../javascripts/cartodb3/data/vis-definition-model');
var EditorVisualizationWarningView = require('../../../../../../javascripts/cartodb3/components/modals/editor-visualization-warning/editor-visualization-warning-view');

describe('cartodb3/components/modals/editor-visualization-warning', () => {
  beforeEach(() => {
    jest.Ajax.install();
    jest.Ajax.stubRequest(new RegExp('^http(s)?.*/viz\?.*'))
      .andReturn({ status: 200 });

    var visDefinitionModel = new VisDefinitionModel({
      id: '1234567890',
      name: 'Foo Map',
      type: 'derived'
    }, {
      configModel: new ConfigModel({
        base_url: '/u/marieta'
      })
    });

    var modalModel = new Backbone.Model();

    spyOn(EditorVisualizationWarningView.prototype, '_goToDashboard');

    this.view = new EditorVisualizationWarningView({
      modalModel: modalModel,
      visDefinitionModel: visDefinitionModel
    });

    this.view.render();
  });

  afterEach(() => {
    jest.Ajax.uninstall();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render template', () => {
    expect(this.view.$el.html()).toContain('Modal-inner');
  });

  describe('_onOpen', () => {
    it('should call _onOpen when .js-open is clicked', () => {
      spyOn(this.view, '_renderLoading');
      this.view.$('.js-open').click();
      expect(this.view._renderLoading).toHaveBeenCalled();
    });

    it('should destroy modalModel if the map version update succeeds', () => {
      spyOn(this.view._modalModel, 'destroy');
      this.view._visDefinitionModel.save = function (a, opts) {
        opts.success();
      };
      this.view.$('.js-open').click();
      expect(this.view._modalModel.destroy).toHaveBeenCalled();
    });

    it('should call _renderError if the map version update fails', () => {
      spyOn(this.view, '_renderError');
      this.view._visDefinitionModel.save = function (a, opts) {
        var e = {
          readyState: 4,
          responseText: '',
          status: 405,
          statusText: 'Method Not Allowed'
        };

        opts.error({model: 'lorem ipsum'}, e);
      };
      this.view.$('.js-open').click();
      expect(this.view._renderError).toHaveBeenCalled();
    });
  });

  describe('_onDuplicate', () => {
    it('should call _onDuplicate when .js-duplicate is clicked', () => {
      spyOn(this.view, '_renderLoading').and.callFake(() => {
        return true;
      });
      this.view.$('.js-duplicate').click();
      expect(this.view._renderLoading).toHaveBeenCalled();
    });

    it('should redirect to the duplicated map builder view if duplication succeeds', () => {
      var newVisModel = new VisDefinitionModel({
        id: '111',
        name: 'table_1',
        privacy: 'PUBLIC',
        permission: {}
      }, {
        configModel: this.view._visDefinitionModel._configModel
      });

      VisDefinitionModel.prototype.save = function (a, opts) {
        opts.success(newVisModel);
      };

      spyOn(this.view, '_redirectToBuilder');

      this.view.$('.js-duplicate').click();
      expect(this.view._redirectToBuilder).toHaveBeenCalledWith('/u/marieta/builder/111/');
    });

    it('should call _renderError if the map version update fails', () => {
      spyOn(this.view, '_renderError');
      VisDefinitionModel.prototype.save = function (a, opts) {
        var e = {
          readyState: 4,
          responseText: '',
          status: 405,
          statusText: 'Method Not Allowed'
        };

        opts.error({model: 'lorem ipsum'}, e);
      };

      this.view.$('.js-duplicate').click();
      expect(this.view._renderError).toHaveBeenCalled();
    });
  });

  describe('_onCancel', () => {
    it('should call _onCancel when .js-cancel is clicked', () => {
      this.view.$('.js-cancel').click();
      expect(EditorVisualizationWarningView.prototype._goToDashboard).toHaveBeenCalled();
    });
  });
});
