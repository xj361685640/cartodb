var CustomListItemModel = require('../../../../../javascripts/cartodb3/components/custom-list/custom-list-item-model');
var CustomListCollection = require('../../../../../javascripts/cartodb3/components/custom-list/custom-list-collection');

describe('components/custom-list/custom-list-collection', () => {
  beforeEach(() => {
    this.collection = new CustomListCollection([
      new CustomListItemModel({ val: 'hi' }),
      new CustomListItemModel({ val: 'howdy' }),
      new CustomListItemModel({ val: 'hello' })
    ]);
  });

  it('should search properly', () => {
    expect(this.collection.search('+').size()).toBe(0);
    expect(this.collection.search('h').size()).toBe(3);
    expect(this.collection.search('he').size()).toBe(1);
    expect(this.collection.search('/').size()).toBe(0);
  });

  it('should remove previous selected item when a new one is chosen', () => {
    this.collection.at(1).set('selected', true);
    expect(this.collection.where({ selected: true }).length).toBe(1);
    this.collection.at(0).set('selected', true);
    expect(this.collection.where({ selected: true }).length).toBe(1);
    expect(this.collection.at(1).get('selected')).toBeFalsy();
  });

  it('should remove any selected item', () => {
    this.collection.at(1).set('selected', true);
    this.collection.removeSelected();
    expect(this.collection.where({ selected: true }).length).toBe(0);
  });

  it('should sort the collection by value', () => {
    this.collection.sortByKey('val');
    expect(this.collection.at(0).get('val')).toBe('hello');
    expect(this.collection.at(1).get('val')).toBe('hi');
    expect(this.collection.at(2).get('val')).toBe('howdy');
  });
});
