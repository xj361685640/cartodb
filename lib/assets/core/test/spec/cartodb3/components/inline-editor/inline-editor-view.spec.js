var InlineEditorView = require('../../../../../javascripts/cartodb3/components/inline-editor/inline-editor-view');
var template = require('../../../../../javascripts/cartodb3/editor/inline-editor.tpl');

describe('components/inline-editor/inline-editor-view', () => {
  var view;
  var onEdit;
  var onClick;

  beforeEach(() => {
    jest.clock().install();

    onEdit = jest.createSpy('onEdit');
    onClick = jest.createSpy('onClick');

    view = new InlineEditorView({
      template: template,
      onEdit: onEdit,
      onClick: onClick,
      renderOptions: {
        name: 'Foo'
      }
    });

    view.render();
  });

  afterEach(() => {
    view.remove();
    jest.clock().uninstall();
  });

  it('should render properly', () => {
    expect(view.$('.js-input').length).toBe(1);
    expect(view.$('.js-title').length).toBe(1);
  });

  it('should responde to double click', () => {
    view.$el.appendTo(document.body);
    view.$('.js-input').hide(); // to simulate the css class
    expect(view.$('.js-input').prop('readonly')).toBe(true);
    view.$('.js-title').trigger('click');
    view.$('.js-title').trigger('click');
    jest.clock().tick(201);
    expect(view.$('.js-input').is(':visible')).toBe(true);
    expect(view.$('.js-input').prop('readonly')).toBe(false);
  });

  it('should responde to single click', () => {
    view.$('.js-title').trigger('click');
    jest.clock().tick(201);
    expect(onClick).toHaveBeenCalled();
  });

  it('should not respond click if not passed as option', () => {
    var view2 = new InlineEditorView({
      template: template,
      onEdit: onEdit,
      renderOptions: {
        name: 'Foo'
      }
    });
    spyOn(view2, '_onClickHandler').and.callThrough();

    view2.render();
    view2.$('.js-title').trigger('click');
    jest.clock().tick(201);
    expect(view2._onClickHandler).not.toHaveBeenCalled();

    view2.remove();
  });

  it('.getValue', () => {
    view = new InlineEditorView({
      template: template,
      onEdit: onEdit,
      onClick: onClick,
      renderOptions: {
        name: '<img src="http://emojipedia-us.s3.amazonaws.com/cache/b8/b4/b8b4e86a110557e6b6d666c9cf6d6cc8.png" />'
      }
    });
    view.render();

    var value = view.getValue();

    expect(value).toEqual('<img>');
    view.remove();
  });

  it('should not have any leaks', () => {
    expect(view).toHaveNoLeaks();
  });
});
