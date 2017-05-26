var Backbone = require('backbone');
var InputNumber = require('../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/input-number/input-number');

describe('components/form-components/editors/fill/input-number', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      range: [1, 30],
      attribute: 'the_geom',
      quantification: 'Quantile'
    });
    this.view = new InputNumber(({
      model: this.model,
      columns: ['pepe', 'paco', 'juan']
    }));
    this.view.render();
  });

  it('should get selected', () => {
    this.model.set('selected', true);
    expect(this.view.$el.hasClass('is-active')).toBeTruthy();
  });

  it('should create a content view', () => {
    expect(this.view.model.get('createContentView')).toBeDefined();
  });

  it('should trigger a click event when clicked', () => {
    var clickEvent = false;
    this.view.bind('click', () => {
      clickEvent = true;
    });
    this.view.$el.click();
    expect(clickEvent).toBeTruthy();
  });

  describe('fixed value', () => {
    beforeEach(() => {
      this.model = new Backbone.Model({
        fixed: 128
      });
      this.view = new InputNumber(({
        model: this.model,
        columns: ['pepe', 'paco', 'juan']
      }));
      this.view.render();
    });

    it('should render properly', () => {
      expect(this.view.$el.text()).toContain('128');
    });

    it('should update when the value is changed', () => {
      this.model.set('fixed', 50);
      expect(this.view.$el.text()).toContain('50');
    });
  });

  describe('range', () => {
    beforeEach(() => {
      this.model = new Backbone.Model({
        range: [1, 30],
        attribute: 'the_geom',
        quantification: 'Quantile'
      });
      this.view = new InputNumber(({
        model: this.model,
        columns: ['pepe', 'paco', 'juan']
      }));
      this.view.render();
    });

    it('should render properly', () => {
      expect(this.view.$el.text()).toContain('1..30');
    });

    it('should update when the value is changed', () => {
      this.model.set('range', [1, 50]);
      expect(this.view.$el.text()).toContain('1..50');
    });
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.remove();
  });
});
