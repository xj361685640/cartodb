var Backbone = require('backbone');
var OnboardingLauncher = require('../../../../../../javascripts/cartodb3/components/onboardings/generic/generic-onboarding-launcher');
var OnboardingsServiceModel = require('../../../../../../javascripts/cartodb3/components/onboardings/onboardings-service-model');

describe('components/onboardings/generic/generic-onboarding-launcher', () => {
  describe('constructor', () => {
    function testConstructorFn (launcherOpts, viewOpts) {
      return function wrappedConstructor () {
        new OnboardingLauncher(launcherOpts, viewOpts); // eslint-disable-line
      };
    }

    var testConstructor = testConstructorFn.bind(this);

    it('should fail if no mandatory options are provided', () => {
      var constructor = testConstructor();
      expect(constructor).toThrowError('view is required');

      constructor = testConstructor({
        view: {}
      });
      expect(constructor).toThrowError('onboardingNotification is required');

      constructor = testConstructor({
        view: {},
        onboardingNotification: {}
      });
      expect(constructor).toThrowError('notificationKey is required');

      constructor = testConstructor({
        view: {},
        onboardingNotification: {},
        notificationKey: {}
      });
      expect(constructor).toThrowError('onboardings is required');

      constructor = testConstructor({
        view: {},
        onboardingNotification: {},
        notificationKey: {},
        onboardings: {}
      });
      expect(constructor).toThrowError('viewOpts is required');

      constructor = testConstructor({
        view: {},
        onboardingNotification: {},
        notificationKey: {},
        onboardings: {}
      }, {});
    });
  });

  describe('launch', () => {
    it('should do nothing if onboarding has been skipped', () => {
      var onboardingNotification = {
        getKey: () => { return true; }
      };
      var onboardings = jest.createSpyObj('onboardings', ['create']);
      var launcher = new OnboardingLauncher({
        view: {},
        onboardingNotification: onboardingNotification,
        notificationKey: {},
        onboardings: onboardings
      }, {});

      launcher.launch();

      expect(onboardings.create).not.toHaveBeenCalled();
    });

    it('should return view with proper arguments if onboarding is active', () => {
      // Arrange
      var onboardingNotification = {
        getKey: () => { return false; }
      };
      var notificationKey = 'a notification key';
      var fakeView = Backbone.View;
      var onboardings = new OnboardingsServiceModel();
      var launcher = new OnboardingLauncher({
        view: fakeView,
        onboardingNotification: onboardingNotification,
        notificationKey: notificationKey,
        onboardings: onboardings
      }, {});

      // Act
      launcher.launch();

      // Assert
      expect(onboardings._onboardingView).toBeDefined();

      // Cleaning
      onboardings._onboardingView.remove();
      onboardings.destroy();
    });
  });
});
