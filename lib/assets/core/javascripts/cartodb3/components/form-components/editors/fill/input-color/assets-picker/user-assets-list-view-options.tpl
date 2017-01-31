<ul>
  <li class="CDB-NavSubmenu-item">
    <h2 class="CDB-Text CDB-Size-medium u-altTextColor"><%- title %></h2>
  </li>
  <% if (editable && assetsCount > 0) { %>
    <% if (allSelected) { %>
      <li class="CDB-NavSubmenu-item">
        <button class="CDB-Text CDB-Size-medium js-deselect-all">Deselect all</button>
      </li>
      <% } else if (selectedCount > 0) { %>
      <li class="CDB-NavSubmenu-item">
        <button class="CDB-Text CDB-Size-medium js-select-all">Select all</button>
      </li>
    <% } %>

    <% if (selectedCount > 0) { %>
      <li class="CDB-NavSubmenu-item">
        <button class="CDB-Text CDB-Size-medium js-remove">
          <% if (selectedCount > 1) { %>
          Delete all
          <% } else { %>
          Delete
          <% } %>
        </button>
      </li>
    <% } %>
  <% } %>
</ul>
