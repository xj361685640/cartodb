<div class="Modal">
  <div class="Modal-header">
    <div class="Modal-headerContainer">
      <h2 class="CDB-Text CDB-Size-huge is-light u-bSpace"><%- _t('components.modals.add-asset.modal-title') %></h2>
      <form accept-charset="UTF-8" enctype="multipart/form-data" method="post">
        <h3 class="CDB-Text CDB-Size-medium u-altTextColor"><button class="js-upload"><%- _t('components.modals.add-asset.upload-image') %></button> <%- _t('components.modals.add-asset.modal-desc') %></h3>
        <input type="file" value="Choose icon" accept="image/jpeg,image/jpg,image/gif,image/png,image/svg+xml" id="iconfile" class="js-uploadInput" tabindex="-1" multiple>
      </form>
    </div>
  </div>

  <div class="Modal-container">
    <div class="Tab-pane">
      <div class="Modal-navigation">
        <ul class="Modal-navigationInner CDB-Text is-semibold CDB-Size-medium js-menu">
          <li class="CDB-NavMenu-item is-selected">
            <button class="CDB-NavMenu-link u-upperCase"><%- _t('components.modals.add-asset.your-uploads') %></button>
          </li>
        </ul>
      </div>
      <div class="Modal-inner Modal-inner--with-navigation js-body"></div>
    </div>
  </div>

  <div class="Modal-footer">
    <div class="Modal-footerContainer u-flex u-justifyEnd">
      <button class="CDB-Button CDB-Button--primary is-disabled js-add">
        <span class="CDB-Button-Text CDB-Text is-semibold CDB-Size-medium u-upperCase"><%- _t('components.modals.add-asset.set-image') %></span>
      </button>
    </div>
  </div>
</div>
