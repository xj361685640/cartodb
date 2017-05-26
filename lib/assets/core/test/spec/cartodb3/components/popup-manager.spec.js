var CoreView = require('backbone/core-view');
var PopupManager = require('../../../../javascripts/cartodb3/components/popup-manager');

describe('components/popup-manager', () => {
  beforeEach(() => {
    this.ref = new CoreView({
      className: 'dom-reference'
    });

    this.dialog = new CoreView({
      className: 'dom-dialog'
    });

    this.popupManager = new PopupManager('foo', this.ref.$el, this.dialog.$el);
  });

  afterEach(() => {
    this.popupManager.destroy();
  });

  it('append nested', () => {
    this.popupManager.append('nested');
    expect(this.ref.el.contains(this.dialog.el)).toBe(true);
    expect(document.querySelectorAll('body > [data-dialog]').length).toBe(0);
  });

  it('append float', () => {
    this.popupManager.append('float');
    expect(this.ref.el.contains(this.dialog.el)).toBe(false);
    expect(document.querySelectorAll('body > [data-dialog]').length).toBe(1);
  });

  it('track nested', () => {
    spyOn(this.popupManager, 'reposition');
    this.popupManager.append('nested');

    this.popupManager.track();
    expect(this.popupManager.emitter).toBeFalsy();
    expect(this.popupManager.reposition).not.toHaveBeenCalled();
  });

  it('track float', () => {
    spyOn(this.popupManager, 'reposition');
    this.popupManager.append('float');

    this.popupManager.track();
    expect(this.popupManager.emitter).toBeTruthy();
    expect(this.popupManager.reposition).toHaveBeenCalled();
  });

  it('destroy', () => {
    spyOn(this.popupManager, 'untrack').and.callThrough();

    this.popupManager.append('float');
    this.popupManager.destroy();

    expect(this.popupManager.untrack).toHaveBeenCalled();
    expect(document.querySelectorAll('body > [data-dialog]').length).toBe(0);
  });
});
