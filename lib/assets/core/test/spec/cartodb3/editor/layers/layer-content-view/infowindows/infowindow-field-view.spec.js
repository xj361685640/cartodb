var ConfigModel = require('../../../../../../../javascripts/cartodb3/data/config-model');
var InfowindowFieldView = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/infowindow/infowindow-field-view');
var InfowindowDefinitionModel = require('../../../../../../../javascripts/cartodb3/data/infowindow-definition-model');
var $ = require('jquery');

describe('editor/layers/layer-content-view/infowindows/infowindow-field-view', () => {
  var view, model;

  beforeEach(() => {
    this.configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    model = new InfowindowDefinitionModel({}, {
      configModel: this.configModel
    });

    view = new InfowindowFieldView({
      layerInfowindowModel: model,
      field: { name: 'name1', title: true },
      position: 0
    });
  });

  it('should toggle check', () => {
    view.render();
    model.addField('name1');
    expect(!!$(view.$el.find('.js-checkbox')).attr('checked')).toEqual(true);
    model.removeField('name1');
    expect(!!$(view.$el.find('.js-checkbox')).attr('checked')).toEqual(false);
  });

  it('should toggle field on click', () => {
    view.render();
    model.addField('name1');
    expect(model.containsField('name1')).toEqual(true);
    view.toggle();
    expect(model.containsField('name1')).toEqual(false);
  });

  it('should set empty alternative name after uncheck', () => {
    view.render();
    model.addField('name1');
    model.setAlternativeName('name1', 'nombre');
    expect(model.getAlternativeName('name1')).toEqual('nombre');
    view.toggle();
    expect(model.getAlternativeName('name1')).toEqual('');
  });

  it('should not have any leaks', () => {
    expect(view).toHaveNoLeaks();
  });
});

