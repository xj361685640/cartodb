var $ = require('jquery');
var ModalConfirmationView = require('../../../../../javascripts/cartodb3/components/modals/confirmation/modal-confirmation-view');
var templateExample = require('../../../../../javascripts/cartodb3/components/table/head/modals-templates/rename-table-column.tpl');

var simulateENTERKeyPress = () => {
  var e = $.Event('keydown');
  e.keyCode = e.which = $.ui.keyCode.ENTER;
  $(document).trigger(e);
};

describe('components/modals/modal-confirmation-view', () => {
  beforeEach(() => {
    this.view = new ModalConfirmationView({
      modalModel: {},
      template: templateExample,
      loadingTitle: 'loading-title',
      renderOpts: {
        columnName: 'pepito',
        newName: 'pepita'
      },
      runAction: () => {}
    });
    this.view.render();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  describe('binds', () => {
    it('should render loading view when ok button is clicked', () => {
      spyOn(this.view, '_renderLoadingView');
      this.view.$('.js-confirm').click();
      expect(this.view._renderLoadingView).toHaveBeenCalled();
    });

    it('should runAction when ENTER is pressed', () => {
      spyOn(this.view, '_runAction');
      simulateENTERKeyPress();
      expect(this.view._runAction).toHaveBeenCalled();
    });

    it('should disable ENTER binding when is disabled', () => {
      spyOn(this.view, '_runAction');
      this.view._disableBinds();
      simulateENTERKeyPress();
      expect(this.view._runAction).not.toHaveBeenCalled();
    });
  });

  it('should have .js-confirm and .js-cancel present in the template', () => {
    expect(this.view.$('.js-confirm').length).toBe(1);
    expect(this.view.$('.js-cancel').length).toBe(1);
  });

  afterEach(() => {
    this.view.clean();
  });
});
