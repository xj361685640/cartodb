var $ = require('jquery');
var template = require('../../../../../../../javascripts/cartodb3/editor/style/style-form/style-aggregation-form/style-aggregation-form.tpl');

describe('editor/style/style-form/style-aggregation-form/style-aggregation-template', () => {
  it('should have proper class name for onboarding', () => {
    var content = $(template());

    expect(content.hasClass('js-aggregationOptions')).toBe(true);
  });
});
