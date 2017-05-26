var OperatorsListModel = require('../../../../../../../javascripts/cartodb3/components/form-components/editors/operators/operators-list-model');

describe('components/form-components/operators/operators-list-model', () => {
  beforeEach(() => {
    this.model = new OperatorsListModel({
      operator: 'count',
      attribute: ''
    });
  });

  describe('.isValidOperator', () => {
    it('should be true when operator is count', () => {
      expect(this.model.isValidOperator()).toBeTruthy();
    });

    it('should be valid when operator is different than count and there is an attribute', () => {
      this.model.attributes = {
        operator: 'sum',
        attribute: '$'
      };
      expect(this.model.isValidOperator()).toBeTruthy();
    });

    it('should be unvalid when operator is different than count and there is no an attribute', () => {
      this.model.attributes = {
        operator: 'sum',
        attribute: ''
      };
      expect(this.model.isValidOperator()).toBeFalsy();
    });

    it('should be unvalid when operator is empty and there is an attribute', () => {
      this.model.attributes = {
        operator: '',
        attribute: '$'
      };
      expect(this.model.isValidOperator()).toBeFalsy();
    });
  });
});
