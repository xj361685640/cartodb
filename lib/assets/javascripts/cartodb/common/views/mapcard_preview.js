/**
 *  MapCard previews
 *
 */
module.exports = cdb.core.View.extend({

  default_options: {
    width: 300,
    height: 170,
    format: "png"
  },

  initialize: function() {
    _.bindAll(this, "_onError", "_onSuccess");

    _.defaults(this.options, this.default_options);

    this.width   = this.options.width;
    this.height  = this.options.height;
    this.format  = this.options.format;
    this.id      = this.options.id;
    this.$el     = this.options.el;
    this.user    = this.options.user;
  },

  load: function() {
    this._startLoader();

    var url = this._generatePreviewURL();
    this._loadImage(url);

    return this;
  },

  _generatePreviewURL: function() {
    var base_url = cdb.config.get("maps_api_template").replace("{user}", this.user.get("username"));
    var tpl = "tpl_" + this.id.replace(/-/g, "_");
    return base_url + "/api/v1/map/static/named/" + tpl + "/" + this.width + "/" +  this.height + "." + this.format;
  },

  _startLoader: function() {
    this.$el.addClass("is-loading");
  },

  _stopLoader: function() {
    this.$el.removeClass("is-loading");
  },

  loadURL: function(url) {
    var $img = $('<img class="MapCard-preview" src="' + url + '" />');
    this.$el.append($img);
    $img.fadeIn(250);
  },

  showError: function() {
    this._onError();
  },

  _onSuccess: function(url) {
    this._stopLoader();

    this.loadURL(url);

    this.trigger("loaded", url);

  },

  _onError: function(error) {
    this._stopLoader();
    this.$el.addClass("has-error");
    var $error = $('<div class="MapCard-error" />');
    this.$el.append($error);
    $error.fadeIn(250);

    this.trigger("error");
  },

  _loadImage: function(url) {
    var self = this;
    var img  = new Image();

    img.onerror = function() {
      self._onError();
    };

    img.onload = function() {
      self._onSuccess(url);
    };

    try {
      img.src = url;
    }
    catch(err) {
      this._onError(err);
    }
  }
});
