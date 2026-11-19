const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false },
    price_with_discount: { type: DataTypes.FLOAT, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'products',
  });

  return Product;
};
