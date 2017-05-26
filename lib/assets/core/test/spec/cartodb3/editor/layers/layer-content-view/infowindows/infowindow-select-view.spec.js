var InfowindowSelectView = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/infowindow/infowindow-select-view.js');
var InfowindowDefinitionModel = require('../../../../../../../javascripts/cartodb3/data/infowindow-definition-model');
var ConfigModel = require('../../../../../../../javascripts/cartodb3/data/config-model');
var CarouselCollection = require('../../../../../../../javascripts/cartodb3/components/custom-carousel/custom-carousel-collection');
var _ = require('underscore');

describe('editor/layers/layer-content-view/infowindows/infowindow-select-view', () => {
  var view, model;

  beforeEach(() => {
    this.configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    model = new InfowindowDefinitionModel({
      template_name: 'test1'
    }, {
      configModel: this.configModel
    });

    var templates = [
      {
        value: '',
        label: 'None'
      }, {
        value: 'test1',
        label: 'Test1'
      }
    ];

    var collection = new CarouselCollection(
      _.map(templates, function (template) {
        return {
          selected: model.get('template_name') === template.value,
          val: template.value,
          label: template.label,
          template: () => {
            return template.label;
          }
        };
      }, this)
    );

    view = new InfowindowSelectView({
      model: model,
      templatesCollection: collection
    });
  });

  it('should select template if there is match', () => {
    view.render();
    var s = view._templatesCollection.find(function (mdl) { return mdl.get('selected'); });
    expect(s.get('val')).toEqual('test1');
    expect(s.get('label')).toEqual('Test1');
  });

  it("should select 'None' if there is no match", () => {
    view.model.set('template_name', 'none');
    view.render();
    var s = view._templatesCollection.find(function (mdl) { return mdl.get('selected'); });
    expect(s.get('val')).toEqual('');
    expect(s.get('label')).toEqual('None');
  });

  it('should not have any leaks', () => {
    expect(view).toHaveNoLeaks();
  });

  afterEach(() => {
    view.clean();
  });
});

