var AnalysisOptionModel = require('../../../../../../javascripts/cartodb3/components/modals/add-analysis/analysis-option-models/analysis-option-model');
var AnalysisOptionView = require('../../../../../../javascripts/cartodb3/components/modals/add-analysis/analysis-option-view');
describe('components/modals/add-analysis/analysis-option-view', () => {
  beforeEach(() => {
    this.model = new AnalysisOptionModel({
      title: 'Buffer',
      desc: 'describes the buffer type',
      type_group: 'area of influence'
    }, {
      nodeAttrs: {
        type: 'buffer'
      }
    });
  });

  describe('when given a simple geometry type', () => {
    beforeEach(() => {
      this.view = new AnalysisOptionView({
        model: this.model,
        simpleGeometryTypeInput: 'point'
      });
      this.view.render();
    });

    it('should not have any leaks', () => {
      expect(this.view).toHaveNoLeaks();
    });

    it('should render the info', () => {
      expect(this.view.$el.html()).toContain('Buffer');
      expect(this.view.$el.html()).toContain('describes the buffer');
    });

    it('should render the info link and trigger the info event', () => {
      var clicked = false;

      expect(this.view.$('.js-more').length).toBe(1);

      this.view.bind('onClickInfo', () => {
        clicked = true;
      }, this);

      this.view.$('.js-more').click();

      expect(clicked).toBeTruthy();
      expect(this.model.get('selected')).toBeTruthy();
    });

    it('should render the animation', () => {
      expect(this.view.$('.js-animation').length).toBe(1);
    });

    it('should launch the animation on hover', () => {
      this.view._acceptsInputGeometry = () => { return true; };

      this.view.$el.trigger('mouseenter');
      expect(this.view.$('.js-animation').hasClass('has-autoplay')).toBeTruthy();

      this.view.$el.trigger('mouseleave');
      expect(this.view.$('.js-animation').hasClass('has-autoplay')).toBeFalsy();
    });

    describe('when selected', () => {
      beforeEach(() => {
        this.model.set('selected', true);
      });

      it('should highlight the item', () => {
        expect(this.view.el.className).toContain('is-selected');
      });
    });

    describe('when geometry type does not match ', () => {
      beforeEach(() => {
        spyOn(this.model, 'acceptsGeometryTypeAsInput').and.returnValue(false);
        this.view.render();
      });

      it('should disable the view', () => {
        expect(this.view.el.className).toContain('is-disabled');
      });

      it('should show alternative desc', () => {
        expect(this.view.$el.html()).toContain('disabled-option-desc');
        expect(this.view.$el.html()).not.toContain('describes the buffer');
      });

      it('should not be able to select it', () => {
        this.view.$el.click();
        expect(this.view.el.className).not.toContain('selected');
      });
    });
  });

  describe('when not given any geometry type', () => {
    beforeEach(() => {
      this.view = new AnalysisOptionView({
        model: this.model
      });
      this.view.render();
    });

    it('should not have any leaks', () => {
      expect(this.view).toHaveNoLeaks();
    });
  });
});
