var ModalViewModel = require('../../../../../javascripts/cartodb3/components/modals/modal-view-model');

describe('components/modals/modal-view-model', () => {
  beforeEach(() => {
    this.createContentViewResult = {};
    this.createContentView = jest.createSpy('createContentView').and.returnValue(this.createContentViewResult);
    this.model = new ModalViewModel({
      createContentView: this.createContentView
    });
  });

  it('should allow show/hide modal', () => {
    expect(this.model.get('show')).toBe(true);
    expect(this.model.isHidden()).toBe(false);

    this.model.hide();
    expect(this.model.get('show')).toBe(false);
    expect(this.model.isHidden()).toBe(true);

    this.model.show();
    expect(this.model.get('show')).toBe(true);
    expect(this.model.isHidden()).toBe(false);
  });

  describe('.createContentView', () => {
    beforeEach(() => {
      this.view = this.model.createContentView();
    });

    it('should create content view given viewModel', () => {
      expect(this.createContentView).toHaveBeenCalled();
      expect(this.createContentView).toHaveBeenCalledWith(this.model);
    });

    it('should return created view', () => {
      expect(this.view).toBe(this.createContentViewResult);
    });
  });

  describe('.destroy', () => {
    beforeEach(() => {
      this.destroySpy = jest.createSpy('onDestroy');
      this.model.on('destroy', this.destroySpy);
      this.model.destroy('arg1', 'arg2', 'arg3');
    });

    it('should destroy the model', () => {
      expect(this.destroySpy).toHaveBeenCalled();
    });

    it('should pass through any arguments to listener', () => {
      var args = this.destroySpy.calls.argsFor(0);
      expect(args[0]).toEqual('arg1');
      expect(args[1]).toEqual('arg2');
      expect(args[2]).toEqual('arg3');
    });
  });
});
