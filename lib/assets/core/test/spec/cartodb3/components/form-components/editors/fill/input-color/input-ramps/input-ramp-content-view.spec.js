var Backbone = require('backbone');
var InputRampContentView = require('../../../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/input-color/input-ramps/input-ramp-content-view');

describe('components/form-components/editors/fill/input-color/input-ramps/input-ramp-content-view', () => {
  function createView (opacity) {
    this.model = new Backbone.Model({
      range: ['#c0ffee', '#bada55', '#decade'],
      opacity: opacity
    });
    return new InputRampContentView({ model: this.model });
  }

  describe('._createColorPickerView', () => {
    it('should return picker view with default opacity if no one is provided', () => {
      var view = createView();
      var pickerView = view._createColorPickerView();

      expect(pickerView.model.get('opacity')).toEqual(1);
    });

    it('should return picker view with the provided opacity', () => {
      var view = createView(0.43);
      var pickerView = view._createColorPickerView();

      expect(pickerView.model.get('opacity')).toEqual(0.43);
    });

    it('should update own opacity when picker view updates its', () => {
      var view = createView(0.43);
      var pickerView = view._createColorPickerView();

      pickerView.model.set('opacity', 0.84);

      expect(view.model.get('opacity')).toEqual(0.84);
    });

    it('should not have leaks', () => {
      var view = createView(0.43);
      expect(view).toHaveNoLeaks();
    });
  });
});
