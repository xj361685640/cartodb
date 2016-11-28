var CustomListItemModel = require('../../../../../javascripts/cartodb3/components/custom-list/custom-list-item-model');
var CustomListCollection = require('../../../../../javascripts/cartodb3/components/custom-list/custom-list-collection');

describe('components/custom-list/custom-list-collection', function () {
  beforeEach(function () {
    this.collection = new CustomListCollection([
      new CustomListItemModel({ val: 'hi' }),
      new CustomListItemModel({ val: 'howdy' }),
      new CustomListItemModel({ val: 'hello' }),
      new CustomListItemModel({ val: 10 }),
      new CustomListItemModel({ val: true }),
      new CustomListItemModel({ val: null })
    ]);
  });

  it('should search properly', function () {
    expect(this.collection.search('+').size()).toBe(0);
    expect(this.collection.search('h').size()).toBe(3);
    expect(this.collection.search('he').size()).toBe(1);
    expect(this.collection.search('/').size()).toBe(0);
    expect(this.collection.search('true').size()).toBe(1);
    expect(this.collection.search('10').size()).toBe(1);
    expect(this.collection.search('null').size()).toBe(1);
  });

  it('should remove previous selected item when a new one is chosen', function () {
    this.collection.at(1).set('selected', true);
    expect(this.collection.where({ selected: true }).length).toBe(1);
    this.collection.at(0).set('selected', true);
    expect(this.collection.where({ selected: true }).length).toBe(1);
    expect(this.collection.at(1).get('selected')).toBeFalsy();
  });

  it('should remove any selected item', function () {
    this.collection.at(1).set('selected', true);
    this.collection.removeSelected();
    expect(this.collection.where({ selected: true }).length).toBe(0);
  });

  it('should sort the collection by value', function () {
    this.collection.sortByKey('val');
    expect(this.collection.at(0).get('val')).toBe(10);
    expect(this.collection.at(1).get('val')).toBe('hello');
    expect(this.collection.at(2).get('val')).toBe('hi');
    expect(this.collection.at(3).get('val')).toBe('howdy');
    expect(this.collection.at(4).get('val')).toBe(null);
    expect(this.collection.at(5).get('val')).toBe(true);
  });
});
