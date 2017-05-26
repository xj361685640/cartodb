var $ = require('jquery');
var Backbone = require('backbone');
var dispatchDocumentEvent = function (type, opts) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, false, true);
  if (opts.which) {
    e.which = opts.which;
  }
  document.dispatchEvent(e, opts);
};

describe('components/form-components/editors/suggest', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      names: 'carlos'
    });

    this.view = new Backbone.Form.editors.Suggest({
      key: 'names',
      schema: {
        options: []
      },
      model: this.model,
      editorAttrs: {
        showSearch: true,
        allowFreeTextInput: true,
        collectionData: ['pepe', 'paco', 'juan']
      }
    });
    this.view.render();
    this.listView = this.view._listView;
  });

  describe('when there are values not null', () => {
    it('should render properly', () => {
      expect(this.view.$('.js-button').length).toBe(1);
      expect(this.view.$('.js-button').text()).toContain('carlos');
    });

    it('should disable the component if option is true', () => {
      this.view.options.disabled = true;
      spyOn(this.view, 'undelegateEvents').and.callThrough();
      this.view._initViews();
      expect(this.view.$('.js-button').hasClass('is-disabled')).toBeTruthy();
      expect(this.view.undelegateEvents).toHaveBeenCalled();
    });

    it('should add is-empty class if null value is selected', () => {
      this.model.set('names', '');
      this.view._initViews();
      expect(this.view.$('.js-button').hasClass('is-empty')).toBeTruthy();
    });
  });

  describe('when all column row values are null but selected value is not null', () => {
    // ColumnRowData only fetches 40 rows

    beforeEach(() => {
      this.model = new Backbone.Model({
        names: 'carlos'
      });

      this.view = new Backbone.Form.editors.Suggest({
        key: 'names',
        schema: {
          options: []
        },
        model: this.model,
        editorAttrs: {
          showSearch: true,
          allowFreeTextInput: true,
          collectionData: [null, null, null]
        }
      });
      this.view.render();
      this.listView = this.view._listView;
    });

    it('should render properly', () => {
      expect(this.view.$('.js-button').length).toBe(1);
      expect(this.view.$('.js-button').text()).toContain('carlos');
    });

    it('should add is-empty class if null value is selected', () => {
      this.model.set('names', '');
      this.view._initViews();
      expect(this.view.$('.js-button').hasClass('is-empty')).toBeTruthy();
    });
  });

  describe('when all column row values are null', () => {
    // TODO: replace Text editor
  });

  describe('bindings', () => {
    beforeEach(() => {
      spyOn(this.listView, 'hide');
    });

    it('should close list view if ESC is pressed', () => {
      dispatchDocumentEvent('keydown', { which: 27 });
      expect(this.listView.hide).toHaveBeenCalled();
    });

    it('should close list view if user clicks out the select', () => {
      dispatchDocumentEvent('click', { target: 'body' });
      expect(this.listView.hide).toHaveBeenCalled();
    });
  });

  describe('on ENTER pressed', () => {
    beforeEach(() => {
      spyOn(this.listView, 'toggle');
      this._event = $.Event('keydown');
      this._event.which = 13;
    });

    it('should open custom list', () => {
      this.view.$('.js-button').trigger(this._event);
      expect(this.listView.toggle).toHaveBeenCalled();
    });

    it('should not open custom list if it is already visible', () => {
      this.listView.show();
      this.view.$('.js-button').trigger(this._event);
      expect(this.listView.toggle).not.toHaveBeenCalled();
    });
  });

  it('should change button value and hide list when a new item is selected', () => {
    spyOn(this.listView, 'hide');
    var mdl = this.view.collection.where({ val: 'juan' });
    mdl[0].set('selected', true);
    expect(this.view.$('.js-button').text()).toContain('juan');
    expect(this.view.$('.js-button').hasClass('is-empty')).toBeFalsy();
    expect(this.listView.hide).toHaveBeenCalled();
  });

  it('should open list view if "button" is clicked', () => {
    spyOn(this.listView, 'toggle');
    this.view.$('.js-button').trigger('click');
    expect(this.listView.toggle).toHaveBeenCalled();
  });

  it('should destroy custom list when element is removed', () => {
    spyOn(this.view._listView, 'clean');
    this.view.remove();
    expect(this.view._listView.clean).toHaveBeenCalled();
  });

  afterEach(() => {
    this.view.remove();
  });
});
