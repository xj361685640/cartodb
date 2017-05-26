var Backbone = require('backbone');
var LegendsState = require('../../../../../javascripts/cartodb3/data/legends/legends-state');

describe('data/legends/legends-state', () => {
  beforeAll(() => {
    this.layerDefinitionModel = new Backbone.Model({
      id: 'l-1'
    });

    this.layerDefinitionsCollection = new Backbone.Collection();
    this.layerDefinitionsCollection.add(this.layerDefinitionModel);

    this.legendDefinitionsCollection = new Backbone.Collection();

    var legendModel = new Backbone.Model({
      type: 'choropleth',
      title: 'foo',
      conf: {
        columns: ['title']
      }
    });

    legendModel.layerDefinitionModel = this.layerDefinitionModel;

    this.legendDefinitionsCollection.add(legendModel);

    LegendsState.init(this.layerDefinitionsCollection, this.legendDefinitionsCollection);
  });

  it('should be populated properly', () => {
    var instance = LegendsState.getInstance();

    expect(instance['l-1']).toBeDefined();
    expect(instance['l-1']['color']).toBeDefined();
    expect(instance['l-1']['color']['title']).toBe('foo');
    expect(instance['l-1']['size']).toBeUndefined();
  });

  describe('get', () => {
    it('should return existing state properly', () => {
      var state = LegendsState.get(this.layerDefinitionModel, 'choropleth');
      expect(state.title).toBeDefined();
      expect(state.title).toBe('foo');
    });

    it('should return undefined for non existint state', () => {
      var state = LegendsState.get(this.layerDefinitionModel, 'bubble');
      expect(state).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set properly', () => {
      LegendsState.set(this.layerDefinitionModel, 'bubble', {title: 'bar'});
      var instance = LegendsState.getInstance();

      expect(instance['l-1']['size']).toBeDefined();
      expect(instance['l-1']['size']['title']).toBe('bar');
    });

    it('should set properly for new layers', () => {
      LegendsState.set(new Backbone.Model({id: 'l-2'}), 'custom', {title: 'pop'});
      var instance = LegendsState.getInstance();

      expect(instance['l-2']['color']).toBeDefined();
      expect(instance['l-2']['color']['title']).toBe('pop');
    });
  });

  describe('events', () => {
    it('add layer', () => {
      var layer = new Backbone.Model({id: 'l-200'});
      this.layerDefinitionsCollection.add(layer);
      var instance = LegendsState.getInstance();
      expect(instance['l-200']).toBeDefined();
    });

    it('remove layer', () => {
      var layer = this.layerDefinitionsCollection.at(0);
      this.layerDefinitionsCollection.remove(layer);

      var instance = LegendsState.getInstance();
      expect(instance['l-1']).toBeUndefined();
    });
  });
});
