var FillDialogModel = require('../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/fill-dialog-model');
var FillDialogView = require('../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/fill-dialog');

describe('components/form-components/editors/fill/fill-dialog', () => {
  beforeEach(() => {
    this.model = new FillDialogModel({
    });

    this.view = new FillDialogView(({
      model: this.model
    }));
    this.view.render();
  });

  it('should get rendered', () => {
    // TODO
  });

  afterEach(() => {
    this.view.remove();
  });
});
