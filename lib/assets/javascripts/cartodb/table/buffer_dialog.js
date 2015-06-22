/**
 *  Buffer Dialog
 *
 *  new cdb.admin.BufferDialog({
 *    vis: visualization_model
 *  })
 *
 */

cdb.admin.BufferDialog = cdb.admin.BaseDialog.extend({

  events: {
    'click .ok':      '_ok',
    'click .cancel':  '_cancel',
    'click .close':   '_cancel'
  },

  _TEXTS: {
    title:       _t('Buffer'),
    description: _t("Create a buffer of a specified distance around your geometries"),
    ok:          _t('Run Buffer')
  },

  initialize: function() {

    //_.bindAll(this, "_onImageCallback");

    // Extend options
    _.extend(this.options, {
      disabled: false,
      title: this._TEXTS.title,
      description: this._TEXTS.description,
      width: 355,
      error_width: 511,
      clean_on_hide: true,
      capture_width: this.options.width,
      capture_height: this.options.height,
      attribution: this.options.attribution,
      template_name: 'table/views/buffer_dialog',
      ok_title: this._TEXTS.ok,
      ok_button_classes: 'button grey',
      error_close_title: "Close",
      ok_button_classes: 'button grey',
      modal_class: 'static_image_dialog'
    });

    this.constructor.__super__.initialize.apply(this);
  },

  render: function() {

    this.$el.append(this.template_base( _.extend( this.options )));

    this.$(".modal").css({ width: this.options.width });
    this.$(".modal.warning").css({ width: this.options.error_width });

    if (this.options.modal_class) {
      this.$el.addClass(this.options.modal_class);
    }

    return this;
  },

  _keydown: function(e) {
    if (e.keyCode === 27) this._cancel();
  },

  _ok: function(e) {
    e.preventDefault();

    var o = {};
    o.distance = $("#distance").val();
    o.dissolve = $("#dissolve").prop('checked');
    o.tableName = $('.layer_panel.active .info .name').html();

    console.log(o)
    
    // TODO get column names so you can include them in the result set... 
    // for now it will not retain columns
    // $.getJSON('https://chriswhong.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20testpoints%20LIMIT%201&api_key=995e03a979957cc2cc0b2fced0aa735516cfcd0d',function(res) {
    //   console.log(res);
    // });
  
    var bufferTemplate = "SELECT\n ST_BUFFER(\n the_geom::geography,\n {{distance}}\n)as the_geom,\n ST_TRANSFORM(\n ST_BUFFER(\n  the_geom::geography,\n  {{distance}}\n )::geometry,\n 3857\n) as the_geom_webmercator\nFROM {{tableName}};";

    var bufferDissolveTemplate = "SELECT\r\nST_Union(\r\n  ST_Buffer(\r\n    the_geom::geography,\r\n    {{distance}}\r\n  )::geometry\r\n) as the_geom,\r\nST_Transform(\r\n  ST_Union(\r\n    ST_Buffer(\r\n      the_geom::geography,\r\n      {{distance}}\r\n    )::geometry \r\n  ),\r\n  3857\r\n) as the_geom_webmercator\r\nFROM {{tableName}}";

    var template;
    o.dissolve ? template = bufferDissolveTemplate : template = bufferTemplate;

    var SQL = Mustache.render(template,o);
    console.log(SQL);

    this._apply(SQL);
   
    this._cancel();

  },

  _apply: function(SQL){
    var editor = $('.CodeMirror')[0].CodeMirror;
    editor.setValue(SQL);
    var apply = $('.layer_panel.active').find('.sql_panel').find('.apply');
    //if panel is open and SQL is selected, just click the apply
    if($('.table_panel.opened').hasClass('opened') &&
      $('.sql_mod').hasClass('selected')) {
      apply.click();
    } else {
      //otherwise, click the sql tab button and click apply
      $('.layer_panel.active').find('.sql_mod').click();
      apply.click();
    }
  },

  _isHTTPS: function() {
    return location.protocol.indexOf("https") === 0;
  },

  _onImageCallback: function(error, url) {

    this.$el.removeClass("is-loading");

    this.$el.find(".ok.button").removeClass("disabled");

    this.options.disabled = false;

    if (error && error.errors) {
      this._showError(error.errors[0]);
    } else {
      window.open(url, '_blank');
    }

  },

  _showError: function(message) {

    this.$el.find(".js-error-message").html(message);

    this.$("section.modal:eq(0)")
    .animate({
      top:0,
      opacity: 0
    }, 300, function() {
      $(this).slideUp(300);
    });

    this.$(".modal.confirmation")
    .css({
      top: '50%',
      marginTop: this.$(".modal.confirmation").height() / 2,
      display: 'block',
      opacity: 0
    })
    .delay(200)
    .animate({
      marginTop: -( this.$(".modal.confirmation").height() / 2 ),
      opacity: 1
    }, 300);
  },

  clean: function() {
    cdb.admin.BaseDialog.prototype.clean.call(this);
  }

});
