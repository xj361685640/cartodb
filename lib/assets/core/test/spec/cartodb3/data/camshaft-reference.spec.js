var _ = require('underscore');
var camshaftReference = require('../../../../javascripts/cartodb3/data/camshaft-reference');

describe('cartodb3/data/camshaft-reference', () => {
  describe('.getSourceNamesForAnalysisType', () => {
    it('should return the source names for a given analyses type', () => {
      expect(camshaftReference.getSourceNamesForAnalysisType('source')).toEqual([]);
      expect(camshaftReference.getSourceNamesForAnalysisType('intersection')).toEqual(['source', 'target']);
      expect(camshaftReference.getSourceNamesForAnalysisType('trade-area')).toEqual(['source']);
    });
  });

  describe('.paramsForType', () => {
    it('should return the params for given type', () => {
      expect(camshaftReference.paramsForType('buffer')).toEqual({
        source: jest.any(Object),
        radius: jest.any(Object),
        isolines: jest.any(Object),
        dissolved: jest.any(Object)
      });
    });

    it('should throw error if there is no params for given type', () => {
      expect(() => { camshaftReference.paramsForType('foobar'); }).toThrowError(/type: foobar/);
      expect(() => { camshaftReference.paramsForType(); }).toThrowError(/type: undefined/);
    });
  });

  describe('.parse', () => {
    beforeEach(() => {
      this.validFormAttrs = {
        id: 'a1',
        source: ' a0 ',
        type: 'buffer',
        radius: '100',
        isolines: '2',
        dissolved: 'false'
      };
    });

    it('should return empty source', () => {
      expect(camshaftReference.parse(_.omit(this.validFormAttrs, 'source'))).toEqual({
        id: 'a1',
        source: '',
        type: 'buffer',
        radius: 100,
        isolines: 2,
        dissolved: false
      });
    });

    it('should parse given form attrs string values to the want types', () => {
      expect(camshaftReference.parse(this.validFormAttrs)).toEqual({
        id: 'a1',
        source: 'a0',
        type: 'buffer',
        radius: 100,
        isolines: 2,
        dissolved: false
      });
    });

    it('should not require any absent optional values', () => {
      expect(camshaftReference.parse(_.omit(this.validFormAttrs, 'isolines', 'dissolved'))).toEqual({
        id: 'a1',
        source: 'a0',
        type: 'buffer',
        radius: 100
      });
    });

    it('should return normalized values for invalid types', () => {
      expect(camshaftReference.parse({
        id: 'a1',
        source: null,
        type: 'buffer',
        radius: {},
        isolines: {},
        dissolved: 'nope'
      })).toEqual({
        id: 'a1',
        source: '',
        type: 'buffer',
        radius: NaN,
        isolines: NaN,
        dissolved: false
      });
    });

    it('should trim string values', () => {
      var validFormAttrs = {
        id: 'a1',
        source: 'a0',
        type: 'population-in-area',
        final_column: ' col '
      };
      expect(camshaftReference.parse(validFormAttrs)).toEqual({
        id: 'a1',
        source: 'a0',
        type: 'population-in-area',
        final_column: 'col'
      });

      expect(camshaftReference.parse(_.omit(validFormAttrs, 'final_column'))).toEqual({
        id: 'a1',
        source: 'a0',
        type: 'population-in-area',
        final_column: null
      });
    });

    it('should check enum valid', () => {
      var validFormAttrs = {
        id: 'a1',
        type: 'aggregate-intersection',
        source: 'a0',
        target: 'b1',
        aggregate_function: 'count',
        aggregate_column: 'col'
      };
      expect(camshaftReference.parse(validFormAttrs)).toEqual({
        id: 'a1',
        type: 'aggregate-intersection',
        source: 'a0',
        target: 'b1',
        aggregate_function: 'count',
        aggregate_column: 'col'
      });

      expect(camshaftReference.parse(_.omit(validFormAttrs, 'aggregate_function'))).toEqual({
        id: 'a1',
        type: 'aggregate-intersection',
        source: 'a0',
        target: 'b1',
        aggregate_function: null,
        aggregate_column: 'col'
      });
    });
  });

  describe('.validate', () => {
    describe('when given a type', () => {
      describe('with sources', () => {
        beforeEach(() => {
          this.validFormAttrs = {
            id: 'a1',
            type: 'intersection',
            source: 'a0',
            target: 'b1'
          };
        });

        it('should return nothing for valid values', () => {
          expect(camshaftReference.validate(this.validFormAttrs)).toBeUndefined();
        });

        it('should return error for missing a source', () => {
          expect(camshaftReference.validate(_.omit(this.validFormAttrs, 'source'))).toEqual({source: jest.any(String)});
          expect(camshaftReference.validate(_.omit(this.validFormAttrs, 'target'))).toEqual({target: jest.any(String)});
        });
      });

      describe('with numbers', () => {
        beforeEach(() => {
          this.validFormAttrs = {
            id: 'a1',
            source: 'a0',
            type: 'buffer',
            radius: '1'
          };
        });

        it('should return nothing for valid values', () => {
          expect(camshaftReference.validate(this.validFormAttrs)).toBeUndefined();
        });

        it('should return errors if missing required param', () => {
          expect(camshaftReference.validate(_.omit(this.validFormAttrs, 'radius'))).toEqual({
            radius: jest.any(String)
          });
        });
      });

      describe('with enums', () => {
        beforeEach(() => {
          this.validFormAttrs = {
            id: 'a1',
            type: 'aggregate-intersection',
            source: 'a0',
            target: 'b1',
            aggregate_function: 'count',
            aggregate_column: 'col'
          };
        });

        it('should return nothing for valid values', () => {
          expect(camshaftReference.validate(this.validFormAttrs)).toBeUndefined();
        });

        it('should return error if enum is missing', () => {
          expect(camshaftReference.validate(_.omit(this.validFormAttrs, 'aggregate_function'))).toEqual({
            aggregate_function: jest.any(String)
          });
        });

        it('should return error if enum is invalid', () => {
          this.validFormAttrs.aggregate_function = 'FOOBAR';
          expect(camshaftReference.validate(this.validFormAttrs)).toEqual({
            aggregate_function: jest.any(String)
          });
        });
      });
    });
  });

  describe('.isValidInputGeometryForType', () => {
    it('should return true if it is', () => {
      expect(camshaftReference.isValidInputGeometryForType('point', 'buffer')).toBe(true);
      expect(camshaftReference.isValidInputGeometryForType('polygon', 'buffer')).toBe(true);
      expect(camshaftReference.isValidInputGeometryForType('line', 'buffer')).toBe(true);

      expect(camshaftReference.isValidInputGeometryForType('point', 'kmeans')).toBe(true);
      expect(camshaftReference.isValidInputGeometryForType('polygon', 'kmeans')).toBe(false);
      expect(camshaftReference.isValidInputGeometryForType('line', 'kmeans')).toBe(false);
    });

    it('should throw an error if type is not valid', () => {
      expect(() => { camshaftReference.isValidInputGeometryForType('point', 'foobar'); }).toThrowError(/ foobar/);
    });
  });

  describe('.getValidInputGeometriesForType', () => {
    it('should return the geometries for given type and source name', () => {
      expect(camshaftReference.getValidInputGeometriesForType('buffer')).toEqual(['*']);
      expect(camshaftReference.getValidInputGeometriesForType('data-observatory-measure')).toEqual(['point', 'polygon']);
      expect(camshaftReference.getValidInputGeometriesForType('trade-area')).toEqual(['point']);
    });

    it('should throw an error if type is not valid', () => {
      expect(() => { camshaftReference.getValidInputGeometriesForType('foobar'); }).toThrowError(/ foobar/);
      expect(() => { camshaftReference.getValidInputGeometriesForType(); }).toThrowError(/ undefined/);
      expect(() => { camshaftReference.getValidInputGeometriesForType(null); }).toThrowError(/ null/);
    });
  });
});
