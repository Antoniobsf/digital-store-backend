const { Op } = require('sequelize');
const { Product, Category } = require('../models');

module.exports = {
  // GET /v1/product/search
  async search(req, res, next) {
    try {
      const { limit = 12, page = 1, match, category_id } = req.query;
      const where = {};

      if (match) {
        where.name = { [Op.like]: `%${match}%` };
      }

      if (category_id) {
        where.category_id = Number(category_id);
      }

      const parsedLimit = Number(limit);
      const parsedPage = Number(page);
      const options = {
        where,
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      };

      if (parsedLimit !== -1) {
        options.limit = parsedLimit;
        options.offset = (parsedPage - 1) * parsedLimit;
      }

      const { count, rows } = await Product.findAndCountAll(options);

      return res.status(200).json({
        data: rows,
        total: count,
        limit: parsedLimit,
        page: parsedPage,
      });
    } catch (error) {
      return next(error);
    }
  },

  // GET /v1/product/:id
  async getById(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      return res.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  },

  // POST /v1/product
  async create(req, res, next) {
    try {
      const { enabled, name, slug, stock, description, price, price_with_discount, category_id } = req.body;

      if (!name || !slug || price === undefined || price_with_discount === undefined) {
        return res.status(400).json({ error: 'Campos name, slug, price e price_with_discount são obrigatórios.' });
      }

      const product = await Product.create({
        enabled,
        name,
        slug,
        stock,
        description,
        price,
        price_with_discount,
        category_id,
      });

      return res.status(201).json(product);
    } catch (error) {
      return next(error);
    }
  },

  // PUT /v1/product/:id
  async update(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      await product.update(req.body);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },

  // DELETE /v1/product/:id
  async remove(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      await product.destroy();
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
};
