var _ = require('underscore');
var CoreView = require('backbone/core-view');
var createTextLabelsTabPane = require('../../../../../javascripts/cartodb3/components/tab-pane/create-text-labels-tab-pane');

describe('components/tab-pane/create-text-labels-tab-pane', () => {
  beforeEach(() => {
    this.items = [{
      selected: false,
      label: 'label one',
      createContentView: () => {
        return new CoreView();
      }
    }, {
      selected: false,
      label: 'label two',
      createContentView: () => {
        return new CoreView();
      }
    }];
  });

  it('should create view', () => {
    var view = createTextLabelsTabPane(this.items);
    expect(view).toEqual(jest.any(CoreView));
    expect(view.collection.size()).toEqual(2);

    view.render();
    expect(_.size(view._subviews)).toEqual(3);
  });

  it('should add the labels', () => {
    var view = createTextLabelsTabPane(this.items);
    view.render();
    expect(view.$el.html()).toContain('label one');
    expect(view.$el.html()).toContain('label two');
  });

  it('should throw error if label is not provided', () => {
    var items = _.clone(this.items);
    delete items[0].label;
    expect(() => { createTextLabelsTabPane(items); }).toThrow(new Error('label should be provided'));
  });

  it('should throw error if contentView is not provided', () => {
    var items = _.clone(this.items);
    delete items[0].createContentView;
    expect(() => { createTextLabelsTabPane(items); }).toThrow(new Error('createContentView should be provided'));
  });

  it('should allow to set custom options for the pane and its items', () => {
    var view = createTextLabelsTabPane(this.items, {
      tabPaneOptions: {
        className: 'MyCoolLabelTabPane',
        tabPaneItemOptions: {
          tagName: 'li',
          className: 'CDB-NavMenu-item'
        }
      },
      tabPaneItemLabelOptions: {
        tagName: 'button',
        className: 'CDB-NavMenu-link u-upperCase'
      }
    });
    view.render();
    expect(view.$el.hasClass('MyCoolLabelTabPane')).toBeTruthy();
    expect(view.$el.find('li.CDB-NavMenu-item').length).toBe(2);
    expect(view.$el.find('button.CDB-NavMenu-link').length).toBe(2);
  });
});
