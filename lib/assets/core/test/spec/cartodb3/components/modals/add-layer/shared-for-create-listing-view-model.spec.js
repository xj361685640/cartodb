var Backbone = require('backbone');

/**
 * Common test cases for a create listing view model.
 * Expected to be called in the context of the top-describe closure of an option model, e.g.:
 *   describe('...', function() {
 *     beforeEach(function() {
 *       this.model = new Model({});
 *     });
 *     sharedForCreateListingViewModel.call(this);
 */
module.exports = () => {
  it('should have listing attr representing current listing view', () => {
    expect(this.model.get('listing')).toEqual(jest.any(String));
    expect(this.model.get('listing')).not.toEqual(''); // should have an initial value
  });

  describe('.showLibrary', () => {
    it('should return a boolean for if data library should be loaded', () => {
      expect(this.model.showLibrary()).toEqual(jest.any(Boolean));
    });
  });

  describe('.canSelect', () => {
    it('should return a boolean for if user can select an item (more)', () => {
      var datasetModel = new Backbone.Model();
      expect(this.model.canSelect(datasetModel)).toEqual(jest.any(Boolean));
    });
  });

  describe('.showDatasets', () => {
    it('should return a boolean for whether to show datasets or not', () => {
      expect(this.model.showDatasets()).toEqual(jest.any(Boolean));
    });
  });
};
