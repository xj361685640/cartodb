var Backbone = require('backbone');
var CoreView = require('backbone/core-view');
var ModalViewModel = require('../../../../../javascripts/cartodb3/components/modals/modal-view-model');
var ModalView = require('../../../../../javascripts/cartodb3/components/modals/modal-view');

describe('components/modals/modal-view', () => {
  var contentView, contentViewEventSpy;

  beforeEach(() => {
    contentViewEventSpy = jest.createSpy('test');
    var TestView = CoreView.extend({
      initialize: () => {
        this.model.on('test', contentViewEventSpy, this);
      }
    });

    this.contentViewModel = new Backbone.Model();
    contentView = new TestView({model: this.contentViewModel});
    spyOn(contentView, 'render').and.callThrough();

    this.model = new ModalViewModel({
      createContentView: () => { return contentView; }
    });
    this.view = new ModalView({
      model: this.model
    });
    this.view.render();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render dialog classes', () => {
    expect(this.view.$el.html()).toContain('Dialog');
    expect(this.view.$el.html()).toContain('Dialog-contentWrapper');
  });

  it('should not render close button if escapeOptionsDisabled is present', () => {
    this.view.options.escapeOptionsDisabled = true;
    this.view.render();
    expect(this.view.$el.html()).not.toContain('js-close');
  });

  describe('when close is clicked', () => {
    beforeEach(() => {
      this.contentViewModel.trigger('test', 'asd');
      expect(contentViewEventSpy).toHaveBeenCalled();
      contentViewEventSpy.calls.reset();

      jest.clock().install();
      spyOn(this.view, 'hide').and.callThrough();
      spyOn(this.view, 'clean').and.callThrough();
      spyOn(this.model, 'destroy').and.callThrough();
      this.view.$('.js-close').click();
    });

    afterEach(() => {
      jest.clock().uninstall();
    });

    it('should destroy the model', () => {
      expect(this.model.destroy).toHaveBeenCalled();
    });

    it('should hide modal', () => {
      expect(this.view.hide).toHaveBeenCalled();
    });

    it('should not react to model bindings anymore', () => {
      this.contentViewModel.trigger('test', 'asd');
      expect(contentViewEventSpy).not.toHaveBeenCalled();
    });

    it('should not clean the view right away', () => {
      expect(this.view.clean).not.toHaveBeenCalled();
    });

    describe('when the close animation is done', () => {
      beforeEach(() => {
        jest.clock().tick(1000);
      });

      it('should have cleaned the view', () => {
        expect(this.view.clean).toHaveBeenCalled();
      });

      it('should not react to model bindings anymore', () => {
        this.contentViewModel.trigger('test', 'asd');
        expect(contentViewEventSpy).not.toHaveBeenCalled();
      });

      it('should have no leaks', () => {
        expect(this.view).toHaveNoLeaks();
      });
    });
  });
});
