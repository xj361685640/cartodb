var CustomBaselayerModel = require('../../../../javascripts/cartodb3/data/custom-baselayer-model');

describe('data/custom-baselayer-model', () => {
  describe('.validateTemplateURL', () => {
    beforeEach(() => {
      var self = this;
      this.img = jest.createSpy('Image');
      spyOn(window, 'Image').and.callFake(() => {
        return self.img;
      });
      this.layer = {
        visible: true,
        type: 'Tiled',
        urlTemplate: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
        attribution: null,
        maxZoom: 21,
        minZoom: 0,
        name: 'Custom basemap 1',
        tms: false,
        className: 'httpsstamentilessasslfastlynetwatercolorzxyjpg',
        id: 'custom-basemap-1',
        selected: false,
        order: 1
      };
      this.model = new CustomBaselayerModel(this.layer);
      this.successSpy = jest.createSpy('success');
      this.errorSpy = jest.createSpy('error');
      this.model.validateTemplateURL({
        success: this.successSpy,
        error: this.errorSpy
      });
    });

    it('should check a base tile', () => {
      expect(this.img.src).toMatch('https:\/\/stamen-tiles-[a-d]\.a');
      expect(this.img.src).toContain('a.ssl.fastly.net/watercolor/0/0/0.jpg');
    });

    describe('when succeeds to validate template URL', () => {
      beforeEach(() => {
        this.img.onload();
      });

      it('should call success callback', () => {
        expect(this.successSpy).toHaveBeenCalled();
        expect(this.errorSpy).not.toHaveBeenCalled();
      });
    });

    describe('when failed to validate template URL', () => {
      beforeEach(() => {
        this.img.onerror();
      });

      it('should call error callback', () => {
        expect(this.successSpy).not.toHaveBeenCalled();
        expect(this.errorSpy).toHaveBeenCalled();
      });
    });

    describe('.toJSON', () => {
      it('should return the original data', () => {
        expect(this.model.toJSON()).toEqual({
          options: {
            visible: true,
            type: 'Tiled',
            urlTemplate: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
            attribution: null,
            maxZoom: 21,
            minZoom: 0,
            name: 'Custom basemap 1',
            tms: false,
            className: 'httpsstamentilessasslfastlynetwatercolorzxyjpg',
            selected: false
          },
          kind: 'tiled',
          order: 1,
          id: 'custom-basemap-1'
        });
      });
    });
  });
});
