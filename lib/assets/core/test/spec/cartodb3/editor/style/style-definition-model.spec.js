var StyleDefinitionModel = require('../../../../../javascripts/cartodb3/editor/style/style-definition-model');

describe('editor/style/style-definition-model', () => {
  beforeEach(() => {
    this.model = new StyleDefinitionModel({
      type: 'simple',
      properties: {
        labels: {
          hello: 'hi'
        }
      }
    }, {
      parse: true
    });
  });

  describe('parse', () => {
    it('should flat properties attribute', () => {
      expect(this.model.get('labels')).toBeDefined();
      expect(this.model.get('properties')).not.toBeDefined();
    });
  });

  it('should init undo-manager', () => {
    expect(this.model._undoManager).toBeDefined();
  });

  describe('.setDefaultPropertiesByType', () => {
    it('should provide a way to set type default properties', () => {
      expect(this.model.get('type')).toBe('simple');
      var onChangeSpy = jest.createSpy('onChange');
      this.model.bind('change', onChangeSpy, this.model);
      this.model.setDefaultPropertiesByType('squares', 'points');
      expect(onChangeSpy).toHaveBeenCalled();
      expect(this.model.changed).toEqual({
        type: 'squares',
        fill: jest.any(Object),
        stroke: jest.any(Object),
        blending: 'none',
        aggregation: jest.any(Object),
        labels: jest.any(Object)
      });
    });
  });

  describe('.resetStyles', () => {
    it('should set styles to none', () => {
      expect(this.model.get('type')).toBe('simple');
      var onChangeSpy = jest.createSpy('onChange');
      this.model.bind('change', onChangeSpy, this.model);
      this.model.resetStyles();
      expect(onChangeSpy).toHaveBeenCalled();
      expect(this.model.changed).toEqual({
        type: 'none',
        fill: null,
        stroke: null,
        blending: null,
        aggregation: jest.any(Object),
        labels: jest.any(Object)
      });
    });
  });

  describe('.getColumnsUsedForStyle', () => {
    it('should not return any column used by default', () => {
      expect(this.model.getColumnsUsedForStyle().length).toBe(0);
    });

    it('should return a column if color fill is styled by value', () => {
      this.model.set('fill', {
        size: {
          fixed: 1
        },
        color: {
          fixed: 'red',
          opacity: 1
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([]);

      this.model.set('fill', {
        size: {
          fixed: 1
        },
        color: {
          range: ['red', 'blue'],
          domain: ['red', 'blue'],
          attribute: 'column_1',
          attribute_type: 'string'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'column_1',
          type: 'string'
        })
      ]);

      this.model.set('fill', {
        size: {
          fixed: 1
        },
        color: {
          range: ['#FFF', '#000'],
          domain: [1, 0],
          attribute: 'column_2',
          attribute_type: 'number'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'column_2',
          type: 'number'
        })
      ]);
    });

    it('should return a column if size fill is styled by value', () => {
      this.model.set('fill', {
        size: {
          fixed: 1
        },
        color: {
          fixed: 'blue',
          opacity: 1
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([]);

      this.model.set('fill', {
        size: {
          range: [0, 20],
          attribute: 'column_3',
          attribute_type: 'number'
        },
        color: {
          fixed: 'red'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'column_3',
          type: 'number'
        })
      ]);
    });

    it('should return a column if color stroke is styled by value', () => {
      this.model.set('stroke', {
        size: {
          fixed: 1
        },
        color: {
          fixed: 'red',
          opacity: 1
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([]);

      this.model.set('stroke', {
        size: {
          fixed: 1
        },
        color: {
          range: ['#FF0', '#FABADA'],
          domain: ['red', 'blue'],
          attribute: 'column_0',
          attribute_type: 'string'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'column_0',
          type: 'string'
        })
      ]);

      this.model.set('stroke', {
        size: {
          fixed: 1
        },
        color: {
          range: ['#FFF', '#000'],
          domain: [1, 0],
          attribute: 'column_a',
          attribute_type: 'number'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'column_a',
          type: 'number'
        })
      ]);
    });

    it('should return a column if size stroke is styled by value', () => {
      this.model.set('stroke', {
        size: {
          fixed: 1
        },
        color: {
          fixed: 'yellow',
          opacity: 1
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([]);

      this.model.set('stroke', {
        size: {
          range: [0, 20],
          attribute: 'column_5',
          attribute_type: 'number'
        },
        color: {
          fixed: 'red'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'column_5',
          type: 'number'
        })
      ]);
    });

    it('should return a column if size stroke is styled by value and it should be number', () => {
      this.model.set('stroke', {
        size: {
          range: [0, 20],
          attribute: 'column_5'
        },
        color: {
          fixed: 'red'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'column_5',
          type: 'number'
        })
      ]);
    });

    it('should return a column if labels are enabled', () => {
      this.model.set('labels', {
        enabled: false,
        attribute: 'cartodb_id'
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([]);

      this.model.set('labels', {
        enabled: true,
        attribute: 'cartodb_id'
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'cartodb_id'
        })
      ]);
    });

    it('should return a column if aggregation is defined', () => {
      this.model.set('aggregation', {});

      expect(this.model.getColumnsUsedForStyle()).toEqual([]);

      this.model.set('aggregation', {
        size: 10,
        value: {
          operator: 'count',
          attribute: ''
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([]);

      this.model.set('aggregation', {
        size: 10,
        value: {
          operator: 'avg',
          attribute: 'operator'
        }
      });

      expect(this.model.getColumnsUsedForStyle()).toEqual([
        jest.objectContaining({
          name: 'operator'
        })
      ]);
    });
  });

  describe('toJSON', () => {
    it('should unflat attributes', () => {
      this.model.set('fill', {
        size: {
          fixed: 10
        }
      });

      var data = this.model.toJSON();
      expect(data.type).toBe('simple');
      expect(data.properties).toBeDefined();
      expect(data.properties).toEqual({
        labels: jest.any(Object),
        fill: jest.any(Object)
      });
      expect(data.fill).not.toBeDefined();
    });
  });

  describe('autoStyle', () => {
    beforeEach(() => {
      var definition = {
        point: {
          color: {
            attribute: 'name',
            domain: ['foo'],
            range: ['#fabada']
          }
        }
      };

      this.model.set('fill', {
        color: {
          fixed: '#f4b4d4'
        }
      });

      this.model.setPropertiesFromAutoStyle({
        definition: definition,
        geometryType: 'point',
        widgetId: 1
      });
    });

    it('should store properties before autostyle', () => {
      var preAutoStyle = this.model._stylesPreAutoStyle;
      expect(preAutoStyle).toBeDefined();
      expect(preAutoStyle.fill.color.fixed).toBe('#f4b4d4');
    });

    it('should set properties from autostyle', () => {
      var data = this.model.toJSON();
      expect(data.properties.fill.color.static).toBe(true);
      expect(data.properties.fill.color.quantification).toBe('category');
      expect(data.properties.autoStyle).toBe(1);
    });

    it('should reset properties from autostyle proerly', () => {
      this.model.resetPropertiesFromAutoStyle();
      var data = this.model.toJSON();
      expect(this.model._stylesPreAutoStyle).toBeUndefined();
      expect(data.properties.fill.color.fixed).toBe('#f4b4d4');
    });
  });
});
