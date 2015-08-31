class DummyController < ApplicationController

  def dummy_authentication
    scope = SamlAuthenticator.username_from_saml
    user = authenticate!(:saml_header, {}, :scope => scope) unless authenticated?(scope)
    redirect_to CartoDB.url(self, 'dashboard', {trailing_slash: true}, user)
  end

end
