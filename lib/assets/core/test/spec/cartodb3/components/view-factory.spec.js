var CoreView = require('backbone/core-view');
var ViewFactory = require('../../../../javascripts/cartodb3/components/view-factory');

describe('components/view-factory', () => {
  describe('.createByHTML', () => {
    beforeEach(() => {
      this.html = '<div>foo bar!</div>';

      this.view = ViewFactory.createByHTML(this.html);
      spyOn(this.view.$el, 'html');
      this.view.render();
    });

    it('should not have leaks', () => {
      expect(this.view).toHaveNoLeaks();
    });

    it("should inject the rendered results into the view's element", () => {
      expect(this.view.$el.html).toHaveBeenCalled();
      expect(this.view.$el.html).toHaveBeenCalledWith('<div>foo bar!</div>');
    });
  });

  describe('.createByTemplate', () => {
    beforeEach(() => {
      this.template = jest.createSpy('compiled template');
      this.template.and.returnValue('<div>foo bar!</div>');
      this.templateData = { foo: 'bar' };

      this.view = ViewFactory.createByTemplate(this.template, this.templateData);
      spyOn(this.view.$el, 'html');
      this.view.render();
    });

    it('should not have leaks', () => {
      expect(this.view).toHaveNoLeaks();
    });

    it('should render given template with template data', () => {
      expect(this.template).toHaveBeenCalled();
      expect(this.template).toHaveBeenCalledWith(this.templateData);
    });

    it("should inject the rendered results into the view's element", () => {
      expect(this.view.$el.html).toHaveBeenCalled();
      expect(this.view.$el.html).toHaveBeenCalledWith('<div>foo bar!</div>');
    });
  });

  describe('.createListView', () => {
    describe('when given proper input', () => {
      beforeEach(() => {
        var createItemView = function (id) {
          var view = new CoreView({tagName: 'li'});
          view.render = () => {
            this.$el.html('<div id="' + id + '"></div>');
            return this;
          };
          return view;
        };

        var createViewFns = [
          createItemView.bind(this, 'header'),
          createItemView.bind(this, 'items'),
          createItemView.bind(this, 'footer')
        ];

        var viewOpts = {tagName: 'ul'};
        this.view = ViewFactory.createListView(createViewFns, viewOpts);
        this.view.render();
      });

      it('should not have leaks', () => {
        expect(this.view).toHaveNoLeaks();
      });

      it('should pass the view opts when creating view', () => {
        expect(this.view.$el.prop('tagName').toLowerCase()).toEqual('ul');
      });

      it('should render the items', () => {
        expect(this.innerHTML()).toContain('id="header"');
        expect(this.innerHTML()).toContain('id="items"');
        expect(this.innerHTML()).toContain('id="footer"');
      });
    });

    describe('when given bad input', () => {
      it('should throw a descriptive error', () => {
        expect(() => { ViewFactory.createListView(); }).toThrowError(/required/);
        expect(() => { ViewFactory.createListView(['meh']); }).toThrowError(/must only contain functions/);
        expect(() => { ViewFactory.createListView([ () => {}, 'meh' ]); }).toThrowError(/must only contain functions/);
      });
    });
  });
});
