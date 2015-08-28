# This sample strategy shows how can you get request headers and parameters, and login the user from a trusted header (method to be completed).
# Here's a sample usage from a controller method (also works foor subdomainless, extract_subdomain takes care of it):
#
#  def login_with_saml
#    subdomain = CartoDB.extract_subdomain(request)
#    authenticate!(:saml_header, :scope => subdomain) unless authenticated?(subdomain)
#    redirect_to CartoDB.path(self, 'dashboard', {trailing_slash: true})
#  end


Warden::Strategies.add(:saml_header) do

  def valid?
    true
  end

  def store?
    true
  end

  def authenticate!
    user = User.where(username: username_from_saml).first
    user ? success!(user) : fail!
  end

  def username_from_saml
    // TODO: extract the username from request.headers or params
  end

end
