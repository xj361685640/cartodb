var PrivacyCollection = require('../../../../../../javascripts/cartodb3/components/modals/publish/privacy-collection');

describe('components/modals/publish/privacy-collection', () => {
  var collection;

  beforeEach(() => {
    collection = new PrivacyCollection();
  });

  describe('when reset with some options', () => {
    beforeEach(() => {
      collection.reset([{
        privacy: 'PUBLIC',
        title: 'Public',
        desc: 'Lorem ipsum',
        cssClass: 'is-green',
        selected: true
      }, {
        privacy: 'LINK',
        title: 'Link',
        desc: 'Yabadababa',
        cssClass: 'is-orange'
      }, {
        privacy: 'PASSWORD',
        title: 'Password',
        desc: 'Wadus'
      }, {
        privacy: 'PRIVATE',
        title: 'Private',
        desc: 'Funínculo',
        cssClass: 'is-red'
      }]);
    });

    it('should create a model for given data', () => {
      expect(collection.length).toEqual(4);
      expect(collection.at(0).get('title')).toEqual('Public');
      expect(collection.at(3).get('title')).toEqual('Private');
    });

    it('should return the selected option', () => {
      collection.at(2).set({selected: true});
      expect(collection.selectedOption().get('title')).toEqual('Password');
      collection.at(3).set({selected: true});
      expect(collection.selectedOption().get('title')).toEqual('Private');
    });

    it('should return the password option', () => {
      expect(collection.passwordOption().get('title')).toEqual('Password');
    });

    it('should search the option passed', () => {
      expect(collection.searchByPrivacy('LINK').get('title')).toEqual('Link');
    });

    it('should only allow one selection at a time', () => {
      expect(collection.pluck('selected')).toEqual([true, false, false, false]);

      collection.last().set('selected', true);
      expect(collection.pluck('selected')).toEqual([false, false, false, true]);

      collection.first().set('selected', true);
      expect(collection.pluck('selected')).toEqual([true, false, false, false]);
    });
  });
});
