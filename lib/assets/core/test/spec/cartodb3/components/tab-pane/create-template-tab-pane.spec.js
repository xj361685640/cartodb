var _ = require('underscore');
var cdb = require('cartodb.js');
var createTemplateTabPane = require('../../../../../javascripts/cartodb3/components/tab-pane/create-template-tab-pane');
var templateButton = require('../../../../../javascripts/cartodb3/components/tab-pane/tab-pane-template.tpl');

describe('components/tab-pane/create-template-tab-pane', () => {
  beforeEach(() => {
    this.items = [
      {
        selected: false,
        label: 'foo',
        name: 'foo',
        createContentView: () => {
          return new cdb.core.View();
        }
      }, {
        selected: false,
        label: 'bar',
        name: 'bar',
        createContentView: () => {
          return new cdb.core.View();
        }
      }
    ];

    this.options = {
      tabPaneTemplateOptions: {
        template: templateButton
      }
    };
  });

  it('should create view', () => {
    var view = createTemplateTabPane(this.items, this.options);
    expect(view.collection.size()).toEqual(2);

    view.render();
    expect(_.size(view._subviews)).toEqual(3);
  });

  it('should add the icons', () => {
    var view = createTemplateTabPane(this.items, this.options);
    view.render();
    expect(view.$el.find('i').length).toBe(2);
  });

  it('should throw error if label is not provided', () => {
    var items = _.clone(this.items, this.options);
    delete items[0].label;
    expect(() => { createTemplateTabPane(items, this.options); }).toThrow(new Error('label should be provided'));
  });

  it('should throw error if contentView is not provided', () => {
    var items = _.clone(this.items, this.options);
    delete items[0].createContentView;
    expect(() => { createTemplateTabPane(items); }).toThrow(new Error('createContentView should be provided'));
  });

  it('should throw error if name is not provided', () => {
    var items = _.clone(this.items, this.options);
    delete items[0].name;
    expect(() => { createTemplateTabPane(items); }).toThrow(new Error('name should be provided'));
  });

  it('should allow to set custom options for the pane and its items', () => {
    var view = createTemplateTabPane(this.items, {
      tabPaneOptions: {
        className: 'MyCoolIconTabPane',
        tabPaneItemOptions: {
          tagName: 'li',
          className: 'CDB-NavMenu-item'
        }
      },
      tabPaneTemplateOptions: {
        tagName: 'button',
        className: 'CDB-NavMenu-link u-upperCase',
        template: templateButton
      }
    });
    view.render();
    expect(view.$el.hasClass('MyCoolIconTabPane')).toBeTruthy();
    expect(view.$el.find('li.CDB-NavMenu-item').length).toBe(2);
    expect(view.$el.find('button.CDB-NavMenu-link').length).toBe(2);
    expect(view.$el.find('i').length).toBe(2);
  });
});
