const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    use_in_menu: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'categories',
  });

  return Category;
};
