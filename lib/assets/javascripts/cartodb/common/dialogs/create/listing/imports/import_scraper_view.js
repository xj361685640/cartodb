var cdb = require('cartodb.js');
cdb.admin = require('cdb.admin');
var ImportDefault2View = require('./import_default2_view');
var Upload2Model = require('../../../../background_polling/models/upload_model');
var FormView = require('./scraper_import/scraper_form_view');
var SelectedDataset = require('./import_selected_dataset_view');

/**
 *  Import data panel
 *
 *  - It accepts an url
 *  - It checks if it is valid
 *
 */

module.exports = ImportDefault2View.extend({

  options: {
    fileExtensions: [],
    type: 'url',
    service: '',
    acceptSync: false,
    fileEnabled: false,
    formTemplate: '',
    headerTemplate: '',
    fileAttrs: {}
  },

  className: 'ScraperPanel ImportScraperPanel',

  initialize: function() {
    this.user = this.options.user;
    this.model = new Upload2Model({
      type: this.options.type,
      service_name: this.options.service
    }, {
      user: this.user
    });

    this.template = cdb.templates.getTemplate('common/views/create/listing/import_types/scraper_data');

    this._initBinds();
  },

  render: function() {
    this.clearSubViews();
    this.$el.html(this.template());
    this._initViews();
    return this;
  },

  _initViews: function() {
    // Dataset selected
    var selected = new SelectedDataset({
      el: this.$('.DatasetSelected'),
      user: this.user,
      model: this.model,
      acceptSync: this.options.acceptSync,
      fileAttrs: this.options.fileAttrs
    });
    selected.render();
    this.addView(selected);

    // Data Form
    var formView = new FormView({
      el: this.$('.ScraperPanel-form'),
      user: this.user,
      model: this.model,
      template: this.options.formTemplate,
      fileEnabled: this.options.fileEnabled
    });

    formView.bind('fileSelected', function() {
      selected.setOptions({
        acceptSync: false,
        fileAttrs: {
          ext: true,
          title: 'name',
          description: {
            content: [{
              name: 'size',
              format: 'size'
            }]
          }
        }
      });
    });

    formView.bind('urlSelected', function() {
      selected.setOptions({
        acceptSync: true,
        fileAttrs: {
          ext: false,
          title: '',
          description: ''
        }
      });
    });
    formView.render();
    this.addView(formView);

  },

  _initBinds: function() {
    this.model.bind('change:state', this._checkState, this);
    this.model.bind('change', this._triggerChange, this);
  },

  _checkState: function() {
    if (this.model.previous('state') === "selected") {
      this.model.set({
        type: 'url',
        value: '',
        service_name: '',
        service_item_id: '',
        interval: 0
      });
    }
  }

})

