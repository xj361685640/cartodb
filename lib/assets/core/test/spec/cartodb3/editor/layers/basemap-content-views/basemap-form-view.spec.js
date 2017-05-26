var BasemapsCollection = require('../../../../../../javascripts/cartodb3/editor/layers/basemap-content-views/basemaps-collection');
var BasemapFormView = require('../../../../../../javascripts/cartodb3/editor/layers/basemap-content-views/basemap-form-view');
var Backbone = require('backbone');

describe('editor/layers/basemap-content-views/basemap-form-view', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      default: false,
      color: '#35AAE5',
      image: '',
      maxZoom: 32,
      className: 'plain',
      category: 'Color',
      type: 'Plain',
      selected: true,
      val: 'plain',
      label: 'plain',
      template: () => {
        return 'plain';
      }
    });

    this.view = new BasemapFormView({
      model: this.model,
      basemapsCollection: new BasemapsCollection(),
      layerDefinitionsCollection: {}
    });
    this.view.render();
  });

  it('should render with data from form model', () => {
    expect(this.view.$('form').length).toEqual(1);
    expect(this.view.$el.html()).toContain('Form-InputFill');
  });

  describe('when schema changes', () => {
    beforeEach(() => {
      this.prev$form = this.view.$('form');
      this.view._formModel.trigger('changeSchema');
    });

    afterEach(() => {
      this.prev$form = null;
    });

    it('should re-render the form', () => {
      expect(this.view.$('form').length).toEqual(1);
      expect(this.view.$('form')).not.toBe(this.prev$form);
    });
  });

  describe('when form is cleaned', () => {
    beforeEach(() => {
      spyOn(Backbone.Form.prototype, 'remove').and.callThrough();
      this.view.clean();
    });

    it('should remove form when view is cleaned', () => {
      expect(Backbone.Form.prototype.remove).toHaveBeenCalled();
    });
  });

  it('should not have any leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
