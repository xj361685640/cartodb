var InputAssetPickerView = require('../../../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/input-color/assets-picker/input-asset-picker-view');
var UserModel = require('../../../../../../../../../javascripts/cartodb3/data/user-model');
var ConfigModel = require('../../../../../../../../../javascripts/cartodb3/data/config-model');
var FactoryModals = require('../../../../../../factories/modals');
var Backbone = require('backbone');

describe('components/form-components/editors/fill/input-color/assets-picker/input-asset-picker-view', () => {
  beforeEach(() => {
    this.userModel = new UserModel({
      username: 'pepe'
    }, {
      configModel: 'c'
    });

    this.configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    this.model = new Backbone.Model({
      ramp: [{
        color: '#FABADA',
        title: 'hola',
        image: 'http://www.image.com/image.jpg'
      }]
    });

    this.view = new InputAssetPickerView({
      index: 0,
      ramp: [{
        color: '#FABADA',
        title: 'hola',
        image: 'http://www.image.com/image.jpg'
      }],
      userModel: this.userModel,
      configModel: this.configModel,
      modals: FactoryModals.createModalService()
    });

    this.view.render();
  });

  describe('render', () => {
    it('should render _headerView', () => {
      expect(this.view._headerView).toBeDefined();
    });

    it('should render _assetPicker', () => {
      expect(this.view._assetPicker).toBeDefined();
    });
  });

  describe('._getRampItem', () => {
    it('should return ramp item element', () => {
      var item = this.view._getRampItem();
      expect(item.color).toBe('#FABADA');
    });
  });

  describe('._onChangeImage', () => {
    it('should trigger change:image on view and model', () => {
      this.view._onChangeImage({ url: 'new_image' });

      expect(this.view.options.ramp[0].image).toBe('new_image');
      expect(this.view.model.get('ramp')[0].image).toBe('new_image');
    });
  });

  describe('._onClickBack', () => {
    it('should trigger back function', () => {
      var isBack;

      this.view._headerView.bind('back', () => {
        isBack = true;
      }, this);

      this.view._headerView.$('.js-back').click();
      expect(isBack).toBeTruthy();
    });
  });

  describe('._onGoToColorPicker', () => {
    it('should trigger goToColorPicker function', () => {
      var isInColorPicker;

      this.view._headerView.bind('goToColorPicker', () => {
        isInColorPicker = true;
      }, this);

      this.view._headerView.$('.js-colorPicker').click();
      expect(isInColorPicker).toBeTruthy();
    });
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.clean();
  });
});
