var _ = require('underscore');
var Backbone = require('backbone');
var widgetsTypes = require('../../../../../../javascripts/cartodb3/components/modals/add-widgets/widgets-types');
var TimeSeriesNoneOptionModel = require('../../../../../../javascripts/cartodb3/components/modals/add-widgets/time-series/time-series-none-option-model');

describe('components/modals/add-widgets/widgets-types', () => {
  describe('all items', () => {
    it('should have a type prop', () => {
      widgetsTypes.forEach(function (d) {
        expect(d.type).toMatch(/\w+/);
      });
    });

    it('should have a createTabPaneItem method', () => {
      widgetsTypes.forEach(function (d) {
        expect(d.createTabPaneItem).toEqual(jest.any(Function));
      });
    });
  });

  describe('times-series', () => {
    beforeEach(() => {
      this.d = _.find(widgetsTypes, function (d) {
        return d.type === 'time-series';
      });
    });

    describe('.createOptionModels', () => {
      it('should always create a none-option even if there are no tuples items', () => {
        var widgetDefinitionsCollection = new Backbone.Collection();
        var models = this.d.createOptionModels([], widgetDefinitionsCollection);
        expect(models.length).toEqual(1);
        expect(models[0]).toEqual(jest.any(TimeSeriesNoneOptionModel));
      });
    });
  });
});
