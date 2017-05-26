var $ = require('jquery');
var AnalysisTooltip = require('../../../../../../javascripts/cartodb3/editor/layers/analysis-views/analyses-tooltip-error');

describe('editor/layers/analysis-views/analysis-tooltip-error', () => {
  beforeEach(() => {
    this.view = $('<div class="view"><div class="Error" style="width:10px; height: 10px; background: red; "></div></div>');
    $('body').append(this.view);

    this.analysisNode = {
      get: function (what) {
        if (what === 'status') return 'failed';
        if (what === 'error') return false;
        if (what === 'id') return 'a1';
      }
    };

    this._analysisTooltip = new AnalysisTooltip({
      analysisNode: this.analysisNode,
      element: this.view,
      triggerSelector: '.Error'
    });
  });

  it('should not have any leaks', () => {
    expect(this._analysisTooltip).toHaveNoLeaks();
  });

  it('should create the tooltip on mouseover', () => {
    this.view.find('.Error').trigger('mouseover');
    expect(this._analysisTooltip.tooltip).toBeDefined();
  });

  it('should destroy the tooltip on mouseout', () => {
    this.view.find('.Error').trigger('mouseover');
    expect(this._analysisTooltip.tooltip).toBeDefined();
    this.view.find('.Error').trigger('mouseout');
    expect(this._analysisTooltip.tooltip).not.toBeDefined();
  });

  afterEach(() => {
    $('.view').remove();
  });
});
