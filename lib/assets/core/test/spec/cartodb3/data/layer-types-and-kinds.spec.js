var _ = require('underscore');
var layerTypesAndKinds = require('../../../../javascripts/cartodb3/data/layer-types-and-kinds');

describe('data/layer-types-and-kinds', () => {
  describe('.getKind', () => {
    it('should return the kind for a given type', () => {
      expect(layerTypesAndKinds.getKind('Tiled')).toEqual('tiled');
      expect(layerTypesAndKinds.getKind('CartoDB')).toEqual('carto');
      expect(layerTypesAndKinds.getKind('WMS')).toEqual('wms');
      expect(layerTypesAndKinds.getKind('Plain')).toEqual('background');
      expect(layerTypesAndKinds.getKind('GMapsBase')).toEqual('gmapsbase');
      expect(layerTypesAndKinds.getKind('torque')).toEqual('torque');
    });

    it('should throw exception when type is unknown', () => {
      expect(() => {
        layerTypesAndKinds.getKind(null);
      }).toThrow();
    });
  });

  describe('.getType', () => {
    it('should return the type for a given kind', () => {
      expect(layerTypesAndKinds.getType('tiled')).toEqual('Tiled');
      expect(layerTypesAndKinds.getType('carto')).toEqual('CartoDB');
      expect(layerTypesAndKinds.getType('wms')).toEqual('WMS');
      expect(layerTypesAndKinds.getType('background')).toEqual('Plain');
      expect(layerTypesAndKinds.getType('gmapsbase')).toEqual('GMapsBase');
      expect(layerTypesAndKinds.getType('torque')).toEqual('torque');
    });

    it('should throw exception when kind is unknown', () => {
      expect(() => {
        layerTypesAndKinds.getType(null);
      }).toThrow();
    });
  });

  describe('.isKindDataLayer', () => {
    it('should return true if matching', () => {
      expect(layerTypesAndKinds.isKindDataLayer('carto')).toBe(true);
      expect(layerTypesAndKinds.isKindDataLayer('torque')).toBe(true);

      expect(layerTypesAndKinds.isKindDataLayer('tiled')).toBe(false);
      expect(layerTypesAndKinds.isKindDataLayer('cartooo')).toBe(false);
    });
  });

  _.each({
    'isCartoDBType': 'CartoDB',
    'isTiledType': 'Tiled',
    'isTorqueType': 'torque',
    'isPlainType': 'Plain'
  }, function (type, method) {
    describe('.' + method, () => {
      it('should return true if type is "' + type + '"', () => {
        expect(layerTypesAndKinds[method](type)).toBe(true);
      });

      it('should return false when given a different type', () => {
        expect(layerTypesAndKinds[method]('invalid type')).toBe(false);
      });
    });
  });
});
