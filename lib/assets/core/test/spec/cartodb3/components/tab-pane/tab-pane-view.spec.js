var TabPaneView = require('../../../../../javascripts/cartodb3/components/tab-pane/tab-pane-view');
var TabPaneCollection = require('../../../../../javascripts/cartodb3/components/tab-pane/tab-pane-collection');
var Backbone = require('backbone');
var CoreView = require('backbone/core-view');
var _ = require('underscore');

describe('components/tab-pane-view', () => {
  beforeEach(() => {
    this.collection = new TabPaneCollection();

    var model = new Backbone.Model({
      name: 'first',
      createContentView: () => {
        return new CoreView();
      },
      createButtonView: () => {
        return new CoreView();
      }
    });

    var model2 = new Backbone.Model({
      name: 'second',
      createContentView: () => {
        return new CoreView();
      },
      createButtonView: () => {
        return new CoreView();
      }
    });

    this.collection.reset([model, model2]);

    this.view = new TabPaneView({
      collection: this.collection
    });
  });

  it('should have no leaks', () => {
    this.view.render();
    expect(this.view).toHaveNoLeaks();
  });

  it('should render', () => {
    this.view.render();
    expect(this.view.$el.find('.js-menu').length).toBe(1);
    expect(this.view.$el.find('.js-content').length).toBe(1);
  });

  it('should toggle views', () => {
    this.view.render();
    var currentSelectedView = this.view._selectedView;
    expect(_.size(this.view._subviews)).toBe(3);

    this.view.collection.at(1).set('selected', true);

    expect(this.view._selectedView.cid !== currentSelectedView.cid).toBeTruthy();
    expect(_.size(this.view._subviews)).toBe(3);
  });

  it('should allow to select a collection item by name', () => {
    this.view.render();
    this.view.setSelectedTabPaneByName('second');
    expect(this.view.collection.at(1).get('selected')).toBeTruthy();

    this.view.setSelectedTabPaneByName('first');
    expect(this.view.collection.at(0).get('selected')).toBeTruthy();
  });
});
