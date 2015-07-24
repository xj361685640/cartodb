class ScraperController < ApplicationController

  ssl_required :load

  def load
    page = Carto::Http::Client.get('scraper').get(params[:page])
    render text: page.body
  end

end
