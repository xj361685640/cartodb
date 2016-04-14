Sequel.migration do
  up do
    alter_table(:users) do
      add_column :mapzen_geocoder_api_key, :text
      add_column :mapzen_routing_api_key, :text
    end
    alter_table(:organizations) do
      add_column :mapzen_geocoder_api_key, :text
      add_column :mapzen_routing_api_key, :text
    end
  end

  down do
    alter_table(:users) do
      drop_column :mapzen_geocoder_api_key
      drop_column :mapzen_routing_api_key
    end
    alter_table(:organizations) do
      drop_column :mapzen_geocoder_api_key
      drop_column :mapzen_routing_api_key
    end
  end
end
