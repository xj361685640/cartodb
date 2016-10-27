module TestProfiler
  module DB
    class LoggedRepository < DataRepository::Backend::Sequel
      def _model_name
        relation[0..-2].capitalize
      end

      def insert(data = {})
        TestProfiler::DB.insert(_model_name, data[:id])
        super(data)
      end

      def update(data = {})
        TestProfiler::DB.update(_model_name, data[:id])
        super(data)
      end

      def delete(key)
        TestProfiler::DB.delete(_model_name, key)
        super(key)
      end
    end

    module SequelLogger
      def _model_name
        self.class.name.demodulize
      end

      def after_create
        TestProfiler::DB.insert(_model_name, id)
        super
      end

      def after_update
        TestProfiler::DB.update(_model_name, id)
        super
      end

      def after_destroy
        TestProfiler::DB.delete(_model_name, id)
        super
      end
    end

    module ARLogger
      def self.hook_profiler
        ActiveRecord::Base.after_create { TestProfiler::DB.insert(self.class.name.demodulize, id) }
        ActiveRecord::Base.after_update { TestProfiler::DB.update(self.class.name.demodulize, id) }
        ActiveRecord::Base.after_destroy { TestProfiler::DB.delete(self.class.name.demodulize, id) }
      end
    end

    @operations = Hash.new
    def self.log(model, operation, id)
      @operations[model] ||= Hash.new { Array.new }
      @operations[model][operation] += [id]
    end

    def self.insert(model, id)
      log(model, :insert, id)
    end

    def self.update(model, id)
      log(model, :update, id)
    end

    def self.delete(model, id)
      log(model, :delete, id)
    end

    def self.operations
      @operations.map { |model, ops|
        [
          model,
          ops.map { |op, ids| [op, ids.uniq.count] }.to_h
        ]
      }.to_h
    end

    def self.initialize_profiler
      CartoDB::Visualization.repository   = LoggedRepository.new(Rails::Sequel.connection, :visualizations)
      CartoDB::Synchronization.repository = LoggedRepository.new(Rails::Sequel.connection, :synchronizations)
      Sequel::Model.descendants.each { |m| m.include SequelLogger }
      ARLogger.hook_profiler
    end
  end
end
