var CoreView = require('backbone/core-view');
var OnboardingsServiceModel = require('../../../../../javascripts/cartodb3/components/onboardings/onboardings-service-model');

describe('components/onboardings/onboardings-service-model', () => {
  beforeEach(() => {
    this.onboardings = new OnboardingsServiceModel();
    this.willCreateOnboardingSpy = jest.createSpy('willCreateOnboarding');
    this.didCreateOnboardingSpy = jest.createSpy('didCreateOnboarding');
    this.onboardings.on('willCreateOnboarding', this.willCreateOnboardingSpy);
    this.onboardings.on('didCreateOnboarding', this.didCreateOnboardingSpy);
  });

  describe('.create', () => {
    var contentView, contentView2;

    beforeEach(() => {
      spyOn(document.body, 'appendChild');

      contentView = new CoreView();
      spyOn(contentView, 'render').and.callThrough();

      this.modalView = this.onboardings.create(() => {
        return contentView;
      });
    });

    it('should return a modal view', () => {
      expect(this.modalView).toBeDefined();
    });

    it('should trigger a willCreateOnboarding event', () => {
      expect(this.willCreateOnboardingSpy).toHaveBeenCalled();
    });

    it('should trigger a didCreateOnboarding event', () => {
      expect(this.didCreateOnboardingSpy).toHaveBeenCalled();
    });

    it('should render the content view', () => {
      expect(contentView.render).toHaveBeenCalled();
    });

    it('should append the modal to the body', () => {
      expect(document.body.appendChild).toHaveBeenCalledWith(this.modalView.el);
    });

    it('should add the special body class', () => {
      expect(document.body.className).toContain('is-inDialog');
    });

    describe('subsequent calls', () => {
      beforeEach(() => {
        contentView2 = new CoreView();
        spyOn(contentView2, 'render').and.callThrough();

        this.modalView2 = this.onboardings.create(() => {
          return contentView2;
        });
      });

      it('should reuse modal view', () => {
        expect(this.modalView2).toBe(this.modalView);
      });

      it('should append the new modal to the body', () => {
        expect(document.body.appendChild).toHaveBeenCalledWith(this.modalView2.el);
      });

      it('should keep the special body class', () => {
        expect(document.body.className).toContain('is-inDialog');
      });

      describe('when destroyed', () => {
        beforeEach(() => {
          jest.clock().install();
          this.destroyOnceSpy = jest.createSpy('destroyedOnboarding');
          this.onboardings.onDestroyOnce(this.destroyOnceSpy);
          spyOn(this.modalView2, 'clean').and.callThrough();
          this.modalView2.destroy();
        });

        afterEach(() => {
          jest.clock().uninstall();
        });

        it('should not clean the view right away but wait until after animation', () => {
          expect(this.modalView2.clean).not.toHaveBeenCalled();
        });

        it('should have closing animation', () => {
          expect(this.modalView2.el.className).toContain('is-closing');
          expect(this.modalView2.el.className).not.toContain('is-opening');
        });

        it('should remove the special body class', () => {
          expect(document.body.className).not.toContain('is-inDialog');
        });

        describe('when close animation is done', () => {
          beforeEach(() => {
            jest.clock().tick(250);
          });

          it('should have cleaned the view', () => {
            expect(this.modalView2.clean).toHaveBeenCalled();
          });

          it('should have triggered listener', () => {
            expect(this.destroyOnceSpy).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
