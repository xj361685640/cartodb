Sequel.migration do
  up do
    Rails::Sequel::connection.run 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'

    create_table :embeddings do
      Uuid :id, primary_key: true, null: false, unique: true, default: 'uuid_generate_v4()'.lit
      Uuid :visualization_id, null: false
      Integer :count
      String :url
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime :updated_at, default: Sequel::CURRENT_TIMESTAMP
    end
  end

  down do
    drop_table :embeddings
  end
end
