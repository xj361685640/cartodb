class DummyController < ApplicationController

  def dummy_authentication
    subdomain = CartoDB.extract_subdomain(request)
    authenticate!(:saml_header, {}, :scope => subdomain) unless authenticated?(subdomain)
    #redirect_to CartoDB.url(self, 'dashboard', {trailing_slash: true}, current_user)
    redirect_to CartoDB.path(self, 'dashboard', {trailing_slash: true})
  end

end
