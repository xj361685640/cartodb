var _ = require('underscore');
var CoreView = require('backbone/core-view');
var createEditorMenuTabPane = require('../../../../../javascripts/cartodb3/components/tab-pane/create-editor-menu-tab-pane');

describe('components/tab-pane/create-editor-menu-tab-pane', () => {
  beforeEach(() => {
    this.items = [
      {
        selected: false,
        icon: 'myFirstIcon',
        createContentView: () => {
          return new CoreView();
        }
      }, {
        selected: false,
        icon: 'mySecondIcon',
        createContentView: () => {
          return new CoreView();
        }
      }
    ];
  });

  it('should create view', () => {
    var view = createEditorMenuTabPane(this.items);
    expect(view).toEqual(jest.any(CoreView));
    expect(view.collection.size()).toEqual(2);

    view.render();
    expect(_.size(view._subviews)).toEqual(3);
  });

  it('should add the icons', () => {
    var view = createEditorMenuTabPane(this.items);
    view.render();
    expect(view.$el.find('i.CDB-IconFont-myFirstIcon').length).toBe(1);
    expect(view.$el.find('i.CDB-IconFont-mySecondIcon').length).toBe(1);
  });

  it('should throw error if icon is not provided', () => {
    var items = _.clone(this.items);
    delete items[0].icon;
    expect(() => { createEditorMenuTabPane(items); }).toThrow(new Error('icon should be provided'));
  });

  it('should throw error if contentView is not provided', () => {
    var items = _.clone(this.items);
    delete items[0].createContentView;
    expect(() => { createEditorMenuTabPane(items); }).toThrow(new Error('createContentView should be provided'));
  });

  it('should allow to set custom options for the pane and its items', () => {
    var view = createEditorMenuTabPane(this.items, {
      tabPaneOptions: {
        className: 'MyCoolIconTabPane',
        tabPaneItemOptions: {
          tagName: 'li',
          className: 'CDB-NavMenu-item'
        }
      },
      tabPaneItemIconOptions: {
        tagName: 'button',
        className: 'CDB-NavMenu-link u-upperCase'
      }
    });
    view.render();
    expect(view.$el.hasClass('MyCoolIconTabPane')).toBeTruthy();
    expect(view.$el.find('li.CDB-NavMenu-item').length).toBe(2);
    expect(view.$el.find('button.CDB-NavMenu-link').length).toBe(2);
  });
});
