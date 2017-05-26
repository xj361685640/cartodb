var Backbone = require('backbone');
var EditFeatureGeometryFormView = require('../../../../../../javascripts/cartodb3/editor/layers/edit-feature-content-views/edit-feature-geometry-form-view');

describe('editor/layers/edit-feature-content-views/edit-feature-geometry-form-view', () => {
  beforeEach(() => {
    this.featureModel = new Backbone.Model({
      the_geom: '{"type":"LineString","coordinates":[[0,0],[0,1]]}',
      name: '',
      description: ''
    });
    this.featureModel.getFeatureType = () => { return 'line'; };
    this.featureModel.isPoint = () => { return false; };

    this.view = new EditFeatureGeometryFormView({
      model: this.featureModel
    });
    this.view.render();
  });

  it('should render with data from form model', () => {
    expect(this.view.$('form').length).toEqual(1);
  });

  describe('when schema changes', () => {
    beforeEach(() => {
      this.prev$form = this.view.$('form');
      this.view.model.trigger('changeSchema');
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
