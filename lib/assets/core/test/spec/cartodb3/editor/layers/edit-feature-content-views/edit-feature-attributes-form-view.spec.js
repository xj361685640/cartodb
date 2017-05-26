var Backbone = require('backbone');
var EditFeatureAttributesFormView = require('../../../../../../javascripts/cartodb3/editor/layers/edit-feature-content-views/edit-feature-attributes-form-view');

describe('editor/layers/edit-feature-content-views/edit-feature-attributes-form-view', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      string: 'string',
      boolean: false,
      number: 1,
      date: '2016-10-21T11:27:39+00:00',
      the_geom: '{"type":"Point","coordinates":[0,0]}'
    });

    this.view = new EditFeatureAttributesFormView({
      model: this.model
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
