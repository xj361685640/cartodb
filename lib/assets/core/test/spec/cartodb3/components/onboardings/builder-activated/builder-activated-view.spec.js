var ConfigModel = require('../../../../../../javascripts/cartodb3/data/config-model');
var BuilderActivatedNotificationView = require('../../../../../../javascripts/cartodb3/components/onboardings/builder-activated/builder-activated-notification-view');
var UserNotifications = require('../../../../../../javascripts/cartodb3/data/user-notifications');

describe('components/onboardings/builder-activated/builder-activated-view', () => {
  beforeEach(() => {
    jest.Ajax.install();
    jest.Ajax.stubRequest(new RegExp('^http(s)?.*notifications/dashboard.*'))
      .andReturn({ status: 200 });

    var configModel = new ConfigModel({
      base_url: '/u/marieta'
    });

    this._builderActivatedNotification = new UserNotifications({}, {
      key: 'dashboard',
      configModel: configModel
    });

    this.view = new BuilderActivatedNotificationView({
      builderActivatedNotification: this._builderActivatedNotification
    });

    this.view.render();
  });

  afterEach(() => {
    jest.Ajax.uninstall();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render template', () => {
    expect(this.view.$el.html()).toContain('onboardingNotification');
  });

  it('should save notification when js-close is clicked', () => {
    this.view.$('.js-close').click();
    expect(this._builderActivatedNotification.get('notifications').builder_activated).toBe(true);
  });
});
