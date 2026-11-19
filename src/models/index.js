const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig);

const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);

// Relacionamento 1:N (Uma Categoria tem vários Produtos)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
};
