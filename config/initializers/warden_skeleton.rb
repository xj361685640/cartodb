# This sample strategy shows how can you get request headers and parameters. It will automatically log in based on subdomain. Example: http://myuser.localhost.lan:3000/dashboard/maps will login "myuser" user and display dashboard map page.
# This is automatically available because of initializer directory. You can invoke it at ApplicationController so every request uses it:
#
#  before_filter :dummy_authentication
#
#  def dummy_authentication
#    subdomain = CartoDB.extract_subdomain(request)
#    authenticate!(:dummy, {}, :scope => subdomain) unless authenticated?(subdomain)
#  end


Warden::Strategies.add(:dummy) do

  def valid?
    true
  end

  def store?
    true
  end

  def authenticate!
    raise "Headers not available" if request.headers.nil?
    raise "Params not available" if params.nil?
    username_from_subdomain = request.host.split('.')[0]
    user = User.where(username: username_from_subdomain).first
    success!(user)
  end

end
