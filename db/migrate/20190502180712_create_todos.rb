class CreateTodos < ActiveRecord::Migration[5.2]
  def change
    create_table :todos do |t|
      t.string :text, null: false
      t.boolean :completed, default: false
    end
  end
end
