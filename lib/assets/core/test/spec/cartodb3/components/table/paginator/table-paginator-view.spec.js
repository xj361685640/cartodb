var Backbone = require('backbone');
var TablePaginatorView = require('../../../../../../javascripts/cartodb3/components/table/paginator/table-paginator-view');
var TableViewModel = require('../../../../../../javascripts/cartodb3/components/table/table-view-model');
var QueryRowsCollection = require('../../../../../../javascripts/cartodb3/data/query-rows-collection');

describe('components/table/paginator/table-paginator-view', () => {
  beforeEach(() => {
    this.configModel = new Backbone.Model();
    this.configModel.getSqlApiUrl = () => { return ''; };

    this.tableViewModel = new TableViewModel({
      tableName: 'pepito'
    }, {
      columnsCollection: new Backbone.Collection(),
      analysisDefinitionNodeModel: {}
    });

    spyOn(this.tableViewModel, 'isCustomQueryApplied').and.returnValue(false);
    spyOn(this.tableViewModel, 'isDisabled').and.returnValue(false);

    this.rowsCollection = new QueryRowsCollection([{
      cartodb_id: 1,
      description: 'hello guyis'
    }], {
      querySchemaModel: this.querySchemaModel,
      configModel: this.configModel
    });
    spyOn(this.rowsCollection, 'fetch');
    spyOn(TablePaginatorView.prototype, 'render').and.callThrough();
    this.view = new TablePaginatorView({
      rowsCollection: this.rowsCollection,
      tableViewModel: this.tableViewModel
    });
    this.view.render();
  });

  describe('render', () => {
    it('should render properly', () => {
      expect(this.view.$('.Table-paginatorButton').length).toBe(2);
      // With only 2 results and in the first page, prev and next buttons will not appear
      expect(this.view.$('.js-next').length).toBe(0);
      expect(this.view.$('.js-prev').length).toBe(0);
      spyOn(this.rowsCollection, 'size').and.returnValue(40);
      this.tableViewModel.set('page', 5);
      this.view.render();
      expect(this.view.$('.js-next').length).toBe(1);
      expect(this.view.$('.js-prev').length).toBe(1);
      expect(this.view.$el.hasClass('Table-paginator--relative')).toBeFalsy();
    });

    it('should add relative class if table view model has it', () => {
      this.tableViewModel.set('relativePositionated', true);
      this.view.render();
      expect(this.view.$el.hasClass('Table-paginator--relative')).toBeTruthy();
    });
  });

  describe('bind', () => {
    it('should set loading flag to true when a loading event is sent', () => {
      expect(this.view._isLoading).toBeFalsy();
      this.rowsCollection.trigger('loading', this.rowsCollection);
      expect(this.view._isLoading).toBeTruthy();
    });

    it('should not set loading flag to true if loading event is sent from a model', () => {
      expect(this.view._isLoading).toBeFalsy();
      var mdl = this.rowsCollection.at(0);
      mdl.trigger('loading', mdl);
      expect(this.view._isLoading).toBeFalsy();
    });

    it('should render again when a new row is added', () => {
      TablePaginatorView.prototype.render.calls.reset();
      this.rowsCollection.add({ cartodb_id: 2 });
      expect(TablePaginatorView.prototype.render).toHaveBeenCalled();
    });

    it('should render again when an old row is removed', () => {
      TablePaginatorView.prototype.render.calls.reset();
      this.rowsCollection.remove(this.rowsCollection.at(0));
      expect(TablePaginatorView.prototype.render).toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    beforeEach(() => {
      spyOn(this.rowsCollection, 'size').and.returnValue(40);
      this.tableViewModel.set('page', 2);
      this.view.render();
    });

    it('should change page from table-view-model when it is clicked (and enabled)', () => {
      expect(this.tableViewModel.get('page')).toBe(2);
      this.view.$('.js-prev').click();
      expect(this.tableViewModel.get('page')).toBe(1);
    });

    it('should add loader when button is active and is clicked', () => {
      this.view._isLoading = false;
      this.view.$('.js-next').click();
      expect(this.view.$('.js-next').html()).toContain('CDB-LoaderIcon');
    });

    it('should not change the page if there is an ongoing request', () => {
      expect(this.tableViewModel.get('page')).toBe(2);
      this.view._isLoading = true;
      this.view.$('.js-next').click();
      expect(this.view.$('.js-next').html()).not.toContain('CDB-LoaderIcon');
      expect(this.tableViewModel.get('page')).toBe(2);
    });

    it('should exclude the_geom_webmercator is query is not custom', () => {
      this.rowsCollection.size.and.returnValue(200);
      this.tableViewModel.isCustomQueryApplied.and.returnValue(false);
      this.view._isLoading = false;
      this.view.$('.js-next').click();
      expect(this.rowsCollection.fetch).toHaveBeenCalled();
      var data = this.rowsCollection.fetch.calls.argsFor(0)[0].data;
      expect(data.exclude).toEqual(['the_geom_webmercator']);
    });
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.clean();
  });
});
