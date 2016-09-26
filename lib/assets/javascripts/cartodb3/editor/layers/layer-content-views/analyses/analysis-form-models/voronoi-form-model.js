var BaseAnalysisFormModel = require('./base-analysis-form-model');
var template = require('./voronoi.tpl');
var _ = require('underscore');

var DEFAULT_BUFFER_AREA = 0.5;

/**
 * Form model for a sampling
 */
module.exports = BaseAnalysisFormModel.extend({

  initialize: function () {
    BaseAnalysisFormModel.prototype.initialize.apply(this, arguments);
    this._setSchema();
  },

  parse: function (attrs) {
    return _.defaults(attrs, {
      buffer: DEFAULT_BUFFER_AREA
    });
  },

  getTemplate: function () {
    return template;
  },

  /**
   * @override {BaseAnalysisFormModel._setSchema}
   */
  _setSchema: function () {
    var schema = {
      source: this._primarySourceSchemaItem(),
      buffer: {
        type: 'Number',
        title: _t('editor.layers.analysis-form.buffer-area'),
        validators: ['required', {
          type: 'interval',
          min: 0,
          max: 1,
          step: 0.1
        }]
      }
    };

    BaseAnalysisFormModel.prototype._setSchema.call(this, schema);
  }
});
