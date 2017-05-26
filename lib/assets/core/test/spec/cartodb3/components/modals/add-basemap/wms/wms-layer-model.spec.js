var LayersCollection = require('../../../../../../../javascripts/cartodb3/components/modals/add-basemap/wms/wms-layers-collection');
var CustomBaselayerModel = require('../../../../../../../javascripts/cartodb3/data/custom-baselayer-model');
var WMSService = require('../../../../../../../javascripts/cartodb3/data/wms-service');

describe('editor/components/modals/add-basemap/wms/wms-layer-model', () => {
  beforeEach(() => {
    this.wmsService = new WMSService();
    this.wmsLayersCollection = new LayersCollection(null, {
      wmsService: this.wmsService
    });

    this.wmsLayersCollection.reset([{}]);

    this.model = this.wmsLayersCollection.at(0);
  });

  it('should have idle state by default', () => {
    expect(this.model.get('state')).toEqual('idle');
  });

  describe('.createProxiedLayerOrCustomBaselayerModel', () => {
    beforeEach(() => {
      spyOn(this.model, 'save');
    });

    describe('when is a WMS resource', () => {
      beforeEach(() => {
        this.model.createProxiedLayerOrCustomBaselayerModel();
      });

      it('should change state to saving', () => {
        expect(this.model.get('state')).toEqual('saving');
      });

      it('should save the WMS model', () => {
        expect(this.model.save).toHaveBeenCalled();
      });

      describe('when save succeeds', () => {
        describe('when can create customBaselayerModel', () => {
          beforeEach(() => {
            this.customBaselayerModel = jest.createSpy('customBaselayerModel');
            spyOn(this.model, '_newProxiedBaselayerModel').and.returnValue(this.customBaselayerModel);
            this.model.save.calls.argsFor(0)[1].success();
          });

          it('should create a new tile layer', () => {
            expect(this.model.get('customBaselayerModel')).toBe(this.customBaselayerModel);
          });

          it('should set state to saveDone', () => {
            expect(this.model.get('state')).toEqual('saveDone');
          });
        });

        describe('when could not create customBaselayerModel', () => {
          beforeEach(() => {
            spyOn(this.model, '_newProxiedBaselayerModel').and.throwError('meh');
            this.model.save.calls.argsFor(0)[1].success();
          });

          it('should not have any customBaselayerModel set', () => {
            expect(this.model.get('customBaselayerModel')).toBeUndefined();
          });

          it('should set state to saveDone', () => {
            expect(this.model.get('state')).toEqual('saveFail');
          });
        });
      });

      describe('when save fails', () => {
        beforeEach(() => {
          this.model.save.calls.argsFor(0)[1].error();
        });

        it('should set state to saveFail', () => {
          expect(this.model.get('state')).toEqual('saveFail');
        });
      });
    });

    describe('when is a WMTS resource with unsupported matrix set (e.g. GoogleMapsCompatible)', () => {
      beforeEach(() => {
        this.model.set({
          type: 'wmts',
          url_template: 'http://foo.com/bar/%%(z)s/%%(x)s/%%(y)s.png',
          matrix_sets: ['GoogleMapsCompatible']
        });
        spyOn(this.model, '_byCustomURL').and.callThrough();
        this.model.createProxiedLayerOrCustomBaselayerModel();
      });

      it('should create the tile layer with a proper XYZ URL', () => {
        expect(this.model._byCustomURL).toHaveBeenCalled();
        expect(this.model._byCustomURL.calls.argsFor(0)[0]).toEqual('http://foo.com/bar/{z}/{x}/{y}.png');
      });

      it('should return a tile layer directly instead', () => {
        expect(this.model.get('customBaselayerModel') instanceof CustomBaselayerModel).toBeTruthy();
      });

      it('should set saveDone', () => {
        expect(this.model.get('state')).toEqual('saveDone');
      });
    });
  });

  describe('._newProxiedBaselayerModel', () => {
    it('should throw an error unless mapproxy id is present', () => {
      expect(() => {
        this.model._newProxiedBaselayerModel();
      }).toThrowError();
    });

    describe('when mapproxy id is present', () => {
      beforeEach(() => {
        this.model.set({
          mapproxy_id: 'abc123',
          attribution: 'attribution',
          name: 'tilelayer test',
          bounding_boxes: [1, 2, 3, 4]
        });
        this.proxiedBaselayerModel = this.model._newProxiedBaselayerModel();
      });

      it('should return a tilelayer object', () => {
        expect(this.proxiedBaselayerModel).toEqual(jest.any(CustomBaselayerModel));
      });

      it('should should have expected attrs on returned object', () => {
        expect(this.proxiedBaselayerModel.get('urlTemplate')).toMatch('/abc123/wmts/');
        expect(this.proxiedBaselayerModel.get('attribution')).toEqual('attribution');
        expect(this.proxiedBaselayerModel.get('maxZoom')).toEqual(21);
        expect(this.proxiedBaselayerModel.get('minZoom')).toEqual(0);
        expect(this.proxiedBaselayerModel.get('name')).toEqual('tilelayer test');
        expect(this.proxiedBaselayerModel.get('proxy')).toBeTruthy();
        expect(this.proxiedBaselayerModel.get('bounding_boxes')).toEqual([1, 2, 3, 4]);
      });
    });
  });
});
