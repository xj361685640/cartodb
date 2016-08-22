<ul class="Pagination-list CDB-Text CDB-Size-medium">
  <li class="Pagination-listItem">
      <a href="<%- m.urlTo(currentPage-1) %>" data-page="<%- currentPage-1 %>" class="Pagination-listItemInner js-listItem">
        <svg width="6px" height="11px" viewBox="448 352 6 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <path d="M450.519764,356.185701 L454.110507,359.776445 C454.306007,359.971945 454.619575,359.96893 454.814837,359.773668 C455.004389,359.584116 455.011343,359.263066 454.817614,359.069338 L450.852262,355.103986 C450.656762,354.908486 450.343195,354.911501 450.147932,355.106763 C450.109594,355.145101 450.078725,355.188819 450.055476,355.235775 L446.183534,359.107717 C445.989806,359.301445 445.99676,359.622495 446.186311,359.812046 C446.381573,360.007309 446.695141,360.010324 446.890641,359.814823 L450.519764,356.185701 Z" stroke="none" fill-rule="evenodd" class="Pagination-arrow  <% if (currentPage > 1) { %>is-active<% } %>" transform="translate(450.500574, 357.459405) scale(-1, 1) rotate(90.000000) translate(-450.500574, -357.459405) "></path>
        </svg>
      </a>
  </li>
  <% m.pagesToDisplay().forEach(function(page) { %>
    <% if (page > 0) { %>
      <li class="Pagination-listItem <%- m.isCurrentPage(page) ? 'is-current CDB-Text is-semibold' : '' %>">
        <a class="Pagination-listItemInner Pagination-listItemInner--link js-listItem" href="<%- m.urlTo(page) %>" data-page="<%- page %>"><%- page %></a>
      </li>
    <% } else { %>
      <li class="Pagination-listItem Pagination-listItem">
        <span class="Pagination-listItemInner Pagination-listItemInner--more">&hellip;</span>
      </li>
    <% } %>
  <% }) %>
  <li class="Pagination-listItem">
    <a href="<%- m.urlTo(currentPage + 1) %>" data-page="<%- currentPage + 1 %>" class="Pagination-listItemInner js-listItem">
      <svg width="6px" height="11px" viewBox="448 334 6 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <path d="M450.519764,338.185701 L454.110507,341.776445 C454.306007,341.971945 454.619575,341.96893 454.814837,341.773668 C455.004389,341.584116 455.011343,341.263066 454.817614,341.069338 L450.852262,337.103986 C450.656762,336.908486 450.343195,336.911501 450.147932,337.106763 C450.109594,337.145101 450.078725,337.188819 450.055476,337.235775 L446.183534,341.107717 C445.989806,341.301445 445.99676,341.622495 446.186311,341.812046 C446.381573,342.007309 446.695141,342.010324 446.890641,341.814823 L450.519764,338.185701 Z" stroke="none" class="Pagination-arrow  <% if (currentPage != pagesCount) { %>is-active<% } %>"fill-rule="evenodd" transform="translate(450.500574, 339.459405) scale(-1, 1) rotate(-90.000000) translate(-450.500574, -339.459405) "></path>
      </svg>
    </a>
  </li>
</ul>
