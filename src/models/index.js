const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig);

const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const ProductImage = require('./ProductImage')(sequelize);
const ProductOption = require('./ProductOption')(sequelize);

// Relacionamento N:N (Produtos <-> Categorias)
Product.belongsToMany(Category, {
  through: 'product_categories',
  foreignKey: 'product_id',
  otherKey: 'category_id',
  as: 'categories',
  timestamps: false,
});

Category.belongsToMany(Product, {
  through: 'product_categories',
  foreignKey: 'category_id',
  otherKey: 'product_id',
  as: 'products',
  timestamps: false,
});

// Relacionamento 1:N (Produto -> Imagens e Opções)
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductOption, { foreignKey: 'product_id', as: 'options', onDelete: 'CASCADE' });
ProductOption.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  ProductOption,
};
