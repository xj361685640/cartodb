var $ = require('jquery');
var Backbone = require('backbone');
var LayerAnalysisDraggableView = require('../../../../../javascripts/cartodb3/editor/layers/layer-analysis-draggable-view');

describe('editor/layers/layer-analysis-draggable-view', () => {
  beforeEach(() => {
    this.$nodeViewElement = $('div');
    spyOn(this.$nodeViewElement, 'draggable').and.callThrough();

    this.model = new Backbone.Model({
      id: 'a1',
      type: 'buffer'
    });

    this.view = new LayerAnalysisDraggableView({
      model: this.model,
      getNextLetter: () => { return 'b'; },
      sortableSelector: '.js-layers',
      $nodeViewElement: this.$nodeViewElement
    });
    this.view.render();
  });

  afterEach(() => {
    this.$nodeViewElement = null;
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  describe('should initialize draggable for given nodeView element', () => {
    beforeEach(() => {
      expect(this.$nodeViewElement.draggable).toHaveBeenCalled();
      expect(this.$nodeViewElement.data('ui-draggable')).toBeDefined();
      this.draggableArgs = this.$nodeViewElement.draggable.calls.argsFor(0)[0];
    });

    it('should connect draggable item to layers sortable list', () => {
      expect(this.draggableArgs.connectToSortable).toEqual('.js-layers');
      expect(this.draggableArgs.appendTo).toEqual('.js-layers');
    });

    describe('when dragged', () => {
      beforeEach(() => {
        // simulate dragging
        this.html = this.draggableArgs.helper();
      });

      it('should create a helper HTML, previewing a new layer', () => {
        expect(this.html).toEqual(jest.any(String));
        expect(this.html).toContain('Layer');
        expect(this.html).toContain('>b<', 'should have the next-letter representation');
        expect(this.html).toContain('"a1"', 'should have the node-id the new layer will be based on');
        expect(this.html).toContain('area-of-influence'); // title of a buffer type
      });
    });
  });

  describe('.clean', () => {
    beforeEach(() => {
      this.view.clean();
    });

    it('should remove draggable behavior from element', () => {
      expect(this.$nodeViewElement.data('ui-draggable')).toBeUndefined();
    });

    it('should remove reference to DOM element', () => {
      expect(this.view.options.$nodeViewElement).toBe(null);
    });
  });
});
