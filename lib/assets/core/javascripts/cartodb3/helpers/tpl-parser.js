const path = require('path');
var _ = require('lodash');


module.exports = {
  process (src, filename, config, options) {
    var template = _.template(src, null);
    return 'var _ = require(\'underscore\');\nmodule.exports = ' + template;
  }
};
