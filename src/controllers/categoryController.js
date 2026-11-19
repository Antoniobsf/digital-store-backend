const { Category } = require('../models');

module.exports = {
  // GET /v1/category/search
  async search(req, res, next) {
    try {
      const { limit = 12, page = 1, use_in_menu } = req.query;
      const where = {};

      if (use_in_menu !== undefined) {
        where.use_in_menu = use_in_menu === 'true';
      }

      const parsedLimit = Number(limit);
      const parsedPage = Number(page);
      const options = { where };

      if (parsedLimit !== -1) {
        options.limit = parsedLimit;
        options.offset = (parsedPage - 1) * parsedLimit;
      }

      const { count, rows } = await Category.findAndCountAll(options);

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

  // GET /v1/category/:id
  async getById(req, res, next) {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      return res.status(200).json(category);
    } catch (error) {
      return next(error);
    }
  },

  // POST /v1/category
  async create(req, res, next) {
    try {
      const { name, slug, use_in_menu } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'Campos name e slug são obrigatórios.' });
      }

      const category = await Category.create({ name, slug, use_in_menu });
      return res.status(201).json(category);
    } catch (error) {
      return next(error);
    }
  },

  // PUT /v1/category/:id
  async update(req, res, next) {
    try {
      const { name, slug, use_in_menu } = req.body;
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      await category.update({
        name: name ?? category.name,
        slug: slug ?? category.slug,
        use_in_menu: use_in_menu ?? category.use_in_menu,
      });

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },

  // DELETE /v1/category/:id
  async remove(req, res, next) {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }

      await category.destroy();
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
};
