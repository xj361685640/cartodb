var ErrorView = require('../../../../../javascripts/cartodb3/components/error/error-view');

describe('components/error/error-view', () => {
  beforeEach(() => {
    this.view = new ErrorView();
    this.view.render();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render default texts', () => {
    var html = this.view.$el.html();
    expect(html).toContain('default-title');
    expect(html).toContain('default-desc');
  });

  describe('when given custom title and desc', () => {
    beforeEach(() => {
      this.view.clean();
      this.view = new ErrorView({
        title: 'custom title',
        desc: 'custom desc'
      });
      this.view.render();
    });

    it('should render custom texts instead', () => {
      var html = this.view.$el.html();
      expect(html).not.toContain('default-title');
      expect(html).not.toContain('default-desc');
      expect(html).toContain('custom title');
      expect(html).toContain('custom desc');
    });
  });
});
