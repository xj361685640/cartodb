var $ = require('jquery');
var LikesView = require('../../../../../javascripts/cartodb3/components/likes/likes-view');
var LikesModel = require('../../../../../javascripts/cartodb3/components/likes/likes-model');

describe('components/likes/likes-view', () => {
  beforeEach(() => {
    this.model = new LikesModel({
      liked: false,
      likes: 41,
      vis_id: 'hello'
    }, {
      configModel: 'c'
    });

    this.view = new LikesView({
      model: this.model
    });

    this.view.render();
    this.html = () => {
      return $('<div>').append(this.view.$el.clone()).remove().html();
    };
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render the likes count', () => {
    expect(this.html()).toContain('41');
  });

  it('should not rendered the liked state since not liked yet', () => {
    expect(this.html()).not.toContain('is-liked');
  });

  it('should not animated view since no state change yet', () => {
    expect(this.html()).not.toContain('is-animated');
  });

  describe('click toggle', () => {
    beforeEach(() => {
      (function (_this) {
        spyOn(_this.model, 'toggleLiked').and.callFake(() => {
          _this.model.set({ liked: true, likes: 42 });
        });
      })(this);
      spyOn(this.view, 'killEvent');
      spyOn(this.view.$el, 'one');
      this.view.$el.click();
    });

    it('should prevent event default', () => {
      expect(this.view.killEvent).toHaveBeenCalledWith(jest.any(Object));
    });

    it('should have toggled liked state on model', () => {
      expect(this.model.toggleLiked).toHaveBeenCalled();
    });

    it('should render the new likes count', () => {
      expect(this.html()).toContain('42');
    });

    it('should render animate next render', () => {
      expect(this.html()).toContain('is-animated');
    });

    it('should remove animation once done animating', () => {
      // Manually trigger the on-animation-end callback to simulate that animation finished
      this.view.$el.one.calls.argsFor(0)[1]();

      expect(this.html()).not.toContain('is-animated');
    });
  });
});
