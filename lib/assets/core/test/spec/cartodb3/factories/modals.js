var ModalsServiceModel = require('../../../../javascripts/cartodb3/components/modals/modals-service-model');

module.exports = {
  createModalService: () => {
    return new ModalsServiceModel();
  }
};
