var Backbone = require('backbone');
var CoreView = require('backbone/core-view');
var TabsView = require('../../../../../../javascripts/cartodb3/components/modals/add-basemap/tabs-view');

describe('basemap-tabs-view', () => {
  beforeEach(() => {
    this.view = new TabsView({
      model: new Backbone.Model({
        tabs: new Backbone.Collection([])
      }),
      submitButton: {},
      modalFooter: {}
    });
    this.view.model.activeTabModel = () => {
      return {
        createView: () => {
          return new CoreView();
        }
      };
    };
  });

  describe('.render', () => {
    it('should have the proper class name', () => {
      this.view.render();

      expect(this.view.$el.hasClass('Modal-outer')).toBe(true);
    });
  });
});
