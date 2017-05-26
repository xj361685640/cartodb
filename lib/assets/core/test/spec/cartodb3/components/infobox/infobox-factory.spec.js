var Infobox = require('../../../../../javascripts/cartodb3/components/infobox/infobox-factory');

describe('components/infobox/infobox-factory', () => {
  var view;

  describe('createInfo', () => {
    it('no closable', () => {
      view = Infobox.createInfo({
        title: 'Info',
        body: 'Lorem ipsum dolor sit amet.',
        closable: false
      });
      view.render();

      expect(view.$('button').length).toBe(0);
    });

    it('closable', () => {
      view = Infobox.createInfo({
        title: 'Info',
        body: 'Lorem ipsum dolor sit amet.'
      });
      view.render();

      expect(view.$('button .CDB-Shape-close').length).toBe(1);
    });
  });

  describe('createWithActions', () => {
    it('main action', () => {
      view = Infobox.createWithAction({
        title: 'Info',
        body: 'Lorem ipsum dolor sit amet.',
        closable: false,
        mainAction: {
          label: 'Confirm'
        }
      });

      view.render();

      expect(view.$('.Infobox')).toBeDefined();
      expect(view.$('button').length).toBe(1);
      expect(view.$('button').text()).toContain('Confirm');
    });

    it('second action', () => {
      view = Infobox.createWithAction({
        title: 'Info',
        body: 'Lorem ipsum dolor sit amet.',
        mainAction: {
          label: 'Confirm'
        },
        secondAction: {
          label: 'Cancel'
        }
      });

      view.render();

      expect(view.$('.Infobox')).toBeDefined();
      expect(view.$('.js-close').length).toBe(1);
      expect(view.$('.Infobox-buttons button').length).toBe(2);
      expect(view.$('.Infobox-buttons button').eq(0).text()).toContain('Confirm');
      expect(view.$('.Infobox-buttons button').eq(1).text()).toContain('Cancel');
    });
  });
});
