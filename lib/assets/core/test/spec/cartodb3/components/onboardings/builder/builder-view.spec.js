var Backbone = require('backbone');
var ConfigModel = require('../../../../../../javascripts/cartodb3/data/config-model');
var BuilderView = require('../../../../../../javascripts/cartodb3/components/onboardings/builder/builder-view');
var UserNotifications = require('../../../../../../javascripts/cartodb3/data/user-notifications');

describe('components/onboardings/builder/builder-view', () => {
  var configModel = new ConfigModel({
    base_url: '/u/pepe'
  });

  beforeEach(() => {
    jest.Ajax.install();
    jest.Ajax.stubRequest(new RegExp('http(s)?://(.*)/builder'))
      .andReturn({ status: 200 });

    this.editorModel = new Backbone.Model();
    this._userModel = new Backbone.Model({
      username: 'pepe'
    });

    this._onboardingNotification = new UserNotifications({}, {
      key: 'builder',
      configModel: configModel
    });

    this.view = new BuilderView({
      editorModel: this.editorModel,
      userModel: this._userModel,
      onboardingNotification: this._onboardingNotification
    });
    this.view.render();
  });

  afterEach(() => {
    jest.Ajax.uninstall();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render dialog classes', () => {
    expect(this.view.$el.html()).toContain('BuilderOnboarding');
  });

  it('should trigger close event', () => {
    var close = false;

    this.view.bind('close', () => {
      close = true;
    }, this);

    this.view.$('.js-close').click();

    expect(close).toBe(true);
  });

  it('should allow to navigate between states', () => {
    expect(this.view.model.get('step')).toBe(0);

    this.view.$('.js-start').click();
    expect(this.view.model.get('step')).toBe(1);

    this.view.$('.js-next').click();
    expect(this.view.model.get('step')).toBe(2);

    this.view.$('.js-next').click();
    expect(this.view.model.get('step')).toBe(3);

    this.view.$('.js-next').click();
    expect(this.view.model.get('step')).toBe(4);

    this.view.$('.js-next').click();
    expect(this.view.model.get('step')).toBe(4); // don't go beyond step #4
  });

  it('should respond to edition event', () => {
    this.editorModel.set({edition: true});
    expect(this.view.$el.hasClass('is-editing')).toBe(true);
  });

  it('should store view status', () => {
    this.view.$('.js-forget').click();
    this.view.$('.js-close').click();

    expect(this._onboardingNotification.get('notifications').onboarding).toBe(true);
  });

  describe('._currentStep', () => {
    it('should get the current step', () => {
      expect(this.view._currentStep()).toBe(0);

      this.view.model.set('step', 1);

      expect(this.view.model.get('step')).toBe(1);
      expect(this.view._currentStep()).toBe(this.view.model.get('step'));
    });
  });
});
