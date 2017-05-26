var _ = require('underscore');
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var AnalysisDefinitionNodesCollection = require('../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');

describe('cartodb3/data/analysis-definition-node-model', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    this.collection = new AnalysisDefinitionNodesCollection(null, {
      configModel: configModel,
      userModel: {}
    });

    this.a0raw = {
      id: 'a0',
      type: 'source',
      params: {
        query: 'SELECT * FROM bar'
      },
      options: {
        table_name: 'bar',
        test: 'hello'
      }
    };

    this.collection.add([
      {
        id: 'a1',
        type: 'trade-area',
        params: {
          source: this.a0raw,
          kind: 'walk',
          time: 300,
          dissolved: true,
          isolines: 3
        },
        options: {
          optional: 'goes separately'
        }
      }, {
        id: 'b1',
        type: 'intersection',
        params: {
          source: this.a0raw,
          target: {
            id: 'b0',
            type: 'source',
            params: {
              query: 'SELECT * FROM my_polygons'
            },
            options: {
              table_name: 'my_polygons'
            }
          }
        },
        options: {
          primary_source_name: 'target'
        }
      }, {
        id: 'c1',
        type: 'deprecated-sql-function',
        params: {
          function_name: 'DEP_EXT_buffer',
          primary_source: this.a0raw
        }
      }, {
        id: 'd1',
        type: 'deprecated-sql-function',
        params: {
          function_name: 'DEP_EXT_spatialinterpolation',
          primary_source: this.a0raw,
          secondary_source: this.a0raw
        }
      }
    ]);

    expect(this.collection.pluck('id')).toEqual(['a0', 'b0', 'a1', 'b1', 'c1', 'd1'], 'should have created individual nodes');
    this.a0 = this.collection.get('a0');
    this.b0 = this.collection.get('b0');
    this.a1 = this.collection.get('a1');
    this.b1 = this.collection.get('b1');
    this.c1 = this.collection.get('c1');
    this.d1 = this.collection.get('d1');
  });

  it('should init properly', () => {
    this.collection.each(function (model) {
      expect(model.queryGeometryModel).toBeDefined();
      expect(model.querySchemaModel).toBeDefined();
      expect(model.queryRowsCollection).toBeDefined();
    });
  });

  it('should not have any geom from start', () => {
    expect(this.a0.queryGeometryModel.get('simple_geom')).toBeFalsy();
  });

  it('should keep a flat, denormalized attrs structure internally', () => {
    expect(this.a0.attributes).toEqual({
      id: 'a0',
      type: 'source',
      query: 'SELECT * FROM bar',
      table_name: 'bar',
      test: 'hello',
      status: 'ready'
    });
    expect(this.a1.attributes).toEqual({
      id: 'a1',
      type: 'trade-area',
      source: 'a0',
      kind: 'walk',
      time: 300,
      dissolved: true,
      isolines: 3,
      optional: 'goes separately'
    });
    expect(this.b1.attributes).toEqual({
      id: 'b1',
      type: 'intersection',
      source: 'a0',
      target: 'b0',
      primary_source_name: 'target'
    });
  });

  describe('.sourceIds', () => {
    it('should return source ids if there are any', () => {
      expect(this.a0.sourceIds()).toEqual([], 'a source node should not have any sources');
      expect(this.a1.sourceIds()).toEqual(['a0']);
      expect(this.b1.sourceIds()).toEqual(['a0', 'b0']);
    });
  });

  describe('.hasPrimarySource', () => {
    it('should return true if it has a primary source', () => {
      expect(this.a0.hasPrimarySource()).toBe(false, 'a source node should not have any sources');
      expect(this.a1.hasPrimarySource()).toBe(true, 'a trade-area should have a single, primary source');
      expect(this.b1.hasPrimarySource()).toBe(true);
    });
  });

  describe('.getPrimarySource', () => {
    it('should return the primary source if it has any', () => {
      expect(this.a0.getPrimarySource()).toBeUndefined('a source node should not have any sources');
      expect(this.a1.getPrimarySource().id).toEqual('a0');
      expect(this.b1.getPrimarySource().id).toEqual('b0');
    });
  });

  describe('.hasSecondarySource', () => {
    it('should return true if it has a secondary source', () => {
      expect(this.a0.hasSecondarySource()).toBe(false, 'a source node should not have any sources');
      expect(this.a1.hasSecondarySource()).toBe(false);
      expect(this.b1.hasSecondarySource()).toBe(true, 'should be target');
    });
  });

  describe('.getSecondarySource', () => {
    it('should return the secondary source if it has any', () => {
      expect(this.a0.getSecondarySource()).toBeUndefined('a source node should not have any sources');
      expect(this.a1.getSecondarySource()).toBeUndefined();
      expect(this.b1.getSecondarySource().id).toEqual('a0');
    });
  });

  describe('.changeSourceIds', () => {
    it('should change the source ids that matches the current id', () => {
      this.a1.changeSourceIds('a0', 'c1');
      expect(this.a1.sourceIds()).toEqual(['c1']);

      this.b1.changeSourceIds('b0', 'c1');
      expect(this.b1.sourceIds()).toEqual(['a0', 'c1']);

      this.b1.changeSourceIds('a0', 'd1');
      expect(this.b1.sourceIds()).toEqual(['d1', 'c1']);
    });

    it('should do nothing if given current id does not match any source', () => {
      this.a1.changeSourceIds('x9', 'c1');
      expect(this.a1.sourceIds()).toEqual(['a0']);
    });
  });

  describe('.destroy', () => {
    it('should destroy the query schema model', () => {
      var querySchemaModel = this.a0.querySchemaModel;
      spyOn(querySchemaModel, 'destroy');
      this.a0.destroy();
      expect(this.collection.pluck('id')).not.toContain('a0');
      expect(querySchemaModel.destroy).toHaveBeenCalled();
      expect(this.a0.querySchemaModel).toBeNull();

      querySchemaModel = this.a1.querySchemaModel;
      spyOn(querySchemaModel, 'destroy');
      this.a1.destroy();
      expect(this.collection.pluck('id')).not.toContain('a1');
      expect(querySchemaModel.destroy).toHaveBeenCalled();
      expect(this.a1.querySchemaModel).toBeNull();

      querySchemaModel = this.b1.querySchemaModel;
      spyOn(querySchemaModel, 'destroy');
      this.b1.destroy();
      expect(this.collection.pluck('id')).not.toContain('b1');
      expect(querySchemaModel.destroy).toHaveBeenCalled();
      expect(this.b1.querySchemaModel).toBeNull();
    });
  });

  describe('.toJSON', () => {
    it('should serialize the model', () => {
      expect(this.a0.toJSON()).toEqual(this.a0raw);

      expect(this.a1.toJSON()).toEqual(
        jest.objectContaining({
          id: 'a1',
          type: 'trade-area',
          params: jest.any(Object),
          options: {
            optional: 'goes separately'
          }
        }));
      expect(this.a1.toJSON()).toEqual(
        jest.objectContaining({
          params: {
            source: this.a0raw,
            kind: 'walk',
            time: 300,
            dissolved: true,
            isolines: 3
          }
        }));

      expect(this.b1.toJSON()).toEqual(
        jest.objectContaining({
          id: 'b1',
          type: 'intersection',
          params: jest.any(Object),
          options: {
            primary_source_name: 'target'
          }
        }));
      expect(this.b1.toJSON()).toEqual(
        jest.objectContaining({
          params: {
            source: this.a0raw,
            source_columns: undefined,
            target: {
              id: 'b0',
              type: 'source',
              params: {
                query: 'SELECT * FROM my_polygons'
              },
              options: {
                table_name: 'my_polygons'
              }
            }
          }
        }));
      expect(this.c1.toJSON().params.function_name).toEqual('DEP_EXT_buffer');
      expect(this.c1.toJSON().params.function_args).not.toBeDefined();
      expect(this.c1.toJSON().params.primary_source).toBeDefined();
      expect(this.c1.toJSON().params.secondary_source).not.toBeDefined();

      expect(this.d1.toJSON().params.function_name).toEqual('DEP_EXT_spatialinterpolation');
      expect(this.d1.toJSON().params.function_args).not.toBeDefined();
      expect(this.d1.toJSON().params.primary_source).toBeDefined();
      expect(this.d1.toJSON().params.secondary_source).toBeDefined();
    });

    describe('when skipOptions is set', () => {
      beforeEach(() => {
        this.options = {skipOptions: true};
      });

      it('should skip options if skipOptions is set to true', () => {
        var a0WithoutOptions = _.omit(this.a0raw, 'options');
        expect(this.a0.toJSON(this.options)).toEqual(a0WithoutOptions);

        expect(this.a1.toJSON(this.options)).toEqual({
          id: 'a1',
          type: 'trade-area',
          params: {
            source: a0WithoutOptions,
            kind: 'walk',
            time: 300,
            dissolved: true,
            isolines: 3
          }
        });

        expect(this.b1.toJSON(this.options)).toEqual(
          jest.objectContaining({
            id: 'b1',
            type: 'intersection',
            params: jest.any(Object)
          }));
        expect(this.b1.toJSON(this.options)).toEqual(
          jest.objectContaining({
            params: {
              source: a0WithoutOptions,
              source_columns: undefined,
              target: {
                id: 'b0',
                type: 'source',
                params: {
                  query: 'SELECT * FROM my_polygons'
                }
              }
            }
          }));
      });
    });
  });

  describe('.containsNode', () => {
    it('should return true if given node is contained inside the analysis', () => {
      expect(this.a0.containsNode(this.b1)).toBe(false, 'source should not contain any node, you fool!');

      expect(this.a1.containsNode(this.a0)).toBe(true);
      expect(this.a1.containsNode(this.b0)).toBe(false, 'should only contain a0');

      expect(this.b1.containsNode(this.a0)).toBe(true);
      expect(this.b1.containsNode(this.b0)).toBe(true);
      expect(this.b1.containsNode(this.a1)).toBe(false);
    });
  });

  describe('.isValidAsInputForType', () => {
    describe('when geometry output is unknown', () => {
      it('should return false', () => {
        expect(this.a0.isValidAsInputForType('buffer')).toBe(null);
        expect(this.a0.isValidAsInputForType('intersection')).toBe(null);

        expect(this.a1.isValidAsInputForType('trade-area')).toBe(null);
        expect(this.a1.isValidAsInputForType('buffer')).toBe(null);

        expect(this.b1.isValidAsInputForType('buffer')).toBe(null);
        expect(this.b1.isValidAsInputForType('trade-area')).toBe(null);
      });
    });

    describe('when geometry output is known', () => {
      it('should return true if is valid as input type', () => {
        expect(this.a0.isValidAsInputForType('source')).toBe(false, 'a source node should not accept any input');

        this.a0.queryGeometryModel.set('simple_geom', 'point');
        expect(this.a0.isValidAsInputForType('trade-area')).toBe(true);
        expect(this.a0.isValidAsInputForType('buffer')).toBe(true);

        this.a0.queryGeometryModel.set('simple_geom', 'polygon');
        expect(this.a0.isValidAsInputForType('trade-area')).toBe(false, 'trade-area only accepts points (unless the camshaft reference changed?)');
        expect(this.a0.isValidAsInputForType('buffer')).toBe(true);
      });
    });
  });

  describe('.clone', () => {
    var a0;

    beforeEach(() => {
      a0 = this.a0;
    });

    it('should throw error in bad input', () => {
      expect(() => { a0.clone(); }).toThrowError(/required/);
      expect(() => { a0.clone(null); }).toThrowError(/required/);
      expect(() => { a0.clone(undefined); }).toThrowError(/required/);
      expect(() => { a0.clone(true); }).toThrowError(/required/);
      expect(() => { a0.clone({}); }).toThrowError(/required/);
    });

    it('should require a new id', () => {
      expect(() => { a0.clone('a0'); }).toThrowError(/different/);
    });

    it('should create a new node with same params but new id', () => {
      var m = a0.clone('g0');
      expect(m).toBeDefined();
      expect(m.id).toEqual('g0');
      expect(m.get('type')).toEqual('source');
      expect(m.get('query')).toEqual(jest.any(String));
      expect(m.get('table_name')).toEqual(jest.any(String));
      expect(m.get('test')).toEqual('hello');
    });

    it('should add the cloned item to the collection', () => {
      var m = a0.clone('g0');
      expect(this.collection.contains(m)).toBe(true);
    });
  });

  describe('.linkedListBySameLetter', () => {
    var a0;

    beforeEach(() => {
      a0 = this.a0;
    });

    describe('when given a source node', () => {
      beforeEach(() => {
        this.list = a0.linkedListBySameLetter();
      });

      it('should return a list with only the source', () => {
        expect(_.pluck(this.list, 'id')).toEqual(['a0']);
      });
    });

    describe('when called on a node which sources all belong to same letter', () => {
      beforeEach(() => {
        this.a2 = this.collection.add({
          id: 'a2',
          type: 'buffer',
          params: {
            source: this.a1.toJSON(),
            radius: 100
          }
        });

        this.list = this.a2.linkedListBySameLetter();
      });

      it('should return list with all nodes', () => {
        expect(_.pluck(this.list, 'id')).toEqual(['a2', 'a1', 'a0']);
      });
    });

    describe('when given a node which sub-tree belongs to other letter', () => {
      beforeEach(() => {
        this.c2 = this.collection.add({
          id: 'c2',
          type: 'buffer',
          params: {
            radius: 20,
            source: {
              id: 'c1',
              type: 'buffer',
              params: {
                radius: 10,
                source: this.b1.toJSON()
              }
            }
          }
        });

        this.list = this.c2.linkedListBySameLetter();
      });

      it('should return list with all nodes', () => {
        expect(_.pluck(this.list, 'id')).toEqual(['c2', 'c1']);
      });
    });
  });

  describe('.letter', () => {
    it('should return the letter representation ', () => {
      expect(this.a0.letter()).toEqual('a');
      expect(this.b1.letter()).toEqual('b');
    });
  });

  describe('.canBeDeletedByUser', () => {
    it('should return true if it has a source node', () => {
      expect(this.b1.canBeDeletedByUser()).toBe(true);
      expect(this.a0.canBeDeletedByUser()).toBe(false);
      expect(this.b0.canBeDeletedByUser()).toBe(false);
    });
  });

  describe('when given a geom from start', () => {
    beforeEach(() => {
      this.model = this.collection.add({
        id: 'x0',
        type: 'buffer',
        params: {},
        options: {
          simple_geom: 'point'
        }
      });
    });

    it('should set the geom on the query-schema-model', () => {
      expect(this.model.queryGeometryModel.get('simple_geom')).toEqual('point');
    });
  });
});
