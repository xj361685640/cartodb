cdb.admin.VectorProcessingDropdownItem = cdb.core.View.extend({

  tagName: "li",

  events: {
    "click a": "_onClick"
  },

  initialize: function() {

    this.template   = this.getTemplate(this.options.template_name);
    this.collection = this.options.collection;

    this.model = new cdb.core.Model(); 
    this.model.on("change:active", this._onChangeActive, this);

    this.model.set("active", this.options.active);

  },

  _onClick: function(e) {

    e.preventDefault();
    e.stopPropagation();

    this.trigger("click", this)

  },

  _onChangeActive: function() {

    if (this.model.get("active")) this.$el.addClass("active");
    else this.$el.removeClass("active");
 
  },

  render: function() {

    this.$el.append(this.template(this.options));

    return this;

  }

});
  
cdb.admin.VectorProcessingDropdown = cdb.ui.common.Dropdown.extend({

  className: 'dropdown widgets_dropdown',

  defaults: {
    speedOut: 100,
    speedIn: 100
  },

  placeholders: {
    public_default_image: "overlay_placeholder_cartofante.png",
    default_image: "overlay_placeholder.png"
  },

  events: {
    "click" : "killEvent"
  },

  initialize: function() {

    _.bindAll(this, "open", "hide", "_handleClick", "_onKeyDown");

    // Extend options
    _.defaults(this.options, this.defaults);

    // Dropdown template
    this.template_base = cdb.templates.getTemplate(this.options.template_base);

    this.vis     = this.options.vis;
    this.canvas  = this.options.canvas;
    this.mapView = this.options.mapView;

    // Bind to target
    $(this.options.target).bind({ "click": this._handleClick});

    // Bind ESC key
    $(document).bind('keydown', this._onKeyDown);

    // flags
    this.isOpen    = false;
  },


  _isDesktop: function() {

    return this.canvas.get("mode") === "desktop";

  },

  /* Check if the dropdown is visible to hiding with the click on the target */
  _handleClick: function(ev) {
    if (ev) {
      ev.preventDefault();
    }

    // If visible
    if (this.isOpen){
      this.hide();
    } else{
      this.open();
    }
  },

  show: function() {

    var dfd = $.Deferred();
    var self = this;

    //sometimes this dialog is child of a node that is removed
    //for that reason we link again DOM events just in case
    this.delegateEvents();
    this.$el
    .css({
      marginTop: "-10px",
      opacity:0,
      display:"block"
    })
    .animate({
      margin: "0",
      opacity: 1
    }, {
      "duration": this.options.speedIn,
      "complete": function(){
        dfd.resolve();
      }
    });

    this.trigger("onDropdownShown", this.el);

    return dfd.promise();
  },

  open: function(ev, target) {

    cdb.god.trigger("closeDialogs");

    // Target
    var $target = target && $(target) || this.options.target;

    this.options.target = $target;

    this.$el.css({
      top: 40,
      left: 0
    })
    .addClass(
      // Add vertical and horizontal position class
      (this.options.vertical_position === "up" ? "vertical_top" : "vertical_bottom" )
      + " " +
        (this.options.horizontal_position === "right" ? "horizontal_right" : "horizontal_left" )
      + " " +
        // Add tick class
        "border tick_" + this.options.tick
    );

    // Show it
    this.show();
    this._recalcHeight();

    // Dropdown open
    this.isOpen = true;
    
    this.trigger("onOverlayDropdownOpen", this);

  },

  _onKeyDown: function(e) {

    if (e.keyCode === 27) {
      this.hide();
    }

  },


  hide: function(done) {

    if (!this.isOpen) {
      done && done();
      return;
    }

    var self    = this;
    this.isOpen = false;

    this.$el.animate({
      marginTop: self.options.vertical_position === "down" ? "10px" : "-10px",
      opacity: 0
    }, this.options.speedOut, function(){

      // And hide it
      self.$el.hide();

    });

    this.trigger("onDropdownHidden",this.el);
  },

  _recalcHeight: function() {

    var $ul  = this.$el.find("ul.special");

    // Resets heights
    $ul.height("auto");
    $ul.parent().height("auto");

    var special_height  = $ul.height();
    var dropdown_height = $ul.parent().height();

    // Sets heights
    if (special_height < dropdown_height) $ul.css("height", dropdown_height);
    else $ul.parent().height(special_height);

  },

  _addButton: function(title, callback) {

    var button = new cdb.admin.VectorProcessingDropdownItem({

      text: title,
      template_name: "table/views/overlays/add_widget_dropdown_item",

    }).on("click", callback, this);

    this.$el.find("ul").append(button.render().$el);

  },

  _buffer: function() {

    //var tableName = $('.layer_panel.active .info .name').html();
    //TODO get column names so you can include them in the result set... 
    //for now it will not retain columns
    // $.getJSON('https://chriswhong.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20testpoints%20LIMIT%201&api_key=995e03a979957cc2cc0b2fced0aa735516cfcd0d',function(res) {
    //   console.log(res);
    // });

    // var SQL = 'SELECT ST_BUFFER(the_geom::geography,400) as the_geom, ST_TRANSFORM(ST_BUFFER(the_geom::geography,400)::geometry,3857) as the_geom_webmercator FROM ' + tableName;
    
    // this._apply(SQL);

    var dialog = new cdb.admin.BufferDialog();

    dialog.appendToBody();
    dialog.open({ center: true });
  },


  _convexHull: function() {

    var tableName = $('.layer_panel.active .info .name').html();

    var SQL = 'SELECT ST_ConvexHull(ST_Collect(the_geom)) As the_geom,ST_TRANSFORM(ST_ConvexHull(ST_Collect(the_geom)),3857) As the_geom_webmercator, 1 as id FROM ' + tableName + ' GROUP BY id';

    this._apply(SQL);
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

  /*
   * Renders the dropdown
   */
  render: function() {

    this.clearSubViews();

    this.$el.html(this.template_base(this.options));

    this._addButton("Buffer", this._buffer);
    this._addButton("Convex Hull",  this._convexHull);

    return this;
  }

});
