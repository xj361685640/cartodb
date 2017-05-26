var _ = require('underscore');
var CodeMirror = require('codemirror');
require('../../../../../javascripts/cartodb3/components/code-mirror/cartocss.code-mirror')(CodeMirror);
var ColorpickerView = require('../../../../../javascripts/cartodb3/components/code-mirror/colorpicker.code-mirror');
var Pos = CodeMirror.Pos;

function fireMouseEvent (obj, evtName) {
  var event = document.createEvent('MouseEvents');
  event.initMouseEvent(evtName, true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  obj.dispatchEvent(event);
}

describe('components/code-mirror/colorpicker.code-view', () => {
  beforeEach(() => {
    spyOn(_, 'debounce').and.callFake(function (func) {
      return () => {
        func.apply(this, arguments);
      };
    });

    jest.clock().install();

    this.editor = CodeMirror(document.body, {
      mode: 'cartocss',
      theme: 'material'
    });

    this.view = new ColorpickerView({
      editor: this.editor
    });

    spyOn(this.view, '_createPicker');

    this.view.render();
    document.body.appendChild(this.view.el);
  });

  afterEach(() => {
    jest.clock().uninstall();

    var el = this.editor.getWrapperElement();
    el.parentNode.removeChild(el);

    var parent = this.view.el.parentNode;
    parent && parent.removeChild(this.view.el);
    this.view.remove();
  });

  it('should update colors on editor update', () => {
    this.editor.setValue('#foo{marker-fill: #fabada;}');

    expect(document.querySelector('.cm-color')).toBeTruthy();
    expect(document.querySelector('.cm-color').style.borderBottom).toBe('1px solid rgb(250, 186, 218)');
  });

  it('should show colorpicker on click', () => {
    this.editor.setValue('#foo{marker-fill: #fabada;}');
    fireMouseEvent(this.editor.display.scroller, 'mousedown');
    // The cursor is put on top of the color artificially
    this.editor.setCursor(Pos(0, 21));
    jest.clock().tick(60);

    expect(this.view._createPicker).toHaveBeenCalled();
  });

  it('should update color', () => {
    this.editor.replaceRange('#fbdaaa', {line: 0, ch: 18}, {line: 0, ch: 22});
    jest.clock().tick(400);

    expect(document.querySelector('.cm-color').textContent).toBe('#fbdaaa');
    expect(document.querySelector('.cm-color').style.borderBottom).toBe('1px solid rgb(251, 218, 170)');
  });

  it('should not have any leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
