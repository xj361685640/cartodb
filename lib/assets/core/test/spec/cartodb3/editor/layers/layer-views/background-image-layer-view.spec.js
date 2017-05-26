var LayerDefinitionModel = require('../../../../../../javascripts/cartodb3/data/layer-definition-model');
var BackgroundImageLayerView = require('../../../../../../javascripts/cartodb3/editor/layers/layer-views/background-image-layer-view');

describe('editor/layers/layer-views/background-image-layer-view', () => {
  beforeEach(() => {
    this.model = new LayerDefinitionModel({
      name: 'thename',
      image: 'http://example.com/image.png?size=big'
    }, {
      configModel: {}
    });

    this.view = new BackgroundImageLayerView({
      model: this.model,
      stackLayoutModel: {}
    });

    this.view.render();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render title and description of layer', () => {
    expect(this.view.$el.text()).toContain('image.png');
    expect(this.view.$el.text()).toContain('editor.layers.image.title-label');
  });

  it('should render thumbnail image', () => {
    expect(this.view.$('img').attr('src')).toEqual('http://example.com/image.png?size=big');
  });
});
