var PaginationModel = require('../../../../../javascripts/cartodb3/components/pagination/pagination-model');
var PaginationView = require('../../../../../javascripts/cartodb3/components/pagination/pagination-view');

describe('components/pagination/pagination-view', () => {
  beforeEach(() => {
    this.model = new PaginationModel({
      total_count: 9000,
      per_page: 50,
      current_page: 42,
      url_to: function (page) {
        return 'hello';
      }
    });
    spyOn(this.model, 'bind').and.callThrough();

    this.routerModel = jest.createSpyObj('routerModel', ['navigate', 'hasUrl']);

    this.createView = () => {
      this.view = new PaginationView({
        model: this.model,
        routerModel: this.routerModel
      });
    };

    this.createView();
    this.view.render();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render current page and the total count', () => {
    expect(this.innerHTML()).toContain('Page 42 of 180');
  });

  // TBD!
  // it('should render URLs by provided url_to function', () => {
  //   expect(this.innerHTML()).toContain('http://pepe.carto.com/dashboard/datasets/40'); // first
  //   expect(this.innerHTML()).toContain('http://pepe.carto.com/dashboard/datasets/44'); // last
  // });

  it('should re-render on model change', () => {
    expect(this.model.bind).toHaveBeenCalledWith('change', this.view.render, this.view);
  });

  describe('given there are no items', () => {
    beforeEach(() => {
      // Effectively tests model event listener and re-rendering too
      this.model.set({
        total_count: 0,
        current_page: 1
      });
    });

    it('should not render pagination items at all', () => {
      expect(this.innerHTML()).not.toContain('Page ');
      expect(this.innerHTML()).not.toContain('Pagination-label');
      expect(this.innerHTML()).not.toContain('Pagination-list');
    });
  });

  describe('given there is only one page', () => {
    beforeEach(() => {
      this.model.set({
        total_count: this.model.get('per_page'),
        current_page: 1
      });
    });

    it('should not render pagination label', () => {
      expect(this.innerHTML()).not.toContain('Page 1 of 1');
    });

    it('should not render pagination list', () => {
      expect(this.innerHTML()).not.toContain('Pagination-list');
    });
  });

  describe('given current page is larger than available page', () => {
    beforeEach(() => {
      this.model.set({
        total_count: this.model.get('per_page'),
        current_page: 9000
      });
    });

    it('should not render pagination list', () => {
      expect(this.innerHTML()).not.toContain('Pagination-list');
    });
  });

  describe('click a link', () => {
    beforeEach(() => {
      this.clickLink = () => {
        this.view.$('a').click();
      };
      this.model.bind('change', () => {
        this.called = true;
      }, this);
    });

    describe('when view is created with a router', () => {
      beforeEach(() => {
        this.clickLink();
      });

      it('should navigate through router', () => {
        expect(this.routerModel.navigate).toHaveBeenCalled();
      });

      it('should update the current page', () => {
        expect(this.called).toBeTruthy();
      });
    });

    describe('when view is not created with a router', () => {
      beforeEach(() => {
        this.router = undefined;
        this.createView();
        this.view.render();
        this.clickLink();
      });

      it('should update the current page', () => {
        expect(this.called).toBeTruthy();
      });

      describe("when model doesn't have any url method", () => {
        beforeEach(() => {
          this.model.set('url_to', undefined);
          spyOn(this.view, 'killEvent').and.callThrough();
          spyOn(this.model, 'set');
          this.view.$('a').click();
        });

        it('should prevent default click behaviour', () => {
          expect(this.view.killEvent).toHaveBeenCalled();
          expect(this.model.set).toHaveBeenCalled();
        });

        it('should update the model with new current page', () => {
          expect(this.model.set).toHaveBeenCalled();
          expect(this.model.set).toHaveBeenCalledWith('current_page', jest.any(Number));
        });
      });
    });
  });
});
