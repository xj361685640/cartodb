
module.exports = cdb.core.View.extend({
  className: 'TwitterCategoryColorPicker',

  initialize: function() {
    this.colorPicker = new cdb.forms.Color(this.options);
  },

  render: function() {
    this.$el.html(this.colorPicker.render().el);

    return this;
  }
});

