var _ = require('underscore');
var BaseAnalysisFormModel = require('./base-analysis-form-model');
var template = require('./convex-hull.tpl');
var ColumnOptions = require('../column-options');

/**
 *  Form model for convex hull analysis
 */
module.exports = BaseAnalysisFormModel.extend({

  initialize: function () {
    BaseAnalysisFormModel.prototype.initialize.apply(this, arguments);

    this._columnOptions = new ColumnOptions({}, {
      configModel: this._configModel,
      nodeDefModel: this._layerDefinitionModel.findAnalysisDefinitionNodeModel(this.get('source'))
    });

    this.listenTo(this._columnOptions, 'columnsFetched', this._setSchema);
    this._setSchema();
  },

  _formatAttrs: function (formAttrs) {
    return BaseAnalysisFormModel.prototype._formatAttrs.call(this, _.pick(formAttrs, ['id', 'source', 'category_column']));
  },

  getTemplate: function () {
    return template;
  },

  getTemplateData: function () {
    return {};
  },

  _setSchema: function () {
    BaseAnalysisFormModel.prototype._setSchema.call(this, {
      source: this._primarySourceSchemaItem(),
      category_column: {
        type: 'Select',
        title: _t('editor.layers.analysis-form.column'),
        options: this._columnOptions.all()
      }
    });
  }
});
