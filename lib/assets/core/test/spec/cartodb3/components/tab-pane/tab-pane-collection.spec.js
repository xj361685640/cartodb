var TabPaneCollection = require('../../../../../javascripts/cartodb3/components/tab-pane/tab-pane-collection');
var Backbone = require('backbone');
var _ = require('underscore');

describe('components/tab-pane-collection', () => {
  beforeEach(() => {
    this.collection = new TabPaneCollection();
    this.model1 = new Backbone.Model({
      name: 'hello'
    });
    this.model2 = new Backbone.Model({
      name: 'world'
    });
    this.collection.reset([this.model1, this.model2]);
  });

  it('should select one item by default', () => {
    var isSelected = this.collection.find(function (model) {
      return model.get('selected');
    });
    expect(isSelected).toBe(this.collection.at(0));
  });

  it('should select item', () => {
    this.collection.select('name', 'hello');
    expect(this.collection.getSelected()).toBe(this.model1);
  });

  it('should trigger reset event', () => {
    spyOn(TabPaneCollection.prototype, 'trigger').and.callThrough();

    this.collection = new TabPaneCollection([new Backbone.Model(), new Backbone.Model()]);
    var calls = TabPaneCollection.prototype.trigger.calls;
    var resetWasCalled = _.find(calls.allArgs(), function (e) { return e[0] === 'reset'; });

    expect(TabPaneCollection.prototype.trigger).toHaveBeenCalled();
    expect(resetWasCalled).toBeTruthy();
    expect(calls.count()).toBe(8);

    // add x 2
    // update
    // change x 2
    // change:selected x 2: due to the `selected` attribute is undefined by default
    // reset

    TabPaneCollection.prototype.trigger.calls.reset();
  });
});
