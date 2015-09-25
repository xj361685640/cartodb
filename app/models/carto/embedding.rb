# encoding: UTF-8

require 'active_record'

module Carto
  class Embedding < ActiveRecord::Base
    belongs_to :visualization
  end
end
